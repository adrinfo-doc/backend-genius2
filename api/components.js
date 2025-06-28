import express from 'express';
import serverless from 'serverless-http';
import router from '../routes/components.js';

const app = express();
app.use(express.json());

app.use((req, res, next) => {
  console.log(`[API][${req.method}] ${req.url}`);
  next();
});

app.use('/', router);

export default serverless(app);
