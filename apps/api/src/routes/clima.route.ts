import { Router, Request, Response } from 'express';
import { getPrevisao, getProjecaoLongPrazo, clearWeatherCache } from '../services/weather.service';
import { getEstacaoMaisProxima, getAlertas } from '../services/inmet.service';
import { calcularImpactos } from '../services/impact.service';
import { supabase } from '../lib/supabase';

const router = Router();

// GET /api/clima/previsao?lat=-15.77&lon=-47.92&periodo=semana
router.get('/previsao', async (req: Request, res: Response) => {
  try {
    const lat = parseFloat(req.query.lat as string);
    const lon = parseFloat(req.query.lon as string);
    const periodo = (req.query.periodo as string) || 'semana';
    const days = parseInt(req.query.days as string);

    if (isNaN(lat) || isNaN(lon)) {
      return res.status(400).json({ error: 'Parâmetros lat e lon são obrigatórios' });
    }

    let weatherData;
    
    // Mapeamento de período para dias de forecast ou projeção
    if (periodo === 'hoje') {
      weatherData = await getPrevisao(lat, lon, 1);
    } else if (periodo === 'quinzena') {
      weatherData = await getPrevisao(lat, lon, 15);
    } else if (periodo === 'semana') {
      weatherData = await getPrevisao(lat, lon, 7);
    } else if (['mes', 'semestre', 'ano'].includes(periodo)) {
      weatherData = await getProjecaoLongPrazo(lat, lon, periodo as any);
    } else {
      // Fallback para days direto se fornecido
      weatherData = await getPrevisao(lat, lon, days || 7);
    }

    // Buscar perfil do produtor para calcular impactos
    const [culturas, animais, estacao] = await Promise.all([
      supabase.from('culturas').select('*'),
      supabase.from('animais').select('*'),
      getEstacaoMaisProxima(lat, lon),
    ]);

    const impactos = calcularImpactos(
      weatherData.dados, 
      culturas.data || [], 
      animais.data || []
    );

    return res.json({
      ...weatherData,
      impactos,
      estacao_inmet: estacao
        ? { codigo: estacao.CD_ESTACAO, nome: estacao.DC_NOME, uf: estacao.SG_ESTADO }
        : null,
      last_updated: new Date().toISOString()
    });
  } catch (err) {
    console.error('Erro previsão:', err);
    return res.status(500).json({ error: 'Erro ao buscar previsão do tempo' });
  }
});

router.post('/cache/clear', (_req: Request, res: Response) => {
  clearWeatherCache();
  return res.json({ ok: true });
});

router.get('/alertas', async (_req: Request, res: Response) => {
  try {
    const xml = await getAlertas();
    res.set('Content-Type', 'application/xml');
    return res.send(xml);
  } catch (err) {
    console.error('Erro alertas INMET:', err);
    return res.status(500).json({ error: 'Erro ao buscar alertas do INMET' });
  }
});

export default router;
