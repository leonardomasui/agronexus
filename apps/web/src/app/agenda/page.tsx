"use client";

import Header from "@/components/Header";
import Modal from "@/components/Modal";
import { Plus, Clock, BellRing, Loader2 } from "lucide-react";
import { useState, useEffect, FormEvent } from "react";

interface AgendaItem {
  id: string;
  titulo: string;
  data_evento: string;
  tipo: "evento" | "lembrete";
  descricao?: string;
  concluido?: boolean;
}

export default function AgendaPage() {
  const [eventos, setEventos] = useState<AgendaItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [tipoNovo, setTipoNovo] = useState<"evento" | "lembrete">("evento");

  // Form states
  const [titulo, setTitulo] = useState("");
  const [data, setData] = useState("");
  const [hora, setHora] = useState("");
  const [descricao, setDescricao] = useState("");

  const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:3001";

  const fetchEventos = async () => {
    try {
      const res = await fetch(`${apiUrl}/api/agenda`);
      if (res.ok) {
        const data = await res.json();
        setEventos(data);
      }
    } catch (err) {
      console.error("Erro ao buscar agenda:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEventos();
  }, []);

  const handleSave = async (e: FormEvent) => {
    e.preventDefault();
    setSaving(true);

    // Combinar data + hora em um ISO string
    const dataEvento = data && hora
      ? new Date(`${data}T${hora}:00`).toISOString()
      : data
        ? new Date(`${data}T08:00:00`).toISOString()
        : new Date().toISOString();

    try {
      const res = await fetch(`${apiUrl}/api/agenda`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          titulo,
          tipo: tipoNovo,
          data_evento: dataEvento,
          descricao,
        }),
      });

      if (res.ok) {
        setIsModalOpen(false);
        // Limpar form
        setTitulo(""); setData(""); setHora(""); setDescricao("");
        setTipoNovo("evento");
        fetchEventos(); // recarrega a lista
      } else {
        const err = await res.json();
        alert(`Erro ao salvar: ${err.error || "tente novamente"}`);
      }
    } catch (err) {
      console.error("Erro no POST agenda:", err);
      alert("Não foi possível conectar à API. Verifique se ela está rodando.");
    } finally {
      setSaving(false);
    }
  };

  const getEventTimeText = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" });
  };

  return (
    <div className="min-h-screen bg-agro-light relative">
      <Header />

      <div className="px-6 py-6 space-y-6">
        <div className="flex justify-between items-end">
          <div>
            <h2 className="text-xl font-bold text-agro-black">Sua Agenda</h2>
            <p className="text-sm font-medium text-gray-500 mt-1">
              Próximos compromissos
            </p>
          </div>

          <button
            onClick={() => setIsModalOpen(true)}
            className="bg-agro-blue hover:bg-blue-800 text-white p-2 rounded-xl shadow-md transition-colors flex items-center justify-center"
          >
            <Plus size={24} />
          </button>
        </div>

        {/* Lista de Eventos */}
        <div className="space-y-4">
          {loading ? (
            <div className="flex justify-center p-10">
              <Loader2 className="animate-spin text-agro-blue" size={32} />
            </div>
          ) : eventos.length === 0 ? (
            <div className="bg-white p-8 rounded-2xl border border-dashed border-gray-300 text-center text-gray-500">
              <p className="font-medium text-sm">Nenhum compromisso cadastrado.</p>
              <p className="text-xs mt-1 text-gray-400">Clique no + para adicionar o primeiro.</p>
            </div>
          ) : (
            eventos.map((item) => (
              <div key={item.id} className="bg-white rounded-2xl p-4 shadow-sm border border-agro-gray flex gap-4">
                {/* Coluna da Data */}
                <div className="flex flex-col items-center justify-center min-w-[60px] border-r border-gray-100 pr-4">
                  <span className="text-xs font-bold text-gray-400 uppercase">
                    {new Date(item.data_evento).toLocaleDateString("pt-BR", { month: "short" })}
                  </span>
                  <span className="text-2xl font-bold text-agro-black">
                    {new Date(item.data_evento).getDate()}
                  </span>
                </div>

                {/* Conteúdo */}
                <div className="flex-1">
                  <div className="flex justify-between items-start mb-1">
                    <h3 className="font-bold text-agro-black leading-tight pr-2">{item.titulo}</h3>
                    {item.tipo === "lembrete" && (
                      <BellRing size={16} className="text-orange-500 shrink-0" />
                    )}
                  </div>

                  {item.descricao && (
                    <p className="text-xs text-gray-500 font-medium mb-3 line-clamp-2 leading-snug">
                      {item.descricao}
                    </p>
                  )}

                  <div className="flex gap-3 text-xs font-medium text-gray-400">
                    <div className="flex items-center gap-1">
                      <Clock size={12} />
                      <span>{getEventTimeText(item.data_evento)}</span>
                    </div>
                    {item.tipo === "lembrete" ? (
                      <span className="text-orange-600 bg-orange-50 px-2 py-0.5 rounded-md">Lembrete Ativo</span>
                    ) : (
                      <span className="text-agro-blue bg-blue-50 px-2 py-0.5 rounded-md">Evento</span>
                    )}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Spacer for bottom nav */}
        <div className="h-20"></div>
      </div>

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Novo Compromisso"
      >
        <form onSubmit={handleSave} className="space-y-4">
          {/* Seletor Evento / Lembrete */}
          <div className="flex gap-2 p-1 bg-gray-100 rounded-xl mb-2">
            <button
              type="button"
              onClick={() => setTipoNovo("evento")}
              className={`flex-1 py-2 text-sm font-bold rounded-lg transition-colors ${tipoNovo === "evento" ? "bg-white shadow-sm text-agro-black" : "text-gray-500"}`}
            >
              Evento
            </button>
            <button
              type="button"
              onClick={() => setTipoNovo("lembrete")}
              className={`flex-1 py-2 text-sm font-bold rounded-lg transition-colors flex items-center justify-center gap-2 ${tipoNovo === "lembrete" ? "bg-orange-100 shadow-sm text-orange-700" : "text-gray-500"}`}
            >
              <BellRing size={16} /> Lembrete
            </button>
          </div>

          <div>
            <label className="block text-sm font-bold text-gray-700 mb-1">Título</label>
            <input
              required
              value={titulo}
              onChange={(e) => setTitulo(e.target.value)}
              type="text"
              placeholder="Ex: Reunião, Vacina, Manutenção..."
              className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-agro-blue"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-1">Data</label>
              <input
                required
                value={data}
                onChange={(e) => setData(e.target.value)}
                type="date"
                className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-agro-blue"
              />
            </div>
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-1">Horário</label>
              <input
                value={hora}
                onChange={(e) => setHora(e.target.value)}
                type="time"
                className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-agro-blue"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-bold text-gray-700 mb-1">Detalhes (Opcional)</label>
            <textarea
              value={descricao}
              onChange={(e) => setDescricao(e.target.value)}
              placeholder="Local, contatos, materiais necessários..."
              rows={3}
              className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-agro-blue"
            />
          </div>

          {tipoNovo === "lembrete" && (
            <p className="text-xs text-orange-600 bg-orange-50 rounded-xl p-3 flex items-center gap-2">
              <BellRing size={14} />
              Este lembrete aparecerá na tela inicial e na Central de Avisos.
            </p>
          )}

          <button
            type="submit"
            disabled={saving}
            className="w-full bg-agro-blue text-white font-bold rounded-xl py-3 mt-4 hover:bg-blue-800 transition-colors shadow-md disabled:bg-gray-400 flex justify-center items-center"
          >
            {saving ? <Loader2 className="animate-spin mr-2" size={20} /> : "Salvar na Agenda"}
          </button>
        </form>
      </Modal>
    </div>
  );
}



