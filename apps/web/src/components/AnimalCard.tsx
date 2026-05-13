"use client";

import { PawPrint, Bird, Activity, Calendar, Info, CheckCircle2, Circle, ChevronDown, ChevronUp, Pencil, Trash2, Plus, Stethoscope, Dog } from "lucide-react";
import { Animal } from "@agronexus/shared/types";
import { useState } from "react";

// Estendendo o tipo para suportar os novos campos
export interface AnimalComRotina extends Animal {
  rotinas?: { id: string; tarefa: string; concluido: boolean }[];
  data_entrada?: string;
  ultima_visita_vet?: string;
  motivo_visita_vet?: string;
}

interface AnimalCardProps {
  animal: AnimalComRotina;
  onEdit?: (animal: AnimalComRotina) => void;
  onDelete?: (id: string) => void;
}

export default function AnimalCard({ animal, onEdit, onDelete }: AnimalCardProps) {
  const [expandido, setExpandido] = useState(false);
  const [modoEdicao, setModoEdicao] = useState(false);
  const [rotinas, setRotinas] = useState(animal.rotinas || []);
  const [novaTarefa, setNovaTarefa] = useState("");

  const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:3001";

  const toggleRotina = async (id: string) => {
    if (modoEdicao) return; 
    const rotinaAlvo = rotinas.find(r => r.id === id);
    if (!rotinaAlvo) return;
    const novoStatus = !rotinaAlvo.concluido;
    setRotinas(prev => prev.map(r => r.id === id ? { ...r, concluido: novoStatus } : r));
    try {
      await fetch(`${apiUrl}/api/animais/rotinas/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ concluido: novoStatus })
      });
    } catch (err) {
      console.error("Erro ao atualizar rotina:", err);
      setRotinas(prev => prev.map(r => r.id === id ? { ...r, concluido: !novoStatus } : r));
    }
  };

  const deletarRotina = async (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    const prevRotinas = [...rotinas];
    setRotinas(prev => prev.filter(r => r.id !== id));
    try {
      await fetch(`${apiUrl}/api/animais/rotinas/${id}`, { method: 'DELETE' });
    } catch (err) {
      console.error("Erro ao deletar rotina:", err);
      setRotinas(prevRotinas);
    }
  };

  const adicionarRotina = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!novaTarefa.trim()) return;
    const tarefaTexto = novaTarefa.trim();
    setNovaTarefa("");
    try {
      const res = await fetch(`${apiUrl}/api/animais/rotinas`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ animal_id: animal.id, tarefa: tarefaTexto })
      });
      if (res.ok) {
        const novaRotina = await res.json();
        setRotinas(prev => [...prev, novaRotina]);
      }
    } catch (err) {
      console.error("Erro ao adicionar rotina:", err);
    }
  };

  const concluidas = rotinas.filter(r => r.concluido).length;
  const totalRotinas = rotinas.length;
  const progresso = totalRotinas > 0 ? Math.round((concluidas / totalRotinas) * 100) : 0;

  const getIcon = () => {
    const especie = animal.especie.toLowerCase();
    if (especie.includes('galinha') || especie.includes('ave')) return <Bird size={24} />;
    if (especie.includes('cachorro') || especie.includes('cão')) return <Dog size={24} />;
    return <PawPrint size={24} />;
  };

  const getColors = () => {
    const especie = animal.especie.toLowerCase();
    if (especie.includes('gado') || especie.includes('bovino')) return { bg: 'bg-orange-50', text: 'text-orange-700', iconBg: 'bg-orange-100 text-orange-600 border-orange-200' };
    if (especie.includes('galinha') || especie.includes('ave')) return { bg: 'bg-yellow-50', text: 'text-yellow-700', iconBg: 'bg-yellow-100 text-yellow-600 border-yellow-200' };
    if (especie.includes('ovelha') || especie.includes('ovino')) return { bg: 'bg-blue-50', text: 'text-blue-700', iconBg: 'bg-blue-100 text-blue-600 border-blue-200' };
    if (especie.includes('cavalo') || especie.includes('equino')) return { bg: 'bg-emerald-50', text: 'text-emerald-700', iconBg: 'bg-emerald-100 text-emerald-600 border-emerald-200' };
    if (especie.includes('cachorro')) return { bg: 'bg-purple-50', text: 'text-purple-700', iconBg: 'bg-purple-100 text-purple-600 border-purple-200' };
    return { bg: 'bg-gray-50', text: 'text-gray-700', iconBg: 'bg-gray-100 text-gray-600 border-gray-200' };
  };

  const colors = getColors();

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-agro-gray overflow-hidden group transition-shadow hover:shadow-md relative">
      
      {/* Botões de Ação */}
      <div className="absolute top-4 right-4 flex gap-1.5 z-20">
        {onEdit && (
          <button 
            onClick={(e) => { e.stopPropagation(); onEdit(animal); }}
            className="p-1.5 text-gray-400 hover:text-agro-blue bg-white/80 hover:bg-blue-50 rounded-lg transition-opacity border border-gray-100 shadow-sm"
          >
            <Pencil size={14} />
          </button>
        )}
        {onDelete && (
          <button 
            onClick={(e) => { e.stopPropagation(); onDelete(animal.id); }}
            className="p-1.5 text-gray-400 hover:text-red-500 bg-white/80 hover:bg-red-50 rounded-lg transition-opacity border border-gray-100 shadow-sm"
          >
            <Trash2 size={14} />
          </button>
        )}
      </div>

      <div className="p-5 relative">
        <div className={`absolute -right-6 -top-6 w-24 h-24 rounded-full opacity-20 blur-xl ${colors.bg}`}></div>

        <div className="flex justify-between items-start mb-4 relative z-10 pr-16">
          <div className="flex items-center gap-3">
            <div className={`${colors.iconBg} w-12 h-12 rounded-xl flex items-center justify-center border`}>
              {getIcon()}
            </div>
            <div>
              <h3 className="font-bold text-agro-black text-lg leading-tight capitalize">{animal.especie}</h3>
              <p className="text-sm text-gray-500 font-medium">{animal.raca || "Raça Comum"}</p>
            </div>
          </div>
          
          <div className="bg-agro-black text-white px-3 py-1.5 rounded-lg flex flex-col items-center shadow-sm">
            <span className="text-[10px] uppercase font-bold text-gray-300">Cabeças</span>
            <span className="text-sm font-bold">{animal.quantidade}</span>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3 relative z-10">
          <div className="flex items-center gap-2 text-gray-600 bg-gray-50 p-2 rounded-lg border border-gray-100">
            <Calendar size={16} className={colors.text} />
            <div>
              <span className="text-[10px] block font-semibold text-gray-400 uppercase">Entrada</span>
              <span className="text-xs font-medium">{animal.data_entrada ? animal.data_entrada.split('-').reverse().join('/') : '--'}</span>
            </div>
          </div>
          
          <div className="flex items-center gap-2 text-gray-600 bg-gray-50 p-2 rounded-lg border border-gray-100">
            <Stethoscope size={16} className="text-red-500" />
            <div>
              <span className="text-[10px] block font-semibold text-gray-400 uppercase">Última Vet</span>
              <span className="text-xs font-medium">{animal.ultima_visita_vet ? animal.ultima_visita_vet.split('-').reverse().join('/') : '--'}</span>
            </div>
          </div>
        </div>

        {animal.motivo_visita_vet && (
          <div className="mt-3 p-2 bg-red-50 rounded-lg border border-red-100">
            <p className="text-[10px] font-bold text-red-600 uppercase flex items-center gap-1">
              <Info size={10} /> Motivo da Visita:
            </p>
            <p className="text-xs text-red-800 line-clamp-1">{animal.motivo_visita_vet}</p>
          </div>
        )}
      </div>

      <div className="border-t border-gray-100 bg-gray-50/50">
        <div className="flex justify-between items-center pr-3">
          <button onClick={() => setExpandido(!expandido)} className="flex-1 px-5 py-3 flex justify-between items-center hover:bg-gray-50 transition-colors">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-gray-600 uppercase tracking-wider">Rotina Diária</span>
              {!modoEdicao && totalRotinas > 0 && (
                <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${progresso === 100 ? 'bg-agro-green text-white' : 'bg-blue-100 text-agro-blue'}`}>
                  {concluidas}/{totalRotinas}
                </span>
              )}
            </div>
            {expandido ? <ChevronUp size={18} className="text-gray-400" /> : <ChevronDown size={18} className="text-gray-400" />}
          </button>
          {expandido && (
            <button onClick={() => setModoEdicao(!modoEdicao)} className={`p-2 rounded-lg transition-colors ${modoEdicao ? 'bg-agro-blue text-white' : 'bg-gray-200 text-gray-600 hover:bg-gray-300'}`}>
              <Pencil size={16} />
            </button>
          )}
        </div>

        <div className={`px-5 overflow-hidden transition-all duration-300 ease-in-out ${expandido ? 'max-h-96 pb-4 opacity-100' : 'max-h-0 opacity-0'}`}>
          {!modoEdicao && totalRotinas > 0 && (
            <div className="w-full bg-gray-200 rounded-full h-1.5 mb-3 overflow-hidden">
              <div className={`h-1.5 rounded-full transition-all duration-500 ${progresso === 100 ? 'bg-agro-green' : 'bg-agro-blue'}`} style={{ width: `${progresso}%` }}></div>
            </div>
          )}
          <div className="space-y-2">
            {rotinas.map((rotina) => (
              <div key={rotina.id} onClick={() => toggleRotina(rotina.id)} className={`flex items-center justify-between p-2 rounded-lg transition-colors ${modoEdicao ? 'bg-white border border-gray-200' : (rotina.concluido ? 'bg-green-50/50 cursor-pointer' : 'hover:bg-gray-100 cursor-pointer')}`}>
                <div className="flex items-center gap-3">
                  {!modoEdicao && (rotina.concluido ? <CheckCircle2 size={20} className="text-agro-green shrink-0" /> : <Circle size={20} className="text-gray-300 shrink-0" />)}
                  {modoEdicao && <Circle size={16} className="text-gray-300 shrink-0" />}
                  <span className={`text-sm font-medium transition-all ${!modoEdicao && rotina.concluido ? 'text-gray-400 line-through' : 'text-agro-black'}`}>{rotina.tarefa}</span>
                </div>
                {modoEdicao && (
                  <button onClick={(e) => deletarRotina(e, rotina.id)} className="p-1.5 text-red-500 hover:bg-red-50 rounded-md transition-colors"><Trash2 size={16} /></button>
                )}
              </div>
            ))}
          </div>
          {modoEdicao && (
            <form onSubmit={adicionarRotina} className="mt-3 flex items-center gap-2">
              <input type="text" value={novaTarefa} onChange={(e) => setNovaTarefa(e.target.value)} placeholder="Ex: Verificar ração..." className="flex-1 bg-white border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-agro-blue/50" />
              <button type="submit" disabled={!novaTarefa.trim()} className="bg-agro-green text-white p-2 rounded-lg disabled:opacity-50 transition-opacity"><Plus size={20} /></button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
