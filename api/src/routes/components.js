import express from 'express';
import { createClient } from '@supabase/supabase-js';

const router = express.Router();

// Verifica as variáveis de ambiente
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_KEY;

if (!supabaseUrl || !supabaseKey) {
  throw new Error('❌ SUPABASE_URL ou SUPABASE_SERVICE_KEY não definidos no ambiente.');
}

const supabase = createClient(supabaseUrl, supabaseKey);

// Função utilitária para log com hora
const log = (...args) => {
  console.log(`[${new Date().toISOString()}]`, ...args);
};

router.post('/', async (req, res) => {
  try {
    log('[Components][POST] Dados recebidos:', req.body);

    const {
      nome = 'sem nome',
      grupo = 'default',
      descricao = '',
      tipo = 'demo',
      tags = [],
      html = '',
      css = '',
      js = '',
      favorito = false
    } = req.body || {};

    const data = { nome, grupo, descricao, tipo, tags, html, css, js, favorito };

    log('[Components][POST] Dados para inserir:', data);

    const { data: inserted, error } = await supabase.from('componentes').insert([data]).select();

    if (error) {
      log('[Supabase][Erro ao inserir]:', JSON.stringify(error, null, 2));
      return res.status(500).json({
        error: 'Erro ao inserir no banco',
        details: error.message || error
      });
    }

    log('[Supabase][Sucesso] ID do novo componente:', inserted?.[0]?.id || 'Desconhecido');

    res.status(201).json({
      message: 'Componente criado com sucesso!',
      id: inserted?.[0]?.id || null
    });

  } catch (err) {
    log('[Components][POST] Erro inesperado:', err);
    res.status(500).json({
      error: 'Erro interno no servidor',
      message: err.message
    });
  }
});

export default router;
