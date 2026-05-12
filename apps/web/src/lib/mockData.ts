import { Alerta } from "@agronexus/shared/types";

export interface AgendaItem {
  id: string;
  titulo: string;
  data: string; // ISO string para data/hora
  tipo: "evento" | "lembrete";
  descricao?: string;
  concluido?: boolean;
}

// Eventos e Lembretes da Agenda
export const MOCK_AGENDA: AgendaItem[] = [
  {
    id: "ag-1",
    titulo: "Reunião Agrônomo",
    data: new Date(Date.now() + 86400000).toISOString(), // Amanhã
    tipo: "evento",
    descricao: "Discutir análise de solo da área norte.",
  },
  {
    id: "ag-2",
    titulo: "Vencimento Vacina Aftosa",
    data: new Date(Date.now() + 172800000).toISOString(), // Daqui a 2 dias
    tipo: "lembrete",
    descricao: "Comprar doses para 150 cabeças de gado Nelore.",
    concluido: false,
  },
  {
    id: "ag-3",
    titulo: "Manutenção do Trator John Deere",
    data: new Date(Date.now() + 432000000).toISOString(), // Daqui a 5 dias
    tipo: "lembrete",
    descricao: "Troca de óleo e filtros.",
    concluido: false,
  }
];

// Alertas de sistema (Mock) que não vêm da INMET
// Vamos converter os lembretes da agenda em Alertas de Sistema automaticamente
export const getSystemAlerts = (): Alerta[] => {
  const alertasNativos: Alerta[] = [
    {
      id: "sys-1",
      propriedade_id: "prop-1",
      tipo: "praga",
      mensagem: "Risco elevado de Lagarta-do-Cartucho na lavoura de Milho Safrinha devido ao clima seco.",
      severidade: "aviso",
      fonte: "Sistema AgroNexus",
      lido: true,
      created_at: new Date(Date.now() - 86400000).toISOString(),
    },
    {
      id: "sys-2",
      propriedade_id: "prop-1",
      tipo: "irrigacao",
      mensagem: "Economia de água ativada. Umidade do solo da Soja atingiu níveis satisfatórios.",
      severidade: "info",
      fonte: "Sensores IoT",
      lido: true,
      created_at: new Date(Date.now() - 172800000).toISOString(),
    }
  ];

  // Filtra apenas itens da agenda que são "lembrete"
  const alertasAgenda: Alerta[] = MOCK_AGENDA
    .filter(item => item.tipo === "lembrete")
    .map(lembrete => ({
      id: `alert-${lembrete.id}`,
      propriedade_id: "prop-1",
      tipo: "sistema",
      mensagem: `LEMBRETE: ${lembrete.titulo}${lembrete.descricao ? ` - ${lembrete.descricao}` : ''}`,
      severidade: "info",
      fonte: "Agenda",
      lido: lembrete.concluido || false,
      created_at: lembrete.data, // Usa a data do evento para ordenar
    }));

  return [...alertasAgenda, ...alertasNativos];
};
