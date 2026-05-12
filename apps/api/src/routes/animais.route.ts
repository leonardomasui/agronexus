import { Router, Request, Response } from 'express';
import { supabase } from '../lib/supabase';

const router = Router();

// GET /api/animais
router.get('/', async (req: Request, res: Response) => {
  try {
    const { data, error } = await supabase
      .from('animais')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;
    return res.json(data);
  } catch (err: any) {
    console.error('Erro GET /animais:', err);
    return res.status(500).json({ error: err.message });
  }
});

// POST /api/animais
router.post('/', async (req: Request, res: Response) => {
  try {
    const { especie, raca, quantidade, observacoes } = req.body;
    
    // Pegar propriedade fake/dev
    let { data: propriedades } = await supabase.from('propriedades').select('id').limit(1);
    let propriedadeId = propriedades?.[0]?.id;

    if (!propriedadeId) {
      return res.status(400).json({ error: "Nenhuma propriedade encontrada no banco para associar os animais." });
    }

    const { data, error } = await supabase
      .from('animais')
      .insert({
        propriedade_id: propriedadeId,
        especie,
        raca,
        quantidade: Number(quantidade),
        observacoes,
      })
      .select()
      .single();

    if (error) throw error;
    return res.status(201).json(data);
  } catch (err: any) {
    console.error('Erro POST /animais:', err);
    return res.status(500).json({ error: err.message });
  }
});

export default router;
