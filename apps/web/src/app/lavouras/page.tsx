"use client";

import Header from "@/components/Header";
import CropCard from "@/components/CropCard";
import Modal from "@/components/Modal";
import { Plus, Loader2 } from "lucide-react";
import { Cultura } from "@agronexus/shared/types";
import { useState, useEffect, FormEvent } from "react";

export default function LavourasPage() {
  const [culturas, setCulturas] = useState<Cultura[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  
  // Undo deletion states
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [undoTimeout, setUndoTimeout] = useState<NodeJS.Timeout | null>(null);

  // Form states
  const [editingId, setEditingId] = useState<string | null>(null);
  const [nome, setNome] = useState("");
  const [variedade, setVariedade] = useState("");
  const [area, setArea] = useState("");
  const [dataPlantio, setDataPlantio] = useState("");
  const [dataColheitaPrev, setDataColheitaPrev] = useState("");
  const [status, setStatus] = useState<string>("plantado");

  const CICLOS_MESES: Record<string, number> = {
    "soja": 4,
    "milho": 5,
    "trigo": 5,
    "feijão": 3,
    "café": 12,
    "cana": 12,
    "cana-de-açúcar": 12,
    "algodão": 6,
    "arroz": 4,
    "mandioca": 12,
    "sorgo": 4,
    "girassol": 4
  };

  useEffect(() => {
    if (nome && dataPlantio) {
      const nomeLimpo = nome.toLowerCase().trim();
      const meses = CICLOS_MESES[nomeLimpo] || 4;
      
      const dataBase = new Date(dataPlantio + 'T12:00:00');
      if (!isNaN(dataBase.getTime())) {
        dataBase.setMonth(dataBase.getMonth() + meses);
        setDataColheitaPrev(dataBase.toISOString().split('T')[0]);
      } else {
        setDataColheitaPrev("");
      }
    } else {
      setDataColheitaPrev("");
    }
  }, [nome, dataPlantio]);

  const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:3001';

  const fetchCulturas = async () => {
    try {
      const res = await fetch(`${apiUrl}/api/culturas`);
      if (res.ok) {
        const data = await res.json();
        setCulturas(data);
      }
    } catch (err) {
      console.error("Erro ao buscar culturas:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCulturas();
  }, []);

  const openNewModal = () => {
    setEditingId(null);
    setNome(""); setVariedade(""); setArea(""); setDataPlantio(""); setDataColheitaPrev(""); setStatus("plantado");
    setIsModalOpen(true);
  };

  const openEditModal = (item: Cultura) => {
    setEditingId(item.id);
    setNome(item.nome);
    setVariedade(item.variedade || "");
    setArea(item.area_ha.toString());
    setDataPlantio(item.data_plantio ? new Date(item.data_plantio + 'T12:00:00').toISOString().split('T')[0] : "");
    setDataColheitaPrev(item.data_colheita_prev ? new Date(item.data_colheita_prev + 'T12:00:00').toISOString().split('T')[0] : "");
    setStatus(item.status);
    setIsModalOpen(true);
  };

  const handleDelete = (id: string) => {
    // Inicia processo de exclusão com delay de 2s
    setDeletingId(id);
    
    const timeout = setTimeout(async () => {
      try {
        const res = await fetch(`${apiUrl}/api/culturas/${id}`, { method: 'DELETE' });
        if (res.ok) {
          setCulturas(prev => prev.filter(c => c.id !== id));
        }
      } catch (err) {
        console.error("Erro ao excluir:", err);
      } finally {
        setDeletingId(null);
        setUndoTimeout(null);
      }
    }, 2000);

    setUndoTimeout(timeout);
  };

  const handleUndo = () => {
    if (undoTimeout) {
      clearTimeout(undoTimeout);
      setUndoTimeout(null);
      setDeletingId(null);
    }
  };

  const handleSave = async (e: FormEvent) => {
    e.preventDefault();
    setSaving(true);

    try {
      const method = editingId ? 'PUT' : 'POST';
      const url = editingId ? `${apiUrl}/api/culturas/${editingId}` : `${apiUrl}/api/culturas`;

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          nome,
          variedade,
          area_ha: Number(area),
          data_plantio: dataPlantio || null,
          data_colheita_prev: dataColheitaPrev || null,
          status
        }),
      });

      if (res.ok) {
        // Se for nova lavoura, criar lembrete automático na agenda
        if (!editingId && dataColheitaPrev) {
          try {
            await fetch(`${apiUrl}/api/agenda`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                titulo: `Colheita: ${nome}`,
                tipo: 'lembrete',
                data_evento: `${dataColheitaPrev}T08:00:00Z`,
                descricao: `Data estimada de colheita para a lavoura de ${nome} (${variedade || 'Variedade Comum'}).`
              }),
            });
          } catch (e) {
            console.error("Erro ao criar lembrete automático", e);
          }
        }

        setIsModalOpen(false);
        fetchCulturas(); 
      } else {
        alert("Erro ao salvar lavoura");
      }
    } catch (err) {
      console.error("Erro no salvar cultura:", err);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-agro-light relative">
      <Header />
      
      <div className="px-6 py-6 space-y-6">
        <div className="flex justify-between items-center">
          <h2 className="text-xl font-bold text-agro-black">Minhas Lavouras</h2>
          <button 
            onClick={openNewModal}
            className="bg-agro-blue hover:bg-blue-800 text-white p-2 rounded-xl shadow-md transition-colors flex items-center justify-center"
          >
            <Plus size={24} />
          </button>
        </div>

        {/* Lista de Culturas */}
        <div className="space-y-4">
          {loading ? (
            <div className="flex justify-center p-10">
              <Loader2 className="animate-spin text-agro-blue" size={32} />
            </div>
          ) : culturas.length === 0 ? (
            <div className="bg-white p-6 rounded-2xl border border-dashed border-gray-300 text-center text-gray-500">
              Nenhuma lavoura cadastrada. Clique no botão + para adicionar.
            </div>
          ) : (
            culturas
              .filter(c => c.id !== deletingId)
              .map((cultura) => (
                <CropCard key={cultura.id} cultura={cultura} onEdit={openEditModal} onDelete={handleDelete} />
              ))
          )}
        </div>

        {/* Floating Undo Notification */}
        {deletingId && (
          <div className="fixed bottom-24 left-1/2 -translate-x-1/2 w-full max-w-md z-50 px-6 animate-bounce-in">
            <div className="bg-agro-black text-white px-5 py-4 rounded-2xl shadow-2xl flex justify-between items-center">
              <div className="flex items-center gap-3">
                <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
                <span className="text-sm font-medium">Lavoura removida</span>
              </div>
              <button 
                onClick={handleUndo}
                className="text-agro-blue font-bold text-sm uppercase tracking-wider hover:text-blue-300 transition-colors"
              >
                Desfazer
              </button>
            </div>
          </div>
        )}

        {/* Spacer for bottom nav */}
        <div className="h-20"></div>
      </div>

      <Modal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        title={editingId ? "Editar Lavoura" : "Nova Lavoura"}
      >
        <form onSubmit={handleSave} className="space-y-4">
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-1">Cultura / Nome</label>
            <input required value={nome} onChange={e => setNome(e.target.value)} type="text" placeholder="Ex: Soja, Milho" className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-agro-blue" />
          </div>
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-1">Variedade</label>
            <input value={variedade} onChange={e => setVariedade(e.target.value)} type="text" placeholder="Ex: Monsoy 8372" className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-agro-blue" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-1">Área (Hectares)</label>
              <input required value={area} onChange={e => setArea(e.target.value)} type="number" step="0.01" placeholder="0.0" className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-agro-blue" />
            </div>
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-1">Data de Plantio</label>
              <input value={dataPlantio} onChange={e => setDataPlantio(e.target.value)} type="date" className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-agro-blue" />
            </div>
          </div>

          <div>
            <label className="block text-sm font-bold text-gray-700 mb-1">Status Final</label>
            <select 
              value={status} 
              onChange={e => setStatus(e.target.value)}
              className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-agro-blue appearance-none"
            >
              <option value="plantado">Automático (Acompanhar Ciclo)</option>
              <option value="colhido">Marcar como Colhido</option>
              <option value="perdido">Marcar como Perdido</option>
            </select>
            <p className="text-[10px] text-gray-400 mt-1 italic">O status de crescimento é calculado automaticamente com base nas datas.</p>
          </div>

          {dataColheitaPrev && (
            <div className="bg-agro-blue/5 p-4 rounded-xl border border-agro-blue/10">
              <p className="text-xs font-bold text-agro-blue uppercase mb-1">Estimativa Inteligente</p>
              <p className="text-sm text-gray-700">
                Data prevista para colheita: <span className="font-bold">{new Date(dataColheitaPrev + 'T12:00:00').toLocaleDateString('pt-BR')}</span>
              </p>
              <p className="text-[10px] text-gray-400 mt-1 italic">*Baseado no ciclo médio para {nome}.</p>
            </div>
          )}
          
          <button 
            type="submit" 
            disabled={saving}
            className="w-full bg-agro-blue text-white font-bold rounded-xl py-3 mt-4 hover:bg-blue-800 transition-colors shadow-md disabled:bg-gray-400 flex justify-center items-center"
          >
            {saving ? <Loader2 className="animate-spin mr-2" size={20} /> : (editingId ? "Atualizar Lavoura" : "Salvar Lavoura")}
          </button>
        </form>
      </Modal>
    </div>
  );
}
