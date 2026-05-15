// Tipos compartilhados entre frontend e backend

export interface Produtor {
  id: string;
  nome: string;
  cpf_cnpj?: string;
  email?: string;
  telefone?: string;
  created_at: string;
}

export interface Propriedade {
  id: string;
  produtor_id: string;
  nome: string;
  municipio_ibge_id: number;
  municipio_nome: string;
  uf: string;
  latitude?: number;
  longitude?: number;
  area_ha?: number;
  created_at: string;
}

export interface Cultura {
  id: string;
  propriedade_id: string;
  nome: string;
  variedade?: string;
  data_plantio?: string;
  data_colheita_prev?: string;
  area_ha?: number;
  status: 'plantado' | 'crescimento' | 'colheita' | 'colhido' | 'perdido';
  observacoes?: string;
}

export interface RotinaAnimal {
  id: string;
  animal_id: string;
  tarefa: string;
  concluido: boolean;
  created_at: string;
  updated_at?: string;
}

export interface Animal {
  id: string;
  propriedade_id: string;
  especie: string;
  raca?: string;
  quantidade: number;
  data_registro: string;
  data_entrada?: string;
  ultima_visita_vet?: string;
  motivo_visita_vet?: string;
  observacoes?: string;
  historico_vacinal?: { vacina: string; data: string; lote?: string }[];
  custo_acumulado?: number;
  rotinas?: RotinaAnimal[];
  created_at: string;
  updated_at: string;
}

export interface Alerta {
  id: string;
  propriedade_id: string;
  tipo: 'clima' | 'praga' | 'doenca' | 'irrigacao' | 'geral';
  mensagem: string;
  severidade: 'info' | 'aviso' | 'critico';
  fonte: string;
  lido: boolean;
  created_at: string;
}

export interface Municipio {
  id: number;
  nome: string;
  uf_sigla: string;
  uf_nome: string;
  regiao: string;
}

export interface DadosClimaticos {
  data: string;
  precipitacao_mm: number | null;
  prob_chuva_pct?: number | null;
  uv_index?: number | null;
  temp_min_c: number | null;
  temp_max_c: number | null;
  radiacao_solar_wm2: number | null;
  evapotranspiracao_mm: number | null;
  vento_kmh: number | null;
}

export interface PrevisaoResponse {
  latitude: number;
  longitude: number;
  timezone: string;
  current_weather?: {
    temp: number;
    windspeed: number;
    weathercode: number;
    time: string;
  };
  dados: DadosClimaticos[];
  estacao_inmet?: { codigo: string; nome: string; uf: string } | null;
}
