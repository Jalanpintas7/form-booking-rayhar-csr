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

// Fungsi untuk mengirim data ke N8n webhook
async function sendToN8n(formData, bookingId, pesertaData) {
	try {
		// Ambil data dari formData
		const nama = formData.get('nama');
		const alamat = formData.get('alamat');
		const bandar = formData.get('bandar');
		const negeri = formData.get('negeri');
		const uuid = bookingId; // Gunakan booking ID sebagai UUID
		const date = new Date().toISOString().split('T')[0]; // Tanggal hari ini
		
		// Hitung total harga dari data yang tersimpan
		let total = 0;
		
		// Ambil data pakej dan tarikh untuk menghitung total
		const pakej = formData.get('pakej');
		const tarikh_berlepas = formData.get('tarikh_berlepas');
		const tarikh_umrah = formData.get('tarikh_umrah');
		const pilih_bilik = formData.get('pilih_bilik');
		const bilangan = parseInt(formData.get('bilangan')) || 0;
		
		if (tarikh_berlepas) {
			// Untuk pakej pelancongan
			const { data: outboundDateData } = await supabase
				.from('outbound_dates')
				.select('price')
				.eq('id', tarikh_berlepas)
				.single();
			
			if (outboundDateData && outboundDateData.price) {
				const basePrice = parseFloat(outboundDateData.price);
				if (!isNaN(basePrice)) {
					const totalParticipants = bilangan + 1; // applicant + additional participants
					total = basePrice * totalParticipants;
				}
			}
		} else if (tarikh_umrah && pilih_bilik) {
			// Untuk pakej umrah
			const { data: umrahDateData } = await supabase
				.from('umrah_dates')
				.select('double, triple, quadruple, quintuple')
				.eq('id', tarikh_umrah)
				.single();
			
			if (umrahDateData) {
				let basePrice = 0;
				switch (pilih_bilik) {
					case 'double':
						basePrice = umrahDateData.double || 0;
						break;
					case 'triple':
						basePrice = umrahDateData.triple || 0;
						break;
					case 'quad':
						basePrice = umrahDateData.quadruple || 0;
						break;
					case 'quintuple':
						basePrice = umrahDateData.quintuple || 0;
						break;
				}
				
				if (basePrice > 0) {
					// Hitung total berdasarkan peserta yang dikenakan bayaran
					let chargedParticipants = 1; // Applicant selalu dikenakan bayaran
					
					// Proses peserta tambahan
					for (let i = 1; i <= bilangan; i++) {
						const kategori = formData.get(`peserta_kategori_${i}`);
						if (kategori === 'cwb' || kategori === '') {
							// Child with bed atau regular participant - dikenakan bayaran
							chargedParticipants++;
						}
						// CNB dan Infant tidak dikenakan bayaran
					}
					
					total = basePrice * chargedParticipants;
				}
			}
		}

		// Siapkan data sesuai format yang diminta
		const n8nData = {
			nama: nama || '',
			alamat: alamat || '',
			bandar: bandar || '',
			negeri: negeri || '',
			uuid: uuid || '',
			date: date,
			total: total.toString()
		};

		// Log data yang akan dikirim ke N8n
		console.log('=== N8N WEBHOOK DATA ===');
		console.log('Data to be sent:', JSON.stringify(n8nData, null, 2));
		console.log('========================');

		// Kirim data ke N8n webhook dengan URL yang benar
		const response = await fetch('https://n8n-ezaj8apw.runner.web.id/webhook/invoice-booking', {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
			},
			body: JSON.stringify(n8nData)
		});

		if (!response.ok) {
			console.error('Error sending data to N8n:', response.status, response.statusText);
			throw new Error(`N8n webhook failed: ${response.status} ${response.statusText}`);
		}

		const responseData = await response.text();
		console.log('N8n webhook response:', responseData);
		console.log('Successfully sent data to N8n webhook');

	} catch (error) {
		console.error('Error sending data to N8n webhook:', error);
		console.error('Error details:', {
			message: error.message,
			stack: error.stack,
			bookingId: bookingId
		});
		// Jangan throw error karena ini tidak boleh mengganggu proses booking utama
		// Hanya log error untuk debugging
	}
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
			.order('name');

		if (umrahSeasonsError) {
			console.error('Error fetching umrah seasons:', umrahSeasonsError);
		}

		// Fetch umrah categories from umrah_dates (distinct categories that have dates)
		const { data: umrahCategories, error: umrahCategoriesError } = await supabase
			.from('umrah_dates')
			.select('umrah_category_id, umrah_categories!inner(id, name)')
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
			.select(`
				*,
				umrah_seasons!inner(id, name),
				umrah_categories!inner(id, name)
			`)
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
			.select('id, name, whatsapp_number, sales_consultant_number')
			.order('sales_consultant_number');

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
				jenis_bilik: null,
				total_price: null
			};

			// Pilihan bilik untuk Umrah (tanpa ubah skema, tambah ke jenis_bilik)
			const pilihBilik = formData.get('pilih_bilik');
			const ROOM_LABELS = {
				single: 'Single',
				double: 'Double',
				triple: 'Triple',
				quad: 'Quad',
				quintuple: 'Quintuple'
			};
			if (maklumat.umrah_date_id) {
				if (!pilihBilik) {
					return fail(400, {
						error: 'Sila pilih bilik untuk pakej Umrah',
						form: maklumat
					});
				}
				const bilikLabel = ROOM_LABELS[String(pilihBilik)] || String(pilihBilik);
				const existingJenisBilik = String(maklumat.jenis_bilik || '').trim();
				maklumat.jenis_bilik = existingJenisBilik
					? `${existingJenisBilik} | ${bilikLabel}`
					: bilikLabel;
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

			// Cek apakah user pernah inquiry sebelum booking
			const { data: userJourney, error: journeyError } = await supabase.rpc('check_if_user_inquired', {
				p_telefon: maklumat.telefon
			});

			if (journeyError) {
				console.error('Error checking user inquiry:', journeyError);
			}

			// Set field tracking untuk user journey
			if (userJourney && userJourney.is_from_inquiry) {
				maklumat.is_from_inquiry = true;
				maklumat.lead_reference_id = userJourney.lead_id;
				
				console.log('=== USER FROM INQUIRY ===');
				console.log('Lead ID:', userJourney.lead_id);
				console.log('Lead Date:', userJourney.lead_date);
				console.log('=========================');
			} else {
				maklumat.is_from_inquiry = false;
				
				console.log('=== DIRECT BOOKING ===');
				console.log('User booking langsung tanpa inquiry');
				console.log('=======================');
			}

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

			// Validate bilangan is a non-negative number (0 is valid - means no additional participants)
			if (typeof maklumat.bilangan !== 'number' || Number.isNaN(maklumat.bilangan) || maklumat.bilangan < 0) {
				console.error('Invalid bilangan:', maklumat.bilangan);
				return fail(400, {
					error: 'Bilangan peserta tambahan tidak boleh negatif',
					form: maklumat
				});
			}
			
			// Log the booking scenario
			if (maklumat.bilangan === 0) {
				console.log('Booking scenario: Single participant (applicant only)');
			} else {
				console.log(`Booking scenario: ${maklumat.bilangan + 1} total participants (1 applicant + ${maklumat.bilangan} additional)`);
			}

			// Calculate total price for outbound packages
			if (maklumat.outbound_date_id) {
				try {
					// Get price from outbound_dates table
					const { data: outboundDateData, error: outboundDateError } = await supabase
						.from('outbound_dates')
						.select('price')
						.eq('id', maklumat.outbound_date_id)
						.single();

					if (outboundDateError) {
						console.error('Error fetching outbound date price:', outboundDateError);
						maklumat.total_price = null;
					} else if (outboundDateData && outboundDateData.price) {
						// Parse price and calculate total
						const basePrice = parseFloat(outboundDateData.price);
						if (!isNaN(basePrice)) {
							// For outbound packages, all participants are charged (including CNB and Infant)
							// because they need transportation seats
							const totalParticipants = maklumat.bilangan + 1; // applicant + additional participants
							maklumat.total_price = basePrice * totalParticipants;
							console.log(`Outbound price calculation: RM ${basePrice} × ${totalParticipants} participants = RM ${maklumat.total_price}`);
						} else {
							console.error('Invalid price format in outbound_dates:', outboundDateData.price);
							maklumat.total_price = null;
						}
					} else {
						console.log('No price found for outbound date, setting total_price to null');
						maklumat.total_price = null;
					}
				} catch (error) {
					console.error('Error calculating total price:', error);
					maklumat.total_price = null;
				}
			}

			// Calculate total price for Umrah packages
			if (maklumat.umrah_date_id) {
				try {
					// Get price from umrah_dates table based on selected room type
					const pilihBilik = formData.get('pilih_bilik');
					
					if (!pilihBilik) {
						console.error('No room type selected for Umrah package');
						maklumat.total_price = null;
					} else {
											const { data: umrahDateData, error: umrahDateError } = await supabase
						.from('umrah_dates')
						.select('double, triple, quadruple, quintuple, low_deck_interior, low_deck_seaview, low_deck_balcony, high_deck_interior, high_deck_seaview, high_deck_balcony')
						.eq('id', maklumat.umrah_date_id)
						.single();

						if (umrahDateError) {
							console.error('Error fetching umrah date price:', umrahDateError);
							maklumat.total_price = null;
						} else if (umrahDateData) {
							// Get price based on selected room type
							let basePrice = null;
							switch (pilihBilik) {
								// Regular room types
								case 'double':
									basePrice = umrahDateData.double;
									break;
								case 'triple':
									basePrice = umrahDateData.triple;
									break;
								case 'quad':
									basePrice = umrahDateData.quadruple;
									break;
								case 'quintuple':
									basePrice = umrahDateData.quintuple;
									break;
								// Cruise cabin types
								case 'low_deck_interior':
									basePrice = umrahDateData.low_deck_interior;
									break;
								case 'low_deck_seaview':
									basePrice = umrahDateData.low_deck_seaview;
									break;
								case 'low_deck_balcony':
									basePrice = umrahDateData.low_deck_balcony;
									break;
								case 'high_deck_interior':
									basePrice = umrahDateData.high_deck_interior;
									break;
								case 'high_deck_seaview':
									basePrice = umrahDateData.high_deck_seaview;
									break;
								case 'high_deck_balcony':
									basePrice = umrahDateData.high_deck_balcony;
									break;
								default:
									console.error('Invalid room type:', pilihBilik);
									basePrice = null;
							}

							if (basePrice && basePrice > 0) {
								// Calculate total price based on participants and their status
								let totalPrice = basePrice; // Start with applicant price
								let chargedParticipants = 1; // Start with applicant (always charged)
								
								// Process additional participants with their radio button status
								for (let i = 1; i <= maklumat.bilangan; i++) {
									const kategori = formData.get(`peserta_kategori_${i}`);
									
									if (kategori === 'cnb' || kategori === 'infant') {
										// Child no bed or Infant - no charge (but still counted as participant)
										// Do nothing, no charge
									} else if (kategori === 'cwb') {
										// Child with bed - charged as full price
										totalPrice += basePrice;
										chargedParticipants++;
									} else {
										// Regular participant (no kategori selected) - charged as full price
										totalPrice += basePrice;
										chargedParticipants++;
									}
								}
								
								maklumat.total_price = totalPrice;
								console.log(`Umrah price calculation: Base price RM ${basePrice} × ${chargedParticipants} charged participants = RM ${totalPrice}`);
							} else {
								console.error('Invalid or zero price for selected room type:', pilihBilik, basePrice);
								maklumat.total_price = null;
							}
						} else {
							console.log('No price data found for umrah date, setting total_price to null');
							maklumat.total_price = null;
						}
					}
				} catch (error) {
					console.error('Error calculating Umrah total price:', error);
					maklumat.total_price = null;
				}
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
			// Catatan: Untuk peserta tambahan (Peserta 2, 3, dst), field No KP adalah opsional
			// Hanya nama yang wajib diisi, No KP boleh dikosongkan
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
				// Process radio button data for kategori (CWB, Infant, CNB)
				match = /^peserta_kategori_(\d+)$/.exec(String(key));
				if (match) {
					const id = match[1];
					const existing = pesertaMap.get(id) || {};
					existing.kategori = String(value || '');
					pesertaMap.set(id, existing);
				}
			}

			const pesertaData = [];
			for (const [id, peserta] of pesertaMap.entries()) {
				// Hanya nama yang wajib, No KP opsional untuk peserta tambahan
				if (!peserta.nama) continue;
				
				const trimmedNamaPeserta = peserta.nama;
				if (!nameOnlyRegex.test(trimmedNamaPeserta)) {
					console.error(`Invalid peserta name at id ${id}:`, peserta.nama);
					return fail(400, {
						error: `Nama Peserta ${id} hanya dibenarkan huruf dan ruang sahaja`,
						form: maklumat
					});
				}
				
				const pesertaRecord = {
					booking_id: bookingId,
					nama: trimmedNamaPeserta,
					nokp: null, // Default null untuk No KP
					cwb: peserta.kategori === 'cwb',
					infant: peserta.kategori === 'infant',
					cnb: peserta.kategori === 'cnb'
				};
				
				// Jika No KP diisi, validasi dan proses
				if (peserta.nokp && peserta.nokp.trim() !== '') {
					const nokpDigits = String(peserta.nokp).replace(/\D/g, '');
					if (nokpDigits.length === 12) {
						// Validasi No KP jika diisi
						const derivedPeserta = parseMalaysianNRIC(nokpDigits);
						if (derivedPeserta && derivedPeserta.birthDate) {
							pesertaRecord.nokp = nokpDigits;
							if (derivedPeserta && typeof derivedPeserta.age === 'number') {
								pesertaRecord.age = derivedPeserta.age;
							}
							if (derivedPeserta && derivedPeserta.gender) {
								pesertaRecord.gender = derivedPeserta.gender;
							}
							if (derivedPeserta && derivedPeserta.birthDate instanceof Date && !isNaN(derivedPeserta.birthDate.getTime())) {
								pesertaRecord.birth_date = derivedPeserta.birthDate.toISOString().slice(0, 10);
							}
						} else {
							console.warn(`Invalid NRIC date for peserta ${id}:`, peserta.nokp);
							// Tidak return error, hanya warning dan lanjutkan tanpa data derived
						}
					} else {
						console.warn(`Invalid NRIC length for peserta ${id}:`, peserta.nokp);
						// Tidak return error, hanya warning dan lanjutkan tanpa data derived
					}
				} else {
					console.log(`Peserta ${id} tidak mengisi No KP (opsional)`);
				}
				
				pesertaData.push(pesertaRecord);
			}
			console.log(`Derived ${pesertaData.length} members with age/gender/birth_date where applicable`);
			
			// Debug: log kategori data processing
			console.log('=== KATEGORI DATA DEBUG ===');
			for (const [id, peserta] of pesertaMap.entries()) {
				console.log(`Peserta ${id}:`, {
					nama: peserta.nama,
					nokp: peserta.nokp,
					kategori: peserta.kategori
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

			// Kirim data ke N8n webhook setelah data berhasil disimpan
			try {
				await sendToN8n(formData, bookingId, pesertaData);
			} catch (n8nError) {
				console.error('N8n webhook error (non-blocking):', n8nError);
				// Error N8n tidak boleh mengganggu response sukses booking
			}

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
