import { supabase } from '$lib/server/supabase.js';
import { fail } from '@sveltejs/kit';

export async function load() {
	try {
		// Fetch branches
		const { data: branches, error: branchesError } = await supabase
			.from('branches')
			.select('id, name, state, region')
			.eq('is_active', true)
			.order('name');

		if (branchesError) {
			console.error('Error fetching branches:', branchesError);
		}

		// Fetch package types
		const { data: packageTypes, error: packageTypesError } = await supabase
			.from('package_types')
			.select('id, name, description')
			.eq('is_active', true)
			.order('name');

		if (packageTypesError) {
			console.error('Error fetching package types:', packageTypesError);
		}

		// Fetch destinations (outbound destinations)
		const { data: destinations, error: destinationsError } = await supabase
			.from('destinations')
			.select('id, name')
			.order('name');

		if (destinationsError) {
			console.error('Error fetching destinations:', destinationsError);
		}

		// Fetch outbound dates with pricing
		const { data: outboundDates, error: outboundDatesError } = await supabase
			.from('outbound_dates')
			.select('id, start_date, end_date, price, destination_id')
			.order('start_date');

		if (outboundDatesError) {
			console.error('Error fetching outbound dates:', outboundDatesError);
		}

		// Fetch umrah seasons
		const { data: umrahSeasons, error: umrahSeasonsError } = await supabase
			.from('umrah_seasons')
			.select('id, name')
			.eq('is_active', true)
			.order('name');

		if (umrahSeasonsError) {
			console.error('Error fetching umrah seasons:', umrahSeasonsError);
		}

		// Fetch umrah categories
		const { data: umrahCategories, error: umrahCategoriesError } = await supabase
			.from('umrah_categories')
			.select('id, name, description, price_range, duration_days')
			.eq('is_active', true)
			.order('name');

		if (umrahCategoriesError) {
			console.error('Error fetching umrah categories:', umrahCategoriesError);
		}

		// Debug: log data untuk troubleshooting
		console.log('=== SERVER DEBUG ===');
		console.log('Fetched outbound dates:', JSON.stringify(outboundDates, null, 2));
		console.log('Fetched destinations:', JSON.stringify(destinations, null, 2));
		console.log('Fetched umrah seasons:', JSON.stringify(umrahSeasons, null, 2));
		console.log('Fetched umrah categories:', JSON.stringify(umrahCategories, null, 2));
		console.log('=====================');

		// Fetch sales consultants for destinations
		const { data: consultants, error: consultantsError } = await supabase
			.from('sales_consultant')
			.select('id, name, whatsapp_number')
			.order('name');

		if (consultantsError) {
			console.error('Error fetching consultants:', consultantsError);
		}

		return {
			branches: branches || [],
			packageTypes: packageTypes || [],
			destinations: destinations || [],
			outboundDates: outboundDates || [],
			umrahSeasons: umrahSeasons || [],
			umrahCategories: umrahCategories || [],
			consultants: consultants || []
		};
	} catch (error) {
		console.error('Error in main page load:', error);
		return {
			branches: [],
			packageTypes: [],
			destinations: [],
			outboundDates: [],
			umrahSeasons: [],
			umrahCategories: [],
			consultants: []
		};
	}
}

export const actions = {
	default: async ({ request }) => {
		try {
			const formData = await request.formData();
			
			const maklumat = {
				gelaran: formData.get('gelaran'),
				nama: formData.get('nama'),
				nokp: formData.get('nokp'),
				telefon: formData.get('telefon'),
				email: formData.get('email'),
				alamat: formData.get('alamat'),
				poskod: formData.get('poskod'),
				negeri: formData.get('negeri'),
				bandar: formData.get('bandar'),
				branch_id: formData.get('cawangan'),
				destination_id: formData.get('destinasi'),
				outbound_date_id: formData.get('tarikh_berlepas'),
				umrah_season_id: formData.get('musim_umrah'),
				umrah_category_id: formData.get('kategori_umrah'),
				consultant_id: formData.get('konsultan'),
				package_id: formData.get('pakej'),
				bilangan: parseInt(formData.get('bilangan')) || 0,
				catatan: formData.get('catatan')
			};

			// Debug: log data yang akan disimpan
			console.log('=== SAVING DATA ===');
			console.log('Form Data:', maklumat);
			console.log('==================');

			// Validate required fields (only validate non-nullable fields)
			const requiredFields = ['gelaran', 'nama', 'nokp', 'telefon', 'email', 'alamat', 'poskod', 'negeri', 'bandar'];
			for (const field of requiredFields) {
				if (!maklumat[field]) {
					console.error(`Missing required field: ${field}`);
					return fail(400, {
						error: `Field ${field} is required`,
						form: maklumat
					});
				}
			}

			// Validate bilangan is a positive number
			if (!maklumat.bilangan || maklumat.bilangan <= 0) {
				console.error('Invalid bilangan:', maklumat.bilangan);
				return fail(400, {
					error: 'Bilangan peserta harus lebih dari 0',
					form: maklumat
				});
			}

			// Validate UUID fields if provided
			const uuidFields = ['branch_id', 'destination_id', 'outbound_date_id', 'consultant_id', 'package_id', 'umrah_season_id', 'umrah_category_id'];
			for (const field of uuidFields) {
				if (maklumat[field] && maklumat[field] === '') {
					maklumat[field] = null; // Convert empty string to null for UUID fields
				}
			}

			// Mulai transaksi database
			const { data: bookingData, error: bookingError } = await supabase
				.from('bookings')
				.insert([maklumat])
				.select();

			if (bookingError) {
				console.error('=== DATABASE ERROR ===');
				console.error('Error inserting booking:', bookingError);
				console.error('Error message:', bookingError.message);
				console.error('Error details:', bookingError.details);
				console.error('Error hint:', bookingError.hint);
				console.error('Error code:', bookingError.code);
				console.error('======================');
				return fail(500, {
					error: `Failed to save data: ${bookingError.message}`,
					form: maklumat
				});
			}

			// Ambil ID booking yang baru dibuat
			const bookingId = bookingData[0].id;

			// Simpan data peserta
			const pesertaData = [];
			for (let i = 1; i <= maklumat.bilangan; i++) {
				const namaPeserta = formData.get(`peserta_nama_${i}`);
				const nokpPeserta = formData.get(`peserta_nokp_${i}`);
				
				if (namaPeserta && nokpPeserta) {
					pesertaData.push({
						booking_id: bookingId,
						nama: namaPeserta,
						nokp: nokpPeserta
					});
				}
			}

			// Insert data peserta jika ada
			if (pesertaData.length > 0) {
				const { error: pesertaError } = await supabase
					.from('members_booking')
					.insert(pesertaData);

				if (pesertaError) {
					console.error('Error inserting members:', pesertaError);
					// Note: Kita tidak rollback booking karena sudah berhasil disimpan
					// Members bisa ditambahkan nanti melalui sistem yang terpisah
				}
			}

			console.log(`Successfully saved booking with ID: ${bookingId}`);
			console.log(`Saved ${pesertaData.length} member records`);

			return {
				success: true,
				message: 'Maklumat berjaya dihantar!'
			};

		} catch (error) {
			console.error('Error in main form submission:', error);
			return fail(500, {
				error: 'Internal server error',
				form: {}
			});
		}
	}
};
