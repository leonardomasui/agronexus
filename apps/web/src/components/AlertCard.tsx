import { AlertTriangle, CloudRain, Bug, Droplets, Info } from "lucide-react";
import { Alerta } from "@agronexus/shared/types";

interface AlertCardProps {
  alerta: Alerta;
}

export default function AlertCard({ alerta }: AlertCardProps) {
  // Determina as cores baseadas na severidade
  const getSeverityStyles = () => {
    switch (alerta.severidade) {
      case 'critico':
        return {
          bg: 'bg-red-50',
          border: 'border-red-200',
          iconBg: 'bg-red-100 text-red-600',
          title: 'text-red-900',
          badge: 'bg-red-600 text-white'
        };
      case 'aviso':
        return {
          bg: 'bg-orange-50',
          border: 'border-orange-200',
          iconBg: 'bg-orange-100 text-orange-600',
          title: 'text-orange-900',
          badge: 'bg-orange-500 text-white'
        };
      case 'info':
      default:
        return {
          bg: 'bg-blue-50',
          border: 'border-blue-200',
          iconBg: 'bg-blue-100 text-blue-600',
          title: 'text-blue-900',
          badge: 'bg-blue-500 text-white'
        };
    }
  };

  // Ícone baseado no tipo de alerta
  const getIcon = () => {
    switch (alerta.tipo) {
      case 'clima': return <CloudRain size={22} />;
      case 'praga': return <Bug size={22} />;
      case 'doenca': return <AlertTriangle size={22} />;
      case 'irrigacao': return <Droplets size={22} />;
      default: return <Info size={22} />;
    }
  };

  const styles = getSeverityStyles();
  const dataFormatada = new Date(alerta.created_at).toLocaleString('pt-BR', {
    day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit'
  });

  return (
    <div className={`${styles.bg} ${styles.border} border rounded-2xl p-4 shadow-sm relative overflow-hidden transition-all opacity-${alerta.lido ? '75' : '100'}`}>
      
      {/* Indicador de Novo */}
      {!alerta.lido && (
        <div className="absolute top-0 right-0 w-12 h-12 overflow-hidden">
          <div className={`${styles.badge} absolute transform rotate-45 text-[10px] font-bold py-1 px-4 right-[-14px] top-[6px] shadow-sm`}>
            NOVO
          </div>
        </div>
      )}

      <div className="flex gap-4">
        {/* Icon */}
        <div className={`${styles.iconBg} shrink-0 w-12 h-12 rounded-full flex items-center justify-center mt-1 border border-white/50 shadow-sm`}>
          {getIcon()}
        </div>

        {/* Content */}
        <div className="flex-1 pr-6">
          <div className="flex justify-between items-start mb-1">
            <h3 className={`font-bold ${styles.title} leading-tight text-base`}>
              {alerta.tipo.charAt(0).toUpperCase() + alerta.tipo.slice(1)}
            </h3>
          </div>
          
          <p className="text-gray-700 text-sm leading-snug mb-3">
            {alerta.mensagem}
          </p>

          <div className="flex justify-between items-center mt-2 pt-3 border-t border-black/5">
            <span className="text-[11px] text-gray-500 font-medium">
              Fonte: {alerta.fonte} • {dataFormatada}
            </span>
            
            <button className={`text-xs font-bold ${styles.title} hover:underline`}>
              {alerta.lido ? "Detalhes" : "Marcar como Lido"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
