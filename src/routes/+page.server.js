import { supabase } from '$lib/server/supabase.js';
import { fail } from '@sveltejs/kit';

// Fungsi untuk menghitung total price pelancongan
async function calculateOutboundTotalPrice(outboundDateId, roomType, numberOfParticipants, participantCategories) {
	try {
		const { data: outboundDateData, error } = await supabase
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
async function calculateUmrahTotalPrice(umrahDateId, roomType, numberOfParticipants, participantCategories) {
	try {
		// Ambil semua data harga dari umrah_dates
		const { data: umrahDateData, error } = await supabase
			.from('umrah_dates')
			.select('double, triple, quadruple, quintuple, low_deck_interior, low_deck_seaview, low_deck_balcony, high_deck_interior, high_deck_seaview, high_deck_balcony, cwb, cnb, infant')
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

		// Tentukan harga dasar berdasarkan jenis bilik yang dipilih
		let basePrice = null;
		switch (roomType) {
			// Jenis bilik biasa
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
			// Jenis kabin kapal
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
				console.error('Invalid room type:', roomType);
				return null;
		}

		if (!basePrice || basePrice <= 0) {
			console.error('Invalid or zero price for selected room type:', roomType, basePrice);
			return null;
		}

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
						// CWB (Child With Bed): harga bilik yang dipilih - 500
						let basePriceCwb = 0;
						switch (roomType) {
							case 'double':
								basePriceCwb = umrahDateData.double || 0;
								break;
							case 'triple':
								basePriceCwb = umrahDateData.triple || 0;
								break;
							case 'quad':
								basePriceCwb = umrahDateData.quadruple || 0;
								break;
							case 'quintuple':
								basePriceCwb = umrahDateData.quintuple || 0;
								break;
							default:
								basePriceCwb = umrahDateData.double || 0;
						}
						participantPrice = basePriceCwb - 500;
						console.log(`Peserta ${i} (CWB): RM ${participantPrice} (base: ${basePriceCwb} - 500)`);
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
function collectParticipantCategories(formData, numberOfParticipants) {
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
async function sendToN8n(formData, bookingId, pesertaData, totalPrice) {
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
			const { data: outboundDateData } = await supabase
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
			const { data: umrahDateData } = await supabase
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
			const { data: umrahData } = await supabase
				.from('umrah_dates')
				.select('double, triple, quadruple, quintuple, low_deck_interior, low_deck_seaview, low_deck_balcony, high_deck_interior, high_deck_seaview, high_deck_balcony, cnb, infant, flight_name, umrah_categories!inner(name)')
				.eq('id', tarikh_umrah)
				.single();
			umrahDateData = umrahData;
			console.log('umrahDateData:', umrahDateData);
		}

		if (tarikh_berlepas) {
			const { data: outboundData } = await supabase
				.from('outbound_dates')
				.select('single, double, triple, cwb, cnb, infant')
				.eq('id', tarikh_berlepas)
				.single();
			outboundDateData = outboundData;
		}

		// Ambil data cawangan untuk kod tempa
		const branch_id = formData.get('cawangan');
		if (branch_id) {
			const { data: branchData } = await supabase
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
						// Untuk umrah: CWB = harga bilik yang dipilih - 500
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
						kredit_harga = basePrice - 500; // CWB = base price - 500
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

		console.log('Sending data to N8n:', JSON.stringify(n8nData, null, 2));

		// Kirim data ke N8n webhook
		const response = await fetch('https://n8n-wb9pbdns.runner.web.id/webhook/rayhar-invoice', {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
			},
			body: JSON.stringify(n8nData)
		});

		if (!response.ok) {
			console.error('Error sending data to N8n:', response.status, response.statusText);
			const responseText = await response.text();
			console.error('N8n response:', responseText);
			throw new Error(`N8n webhook failed: ${response.status} ${response.statusText}`);
		}

		const responseData = await response.text();
		console.log('N8n webhook success:', responseData);

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
			.select('id, name')
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

		// Fetch pelancongan dates with pricing (filtered by current date)
		const { data: outboundDates, error: outboundDatesError } = await supabase
			.from('outbound_dates')
			.select('id, start_date, end_date, single, double, triple, cwb, cnb, infant, destination_id')
			.gte('start_date', today)
			.order('start_date', { ascending: true });

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
			.order('start_date', { ascending: true });

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
			
			// Debug: log hidden input values specifically
			console.log('=== HIDDEN INPUT VALUES ===');
			console.log('total_harga_umrah:', formData.get('total_harga_umrah'));
			console.log('total_harga_pelancongan:', formData.get('total_harga_pelancongan'));
			console.log('jumlah_peserta_umrah:', formData.get('jumlah_peserta_umrah'));
			console.log('jumlah_peserta_pelancongan:', formData.get('jumlah_peserta_pelancongan'));
			console.log('==========================');
			
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

			// Pilihan bilik untuk Pelancongan (tambah ke jenis_bilik)
			const pilihBilikPelancongan = formData.get('pilih_bilik_pelancongan');
			const PELANCONGAN_ROOM_LABELS = {
				single: 'Single',
				double: 'Double',
				triple: 'Triple'
			};
			if (maklumat.outbound_date_id) {
				if (!pilihBilikPelancongan) {
					return fail(400, {
						error: 'Sila pilih bilik untuk pakej Pelancongan',
						form: maklumat
					});
				}
				const bilikLabel = PELANCONGAN_ROOM_LABELS[String(pilihBilikPelancongan)] || String(pilihBilikPelancongan);
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

			// VALIDASI WAJIB: Bilik harus dipilih sebelum booking
			if (maklumat.umrah_date_id && !formData.get('pilih_bilik')) {
				console.error('Bilik Umrah tidak dipilih');
				return fail(400, {
					error: 'Bilik Umrah wajib dipilih sebelum booking',
					form: maklumat
				});
			}
			if (maklumat.outbound_date_id && !formData.get('pilih_bilik_pelancongan')) {
				console.error('Bilik Pelancongan tidak dipilih');
				return fail(400, {
					error: 'Bilik Pelancongan wajib dipilih sebelum booking',
					form: maklumat
				});
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
			


			// Calculate total price for outbound packages
			if (maklumat.outbound_date_id) {
				try {
					const totalParticipants = maklumat.bilangan + 1; // applicant + additional participants
					const pilihBilikPelancongan = formData.get('pilih_bilik_pelancongan');
					
					// Check if we have hidden input values first
					const hiddenTotalHargaPelancongan = formData.get('total_harga_pelancongan');
					const hiddenJumlahPesertaPelancongan = formData.get('jumlah_peserta_pelancongan');
					
					// Try to use hidden input value first, fallback to calculation
					if (hiddenTotalHargaPelancongan && hiddenTotalHargaPelancongan !== 'null' && hiddenTotalHargaPelancongan !== '' && hiddenTotalHargaPelancongan !== 'undefined') {
						const parsedPrice = parseFloat(hiddenTotalHargaPelancongan);
						if (!isNaN(parsedPrice) && parsedPrice > 0) {
							maklumat.total_price = parsedPrice;
						} else {
							const outboundTotalPrice = await calculateOutboundTotalPrice(maklumat.outbound_date_id, pilihBilikPelancongan || 'double', totalParticipants, collectParticipantCategories(formData, totalParticipants));
							
							if (outboundTotalPrice !== null) {
								maklumat.total_price = outboundTotalPrice;
							} else {
								maklumat.total_price = null;
							}
						}
					} else {
						const outboundTotalPrice = await calculateOutboundTotalPrice(maklumat.outbound_date_id, pilihBilikPelancongan || 'double', totalParticipants, collectParticipantCategories(formData, totalParticipants));
						
						if (outboundTotalPrice !== null) {
							maklumat.total_price = outboundTotalPrice;
						} else {
							maklumat.total_price = null;
						}
					}
				} catch (error) {
					console.error('Error calculating outbound total price:', error);
					maklumat.total_price = null;
				}
			}

			// Calculate total price for Umrah packages
			if (maklumat.umrah_date_id) {
				try {
					const pilihBilik = formData.get('pilih_bilik');
					
					// Check if we have hidden input values first
					const hiddenTotalHargaUmrah = formData.get('total_harga_umrah');
					const hiddenJumlahPesertaUmrah = formData.get('jumlah_peserta_umrah');
					
					if (!pilihBilik) {
						console.error('No room type selected for Umrah package');
						maklumat.total_price = null;
					} else {
						const totalParticipants = maklumat.bilangan + 1; // applicant + additional participants
						
						const participantCategories = collectParticipantCategories(formData, totalParticipants);
						
						// Try to use hidden input value first, fallback to calculation
						if (hiddenTotalHargaUmrah && hiddenTotalHargaUmrah !== 'null' && hiddenTotalHargaUmrah !== '' && hiddenTotalHargaUmrah !== 'undefined') {
							const parsedPrice = parseFloat(hiddenTotalHargaUmrah);
							if (!isNaN(parsedPrice) && parsedPrice > 0) {
								maklumat.total_price = parsedPrice;
							} else {
								const umrahTotalPrice = await calculateUmrahTotalPrice(maklumat.umrah_date_id, pilihBilik, totalParticipants, participantCategories);
								
								if (umrahTotalPrice !== null) {
									maklumat.total_price = umrahTotalPrice;
								} else {
									maklumat.total_price = null;
								}
							}
						} else {
							const umrahTotalPrice = await calculateUmrahTotalPrice(maklumat.umrah_date_id, pilihBilik, totalParticipants, participantCategories);
							
							if (umrahTotalPrice !== null) {
								maklumat.total_price = umrahTotalPrice;
							} else {
								maklumat.total_price = null;
							}
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
					// Peserta tidak mengisi No KP (opsional)
				}
				
				pesertaData.push(pesertaRecord);
			}

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
				}
			}

			// Kirim data ke N8n webhook setelah data berhasil disimpan
			try {
				await sendToN8n(formData, bookingId, pesertaData, maklumat.total_price);
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

			// Berikan pesan error yang lebih spesifik
			let errorMessage = 'Internal server error';
			let statusCode = 500;

			if (error.message && error.message.includes('Bilik')) {
				errorMessage = error.message; // Pesan validasi bilik
				statusCode = 400;
			} else if (error.message) {
				errorMessage = error.message;
			}

			return fail(statusCode, {
				error: errorMessage,
				form: maklumat || {}
			});
		}
	}
};
