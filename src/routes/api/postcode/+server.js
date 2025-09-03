import { json } from '@sveltejs/kit';
import { createClient } from '@supabase/supabase-js';

export async function GET({ url }) {
	try {
		const raw = url.searchParams.get('poskod') || '';
		const poskod = String(raw).replace(/[^0-9]/g, '').slice(0, 5);
		if (poskod.length !== 5) {
			return json({ error: 'Poskod mesti 5 digit' }, { status: 400 });
		}

		// Fallback configuration untuk deployment
		const supabaseUrl = process.env.SUPABASE_URL || 'https://lrpsrlmlrgqivfczbzqp.supabase.co';
		const supabaseAnonKey = process.env.SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxycHNybG1scmdxaXZmY3pienFwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTUyMjAxOTYsImV4cCI6MjA3MDc5NjE5Nn0.6FuahA3i5mZZHjLmOHnZdLn_g09fgfkmL9cPPyuOeJo';
		
		const supabase = createClient(supabaseUrl, supabaseAnonKey, {
			auth: { persistSession: false }
		});

		const { data, error } = await supabase
			.from('postcode')
			.select('bandar, negeri')
			.eq('postcode_number', poskod)
			.limit(1000);

		if (error) {
			console.error('Supabase error:', error);
			return json({ error: 'Ralat semasa mencari poskod. Sila cuba lagi.' }, { status: 500 });
		}

		const bandarSet = new Set();
		const negeriSet = new Set();
		let negeri = null;
		for (const row of data || []) {
			if (row?.negeri) {
				negeriSet.add(row.negeri);
				if (!negeri) negeri = row.negeri;
			}
			if (row?.bandar) bandarSet.add(row.bandar);
		}

		return json({ poskod, negeri, negeriList: Array.from(negeriSet), bandarList: Array.from(bandarSet) });
	} catch (e) {
		console.error('Unexpected error in postcode API:', e);
		return json({ error: 'Ralat semasa mencari poskod. Sila cuba lagi.' }, { status: 500 });
	}
}


