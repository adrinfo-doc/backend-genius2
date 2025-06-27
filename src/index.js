import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import componentRoutes from './routes/components.js';
import serverless from 'serverless-http';

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json({ limit: '10mb' }));

app.use('/api/components', componentRoutes);

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send('Something broke!');
});

// NÃO USE app.listen()

// Exporte app e handler serverless:
export { app };
export const handler = serverless(app);
