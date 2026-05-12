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

  // Form states
  const [nome, setNome] = useState("");
  const [variedade, setVariedade] = useState("");
  const [area, setArea] = useState("");
  const [dataPlantio, setDataPlantio] = useState("");

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

  const handleSave = async (e: FormEvent) => {
    e.preventDefault();
    setSaving(true);

    try {
      const res = await fetch(`${apiUrl}/api/culturas`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          nome,
          variedade,
          area_ha: Number(area),
          data_plantio: dataPlantio || null,
        }),
      });

      if (res.ok) {
        setIsModalOpen(false);
        setNome(""); setVariedade(""); setArea(""); setDataPlantio("");
        fetchCulturas(); // recarrega a lista
      } else {
        alert("Erro ao salvar lavoura");
      }
    } catch (err) {
      console.error("Erro no POST:", err);
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
            onClick={() => setIsModalOpen(true)}
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
            culturas.map((cultura) => (
              <CropCard key={cultura.id} cultura={cultura} />
            ))
          )}
        </div>

        {/* Spacer for bottom nav */}
        <div className="h-20"></div>
      </div>

      <Modal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        title="Nova Lavoura"
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
          
          <button 
            type="submit" 
            disabled={saving}
            className="w-full bg-agro-blue text-white font-bold rounded-xl py-3 mt-4 hover:bg-blue-800 transition-colors shadow-md disabled:bg-gray-400 flex justify-center items-center"
          >
            {saving ? <Loader2 className="animate-spin mr-2" size={20} /> : "Salvar Lavoura"}
          </button>
        </form>
      </Modal>
    </div>
  );
}
