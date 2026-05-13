"use client";

import Header from "@/components/Header";
import { BarChart3, TrendingDown, TrendingUp, AlertTriangle } from "lucide-react";

export default function ImpactosPage() {
  return (
    <div className="min-h-screen bg-agro-light">
      <Header />
      <div className="px-6 py-6 space-y-6">
        <div>
          <h2 className="text-xl font-bold text-agro-black">Impactos e Riscos</h2>
          <p className="text-sm text-gray-500 font-medium">Análise de produtividade e ambiente</p>
        </div>

        <div className="bg-white rounded-3xl p-8 text-center border border-agro-gray border-dashed">
          <div className="bg-agro-blue/10 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 text-agro-blue">
            <BarChart3 size={32} />
          </div>
          <h3 className="font-bold text-agro-black mb-2">Análise em Processamento</h3>
          <p className="text-sm text-gray-400">Estamos processando os dados climáticos e de solo da sua região para gerar os primeiros relatórios de impacto.</p>
        </div>

        <div className="grid grid-cols-2 gap-4">
            <div className="bg-white p-4 rounded-2xl border border-agro-gray opacity-50">
                <TrendingDown className="text-red-500 mb-2" size={20} />
                <p className="text-xs font-bold text-gray-400 uppercase">Risco de Perda</p>
                <p className="text-lg font-bold text-gray-300">--%</p>
            </div>
            <div className="bg-white p-4 rounded-2xl border border-agro-gray opacity-50">
                <TrendingUp className="text-agro-green mb-2" size={20} />
                <p className="text-xs font-bold text-gray-400 uppercase">Potencial</p>
                <p className="text-lg font-bold text-gray-300">--%</p>
            </div>
        </div>
        
        <div className="h-20"></div>
      </div>
    </div>
  );
}
