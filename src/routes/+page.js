import { dataService } from '$lib/supabase.js';

export async function load() {
	// Return empty data initially - data will be loaded on client side
	return {
		branches: [],
		packageTypes: [],
		destinations: [],
		outboundDates: [],
		umrahSeasons: [],
		umrahCategories: [],
		airlines: [],
		umrahDates: [],
		consultants: []
	};
}
