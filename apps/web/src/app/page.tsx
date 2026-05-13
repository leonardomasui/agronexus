"use client";

import Header from "@/components/Header";
import WeatherWidget from "@/components/WeatherWidget";
import { Tractor, Sprout, PawPrint, Bird, BellRing, Loader2 } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

interface AgendaItem {
  id: string;
  titulo: string;
  data_evento: string;
  tipo: "evento" | "lembrete";
  descricao?: string;
}

export default function Home() {
  const router = useRouter();
  const [checkingAuth, setCheckingAuth] = useState(true);
  const [lembretes, setLembretes] = useState<AgendaItem[]>([]);
  const [resumoCultura, setResumoCultura] = useState({ ativas: 0, hectares: 0 });
  const [resumoAnimais, setResumoAnimais] = useState({ total: 0, lotes: 0 });

  const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:3001";

  useEffect(() => {
    // 0. Verificar Onboarding
    const user = localStorage.getItem("agronexus_user");
    if (!user) {
      router.push("/onboarding");
      return;
    }
    setCheckingAuth(false);

    // 1. Buscar Agenda
    fetch(`${apiUrl}/api/agenda`)
      .then((res) => res.json())
      .then((data: AgendaItem[]) => {
        const proximos = data
          .sort((a, b) => new Date(a.data_evento).getTime() - new Date(b.data_evento).getTime())
          .slice(0, 3);
        setLembretes(proximos);
      })
      .catch(() => {/* silencia erros */});

    // 2. Buscar Culturas
    fetch(`${apiUrl}/api/culturas`)
      .then((res) => res.json())
      .then((data: any[]) => {
        const ativas = data.filter(c => c.status !== 'colhido' && c.status !== 'perdido').length;
        const hectares = data.reduce((acc, curr) => acc + Number(curr.area_ha), 0);
        setResumoCultura({ ativas, hectares: Math.round(hectares * 100) / 100 });
      })
      .catch(() => {/* silencia erros */});

    // 3. Buscar Animais
    fetch(`${apiUrl}/api/animais`)
      .then((res) => res.json())
      .then((data: any[]) => {
        const total = data.reduce((acc, curr) => acc + Number(curr.quantidade), 0);
        setResumoAnimais({ total, lotes: data.length });
      })
      .catch(() => {/* silencia erros */});
  }, [router, apiUrl]);

  if (checkingAuth) {
    return (
      <div className="min-h-screen bg-agro-light flex items-center justify-center">
        <Loader2 className="animate-spin text-agro-blue" size={40} />
      </div>
    );
  }

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
            <Link href="/lavouras" className="text-xs font-bold text-agro-blue">Gerenciar</Link>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <Link href="/lavouras" className="bg-white rounded-2xl p-4 shadow-sm border border-agro-gray flex flex-col justify-between aspect-square hover:bg-gray-50 transition-colors">
              <div className="bg-agro-green/10 w-10 h-10 rounded-full flex items-center justify-center text-agro-green mb-2">
                <Sprout size={20} />
              </div>
              <div>
                <p className="text-2xl font-bold text-agro-black">{resumoCultura.ativas}</p>
                <p className="text-xs text-gray-500 font-medium">Culturas Ativas</p>
              </div>
            </Link>
            
            <Link href="/lavouras" className="bg-white rounded-2xl p-4 shadow-sm border border-agro-gray flex flex-col justify-between aspect-square hover:bg-gray-50 transition-colors">
              <div className="bg-green-50 w-10 h-10 rounded-full flex items-center justify-center text-green-600 mb-2">
                <Tractor size={20} />
              </div>
              <div>
                <p className="text-2xl font-bold text-agro-black">{resumoCultura.hectares}</p>
                <p className="text-xs text-gray-500 font-medium">Hectares Totais</p>
              </div>
            </Link>
          </div>
        </section>

        {/* Resumo Pecuária */}
        <section>
          <div className="flex justify-between items-end mb-3">
            <h2 className="text-sm font-bold text-gray-500 uppercase tracking-wider">Resumo Pecuária</h2>
            <Link href="/animais" className="text-xs font-bold text-agro-blue">Gerenciar</Link>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <Link href="/animais" className="bg-white rounded-2xl p-4 shadow-sm border border-agro-gray flex flex-col justify-between aspect-square hover:bg-gray-50 transition-colors">
              <div className="bg-orange-50 w-10 h-10 rounded-full flex items-center justify-center text-orange-600 mb-2">
                <PawPrint size={20} />
              </div>
              <div>
                <p className="text-2xl font-bold text-agro-black">{resumoAnimais.total}</p>
                <p className="text-xs text-gray-500 font-medium">Cabeças Totais</p>
              </div>
            </Link>
            
            <Link href="/animais" className="bg-white rounded-2xl p-4 shadow-sm border border-agro-gray flex flex-col justify-between aspect-square hover:bg-gray-50 transition-colors">
              <div className="bg-yellow-50 w-10 h-10 rounded-full flex items-center justify-center text-yellow-600 mb-2">
                <Bird size={20} />
              </div>
              <div>
                <p className="text-2xl font-bold text-agro-black">{resumoAnimais.lotes}</p>
                <p className="text-xs text-gray-500 font-medium">Lotes de Animais</p>
              </div>
            </Link>
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
                <p className="text-xs text-gray-400">Sua agenda está livre. Crie um compromisso! 📅</p>
              </div>
            ) : (
              lembretes.map((item) => (
                <div key={item.id} className="bg-white rounded-xl p-3 shadow-sm border border-agro-gray flex gap-3 items-start">
                  <div className={`p-2 rounded-lg shrink-0 ${item.tipo === 'lembrete' ? 'bg-orange-50 text-orange-600' : 'bg-blue-50 text-agro-blue'}`}>
                    {item.tipo === 'lembrete' ? <BellRing size={18} /> : <Tractor size={18} />}
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-agro-black leading-tight line-clamp-1">{item.titulo}</h4>
                    <p className="text-xs text-gray-500 mt-0.5 capitalize">
                      {item.tipo} · {new Date(item.data_evento).toLocaleDateString("pt-BR", { day: "2-digit", month: "short" })}
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
