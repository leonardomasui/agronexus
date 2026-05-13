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
  dados: DadosClimaticos[];
  estacao_inmet?: string;
}

// Cache de previsões por coordenada — TTL 1h
const cachePrevisao = new Map<string, { data: PrevisaoResponse; timestamp: number }>();
const CACHE_PREVISAO_TTL = 60 * 60 * 1000; // 1 hora

function cacheKey(lat: number, lon: number, extra = ''): string {
  return `${lat.toFixed(2)},${lon.toFixed(2)}${extra}`;
}

export async function getPrevisao(
  lat: number,
  lon: number,
  days = 7
): Promise<PrevisaoResponse> {
  const key = cacheKey(lat, lon, `_${days}d`);
  const cached = cachePrevisao.get(key);
  if (cached && Date.now() - cached.timestamp < CACHE_PREVISAO_TTL) {
    return cached.data;
  }

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
      timezone: 'America/Sao_Paulo',
      forecast_days: days,
    },
  });

  const result: PrevisaoResponse = {
    latitude: data.latitude,
    longitude: data.longitude,
    timezone: data.timezone,
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
  return result;
}

export async function getHistorico(
  lat: number,
  lon: number,
  start: string,
  end: string
): Promise<PrevisaoResponse> {
  const key = cacheKey(lat, lon, `_${start}_${end}`);
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
