"use client";

import Header from "@/components/Header";
import AnimalCard, { AnimalComRotina } from "@/components/AnimalCard";
import Modal from "@/components/Modal";
import { Plus, Loader2, Calendar, Stethoscope, Info } from "lucide-react";
import { useState, useEffect, FormEvent } from "react";

export default function AnimaisPage() {
  const [animais, setAnimais] = useState<AnimalComRotina[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [saving, setSaving] = useState(false);

  // Undo deletion states
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [undoTimeout, setUndoTimeout] = useState<NodeJS.Timeout | null>(null);

  // Form states
  const [editingId, setEditingId] = useState<string | null>(null);
  const [especie, setEspecie] = useState("gado");
  const [quantidade, setQuantidade] = useState("");
  const [raca, setRaca] = useState("");
  const [observacoes, setObservacoes] = useState("");
  const [dataEntrada, setDataEntrada] = useState("");
  const [ultimaVisitaVet, setUltimaVisitaVet] = useState("");
  const [motivoVisitaVet, setMotivoVisitaVet] = useState("");

  const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:3001';

  const fetchAnimais = async () => {
    try {
      const res = await fetch(`${apiUrl}/api/animais`);
      if (res.ok) {
        const data = await res.json();
        const dataComRotinas = data.map((a: any) => ({ ...a, rotinas: a.rotinas || [] }));
        setAnimais(dataComRotinas);
      }
    } catch (err) {
      console.error("Erro ao buscar animais:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnimais();
  }, []);

  const openNewModal = () => {
    setEditingId(null);
    setEspecie("gado"); setQuantidade(""); setRaca(""); setObservacoes("");
    setDataEntrada(""); setUltimaVisitaVet(""); setMotivoVisitaVet("");
    setIsModalOpen(true);
  };

  const openEditModal = (item: AnimalComRotina) => {
    setEditingId(item.id);
    setEspecie(item.especie);
    setQuantidade(item.quantidade.toString());
    setRaca(item.raca || "");
    setObservacoes(item.observacoes || "");
    setDataEntrada(item.data_entrada || "");
    setUltimaVisitaVet(item.ultima_visita_vet || "");
    setMotivoVisitaVet(item.motivo_visita_vet || "");
    setIsModalOpen(true);
  };

  const handleDelete = (id: string) => {
    setDeletingId(id);
    const timeout = setTimeout(async () => {
      try {
        const res = await fetch(`${apiUrl}/api/animais/${id}`, { method: 'DELETE' });
        if (res.ok) {
          setAnimais(prev => prev.filter(a => a.id !== id));
        }
      } catch (err) {
        console.error("Erro ao excluir animal:", err);
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
      const url = editingId ? `${apiUrl}/api/animais/${editingId}` : `${apiUrl}/api/animais`;

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          especie,
          quantidade: Number(quantidade),
          raca,
          observacoes,
          data_entrada: dataEntrada || null,
          ultima_visita_vet: ultimaVisitaVet || null,
          motivo_visita_vet: motivoVisitaVet || null
        }),
      });

      if (res.ok) {
        setIsModalOpen(false);
        fetchAnimais();
      } else {
        alert("Erro ao salvar lote");
      }
    } catch (err) {
      console.error("Erro ao salvar animal:", err);
    } finally {
      setSaving(false);
    }
  };

  const activeAnimais = animais.filter(a => a.id !== deletingId);
  const totalCabecas = activeAnimais.reduce((acc, curr) => acc + curr.quantidade, 0);

  return (
    <div className="min-h-screen bg-agro-light relative">
      <Header />
      
      <div className="px-6 py-6 space-y-6">
        <div className="flex justify-between items-end">
          <div>
            <h2 className="text-xl font-bold text-agro-black">Meu Rebanho</h2>
            <p className="text-sm font-medium text-gray-500 mt-1">
              Total: <span className="font-bold text-agro-blue">{totalCabecas} cabeças</span>
            </p>
          </div>
          
          <button 
            onClick={openNewModal}
            className="bg-agro-blue hover:bg-blue-800 text-white p-2 rounded-xl shadow-md transition-colors flex items-center justify-center"
          >
            <Plus size={24} />
          </button>
        </div>

        {/* Lista de Animais */}
        <div className="space-y-4">
          {loading ? (
            <div className="flex justify-center p-10">
              <Loader2 className="animate-spin text-agro-blue" size={32} />
            </div>
          ) : activeAnimais.length === 0 ? (
            <div className="bg-white rounded-2xl p-8 text-center border border-agro-gray border-dashed">
              <p className="text-gray-500 font-medium text-sm">Nenhum animal cadastrado.</p>
              <p className="text-gray-400 text-xs mt-1">Adicione seu rebanho clicando no botão acima.</p>
            </div>
          ) : (
            activeAnimais.map((animal) => (
              <AnimalCard key={animal.id} animal={animal} onEdit={openEditModal} onDelete={handleDelete} />
            ))
          )}
        </div>

        {/* Floating Undo Notification */}
        {deletingId && (
          <div className="fixed bottom-24 left-1/2 -translate-x-1/2 w-full max-w-md z-50 px-6 animate-bounce-in">
            <div className="bg-agro-black text-white px-5 py-4 rounded-2xl shadow-2xl flex justify-between items-center">
              <div className="flex items-center gap-3">
                <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
                <span className="text-sm font-medium">Removido com sucesso</span>
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

        <div className="h-20"></div>
      </div>

      <Modal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        title={editingId ? "Editar Lote" : "Novo Lote de Animais"}
      >
        <form onSubmit={handleSave} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-1">Espécie</label>
              <select value={especie} onChange={e => setEspecie(e.target.value)} className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-agro-blue">
                <option value="gado">Gado de Corte</option>
                <option value="leite">Gado de Leite</option>
                <option value="aves">Aves / Galinhas</option>
                <option value="ovinos">Ovinos</option>
                <option value="suinos">Suínos</option>
                <option value="cavalo">Cavalo</option>
                <option value="cachorro">Cachorro</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-1">Quantidade</label>
              <input required value={quantidade} onChange={e => setQuantidade(e.target.value)} type="number" placeholder="Ex: 150" className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-agro-blue" />
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-1">Raça (Opcional)</label>
              <input value={raca} onChange={e => setRaca(e.target.value)} type="text" placeholder="Ex: Nelore, Angus..." className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-agro-blue" />
            </div>
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-1">Data de Entrada</label>
              <input value={dataEntrada} onChange={e => setDataEntrada(e.target.value)} type="date" className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-agro-blue" />
            </div>
          </div>

          <div className="bg-red-50 p-4 rounded-2xl border border-red-100 space-y-3">
            <p className="text-xs font-bold text-red-600 uppercase flex items-center gap-1">
              <Stethoscope size={14} /> Histórico Veterinário
            </p>
            <div className="grid grid-cols-1 gap-3">
              <div>
                <label className="block text-[10px] font-bold text-red-400 uppercase mb-1">Última Visita</label>
                <input value={ultimaVisitaVet} onChange={e => setUltimaVisitaVet(e.target.value)} type="date" className="w-full bg-white border border-red-100 rounded-xl px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-red-200 text-red-800" />
              </div>
              <div>
                <label className="block text-[10px] font-bold text-red-400 uppercase mb-1">Motivo / Diagnóstico</label>
                <textarea value={motivoVisitaVet} onChange={e => setMotivoVisitaVet(e.target.value)} placeholder="Descreva o motivo da consulta..." rows={2} className="w-full bg-white border border-red-100 rounded-xl px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-red-200 text-red-800"></textarea>
              </div>
            </div>
          </div>

          <div>
            <label className="block text-sm font-bold text-gray-700 mb-1">Observações Gerais</label>
            <textarea value={observacoes} onChange={e => setObservacoes(e.target.value)} placeholder="Localização do pasto, finalidade..." rows={2} className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-agro-blue"></textarea>
          </div>
          
          <button 
            type="submit" 
            disabled={saving}
            className="w-full bg-agro-blue text-white font-bold rounded-xl py-3 mt-4 hover:bg-blue-800 transition-colors shadow-md disabled:bg-gray-400 flex justify-center items-center"
          >
            {saving ? <Loader2 className="animate-spin mr-2" size={20} /> : (editingId ? "Atualizar Lote" : "Salvar Lote")}
          </button>
        </form>
      </Modal>
    </div>
  );
}
