import { dataService } from './supabase.js';

// Fungsi untuk menghitung total price pelancongan
export async function calculateOutboundTotalPrice(outboundDateId, roomType, numberOfParticipants, participantCategories) {
	try {
		const { data: outboundDateData, error } = await dataService.supabase
			.from('outbound_dates')
			.select('single, double, triple, cwb, cnb, infant')
			.eq('id', outboundDateId)
			.single();

		if (error) {
			console.error('Error fetching outbound date price:', error);
			return null;
		}

		if (!outboundDateData) {
			console.log('No price data found for outbound date');
			return null;
		}

		// Tentukan harga berdasarkan jenis bilik yang dipilih
		let basePrice = null;
		
		if (roomType === 'single' && outboundDateData.single && outboundDateData.single !== '-' && outboundDateData.single !== '') {
			basePrice = parseFloat(outboundDateData.single);
		} else if (roomType === 'double' && outboundDateData.double && outboundDateData.double !== '-' && outboundDateData.double !== '') {
			basePrice = parseFloat(outboundDateData.double);
		} else if (roomType === 'triple' && outboundDateData.triple && outboundDateData.triple !== '-' && outboundDateData.triple !== '') {
			basePrice = parseFloat(outboundDateData.triple);
		} else {
			// Fallback ke harga yang tersedia jika jenis bilik yang dipilih tidak tersedia
			if (outboundDateData.double && outboundDateData.double !== '-' && outboundDateData.double !== '') {
				basePrice = parseFloat(outboundDateData.double);
			} else if (outboundDateData.triple && outboundDateData.triple !== '-' && outboundDateData.triple !== '') {
				basePrice = parseFloat(outboundDateData.triple);
			} else if (outboundDateData.single && outboundDateData.single !== '-' && outboundDateData.single !== '') {
				basePrice = parseFloat(outboundDateData.single);
			}
		}

		if (!basePrice || isNaN(basePrice)) {
			console.error('No valid price found in outbound_dates:', outboundDateData);
			return null;
		}

		// Mulai perhitungan total price untuk pelancongan
		let totalPrice = 0;
		
		// Pendaftar (peserta pertama) membayar harga bilik normal
		totalPrice += basePrice;
		console.log(`Pendaftar (bilik ${roomType}): RM ${basePrice}`);

		// Hitung harga untuk peserta tambahan berdasarkan kategori
		if (numberOfParticipants > 1) {
			for (let i = 2; i <= numberOfParticipants; i++) {
				const kategori = participantCategories.get(String(i)) || '';
				let participantPrice = 0;

				switch (kategori) {
					case 'cwb':
						// CWB (Child With Bed): harga dari kolom cwb di database
						participantPrice = outboundDateData.cwb && outboundDateData.cwb !== '-' && outboundDateData.cwb !== '' ? parseFloat(outboundDateData.cwb) : basePrice;
						console.log(`Peserta ${i} (CWB): RM ${participantPrice}`);
						break;
					case 'cnb':
						// CNB (Child No Bed): harga dari kolom cnb di database
						participantPrice = outboundDateData.cnb && outboundDateData.cnb !== '-' && outboundDateData.cnb !== '' ? parseFloat(outboundDateData.cnb) : basePrice;
						console.log(`Peserta ${i} (CNB): RM ${participantPrice}`);
						break;
					case 'infant':
						// Infant: harga dari kolom infant di database
						participantPrice = outboundDateData.infant && outboundDateData.infant !== '-' && outboundDateData.infant !== '' ? parseFloat(outboundDateData.infant) : basePrice;
						console.log(`Peserta ${i} (Infant): RM ${participantPrice}`);
						break;
					default:
						// Jika tidak ada kategori yang dipilih, gunakan harga bilik normal
						participantPrice = basePrice;
						console.log(`Peserta ${i} (normal): RM ${participantPrice}`);
				}

				totalPrice += participantPrice;
			}
		}

		console.log(`Pelancongan total price calculation: RM ${totalPrice}`);
		return totalPrice;
	} catch (error) {
		console.error('Error calculating outbound total price:', error);
		return null;
	}
}

// Fungsi untuk menghitung total price umrah
export async function calculateUmrahTotalPrice(umrahDateId, roomType, numberOfParticipants, participantCategories) {
	try {
		// Ambil semua data harga dari umrah_dates termasuk informasi musim dan kategori untuk identifikasi paket khusus
		const { data: umrahDateData, error } = await dataService.supabase
			.from('umrah_dates')
			.select(`
				double, triple, quadruple, quintuple, 
				low_deck_interior, low_deck_seaview, low_deck_balcony, 
				high_deck_interior, high_deck_seaview, high_deck_balcony, 
				cnb, infant,
				umrah_seasons!inner(id, name),
				umrah_categories!inner(id, name)
			`)
			.eq('id', umrahDateId)
			.single();

		if (error) {
			console.error('Error fetching umrah date price:', error);
			return null;
		}

		if (!umrahDateData) {
			console.log('No price data found for umrah date');
			return null;
		}

		// Debug: Tampilkan struktur data yang diterima
		console.log('🔍 RAW UMRAN DATE DATA:');
		console.log('umrahDateData:', JSON.stringify(umrahDateData, null, 2));
		console.log('umrah_seasons:', umrahDateData.umrah_seasons);
		console.log('umrah_categories:', umrahDateData.umrah_categories);

		// Tentukan harga dasar berdasarkan jenis bilik yang dipilih
		let basePrice = null;
		switch (roomType) {
			// Jenis bilik biasa (double precision)
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
			// Jenis kabin kapal (text format, perlu parsing)
			case 'low_deck_interior':
				basePrice = parseFloat(umrahDateData.low_deck_interior) || 0;
				break;
			case 'low_deck_seaview':
				basePrice = parseFloat(umrahDateData.low_deck_seaview) || 0;
				break;
			case 'low_deck_balcony':
				basePrice = parseFloat(umrahDateData.low_deck_balcony) || 0;
				break;
			case 'high_deck_interior':
				basePrice = parseFloat(umrahDateData.high_deck_interior) || 0;
				break;
			case 'high_deck_seaview':
				basePrice = parseFloat(umrahDateData.high_deck_seaview) || 0;
				break;
			case 'high_deck_balcony':
				basePrice = parseFloat(umrahDateData.high_deck_balcony) || 0;
				break;
			default:
				console.error('Invalid room type:', roomType);
				return null;
		}

		if (!basePrice || basePrice <= 0) {
			console.error('Invalid or zero price for selected room type:', roomType, basePrice);
			return null;
		}

		// Debug: Tampilkan ID yang diterima
		console.log('🔍 DEBUG ID PACKAGE:');
		console.log('Season ID:', umrahDateData.umrah_seasons?.id);
		console.log('Category ID:', umrahDateData.umrah_categories?.id);
		console.log('Target Hijazi ID:', '065a1f1f-9fe2-4643-b613-8bf355d2c487');
		console.log('Target Promosi Season ID:', '593e7550-adc8-440f-af46-2b35cf35391e');
		console.log('Target Promosi Category ID:', 'fe935569-7a63-48e1-881d-a8f123017632');
		
		// Cek jenis paket untuk menentukan diskon CWB berdasarkan ID
		const isHijaziKembara5Kota = umrahDateData.umrah_seasons?.id === '065a1f1f-9fe2-4643-b613-8bf355d2c487';
		
		const isPromosi4990 = umrahDateData.umrah_seasons?.id === '593e7550-adc8-440f-af46-2b35cf35391e' && 
							  umrahDateData.umrah_categories?.id === 'fe935569-7a63-48e1-881d-a8f123017632';
		
		console.log('isHijaziKembara5Kota:', isHijaziKembara5Kota);
		console.log('isPromosi4990:', isPromosi4990);
		
		// Tentukan diskon CWB berdasarkan paket
		let cwbDiscount = 500; // default
		let packageType = 'Standard';
		
		if (isHijaziKembara5Kota) {
			cwbDiscount = 1000;
			packageType = 'Hijazi Kembara 5 Kota';
		} else if (isPromosi4990) {
			cwbDiscount = 300;
			packageType = 'Promosi 4990';
		}
		
		console.log(`Paket: ${umrahDateData.umrah_seasons?.name} (ID: ${umrahDateData.umrah_seasons?.id}) - ${umrahDateData.umrah_categories?.name} (ID: ${umrahDateData.umrah_categories?.id})`);
		console.log(`Diskon CWB: RM ${cwbDiscount} (${packageType})`);

		// Mulai perhitungan total price
		let totalPrice = 0;
		
		// Pendaftar (peserta pertama) membayar harga bilik normal
		totalPrice += basePrice;
		console.log(`Pendaftar (bilik ${roomType}): RM ${basePrice}`);

		// Hitung harga untuk peserta tambahan berdasarkan kategori
		if (numberOfParticipants > 1) {
			for (let i = 2; i <= numberOfParticipants; i++) {
				const kategori = participantCategories.get(String(i)) || '';
				let participantPrice = 0;

				switch (kategori) {
					case 'cwb':
						// CWB (Child With Bed): harga bilik yang dipilih - diskon (500 atau 1000)
						// Gunakan basePrice yang sudah dihitung sebelumnya
						participantPrice = basePrice - cwbDiscount;
						console.log(`Peserta ${i} (CWB): RM ${participantPrice} (base: ${basePrice} - ${cwbDiscount})`);
						break;
					case 'cnb':
						// CNB (Child No Bed): harga dari kolom cnb di database
						participantPrice = umrahDateData.cnb || 0;
						console.log(`Peserta ${i} (CNB): RM ${participantPrice}`);
						break;
					case 'infant':
						// Infant: harga dari database
						participantPrice = umrahDateData.infant || 0;
						console.log(`Peserta ${i} (Infant): RM ${participantPrice}`);
						break;
					default:
						// Jika tidak ada kategori yang dipilih, gunakan harga bilik normal
						participantPrice = basePrice;
						console.log(`Peserta ${i} (normal): RM ${participantPrice}`);
				}

				totalPrice += participantPrice;
			}
		}

		console.log(`Umrah total price calculation: RM ${totalPrice}`);
		return totalPrice;

	} catch (error) {
		console.error('Error calculating umrah total price:', error);
		return null;
	}
}

// Fungsi untuk mengumpulkan kategori peserta dari form data
export function collectParticipantCategories(formData, numberOfParticipants) {
	const participantCategories = new Map();
	
	if (numberOfParticipants > 1) {
		for (let i = 2; i <= numberOfParticipants; i++) {
			const kategori = formData.get(`peserta_kategori_${i}`) || '';
			if (kategori) {
				participantCategories.set(String(i), kategori);
			}
		}
	}
	
	return participantCategories;
}

export function parseMalaysianNRIC(nric) {
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
export async function sendToN8n(formData, bookingId, pesertaData, totalPrice) {
	try {
		// Ambil data dari formData
		const gelaran = formData.get('gelaran');
		const nama = formData.get('nama');
		const nama_lengkap = `${gelaran || ''} ${nama || ''}`.trim();
		const nokp = formData.get('nokp');
		const telefon = formData.get('telefon');
		const alamat = formData.get('alamat');
		const bandar = formData.get('bandar');
		const negeri = formData.get('negeri');
		const poskod = formData.get('poskod');
		const uuid = bookingId;
		const date = new Date().toISOString().split('T')[0];
		
		// Ambil data yang diperlukan untuk payload
		const tarikh_berlepas = formData.get('tarikh_berlepas');
		const tarikh_umrah = formData.get('tarikh_umrah');
		const pilih_bilik = formData.get('pilih_bilik');
		const pilih_bilik_pelancongan = formData.get('pilih_bilik_pelancongan');

		console.log('Form data received:');
		console.log('tarikh_umrah:', tarikh_umrah);
		console.log('pilih_bilik:', pilih_bilik);
		console.log('pilih_bilik_pelancongan:', pilih_bilik_pelancongan);

		// Gunakan total_price yang sudah dihitung
		let total = totalPrice || 0;

		// Parse tanggal lahir dari NRIC
		let tanggal_lahir = '';
		let umur = '';
		if (nokp && nokp.length >= 12) {
			const yy = nokp.slice(0, 2);
			const mm = nokp.slice(2, 4);
			const dd = nokp.slice(4, 6);
			const fullYear = parseInt(yy) < 50 ? '20' + yy : '19' + yy;
			tanggal_lahir = `${fullYear}-${mm}-${dd}`;
			
			// Hitung umur
			const birthDate = new Date(tanggal_lahir);
			const today = new Date();
			umur = Math.floor((today - birthDate) / (365.25 * 24 * 60 * 60 * 1000)).toString();
		}

		// Ambil data pakej dan tarikh
		let kod_pakej = '';
		let tarikh_jangkaan = '';
		let pilihan_penerbangan = '';
		let kod_tempa = '';
		
		// Fungsi untuk format tanggal ke bahasa Malaysia
		function formatDateToMalaysian(dateString) {
			if (!dateString) return '';
			
			const date = new Date(dateString);
			const months = [
				'Jan', 'Feb', 'Mac', 'Apr', 'Mei', 'Jun',
				'Jul', 'Ogo', 'Sep', 'Okt', 'Nov', 'Dis'
			];
			
			const day = date.getDate();
			const month = months[date.getMonth()];
			const year = date.getFullYear();
			
			return `${day} ${month} ${year}`;
		}
		
		if (tarikh_berlepas) {
			// Untuk pakej pelancongan
			const { data: outboundDateData } = await dataService.supabase
				.from('outbound_dates')
				.select('start_date, end_date, destinations!inner(name)')
				.eq('id', tarikh_berlepas)
				.single();
			
			if (outboundDateData) {
				kod_pakej = outboundDateData.destinations?.name || '';
				const startDate = formatDateToMalaysian(outboundDateData.start_date);
				const endDate = formatDateToMalaysian(outboundDateData.end_date);
				tarikh_jangkaan = `${startDate} - ${endDate}`;
			}
		} else if (tarikh_umrah) {
			// Untuk pakej umrah
			const { data: umrahDateData } = await dataService.supabase
				.from('umrah_dates')
				.select('start_date, end_date, airlines!inner(name), umrah_categories!inner(name), flight_name')
				.eq('id', tarikh_umrah)
				.single();

			if (umrahDateData) {
				kod_pakej = umrahDateData.umrah_categories?.name || '';
				const startDate = formatDateToMalaysian(umrahDateData.start_date);
				const endDate = formatDateToMalaysian(umrahDateData.end_date);
				tarikh_jangkaan = `${startDate} - ${endDate}`;
				pilihan_penerbangan = umrahDateData.airlines?.name || '';
			}
		}

		// Ambil data harga dari database untuk perhitungan kredit
		let umrahDateData = null;
		let outboundDateData = null;

		if (tarikh_umrah) {
			const { data: umrahData } = await dataService.supabase
				.from('umrah_dates')
				.select('double, triple, quadruple, quintuple, low_deck_interior, low_deck_seaview, low_deck_balcony, high_deck_interior, high_deck_seaview, high_deck_balcony, cnb, infant, flight_name, umrah_categories!inner(id, name), umrah_seasons!inner(id, name)')
				.eq('id', tarikh_umrah)
				.single();
			umrahDateData = umrahData;
			console.log('umrahDateData:', umrahDateData);
		}

		if (tarikh_berlepas) {
			const { data: outboundData } = await dataService.supabase
				.from('outbound_dates')
				.select('single, double, triple, cwb, cnb, infant')
				.eq('id', tarikh_berlepas)
				.single();
			outboundDateData = outboundData;
		}

		// Ambil data cawangan untuk kod tempa
		const branch_id = formData.get('cawangan');
		if (branch_id) {
			const { data: branchData } = await dataService.supabase
				.from('branches')
				.select('name')
				.eq('id', branch_id)
				.single();

			if (branchData) {
				kod_tempa = branchData.name || '';
			}
		}

		// Siapkan data butir mahram - kirim 10 row lengkap
		const butir_mahram = {};

		// Loop untuk semua peserta (1 sampai 10) - selalu kirim 10 row
		for (let i = 1; i <= 10; i++) {
			// Untuk peserta pertama (i=1), gunakan data pendaftar utama
			const nama_peserta = i === 1 ? nama : formData.get(`peserta_nama_${i}`);
			const nokp_peserta = i === 1 ? nokp : formData.get(`peserta_nokp_${i}`);
			const kategori_peserta = formData.get(`peserta_kategori_${i}`);

			// Tentukan jenis bilik berdasarkan kategori peserta
			let bilik_type = '';
			let kredit_harga = 0;

			// Hitung bilik dan kredit hanya jika ada nama peserta
			const namaValue = i === 1 ? nama : (nama_peserta && nama_peserta.trim() !== '' ? nama_peserta.trim() : '');

			if (namaValue !== '') {
				// Untuk peserta pertama (i=1), selalu hitung bilik dan kredit
				if (i === 1) {
					if (pilih_bilik) {
						bilik_type = pilih_bilik;
						if (umrahDateData) {
							switch (pilih_bilik) {
								case 'double':
									kredit_harga = umrahDateData.double || 0;
									break;
								case 'triple':
									kredit_harga = umrahDateData.triple || 0;
									break;
								case 'quad':
									kredit_harga = umrahDateData.quadruple || 0;
									break;
								case 'quintuple':
									kredit_harga = umrahDateData.quintuple || 0;
									break;
								case 'low_deck_interior':
									kredit_harga = umrahDateData.low_deck_interior || 0;
									break;
								case 'low_deck_seaview':
									kredit_harga = umrahDateData.low_deck_seaview || 0;
									break;
								case 'low_deck_balcony':
									kredit_harga = umrahDateData.low_deck_balcony || 0;
									break;
								case 'high_deck_interior':
									kredit_harga = umrahDateData.high_deck_interior || 0;
									break;
								case 'high_deck_seaview':
									kredit_harga = umrahDateData.high_deck_seaview || 0;
									break;
								case 'high_deck_balcony':
									kredit_harga = umrahDateData.high_deck_balcony || 0;
									break;
							}
						}
					} else if (pilih_bilik_pelancongan) {
						bilik_type = pilih_bilik_pelancongan;
						if (outboundDateData) {
							switch (pilih_bilik_pelancongan) {
								case 'single':
									kredit_harga = outboundDateData.single || 0;
									break;
								case 'double':
									kredit_harga = outboundDateData.double || 0;
									break;
								case 'triple':
									kredit_harga = outboundDateData.triple || 0;
									break;
							}
						}
					}
				} else if (kategori_peserta) {
					// Peserta tambahan dengan kategori
					// Gunakan bilik yang sama seperti peserta pertama
					let selectedRoomType = '';
					if (umrahDateData) {
						selectedRoomType = pilih_bilik;
					} else if (outboundDateData) {
						selectedRoomType = pilih_bilik_pelancongan;
					}

					// Format nama bilik: capitalize first letter
					let roomTypeDisplay = selectedRoomType.charAt(0).toUpperCase() + selectedRoomType.slice(1);

					if (kategori_peserta === 'cwb') {
						bilik_type = `${roomTypeDisplay} (CWB)`;
						if (umrahDateData) {
							// Debug: Tampilkan ID yang diterima
							console.log('🔍 DEBUG ID PACKAGE (sendToN8n):');
							console.log('Season ID:', umrahDateData.umrah_seasons?.id);
							console.log('Category ID:', umrahDateData.umrah_categories?.id);
							
							// Cek jenis paket untuk menentukan diskon CWB berdasarkan ID
							const isHijaziKembara5Kota = umrahDateData.umrah_seasons?.id === '065a1f1f-9fe2-4643-b613-8bf355d2c487';
							
							const isPromosi4990 = umrahDateData.umrah_seasons?.id === '593e7550-adc8-440f-af46-2b35cf35391e' && 
												  umrahDateData.umrah_categories?.id === 'fe935569-7a63-48e1-881d-a8f123017632';
							
							console.log('isHijaziKembara5Kota:', isHijaziKembara5Kota);
							console.log('isPromosi4990:', isPromosi4990);
							
							// Tentukan diskon CWB berdasarkan paket
							let cwbDiscount = 500; // default
							if (isHijaziKembara5Kota) {
								cwbDiscount = 1000;
							} else if (isPromosi4990) {
								cwbDiscount = 300;
							}
							
							console.log('Final CWB Discount:', cwbDiscount);
							
							// Untuk umrah: CWB = harga bilik yang dipilih - diskon (500 atau 1000)
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
								case 'low_deck_interior':
									basePrice = umrahDateData.low_deck_interior || 0;
									break;
								case 'low_deck_seaview':
									basePrice = umrahDateData.low_deck_seaview || 0;
									break;
								case 'low_deck_balcony':
									basePrice = umrahDateData.low_deck_balcony || 0;
									break;
								case 'high_deck_interior':
									basePrice = umrahDateData.high_deck_interior || 0;
									break;
								case 'high_deck_seaview':
									basePrice = umrahDateData.high_deck_seaview || 0;
									break;
								case 'high_deck_balcony':
									basePrice = umrahDateData.high_deck_balcony || 0;
									break;
								default:
									basePrice = umrahDateData.double || 0; // fallback ke double
							}
							kredit_harga = basePrice - cwbDiscount; // CWB = base price - diskon
						} else if (outboundDateData) {
							// Untuk pelancongan: CWB = harga dari kolom cwb di database
							kredit_harga = outboundDateData.cwb || 0;
						}
					} else if (kategori_peserta === 'cnb') {
						bilik_type = `${roomTypeDisplay} (CNB)`;
						// CNB = harga dari kolom cnb di database
						if (umrahDateData) {
							kredit_harga = umrahDateData.cnb || 0;
						} else if (outboundDateData) {
							kredit_harga = outboundDateData.cnb || 0;
						}
					} else if (kategori_peserta === 'infant') {
						bilik_type = `${roomTypeDisplay} (Infant)`;
						if (umrahDateData) {
							kredit_harga = umrahDateData.infant || 0;
						} else if (outboundDateData) {
							kredit_harga = outboundDateData.infant || 0;
						}
					} else {
						// Default untuk peserta normal - gunakan bilik yang sama seperti peserta pertama
						bilik_type = roomTypeDisplay;
						if (pilih_bilik) {
							// Hitung harga sama seperti peserta pertama
							if (umrahDateData) {
								switch (pilih_bilik) {
									case 'double':
										kredit_harga = umrahDateData.double || 0;
										break;
									case 'triple':
										kredit_harga = umrahDateData.triple || 0;
										break;
									case 'quad':
										kredit_harga = umrahDateData.quadruple || 0;
										break;
									case 'quintuple':
										kredit_harga = umrahDateData.quintuple || 0;
										break;
									case 'low_deck_interior':
										kredit_harga = umrahDateData.low_deck_interior || 0;
										break;
									case 'low_deck_seaview':
										kredit_harga = umrahDateData.low_deck_seaview || 0;
										break;
									case 'low_deck_balcony':
										kredit_harga = umrahDateData.low_deck_balcony || 0;
										break;
									case 'high_deck_interior':
										kredit_harga = umrahDateData.high_deck_interior || 0;
										break;
									case 'high_deck_seaview':
										kredit_harga = umrahDateData.high_deck_seaview || 0;
										break;
									case 'high_deck_balcony':
										kredit_harga = umrahDateData.high_deck_balcony || 0;
										break;
								}
							}
						} else if (pilih_bilik_pelancongan) {
							// Hitung harga sama seperti peserta pertama
							if (outboundDateData) {
								switch (pilih_bilik_pelancongan) {
									case 'single':
										kredit_harga = outboundDateData.single || 0;
										break;
									case 'double':
										kredit_harga = outboundDateData.double || 0;
										break;
									case 'triple':
										kredit_harga = outboundDateData.triple || 0;
										break;
								}
							}
						}
					}
				} else {
					// Peserta tanpa kategori (normal) - gunakan bilik yang sama seperti peserta pertama
					let selectedRoomType = '';
					if (umrahDateData) {
						selectedRoomType = pilih_bilik;
					} else if (outboundDateData) {
						selectedRoomType = pilih_bilik_pelancongan;
					}

					// Format nama bilik: capitalize first letter
					let roomTypeDisplay = selectedRoomType ? selectedRoomType.charAt(0).toUpperCase() + selectedRoomType.slice(1) : '';

					bilik_type = roomTypeDisplay;
					kredit_harga = 0;

					if (pilih_bilik) {
						// Hitung harga sama seperti peserta pertama
						if (umrahDateData) {
							switch (pilih_bilik) {
								case 'double':
									kredit_harga = umrahDateData.double || 0;
									break;
								case 'triple':
									kredit_harga = umrahDateData.triple || 0;
									break;
								case 'quad':
									kredit_harga = umrahDateData.quadruple || 0;
									break;
								case 'quintuple':
									kredit_harga = umrahDateData.quintuple || 0;
									break;
								case 'low_deck_interior':
									kredit_harga = umrahDateData.low_deck_interior || 0;
									break;
								case 'low_deck_seaview':
									kredit_harga = umrahDateData.low_deck_seaview || 0;
									break;
								case 'low_deck_balcony':
									kredit_harga = umrahDateData.low_deck_balcony || 0;
									break;
								case 'high_deck_interior':
									kredit_harga = umrahDateData.high_deck_interior || 0;
									break;
								case 'high_deck_seaview':
									kredit_harga = umrahDateData.high_deck_seaview || 0;
									break;
								case 'high_deck_balcony':
									kredit_harga = umrahDateData.high_deck_balcony || 0;
									break;
							}
						}
					} else if (pilih_bilik_pelancongan) {
						// Hitung harga sama seperti peserta pertama
						if (outboundDateData) {
							switch (pilih_bilik_pelancongan) {
								case 'single':
									kredit_harga = outboundDateData.single || 0;
									break;
								case 'double':
									kredit_harga = outboundDateData.double || 0;
									break;
								case 'triple':
									kredit_harga = outboundDateData.triple || 0;
									break;
							}
						}
					}
				}
			}

			// Selalu kirim row lengkap, isi dengan string kosong jika tidak ada data
			const bilValue = i === 1 ? '1' : (namaValue !== '' ? i.toString() : '');
			const nokpValue = i === 1 ? nokp : (nokp_peserta || '');
			const bilikValue = bilik_type;
			const kreditValue = kredit_harga;

			butir_mahram[`row_${i}`] = {
				[`Bil${i}`]: bilValue,
				[`Nama${i}`]: namaValue,
				[`no/kp${i}`]: nokpValue,
				'bilik': bilikValue,
				'kredit': kreditValue
			};

			// Debug logging untuk melacak proses perhitungan
			console.log(`Peserta ${i}: ${namaValue} | Kategori: ${kategori_peserta} | Bilik: ${bilikValue} | Kredit: RM ${kreditValue}`);
		}

		// Siapkan data sesuai format JSON yang diminta
		const n8nData = {
			data: {
				nama: nama_lengkap,
				tanggal_lahir: tanggal_lahir,
				no_kp: nokp || '',
				Umur: umur,
				"Alamat 1": alamat || '',
				"Alamat 2": '',
				Poskod: poskod || '',
				Bandar: bandar || '',
				Negeri: negeri || '',
				"Tel (P)": telefon || '',
				"Tel (R)": '',
				"Kod Tempa": kod_tempa,
				"Ruj Caw": '',
				package_type: formData.get('package_type') || '',
				"Kod Pakej": kod_pakej,
				"Tarikh Jangkaan": tarikh_jangkaan,
				"2 bilik": pilih_bilik === 'double' ? true : '',
				"3 bilik": pilih_bilik === 'triple' ? true : '',
				"4 bilik": pilih_bilik === 'quad' ? true : '',
				"5 bilik": pilih_bilik === 'quintuple' ? true : '',
				"Bilik Pelancongan": tarikh_berlepas ? pilih_bilik_pelancongan || '' : '',
				"low_deck_interior": pilih_bilik === 'low_deck_interior' ? true : '',
				"low_deck_seaview": pilih_bilik === 'low_deck_seaview' ? true : '',
				"low_deck_balcony": pilih_bilik === 'low_deck_balcony' ? true : '',
				"high_deck_interior": pilih_bilik === 'high_deck_interior' ? true : '',
				"high_deck_seaview": pilih_bilik === 'high_deck_seaview' ? true : '',
				"high_deck_balcony": pilih_bilik === 'high_deck_balcony' ? true : '',
				"Pilihan Penerbangan": pilihan_penerbangan,
				flight_name: (() => {
					const flightName = tarikh_umrah ? (umrahDateData?.flight_name || '') : '';
					console.log('Flight name from database:', flightName);
					return flightName;
				})(),
				"consultant_uuid": formData.get('konsultan') || '',
				butir_mahram: butir_mahram
			},
			invoice: {
				nama: nama_lengkap,
				alamat: alamat || '',
				bandar: bandar || '',
				negeri: negeri || '',
				uuid: uuid || '',
				date: date,
				total: total.toString()
			}
		};

		console.log('🚀 SENDING DATA TO N8N WEBHOOK...');
		console.log('📋 Booking ID:', bookingId);
		console.log('💰 Total Price:', totalPrice);
		console.log('👥 Number of participants:', pesertaData.length + 1);
		console.log('📤 Data being sent:', JSON.stringify(n8nData, null, 2));

		// Kirim data ke N8n webhook
		const response = await fetch('https://n8n-wb9pbdns.runner.web.id/webhook/rayhar-invoice', {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
			},
			body: JSON.stringify(n8nData)
		});

		console.log('📡 N8n Response Status:', response.status, response.statusText);

		if (!response.ok) {
			console.error('❌ N8N WEBHOOK FAILED!');
			console.error('Status:', response.status);
			console.error('Status Text:', response.statusText);
			const responseText = await response.text();
			console.error('Response Body:', responseText);
			console.error('Booking ID:', bookingId);
			throw new Error(`N8n webhook failed: ${response.status} ${response.statusText}`);
		}

		const responseData = await response.text();
		console.log('✅ N8N WEBHOOK SUCCESS!');
		console.log('📥 Response Data:', responseData);
		console.log('🎉 Invoice generation completed for Booking ID:', bookingId);

	} catch (error) {
		console.error('💥 N8N WEBHOOK ERROR!');
		console.error('❌ Error Message:', error.message);
		console.error('📋 Booking ID:', bookingId);
		console.error('🔍 Error Details:', {
			message: error.message,
			stack: error.stack,
			bookingId: bookingId,
			totalPrice: totalPrice,
			participantCount: pesertaData.length + 1
		});
		console.error('⚠️  Note: This error does not affect the main booking process');
		// Jangan throw error karena ini tidak boleh mengganggu proses booking utama
		// Hanya log error untuk debugging
	}
}
