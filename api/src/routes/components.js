import express from 'express';
import { createClient } from '@supabase/supabase-js';

const router = express.Router();

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_KEY;

if (!supabaseUrl || !supabaseKey) {
  throw new Error('❌ SUPABASE_URL ou SUPABASE_SERVICE_KEY não definidos no ambiente.');
}

const supabase = createClient(supabaseUrl, supabaseKey);

const log = (...args) => {
  console.log(`[${new Date().toISOString()}]`, ...args);
};

// Middleware para validar payload do POST
const validateComponent = (req, res, next) => {
  const { nome, grupo, descricao, tipo, tags, html, css, js, favorito } = req.body || {};

  if (typeof nome !== 'string' || nome.trim() === '') {
    return res.status(400).json({ error: 'O campo "nome" é obrigatório e deve ser uma string.' });
  }

  if (tags && !Array.isArray(tags)) {
    return res.status(400).json({ error: 'O campo "tags" deve ser um array.' });
  }

  next();
};

// GET / - lista todos componentes, com mapeamento e logs detalhados
router.get('/', async (req, res) => {
  try {
    log('[Components][GET] Buscando componentes...');
    const { data, error } = await supabase.from('componentes').select('*');

    if (error) {
      log('[Supabase][Erro ao buscar]:', error);
      return res.status(500).json({ error: 'Erro ao buscar dados no banco', details: error.message || error });
    }

    log(`[Components][GET] Encontrados ${data.length} componentes brutos`);

    const mappedComponents = data.map(record => {
      const htmlLength = (record.html || '').length;
      log(`[Component ${record.id}] html length: ${htmlLength}`);
      return {
        id: record.id,
        title: record.nome || 'Untitled Component',
        htmlCode: record.html || '',
        reasoning: record.descricao || '',
        type: ['block', 'template'].includes(record.tipo) ? record.tipo : 'block',
        category: record.grupo || 'other',
        language: record.language || 'html',
        source: 'user',
        editable: true,
        tags: record.tags || [],
        favorito: record.favorito || false,
      };
    });

    log('[Components][GET] Enviando componentes mapeados para frontend:', JSON.stringify(mappedComponents, null, 2));

    res.status(200).json(mappedComponents);
  } catch (err) {
    log('[Components][GET] Erro inesperado:', err);
    res.status(500).json({ error: 'Erro interno no servidor', message: err.message });
  }
});

// POST / - cria um componente novo com validação e logs detalhados
router.post('/', validateComponent, async (req, res) => {
  try {
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
    } = req.body;

    const data = { nome, grupo, descricao, tipo, tags, html, css, js, favorito };

    log('[Components][POST] Dados para inserir:', data);

    const { data: inserted, error } = await supabase.from('componentes').insert([data]).select();

    if (error) {
      log('[Supabase][Erro ao inserir]:', error);
      return res.status(500).json({ error: 'Erro ao inserir no banco', details: error.message || error });
    }

    log('[Supabase][Sucesso] Novo componente criado:', inserted?.[0]?.id || 'ID desconhecido');

    res.status(201).json({ message: 'Componente criado com sucesso!', id: inserted?.[0]?.id || null });
  } catch (err) {
    log('[Components][POST] Erro inesperado:', err);
    res.status(500).json({ error: 'Erro interno no servidor', message: err.message });
  }
});

export default router;
