import { Router, Request, Response } from 'express';
import { supabase } from '../lib/supabase';

const router = Router();

// POST /api/onboarding
router.post('/', async (req: Request, res: Response) => {
  try {
    const { uuid, municipio, culturas, animais } = req.body;

    if (!uuid || !municipio) {
      return res.status(400).json({ error: 'UUID e Município são obrigatórios' });
    }

    // 1. Upsert no Produtor (usando UUID gerado no front)
    const { data: produtor, error: pError } = await supabase
      .from('produtores')
      .upsert({ 
        id: uuid, 
        nome: 'Produtor AgroNexus', // Nome padrão inicial
        updated_at: new Date()
      })
      .select()
      .single();

    if (pError) throw pError;

    // 2. Upsert na Propriedade
    const { data: propriedade, error: prError } = await supabase
      .from('propriedades')
      .upsert({
        produtor_id: uuid,
        nome: 'Minha Fazenda',
        municipio_ibge_id: municipio.id,
        municipio_nome: municipio.nome,
        uf: municipio.uf,
        itens_culturas: culturas,
        itens_animais: animais,
        updated_at: new Date()
      })
      .select()
      .single();

    if (prError) throw prError;

    return res.status(201).json({ produtor, propriedade });
  } catch (err: any) {
    console.error('Erro sync onboarding:', err);
    return res.status(500).json({ error: err.message });
  }
});

export default router;
