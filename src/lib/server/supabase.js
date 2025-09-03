import { createClient } from '@supabase/supabase-js';

// Supabase configuration untuk server-side (API routes)
const supabaseUrl = process.env.SUPABASE_URL || 'https://lrpsrlmlrgqivfczbzqp.supabase.co';
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxycHNybG1scmdxaXZmY3pienFwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTUyMjAxOTYsImV4cCI6MjA3MDc5NjE5Nn0.6FuahA3i5mZZHjLmOHnZdLn_g09fgfkmL9cPPyuOeJo';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxycHNybG1scmdxaXZmY3pienFwIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NTIyMDE5NiwiZXhwIjoyMDcwNzk2MTk2fQ.ruZkHF3apDEkVhyXL20L-wRueaa7iN7kGDopERi2KBU';

// Validasi konfigurasi
if (!supabaseUrl || !supabaseAnonKey) {
	console.error('Missing Supabase configuration. Please check environment variables.');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
	auth: { persistSession: false }
});

export const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
	auth: { persistSession: false }
});


