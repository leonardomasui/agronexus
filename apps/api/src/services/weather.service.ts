import axios from 'axios';

const FORECAST_URL = 'https://api.open-meteo.com/v1/forecast';
const ARCHIVE_URL = 'https://archive-api.open-meteo.com/v1/archive';

export interface DadosClimaticos {
  data: string;
  precipitacao_mm: number | null;
  prob_chuva_pct: number | null;
  uv_index: number | null;
  temp_min_c: number | null;
  temp_max_c: number | null;
  radiacao_solar_wm2: number | null;
  evapotranspiracao_mm: number | null;
  vento_kmh: number | null;
}

export interface PrevisaoResponse {
  latitude: number;
  longitude: number;
  timezone: string;
  current_weather?: {
    temp: number;
    windspeed: number;
    weathercode: number;
    time: string;
  };
  dados: DadosClimaticos[];
  estacao_inmet?: any;
  periodo?: string;
  fonte?: string;
}

const cachePrevisao = new Map<string, { data: PrevisaoResponse; timestamp: number }>();
const CACHE_PREVISAO_TTL = 15 * 60 * 1000;

export function clearWeatherCache() {
  cachePrevisao.clear();
}

function cacheKey(lat: number, lon: number): string {
  // Arredondamos para 2 casas decimais para agrupar fazendas próximas
  return `${lat.toFixed(2)},${lon.toFixed(2)}`;
}

export async function getPrevisao(
  lat: number,
  lon: number,
  days = 7
): Promise<PrevisaoResponse> {
  const key = cacheKey(lat, lon);
  const cached = cachePrevisao.get(key);
  
  // Se tiver cache e ele tiver pelo menos os dias solicitados, aproveitamos
  if (cached && Date.now() - cached.timestamp < CACHE_PREVISAO_TTL) {
    if (cached.data.dados.length >= days) {
      return {
        ...cached.data,
        dados: cached.data.dados.slice(0, days)
      };
    }
  }

  // Sempre buscamos 16 dias (máximo free) para popular o cache global
  const { data } = await axios.get(FORECAST_URL, {
    params: {
      latitude: lat,
      longitude: lon,
      daily: [
        'temperature_2m_max',
        'temperature_2m_min',
        'precipitation_sum',
        'precipitation_probability_max',
        'uv_index_max',
        'et0_fao_evapotranspiration',
        'windspeed_10m_max',
        'shortwave_radiation_sum',
      ].join(','),
      current_weather: true,
      timezone: 'America/Sao_Paulo',
      forecast_days: 16,
    },
  });

  const result: PrevisaoResponse = {
    latitude: data.latitude,
    longitude: data.longitude,
    timezone: data.timezone,
    current_weather: data.current_weather ? {
      temp: data.current_weather.temperature,
      windspeed: data.current_weather.windspeed,
      weathercode: data.current_weather.weathercode,
      time: data.current_weather.time
    } : undefined,
    dados: data.daily.time.map((date: string, i: number) => ({
      data: date,
      precipitacao_mm: data.daily.precipitation_sum[i],
      prob_chuva_pct: data.daily.precipitation_probability_max ? data.daily.precipitation_probability_max[i] : null,
      uv_index: data.daily.uv_index_max ? data.daily.uv_index_max[i] : null,
      temp_min_c: data.daily.temperature_2m_min[i],
      temp_max_c: data.daily.temperature_2m_max[i],
      radiacao_solar_wm2: data.daily.shortwave_radiation_sum[i],
      evapotranspiracao_mm: data.daily.et0_fao_evapotranspiration[i],
      vento_kmh: data.daily.windspeed_10m_max[i],
    })),
  };

  cachePrevisao.set(key, { data: result, timestamp: Date.now() });
  
  return {
    ...result,
    dados: result.dados.slice(0, days),
    fonte: 'Open-Meteo Forecast',
    periodo: days <= 1 ? 'Hoje' : days <= 7 ? 'Semana' : 'Quinzena'
  };
}

export async function getProjecaoLongPrazo(
  lat: number,
  lon: number,
  periodo: 'mes' | 'semestre' | 'ano'
): Promise<PrevisaoResponse & { periodo: string; fonte: string }> {
  const key = `long_${lat.toFixed(2)},${lon.toFixed(2)}_${periodo}`;
  const cached = cachePrevisao.get(key);
  if (cached && Date.now() - cached.timestamp < CACHE_PREVISAO_TTL) {
    return { ...cached.data, periodo, fonte: 'Média Histórica (INMET/Open-Meteo)' } as any;
  }

  const hoje = new Date();
  const start = new Date(hoje);
  const end = new Date(hoje);
  
  if (periodo === 'mes') end.setDate(hoje.getDate() + 30);
  else if (periodo === 'semestre') end.setMonth(hoje.getMonth() + 6);
  else end.setFullYear(hoje.getFullYear() + 1);

  // Para o "futuro" de longo prazo, buscamos os mesmos dias do ano passado (Archive)
  const startLastYear = new Date(start); startLastYear.setFullYear(start.getFullYear() - 1);
  const endLastYear = new Date(end); endLastYear.setFullYear(end.getFullYear() - 1);

  const startStr = startLastYear.toISOString().split('T')[0];
  const endStr = endLastYear.toISOString().split('T')[0];

  const { data } = await axios.get(ARCHIVE_URL, {
    params: {
      latitude: lat,
      longitude: lon,
      start_date: startStr,
      end_date: endStr,
      daily: [
        'temperature_2m_max',
        'temperature_2m_min',
        'precipitation_sum',
        'uv_index_max',
        'et0_fao_evapotranspiration',
        'windspeed_10m_max',
        'shortwave_radiation_sum',
      ].join(','),
      timezone: 'America/Sao_Paulo',
    },
  });

  const result: PrevisaoResponse = {
    latitude: data.latitude,
    longitude: data.longitude,
    timezone: data.timezone,
    dados: data.daily.time.map((date: string, i: number) => {
      // Ajustamos a data para o "futuro" para que o gráfico mostre os dias corretos
      const d = new Date(date);
      d.setFullYear(hoje.getFullYear());
      const solar = data.daily.shortwave_radiation_sum[i] || 0;
      const uvFromArchive = data.daily.uv_index_max?.[i] ?? null;
      // Archive API nem sempre retorna uv_index_max — estimamos via radiação solar (fator 2.0 calibrado para Brasil)
      const uvEstimated = solar > 0 ? parseFloat((Math.min(16, solar * 2.0)).toFixed(1)) : null;
      return {
        data: d.toISOString().split('T')[0],
        precipitacao_mm: data.daily.precipitation_sum[i],
        prob_chuva_pct: null,
        uv_index: uvFromArchive ?? uvEstimated,
        temp_min_c: data.daily.temperature_2m_min[i],
        temp_max_c: data.daily.temperature_2m_max[i],
        radiacao_solar_wm2: solar,
        evapotranspiracao_mm: data.daily.et0_fao_evapotranspiration[i],
        vento_kmh: data.daily.windspeed_10m_max[i],
      };
    }),
  };

  cachePrevisao.set(key, { data: result, timestamp: Date.now() });
  return { ...result, periodo, fonte: 'Média Histórica (Baseada no Ano Anterior)' };
}

export async function getHistorico(
  lat: number,
  lon: number,
  start: string,
  end: string
): Promise<PrevisaoResponse> {
  const key = `${lat.toFixed(2)},${lon.toFixed(2)}_${start}_${end}`;
  const cached = cachePrevisao.get(key);
  if (cached && Date.now() - cached.timestamp < CACHE_PREVISAO_TTL) {
    return cached.data;
  }

  const { data } = await axios.get(ARCHIVE_URL, {
    params: {
      latitude: lat,
      longitude: lon,
      start_date: start,
      end_date: end,
      daily: [
        'temperature_2m_max',
        'temperature_2m_min',
        'precipitation_sum',
        'et0_fao_evapotranspiration',
        'windspeed_10m_max',
        'shortwave_radiation_sum',
      ].join(','),
      timezone: 'America/Sao_Paulo',
    },
  });

  const result: PrevisaoResponse = {
    latitude: data.latitude,
    longitude: data.longitude,
    timezone: data.timezone,
    dados: data.daily.time.map((date: string, i: number) => ({
      data: date,
      precipitacao_mm: data.daily.precipitation_sum[i],
      prob_chuva_pct: null,
      uv_index: null,
      temp_min_c: data.daily.temperature_2m_min[i],
      temp_max_c: data.daily.temperature_2m_max[i],
      radiacao_solar_wm2: data.daily.shortwave_radiation_sum[i],
      evapotranspiracao_mm: data.daily.et0_fao_evapotranspiration[i],
      vento_kmh: data.daily.windspeed_10m_max[i],
    })),
  };

  cachePrevisao.set(key, { data: result, timestamp: Date.now() });
  return result;
}
