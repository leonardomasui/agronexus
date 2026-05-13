"use client";

import Header from "@/components/Header";
import WeatherWidget from "@/components/WeatherWidget";
import { Tractor, Sprout, PawPrint, Bird, BellRing } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";

interface AgendaItem {
  id: string;
  titulo: string;
  data_evento: string;
  tipo: "evento" | "lembrete";
  descricao?: string;
}

export default function Home() {
  const [lembretes, setLembretes] = useState<AgendaItem[]>([]);

  const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:3001";

  useEffect(() => {
    fetch(`${apiUrl}/api/agenda`)
      .then((res) => res.json())
      .then((data: AgendaItem[]) => {
        const soLembretes = data
          .filter((item) => item.tipo === "lembrete")
          .sort((a, b) => new Date(a.data_evento).getTime() - new Date(b.data_evento).getTime())
          .slice(0, 3);
        setLembretes(soLembretes);
      })
      .catch(() => {/* silencia erros se API offline */});
  }, []);

  return (
    <div className="min-h-screen bg-agro-light">
      <Header />
      
      <div className="px-6 py-6 space-y-6">
        
        {/* Weather */}
        <section>
          <WeatherWidget />
        </section>

        {/* Resumo Lavouras */}
        <section>
          <div className="flex justify-between items-end mb-3">
            <h2 className="text-sm font-bold text-gray-500 uppercase tracking-wider">Resumo Lavouras</h2>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-white rounded-2xl p-4 shadow-sm border border-agro-gray flex flex-col justify-between aspect-square">
              <div className="bg-agro-green/10 w-10 h-10 rounded-full flex items-center justify-center text-agro-green mb-2">
                <Sprout size={20} />
              </div>
              <div>
                <p className="text-2xl font-bold text-agro-black">3</p>
                <p className="text-xs text-gray-500 font-medium">Culturas Ativas</p>
              </div>
            </div>
            
            <div className="bg-white rounded-2xl p-4 shadow-sm border border-agro-gray flex flex-col justify-between aspect-square">
              <div className="bg-green-50 w-10 h-10 rounded-full flex items-center justify-center text-green-600 mb-2">
                <Tractor size={20} />
              </div>
              <div>
                <p className="text-2xl font-bold text-agro-black">530</p>
                <p className="text-xs text-gray-500 font-medium">Hectares Plantados</p>
              </div>
            </div>
          </div>
        </section>

        {/* Resumo Pecuária */}
        <section>
          <div className="flex justify-between items-end mb-3">
            <h2 className="text-sm font-bold text-gray-500 uppercase tracking-wider">Resumo Pecuária</h2>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-white rounded-2xl p-4 shadow-sm border border-agro-gray flex flex-col justify-between aspect-square">
              <div className="bg-orange-50 w-10 h-10 rounded-full flex items-center justify-center text-orange-600 mb-2">
                <PawPrint size={20} />
              </div>
              <div>
                <p className="text-2xl font-bold text-agro-black">695</p>
                <p className="text-xs text-gray-500 font-medium">Cabeças Totais</p>
              </div>
            </div>
            
            <div className="bg-white rounded-2xl p-4 shadow-sm border border-agro-gray flex flex-col justify-between aspect-square">
              <div className="bg-yellow-50 w-10 h-10 rounded-full flex items-center justify-center text-yellow-600 mb-2">
                <Bird size={20} />
              </div>
              <div>
                <p className="text-2xl font-bold text-agro-black">3</p>
                <p className="text-xs text-gray-500 font-medium">Lotes de Animais</p>
              </div>
            </div>
          </div>
        </section>

        {/* Avisos e Lembretes da Agenda */}
        <section>
          <div className="flex justify-between items-end mb-3">
            <h2 className="text-sm font-bold text-gray-500 uppercase tracking-wider">Avisos e Lembretes</h2>
            <Link href="/avisos" className="text-xs font-bold text-agro-blue">Ver todos</Link>
          </div>
          <div className="space-y-3">
            {lembretes.length === 0 ? (
              <div className="bg-white rounded-xl p-4 border border-dashed border-gray-200 text-center">
                <p className="text-xs text-gray-400">Nenhum lembrete ativo. Crie um na Agenda! 📅</p>
              </div>
            ) : (
              lembretes.map((item) => (
                <div key={item.id} className="bg-white rounded-xl p-3 shadow-sm border border-agro-gray flex gap-3 items-start">
                  <div className="p-2 rounded-lg shrink-0 bg-orange-50 text-orange-600">
                    <BellRing size={18} />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-agro-black leading-tight line-clamp-1">{item.titulo}</h4>
                    <p className="text-xs text-gray-500 mt-0.5">
                      Lembrete · {new Date(item.data_evento).toLocaleDateString("pt-BR", { day: "2-digit", month: "short" })}
                    </p>
                  </div>
                </div>
              ))
            )}
          </div>
        </section>

        {/* Spacer for bottom nav */}
        <div className="h-20"></div>
      </div>
    </div>
  );
}
