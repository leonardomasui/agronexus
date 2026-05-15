"use client";

import { useEffect, useState } from "react";
import Header from "@/components/Header";
import WeatherChart from "@/components/WeatherChart";
import { 
  CloudRain, Sun, Thermometer, Wind, Loader2, 
  SunMedium, CloudLightning, Droplets, Zap, 
  AlertTriangle, CheckCircle2, Info, Calendar,
  ArrowRight
} from "lucide-react";
import { PrevisaoResponse } from "@agronexus/shared/types";

type Periodo = 'semana' | 'quinzena' | 'mes' | 'semestre' | 'ano';

interface Impacto {
  id: string;
  tipo: 'cultura' | 'animal';
  target: string;
  nivel: 'favoravel' | 'atencao' | 'critico';
  titulo: string;
  recomendacao: string;
}

export default function ClimaPage() {
  const [data, setData] = useState<PrevisaoResponse & { impactos: Impacto[], last_updated: string, fonte: string, periodo: string } | null>(null);
  const [loading, setLoading] = useState(true);
  const [periodo, setPeriodo] = useState<Periodo>('semana');
  const [cityName, setCityName] = useState("Piracicaba");
  const [uf, setUf] = useState("SP");

  const fetchWeather = async (p: Periodo) => {
    setLoading(true);
    try {
      const localUser = localStorage.getItem("agronexus_user");
      let lat = -22.725, lon = -47.647, name = "Piracicaba", state = "SP";

      if (localUser) {
        const user = JSON.parse(localUser);
        if (user.municipio?.lat) {
          lat = user.municipio.lat; lon = user.municipio.lon;
          name = user.municipio.nome; state = user.municipio.uf;
        }
      }
      setCityName(name); setUf(state);

      const baseUrl = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:3001";
      
      // Tentar carregar do cache local primeiro (Offline Support)
      const cacheKey = `agro_weather_v2_${lat}_${lon}_${p}`;
      const cached = localStorage.getItem(cacheKey);
      if (cached) {
        const parsed = JSON.parse(cached);
        const age = Date.now() - parsed.timestamp;
        if (age < 24 * 60 * 60 * 1000) { // 24h cache
          setData(parsed.data);
          setLoading(false);
        }
      }

      const res = await fetch(`${baseUrl}/api/clima/previsao?lat=${lat}&lon=${lon}&periodo=${p}`);
      if (res.ok) {
        const json = await res.json();
        setData(json);
        // Salvar no cache
        localStorage.setItem(cacheKey, JSON.stringify({ data: json, timestamp: Date.now() }));
      }
    } catch (err) {
      console.error("Erro ao buscar clima:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const baseUrl = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:3001";
    // Bust server-side cache na primeira montagem para garantir dados com UV
    if (!sessionStorage.getItem("agro_weather_cache_cleared")) {
      fetch(`${baseUrl}/api/clima/cache/clear`, { method: "POST" }).then(() => {
        sessionStorage.setItem("agro_weather_cache_cleared", "1");
      });
    }

    fetchWeather(periodo);

    const handleUpdate = () => fetchWeather(periodo);
    window.addEventListener("agronexus_settings_updated", handleUpdate);
    return () => window.removeEventListener("agronexus_settings_updated", handleUpdate);
  }, [periodo]);

  const getIcon = (precip: number, prob: number) => {
    if (precip > 10 || prob > 70) return <CloudLightning className="text-agro-blue" size={24} />;
    if (precip > 0 || prob > 30) return <CloudRain className="text-blue-400" size={24} />;
    return <Sun className="text-yellow-500" size={24} />;
  };

  const getUvStyle = (uv: number) => {
    if (uv >= 11) return { bg: 'bg-purple-100', text: 'text-purple-700', label: 'Extremo' };
    if (uv >= 8)  return { bg: 'bg-red-100',    text: 'text-red-700',    label: 'Muito Alto' };
    if (uv >= 6)  return { bg: 'bg-orange-100', text: 'text-orange-700', label: 'Alto' };
    if (uv >= 3)  return { bg: 'bg-yellow-100', text: 'text-yellow-700', label: 'Moderado' };
    return              { bg: 'bg-green-100',  text: 'text-green-700',  label: 'Baixo' };
  };

  const getNivelStyles = (nivel: string) => {
    switch (nivel) {
      case 'critico': return { bg: 'bg-red-50', border: 'border-red-200', text: 'text-red-700', icon: <AlertTriangle className="text-red-500" size={20} /> };
      case 'atencao': return { bg: 'bg-orange-50', border: 'border-orange-200', text: 'text-orange-700', icon: <Info className="text-orange-500" size={20} /> };
      case 'favoravel': return { bg: 'bg-green-50', border: 'border-green-200', text: 'text-green-700', icon: <CheckCircle2 className="text-green-500" size={20} /> };
      default: return { bg: 'bg-gray-50', border: 'border-gray-200', text: 'text-gray-700', icon: <Info className="text-gray-500" size={20} /> };
    }
  };

  return (
    <div className="min-h-screen bg-agro-light">
      <Header />
      
      <div className="px-6 py-6 space-y-6">
        <div className="flex flex-col gap-4">
          <div>
            <h2 className="text-xl font-bold text-agro-black tracking-tight">Clima e Impactos</h2>
            <p className="text-xs text-gray-500 font-medium uppercase tracking-wider">{cityName}, {uf}</p>
          </div>

          {/* Period Selector Chips */}
          <div className="flex gap-2 overflow-x-auto pb-2 no-scrollbar">
            {(['semana', 'quinzena', 'mes', 'semestre', 'ano'] as Periodo[]).map((p) => (
              <button
                key={p}
                onClick={() => setPeriodo(p)}
                className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-tighter border transition-all ${
                  periodo === p 
                    ? 'bg-agro-blue text-white border-agro-blue shadow-lg shadow-blue-200' 
                    : 'bg-white text-gray-400 border-agro-gray'
                }`}
              >
                {p}
              </button>
            ))}
          </div>
        </div>

        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 text-agro-blue">
            <Loader2 className="animate-spin mb-3" size={40} />
            <p className="text-sm font-bold animate-pulse">Sincronizando com satélites...</p>
          </div>
        ) : !data ? (
          <div className="bg-white p-8 rounded-3xl text-center border border-agro-gray">
            <p className="text-gray-500">Falha na conexão com o servidor de clima.</p>
          </div>
        ) : (
          <div className="space-y-6">
            
            {/* Weather Visualization */}
            <div className="bg-white rounded-[32px] p-6 shadow-sm border border-agro-gray space-y-6">
              <div className="flex justify-between items-center">
                <h3 className="text-sm font-bold text-agro-black uppercase">Tendência do Período</h3>
                <span className="text-[9px] font-bold text-gray-300">FONTE: {data.fonte}</span>
              </div>

              {/* Show list for small periods, chart for long periods */}
              {['hoje', 'semana'].includes(periodo) ? (
                <div className="space-y-4">
                  {data.dados.map((dia, idx) => {
                    const dataLocal = new Date(dia.data + 'T12:00:00');
                    const isHoje = dia.data === new Date().toISOString().split('T')[0];
                    return (
                      <div key={idx} className={`flex items-center justify-between p-3 rounded-2xl ${isHoje ? 'bg-agro-blue/5 border border-agro-blue/10' : ''}`}>
                        <div className="flex items-center gap-4">
                          <div className="w-10 text-center">
                            <span className="block text-[10px] font-bold text-gray-400 uppercase">{dataLocal.toLocaleDateString('pt-BR', { weekday: 'short' })}</span>
                            <span className="block text-sm font-black text-agro-black">{dataLocal.getDate()}</span>
                          </div>
                          <div className="bg-gray-50 p-2 rounded-xl">
                            {getIcon(dia.precipitacao_mm || 0, dia.prob_chuva_pct || 0)}
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="text-sm font-black text-agro-black">{Math.round(dia.temp_max_c || 0)}°</span>
                              <span className="text-xs text-gray-400 font-bold">{Math.round(dia.temp_min_c || 0)}°</span>
                            </div>
                            <span className="text-[10px] text-blue-500 font-bold">{dia.precipitacao_mm || 0}mm chuva</span>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          {dia.uv_index != null && (() => {
                            const uv = getUvStyle(dia.uv_index);
                            return (
                              <div className={`flex flex-col items-center px-2 py-1 rounded-xl ${uv.bg}`}>
                                <span className={`text-[11px] font-black ${uv.text}`}>UV {Math.round(dia.uv_index)}</span>
                                <span className={`text-[8px] font-bold uppercase ${uv.text} opacity-80`}>{uv.label}</span>
                              </div>
                            );
                          })()}
                          <ArrowRight size={16} className="text-gray-200" />
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="space-y-8">
                  <div>
                    <p className="text-[10px] font-black text-gray-400 uppercase mb-4 text-center">
                      {['semestre', 'ano'].includes(periodo) ? 'Precipitação Total por Mês (mm)' : 'Precipitação Acumulada (mm)'}
                    </p>
                    <WeatherChart dados={data.dados} tipo="chuva" />
                  </div>
                  <div>
                    <p className="text-[10px] font-black text-gray-400 uppercase mb-4 text-center">
                      {['semestre', 'ano'].includes(periodo) ? 'Temperatura Média por Mês (°C)' : 'Oscilação Térmica (°C)'}
                    </p>
                    <WeatherChart dados={data.dados} tipo="temperatura" />
                  </div>
                  <div>
                    <p className="text-[10px] font-black text-gray-400 uppercase mb-4 text-center">
                      {['semestre', 'ano'].includes(periodo) ? 'UV Médio por Mês' : 'Índice UV Máximo'}
                    </p>
                    <div className="flex gap-3 justify-center mb-3 flex-wrap">
                      {[{ label: 'Baixo', bg: 'bg-green-100', text: 'text-green-700' }, { label: 'Moderado', bg: 'bg-yellow-100', text: 'text-yellow-700' }, { label: 'Alto', bg: 'bg-orange-100', text: 'text-orange-700' }, { label: 'Muito Alto', bg: 'bg-red-100', text: 'text-red-700' }, { label: 'Extremo', bg: 'bg-purple-100', text: 'text-purple-700' }].map(({ label, bg, text }) => (
                        <span key={label} className={`px-2 py-0.5 rounded-full text-[9px] font-black uppercase ${bg} ${text}`}>{label}</span>
                      ))}
                    </div>
                    <WeatherChart dados={data.dados} tipo="uv" />
                  </div>
                </div>
              )}
            </div>

            {/* Footer metadata */}
            <div className="text-center pb-10">
              <p className="text-[9px] font-bold text-gray-400 uppercase tracking-widest">
                Última atualização: {new Date(data.last_updated).toLocaleTimeString('pt-BR')}
              </p>
              <p className="text-[9px] text-gray-300 mt-1 uppercase">Cache offline ativo (24h)</p>
            </div>

          </div>
        )}

        <div className="h-20" />
      </div>
    </div>
  );
}
