import { DadosClimaticos } from './weather.service';
import { Cultura, Animal } from '../../../../packages/shared/types';

export interface ImpactoClimatico {
  id: string;
  tipo: 'cultura' | 'animal';
  target: string;
  nivel: 'favoravel' | 'atencao' | 'critico';
  titulo: string;
  recomendacao: string;
}

export function calcularImpactos(
  clima: DadosClimaticos[],
  culturas: Cultura[],
  animais: Animal[]
): ImpactoClimatico[] {
  const impactos: ImpactoClimatico[] = [];
  const hoje = clima[0];
  if (!hoje) return [];

  // 1. Regras para Culturas
  culturas.forEach(cultura => {
    if (cultura.status === 'colhido' || cultura.status === 'perdido') return;

    // Regra: Geada
    if (hoje.temp_min_c !== null && hoje.temp_min_c <= 3) {
      impactos.push({
        id: `geada-${cultura.id}`,
        tipo: 'cultura',
        target: cultura.nome,
        nivel: 'critico',
        titulo: 'Risco Alto de Geada',
        recomendacao: 'Proteja as mudas ou use irrigação para mitigar a geada nas primeiras horas do dia.'
      });
    }

    // Regra: Estresse Hídrico / Seca
    const chuvaAcumulada7d = clima.slice(0, 7).reduce((acc, curr) => acc + (curr.precipitacao_mm || 0), 0);
    if (chuvaAcumulada7d < 5 && hoje.temp_max_c !== null && hoje.temp_max_c > 32) {
      impactos.push({
        id: `seca-${cultura.id}`,
        tipo: 'cultura',
        target: cultura.nome,
        nivel: 'atencao',
        titulo: 'Estresse Hídrico Detectado',
        recomendacao: 'Aumentar a frequência de irrigação. As plantas estão perdendo água mais rápido do que absorvem.'
      });
    }

    // Regra: Favorável
    if (hoje.precipitacao_mm !== null && hoje.precipitacao_mm > 5 && hoje.precipitacao_mm < 25 && hoje.temp_max_c !== null && hoje.temp_max_c < 30) {
      impactos.push({
        id: `fav-${cultura.id}`,
        tipo: 'cultura',
        target: cultura.nome,
        nivel: 'favoravel',
        titulo: 'Condições Ideais',
        recomendacao: 'Clima favorável para o desenvolvimento vegetativo e absorção de nutrientes.'
      });
    }
  });

  // 2. Regras para Animais
  animais.forEach(animal => {
    // Regra: Estresse Térmico (Simplificado)
    if (hoje.temp_max_c !== null && hoje.temp_max_c > 34) {
      impactos.push({
        id: `calor-${animal.id}`,
        tipo: 'animal',
        target: animal.especie,
        nivel: 'critico',
        titulo: 'Alerta de Estresse Térmico',
        recomendacao: 'Garanta sombra e água fresca abundante. Evite movimentar o rebanho nas horas mais quentes.'
      });
    }

    // Regra: Frio Extremo
    if (hoje.temp_min_c !== null && hoje.temp_min_c < 8) {
      impactos.push({
        id: `frio-${animal.id}`,
        tipo: 'animal',
        target: animal.especie,
        nivel: 'atencao',
        titulo: 'Alerta de Frio Intenso',
        recomendacao: 'Providencie abrigo contra o vento e aumente a oferta calórica da ração.'
      });
    }
  });

  return impactos;
}
