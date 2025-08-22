<script>
	import { enhance } from '$app/forms';
	let { data, form } = $props();
	const branches = data?.branches ?? [];
	const packageTypes = data?.packageTypes ?? [];
	const destinations = data?.destinations ?? [];
	const outboundDates = data?.outboundDates ?? [];
	const umrahSeasons = data?.umrahSeasons ?? [];
	const umrahCategories = data?.umrahCategories ?? [];
	const airlines = data?.airlines ?? [];
	const umrahDates = data?.umrahDates ?? [];
	const consultants = data?.consultants ?? [];
	
	let showSuccess = $state(false);
	let showError = $state(false);
	let errorMessage = $state('');

	// State untuk mengontrol visibility form
	let selectedPackageType = $state('');
	let showDestinationSection = $state(false);
	let showDateSection = $state(false);
	let showUmrahSeasonSection = $state(false);
	let showUmrahCategorySection = $state(false);
	let showAirlineSection = $state(false);
	let showUmrahDateSection = $state(false);

	// Data untuk dropdown negeri dan bandar
	const negeri = [
		"Johor", "Kedah", "Kelantan", "Melaka", "Negeri Sembilan", 
		"Pahang", "Perak", "Perlis", "Pulau Pinang", "Sabah", 
		"Sarawak", "Selangor", "Terengganu", "Kuala Lumpur", "Labuan", "Putrajaya"
	];

	const bandar = {
		"Johor": ["Johor Bahru", "Batu Pahat", "Muar", "Segamat", "Kluang", "Kota Tinggi", "Pontian", "Kulai", "Mersing", "Tangkak"],
		"Kedah": ["Alor Setar", "Sungai Petani", "Kulim", "Langkawi", "Baling", "Bandar Baharu", "Kota Setar", "Kuala Muda", "Kubang Pasu", "Kulim", "Langkawi", "Padang Terap", "Pendang", "Pokok Sena", "Sik", "Yan"],
		"Kelantan": ["Kota Bharu", "Pasir Mas", "Tumpat", "Bachok", "Kuala Krai", "Machang", "Tanah Merah", "Pasir Puteh", "Gua Musang", "Jeli", "Kuala Krai", "Lojing"],
		"Melaka": ["Melaka Tengah", "Alor Gajah", "Jasin"],
		"Negeri Sembilan": ["Seremban", "Port Dickson", "Nilai", "Rembau", "Jelebu", "Jempol", "Tampin"],
		"Pahang": ["Kuantan", "Temerloh", "Bentong", "Raub", "Cameron Highlands", "Lipis", "Jerantut", "Maran", "Bera", "Rompin"],
		"Perak": ["Ipoh", "Taiping", "Teluk Intan", "Sungai Siput", "Kuala Kangsar", "Larut", "Kinta", "Hilir Perak", "Manjung", "Batang Padang", "Kuala Kangsar", "Hulu Perak", "Perak Tengah", "Kampar", "Bagan Datuk"],
		"Perlis": ["Kangar", "Arau"],
		"Pulau Pinang": ["George Town", "Butterworth", "Bukit Mertajam", "Bayan Lepas", "Nibong Tebal", "Balik Pulau"],
		"Sabah": ["Kota Kinabalu", "Sandakan", "Tawau", "Lahad Datu", "Keningau", "Kudat", "Beaufort", "Kota Belud", "Papar", "Tuaran", "Pitas", "Beluran", "Kinabatangan", "Kunak", "Semporna", "Tungku", "Sipitang", "Tenom", "Tambunan", "Kuala Penyu", "Penampang", "Putatan", "Ranau", "Kota Marudu", "Pensiangan", "Tambunan", "Nabawan", "Kuala Penyu", "Penampang", "Putatan", "Ranau", "Kota Marudu", "Pensiangan", "Tambunan", "Nabawan"],
		"Sarawak": ["Kuching", "Miri", "Sibu", "Bintulu", "Limbang", "Sri Aman", "Sarikei", "Kapit", "Mukah", "Betong", "Samarahan", "Asajaya", "Simunjan", "Serian", "Tebedu", "Lundu", "Bau", "Kuching", "Padawan", "Lundu", "Bau", "Kuching", "Padawan"],
		"Selangor": ["Shah Alam", "Petaling Jaya", "Subang Jaya", "Klang", "Ampang Jaya", "Kajang", "Selayang", "Sungai Buloh", "Kuala Selangor", "Sabak Bernam", "Hulu Selangor", "Gombak", "Petaling", "Klang", "Kuala Langat", "Sepang", "Hulu Langat"],
		"Terengganu": ["Kuala Terengganu", "Dungun", "Kemaman", "Besut", "Setiu", "Hulu Terengganu", "Marang", "Kuala Nerus"],
		"Kuala Lumpur": ["Kuala Lumpur"],
		"Labuan": ["Labuan"],
		"Putrajaya": ["Putrajaya"]
	};

	// Tailwind utility class constants (no external CSS)
	const controlClass = 'h-11 px-3 rounded-[10px] border border-[#e5e7eb] bg-white text-[14px] outline-none focus:border-[#942392] focus:[box-shadow:0_0_0_4px_rgba(148,35,146,0.18)]';
	const selectClass = 'h-11 px-3 pr-8 rounded-[10px] border border-[#e5e7eb] bg-white text-[14px] outline-none appearance-none bg-no-repeat bg-[right_12px_center] bg-[length:16px] focus:border-[#942392] focus:[box-shadow:0_0_0_4px_rgba(148,35,146,0.18)] bg-[url("data:image/svg+xml;charset=UTF-8,%3csvg xmlns=\'http://www.w3.org/2000/svg\' viewBox=\'0 0 24 24\' fill=\'none\' stroke=\'currentColor\' stroke-width=\'2\' stroke-linecap=\'round\' stroke-linejoin=\'round\'%3e%3cpolyline points=\'6,9 12,15 18,9\'%3e%3c/polyline%3e%3c/svg%3e")]';
	const labelClass = 'text-[13px] font-semibold text-gray-700';
	const fieldClass = 'flex flex-col gap-2';
	const actionsClass = 'col-span-full mt-2';
	const btnPrimaryClass = 'w-full h-[46px] border-0 rounded-[10px] text-white font-semibold tracking-wide bg-gradient-to-r from-[#942392] to-[#942392] shadow-[0_6px_14px_rgba(148,35,146,0.25)] cursor-pointer hover:brightness-105';
	const sectionDividerClass = 'col-span-full flex items-center gap-5 my-[30px]';
	const dividerLineClass = 'flex-1 h-px m-0 border-0 bg-gray-300';
	const sectionTitleClass = 'text-[18px] font-bold text-gray-700 m-0 whitespace-nowrap text-center';
	const pesertaSectionClass = 'col-span-full border border-[#e5e7eb] rounded-[10px] p-5 mb-4 bg-[#f9fafb]';
	const pesertaTitleClass = 'text-[16px] font-semibold text-gray-700 m-0 mb-4 pb-2 border-b-2 border-[#d1d5db]';
	const pesertaFieldsClass = 'grid grid-cols-2 gap-4 max-[720px]:grid-cols-1';
	const checkboxLabelClass = 'flex items-center gap-3 cursor-pointer text-sm text-gray-700';
	const checkboxInputClass = 'w-[18px] h-[18px] m-0 cursor-pointer focus:outline focus:outline-2 focus:outline-[#942392] outline-offset-2';
	const successBoxClass = 'bg-[#d1fae5] border border-[#10b981] rounded-[14px] p-7 text-center max-w-[720px] mx-auto';
	const successTitleClass = 'text-[#065f46] m-0 mb-3 text-2xl font-semibold';
	const successTextClass = 'text-[#047857] m-0 text-base';
	const errorBoxClass = 'bg-[#fee2e2] border border-[#ef4444] rounded-[10px] p-4 mb-5 text-[#dc2626] text-sm text-center';
	const pageWrapperClass = 'max-w-[1000px] mx-auto px-6 box-border pt-10';
	const cardClass = 'bg-white border border-[#e5e7eb] rounded-[14px] shadow-[0_10px_24px_rgba(17,24,39,0.06)] p-7 max-w-[720px] mx-auto mb-10';
	const formGridClass = 'grid grid-cols-2 gap-y-4 gap-x-5 max-[720px]:grid-cols-1';
	const pageTitleClass = 'text-center mb-5';
	const pageTitleH2Class = 'm-0 text-[28px] font-bold tracking-[0.4px]';

	// Data untuk umrah - sekarang menggunakan data dari database
	// const musimUmrah = [
	// 	"Ramadan",
	// 	"Syawal", 
	// 	"Zulhijjah",
	// 	"Zulkaedah",
	// 	"Rejab",
	// 	"Syaaban",
	// 	"Musim Biasa"
	// ];

	// Data kategori umrah - sekarang menggunakan data dari database
	// const kategoriUmrah = [
	// 	"Ekonomi",
	// 	"Standard", 
	// 	"Premium",
	// 	"VIP",
	// 	"Super VIP"
	// ];

	let selectedNegeri = $state('');
	let selectedBandar = $state('');
	let poskodValue = $state('');
	let poskodError = $state('');
	let poskodLoading = $state(false);
	let poskodValidated = $state(false);
	let selectedDestinasi = $state('');
	let selectedTarikh = $state('');
	let selectedBilangan = $state('');
	let selectedMusimUmrah = $state('');
	let selectedKategoriUmrah = $state('');
	let selectedAirline = $state('');
	let selectedTarikhUmrah = $state('');
	let perluPartnerBilik = $state(false);
	let selectedRoomType = $state('');
	let dynamicBandarList = $state([]);
	let dynamicNegeriList = $state([]);

	// Fallback static options if record does not include room info
	const fallbackRoomOptions = [
		{ value: 'single', label: 'Bilik Single' },
		{ value: 'double', label: 'Bilik Double/Twin' },
		{ value: 'triple', label: 'Bilik Triple' },
		{ value: 'quad', label: 'Bilik Quad' }
	];

	// Derived room options from selected umrah date record
	let dynamicRoomOptions = $state([]);

	function buildRoomOptionsFromRecord(record) {
		if (!record || typeof record !== 'object') return [];
		const options = [];
		// Build options from actual price columns in umrah_dates
		if (typeof record.double === 'number' && record.double > 0) {
			options.push({ value: 'double', label: `Bilik Double/Twin (RM ${formatPrice(record.double)})` });
		}
		if (typeof record.triple === 'number' && record.triple > 0) {
			options.push({ value: 'triple', label: `Bilik Triple (RM ${formatPrice(record.triple)})` });
		}
		if (typeof record.quadruple === 'number' && record.quadruple > 0) {
			options.push({ value: 'quad', label: `Bilik Quad (RM ${formatPrice(record.quadruple)})` });
		}
		if (typeof record.single === 'number' && record.single > 0) {
			options.push({ value: 'single', label: `Bilik Single (RM ${formatPrice(record.single)})` });
		}
		return options;
	}
	// Recompute dynamic options when selectedTarikhUmrah changes
	$effect(() => {
		if (!selectedTarikhUmrah) {
			dynamicRoomOptions = [];
			return;
		}
		const rec = filteredUmrahDates.find(d => String(d.id) === String(selectedTarikhUmrah));
		const built = buildRoomOptionsFromRecord(rec);
		dynamicRoomOptions = built.length > 0 ? built : fallbackRoomOptions;
	});
	
	// State untuk filtered dates
	let filteredOutboundDates = $state([]);
	let filteredUmrahDates = $state([]);
	
	// State untuk data peserta
	let pesertaData = $state([]);
	
	// State untuk peserta 1 (selalu ada)
	let peserta1 = $state({
		id: 1,
		nama: '',
		nokp: '',
		cwb: false,
		infant: false,
		cnb: false
	});
	
	// State untuk samakan data checkbox
	let samakanData = $state(true);
	
	// State untuk form utama (untuk sync dengan Peserta 1)
	let mainFormData = $state({
		nama: '',
		nokp: ''
	});
	
	// Effect untuk mengontrol visibility berdasarkan pilihan paket
	$effect(() => {
		console.log('=== PACKAGE SELECTION DEBUG ===');
		console.log('selectedPackageType:', selectedPackageType);
		console.log('selectedPackageType type:', typeof selectedPackageType);
		
		if (selectedPackageType) {
			// Cek apakah paket yang dipilih adalah pelancongan atau umrah
			const selectedPackage = packageTypes.find(p => String(p.id) === String(selectedPackageType));
			console.log('Selected Package Found:', selectedPackage);
			console.log('All Package Types:', packageTypes);
			
			if (selectedPackage) {
				const packageName = selectedPackage.name.toLowerCase();
				if (packageName.includes('pelancongan') || packageName.includes('outbound')) {
					showDestinationSection = true;
					showUmrahSeasonSection = false;
					showUmrahCategorySection = false;
					showAirlineSection = false;
					showUmrahDateSection = false;
				} else if (packageName.includes('umrah')) {
					showDestinationSection = false;
					showUmrahSeasonSection = true;
					showUmrahCategorySection = false;
					showAirlineSection = false;
					showUmrahDateSection = false;
				} else {
					// Paket lain (jika ada)
					showDestinationSection = false;
					showUmrahSeasonSection = false;
					showUmrahCategorySection = false;
					showAirlineSection = false;
					showUmrahDateSection = false;
				}
			}
		} else {
			showDestinationSection = false;
			showDateSection = false;
			showUmrahSeasonSection = false;
			showUmrahCategorySection = false;
			showAirlineSection = false;
			showUmrahDateSection = false;
			selectedDestinasi = '';
			selectedTarikh = '';
			selectedMusimUmrah = '';
			selectedKategoriUmrah = '';
			selectedAirline = '';
			selectedTarikhUmrah = '';
		}
	});

	// Effect untuk mengontrol visibility kategori umrah berdasarkan pilihan musim
	$effect(() => {
		if (selectedMusimUmrah && showUmrahSeasonSection) {
			showUmrahCategorySection = true;
		} else {
			showUmrahCategorySection = false;
			selectedKategoriUmrah = '';
		}
	});

	// Effect untuk mengontrol visibility airline berdasarkan pilihan kategori umrah
	$effect(() => {
		if (selectedKategoriUmrah && showUmrahCategorySection) {
			showAirlineSection = true;
		} else {
			showAirlineSection = false;
			showUmrahDateSection = false;
			selectedAirline = '';
			selectedTarikhUmrah = '';
		}
	});

	// Effect untuk mengontrol visibility tarikh umrah berdasarkan pilihan airline
	$effect(() => {
		if (selectedAirline && showAirlineSection) {
			showUmrahDateSection = true;
		} else {
			showUmrahDateSection = false;
			selectedTarikhUmrah = '';
		}
	});

	$effect(() => {
		if (!selectedTarikhUmrah) {
			selectedRoomType = '';
		}
	});

	// Effect untuk mengontrol visibility tarikh berdasarkan pilihan destinasi
	$effect(() => {
		if (selectedDestinasi && showDestinationSection) {
			showDateSection = true;
		} else {
			showDateSection = false;
			selectedTarikh = '';
		}
	});
	
	// Effect untuk filter tarikh pelancongan berdasarkan destinasi yang dipilih
	$effect(() => {
		if (!selectedDestinasi) {
			filteredOutboundDates = [];
			return;
		}
		
		// Debug: log data untuk troubleshooting
		console.log('Selected Destinasi:', selectedDestinasi);
		console.log('All Pelancongan Dates:', outboundDates);
		
		const filtered = outboundDates.filter((date) => {
			// Pastikan destination_id ada dan cocok dengan destinasi yang dipilih
			const matches = date.destination_id === selectedDestinasi;
			console.log(`Date ${date.id}: destination_id=${date.destination_id}, selected=${selectedDestinasi}, matches=${matches}`);
			return matches;
		});
		
		console.log('Filtered Dates:', filtered);
		filteredOutboundDates = filtered;
	});

	// Effect untuk filter umrah dates berdasarkan musim, kategori, dan airline yang dipilih
	$effect(() => {
		if (!selectedMusimUmrah || !selectedKategoriUmrah || !selectedAirline) {
			filteredUmrahDates = [];
			return;
		}

		const filtered = umrahDates.filter(date => {
			return String(date.umrah_season_id) === String(selectedMusimUmrah) && 
				   String(date.umrah_category_id) === String(selectedKategoriUmrah) && 
				   String(date.airline_id) === String(selectedAirline);
		});
		
		console.log('Filtered Umrah Dates:', filtered);
		filteredUmrahDates = filtered;
	});

	// Effect untuk reset data peserta ketika tarikh pelancongan atau tarikh umrah berubah
	$effect(() => {
		if (!selectedTarikh && !selectedTarikhUmrah) {
			selectedBilangan = '';
			pesertaData = [];
		}
		// Removed automatic setting of selectedBilangan to '1'
		// Now user must explicitly select the number of participants
	});

	// Effect untuk mengupdate data peserta ketika bilangan berubah
	$effect(() => {
		if (selectedBilangan) {
			// Jika user memilih bilangan 1, maka tampilkan 1 peserta tambahan (peserta 2)
			// Jika user memilih bilangan 2, maka tampilkan 2 peserta tambahan (peserta 2 + peserta 3)
			// Dan seterusnya
			const jumlahPesertaTambahan = parseInt(selectedBilangan);
			updatePesertaData(jumlahPesertaTambahan);
		} else {
			pesertaData = [];
		}
	});
	
	// Effect untuk samakan data ke Peserta 1
	$effect(() => {
		if (samakanData) {
			// Copy data dari form utama ke Peserta 1
			peserta1.nama = mainFormData.nama;
			peserta1.nokp = mainFormData.nokp;
		}
	});

	// Debug: log data ketika komponen dimuat
	$effect(() => {
		console.log('=== DEBUG DATA ===');
		console.log('Package Types:', packageTypes);
		console.log('Package Types Length:', packageTypes.length);
		console.log('Selected Package Type:', selectedPackageType);
		console.log('Destinations:', destinations);
		console.log('Pelancongan Dates:', outboundDates);
		console.log('Umrah Seasons:', umrahSeasons);
		console.log('Umrah Categories:', umrahCategories);
		console.log('Airlines:', airlines);
		console.log('Umrah Dates:', umrahDates);
		console.log('Selected Destinasi:', selectedDestinasi);
		console.log('Filtered Pelancongan Dates:', filteredOutboundDates);
		console.log('Filtered Length:', filteredOutboundDates.length);
		console.log('Selected Musim Umrah:', selectedMusimUmrah);
		console.log('Selected Kategori Umrah:', selectedKategoriUmrah);
		console.log('Selected Airline:', selectedAirline);
		// console.log('Filtered Umrah Dates:', filteredUmrahDates);
		// console.log('Filtered Umrah Dates Length:', filteredUmrahDates.length);
		
		// Debug struktur data destinations
		if (destinations.length > 0) {
			console.log('First Destination:', destinations[0]);
			console.log('First Destination ID:', destinations[0].id);
			console.log('First Destination ID Type:', typeof destinations[0].id);
		}
		
		// Debug struktur data tarikh pelancongan
		if (outboundDates.length > 0) {
			console.log('First Pelancongan Date:', outboundDates[0]);
			console.log('First Pelancongan Date destination_id:', outboundDates[0].destination_id);
			console.log('First Pelancongan Date destination_id Type:', typeof outboundDates[0].destination_id);
		}
		
		// Debug struktur data umrah seasons
		if (umrahSeasons.length > 0) {
			console.log('First Umrah Season:', umrahSeasons[0]);
		}
		
		// Debug struktur data umrah categories
		if (umrahCategories.length > 0) {
			console.log('First Umrah Category:', umrahCategories[0]);
		}

		// Debug struktur data airlines
		if (airlines.length > 0) {
			console.log('First Airline:', airlines[0]);
		}

		// Debug struktur data package types
		if (packageTypes.length > 0) {
			console.log('First Package Type:', packageTypes[0]);
			console.log('First Package Type ID:', packageTypes[0].id);
			console.log('First Package Type ID Type:', typeof packageTypes[0].id);
			console.log('First Package Type Name:', packageTypes[0].name);
		}

		// Debug struktur data umrah dates
		// if (umrahDates.length > 0) {
		// 	console.log('First Umrah Date:', umrahDates[0]);
		// }
		
		// Debug untuk field bilangan peserta
		console.log('=== BILANGAN PESERTA DEBUG ===');
		console.log('showDateSection:', showDateSection);
		console.log('selectedTarikh:', selectedTarikh);
		console.log('showUmrahDateSection:', showUmrahDateSection);
		console.log('selectedTarikhUmrah:', selectedTarikhUmrah);
		console.log('selectedBilangan:', selectedBilangan);
		console.log('Condition for showing bilangan field:', (showDateSection && selectedTarikh) || (showUmrahDateSection && selectedTarikhUmrah));
		console.log('================================');
		
		console.log('==================');
	});

	function handlePhoneInput(event) {
		event.target.value = event.target.value.replace(/[^0-9]/g, '');
	}

	function handlePhoneKeyPress(event) {
		if (!/[0-9]/.test(event.key)) {
			event.preventDefault();
		}
	}

	function handleIdInput(event) {
		event.target.value = event.target.value.replace(/[^0-9]/g, '');
	}

	function handleIdKeyPress(event) {
		if (!/[0-9]/.test(event.key)) {
			event.preventDefault();
		}
	}

	function handlePostcodeInput(event) {
		// Hanya digit dan maksimum 5 aksara
		const digitsOnly = event.target.value.replace(/[^0-9]/g, '');
		const next = digitsOnly.slice(0, 5);
		event.target.value = next;
		poskodValue = next;
		
		// Clear error and reset negeri/bandar when user starts typing
		if (poskodError) {
			poskodError = '';
		}
		
		// Reset validation state when postcode changes
		if (poskodValue !== next) {
			poskodValidated = false;
			selectedNegeri = '';
			selectedBandar = '';
			dynamicNegeriList = [];
			dynamicBandarList = [];
		}
		
		if (next.length === 5) {
			lookupPostcode(next);
		}
	}

	function handlePostcodeKeyPress(event) {
		const isDigit = /[0-9]/.test(event.key);
		const currentLength = event.currentTarget.value.replace(/[^0-9]/g, '').length;
		if (!isDigit || currentLength >= 5) {
			event.preventDefault();
		}
	}

	async function lookupPostcode(code) {
		try {
			// Reset error state and set loading
			poskodError = '';
			poskodLoading = true;
			poskodValidated = false;
			
			const res = await fetch(`/api/postcode?poskod=${encodeURIComponent(code)}`);
			if (!res.ok) {
				poskodError = 'Ralat semasa mencari poskod. Sila cuba lagi.';
				poskodValidated = true;
				return;
			}
			
			const data = await res.json();
			
			// Check if data exists and has negeri/bandar
			if (!data || (!data.negeriList && !data.bandarList)) {
				poskodError = 'Poskod tidak ditemukan dalam pangkalan data. Sila pastikan poskod yang dimasukkan adalah betul.';
				dynamicNegeriList = [];
				dynamicBandarList = [];
				selectedNegeri = '';
				selectedBandar = '';
				poskodValidated = true;
				return;
			}
			
			// Check if arrays are empty
			if ((!data.negeriList || data.negeriList.length === 0) && 
				(!data.bandarList || data.bandarList.length === 0)) {
				poskodError = 'Poskod tidak ditemukan dalam pangkalan data. Sila pastikan poskod yang dimasukkan adalah betul.';
				dynamicNegeriList = [];
				dynamicBandarList = [];
				selectedNegeri = '';
				selectedBandar = '';
				poskodValidated = true;
				return;
			}
			
			if (Array.isArray(data?.negeriList)) {
				dynamicNegeriList = data.negeriList;
			}
			if (data?.negeri) {
				selectedNegeri = data.negeri;
			} else if (Array.isArray(data?.negeriList) && data.negeriList.length > 0) {
				selectedNegeri = data.negeriList[0];
			}
			if (Array.isArray(data?.bandarList) && data.bandarList.length > 0) {
				dynamicBandarList = data.bandarList;
				selectedBandar = data.bandarList[0];
			}
			
			// Mark as validated successfully
			poskodValidated = true;
		} catch (e) {
			poskodError = 'Ralat rangkaian. Sila cuba lagi.';
			poskodValidated = true;
			// ignore network errors
		} finally {
			poskodLoading = false;
		}
	}

	function handleNameInput(event) {
		// Hanya huruf dan ruang dibenarkan
		event.target.value = event.target.value.replace(/[^\p{L}\s]/gu, '');
	}

	function handleNameKeyPress(event) {
		if (!/[\p{L}\s]/u.test(event.key)) {
			event.preventDefault();
		}
	}

	// Format date untuk display
	function formatDate(dateString) {
		const date = new Date(dateString);
		return date.toLocaleDateString('ms-MY', {
			day: '2-digit',
			month: '2-digit',
			year: 'numeric'
		});
	}

	// Format price untuk display
	function formatPrice(priceString) {
		if (!priceString) return '0';
		// Handle format price yang berbeda (ada yang "12.000" dan ada yang "45")
		const price = parseFloat(priceString);
		if (isNaN(price)) return priceString;
		return price.toLocaleString('ms-MY');
	}

	// Function untuk mengupdate data peserta berdasarkan jumlah
	function updatePesertaData(bilangan) {
		const jumlah = parseInt(bilangan) || 0;
		// Buat array peserta tambahan (mulai dari peserta 2)
		pesertaData = Array.from({ length: jumlah }, (_, index) => ({
			id: index + 2, // Mulai dari ID 2 karena peserta 1 sudah ada
			nama: '',
			nokp: '',
			cwb: false,
			infant: false,
			cnb: false
		}));
	}
</script>

<section class="max-w-[1000px] mx-auto px-6 box-border pt-10">
	<div class="text-center mb-5">
		<h2 class="m-0 text-[28px] font-bold tracking-[0.4px]">ISI MAKLUMAT ANDA</h2>
	</div>

	{#if showSuccess}
		<div class="bg-[#d1fae5] border border-[#10b981] rounded-[14px] p-7 text-center max-w-[720px] mx-auto">
			<h3 class="text-[#065f46] m-0 mb-3 text-2xl font-semibold">Terima Kasih!</h3>
			<p class="text-[#047857] m-0 text-base">Maklumat anda berjaya dihantar.</p>
		</div>
	{:else}
		<div class="bg-white border border-[#e5e7eb] rounded-[14px] shadow-[0_10px_24px_rgba(17,24,39,0.06)] p-7 max-w-[720px] mx-auto mb-10">
			<form class="grid grid-cols-2 gap-y-4 gap-x-5 max-[720px]:grid-cols-1" method="POST" use:enhance={() => {
				return async ({ result, cancel }) => {
					// Prevent form submission if there's a postcode error or incomplete postcode
					if (poskodError || poskodValue.length !== 5) {
						if (poskodValue.length !== 5) {
							poskodError = 'Sila masukkan poskod 5 digit yang lengkap';
						}
						cancel();
						return;
					}
					
					if (result.type === 'success') {
						showSuccess = true;
						showError = false;
					} else if (result.type === 'failure') {
						showError = true;
						errorMessage = result.data?.error || 'Ralat berlaku. Sila cuba lagi.';
					}
				};
			}}>
			<div class="flex flex-col gap-2">
				<label class="text-[13px] font-semibold text-gray-700" for="gelaran">Gelaran<span class="text-red-500 ml-1">*</span></label>
				<select class={selectClass} id="gelaran" name="gelaran" required>
					<option value="">Pilih Gelaran</option>
					<option>Cik</option>
					<option>Encik</option>
					<option>Puan</option>
					<option>Tuan</option>
					<option>Datin</option>
					<option>Dato</option>
				</select>
			</div>

			<div class="flex flex-col gap-2">
				<label class="text-[13px] font-semibold text-gray-700" for="nama">Nama<span class="text-red-500 ml-1">*</span></label>
				<input 
					id="nama" 
					name="nama" 
					type="text" 
					placeholder="Nama Penuh" 
					required 
					bind:value={mainFormData.nama}
					oninput={handleNameInput} 
					onkeypress={handleNameKeyPress}
					class={controlClass}
				/>
			</div>

			<div class="flex flex-col gap-2">
				<label class="text-[13px] font-semibold text-gray-700" for="nokp">No K/P<span class="text-red-500 ml-1">*</span></label>
				<input 
					id="nokp" 
					name="nokp" 
					type="text" 
					placeholder="Contoh: 970109015442" 
					maxlength="12"
					required 
					bind:value={mainFormData.nokp}
					oninput={handleIdInput}
					onkeypress={handleIdKeyPress}
					class={controlClass}
				/>
			</div>

			<div class="flex flex-col gap-2">
				<label class="text-[13px] font-semibold text-gray-700" for="telefon">Telefon<span class="text-red-500 ml-1">*</span></label>
				<input 
					id="telefon" 
					name="telefon" 
					type="tel" 
					placeholder="Contoh: 0177285445" 
					required 
					oninput={handlePhoneInput}
					onkeypress={handlePhoneKeyPress}
					class={controlClass}
				/>
			</div>

			<div class="flex flex-col gap-2">
				<label class="text-[13px] font-semibold text-gray-700" for="email">Email<span class="text-red-500 ml-1">*</span></label>
				<input 
					id="email" 
					name="email" 
					type="email" 
					placeholder="Contoh: aziah@gmail.com" 
					required 
					class={controlClass}
				/>
			</div>

			<div class="flex flex-col gap-2">
				<label class="text-[13px] font-semibold text-gray-700" for="alamat">ALAMAT<span class="text-red-500 ml-1">*</span></label>
				<input 
					id="alamat" 
					name="alamat" 
					type="text" 
					placeholder="Nombor Rumah" 
					required 
					class={controlClass}
				/>
			</div>

			<div class="flex flex-col gap-2">
				<label class="text-[13px] font-semibold text-gray-700" for="poskod">Poskod<span class="text-red-500 ml-1">*</span></label>
				<div class="relative">
					<input 
						id="poskod" 
						name="poskod" 
						type="text" 
						placeholder="Masukkan 5 digit poskod" 
						maxlength="5"
						required 
						oninput={handlePostcodeInput}
						onkeypress={handlePostcodeKeyPress}
						onfocus={() => {
						// Only clear error if postcode hasn't been validated yet
						// or if user is typing a new postcode
						if (!poskodValidated || poskodValue.length < 5) {
							poskodError = '';
						}
					}}
					onblur={() => {
						if (poskodValue.length === 0) {
							poskodValidated = false;
							selectedNegeri = '';
							selectedBandar = '';
							dynamicNegeriList = [];
							dynamicBandarList = [];
						}
					}}
						class={`${controlClass} ${poskodError ? 'border-red-500 focus:border-red-500 focus:[box-shadow:0_0_0_4px_rgba(239,68,68,0.18)]' : ''}`}
					/>
					{#if poskodLoading}
						<div class="absolute right-3 top-1/2 transform -translate-y-1/2">
							<div class="animate-spin rounded-full h-4 w-4 border-2 border-gray-300 border-t-[#942392]"></div>
						</div>
					{/if}
				</div>
				{#if poskodError}
					<div class="text-red-500 text-sm mt-1 flex items-start gap-2">
						<svg class="w-4 h-4 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
							<path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clip-rule="evenodd"></path>
						</svg>
						<span>{poskodError}</span>
					</div>
				{/if}
				{#if poskodValue.length === 5 && !poskodError && !poskodLoading && poskodValidated}
					<div class="text-green-600 text-sm mt-1 flex items-start gap-2">
						<svg class="w-4 h-4 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
							<path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"></path>
						</svg>
						<span>Poskod ditemukan! Negeri dan Bandar telah dipilih secara automatik.</span>
					</div>
				{/if}
				{#if poskodValue.length > 0 && poskodValue.length < 5}
					<div class="text-blue-600 text-sm mt-1 flex items-start gap-2">
						<svg class="w-4 h-4 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
							<path fill-rule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clip-rule="evenodd"></path>
						</svg>
						<span>Sila masukkan {5 - poskodValue.length} digit lagi untuk mencari poskod</span>
					</div>
				{/if}
			</div>

			<div class="flex flex-col gap-2">
				<label class="text-[13px] font-semibold text-gray-700" for="negeri">Negeri<span class="text-red-500 ml-1">*</span></label>
				<select class={`${selectClass} ${!(Array.isArray(dynamicNegeriList) && dynamicNegeriList.length > 0) ? 'bg-gray-100 text-gray-500 cursor-not-allowed' : ''}`} id="negeri" name="negeri" bind:value={selectedNegeri} required disabled={!(Array.isArray(dynamicNegeriList) && dynamicNegeriList.length > 0)} onchange={() => {
					// Only clear postcode error if negeri is selected and postcode is valid
					if (selectedNegeri && poskodError && poskodValidated && !poskodLoading) {
						poskodError = '';
					}
				}}>
					<option value="">{!(Array.isArray(dynamicNegeriList) && dynamicNegeriList.length > 0) ? 'Sila masukkan poskod yang sah terlebih dahulu' : 'Select Negeri'}</option>
					{#if Array.isArray(dynamicNegeriList) && dynamicNegeriList.length > 0}
						{#each dynamicNegeriList as n}
							<option value={n}>{n}</option>
						{/each}
					{/if}
				</select>
				{#if !(Array.isArray(dynamicNegeriList) && dynamicNegeriList.length > 0)}
					<div class="text-gray-500 text-xs mt-1">Negeri akan dipilih secara automatik selepas poskod yang sah dimasukkan</div>
				{/if}
			</div>

			<div class="flex flex-col gap-2">
				<label class="text-[13px] font-semibold text-gray-700" for="bandar">Bandar<span class="text-red-500 ml-1">*</span></label>
				<select class={`${selectClass} ${!selectedNegeri || !(Array.isArray(dynamicBandarList) && dynamicBandarList.length > 0) ? 'bg-gray-100 text-gray-500 cursor-not-allowed' : ''}`} id="bandar" name="bandar" required disabled={!selectedNegeri || !(Array.isArray(dynamicBandarList) && dynamicBandarList.length > 0)} bind:value={selectedBandar} onchange={() => {
					// Only clear postcode error if bandar is selected and postcode is valid
					if (selectedBandar && poskodError && poskodValidated && !poskodLoading) {
						poskodError = '';
					}
				}}>
					<option value="">{!selectedNegeri ? 'Sila pilih negeri terlebih dahulu' : !(Array.isArray(dynamicBandarList) && dynamicBandarList.length > 0) ? 'Sila masukkan poskod yang sah terlebih dahulu' : 'Select Bandar'}</option>
					{#if Array.isArray(dynamicBandarList) && dynamicBandarList.length > 0}
						{#each dynamicBandarList as b}
							<option value={b}>{b}</option>
						{/each}
					{/if}
				</select>
				{#if !selectedNegeri || !(Array.isArray(dynamicBandarList) && dynamicBandarList.length > 0)}
					<div class="text-gray-500 text-xs mt-1">
						{!selectedNegeri ? 'Bandar akan dipilih secara automatik selepas negeri dipilih' : 'Bandar akan dipilih secara automatik selepas poskod yang sah dimasukkan'}
					</div>
				{/if}
			</div>

			<div class="flex flex-col gap-2">
				<label class="text-[13px] font-semibold text-gray-700" for="cawangan">Cawangan<span class="text-red-500 ml-1">*</span></label>
				<select class={selectClass} id="cawangan" name="cawangan" required>
					<option value="">Pilih Cawangan Anda</option>
					{#each branches as b}
						<option value={b.id}>{b.name}</option>
					{/each}
				</select>
			</div>

			<div class="col-span-full">
				<label class="flex items-center gap-3 cursor-pointer text-sm text-gray-700">
					<input type="checkbox" name="tambah_sebagai_peserta_1" bind:checked={samakanData} class={checkboxInputClass} />
					<span>Tambahkan sebagai peserta 1</span>
				</label>
			</div>

			<div class="col-span-full flex items-center gap-5 my-[30px]">
				<hr class="flex-1 h-px m-0 border-0 bg-gray-300">
				<h3 class="text-[18px] font-bold text-gray-700 m-0 whitespace-nowrap text-center">SILA PILIH PAKEJ ANDA</h3>
				<hr class="flex-1 h-px m-0 border-0 bg-gray-300">
			</div>

			<div class="flex flex-col gap-2">
				<label class="text-[13px] font-semibold text-gray-700" for="pakej">Jenis Pakej<span class="text-red-500 ml-1">*</span></label>
				<select class={selectClass} id="pakej" name="pakej" required bind:value={selectedPackageType} onchange={() => {
					console.log('Package dropdown changed to:', selectedPackageType);
				}}>
					<option value="">Pilihan Jenis Pakej</option>
					{#each packageTypes as p}
						<option value={String(p.id)}>{p.name.replace(/outbound/ig, 'Pelancongan')}</option>
					{/each}
				</select>
			</div>

			{#if showDestinationSection}
				<div class="flex flex-col gap-2">
					<label class="text-[13px] font-semibold text-gray-700" for="destinasi">Destinasi<span class="text-red-500 ml-1">*</span></label>
					<select class={selectClass} id="destinasi" name="destinasi" required bind:value={selectedDestinasi} onchange={() => { selectedTarikh = ''; }}>
						<option value="">Pilih Destinasi</option>
						{#each destinations as d}
							<option value={String(d.id)}>{d.name}</option>
						{/each}
					</select>
				</div>
			{/if}



			{#if showUmrahSeasonSection}
				<div class="flex flex-col gap-2">
					<label class="text-[13px] font-semibold text-gray-700" for="musim_umrah">Musim Umrah<span class="text-red-500 ml-1">*</span></label>
					<select class={selectClass} id="musim_umrah" name="musim_umrah" required bind:value={selectedMusimUmrah} onchange={() => { selectedKategoriUmrah = ''; }}>
						<option value="">Pilih Musim Umrah</option>
						{#each umrahSeasons as season}
							<option value={String(season.id)}>{season.name}</option>
						{/each}
					</select>
				</div>
			{/if}

			{#if showUmrahCategorySection}
				<div class="flex flex-col gap-2">
					<label class="text-[13px] font-semibold text-gray-700" for="kategori_umrah">Kategori Umrah<span class="text-red-500 ml-1">*</span></label>
					<select class={selectClass} id="kategori_umrah" name="kategori_umrah" required bind:value={selectedKategoriUmrah} onchange={() => { selectedAirline = ''; selectedTarikhUmrah = ''; }}>
						<option value="">Pilih Kategori Umrah</option>
						{#each umrahCategories as category}
							<option value={String(category.id)}>{category.name}</option>
						{/each}
					</select>
				</div>
			{/if}

			{#if showAirlineSection}
				<div class="flex flex-col gap-2">
					<label class="text-[13px] font-semibold text-gray-700" for="airline">Airline<span class="text-red-500 ml-1">*</span></label>
					<select class={selectClass} id="airline" name="airline" required bind:value={selectedAirline} onchange={() => { selectedTarikhUmrah = ''; }}>
						<option value="">Pilih Airline</option>
						{#each airlines as airline}
							<option value={String(airline.id)}>{airline.name}</option>
						{/each}
					</select>
				</div>
			{/if}

			{#if showUmrahDateSection}
				<div class="flex flex-col gap-2">
					<label class="text-[13px] font-semibold text-gray-700" for="tarikh_umrah">Tarikh Umrah<span class="text-red-500 ml-1">*</span></label>
					<select class={selectClass} id="tarikh_umrah" name="tarikh_umrah" required disabled={!selectedAirline || filteredUmrahDates.length === 0} bind:value={selectedTarikhUmrah}>
						<option value="">Pilih Tarikh</option>
						{#each filteredUmrahDates as date}
							<option value={String(date.id)}>{formatDate(date.start_date)} - {formatDate(date.end_date)}</option>
						{/each}
						{#if selectedAirline && filteredUmrahDates.length === 0}
							<option value="" disabled>Tiada tarikh tersedia untuk pilihan ini</option>
						{/if}
					</select>
				</div>
			{/if}

			{#if showDateSection}
				<div class="flex flex-col gap-2">
					<label class="text-[13px] font-semibold text-gray-700" for="tarikh_berlepas">Tarikh Pelancongan<span class="text-red-500 ml-1">*</span></label>
					<select class={selectClass} id="tarikh_berlepas" name="tarikh_berlepas" required disabled={!selectedDestinasi || filteredOutboundDates.length === 0} bind:value={selectedTarikh}>
						<option value="">Pilih Tarikh</option>
						{#each filteredOutboundDates as date}
							<option value={String(date.id)}>{formatDate(date.start_date)} - {formatDate(date.end_date)} (RM {formatPrice(date.price)})</option>
						{/each}
						{#if selectedDestinasi && filteredOutboundDates.length === 0}
							<option value="" disabled>Tiada tarikh tersedia untuk destinasi ini</option>
						{/if}
					</select>
				</div>
			{/if}

			{#if selectedTarikh || selectedTarikhUmrah}
				{#if selectedTarikhUmrah}
					<div class="flex flex-col gap-2">
						<label class="text-[13px] font-semibold text-gray-700" for="pilih_bilik">Pilih Bilik<span class="text-red-500 ml-1">*</span></label>
						<select class={selectClass} id="pilih_bilik" name="pilih_bilik" required bind:value={selectedRoomType} disabled={(dynamicRoomOptions?.length || 0) === 0}>
							<option value="">Pilih Jenis Bilik</option>
							{#each dynamicRoomOptions.length > 0 ? dynamicRoomOptions : fallbackRoomOptions as opt}
								<option value={opt.value}>{opt.label}</option>
							{/each}
						</select>
					</div>
				{/if}

				<div class="flex flex-col gap-2">
					<label class="text-[13px] font-semibold text-gray-700" for="bilangan">Bilangan Peserta Yang Akan Mengikuti<span class="text-red-500 ml-1">*</span></label>
					<select class={selectClass} id="bilangan" name="bilangan" required bind:value={selectedBilangan}>
						<option value="">Pilih Bilangan Peserta</option>
						{#each Array.from({length: 21}, (_, i) => i) as num}
							<option value={num}>{num}</option>
						{/each}
					</select>
				</div>

				{#if selectedBilangan}
					<div class="col-span-full">
						<label class="flex items-center gap-3 cursor-pointer text-sm text-gray-700">
							<input type="checkbox" name="perlu_partner_bilik" bind:checked={perluPartnerBilik} class={checkboxInputClass} />
							<span>Perlukah partner bilik?</span>
						</label>
					</div>
				{/if}
			{/if}

			<div class="col-span-full flex items-center gap-5 my-[30px]">
				<hr class="flex-1 h-px m-0 border-0 bg-gray-300">
				<h3 class="text-[18px] font-bold text-gray-700 m-0 whitespace-nowrap text-center">MAKLUMAT PESERTA</h3>
				<hr class="flex-1 h-px m-0 border-0 bg-gray-300">
			</div>

			{#if samakanData}
				<div class="flex flex-col gap-2">
					<p class="text-xs text-emerald-600 mt-2 italic">Data pendaftar akan ditambahkan sebagai Peserta 1</p>
				</div>
			{/if}

			<div class="col-span-full border border-[#e5e7eb] rounded-[10px] p-5 mb-4 bg-[#f9fafb]">
				<h4 class="text-[16px] font-semibold text-gray-700 m-0 mb-4 pb-2 border-b-2 border-[#d1d5db]">
					Peserta 1
					{#if samakanData}
						<span class="bg-[#059669] text-white text-[10px] px-2 py-[2px] rounded-full ml-2">Data Disalin</span>
					{/if}
				</h4>
				<div class="grid grid-cols-2 gap-4 max-[720px]:grid-cols-1">
					<div class="flex flex-col gap-2">
						<label class="text-[13px] font-semibold text-gray-700" for="peserta_nama_1">Nama Peserta 1<span class="text-red-500 ml-1">*</span></label>
						<input 
							id="peserta_nama_1" 
							name="peserta_nama_1" 
							type="text" 
							placeholder="Nama Penuh Peserta 1" 
							required 
							bind:value={peserta1.nama}
							oninput={handleNameInput}
							onkeypress={handleNameKeyPress}
							readonly={samakanData}
							class={samakanData ? controlClass + ' bg-gray-100 text-gray-500 cursor-not-allowed focus:border-[#d1d5db] focus:shadow-none' : controlClass}
						/>
					</div>
					<div class="flex flex-col gap-2">
						<label class="text-[13px] font-semibold text-gray-700" for="peserta_nokp_1">No K/P Peserta 1<span class="text-red-500 ml-1">*</span></label>
						<input 
							id="peserta_nokp_1" 
							name="peserta_nokp_1" 
							type="text" 
							placeholder="Contoh: 970109015442" 
							maxlength="12"
							required 
							bind:value={peserta1.nokp}
							oninput={handleIdInput}
							onkeypress={handleIdKeyPress}
							readonly={samakanData}
							class={samakanData ? controlClass + ' bg-gray-100 text-gray-500 cursor-not-allowed focus:border-[#d1d5db] focus:shadow-none' : controlClass}
						/>
					</div>
				</div>
			</div>

			{#if selectedBilangan && pesertaData.length > 0}
				{#each pesertaData as peserta, index}
					<div class="col-span-full border border-[#e5e7eb] rounded-[10px] p-5 mb-4 bg-[#f9fafb]">
						<h4 class="text-[16px] font-semibold text-gray-700 m-0 mb-4 pb-2 border-b-2 border-[#d1d5db]">
							Peserta {peserta.id}
						</h4>
						<div class="grid grid-cols-2 gap-4 max-[720px]:grid-cols-1">
							<div class="flex flex-col gap-2">
								<label class="text-[13px] font-semibold text-gray-700" for="peserta_nama_{peserta.id}">Nama Peserta {peserta.id}<span class="text-red-500 ml-1">*</span></label>
								<input 
									id="peserta_nama_{peserta.id}" 
									name="peserta_nama_{peserta.id}" 
									type="text" 
									placeholder="Nama Penuh Peserta {peserta.id}" 
									required 
									bind:value={peserta.nama}
									oninput={handleNameInput}
									onkeypress={handleNameKeyPress}
									class={controlClass}
								/>
							</div>
							<div class="flex flex-col gap-2">
								<label class="text-[13px] font-semibold text-gray-700" for="peserta_nokp_{peserta.id}">No K/P Peserta {peserta.id}<span class="text-red-500 ml-1">*</span></label>
								<input 
									id="peserta_nokp_{peserta.id}" 
									name="peserta_nokp_{peserta.id}" 
									type="text" 
									placeholder="Contoh: 970109015442" 
									maxlength="12"
									required 
									bind:value={peserta.nokp}
									oninput={handleIdInput}
									onkeypress={handleIdKeyPress}
									class={controlClass}
								/>
							</div>
						</div>
						<div class="col-span-full mt-4">
							<p class="text-[13px] font-semibold text-gray-700 mb-2">Kategori Peserta:</p>
							<div class="flex flex-wrap gap-4 max-[720px]:flex-col max-[720px]:gap-3">
								<label class="flex items-center gap-3 cursor-pointer text-sm text-gray-700">
									<input type="checkbox" name="peserta_cwb_{peserta.id}" bind:checked={peserta.cwb} class={checkboxInputClass} />
									<span>CWB (Child with Bag)</span>
								</label>
								<label class="flex items-center gap-3 cursor-pointer text-sm text-gray-700">
									<input type="checkbox" name="peserta_infant_{peserta.id}" bind:checked={peserta.infant} class={checkboxInputClass} />
									<span>Infant</span>
								</label>
								<label class="flex items-center gap-3 cursor-pointer text-sm text-gray-700">
									<input type="checkbox" name="peserta_cnb_{peserta.id}" bind:checked={peserta.cnb} class={checkboxInputClass} />
									<span>CNB (Child No Bag)</span>
								</label>
							</div>
						</div>
					</div>
				{/each}
			{/if}

			{#if showError}
				<div class="bg-[#fee2e2] border border-[#ef4444] rounded-[10px] p-4 mb-5 text-[#dc2626] text-sm text-center">
					<p>{errorMessage}</p>
				</div>
			{/if}

			<div class="col-span-full mt-2">
				<button type="submit" class="w-full h-[46px] border-0 rounded-[10px] text-white font-semibold tracking-wide bg-gradient-to-r from-[#942392] to-[#942392] shadow-[0_6px_14px_rgba(148,35,146,0.25)] cursor-pointer hover:brightness-105">HANTAR</button>
			</div>
		</form>
		</div>
	{/if}
</section>

