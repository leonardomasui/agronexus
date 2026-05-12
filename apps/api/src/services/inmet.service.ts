import axios from 'axios';

const INMET_BASE = 'https://apitempo.inmet.gov.br';
const ALERTS_RSS = 'https://apiprevmet3.inmet.gov.br/avisos/rss';

export interface InmetEstacao {
  CD_ESTACAO: string;
  DC_NOME: string;
  SG_ESTADO: string;
  VL_LATITUDE: string;
  VL_LONGITUDE: string;
  VL_ALTITUDE: string;
  TP_ESTACAO: string;
  CD_SITUACAO: string;
  DT_INICIO_OPERACAO: string | null;
}

// Cache de estações — válido por 24h
let cacheEstacoes: { data: InmetEstacao[]; timestamp: number } | null = null;
const CACHE_TTL = 24 * 60 * 60 * 1000;

export async function getAllEstacoes(): Promise<InmetEstacao[]> {
  if (cacheEstacoes && Date.now() - cacheEstacoes.timestamp < CACHE_TTL) {
    return cacheEstacoes.data;
  }
  const { data } = await axios.get<InmetEstacao[]>(`${INMET_BASE}/estacoes/T`);
  const operantes = data.filter(e => e.CD_SITUACAO === 'Operante');
  cacheEstacoes = { data: operantes, timestamp: Date.now() };
  return operantes;
}

// Calcula distância em km entre dois pontos (Haversine)
function distanciaKm(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) * Math.cos((lat2 * Math.PI) / 180) * Math.sin(dLon / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

export async function getEstacaoMaisProxima(
  lat: number,
  lon: number
): Promise<InmetEstacao | null> {
  const estacoes = await getAllEstacoes();
  let mais_proxima: InmetEstacao | null = null;
  let menor_dist = Infinity;

  for (const e of estacoes) {
    const elat = parseFloat(e.VL_LATITUDE);
    const elon = parseFloat(e.VL_LONGITUDE);
    if (isNaN(elat) || isNaN(elon)) continue;
    const dist = distanciaKm(lat, lon, elat, elon);
    if (dist < menor_dist) {
      menor_dist = dist;
      mais_proxima = e;
    }
  }
  return mais_proxima;
}

export async function getAlertas(): Promise<string> {
  const { data } = await axios.get<string>(ALERTS_RSS);
  return data;
}
