import { Router, Request, Response } from 'express';
import { searchMunicipios, getMunicipiosByUF } from '../services/ibge.service';

const router = Router();

// GET /api/municipios?search=&uf=
router.get('/', async (req: Request, res: Response) => {
  try {
    const { search, uf } = req.query as { search?: string; uf?: string };
    const municipios = await searchMunicipios(search || '', uf);
    res.json({ total: municipios.length, municipios });
  } catch (err) {
    console.error('Erro IBGE:', err);
    res.status(500).json({ error: 'Erro ao buscar municípios' });
  }
});

// GET /api/municipios/uf/:sigla
router.get('/uf/:sigla', async (req: Request, res: Response) => {
  try {
    const municipios = await getMunicipiosByUF(req.params.sigla);
    res.json({ total: municipios.length, uf: req.params.sigla.toUpperCase(), municipios });
  } catch (err) {
    console.error('Erro IBGE UF:', err);
    res.status(500).json({ error: 'Erro ao buscar municípios por UF' });
  }
});

export default router;
