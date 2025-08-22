import { json } from '@sveltejs/kit';
import { supabase } from '$lib/server/supabase.js';

export async function GET({ url }) {
	try {
		const raw = url.searchParams.get('poskod') || '';
		const poskod = String(raw).replace(/[^0-9]/g, '').slice(0, 5);
		if (poskod.length !== 5) {
			return json({ error: 'Poskod mesti 5 digit' }, { status: 400 });
		}

		const { data, error } = await supabase
			.from('postcode')
			.select('bandar, negeri')
			.eq('postcode_number', poskod)
			.limit(1000);

		if (error) {
			return json({ error: error.message }, { status: 500 });
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
		return json({ error: 'Unexpected error' }, { status: 500 });
	}
}


