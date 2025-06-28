console.log('api/components.js carregado');

import express from 'express';
import serverless from 'serverless-http';
import router from './src/routes/components.js'; // Import estático correto
import cors from 'cors';



const app = express();

app.use(cors({
  origin: '*'
}));

// Middlewares padrão
app.use(express.json({ limit: '5mb' }));

// Log básico pra debug
app.use((req, res, next) => {
  console.log(`[API][${req.method}] ${req.url}`);
  next();
});

// Usa o router em "/"
app.use('/', router);

// Middleware de erro (pra capturar 500 com detalhes)
app.use((err, req, res, next) => {
  console.error('🔥 Erro interno no Express:', err);
  res.status(500).json({ error: 'Erro interno no servidor', message: err.message });
});

export default serverless(app);
