import express from 'express';
import { createClient } from '@supabase/supabase-js';

const router = express.Router();

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

router.post('/', async (req, res) => {
  try {
    console.log('[Components][POST] Dados recebidos:', req.body);

    const data = {
      nome: req.body.nome || 'sem nome',
      grupo: req.body.grupo || 'default',
      descricao: req.body.descricao || '',
      tipo: req.body.tipo || 'demo',
      tags: req.body.tags || [],
      html: req.body.html || '',
      css: req.body.css || '',
      js: req.body.js || '',
      favorito: req.body.favorito || false,
    };

    console.log('[Components][POST] Dados para inserir:', data);

    const { error } = await supabase.from('components').insert([data]);

    if (error) {
      console.error('[Supabase][Erro ao inserir]:', error);
      return res.status(500).json({ error: 'Erro ao inserir no banco', details: error.message });
    }

    res.status(201).json({ message: 'Componente criado com sucesso!' });
  } catch (err) {
    console.error('[Components][POST] Erro:', err);
    res.status(500).json({ error: 'Erro interno no servidor', message: err.message });
  }
});

export default router;
