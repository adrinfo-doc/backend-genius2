import { Router } from 'express';
import { supabase } from '../supabaseClient.js';
import { authMiddleware } from '../middleware/auth.js';

const router = Router();

// Se quiser, pode proteger as rotas ativando o middleware
// router.use(authMiddleware);

const dbRecordToComponent = (record) => {
  let htmlCode = '';
  let language = 'html';

  if (record.js) {
    htmlCode = record.js;
    language = 'p5js';
  } else {
    htmlCode = record.html || '';
    if (record.css) {
      htmlCode = `<style>\n${record.css}\n</style>\n${htmlCode}`;
    }
  }

  return {
    id: record.id,
    title: record.nome,
    htmlCode,
    reasoning: record.descricao,
    type: record.tipo,
    category: record.grupo,
    language,
    source: 'user',
    editable: true,
    tags: record.tags,
  };
};

const componentToDbRecord = (component) => {
  let html = '';
  let css = '';
  let js = '';

  if (component.language === 'p5js') {
    js = component.htmlCode;
  } else {
    const styleMatch = component.htmlCode.match(/<style>([\s\S]*?)<\/style>/);
    css = styleMatch ? styleMatch[1].trim() : '';
    html = component.htmlCode.replace(/<style>[\s\S]*?<\/style>/, '').trim();
  }

  const record = {
    nome: component.title || component.nome,
    grupo: component.category || component.grupo,
    descricao: component.reasoning || component.descricao || '',
    tipo: component.type || component.tipo,
    tags: component.tags || [],
    html,
    css,
    js,
    favorito: component.favorito || false,
  };

  if (component.id) record.id = component.id;

  return record;
};

// GET /api/components
router.get('/', async (req, res, next) => {
  console.log('[Components][GET] Requisição com filtros:', req.query);
  try {
    let query = supabase.from('componentes').select('*').order('criado_em', { ascending: false });

    if (req.query.tags) {
      const tags = req.query.tags.split(',');
      query = query.contains('tags', tags);
    }
    if (req.query.grupo) {
      query = query.eq('grupo', req.query.grupo);
    }
    if (req.query.tipo) {
      query = query.eq('tipo', req.query.tipo);
    }

    const { data, error } = await query;
    if (error) throw error;

    console.log(`[Components][GET] Encontrados ${data.length} componentes.`);
    res.json(data.map(dbRecordToComponent));
  } catch (error) {
    console.error('[Components][GET] Erro:', error);
    next(error);
  }
});

// POST /api/components
router.post('/', async (req, res, next) => {
  console.log('[Components][POST] Criando componente');
  try {
    const componentData = req.body;
    let dbRecord;

    if (componentData.htmlCode) {
      const { id, ...rest } = componentData;
      dbRecord = componentToDbRecord(rest);
    } else {
      dbRecord = {
        nome: componentData.nome,
        grupo: componentData.grupo,
        descricao: componentData.descricao || '',
        tipo: componentData.tipo,
        tags: componentData.tags || [],
        html: componentData.html || '',
        css: componentData.css || '',
        js: componentData.js || '',
        favorito: false,
      };
    }

    const { data, error } = await supabase.from('componentes').insert(dbRecord).select().single();
    if (error) throw error;

    console.log(`[Components][POST] Componente criado com ID: ${data.id}`);
    res.status(201).json(dbRecordToComponent(data));
  } catch (error) {
    console.error('[Components][POST] Erro:', error);
    res.status(500).json({ error: error.message || 'Erro interno' });
  }
});

// PUT /api/components/:id
router.put('/:id', async (req, res, next) => {
  const { id } = req.params;
  console.log(`[Components][PUT] Atualizando componente ID: ${id}`);

  try {
    const dbRecord = componentToDbRecord(req.body);
    const { data, error } = await supabase.from('componentes').update(dbRecord).eq('id', id).select().single();
    if (error) throw error;

    console.log(`[Components][PUT] Componente atualizado ID: ${data.id}`);
    res.json(dbRecordToComponent(data));
  } catch (error) {
    console.error(`[Components][PUT] Erro:`, error);
    next(error);
  }
});

// DELETE /api/components/:id
router.delete('/:id', async (req, res, next) => {
  const { id } = req.params;
  console.log(`[Components][DELETE] Deletando componente ID: ${id}`);

  try {
    const { error } = await supabase.from('componentes').delete().eq('id', id);
    if (error) throw error;

    console.log(`[Components][DELETE] Componente deletado ID: ${id}`);
    res.status(204).send();
  } catch (error) {
    console.error(`[Components][DELETE] Erro:`, error);
    next(error);
  }
});

// GET /api/components/:id/similar (placeholder)
router.get('/:id/similar', (req, res) => {
  const { id } = req.params;
  console.log(`[Components][GET] Similaridade para componente ID: ${id} (não implementado)`);
  res.status(501).json({ message: `Busca por similaridade para componente ${id} não implementada.` });
});

export default router;
