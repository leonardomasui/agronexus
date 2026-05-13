import { Router, Request, Response } from 'express';
import { supabase } from '../lib/supabase';

const router = Router();

// GET /api/culturas
router.get('/', async (req: Request, res: Response) => {
  try {
    const { data, error } = await supabase
      .from('culturas')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;
    return res.json(data);
  } catch (err: any) {
    console.error('Erro GET /culturas:', err);
    return res.status(500).json({ error: err.message });
  }
});

// POST /api/culturas
router.post('/', async (req: Request, res: Response) => {
  try {
    const { nome, variedade, area_ha, data_plantio, data_colheita_prev, status } = req.body;
    
    // Como ainda não temos login, usaremos uma propriedade de desenvolvimento
    // Busca a primeira propriedade cadastrada no banco para associar (ou cria uma se não existir)
    let { data: propriedades } = await supabase.from('propriedades').select('id').limit(1);
    let propriedadeId = propriedades?.[0]?.id;

    if (!propriedadeId) {
      // Cria produtor e propriedade fake caso o banco esteja totalmente vazio
      const { data: produtor } = await supabase.from('produtores').insert({ nome: 'Dono Mock' }).select('id').single();
      const { data: novaPropriedade } = await supabase.from('propriedades').insert({
        produtor_id: produtor!.id,
        nome: 'Fazenda Mock',
        municipio_ibge_id: 3550308,
        municipio_nome: 'São Paulo',
        uf: 'SP'
      }).select('id').single();
      propriedadeId = novaPropriedade!.id;
    }

    const { data, error } = await supabase
      .from('culturas')
      .insert({
        propriedade_id: propriedadeId,
        nome,
        variedade,
        area_ha,
        data_plantio,
        data_colheita_prev,
        status: status || 'crescimento'
      })
      .select()
      .single();

    if (error) throw error;
    return res.status(201).json(data);
  } catch (err: any) {
    console.error('Erro POST /culturas:', err);
    return res.status(500).json({ error: err.message });
  }
});

// PUT /api/culturas/:id
router.put('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { nome, variedade, area_ha, data_plantio, data_colheita_prev, status } = req.body;

    const { data, error } = await supabase
      .from('culturas')
      .update({
        nome,
        variedade,
        area_ha,
        data_plantio,
        data_colheita_prev,
        status,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return res.json(data);
  } catch (err: any) {
    console.error('Erro PUT /culturas:', err);
    return res.status(500).json({ error: err.message });
  }
});

// DELETE /api/culturas/:id
router.delete('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    
    const { error } = await supabase
      .from('culturas')
      .delete()
      .eq('id', id);

    if (error) throw error;
    return res.status(204).send();
  } catch (err: any) {
    console.error('Erro DELETE /culturas:', err);
    return res.status(500).json({ error: err.message });
  }
});

export default router;
