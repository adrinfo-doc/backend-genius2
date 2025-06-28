import express from 'express';
import cors from 'cors';
import router from './src/routes/components.js'; // ajuste o caminho conforme sua estrutura
import 'dotenv/config';

const app = express();

app.use(cors());
app.use(express.json({ limit: '5mb' }));

app.use('/api/components', router);

app.use((err, req, res, next) => {
  console.error('Erro interno:', err);
  res.status(500).json({ error: 'Erro interno no servidor' });
});

export default app;
