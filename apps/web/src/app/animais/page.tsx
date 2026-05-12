"use client";

import Header from "@/components/Header";
import AnimalCard, { AnimalComRotina } from "@/components/AnimalCard";
import Modal from "@/components/Modal";
import { Plus, Loader2 } from "lucide-react";
import { useState, useEffect, FormEvent } from "react";

export default function AnimaisPage() {
  const [animais, setAnimais] = useState<AnimalComRotina[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [saving, setSaving] = useState(false);

  // Form states
  const [especie, setEspecie] = useState("gado");
  const [quantidade, setQuantidade] = useState("");
  const [raca, setRaca] = useState("");
  const [observacoes, setObservacoes] = useState("");

  const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:3001';

  const fetchAnimais = async () => {
    try {
      const res = await fetch(`${apiUrl}/api/animais`);
      if (res.ok) {
        const data = await res.json();
        // Em um app real, buscaríamos também as rotinas aqui.
        // Como o foco é a tabela de animais por enquanto, mockamos a array vazia
        const dataComRotinas = data.map((a: any) => ({ ...a, rotinas: [] }));
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

  const handleSave = async (e: FormEvent) => {
    e.preventDefault();
    setSaving(true);

    try {
      const res = await fetch(`${apiUrl}/api/animais`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          especie,
          quantidade: Number(quantidade),
          raca,
          observacoes,
        }),
      });

      if (res.ok) {
        setIsModalOpen(false);
        setEspecie("gado"); setQuantidade(""); setRaca(""); setObservacoes("");
        fetchAnimais();
      } else {
        alert("Erro ao salvar lote");
      }
    } catch (err) {
      console.error("Erro no POST:", err);
    } finally {
      setSaving(false);
    }
  };

  const totalCabecas = animais.reduce((acc, curr) => acc + curr.quantidade, 0);

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
            onClick={() => setIsModalOpen(true)}
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
          ) : animais.length === 0 ? (
            <div className="bg-white rounded-2xl p-8 text-center border border-agro-gray border-dashed">
              <p className="text-gray-500 font-medium text-sm">Nenhum animal cadastrado.</p>
              <p className="text-gray-400 text-xs mt-1">Adicione seu rebanho clicando no botão acima.</p>
            </div>
          ) : (
            animais.map((animal) => (
              <AnimalCard key={animal.id} animal={animal} />
            ))
          )}
        </div>

        {/* Spacer for bottom nav */}
        <div className="h-20"></div>
      </div>

      <Modal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        title="Novo Lote de Animais"
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
              </select>
            </div>
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-1">Quantidade</label>
              <input required value={quantidade} onChange={e => setQuantidade(e.target.value)} type="number" placeholder="Ex: 150" className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-agro-blue" />
            </div>
          </div>
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-1">Raça (Opcional)</label>
            <input value={raca} onChange={e => setRaca(e.target.value)} type="text" placeholder="Ex: Nelore, Angus..." className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-agro-blue" />
          </div>
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-1">Observações do Lote</label>
            <textarea value={observacoes} onChange={e => setObservacoes(e.target.value)} placeholder="Localização do pasto, finalidade..." rows={3} className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-agro-blue"></textarea>
          </div>
          
          <button 
            type="submit" 
            disabled={saving}
            className="w-full bg-agro-blue text-white font-bold rounded-xl py-3 mt-4 hover:bg-blue-800 transition-colors shadow-md disabled:bg-gray-400 flex justify-center items-center"
          >
            {saving ? <Loader2 className="animate-spin mr-2" size={20} /> : "Salvar Lote"}
          </button>
        </form>
      </Modal>
    </div>
  );
}
