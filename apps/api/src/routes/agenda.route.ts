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

// PUT /api/agenda/:id
router.put('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { titulo, tipo, data_evento, descricao, concluido } = req.body;

    const { data, error } = await supabase
      .from('agenda_eventos')
      .update({
        titulo,
        tipo,
        data_evento,
        descricao,
        concluido,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return res.json(data);
  } catch (err: any) {
    console.error('Erro PUT /agenda:', err);
    return res.status(500).json({ error: err.message });
  }
});

// DELETE /api/agenda/:id
router.delete('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    
    const { error } = await supabase
      .from('agenda_eventos')
      .delete()
      .eq('id', id);

    if (error) throw error;
    return res.status(204).send();
  } catch (err: any) {
    console.error('Erro DELETE /agenda:', err);
    return res.status(500).json({ error: err.message });
  }
});

// PATCH /api/agenda/:id/toggle-concluido
router.patch('/:id/toggle-concluido', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    
    // Primeiro busca o estado atual
    const { data: item } = await supabase
      .from('agenda_eventos')
      .select('concluido')
      .eq('id', id)
      .single();

    if (!item) return res.status(404).json({ error: 'Item não encontrado' });

    const { data, error } = await supabase
      .from('agenda_eventos')
      .update({ concluido: !item.concluido })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return res.json(data);
  } catch (err: any) {
    console.error('Erro PATCH /agenda/toggle:', err);
    return res.status(500).json({ error: err.message });
  }
});

export default router;
