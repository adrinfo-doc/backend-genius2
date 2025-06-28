import express from 'express';
import serverless from 'serverless-http';
import router from '../routes/components.js';

const app = express();
app.use(express.json());

// Log geral
app.use((req, res, next) => {
  console.log(`[API][${req.method}] ${req.url}`);
  next();
});

// Tenta capturar qualquer erro do Express
app.use('/', router);

// Middleware de erro final
app.use((err, req, res, next) => {
  console.error('🔥 Erro interno no Express:', err);
  res.status(500).json({ error: 'Erro interno no servidor', details: err.message });
});

export default serverless(app);
