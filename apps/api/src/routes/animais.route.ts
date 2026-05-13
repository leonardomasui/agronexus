import { Router, Request, Response } from 'express';
import { supabase } from '../lib/supabase';

const router = Router();

// GET /api/animais
router.get('/', async (req: Request, res: Response) => {
  try {
    const { data, error } = await supabase
      .from('animais')
      .select('*, rotinas:rotinas_animais(*)')
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
    const { especie, raca, quantidade, observacoes, data_entrada, ultima_visita_vet, motivo_visita_vet } = req.body;
    
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
        data_entrada: data_entrada || null,
        ultima_visita_vet: ultima_visita_vet || null,
        motivo_visita_vet: motivo_visita_vet || null,
      })
      .select()
      .single();

    if (error) throw error;
    
    // Adicionar rotinas padrão dependendo da espécie
    if (data) {
      const rotinasPadrao = [];
      if (especie === 'gado') {
        rotinasPadrao.push({ animal_id: data.id, tarefa: 'Verificar bebedouros' });
        rotinasPadrao.push({ animal_id: data.id, tarefa: 'Reabastecer sal mineral' });
      } else if (especie === 'aves') {
        rotinasPadrao.push({ animal_id: data.id, tarefa: 'Coleta de ovos' });
        rotinasPadrao.push({ animal_id: data.id, tarefa: 'Abastecer ração' });
      } else {
        rotinasPadrao.push({ animal_id: data.id, tarefa: 'Inspeção geral do lote' });
      }
      
      await supabase.from('rotinas_animais').insert(rotinasPadrao);
    }

    // Retorna o animal criado junto com as rotinas que acabamos de inserir
    const { data: animalComRotinas } = await supabase
      .from('animais')
      .select('*, rotinas:rotinas_animais(*)')
      .eq('id', data.id)
      .single();

    return res.status(201).json(animalComRotinas);
  } catch (err: any) {
    console.error('Erro POST /animais:', err);
    return res.status(500).json({ error: err.message });
  }
});

// PUT /api/animais/rotinas/:id
router.put('/rotinas/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { concluido } = req.body;

    const { data, error } = await supabase
      .from('rotinas_animais')
      .update({ concluido })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return res.json(data);
  } catch (err: any) {
    console.error('Erro PUT /animais/rotinas:', err);
    return res.status(500).json({ error: err.message });
  }
});

// POST /api/animais/rotinas
router.post('/rotinas', async (req: Request, res: Response) => {
  try {
    const { animal_id, tarefa } = req.body;
    
    const { data, error } = await supabase
      .from('rotinas_animais')
      .insert({ animal_id, tarefa })
      .select()
      .single();

    if (error) throw error;
    return res.status(201).json(data);
  } catch (err: any) {
    console.error('Erro POST /animais/rotinas:', err);
    return res.status(500).json({ error: err.message });
  }
});

// DELETE /api/animais/rotinas/:id
router.delete('/rotinas/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    
    const { error } = await supabase
      .from('rotinas_animais')
      .delete()
      .eq('id', id);

    if (error) throw error;
    return res.status(204).send();
  } catch (err: any) {
    console.error('Erro DELETE /animais/rotinas:', err);
    return res.status(500).json({ error: err.message });
  }
});

// PUT /api/animais/:id
router.put('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { especie, raca, quantidade, observacoes, data_entrada, ultima_visita_vet, motivo_visita_vet } = req.body;

    const { data, error } = await supabase
      .from('animais')
      .update({
        especie,
        raca,
        quantidade: Number(quantidade),
        observacoes,
        data_entrada: data_entrada || null,
        ultima_visita_vet: ultima_visita_vet || null,
        motivo_visita_vet: motivo_visita_vet || null,
        updated_at: new Date()
      })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return res.json(data);
  } catch (err: any) {
    console.error('Erro PUT /animais:', err);
    return res.status(500).json({ error: err.message });
  }
});

// DELETE /api/animais/:id
router.delete('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    
    const { error } = await supabase
      .from('animais')
      .delete()
      .eq('id', id);

    if (error) throw error;
    return res.status(204).send();
  } catch (err: any) {
    console.error('Erro DELETE /animais:', err);
    return res.status(500).json({ error: err.message });
  }
});

export default router;
