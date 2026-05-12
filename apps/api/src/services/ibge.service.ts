import axios from 'axios';

const IBGE_BASE = 'https://servicodados.ibge.gov.br/api/v1/localidades';

interface MunicipioIBGE {
  id: number;
  nome: string;
  microrregiao: {
    mesorregiao: {
      UF: {
        id: number;
        sigla: string;
        nome: string;
        regiao: { id: number; sigla: string; nome: string };
      };
    };
  };
}

interface Municipio {
  id: number;
  nome: string;
  uf_sigla: string;
  uf_nome: string;
  regiao: string;
}

// Cache em memória — válido por 24h
let cache: { data: Municipio[]; timestamp: number } | null = null;
const CACHE_TTL = 24 * 60 * 60 * 1000; // 24 horas em ms

function mapMunicipio(m: MunicipioIBGE): Municipio {
  const uf = m.microrregiao.mesorregiao.UF;
  return {
    id: m.id,
    nome: m.nome,
    uf_sigla: uf.sigla,
    uf_nome: uf.nome,
    regiao: uf.regiao.nome,
  };
}

export async function getAllMunicipios(): Promise<Municipio[]> {
  // Retorna do cache se válido
  if (cache && Date.now() - cache.timestamp < CACHE_TTL) {
    return cache.data;
  }

  const { data } = await axios.get<MunicipioIBGE[]>(
    `${IBGE_BASE}/municipios?orderBy=nome`
  );

  const municipios = data.map(mapMunicipio);
  cache = { data: municipios, timestamp: Date.now() };
  return municipios;
}

export async function getMunicipiosByUF(uf: string): Promise<Municipio[]> {
  const todos = await getAllMunicipios();
  return todos.filter(m => m.uf_sigla.toLowerCase() === uf.toLowerCase());
}

export async function searchMunicipios(search: string, uf?: string): Promise<Municipio[]> {
  let todos = await getAllMunicipios();
  if (uf) {
    todos = todos.filter(m => m.uf_sigla.toLowerCase() === uf.toLowerCase());
  }
  if (search) {
    const termo = search.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
    todos = todos.filter(m => {
      const nome = m.nome.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
      return nome.includes(termo);
    });
  }
  return todos.slice(0, 50); // máx 50 resultados
}
