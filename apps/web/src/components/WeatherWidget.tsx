"use client";

import { useEffect, useState } from "react";
import { CloudRain, Sun, Wind, Droplets } from "lucide-react";
import { DadosClimaticos } from "@agronexus/shared/types";
import Link from "next/link";

interface WeatherData {
  latitude: number;
  longitude: number;
  timezone: string;
  dados: DadosClimaticos[];
  estacao_inmet?: { codigo: string; nome: string; uf: string };
}

export default function WeatherWidget() {
  const [data, setData] = useState<WeatherData | null>(null);
  const [loading, setLoading] = useState(true);
  const [cityName, setCityName] = useState("Piracicaba");

  useEffect(() => {
    async function fetchWeather() {
      try {
        const localUser = localStorage.getItem("agronexus_user");
        let lat = -22.725;
        let lon = -47.647;
        let name = "Piracicaba";

        if (localUser) {
          const user = JSON.parse(localUser);
          if (user.municipio?.lat && user.municipio?.lon) {
            lat = user.municipio.lat;
            lon = user.municipio.lon;
            name = user.municipio.nome;
          }
        }
        setCityName(name);

        const url = process.env.NEXT_PUBLIC_API_URL 
          ? `${process.env.NEXT_PUBLIC_API_URL}/api/clima/previsao?lat=${lat}&lon=${lon}&days=1`
          : `http://127.0.0.1:3001/api/clima/previsao?lat=${lat}&lon=${lon}&days=1`;
        
        const res = await fetch(url);
        if (!res.ok) throw new Error(`Erro ao buscar clima: ${res.statusText}`);
        const json = await res.json();
        setData(json);
      } catch (err) {
        console.error("Erro no WeatherWidget:", err);
      } finally {
        setLoading(false);
      }
    }
    fetchWeather();
  }, []);

  if (loading) {
    return (
      <div className="bg-white rounded-2xl shadow-sm border border-agro-gray p-5 animate-pulse">
        <div className="h-16 bg-gray-200 rounded-lg w-full mb-4"></div>
        <div className="flex gap-4">
          <div className="h-8 bg-gray-200 rounded flex-1"></div>
          <div className="h-8 bg-gray-200 rounded flex-1"></div>
        </div>
      </div>
    );
  }

  if (!data || !data.dados || data.dados.length === 0) {
    return (
      <div className="bg-white rounded-2xl shadow-sm border border-agro-gray p-5 text-center text-gray-500">
        Não foi possível carregar os dados climáticos.
      </div>
    );
  }

  const hoje = data.dados[0];
  const maxTemp = hoje.temp_max_c ? Math.round(hoje.temp_max_c) : "--";
  const minTemp = hoje.temp_min_c ? Math.round(hoje.temp_min_c) : "--";
  const precip = hoje.precipitacao_mm ?? 0;

  return (
    <Link href="/clima" className="block transform transition-transform active:scale-[0.98]">
      <div className="bg-gradient-to-br from-agro-blue to-[#0459bd] rounded-2xl shadow-md p-4 text-white relative overflow-hidden hover:shadow-lg transition-shadow">
        {/* Decorative background element */}
        <div className="absolute -right-10 -top-10 w-24 h-24 bg-white/10 rounded-full blur-xl"></div>

        <div className="flex justify-between items-center relative z-10">
          
          {/* Esquerda: Info e Temp */}
          <div className="flex flex-col">
            <div className="mb-1">
              <h3 className="font-bold text-white text-sm uppercase tracking-wider">
                {cityName} - {new Date().toLocaleDateString('pt-BR')}
              </h3>
            </div>
            
            <div className="flex items-end gap-2 mt-1">
              <span className="text-4xl font-bold tracking-tighter leading-none">{maxTemp}°</span>
              <span className="text-sm text-white/70 mb-0.5">/{minTemp}°</span>
            </div>
          </div>

          {/* Direita: Ícone e Infos Secundárias */}
          <div className="flex flex-col items-end gap-2">
            {precip > 0 ? (
              <CloudRain className="text-blue-200" size={32} />
            ) : (
              <Sun className="text-yellow-300" size={32} />
            )}
            
            <div className="flex gap-3 text-right">
              <div className="flex items-center gap-1">
                <CloudRain size={12} className="text-blue-200" />
                <span className="text-xs font-medium">{precip}mm</span>
              </div>
              <div className="flex items-center gap-1">
                <Wind size={12} className="text-blue-200" />
                <span className="text-xs font-medium">{hoje.vento_kmh ? Math.round(hoje.vento_kmh) : "--"}km/h</span>
              </div>
            </div>
          </div>
          
        </div>
      </div>
    </Link>
  );
}
