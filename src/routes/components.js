import { Router } from 'express';
import { supabase } from '../supabaseClient.js';
import { authMiddleware } from '../middleware/auth.js';

const router = Router();

// Secure all component routes with the authentication middleware
router.use(authMiddleware);

// Data transformation helpers
const dbRecordToComponent = (record) => {
    let htmlCode = '';
    let language = 'html';

    if (record.js) {
        htmlCode = record.js;
        language = 'p5js';
    } else {
        htmlCode = record.html || '';
        if (record.css) {
            htmlCode = `<style>\\n${record.css}\\n</style>\\n${htmlCode}`;
        }
    }

    return {
        id: record.id,
        title: record.nome,
        htmlCode: htmlCode,
        reasoning: record.descricao,
        type: record.tipo,
        category: record.grupo,
        language,
        source: 'user', // Assuming all DB records are user-editable for now
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
        nome: component.title,
        grupo: component.category,
        descricao: component.reasoning,
        tipo: component.type,
        tags: component.tags || [],
        html,
        css,
        js,
        favorito: component.favorito || false,
    };
    
    // Only include ID for updates, not for inserts
    if (component.id) {
        record.id = component.id;
    }

    return record;
};


// GET /api/components - List all components with optional filters
router.get('/', async (req, res, next) => {
    try {
        let query = supabase.from('componentes').select('*').order('criado_em', { ascending: false });

        // Filtering logic
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

        res.json(data.map(dbRecordToComponent));
    } catch (error) {
        next(error);
    }
});

// POST /api/components - Create a new component
router.post('/', async (req, res, next) => {
    try {
        const componentData = req.body;
        console.warn('[Backend] Received request to create new component.');

        let dbRecord;
        // Case 1: From AI generator or modal editor (has htmlCode)
        if (componentData.htmlCode) {
            console.warn('[Backend] Creating component from htmlCode blob.');
            const { id, ...componentToCreate } = componentData;
            dbRecord = componentToDbRecord(componentToCreate);
        } 
        // Case 2: From new HTML Element creator (has separate fields)
        else {
            console.warn('[Backend] Creating component from separate html/css/js fields.');
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
        
        console.warn('[Backend] Processing component data:', { 
            nome: dbRecord.nome, 
            grupo: dbRecord.grupo, 
            tipo: dbRecord.tipo, 
            tags: dbRecord.tags 
        });
        
        const { data, error } = await supabase
            .from('componentes')
            .insert(dbRecord)
            .select()
            .single();

        if (error) throw error;
        
        console.warn(`[Backend] Component saved successfully with ID: ${data.id}`);
        res.status(201).json(dbRecordToComponent(data));
    } catch (error) {
        console.error('[Backend] Error creating component:', error);
        next(error);
    }
});

// PUT /api/components/:id - Update an existing component
router.put('/:id', async (req, res, next) => {
    try {
        const { id } = req.params;
        const componentData = req.body;
        const dbRecord = componentToDbRecord(componentData);
        
        const { data, error } = await supabase
            .from('componentes')
            .update(dbRecord)
            .eq('id', id)
            .select()
            .single();
            
        if (error) throw error;
        
        res.json(dbRecordToComponent(data));
    } catch (error) {
        next(error);
    }
});

// DELETE /api/components/:id - Delete a component
router.delete('/:id', async (req, res, next) => {
    try {
        const { id } = req.params;
        const { error } = await supabase.from('componentes').delete().match({ id });

        if (error) throw error;
        
        res.status(204).send(); // No content
    } catch (error) {
        next(error);
    }
});

// GET /api/components/:id/similar - (Placeholder)
router.get('/:id/similar', (req, res) => {
    const { id } = req.params;
    res.status(501).json({ message: `Similarity search for component ${id} is not implemented yet.` });
});


export default router;
