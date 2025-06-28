import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabaseUrl = process.env.SUPABASE_URL;
// IMPORTANT: This should be the SERVICE_ROLE_KEY from your Supabase project settings.
// It's required for backend operations that need to bypass RLS policies.
// The anon key is for frontend, public access.
const supabaseKey = process.env.SUPABASE_SERVICE_KEY;

if (!supabaseUrl || !supabaseKey) {
    throw new Error('Supabase URL and Service Key must be defined in .env file');
}

export const supabase = createClient(supabaseUrl, supabaseKey);
