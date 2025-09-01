// Test untuk logika harga pelancongan yang sudah diperbaiki
// Menggunakan harga spesifik dari database, bukan persentase

// Mock data outboundDates (dari Supabase)
const outboundDates = [
	{
		id: "6fa06854-b356-4cc4-b791-29ae1b9a6e12",
		start_date: "2026-01-24",
		end_date: "2026-02-02",
		single: "9550",
		double: "8550",
		triple: "-",
		cwb: "8350",
		cnb: "8350",
		infant: "1200",
		destination_id: "36d7bc84-4609-4818-aea4-1bd2b86d4aa2"
	},
	{
		id: "0df9bba7-91ae-43c6-a7bd-40551e83b9f2",
		start_date: "2026-03-27",
		end_date: "2026-04-05",
		single: "9750",
		double: "8750",
		triple: "-",
		cwb: "8550",
		cnb: "8550",
		infant: "1200",
		destination_id: "36d7bc84-4609-4818-aea4-1bd2b86d4aa2"
	}
];

// Mock data peserta
const pesertaData = [
	{
		id: 1,
		kategori: 'cwb'
	},
	{
		id: 2,
		kategori: 'cnb'
	},
	{
		id: 3,
		kategori: 'infant'
	},
	{
		id: 4,
		kategori: '' // Dewasa
	}
];

// Function untuk menghitung total harga paket pelancongan (yang sudah diperbaiki)
function calculatePelanconganTotalPrice(selectedTarikh, selectedPelanconganRoomType, pesertaData) {
	if (!selectedTarikh || !selectedPelanconganRoomType) {
		return 0;
	}

	// Cari data tarikh yang dipilih
	const selectedDate = outboundDates.find(d => String(d.id) === String(selectedTarikh));
	if (!selectedDate) return 0;

	// Dapatkan harga dasar berdasarkan jenis bilik yang dipilih
	let basePrice = 0;
	switch (selectedPelanconganRoomType) {
		case 'single':
			basePrice = parseFloat(selectedDate.single) || 0;
			break;
		case 'double':
			basePrice = parseFloat(selectedDate.double) || 0;
			break;
		case 'triple':
			basePrice = parseFloat(selectedDate.triple) || 0;
			break;
		default:
			return 0;
	}

	if (basePrice <= 0) return 0;

	// Hitung total berdasarkan jumlah peserta
	let totalPrice = basePrice; // Peserta 1 (pendaftar utama)

	// Tambahkan harga untuk peserta tambahan berdasarkan kategori
	if (pesertaData && pesertaData.length > 0) {
		pesertaData.forEach(peserta => {
			if (peserta.kategori === 'cwb') {
				// CWB (Child With Bed) - gunakan harga spesifik dari Supabase
				const cwbPrice = parseFloat(selectedDate.cwb) || 0;
				totalPrice += cwbPrice > 0 ? cwbPrice : basePrice; // Fallback ke harga dewasa jika CWB tidak tersedia
			} else if (peserta.kategori === 'cnb') {
				// CNB (Child No Bed) - gunakan harga spesifik dari Supabase
				const cnbPrice = parseFloat(selectedDate.cnb) || 0;
				totalPrice += cnbPrice > 0 ? cnbPrice : basePrice; // Fallback ke harga dewasa jika CNB tidak tersedia
			} else if (peserta.kategori === 'infant') {
				// Infant - gunakan harga spesifik dari Supabase
				const infantPrice = parseFloat(selectedDate.infant) || 0;
				totalPrice += infantPrice > 0 ? infantPrice : basePrice; // Fallback ke harga dewasa jika Infant tidak tersedia
			} else {
				// Dewasa (tidak ada kategori khusus) - 100% dari harga dewasa
				totalPrice += basePrice;
			}
		});
	}

	return totalPrice;
}

// Function untuk mendapatkan breakdown harga
function getPelanconganPriceBreakdown(selectedTarikh, selectedPelanconganRoomType, pesertaData) {
	if (!selectedTarikh || !selectedPelanconganRoomType) {
		return null;
	}

	// Cari data tarikh yang dipilih
	const selectedDate = outboundDates.find(d => String(d.id) === String(selectedTarikh));
	if (!selectedDate) return null;

	// Dapatkan harga dasar berdasarkan jenis bilik yang dipilih
	let basePrice = 0;
	let roomTypeLabel = '';
	switch (selectedPelanconganRoomType) {
		case 'single':
			basePrice = parseFloat(selectedDate.single) || 0;
			roomTypeLabel = 'Bilik Single';
			break;
		case 'double':
			basePrice = parseFloat(selectedDate.double) || 0;
			roomTypeLabel = 'Bilik Double/Twin';
			break;
		case 'triple':
			basePrice = parseFloat(selectedDate.triple) || 0;
			roomTypeLabel = 'Bilik Triple';
			break;
		default:
			return null;
	}

	if (basePrice <= 0) return null;

	const breakdown = {
		roomType: roomTypeLabel,
		basePrice: basePrice,
		participants: [
			{
				name: 'Peserta 1 (Pendaftar Utama)',
				category: 'Dewasa',
				price: basePrice,
				percentage: 'Harga Bilik'
			}
		],
		totalPrice: basePrice
	};

	// Tambahkan breakdown untuk peserta tambahan
	if (pesertaData && pesertaData.length > 0) {
		pesertaData.forEach((peserta, index) => {
			let participantPrice = 0;
			let category = '';
			let percentage = '';

			if (peserta.kategori === 'cwb') {
				// Gunakan harga spesifik CWB dari Supabase
				const cwbPrice = parseFloat(selectedDate.cwb) || 0;
				participantPrice = cwbPrice > 0 ? cwbPrice : basePrice;
				category = 'CWB (Child With Bed)';
				percentage = cwbPrice > 0 ? `RM ${cwbPrice}` : 'Harga Dewasa';
			} else if (peserta.kategori === 'cnb') {
				// Gunakan harga spesifik CNB dari Supabase
				const cnbPrice = parseFloat(selectedDate.cnb) || 0;
				participantPrice = cnbPrice > 0 ? cnbPrice : basePrice;
				category = 'CNB (Child No Bed)';
				percentage = cnbPrice > 0 ? `RM ${cnbPrice}` : 'Harga Dewasa';
			} else if (peserta.kategori === 'infant') {
				// Gunakan harga spesifik Infant dari Supabase
				const infantPrice = parseFloat(selectedDate.infant) || 0;
				participantPrice = infantPrice > 0 ? infantPrice : basePrice;
				category = 'Infant';
				percentage = infantPrice > 0 ? `RM ${infantPrice}` : 'Harga Dewasa';
			} else {
				participantPrice = basePrice;
				category = 'Dewasa';
				percentage = 'Harga Bilik';
			}

			breakdown.participants.push({
				name: `Peserta ${peserta.id}`,
				category: category,
				price: participantPrice,
				percentage: percentage
			});

			breakdown.totalPrice += participantPrice;
		});
	}

	return breakdown;
}

// Test cases
console.log("=== TEST LOGIKA HARGA PELANCONGAN YANG SUDAH DIPERBAIKI ===\n");

// Test 1: Single Room dengan 4 peserta tambahan (CWB, CNB, Infant, Dewasa)
console.log("Test 1: Single Room dengan 4 peserta tambahan");
const selectedTarikh1 = "6fa06854-b356-4cc4-b791-29ae1b9a6e12";
const selectedPelanconganRoomType1 = "single";
const pesertaData1 = pesertaData.slice(0, 4); // Ambil 4 peserta pertama

const totalPrice1 = calculatePelanconganTotalPrice(selectedTarikh1, selectedPelanconganRoomType1, pesertaData1);
console.log(`Total Harga: RM ${totalPrice1.toLocaleString()}`);

const breakdown1 = getPelanconganPriceBreakdown(selectedTarikh1, selectedPelanconganRoomType1, pesertaData1);
if (breakdown1) {
	console.log(`\nBreakdown untuk ${breakdown1.roomType}:`);
	console.log(`Harga Dasar: RM ${breakdown1.basePrice.toLocaleString()}`);
	console.log("\nDetail Peserta:");
	breakdown1.participants.forEach(p => {
		console.log(`- ${p.name} (${p.category}): RM ${p.price.toLocaleString()} - ${p.percentage}`);
	});
	console.log(`\nTotal: RM ${breakdown1.totalPrice.toLocaleString()}`);
}

console.log("\n" + "=".repeat(60) + "\n");

// Test 2: Double Room dengan 2 peserta tambahan (CWB, CNB)
console.log("Test 2: Double Room dengan 2 peserta tambahan");
const selectedTarikh2 = "0df9bba7-91ae-43c6-a7bd-40551e83b9f2";
const selectedPelanconganRoomType2 = "double";
const pesertaData2 = pesertaData.slice(0, 2); // Ambil 2 peserta pertama

const totalPrice2 = calculatePelanconganTotalPrice(selectedTarikh2, selectedPelanconganRoomType2, pesertaData2);
console.log(`Total Harga: RM ${totalPrice2.toLocaleString()}`);

const breakdown2 = getPelanconganPriceBreakdown(selectedTarikh2, selectedPelanconganRoomType2, pesertaData2);
if (breakdown2) {
	console.log(`\nBreakdown untuk ${breakdown2.roomType}:`);
	console.log(`Harga Dasar: RM ${breakdown2.basePrice.toLocaleString()}`);
	console.log("\nDetail Peserta:");
	breakdown2.participants.forEach(p => {
		console.log(`- ${p.name} (${p.category}): RM ${p.price.toLocaleString()} - ${p.percentage}`);
	});
	console.log(`\nTotal: RM ${breakdown2.totalPrice.toLocaleString()}`);
}

console.log("\n" + "=".repeat(60) + "\n");

// Test 3: Hanya 1 peserta (tidak ada peserta tambahan)
console.log("Test 3: Hanya 1 peserta (tidak ada peserta tambahan)");
const selectedTarikh3 = "6fa06854-b356-4cc4-b791-29ae1b9a6e12";
const selectedPelanconganRoomType3 = "double";
const pesertaData3 = []; // Tidak ada peserta tambahan

const totalPrice3 = calculatePelanconganTotalPrice(selectedTarikh3, selectedPelanconganRoomType3, pesertaData3);
console.log(`Total Harga: RM ${totalPrice3.toLocaleString()}`);

const breakdown3 = getPelanconganPriceBreakdown(selectedTarikh3, selectedPelanconganRoomType3, pesertaData3);
if (breakdown3) {
	console.log(`\nBreakdown untuk ${breakdown3.roomType}:`);
	console.log(`Harga Dasar: RM ${breakdown3.basePrice.toLocaleString()}`);
	console.log("\nDetail Peserta:");
	breakdown3.participants.forEach(p => {
		console.log(`- ${p.name} (${p.category}): RM ${p.price.toLocaleString()} - ${p.percentage}`);
	});
	console.log(`\nTotal: RM ${breakdown3.totalPrice.toLocaleString()}`);
}

console.log("\n" + "=".repeat(60) + "\n");

// Test 4: Verifikasi perhitungan manual
console.log("Test 4: Verifikasi Perhitungan Manual");
console.log("Data dari database:");
console.log("- Single: RM 9,550");
console.log("- CWB: RM 8,350");
console.log("- CNB: RM 8,350");
console.log("- Infant: RM 1,200");

const expectedTotal = 9550 + 8350 + 8350 + 1200 + 9550; // Single + CWB + CNB + Infant + Dewasa
console.log(`\nPerhitungan manual: RM 9,550 + RM 8,350 + RM 8,350 + RM 1,200 + RM 9,550 = RM ${expectedTotal.toLocaleString()}`);
console.log(`Hasil dari function: RM ${totalPrice1.toLocaleString()}`);
console.log(`Status: ${totalPrice1 === expectedTotal ? 'BENAR ✓' : 'SALAH ✗'}`);

console.log("\n=== TEST SELESAI ===");
