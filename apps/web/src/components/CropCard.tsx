import { Sprout, Wheat, Leaf, Calendar, MapPin } from "lucide-react";
import { Cultura } from "@agronexus/shared/types";

interface CropCardProps {
  cultura: Cultura;
}

export default function CropCard({ cultura }: CropCardProps) {
  // Escolher ícone baseado no nome
  const getIcon = () => {
    const name = cultura.nome.toLowerCase();
    if (name.includes('milho') || name.includes('trigo')) return <Wheat size={24} />;
    if (name.includes('soja') || name.includes('feijão')) return <Sprout size={24} />;
    return <Leaf size={24} />;
  };

  // Cores de status
  const getStatusColor = () => {
    switch (cultura.status) {
      case 'plantado': return 'bg-blue-100 text-blue-700 border-blue-200';
      case 'crescimento': return 'bg-agro-green/20 text-agro-green border-agro-green/30';
      case 'colheita': return 'bg-yellow-100 text-yellow-700 border-yellow-300';
      case 'colhido': return 'bg-gray-100 text-gray-700 border-gray-300';
      case 'perdido': return 'bg-red-100 text-red-700 border-red-200';
      default: return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  };

  // Simulação de progresso baseada no status (apenas para o mock visual)
  const getProgress = () => {
    switch (cultura.status) {
      case 'plantado': return 10;
      case 'crescimento': return 60;
      case 'colheita': return 95;
      case 'colhido': return 100;
      default: return 0;
    }
  };

  const statusLabel = cultura.status.charAt(0).toUpperCase() + cultura.status.slice(1);

  return (
    <div className="bg-white rounded-2xl p-5 shadow-sm border border-agro-gray relative overflow-hidden group hover:shadow-md transition-shadow">
      <div className="flex justify-between items-start mb-4">
        <div className="flex items-center gap-3">
          <div className="bg-agro-light w-12 h-12 rounded-xl flex items-center justify-center text-agro-blue border border-agro-gray">
            {getIcon()}
          </div>
          <div>
            <h3 className="font-bold text-agro-black text-lg leading-tight">{cultura.nome}</h3>
            <p className="text-sm text-gray-500 font-medium">{cultura.variedade || "Variedade Comum"}</p>
          </div>
        </div>
        <span className={`text-xs font-bold px-2.5 py-1 rounded-md border uppercase tracking-wider ${getStatusColor()}`}>
          {statusLabel}
        </span>
      </div>

      <div className="grid grid-cols-2 gap-3 mb-4">
        <div className="flex items-center gap-2 text-gray-600">
          <MapPin size={16} className="text-gray-400" />
          <span className="text-sm font-medium">{cultura.area_ha} Hectares</span>
        </div>
        <div className="flex items-center gap-2 text-gray-600">
          <Calendar size={16} className="text-gray-400" />
          <span className="text-sm font-medium">Colheita: {cultura.data_colheita_prev ? new Date(cultura.data_colheita_prev).toLocaleDateString('pt-BR') : '--'}</span>
        </div>
      </div>

      {/* Progress Bar */}
      <div>
        <div className="flex justify-between items-center mb-1.5">
          <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">Desenvolvimento</span>
          <span className="text-xs font-bold text-agro-blue">{getProgress()}%</span>
        </div>
        <div className="w-full bg-agro-gray rounded-full h-2 overflow-hidden">
          <div 
            className="bg-gradient-to-r from-agro-green to-[#4ade80] h-2 rounded-full transition-all duration-1000 ease-out" 
            style={{ width: `${getProgress()}%` }}
          ></div>
        </div>
      </div>
    </div>
  );
}
