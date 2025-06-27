import { supabase } from '../supabaseClient.js';

export const authMiddleware = async (req, res, next) => {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        console.warn('Auth middleware: Authorization header is missing or invalid.');
        return res.status(401).json({ message: 'Authorization header is missing or invalid.' });
    }

    const token = authHeader.split(' ')[1];
    if (!token) {
        console.warn('Auth middleware: Token is missing from Authorization header.');
        return res.status(401).json({ message: 'Token is missing.' });
    }

    const { data: { user }, error } = await supabase.auth.getUser(token);

    if (error || !user) {
        console.warn('Auth middleware: Invalid token. Unauthorized.', error?.message);
        return res.status(401).json({ message: 'Invalid token. Unauthorized.', error: error?.message });
    }

    // Attach user to the request object for use in other routes
    req.user = user;
    next();
};
