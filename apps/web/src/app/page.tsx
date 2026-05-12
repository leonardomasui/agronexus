import Header from "@/components/Header";
import WeatherWidget from "@/components/WeatherWidget";
import { Tractor, Sprout, TrendingUp, AlertTriangle, PawPrint, Bird, BellRing } from "lucide-react";
import Link from "next/link";
import { getSystemAlerts } from "@/lib/mockData";

export default function Home() {
  const recentAlerts = getSystemAlerts();

  return (
    <div className="min-h-screen bg-agro-light">
      <Header />
      
      <div className="px-6 py-6 space-y-6">
        
        {/* Weather Section */}
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

        {/* Recent Alerts & Reminders */}
        <section>
          <div className="flex justify-between items-end mb-3">
            <h2 className="text-sm font-bold text-gray-500 uppercase tracking-wider">Avisos e Lembretes</h2>
            <Link href="/avisos" className="text-xs font-bold text-agro-blue">Ver todos</Link>
          </div>
          <div className="space-y-3">
            {recentAlerts.slice(0, 3).map((alerta) => (
              <div key={alerta.id} className="bg-white rounded-xl p-3 shadow-sm border border-agro-gray flex gap-3 items-start">
                <div className={`p-2 rounded-lg shrink-0 ${alerta.severidade === 'critico' ? 'bg-red-50 text-red-600' : alerta.severidade === 'aviso' ? 'bg-orange-50 text-orange-600' : 'bg-blue-50 text-agro-blue'}`}>
                  {alerta.fonte === 'Agenda' ? <BellRing size={18} /> : <AlertTriangle size={18} />}
                </div>
                <div>
                  <h4 className="text-sm font-bold text-agro-black leading-tight line-clamp-1">{alerta.mensagem.replace('LEMBRETE: ', '')}</h4>
                  <p className="text-xs text-gray-500 mt-0.5">{alerta.fonte === 'Agenda' ? 'Lembrete da Agenda' : alerta.fonte}</p>
                </div>
              </div>
            ))}
          </div>
        </section>
        
        {/* Spacer for bottom nav */}
        <div className="h-20"></div>
      </div>
    </div>
  );
}
