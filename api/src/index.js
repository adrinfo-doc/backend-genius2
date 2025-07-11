import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import componentRoutes from './routes/components.js';
import serverless from 'serverless-http';

dotenv.config();

console.log("🚀 Express app is starting...");

const app = express();

app.use((req, res, next) => {
  console.log(`[LOG] ${req.method} ${req.originalUrl}`);
  next();
});

app.use(cors());
app.use(express.json({ limit: '10mb' }));

app.use('/components', (req, res, next) => {
  console.log(`[LOG] ${req.method} ${req.originalUrl}`);
  next();
});

app.get('/debug', (req, res) => {
  console.log('[DEBUG] /debug foi chamada');
  res.status(200).json({ msg: 'Debug route funcionando' });
});

app.get('/', (req, res) => {
  res.json({ msg: "API raiz funcionando" });
});

app.get('/components/test', (req, res) => {
  res.json({ message: 'Rota /components/test funcionando!' });
});

app.use('/components', componentRoutes);

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send('Something broke!');
});

// NÃO USE app.listen()

// Exporte app e handler serverless:
export { app };
export const handler = serverless(app);
