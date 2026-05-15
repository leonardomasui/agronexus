import { Sprout, Wheat, Leaf, Calendar, MapPin, Pencil, Trash2 } from "lucide-react";
import { Cultura } from "@agronexus/shared/types";

interface CropCardProps {
  cultura: Cultura;
  onEdit?: (cultura: Cultura) => void;
  onDelete?: (id: string) => void;
}

export default function CropCard({ cultura, onEdit, onDelete }: CropCardProps) {
  // Escolher ícone baseado no nome
  const getIcon = () => {
    const name = cultura.nome.toLowerCase();
    if (name.includes('milho') || name.includes('trigo')) return <Wheat size={24} />;
    if (name.includes('soja') || name.includes('feijão')) return <Sprout size={24} />;
    return <Leaf size={24} />;
  };

  // Cálculo Automático de Progresso e Status
  const getAutoData = () => {
    if (!cultura.data_plantio || !cultura.data_colheita_prev) {
      return { progresso: 0, statusLabel: cultura.status, color: 'bg-gray-100 text-gray-700' };
    }

    // Se o status for final (colhido ou perdido), respeitamos
    if (cultura.status === 'colhido') return { progresso: 100, statusLabel: 'Colhido', color: 'bg-gray-100 text-gray-700 border-gray-300' };
    if (cultura.status === 'perdido') return { progresso: 0, statusLabel: 'Perdido', color: 'bg-red-100 text-red-700 border-red-200' };

    const inicio = new Date(cultura.data_plantio + 'T12:00:00').getTime();
    const fim = new Date(cultura.data_colheita_prev + 'T12:00:00').getTime();
    const agora = new Date().getTime();

    if (agora < inicio) return { progresso: 0, statusLabel: 'Planejado', color: 'bg-blue-50 text-blue-500' };
    
    const total = fim - inicio;
    const decorrido = agora - inicio;
    let percent = Math.min(Math.round((decorrido / total) * 100), 100);
    if (percent < 0) percent = 0;

    let label = 'Em Crescimento';
    let color = 'bg-agro-green/20 text-agro-green border-agro-green/30';

    if (percent < 15) {
      label = 'Germinação';
      color = 'bg-blue-100 text-blue-700 border-blue-200';
    } else if (percent > 90) {
      label = 'Ponto de Colheita';
      color = 'bg-yellow-100 text-yellow-700 border-yellow-300';
    } else if (percent > 60) {
      label = 'Maturação';
      color = 'bg-green-100 text-green-700 border-green-200';
    }

    return { progresso: percent, statusLabel: label, color };
  };

  const { progresso, statusLabel, color } = getAutoData();

  return (
    <div className="bg-white rounded-2xl p-5 shadow-sm border border-agro-gray relative overflow-hidden group hover:shadow-md transition-shadow">
      
      {/* Action Buttons */}
      <div className="absolute top-4 right-4 flex gap-1.5 z-10">
        {onEdit && (
          <button 
            onClick={(e) => { e.stopPropagation(); onEdit(cultura); }}
            className="p-1.5 text-gray-400 hover:text-agro-blue bg-gray-50 hover:bg-blue-50 rounded-lg opacity-100 sm:opacity-0 group-hover:opacity-100 transition-opacity"
          >
            <Pencil size={14} />
          </button>
        )}
        {onDelete && (
          <button 
            onClick={(e) => { e.stopPropagation(); onDelete(cultura.id); }}
            className="p-1.5 text-gray-400 hover:text-red-500 bg-gray-50 hover:bg-red-50 rounded-lg opacity-100 sm:opacity-0 group-hover:opacity-100 transition-opacity"
          >
            <Trash2 size={14} />
          </button>
        )}
      </div>

      <div className="flex justify-between items-start mb-4 pr-16">
        <div className="flex items-center gap-3">
          <div className="bg-agro-light w-12 h-12 rounded-xl flex items-center justify-center text-agro-blue border border-agro-gray">
            {getIcon()}
          </div>
          <div>
            <h3 className="font-bold text-agro-black text-lg leading-tight">{cultura.nome}</h3>
            <p className="text-sm text-gray-500 font-medium">{cultura.variedade || "Variedade Comum"}</p>
          </div>
        </div>
        <span className={`text-[10px] font-black px-2.5 py-1 rounded-md border uppercase tracking-wider ${color}`}>
          {statusLabel}
        </span>
      </div>

      <div className="space-y-2 mb-4">
        <div className="flex items-center gap-2 text-gray-600">
          <MapPin size={16} className="text-gray-400" />
          <span className="text-sm font-medium">{cultura.area_ha} Hectares</span>
        </div>
        
        <div className="grid grid-cols-1 gap-1 border-t border-gray-50 pt-2 mt-2">
          <div className="flex items-center gap-2 text-gray-500">
            <Calendar size={14} className="text-gray-400" />
            <span className="text-xs font-medium">Plantado: {cultura.data_plantio ? new Date(cultura.data_plantio + 'T12:00:00').toLocaleDateString('pt-BR') : '--'}</span>
          </div>
          <div className="flex items-center gap-2 text-agro-blue">
            <Calendar size={14} className="text-blue-400" />
            <span className="text-xs font-bold">Colheita Prevista: {cultura.data_colheita_prev ? new Date(cultura.data_colheita_prev + 'T12:00:00').toLocaleDateString('pt-BR') : '--'}</span>
          </div>
        </div>
      </div>

      {/* Progress Bar */}
      <div>
        <div className="flex justify-between items-center mb-1.5">
          <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">Desenvolvimento</span>
          <span className="text-xs font-bold text-agro-blue">{progresso}%</span>
        </div>
        <div className="w-full bg-agro-gray rounded-full h-2 overflow-hidden">
          <div 
            className="bg-gradient-to-r from-agro-green to-[#4ade80] h-2 rounded-full transition-all duration-1000 ease-out" 
            style={{ width: `${progresso}%` }}
          ></div>
        </div>
      </div>
    </div>
  );
}
