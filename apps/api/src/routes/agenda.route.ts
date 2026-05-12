import { Router, Request, Response } from 'express';
import { supabase } from '../lib/supabase';

const router = Router();

// GET /api/agenda
router.get('/', async (req: Request, res: Response) => {
  try {
    const { data, error } = await supabase
      .from('agenda_eventos')
      .select('*')
      .order('data_evento', { ascending: true });

    if (error) throw error;
    return res.json(data);
  } catch (err: any) {
    console.error('Erro GET /agenda:', err);
    return res.status(500).json({ error: err.message });
  }
});

// POST /api/agenda
router.post('/', async (req: Request, res: Response) => {
  try {
    const { titulo, tipo, data_evento, descricao } = req.body;
    
    // Pegar propriedade fake/dev
    let { data: propriedades } = await supabase.from('propriedades').select('id').limit(1);
    let propriedadeId = propriedades?.[0]?.id;

    if (!propriedadeId) {
      return res.status(400).json({ error: "Nenhuma propriedade encontrada no banco para associar." });
    }

    const { data, error } = await supabase
      .from('agenda_eventos')
      .insert({
        propriedade_id: propriedadeId,
        titulo,
        tipo, // 'evento' ou 'lembrete'
        data_evento, // Deve ser ISO String
        descricao,
      })
      .select()
      .single();

    if (error) throw error;
    return res.status(201).json(data);
  } catch (err: any) {
    console.error('Erro POST /agenda:', err);
    return res.status(500).json({ error: err.message });
  }
});

export default router;
