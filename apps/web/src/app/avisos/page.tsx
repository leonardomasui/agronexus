"use client";

import { useEffect, useState } from "react";
import Header from "@/components/Header";
import AlertCard from "@/components/AlertCard";
import { Filter, Loader2 } from "lucide-react";
import { Alerta } from "@agronexus/shared/types";
import { parseInmetXML } from "@/lib/inmetParser";
import { getSystemAlerts } from "@/lib/mockData";

export default function AvisosPage() {
  const [alertas, setAlertas] = useState<Alerta[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchAlertasINMET() {
      try {
        const url = process.env.NEXT_PUBLIC_API_URL 
          ? `${process.env.NEXT_PUBLIC_API_URL}/api/clima/alertas`
          : `http://127.0.0.1:3001/api/clima/alertas`;
          
        const res = await fetch(url);
        if (!res.ok) throw new Error("Falha ao buscar RSS da INMET");
        
        const xmlString = await res.text();
        const inmetAlertas = parseInmetXML(xmlString);
        
        // Obter Alertas do Sistema + Lembretes da Agenda
        const SYSTEM_ALERTAS = getSystemAlerts();
        
        // Mesclar INMET reais com os alertas do sistema e agenda
        const todosAlertas = [...inmetAlertas, ...SYSTEM_ALERTAS].sort((a, b) => {
          return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
        });
        
        setAlertas(todosAlertas);
      } catch (err) {
        console.error(err);
        // Em caso de erro, exibe pelo menos os do sistema
        setAlertas(SYSTEM_ALERTAS);
      } finally {
        setLoading(false);
      }
    }
    
    fetchAlertasINMET();
  }, []);

  const criticosCount = alertas.filter(a => a.severidade === 'critico' && !a.lido).length;

  return (
    <div className="min-h-screen bg-agro-light">
      <Header />
      
      <div className="px-6 py-6 space-y-6">
        <div className="flex justify-between items-end">
          <div>
            <h2 className="text-xl font-bold text-agro-black">Central de Avisos</h2>
            {!loading && criticosCount > 0 && (
              <p className="text-xs font-semibold text-red-600 mt-1">
                {criticosCount} aviso(s) crítico(s) não lido(s)
              </p>
            )}
          </div>
          
          <button className="bg-white border border-agro-gray text-agro-black p-2 rounded-xl shadow-sm hover:bg-gray-50 transition-colors flex items-center justify-center">
            <Filter size={20} />
          </button>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="flex flex-col items-center justify-center py-10 text-agro-blue">
            <Loader2 className="animate-spin mb-2" size={32} />
            <p className="text-sm font-medium">Buscando alertas do INMET...</p>
          </div>
        )}

        {/* Lista de Alertas */}
        {!loading && (
          <div className="space-y-4">
            {alertas.map((alerta) => (
              <AlertCard key={alerta.id} alerta={alerta} />
            ))}
          </div>
        )}

        {/* Mensagem de Vazio */}
        {!loading && alertas.length === 0 && (
          <div className="bg-white rounded-2xl p-8 text-center border border-agro-gray border-dashed">
            <p className="text-gray-500 font-medium text-sm">Nenhum aviso ativo no momento.</p>
            <p className="text-gray-400 text-xs mt-1">Sua propriedade está segura.</p>
          </div>
        )}

        {/* Spacer for bottom nav */}
        <div className="h-20"></div>
      </div>
    </div>
  );
}
