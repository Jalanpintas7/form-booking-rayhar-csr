import { supabase } from '$lib/server/supabase.js';
import { fail } from '@sveltejs/kit';

function parseMalaysianNRIC(nric) {
	const digits = String(nric || '').replace(/\D/g, '');
	if (digits.length !== 12) return {};

	const yy = Number(digits.slice(0, 2));
	const mm = Number(digits.slice(2, 4));
	const dd = Number(digits.slice(4, 6));
	if (!mm || mm < 1 || mm > 12 || !dd || dd < 1 || dd > 31) return {};

	const now = new Date();
	let fullYear = 2000 + yy;
	let birthDate = new Date(fullYear, mm - 1, dd);
	if (birthDate > now) {
		fullYear = 1900 + yy;
		birthDate = new Date(fullYear, mm - 1, dd);
	}
	if (isNaN(birthDate.getTime())) return {};

	let age = now.getFullYear() - birthDate.getFullYear();
	const m = now.getMonth() - birthDate.getMonth();
	if (m < 0 || (m === 0 && now.getDate() < birthDate.getDate())) {
		age--;
	}

	const lastDigit = Number(digits[11]);
	const gender = Number.isNaN(lastDigit) ? undefined : (lastDigit % 2 === 1 ? 'male' : 'female');

	return { birthDate, age, gender };
}

export async function load() {
	try {
		const today = new Date().toISOString().slice(0, 10);
		// Fetch branches
		const { data: branches, error: branchesError } = await supabase
			.from('branches')
			.select('id, name, state, region')
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

		// Fetch destinations (pelancongan destinations)
		const { data: destinations, error: destinationsError } = await supabase
			.from('destinations')
			.select('id, name')
			.order('name');

		if (destinationsError) {
			console.error('Error fetching destinations:', destinationsError);
		}

		// Fetch pelancongan dates with pricing
		const { data: outboundDates, error: outboundDatesError } = await supabase
			.from('outbound_dates')
			.select('id, start_date, end_date, price, destination_id')
			.order('start_date');

		if (outboundDatesError) {
			console.error('Error fetching pelancongan dates:', outboundDatesError);
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

		// Fetch umrah categories from umrah_dates (distinct categories that have dates)
		const { data: umrahCategories, error: umrahCategoriesError } = await supabase
			.from('umrah_dates')
			.select('umrah_category_id, umrah_categories!inner(id, name)')
			.eq('is_active', true)
			.gte('start_date', today);

		if (umrahCategoriesError) {
			console.error('Error fetching umrah categories:', umrahCategoriesError);
		}

		// Process categories to get unique ones
		let uniqueCategories = [];
		if (umrahCategories) {
			const categoryMap = new Map();
			umrahCategories.forEach(item => {
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
			uniqueCategories = Array.from(categoryMap.values()).sort((a, b) => a.name.localeCompare(b.name));
		}

		// Fetch airlines from umrah_dates (distinct airlines that have dates)
		const { data: airlines, error: airlinesError } = await supabase
			.from('umrah_dates')
			.select('airline_id, airlines!inner(id, name)')
			.eq('is_active', true)
			.gte('start_date', today);

		if (airlinesError) {
			console.error('Error fetching airlines:', airlinesError);
		}

		// Process airlines to get unique ones
		let uniqueAirlines = [];
		if (airlines) {
			const airlineMap = new Map();
			airlines.forEach(item => {
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
			uniqueAirlines = Array.from(airlineMap.values()).sort((a, b) => a.name.localeCompare(b.name));
		}

		// Fetch umrah dates with pricing (filtered by current date)
		const { data: umrahDates, error: umrahDatesError } = await supabase
			.from('umrah_dates')
			.select('*')
			.gte('start_date', today)
			.order('start_date');

		if (umrahDatesError) {
			console.error('Error fetching umrah dates:', umrahDatesError);
		}

		// Debug: log data untuk troubleshooting
		console.log('=== SERVER DEBUG ===');
		console.log('Fetched pelancongan dates:', JSON.stringify(outboundDates, null, 2));
		console.log('Fetched destinations:', JSON.stringify(destinations, null, 2));
		console.log('Fetched umrah seasons:', JSON.stringify(umrahSeasons, null, 2));
		console.log('Fetched umrah categories from umrah_dates:', JSON.stringify(uniqueCategories, null, 2));
		console.log('Fetched airlines from umrah_dates:', JSON.stringify(uniqueAirlines, null, 2));
		console.log('Fetched umrah dates:', JSON.stringify(umrahDates, null, 2));
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
			umrahCategories: uniqueCategories || [],
			airlines: uniqueAirlines || [],
			umrahDates: umrahDates || [],
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
			airlines: [],
			umrahDates: [],
			consultants: []
		};
	}
}

export const actions = {
	default: async ({ request }) => {
		try {
			const formData = await request.formData();
			
			// Debug: log all form data entries
			console.log('=== ALL FORM DATA ENTRIES ===');
			for (const [key, value] of formData.entries()) {
				console.log(`${key}: ${value}`);
			}
			console.log('=============================');
			
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
				airline_id: formData.get('airline'),
				umrah_date_id: formData.get('tarikh_umrah'),
				consultant_id: formData.get('konsultan'),
				package_id: formData.get('pakej'),
				bilangan: parseInt(formData.get('bilangan')) || 0,
				perlu_partner_bilik: formData.get('perlu_partner_bilik') === 'on',
				catatan: formData.get('catatan')
			};

			// Pilihan bilik untuk Umrah (tanpa ubah skema, tambah ke catatan)
			const pilihBilik = formData.get('pilih_bilik');
			const ROOM_LABELS = {
				single: 'Bilik Single',
				double: 'Bilik Double/Twin',
				triple: 'Bilik Triple',
				quad: 'Bilik Quad'
			};
			if (maklumat.umrah_date_id) {
				if (!pilihBilik) {
					return fail(400, {
						error: 'Sila pilih bilik untuk pakej Umrah',
						form: maklumat
					});
				}
				const bilikLabel = ROOM_LABELS[String(pilihBilik)] || String(pilihBilik);
				const existingCatatan = String(maklumat.catatan || '').trim();
				maklumat.catatan = existingCatatan
					? `${existingCatatan} | Jenis Bilik: ${bilikLabel}`
					: `Jenis Bilik: ${bilikLabel}`;
			}

			// Normalise and derive from applicant NRIC
			const nokpDigitsApplicant = String(maklumat.nokp || '').replace(/\D/g, '');
			if (nokpDigitsApplicant.length !== 12) {
				console.error('Invalid NRIC length for applicant:', maklumat.nokp);
				return fail(400, { error: 'No K/P mesti 12 digit', form: maklumat });
			}
			maklumat.nokp = nokpDigitsApplicant;
			const derivedApplicant = parseMalaysianNRIC(maklumat.nokp);
			if (!derivedApplicant || !derivedApplicant.birthDate) {
				console.error('Invalid NRIC date for applicant:', maklumat.nokp);
				return fail(400, { error: 'Tarikh lahir dalam No K/P tidak sah', form: maklumat });
			}
			if (derivedApplicant && typeof derivedApplicant.age === 'number') {
				maklumat.age = derivedApplicant.age;
			}
			if (derivedApplicant && derivedApplicant.gender) {
				maklumat.gender = derivedApplicant.gender;
			}
			if (derivedApplicant && derivedApplicant.birthDate instanceof Date && !isNaN(derivedApplicant.birthDate.getTime())) {
				maklumat.birth_date = derivedApplicant.birthDate.toISOString().slice(0, 10);
			}
			console.log('Derived applicant:', { age: maklumat.age, gender: maklumat.gender, birth_date: maklumat.birth_date });

			// Debug: log data yang akan disimpan
			console.log('=== SAVING DATA ===');
			console.log('Form Data:', maklumat);
			console.log('==================');

			// Validate required fields (validate negeri/bandar after postcode fallback)
			const requiredFields = ['gelaran', 'nama', 'nokp', 'telefon', 'email', 'alamat', 'poskod'];
			for (const field of requiredFields) {
				if (!maklumat[field]) {
					console.error(`Missing required field: ${field}`);
					return fail(400, {
						error: `Field ${field} is required`,
						form: maklumat
					});
				}
			}

			// Validate name contains only letters and spaces (disallow numbers)
			const nameOnlyRegex = /^[\p{L}\s]+$/u;
			const trimmedNama = String(maklumat.nama || '').trim();
			if (!nameOnlyRegex.test(trimmedNama)) {
				console.error('Invalid nama value (letters/spaces only):', maklumat.nama);
				return fail(400, {
					error: 'Nama hanya dibenarkan huruf dan ruang sahaja',
					form: maklumat
				});
			}
			// Gunakan nilai nama yang sudah di-trim untuk disimpan
			maklumat.nama = trimmedNama;

			// Validate poskod: exactly 5 digits
			const poskodDigits = String(maklumat.poskod || '').replace(/[^0-9]/g, '');
			if (poskodDigits.length !== 5) {
				console.error('Invalid poskod (must be exactly 5 digits):', maklumat.poskod);
				return fail(400, {
					error: 'Poskod mesti mempunyai tepat 5 digit angka',
					form: maklumat
				});
			}
			maklumat.poskod = poskodDigits;

			// Derive negeri/bandar from postcode (always)
			const { data: postcodeRows, error: postcodeError } = await supabase
				.from('postcode')
				.select('bandar, negeri')
				.eq('postcode_number', maklumat.poskod)
				.limit(1000);
			if (postcodeError) {
				console.error('Error fetching postcode info:', postcodeError);
				return fail(500, {
					error: 'Ralat mengambildata poskod. Sila cuba lagi.',
					form: maklumat
				});
			}
			if (!Array.isArray(postcodeRows) || postcodeRows.length === 0) {
				return fail(400, {
					error: 'Poskod tidak dijumpai dalam pangkalan data. Sila semak poskod.',
					form: maklumat
				});
			}
			let derivedNegeri = null;
			const bandarSet = new Set();
			for (const row of postcodeRows) {
				if (!derivedNegeri && row?.negeri) derivedNegeri = row.negeri;
				if (row?.bandar) bandarSet.add(row.bandar);
			}
			if (derivedNegeri) {
				maklumat.negeri = derivedNegeri; // force negeri from DB
			}
			const bandarList = Array.from(bandarSet);
			if (bandarList.length > 0) {
				if (!maklumat.bandar || !bandarList.includes(maklumat.bandar)) {
					maklumat.bandar = bandarList[0];
				}
			}

			// Final validation for negeri & bandar
			if (!maklumat.negeri || !maklumat.bandar) {
				return fail(400, {
					error: 'Tidak berjaya auto-lengkap poskod. Sila pilih negeri & bandar.',
					form: maklumat
				});
			}

			// Validate bilangan is a non-negative number
			if (typeof maklumat.bilangan !== 'number' || Number.isNaN(maklumat.bilangan) || maklumat.bilangan < 0) {
				console.error('Invalid bilangan:', maklumat.bilangan);
				return fail(400, {
					error: 'Bilangan peserta tidak boleh negatif',
					form: maklumat
				});
			}

			// Validate UUID fields if provided
			const uuidFields = ['branch_id', 'destination_id', 'outbound_date_id', 'consultant_id', 'package_id', 'umrah_season_id', 'umrah_category_id', 'airline_id', 'umrah_date_id'];
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

			// Simpan data peserta (robustly parse dynamic ids)
			const pesertaMap = new Map();
			for (const [key, value] of formData.entries()) {
				let match = /^peserta_nama_(\d+)$/.exec(String(key));
				if (match) {
					const id = match[1];
					const existing = pesertaMap.get(id) || {};
					existing.nama = String(value || '').trim();
					pesertaMap.set(id, existing);
					continue;
				}
				match = /^peserta_nokp_(\d+)$/.exec(String(key));
				if (match) {
					const id = match[1];
					const existing = pesertaMap.get(id) || {};
					existing.nokp = String(value || '');
					pesertaMap.set(id, existing);
					continue;
				}
				// Process checkbox data for CWB, Infant, and CNB
				match = /^peserta_cwb_(\d+)$/.exec(String(key));
				if (match) {
					const id = match[1];
					const existing = pesertaMap.get(id) || {};
					existing.cwb = value === 'on';
					pesertaMap.set(id, existing);
					continue;
				}
				match = /^peserta_infant_(\d+)$/.exec(String(key));
				if (match) {
					const id = match[1];
					const existing = pesertaMap.get(id) || {};
					existing.infant = value === 'on';
					pesertaMap.set(id, existing);
					continue;
				}
				match = /^peserta_cnb_(\d+)$/.exec(String(key));
				if (match) {
					const id = match[1];
					const existing = pesertaMap.get(id) || {};
					existing.cnb = value === 'on';
					pesertaMap.set(id, existing);
				}
			}

			const pesertaData = [];
			for (const [id, peserta] of pesertaMap.entries()) {
				if (!peserta.nama || !peserta.nokp) continue;
				const trimmedNamaPeserta = peserta.nama;
				if (!nameOnlyRegex.test(trimmedNamaPeserta)) {
					console.error(`Invalid peserta name at id ${id}:`, peserta.nama);
					return fail(400, {
						error: `Nama Peserta ${id} hanya dibenarkan huruf dan ruang sahaja`,
						form: maklumat
					});
				}
				const nokpDigits = String(peserta.nokp).replace(/\D/g, '');
				if (nokpDigits.length !== 12) {
					console.error(`Invalid NRIC length for peserta ${id}:`, peserta.nokp);
					return fail(400, { error: `No K/P Peserta ${id} mesti 12 digit`, form: maklumat });
				}
				const derivedPeserta = parseMalaysianNRIC(nokpDigits);
				if (!derivedPeserta || !derivedPeserta.birthDate) {
					console.error(`Invalid NRIC date for peserta ${id}:`, peserta.nokp);
					return fail(400, { error: `Tarikh lahir No K/P Peserta ${id} tidak sah`, form: maklumat });
				}
				const pesertaRecord = {
					booking_id: bookingId,
					nama: trimmedNamaPeserta,
					nokp: nokpDigits.length === 12 ? nokpDigits : peserta.nokp,
					cwb: peserta.cwb || false,
					infant: peserta.infant || false,
					cnb: peserta.cnb || false
				};
				if (derivedPeserta && typeof derivedPeserta.age === 'number') {
					pesertaRecord.age = derivedPeserta.age;
				}
				if (derivedPeserta && derivedPeserta.gender) {
					pesertaRecord.gender = derivedPeserta.gender;
				}
				if (derivedPeserta && derivedPeserta.birthDate instanceof Date && !isNaN(derivedPeserta.birthDate.getTime())) {
					pesertaRecord.birth_date = derivedPeserta.birthDate.toISOString().slice(0, 10);
				}
				pesertaData.push(pesertaRecord);
			}
			console.log(`Derived ${pesertaData.length} members with age/gender/birth_date where applicable`);
			
			// Debug: log checkbox data processing
			console.log('=== CHECKBOX DATA DEBUG ===');
			for (const [id, peserta] of pesertaMap.entries()) {
				console.log(`Peserta ${id}:`, {
					nama: peserta.nama,
					nokp: peserta.nokp,
					cwb: peserta.cwb,
					infant: peserta.infant,
					cnb: peserta.cnb
				});
			}
			console.log('==========================');

			// Debug: log final peserta data that will be inserted
			console.log('=== FINAL PESERTA DATA FOR INSERT ===');
			console.log('Peserta Data Array:', JSON.stringify(pesertaData, null, 2));
			console.log('=====================================');

			// Insert data peserta jika ada
			if (pesertaData.length > 0) {
				const { data: insertedPeserta, error: pesertaError } = await supabase
					.from('members_booking')
					.insert(pesertaData)
					.select();

				if (pesertaError) {
					console.error('Error inserting members:', pesertaError);
					console.error('Error details:', pesertaError.details);
					console.error('Error message:', pesertaError.message);
					// Note: Kita tidak rollback booking karena sudah berhasil disimpan
					// Members bisa ditambahkan nanti melalui sistem yang terpisah
				} else {
					console.log('=== SUCCESSFULLY INSERTED PESERTA DATA ===');
					console.log('Inserted peserta data:', JSON.stringify(insertedPeserta, null, 2));
					console.log('===========================================');
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
