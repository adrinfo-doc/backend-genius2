import router from '../routes/components.js';

export default async function handler(req, res) {
  try {
    return router(req, res);
  } catch (err) {
    console.error('Error in /api/components:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
}
