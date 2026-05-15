"use client";

import { useEffect, useState } from "react";
import Header from "@/components/Header";
import { Newspaper, ExternalLink, Clock, Sparkles, Loader2, Sprout, PawPrint, MessageSquare } from "lucide-react";

export default function NoticiasPage() {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<any>(null);
  const [user, setUser] = useState<any>(null);
  const [activeTab, setActiveTab] = useState<"geral" | "personalizado">("geral");

  useEffect(() => {
    const localUser = localStorage.getItem("agronexus_user");
    if (localUser) {
      const parsedUser = JSON.parse(localUser);
      setUser(parsedUser);
      fetchNoticias(parsedUser);
    } else {
      setLoading(false);
    }
  }, []);

  const fetchNoticias = async (userData: any) => {
    setLoading(true);
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";
      const res = await fetch(`${apiUrl}/api/noticias`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          usuario: {
            nome: userData.nome,
            culturas: userData.culturas,
            criacoes: userData.animais // Mapeando 'animais' do sistema para 'criacoes' do prompt
          }
        })
      });
      const json = await res.json();
      setData(json);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-agro-light">
        <Header />
        <div className="flex flex-col items-center justify-center h-[60vh] px-10 text-center space-y-4">
          <div className="relative">
            <div className="absolute -inset-4 bg-agro-blue/10 rounded-full animate-pulse"></div>
            <Sparkles className="text-agro-blue animate-bounce" size={48} />
          </div>
          <h2 className="text-xl font-bold text-agro-black">Buscando notícias personalizadas...</h2>
          <p className="text-sm text-gray-400">Analisando fontes confiáveis do agronegócio para você.</p>
          <Loader2 className="animate-spin text-agro-blue mt-4" />
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-agro-light">
        <Header />
        <div className="p-10 text-center space-y-4">
          <Newspaper size={48} className="mx-auto text-gray-300" />
          <h2 className="text-xl font-bold text-agro-black">Perfil incompleto</h2>
          <p className="text-sm text-gray-500">Configure seu perfil para receber notícias personalizadas do seu setor.</p>
          <a href="/configuracoes" className="inline-block bg-agro-blue text-white px-6 py-3 rounded-2xl font-bold">Ir para Configurações</a>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-agro-light">
      <Header />
      <div className="px-6 py-6 space-y-6">
        {/* Filtros / Tabs */}
        <div className="flex gap-2 p-1.5 bg-gray-100 rounded-2xl">
          <button 
            onClick={() => setActiveTab("geral")}
            className={`flex-1 py-3 rounded-xl text-xs font-black uppercase tracking-wider transition-all ${activeTab === "geral" ? "bg-white text-agro-blue shadow-sm" : "text-gray-400"}`}
          >
            Notícias do Dia
          </button>
          <button 
            onClick={() => setActiveTab("personalizado")}
            className={`flex-1 py-3 rounded-xl text-xs font-black uppercase tracking-wider transition-all ${activeTab === "personalizado" ? "bg-white text-agro-blue shadow-sm" : "text-gray-400"}`}
          >
            Minha Propriedade
          </button>
        </div>

        {/* Conteúdo Dinâmico */}
        <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
          {activeTab === "geral" ? (
            <section className="space-y-4">
              <div className="flex items-center gap-2 mb-2">
                <Newspaper size={16} className="text-agro-blue" />
                <span className="text-[10px] font-black uppercase text-gray-400">Principais Manchetes</span>
              </div>
              <div className="space-y-4">
                {data?.modo_geral?.map((item: any, idx: number) => (
                  <div key={idx} className="bg-white rounded-3xl p-5 border border-agro-gray shadow-sm space-y-3">
                    <h4 className="font-bold text-agro-black leading-snug">📰 {item.titulo}</h4>
                    <div className="flex items-center gap-2 text-[10px] font-bold text-gray-400 uppercase">
                      <span>Fonte: {item.fonte}</span>
                      {item.data && <span>• {new Date(item.data).toLocaleDateString('pt-BR')}</span>}
                    </div>
                    <p className="text-sm text-gray-600 line-clamp-3">
                      {item.resumo}
                    </p>
                    <a 
                      href={item.link} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 text-agro-blue text-[10px] font-black uppercase hover:underline"
                    >
                      🔗 Ler leitura completa <ExternalLink size={12} />
                    </a>
                  </div>
                ))}
              </div>
            </section>
          ) : (
            <section className="space-y-6">
              <div className="flex items-center gap-2 mb-2">
                <Sparkles size={16} className="text-agro-green" />
                <span className="text-[10px] font-black uppercase text-gray-400">Destaques para sua Produção</span>
              </div>

              {Object.keys(data?.modo_personalizado || {}).length === 0 ? (
                <div className="bg-orange-50 border border-orange-100 rounded-2xl p-6 text-center space-y-2">
                  <p className="text-sm text-orange-800 font-medium italic">
                    "Não encontrei notícias específicas para seu perfil hoje. Que tal completar seu perfil em Configurações?"
                  </p>
                  <a href="/configuracoes" className="text-xs font-bold text-orange-600 uppercase">Ajustar Perfil</a>
                </div>
              ) : (
                <div className="space-y-8">
                  {Object.entries(data?.modo_personalizado).map(([interesse, noticias]: [string, any]) => (
                    <div key={interesse} className="space-y-4">
                      <div className="flex items-center gap-2 border-l-4 border-agro-green pl-3">
                        {interesse.includes("GADO") || interesse.includes("BOI") ? <PawPrint size={18} className="text-agro-green" /> : <Sprout size={18} className="text-agro-green" />}
                        <h4 className="font-bold text-agro-green text-sm uppercase">{interesse}</h4>
                      </div>
                      <div className="space-y-4">
                        {noticias.map((item: any, idx: number) => (
                          <div key={idx} className="bg-white rounded-3xl p-5 border border-agro-gray shadow-sm space-y-3">
                            <h5 className="font-bold text-agro-black leading-snug">📰 {item.titulo}</h5>
                            <div className="flex items-center gap-2 text-[10px] font-bold text-gray-400 uppercase">
                              <span>Fonte: {item.fonte}</span>
                            </div>
                            <p className="text-sm text-gray-600">
                              {item.resumo}
                            </p>
                            <a 
                              href={item.link} 
                              target="_blank" 
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-2 text-agro-blue text-[10px] font-black uppercase"
                            >
                              🔗 Link <ExternalLink size={12} />
                            </a>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </section>
          )}
        </div>

        <div className="h-20" /> {/* Espaçador para o BottomNav */}
      </div>
    </div>
  );
}
