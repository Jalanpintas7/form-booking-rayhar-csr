import { createClient } from '@supabase/supabase-js';

// Supabase configuration untuk client-side
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://dummy.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'dummy_key_for_build_testing';

// Only throw error in browser environment, not during build
if (typeof window !== 'undefined' && (!import.meta.env.VITE_SUPABASE_URL || !import.meta.env.VITE_SUPABASE_ANON_KEY)) {
	console.warn('Missing Supabase environment variables. Please check your .env file.');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
	auth: {
		persistSession: false
	}
});

// Helper functions untuk data fetching
export const dataService = {
	supabase, // Export supabase client untuk digunakan di bookingService
	// Fetch branches
	async getBranches() {
		const { data, error } = await supabase
			.from('branches')
			.select('id, name, state, region')
			.order('name');
		
		if (error) {
			console.error('Error fetching branches:', error);
			throw error;
		}
		return data || [];
	},

	// Fetch package types
	async getPackageTypes() {
		const { data, error } = await supabase
			.from('package_types')
			.select('id, name')
			.order('name');
		
		if (error) {
			console.error('Error fetching package types:', error);
			throw error;
		}
		return data || [];
	},

	// Fetch destinations
	async getDestinations() {
		const { data, error } = await supabase
			.from('destinations')
			.select('id, name')
			.order('name');
		
		if (error) {
			console.error('Error fetching destinations:', error);
			throw error;
		}
		return data || [];
	},

	// Fetch outbound dates
	async getOutboundDates() {
		const today = new Date().toISOString().slice(0, 10);
		const { data, error } = await supabase
			.from('outbound_dates')
			.select('id, start_date, end_date, single, double, triple, cwb, cnb, infant, destination_id')
			.gte('start_date', today)
			.order('start_date', { ascending: true });
		
		if (error) {
			console.error('Error fetching outbound dates:', error);
			throw error;
		}
		return data || [];
	},

	// Fetch umrah seasons
	async getUmrahSeasons() {
		const { data, error } = await supabase
			.from('umrah_seasons')
			.select('id, name')
			.order('name');
		
		if (error) {
			console.error('Error fetching umrah seasons:', error);
			throw error;
		}
		return data || [];
	},

	// Fetch umrah categories
	async getUmrahCategories() {
		const today = new Date().toISOString().slice(0, 10);
		const { data, error } = await supabase
			.from('umrah_dates')
			.select('umrah_category_id, umrah_categories!inner(id, name)')
			.gte('start_date', today);
		
		if (error) {
			console.error('Error fetching umrah categories:', error);
			throw error;
		}

		// Process categories to get unique ones
		const categoryMap = new Map();
		data?.forEach(item => {
			if (item.umrah_categories) {
				const category = item.umrah_categories;
				if (!categoryMap.has(category.id)) {
					categoryMap.set(category.id, {
						id: category.id,
						name: category.name
					});
				}
			}
		});
		
		return Array.from(categoryMap.values()).sort((a, b) => a.name.localeCompare(b.name));
	},

	// Fetch airlines
	async getAirlines() {
		const today = new Date().toISOString().slice(0, 10);
		const { data, error } = await supabase
			.from('umrah_dates')
			.select('airline_id, airlines!inner(id, name)')
			.gte('start_date', today);
		
		if (error) {
			console.error('Error fetching airlines:', error);
			throw error;
		}

		// Process airlines to get unique ones
		const airlineMap = new Map();
		data?.forEach(item => {
			if (item.airlines) {
				const airline = item.airlines;
				if (!airlineMap.has(airline.id)) {
					airlineMap.set(airline.id, {
						id: airline.id,
						name: airline.name
					});
				}
			}
		});
		
		return Array.from(airlineMap.values()).sort((a, b) => a.name.localeCompare(b.name));
	},

	// Fetch umrah dates
	async getUmrahDates() {
		const today = new Date().toISOString().slice(0, 10);
		const { data, error } = await supabase
			.from('umrah_dates')
			.select(`
				*,
				umrah_seasons!inner(id, name),
				umrah_categories!inner(id, name)
			`)
			.gte('start_date', today)
			.order('start_date', { ascending: true });
		
		if (error) {
			console.error('Error fetching umrah dates:', error);
			throw error;
		}
		return data || [];
	},

	// Fetch consultants
	async getConsultants() {
		const { data, error } = await supabase
			.from('sales_consultant')
			.select('id, name, whatsapp_number, sales_consultant_number')
			.order('sales_consultant_number');
		
		if (error) {
			console.error('Error fetching consultants:', error);
			throw error;
		}
		return data || [];
	},

	// Fetch postcode data
	async getPostcodeData(postcode) {
		const { data, error } = await supabase
			.from('postcode')
			.select('bandar, negeri')
			.eq('postcode_number', postcode)
			.limit(1000);
		
		if (error) {
			console.error('Error fetching postcode info:', error);
			throw error;
		}
		return data || [];
	},

	// Submit booking
	async submitBooking(bookingData) {
		const { data, error } = await supabase
			.from('bookings')
			.insert([bookingData])
			.select();
		
		if (error) {
			console.error('Error submitting booking:', error);
			throw error;
		}
		return data;
	},

	// Submit members
	async submitMembers(membersData) {
		const { data, error } = await supabase
			.from('members_booking')
			.insert(membersData)
			.select();
		
		if (error) {
			console.error('Error submitting members:', error);
			throw error;
		}
		return data;
	},

	// Check user inquiry
	async checkUserInquiry(telefon) {
		const { data, error } = await supabase.rpc('check_if_user_inquired', {
			p_telefon: telefon
		});
		
		if (error) {
			console.error('Error checking user inquiry:', error);
			throw error;
		}
		return data;
	}
};
