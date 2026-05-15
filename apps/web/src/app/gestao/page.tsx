"use client";

import Header from "@/components/Header";
import { Tractor, Sprout, PawPrint, Bird, LayoutGrid, ChevronRight } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";

export default function GestaoPage() {
  const [resumoCultura, setResumoCultura] = useState({ ativas: 0, hectares: 0 });
  const [resumoAnimais, setResumoAnimais] = useState({ total: 0, lotes: 0 });

  const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:3001";

  useEffect(() => {
    // Buscar Culturas
    fetch(`${apiUrl}/api/culturas`)
      .then((res) => res.json())
      .then((data: any[]) => {
        const ativas = data.filter(c => c.status !== 'colhido' && c.status !== 'perdido').length;
        const hectares = data.reduce((acc, curr) => acc + Number(curr.area_ha), 0);
        setResumoCultura({ ativas, hectares: Math.round(hectares * 100) / 100 });
      })
      .catch(() => {});

    // Buscar Animais
    fetch(`${apiUrl}/api/animais`)
      .then((res) => res.json())
      .then((data: any[]) => {
        const total = data.reduce((acc, curr) => acc + Number(curr.quantidade), 0);
        setResumoAnimais({ total, lotes: data.length });
      })
      .catch(() => {});
  }, [apiUrl]);

  return (
    <div className="min-h-screen bg-agro-light">
      <Header />
      
      <div className="px-6 py-6 space-y-8">
        <div>
          <h2 className="text-xl font-bold text-agro-black">Gestão Geral</h2>
          <p className="text-sm text-gray-500 font-medium mt-1">Sua fazenda em números</p>
        </div>

        {/* Lavouras Section */}
        <section className="space-y-4">
          <div className="flex justify-between items-center px-1">
            <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider">Minhas Lavouras</h3>
            <Link href="/lavouras" className="text-xs font-bold text-agro-blue flex items-center gap-0.5">
              Gerenciar Detalhes <ChevronRight size={14} />
            </Link>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-white rounded-3xl p-5 shadow-sm border border-agro-gray flex flex-col gap-4">
              <div className="bg-agro-green/10 w-12 h-12 rounded-2xl flex items-center justify-center text-agro-green">
                <Sprout size={24} />
              </div>
              <div>
                <p className="text-2xl font-bold text-agro-black leading-none">{resumoCultura.ativas}</p>
                <p className="text-[10px] text-gray-400 font-bold uppercase mt-1 tracking-wider">Lavouras Ativas</p>
              </div>
            </div>
            
            <div className="bg-white rounded-3xl p-5 shadow-sm border border-agro-gray flex flex-col gap-4">
              <div className="bg-green-50 w-12 h-12 rounded-2xl flex items-center justify-center text-green-600">
                <Tractor size={24} />
              </div>
              <div>
                <p className="text-2xl font-bold text-agro-black leading-none">{resumoCultura.hectares}</p>
                <p className="text-[10px] text-gray-400 font-bold uppercase mt-1 tracking-wider">Hectares Totais</p>
              </div>
            </div>
          </div>
        </section>

        {/* Pecuária Section */}
        <section className="space-y-4">
          <div className="flex justify-between items-center px-1">
            <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider">Meu Rebanho</h3>
            <Link href="/animais" className="text-xs font-bold text-agro-blue flex items-center gap-0.5">
              Gerenciar Detalhes <ChevronRight size={14} />
            </Link>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-white rounded-3xl p-5 shadow-sm border border-agro-gray flex flex-col gap-4">
              <div className="bg-orange-50 w-12 h-12 rounded-2xl flex items-center justify-center text-orange-600">
                <PawPrint size={24} />
              </div>
              <div>
                <p className="text-2xl font-bold text-agro-black leading-none">{resumoAnimais.total}</p>
                <p className="text-[10px] text-gray-400 font-bold uppercase mt-1 tracking-wider">Cabeças Totais</p>
              </div>
            </div>
            
            <div className="bg-white rounded-3xl p-5 shadow-sm border border-agro-gray flex flex-col gap-4">
              <div className="bg-yellow-50 w-12 h-12 rounded-2xl flex items-center justify-center text-yellow-600">
                <Bird size={24} />
              </div>
              <div>
                <p className="text-2xl font-bold text-agro-black leading-none">{resumoAnimais.lotes}</p>
                <p className="text-[10px] text-gray-400 font-bold uppercase mt-1 tracking-wider">Lotes de Animais</p>
              </div>
            </div>
          </div>
        </section>

        {/* Atalho Rápido */}
        <Link href="/agenda" className="block bg-agro-blue p-6 rounded-3xl text-white shadow-lg shadow-blue-100 group overflow-hidden relative">
          <div className="absolute -right-4 -top-4 bg-white/10 w-24 h-24 rounded-full group-hover:scale-150 transition-transform duration-500"></div>
          <div className="relative z-10 flex justify-between items-center">
            <div>
              <p className="text-lg font-bold leading-tight">Agenda & Notificações</p>
              <p className="text-xs text-blue-100 font-medium">Confira seus próximos compromissos</p>
            </div>
            <div className="bg-white/20 p-3 rounded-2xl">
              <ChevronRight size={20} />
            </div>
          </div>
        </Link>
        
        <div className="h-24"></div>
      </div>
    </div>
  );
}
