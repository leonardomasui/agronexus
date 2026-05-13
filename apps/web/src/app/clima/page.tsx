"use client";

import { useEffect, useState } from "react";
import Header from "@/components/Header";
import { CloudRain, Sun, Thermometer, Wind, Loader2, SunMedium, CloudLightning, Droplets, Zap } from "lucide-react";
import { DadosClimaticos } from "@agronexus/shared/types";

interface WeatherData {
  latitude: number;
  longitude: number;
  timezone: string;
  dados: (DadosClimaticos & { prob_chuva_pct?: number | null, uv_index?: number | null })[];
  estacao_inmet?: { codigo: string; nome: string; uf: string };
}

export default function ClimaPage() {
  const [data, setData] = useState<WeatherData | null>(null);
  const [loading, setLoading] = useState(true);
  const [cityName, setCityName] = useState("Piracicaba");
  const [uf, setUf] = useState("SP");

  useEffect(() => {
    async function fetchWeather() {
      try {
        const localUser = localStorage.getItem("agronexus_user");
        let lat = -22.725;
        let lon = -47.647;
        let name = "Piracicaba";
        let state = "SP";

        if (localUser) {
          const user = JSON.parse(localUser);
          if (user.municipio?.lat && user.municipio?.lon) {
            lat = user.municipio.lat;
            lon = user.municipio.lon;
            name = user.municipio.nome;
            state = user.municipio.uf;
          }
        }
        setCityName(name);
        setUf(state);

        const baseUrl = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:3001";
        // Buscando 30 dias de previsão
        const res = await fetch(`${baseUrl}/api/clima/previsao?lat=${lat}&lon=${lon}&days=30`);
        if (res.ok) {
          const json = await res.json();
          setData(json);
        }
      } catch (err) {
        console.error("Erro ao buscar clima mensal:", err);
      } finally {
        setLoading(false);
      }
    }
    fetchWeather();
  }, []);

  const getIcon = (precip: number, prob: number) => {
    if (precip > 10 || prob > 70) return <CloudLightning className="text-agro-blue" size={24} />;
    if (precip > 0 || prob > 30) return <CloudRain className="text-blue-400" size={24} />;
    return <Sun className="text-yellow-500" size={24} />;
  };

  const getUVColor = (uv: number) => {
    if (uv <= 2) return "text-green-500";
    if (uv <= 5) return "text-yellow-500";
    if (uv <= 7) return "text-orange-500";
    if (uv <= 10) return "text-red-500";
    return "text-purple-600";
  };

  return (
    <div className="min-h-screen bg-agro-light">
      <Header />
      
      <div className="px-6 py-6 space-y-6">
        <div>
          <h2 className="text-xl font-bold text-agro-black">Previsão Mensal</h2>
          <p className="text-sm text-gray-500 font-medium">{cityName}, {uf} • Próximos 30 dias</p>
        </div>

        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 text-agro-blue">
            <Loader2 className="animate-spin mb-2" size={40} />
            <p className="font-medium">Calculando previsão do mês...</p>
          </div>
        ) : !data ? (
          <div className="bg-white p-8 rounded-2xl text-center border border-agro-gray">
            <p className="text-gray-500">Não foi possível carregar a previsão.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-3">
            {data.dados
              .filter(dia => {
                const diaDate = new Date(dia.data);
                const hoje_comeco = new Date();
                hoje_comeco.setHours(0,0,0,0);
                return diaDate >= hoje_comeco;
              })
              .map((dia, idx) => {
                const isHoje = new Date(dia.data).toDateString() === new Date().toDateString();
                
                return (
                  <div key={idx} className={`bg-white rounded-2xl p-4 shadow-sm border ${isHoje ? 'border-agro-blue ring-1 ring-agro-blue/20' : 'border-agro-gray'} flex items-center justify-between relative`}>
                    {isHoje && (
                      <span className="absolute -top-2 left-4 bg-agro-blue text-white text-[9px] font-black px-2 py-0.5 rounded-full shadow-sm">
                        HOJE
                      </span>
                    )}
                    <div className="flex items-center gap-4">
                      <div className="text-center w-12">
                        <span className="block text-[10px] font-bold text-gray-400 uppercase">
                          {new Date(dia.data).toLocaleDateString('pt-BR', { weekday: 'short' })}
                        </span>
                        <span className="block text-lg font-bold text-agro-black">
                          {new Date(dia.data).getDate()}
                        </span>
                      </div>
                      
                      <div className="h-10 w-[1px] bg-gray-100"></div>
                      
                      <div className="flex items-center gap-3">
                        {getIcon(dia.precipitacao_mm || 0, dia.prob_chuva_pct || 0)}
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-bold text-agro-black">{Math.round(dia.temp_max_c || 0)}°</span>
                            <span className="text-xs text-gray-400">{Math.round(dia.temp_min_c || 0)}°</span>
                          </div>
                          <div className="flex items-center gap-1.5 mt-0.5">
                            <Droplets size={12} className="text-blue-400" />
                            <span className="text-[10px] font-bold text-blue-500">{dia.prob_chuva_pct || 0}%</span>
                            <span className="text-[10px] text-gray-400">({dia.precipitacao_mm || 0}mm)</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="text-right">
                      <div className={`flex items-center justify-end gap-1 ${getUVColor(dia.uv_index || 0)}`}>
                        <Zap size={14} />
                        <span className="text-[10px] font-extrabold uppercase tracking-tighter">UV {Math.round(dia.uv_index || 0)}</span>
                      </div>
                      <p className="text-[10px] font-medium text-gray-400 mt-0.5">
                        {Math.round((dia.radiacao_solar_wm2 || 0) / 3.6)} kWh/m²
                      </p>
                    </div>
                  </div>
                );
              })}
          </div>
        )}

        {/* Spacer for bottom nav */}
        <div className="h-20"></div>
      </div>
    </div>
  );
}
