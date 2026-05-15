"use client";

import { useEffect, useState } from "react";
import Header from "@/components/Header";
import AlertCard from "@/components/AlertCard";
import { Loader2 } from "lucide-react";
import { Alerta } from "@agronexus/shared/types";
import { parseInmetXML } from "@/lib/inmetParser";

export default function AvisosPage() {
  const [alertas, setAlertas] = useState<Alerta[]>([]);
  const [loading, setLoading] = useState(true);
  const [filtroAtivo, setFiltroAtivo] = useState<"todos" | "clima" | "lembretes" | "eventos">("todos");

  useEffect(() => {
    async function fetchData() {
      setLoading(true);
      try {
        const baseUrl = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:3001";
        const agora = new Date();
        
        // Define quantos dias de clima buscar baseado no filtro
        const diasClima = filtroAtivo === "clima" ? 30 : 7;

        // 1. Buscar Alertas Oficiais do INMET
        let inmetAlertas: Alerta[] = [];
        if (filtroAtivo === "todos" || filtroAtivo === "clima") {
          try {
            const res = await fetch(`${baseUrl}/api/clima/alertas`);
            if (res.ok) {
              const xmlString = await res.text();
              const todosInmet = parseInmetXML(xmlString);
              
              // Mostrar alertas apenas de hoje para frente
              const hoje_comeco = new Date();
              hoje_comeco.setHours(0,0,0,0);
              
              inmetAlertas = todosInmet.filter(a => new Date(a.created_at) >= hoje_comeco);
            }
          } catch (e) { console.error("Erro INMET", e); }
        }

        const hoje_comeco_ref = new Date();
        hoje_comeco_ref.setHours(0,0,0,0);

        // 2. Buscar Agenda (Eventos + Lembretes)
        let agendaAlertas: Alerta[] = [];
        if (filtroAtivo === "todos" || filtroAtivo === "lembretes" || filtroAtivo === "eventos") {
          try {
            const agendaRes = await fetch(`${baseUrl}/api/agenda`);
            if (agendaRes.ok) {
              const agendaData = await agendaRes.json();
              agendaAlertas = agendaData
                .filter((item: any) => {
                  const itemDate = new Date(item.data_evento);
                  if (itemDate < hoje_comeco_ref) return false;
                  
                  if (filtroAtivo === "lembretes") return item.tipo === "lembrete";
                  if (filtroAtivo === "eventos") return item.tipo === "evento";
                  return true;
                })
                .map((item: any) => ({
                  id: item.id,
                  propriedade_id: item.propriedade_id || "1",
                  tipo: 'geral',
                  mensagem: `${item.titulo}`,
                  severidade: item.tipo === 'lembrete' ? 'lembrete' : 'evento',
                  fonte: item.tipo === 'lembrete' ? 'Lembrete' : 'Evento da Agenda',
                  lido: item.concluido || false,
                  created_at: item.data_evento
                }));
            }
          } catch (e) { console.error("Erro Agenda", e); }
        }

        // 3. Buscar Previsão de Clima
        let previsaoAlertas: Alerta[] = [];
        if (filtroAtivo === "todos" || filtroAtivo === "clima") {
          try {
            // Tentar pegar coordenadas do usuário do localStorage
            const userJson = localStorage.getItem("agronexus_user");
            let lat = -22.725;
            let lon = -47.647;
            
            if (userJson) {
              const userData = JSON.parse(userJson);
              if (userData.municipio?.lat && userData.municipio?.lon) {
                lat = userData.municipio.lat;
                lon = userData.municipio.lon;
              }
            }

            const climaRes = await fetch(`${baseUrl}/api/clima/previsao?lat=${lat}&lon=${lon}&days=${diasClima}`);
            if (climaRes.ok) {
              const climaData = await climaRes.json();
              if (climaData.dados && climaData.dados.length > 0) {
                climaData.dados.forEach((dia: any, index: number) => {
                  const diaDate = new Date(dia.data + 'T12:00:00');
                  const hoje_comeco = new Date();
                  hoje_comeco.setHours(0,0,0,0);
                  if (diaDate < hoje_comeco) return;

                  // Alerta de Chuva (Threshold mais baixo para aparecer mais)
                  if (dia.precipitacao_mm && dia.precipitacao_mm >= 2) {
                    previsaoAlertas.push({
                      id: `chuva-${dia.data}`,
                      propriedade_id: "1",
                      tipo: 'clima',
                      mensagem: `Previsão de ${dia.precipitacao_mm >= 15 ? 'chuva forte' : 'chuva'} (${dia.precipitacao_mm}mm) para ${diaDate.toLocaleDateString('pt-BR')}`,
                      severidade: dia.precipitacao_mm >= 20 ? 'critico' : dia.precipitacao_mm >= 8 ? 'aviso' : 'info',
                      fonte: 'Previsão do Tempo',
                      lido: false,
                      created_at: new Date(dia.data + 'T23:59:59').toISOString()
                    });
                  }

                  // Alerta de Temperatura Brusca
                  if (index > 0) {
                    const diaAnterior = climaData.dados[index - 1];
                    const diff = Math.abs(dia.temp_max_c - diaAnterior.temp_max_c);
                    if (diff >= 4) {
                      previsaoAlertas.push({
                        id: `temp-${dia.data}`,
                        propriedade_id: "1",
                        tipo: 'clima',
                        mensagem: `Mudança de temperatura (${dia.temp_max_c > diaAnterior.temp_max_c ? 'Aumento' : 'Queda'} de ${Math.round(diff)}°C) em ${diaDate.toLocaleDateString('pt-BR')}`,
                        severidade: diff >= 8 ? 'aviso' : 'info',
                        fonte: 'Previsão do Tempo',
                        lido: false,
                        created_at: new Date(dia.data + 'T23:59:59').toISOString()
                      });
                    }
                  }

                  // Alerta de Temperatura Extrema
                  if (dia.temp_max_c >= 30 || dia.temp_min_c <= 15) {
                    previsaoAlertas.push({
                        id: `extrema-${dia.data}`,
                        propriedade_id: "1",
                        tipo: 'clima',
                        mensagem: `Temperatura ${dia.temp_max_c >= 30 ? 'Elevada' : 'Baixa'} em ${diaDate.toLocaleDateString('pt-BR')}: ${Math.round(dia.temp_min_c)}°C - ${Math.round(dia.temp_max_c)}°C`,
                        severidade: (dia.temp_max_c >= 35 || dia.temp_min_c <= 10) ? 'critico' : 'aviso',
                        fonte: 'Previsão do Tempo',
                        lido: false,
                        created_at: new Date(dia.data + 'T23:59:59').toISOString()
                      });
                  }

                  // Informativo de Céu Limpo
                  if (!dia.precipitacao_mm || dia.precipitacao_mm < 1) {
                    previsaoAlertas.push({
                      id: `limpo-${dia.data}`,
                      propriedade_id: "1",
                      tipo: 'clima',
                      mensagem: `Tempo firme e seco previsto para ${diaDate.toLocaleDateString('pt-BR')}. Ideal para atividades de campo.`,
                      severidade: 'info',
                      fonte: 'Previsão do Tempo',
                      lido: false,
                      created_at: new Date(dia.data + 'T23:59:59').toISOString()
                    });
                  }
                });
              }
            }
          } catch (e) { console.error("Erro Previsão Chuva", e); }
        }

        // 4. Gerar Alertas Automáticos de Estágios de Culturas
        let culturaAlertas: Alerta[] = [];
        if (filtroAtivo === "todos") {
          try {
            const cultRes = await fetch(`${baseUrl}/api/culturas`);
            if (cultRes.ok) {
              const culturas = await cultRes.json();
              culturas.forEach((c: any) => {
                if (c.status === 'colhido' || c.status === 'perdido' || !c.data_plantio || !c.data_colheita_prev) return;

                const inicio = new Date(c.data_plantio + 'T12:00:00').getTime();
                const fim = new Date(c.data_colheita_prev + 'T12:00:00').getTime();
                const total = fim - inicio;
                const decorrido = agora.getTime() - inicio;
                const percent = Math.round((decorrido / total) * 100);

                if (percent >= 0 && percent <= 100) {
                  let msg = "";
                  let sev: 'info' | 'aviso' | 'critico' = 'info';

                  if (percent < 5) {
                    msg = `Sua lavoura de ${c.nome} está em fase de germinação. Monitore a umidade do solo.`;
                  } else if (percent > 60 && percent < 65) {
                    msg = `${c.nome} entrando em fase de maturação. Fique atento a pragas e doenças de fim de ciclo.`;
                    sev = 'aviso';
                  } else if (percent > 90) {
                    msg = `Ponto de Colheita atingido para ${c.nome}! Prepare as máquinas e a logística de transporte.`;
                    sev = 'critico';
                  }

                  if (msg) {
                    culturaAlertas.push({
                      id: `cultura-${c.id}-${percent}`,
                      propriedade_id: c.propriedade_id,
                      tipo: 'geral',
                      mensagem: msg,
                      severidade: sev,
                      fonte: 'Monitoramento de Lavouras',
                      lido: false,
                      created_at: agora.toISOString()
                    });
                  }
                }
              });
            }
          } catch (e) { console.error("Erro Alertas Culturas", e); }
        }

        // Mesclar tudo, filtrar apenas o que ainda não passou (considerando o início do dia de hoje) e ordenar
        const hoje_comeco_limite = new Date();
        hoje_comeco_limite.setHours(0, 0, 0, 0);

        const todosAlertas = [...inmetAlertas, ...agendaAlertas, ...previsaoAlertas, ...culturaAlertas]
          .filter(a => new Date(a.created_at) >= hoje_comeco_limite)
          .sort((a, b) => {
            return new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
          });
        
        setAlertas(todosAlertas);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    
    fetchData();
  }, [filtroAtivo]);

  const handleMarkAsRead = async (id: string) => {
    setAlertas(prev => prev.map(a => a.id === id ? { ...a, lido: !a.lido } : a));
    const alerta = alertas.find(a => a.id === id);
    if (alerta && (alerta.fonte === 'Lembrete' || alerta.fonte === 'Evento da Agenda')) {
      try {
        const baseUrl = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:3001";
        await fetch(`${baseUrl}/api/agenda/${id}/toggle-concluido`, { method: 'PATCH' });
      } catch (e) {
        console.error("Erro ao persistir lido na agenda", e);
      }
    }
  };

  const criticosCount = alertas.filter(a => a.severidade === 'critico' && !a.lido).length;

  return (
    <div className="min-h-screen bg-agro-light">
      <Header />
      
      <div className="px-6 py-6 space-y-6">
        <div className="flex flex-col gap-4">
          <div className="flex justify-between items-end">
            <div>
              <h2 className="text-xl font-bold text-agro-black">Central de Avisos</h2>
              {!loading && criticosCount > 0 && (
                <p className="text-xs font-semibold text-red-600 mt-1">
                  {criticosCount} aviso(s) crítico(s) não lido(s)
                </p>
              )}
            </div>
          </div>
          
          {/* Filtros Chips */}
          <div className="flex gap-2 overflow-x-auto pb-1 no-scrollbar">
             <button 
              onClick={() => setFiltroAtivo("todos")}
              className={`text-[10px] font-bold px-4 py-2 rounded-xl border transition-all shrink-0 ${filtroAtivo === 'todos' ? 'bg-agro-blue text-white border-agro-blue shadow-md' : 'bg-white text-gray-500 border-agro-gray'}`}
            >
              TODOS
            </button>
            <button 
              onClick={() => setFiltroAtivo("clima")}
              className={`text-[10px] font-bold px-4 py-2 rounded-xl border transition-all shrink-0 ${filtroAtivo === 'clima' ? 'bg-orange-500 text-white border-orange-500 shadow-md' : 'bg-white text-gray-500 border-agro-gray'}`}
            >
              CLIMA
            </button>
            <button 
              onClick={() => setFiltroAtivo("lembretes")}
              className={`text-[10px] font-bold px-4 py-2 rounded-xl border transition-all shrink-0 ${filtroAtivo === 'lembretes' ? 'bg-agro-blue text-white border-agro-blue shadow-md' : 'bg-white text-gray-500 border-agro-gray'}`}
            >
              LEMBRETES
            </button>
            <button 
              onClick={() => setFiltroAtivo("eventos")}
              className={`text-[10px] font-bold px-4 py-2 rounded-xl border transition-all shrink-0 ${filtroAtivo === 'eventos' ? 'bg-agro-green text-white border-agro-green shadow-md' : 'bg-white text-gray-500 border-agro-gray'}`}
            >
              EVENTOS
            </button>
          </div>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="flex flex-col items-center justify-center py-10 text-agro-blue">
            <Loader2 className="animate-spin mb-2" size={32} />
            <p className="text-sm font-medium">Buscando alertas {filtroAtivo === 'clima' ? 'do mês...' : '...'}</p>
          </div>
        )}

        {/* Lista de Alertas */}
        {!loading && (
          <div className="space-y-4">
            {alertas.map((alerta) => (
              <AlertCard 
                key={alerta.id} 
                alerta={alerta} 
                onMarkAsRead={handleMarkAsRead} 
              />
            ))}
          </div>
        )}

        {/* Mensagem de Vazio */}
        {!loading && alertas.length === 0 && (
          <div className="bg-white rounded-2xl p-8 text-center border border-agro-gray border-dashed">
            <p className="text-gray-500 font-medium text-sm">Nenhum aviso para "{filtroAtivo.toUpperCase()}".</p>
            <p className="text-gray-400 text-xs mt-1">Sua propriedade está segura.</p>
          </div>
        )}

        {/* Spacer for bottom nav */}
        <div className="h-20"></div>
      </div>
    </div>
  );
}
