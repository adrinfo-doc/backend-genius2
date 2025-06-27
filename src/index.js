import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import componentRoutes from './routes/components.js';

dotenv.config();

const app = express();
const port = process.env.PORT || 3001;

// Middleware
app.use(cors()); // Allow requests from the frontend
app.use(express.json({ limit: '10mb' })); // To parse JSON bodies, increase limit for code strings

// API Routes
app.use('/api/components', componentRoutes);

// Basic error handler
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).send('Something broke!');
});

app.listen(port, () => {
    console.log(`Backend server is running on http://localhost:${port}`);
});
