import { Router, Request, Response } from 'express';
import { getPrevisao, getHistorico } from '../services/weather.service';
import { getEstacaoMaisProxima, getAlertas } from '../services/inmet.service';

const router = Router();

// GET /api/clima/previsao?lat=-15.77&lon=-47.92&days=7
router.get('/previsao', async (req: Request, res: Response) => {
  try {
    const lat = parseFloat(req.query.lat as string);
    const lon = parseFloat(req.query.lon as string);
    const days = parseInt(req.query.days as string) || 7;

    if (isNaN(lat) || isNaN(lon)) {
      return res.status(400).json({ error: 'Parâmetros lat e lon são obrigatórios e devem ser números' });
    }

    const [previsao, estacao] = await Promise.all([
      getPrevisao(lat, lon, Math.min(days, 16)),
      getEstacaoMaisProxima(lat, lon),
    ]);

    return res.json({
      ...previsao,
      estacao_inmet: estacao
        ? { codigo: estacao.CD_ESTACAO, nome: estacao.DC_NOME, uf: estacao.SG_ESTADO }
        : null,
    });
  } catch (err) {
    console.error('Erro previsão:', err);
    return res.status(500).json({ error: 'Erro ao buscar previsão do tempo' });
  }
});

// GET /api/clima/historico?lat=-15.77&lon=-47.92&start=2024-01-01&end=2024-01-31
router.get('/historico', async (req: Request, res: Response) => {
  try {
    const lat = parseFloat(req.query.lat as string);
    const lon = parseFloat(req.query.lon as string);
    const start = req.query.start as string;
    const end = req.query.end as string;

    if (isNaN(lat) || isNaN(lon) || !start || !end) {
      return res.status(400).json({ error: 'Parâmetros lat, lon, start e end são obrigatórios' });
    }

    const historico = await getHistorico(lat, lon, start, end);
    return res.json(historico);
  } catch (err) {
    console.error('Erro histórico:', err);
    return res.status(500).json({ error: 'Erro ao buscar dados históricos' });
  }
});

// GET /api/clima/alertas
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

// GET /api/clima/estacoes?lat=-15.77&lon=-47.92
router.get('/estacoes', async (req: Request, res: Response) => {
  try {
    const lat = parseFloat(req.query.lat as string);
    const lon = parseFloat(req.query.lon as string);

    if (isNaN(lat) || isNaN(lon)) {
      return res.status(400).json({ error: 'Parâmetros lat e lon são obrigatórios' });
    }

    const estacao = await getEstacaoMaisProxima(lat, lon);
    return res.json({ estacao });
  } catch (err) {
    console.error('Erro estações:', err);
    return res.status(500).json({ error: 'Erro ao buscar estação INMET' });
  }
});

export default router;
