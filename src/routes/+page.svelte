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
	let validationErrors = $state([]);
	let isSubmitting = $state(false);
	let redirectTimer = $state(null);
	let countdownInterval = $state(null);
	let countdownSeconds = $state(5);

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
	const selectClass = 'h-11 px-3 pr-5 rounded-[10px] border border-[#e5e7eb] bg-white text-[14px] outline-none appearance-none bg-no-repeat bg-[right_12px_center] bg-[length:16px] focus:border-[#942392] focus:[box-shadow:0_0_0_4px_rgba(148,35,146,0.18)] bg-[url("data:image/svg+xml;charset=UTF-8,%3csvg xmlns=\'http://www.w3.org/2000/svg\' viewBox=\'0 0 24 24\' fill=\'none\' stroke=\'currentColor\' stroke-width=\'2\' stroke-linecap=\'round\' stroke-linejoin=\'round\'%3e%3cpolyline points=\'6,9 12,15 18,9\'%3e%3c/polyline%3e%3c/svg%3e")]';
	const disabledOptionClass = 'text-gray-400 cursor-not-allowed';
	const labelClass = 'text-[13px] font-semibold text-gray-700';
	const fieldClass = 'flex flex-col gap-2';
	const actionsClass = 'col-span-full mt-2';
	const btnPrimaryClass = 'w-full h-[46px] border-0 rounded-[10px] text-white font-semibold tracking-wide bg-gradient-to-r from-[#942392] to-[#942392] shadow-[0_6px_14px_rgba(148,35,146,0.25)] cursor-pointer hover:brightness-105';
	const sectionDividerClass = 'col-span-full flex items-center gap-3 sm:gap-5 my-6 sm:my-[30px]';
	const dividerLineClass = 'flex-1 h-px m-0 border-0 bg-gray-300';
	const sectionTitleClass = 'text-[18px] font-bold text-gray-700 m-0 whitespace-nowrap text-center';
	const pesertaSectionClass = 'col-span-full border border-[#e5e7eb] rounded-[10px] p-4 sm:p-5 mb-4 bg-[#f9fafb]';
	const pesertaTitleClass = 'text-[16px] font-semibold text-gray-700 m-0 mb-4 pb-2 border-b-2 border-[#d1d5db]';
	const pesertaFieldsClass = 'grid grid-cols-2 gap-3 sm:gap-4 max-[720px]:grid-cols-1';
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
	let selectedCawangan = $state('');
	let selectedKonsultan = $state('');
	let dynamicBandarList = $state([]);
	let dynamicNegeriList = $state([]);
	let selectedGelaran = $state('');
	let isGelaranOpen = $state(false);
	let isPakejOpen = $state(false);
	let isDestinasiOpen = $state(false);
	let isMusimUmrahOpen = $state(false);
	let isKategoriUmrahOpen = $state(false);
	let isAirlineOpen = $state(false);
	let isTarikhUmrahOpen = $state(false);
	let isTarikhOpen = $state(false);
	let isPilihBilikOpen = $state(false);
	let isBilanganOpen = $state(false);
	let isNegeriOpen = $state(false);
	let isBandarOpen = $state(false);
	let isCawanganOpen = $state(false);
	let isKonsultanOpen = $state(false);
	
	// State untuk filtered data search
	let filteredBranches = $state([]);
	let filteredDestinations = $state([]);
	let searchTermBranches = $state('');
	let searchTermDestinations = $state('');
	let searchTimeoutBranches = null;
	let searchTimeoutDestinations = null;

	// Fungsi debounce untuk search
	function debounceSearch(func, delay) {
		return function(...args) {
			clearTimeout(func.timeoutId);
			func.timeoutId = setTimeout(() => func.apply(this, args), delay);
		};
	}

	// Fallback static options if record does not include room info
	const fallbackRoomOptions = [
		{ value: 'single', label: 'Bilik Single (Tidak Tersedia)', disabled: true },
		{ value: 'double', label: 'Bilik Double/Twin (Tidak Tersedia)', disabled: true },
		{ value: 'triple', label: 'Bilik Triple (Tidak Tersedia)', disabled: true },
		{ value: 'quad', label: 'Bilik Quad (Tidak Tersedia)', disabled: true },
		{ value: 'quintuple', label: 'Bilik Quintuple (Tidak Tersedia)', disabled: true }
	];

	// Fallback static options if no airlines have dates
	const fallbackAirlineOptions = $derived(() => {
		return airlines.map(airline => ({
			value: String(airline.id),
			label: `${airline.name} (Tidak Tersedia)`,
			disabled: true
		}));
	});

	// Fallback static options if no categories have dates
	const fallbackCategoryOptions = $derived(() => {
		return umrahCategories.map(category => ({
			value: String(category.id),
			label: `${category.name} (Tidak Tersedia)`,
			disabled: true
		}));
	});

	// Fallback static options if no destinations have dates
	const fallbackDestinationOptions = $derived(() => {
		if (!destinations || destinations.length === 0) {
			console.log('No destinations for fallback options');
			return [];
		}
		
		const options = destinations.map(destination => ({
			value: String(destination.id),
			label: `${destination.name} (Tidak Tersedia)`,
			disabled: true
		}));
		
		console.log('Fallback destination options created:', options);
		return options;
	});

	// Derived room options from selected umrah date record
	let dynamicRoomOptions = $state([]);

	// Derived airline options based on selected musim and kategori
	let dynamicAirlineOptions = $state([]);

	// Derived category options based on selected musim
	let dynamicCategoryOptions = $state([]);

	// Derived destination options based on availability
	let dynamicDestinationOptions = $state([]);

	function buildDestinationOptionsFromOutboundDates() {
		console.log('=== BUILDING DESTINATION OPTIONS ===');
		console.log('Input destinations:', destinations);
		console.log('Input outboundDates:', outboundDates);
		
		// Validasi input
		if (!destinations || !Array.isArray(destinations) || destinations.length === 0) {
			console.log('Invalid destinations input');
			return [];
		}
		
		if (!outboundDates || !Array.isArray(outboundDates) || outboundDates.length === 0) {
			console.log('Invalid outboundDates input');
			return [];
		}
		
		const options = [];
		const destinationMap = new Map();
		
		// Group by destination and check availability
		outboundDates.forEach(date => {
			if (date && date.destination_id) {
				const destinationId = String(date.destination_id);
				console.log(`Processing date ${date.id}: destination_id=${date.destination_id}, stringified=${destinationId}`);
				if (!destinationMap.has(destinationId)) {
					destinationMap.set(destinationId, {
						id: destinationId,
						hasDates: true
					});
				}
			}
		});
		
		console.log('Destination map after processing dates:', destinationMap);
		
		// Build options for all destinations
		destinations.forEach(destination => {
			if (destination && destination.id && destination.name) {
				const destinationId = String(destination.id);
				const hasDates = destinationMap.has(destinationId);
				console.log(`Destination ${destination.name} (${destination.id}): hasDates=${hasDates}`);
				
				options.push({
					value: destinationId,
					label: hasDates ? destination.name : `${destination.name} (Tidak Tersedia)`,
					disabled: !hasDates
				});
			}
		});
		
		console.log('Final options:', options);
		console.log('====================================');
		return options;
	}

	function buildCategoryOptionsFromUmrahDates(musimId) {
		if (!musimId) return [];
		
		const options = [];
		const categoryMap = new Map();
		
		// Filter umrah dates berdasarkan musim
		const relevantDates = umrahDates.filter(date => 
			String(date.umrah_season_id) === String(musimId)
		);
		
		// Group by category and check availability
		relevantDates.forEach(date => {
			const categoryId = String(date.umrah_category_id);
			if (!categoryMap.has(categoryId)) {
				categoryMap.set(categoryId, {
					id: categoryId,
					hasDates: true
				});
			}
		});
		
		// Build options for all categories
		umrahCategories.forEach(category => {
			const categoryId = String(category.id);
			const hasDates = categoryMap.has(categoryId);
			
			options.push({
				value: categoryId,
				label: hasDates ? category.name : `${category.name} (Tidak Tersedia)`,
				disabled: !hasDates
			});
		});
		
		return options;
	}

	function buildAirlineOptionsFromUmrahDates(musimId, kategoriId) {
		if (!musimId || !kategoriId) return [];
		
		const options = [];
		const airlineMap = new Map();
		
		// Filter umrah dates berdasarkan musim dan kategori
		const relevantDates = umrahDates.filter(date => 
			String(date.umrah_season_id) === String(musimId) && 
			String(date.umrah_category_id) === String(kategoriId)
		);
		
		// Group by airline and check availability
		relevantDates.forEach(date => {
			const airlineId = String(date.airline_id);
			if (!airlineMap.has(airlineId)) {
				airlineMap.set(airlineId, {
					id: airlineId,
					name: airlines.find(a => String(a.id) === airlineId)?.name || 'Unknown Airline',
					hasDates: true
				});
			}
		});
		
		// Build options for all airlines
		airlines.forEach(airline => {
			const airlineId = String(airline.id);
			const hasDates = airlineMap.has(airlineId);
			
			options.push({
				value: airlineId,
				label: hasDates ? airline.name : `${airline.name} (Tidak Tersedia)`,
				disabled: !hasDates
			});
		});
		
		return options;
	}

	function buildRoomOptionsFromRecord(record) {
		if (!record || typeof record !== 'object') return [];
		const options = [];
		
		// Check category to determine room type options
		const categoryName = record.umrah_categories?.name;
		
		if (categoryName === 'PELAYARAN' || categoryName === 'UMRAH + PELAYARAN') {
			// Options for cruise packages (PELAYARAN and UMRAH + PELAYARAN)
			// LOW DECK
			options.push({ 
				value: 'low_deck_interior', 
				label: `LOW DECK + INTERIOR ${record.low_deck_interior && record.low_deck_interior > 0 ? `(RM ${formatPrice(record.low_deck_interior)})` : '(Tidak Tersedia)'}`,
				disabled: !record.low_deck_interior || record.low_deck_interior <= 0
			});
			
			options.push({ 
				value: 'low_deck_seaview', 
				label: `LOW DECK + SEAVIEW ${record.low_deck_seaview && record.low_deck_seaview > 0 ? `(RM ${formatPrice(record.low_deck_seaview)})` : '(Tidak Tersedia)'}`,
				disabled: !record.low_deck_seaview || record.low_deck_seaview <= 0
			});
			
			options.push({ 
				value: 'low_deck_balcony', 
				label: `LOW DECK + BALCONY ${record.low_deck_balcony && record.low_deck_balcony > 0 ? `(RM ${formatPrice(record.low_deck_balcony)})` : '(Tidak Tersedia)'}`,
				disabled: !record.low_deck_balcony || record.low_deck_balcony <= 0
			});
			
			// HIGH DECK
			options.push({ 
				value: 'high_deck_interior', 
				label: `HIGH DECK + INTERIOR ${record.high_deck_interior && record.high_deck_interior > 0 ? `(RM ${formatPrice(record.high_deck_interior)})` : '(Tidak Tersedia)'}`,
				disabled: !record.high_deck_interior || record.high_deck_interior <= 0
			});
			
			options.push({ 
				value: 'high_deck_seaview', 
				label: `HIGH DECK + SEAVIEW ${record.high_deck_seaview && record.high_deck_seaview > 0 ? `(RM ${formatPrice(record.high_deck_seaview)})` : '(Tidak Tersedia)'}`,
				disabled: !record.high_deck_seaview || record.high_deck_seaview <= 0
			});
			
			options.push({ 
				value: 'high_deck_balcony', 
				label: `HIGH DECK + BALCONY ${record.high_deck_balcony && record.high_deck_balcony > 0 ? `(RM ${formatPrice(record.high_deck_balcony)})` : '(Tidak Tersedia)'}`,
				disabled: !record.high_deck_balcony || record.high_deck_balcony <= 0
			});
			
		} else {
			// Options for regular umrah packages (UMRAH category or any other)
			// Double - selalu tampil, disabled jika null/0
			options.push({ 
				value: 'double', 
				label: `Bilik Double/Twin ${record.double && record.double > 0 ? `(RM ${formatPrice(record.double)})` : '(Tidak Tersedia)'}`,
				disabled: !record.double || record.double <= 0
			});
			
			// Triple - selalu tampil, disabled jika null/0
			options.push({ 
				value: 'triple', 
				label: `Bilik Triple ${record.triple && record.triple > 0 ? `(RM ${formatPrice(record.triple)})` : '(Tidak Tersedia)'}`,
				disabled: !record.triple || record.triple <= 0
			});
			
			// Quadruple - selalu tampil, disabled jika null/0
			options.push({ 
				value: 'quad', 
				label: `Bilik Quad ${record.quadruple && record.quadruple > 0 ? `(RM ${formatPrice(record.quadruple)})` : '(Tidak Tersedia)'}`,
				disabled: !record.quadruple || record.quadruple <= 0
			});
			
			// Quintuple - selalu tampil, disabled jika null/0
			options.push({ 
				value: 'quintuple', 
				label: `Bilik Quintuple ${record.quintuple && record.quintuple > 0 ? `(RM ${formatPrice(record.quintuple)})` : '(Tidak Tersedia)'}`,
				disabled: !record.quintuple || record.quintuple <= 0
			});
			
			// Single - selalu tampil, disabled jika null/0
			if (record.single) {
				options.push({ 
					value: 'single', 
					label: `Bilik Single ${record.single > 0 ? `(RM ${formatPrice(record.single)})` : '(Tidak Tersedia)'}`,
					disabled: record.single <= 0
				});
			}
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

	// Recompute dynamic airline options when musim or kategori changes
	$effect(() => {
		if (!selectedMusimUmrah || !selectedKategoriUmrah) {
			dynamicAirlineOptions = [];
			return;
		}
		
		const built = buildAirlineOptionsFromUmrahDates(selectedMusimUmrah, selectedKategoriUmrah);
		dynamicAirlineOptions = built.length > 0 ? built : fallbackAirlineOptions;
	});

	// Recompute dynamic category options when musim changes
	$effect(() => {
		if (!selectedMusimUmrah) {
			dynamicCategoryOptions = [];
			return;
		}
		
		const built = buildCategoryOptionsFromUmrahDates(selectedMusimUmrah);
		dynamicCategoryOptions = built.length > 0 ? built : fallbackCategoryOptions;
	});

	// Function untuk menentukan destinasi yang tersedia
	function getDestinationAvailability() {
		if (!destinations || !outboundDates) return [];
		
		// Buat map destinasi yang punya tarikh
		const availableDestinations = new Set();
		outboundDates.forEach(date => {
			if (date.destination_id) {
				availableDestinations.add(String(date.destination_id));
			}
		});
		
		// Buat array destinasi dengan status ketersediaan
		return destinations.map(destination => ({
			id: destination.id,
			name: destination.name,
			isAvailable: availableDestinations.has(String(destination.id))
		}));
	}
	
	// Debug destinations data
	$effect(() => {
		console.log('=== DESTINATIONS DATA DEBUG ===');
		console.log('destinations:', destinations);
		console.log('destinations length:', destinations?.length || 0);
		console.log('outboundDates:', outboundDates);
		console.log('outboundDates length:', outboundDates?.length || 0);
		console.log('showDestinationSection:', showDestinationSection);
		
		const availability = getDestinationAvailability();
		console.log('Destination availability:', availability);
		console.log('================================');
	});
	
	// State untuk filtered dates
	let filteredOutboundDates = $state([]);
	let filteredUmrahDates = $state([]);
	
	// State untuk data peserta
	let pesertaData = $state([]);
	
	// State untuk peserta 1 (selalu ada)
	let peserta1Nama = $state('');
	let peserta1Nokp = $state('');
	
	// State untuk form utama (untuk sync dengan Peserta 1)
	let mainFormData = $state({
		nama: '',
		nokp: '',
		gelaran: ''
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
				console.log('Package name:', packageName);
				
				if (packageName.includes('pelancongan') || packageName.includes('outbound')) {
					console.log('Setting showDestinationSection = true');
					showDestinationSection = true;
					showUmrahSeasonSection = false;
					showUmrahCategorySection = false;
					showAirlineSection = false;
					showUmrahDateSection = false;
				} else if (packageName.includes('umrah')) {
					console.log('Setting showUmrahSeasonSection = true');
					showDestinationSection = false;
					showUmrahSeasonSection = true;
					showUmrahCategorySection = false;
					showAirlineSection = false;
					showUmrahDateSection = false;
				} else {
					console.log('Other package type, hiding all sections');
					// Paket lain (jika ada)
					showDestinationSection = false;
					showUmrahSeasonSection = false;
					showUmrahCategorySection = false;
					showAirlineSection = false;
					showUmrahDateSection = false;
				}
			}
		} else {
			console.log('No package selected, hiding all sections');
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
		
		console.log('Final state:');
		console.log('- showDestinationSection:', showDestinationSection);
		console.log('- showUmrahSeasonSection:', showUmrahSeasonSection);
		console.log('================================');
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
	
	// Effect untuk samakan data ke Peserta 1 (selalu aktif)
	$effect(() => {
		// Copy data dari form utama ke Peserta 1 secara otomatis
		peserta1Nama = mainFormData.nama;
		peserta1Nokp = mainFormData.nokp;
	});

	// Debug: log data ketika komponen dimuat
	$effect(() => {
		console.log('=== DEBUG DATA ===');
		console.log('Package Types:', packageTypes);
		console.log('Package Types Length:', packageTypes.length);
		console.log('Selected Package Type:', selectedPackageType);
		console.log('Destinations:', destinations);
		console.log('Destinations Length:', destinations?.length || 0);
		console.log('Pelancongan Dates:', outboundDates);
		console.log('Pelancongan Dates Length:', outboundDates?.length || 0);
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
		if (destinations && destinations.length > 0) {
			console.log('First Destination:', destinations[0]);
			console.log('First Destination ID:', destinations[0].id);
			console.log('First Destination ID Type:', typeof destinations[0].id);
		} else {
			console.log('No destinations data available');
		}
		
		// Debug struktur data tarikh pelancongan
		if (outboundDates && outboundDates.length > 0) {
			console.log('First Pelancongan Date:', outboundDates[0]);
			console.log('First Pelancongan Date destination_id:', outboundDates[0].destination_id);
			console.log('First Pelancongan Date destination_id Type:', typeof outboundDates[0].destination_id);
		} else {
			console.log('No outbound dates data available');
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
		
		// Debug untuk destinasi
		console.log('=== DESTINASI DEBUG ===');
		console.log('showDestinationSection:', showDestinationSection);
		console.log('dynamicDestinationOptions:', dynamicDestinationOptions);
		console.log('dynamicDestinationOptions length:', dynamicDestinationOptions?.length || 0);
		console.log('fallbackDestinationOptions:', fallbackDestinationOptions);
		console.log('fallbackDestinationOptions length:', fallbackDestinationOptions?.length || 0);
		console.log('================================');
		
		console.log('==================');
	});

	// Cleanup effect untuk clear timer ketika komponen di-unmount
	$effect(() => {
		return () => {
			cleanupTimers();
		};
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

	// Cleanup function untuk clear timer
	function cleanupTimers() {
		if (redirectTimer) {
			clearTimeout(redirectTimer);
			redirectTimer = null;
		}
		if (countdownInterval) {
			clearInterval(countdownInterval);
			countdownInterval = null;
		}
	}

	// Function untuk validasi form sebelum submit
	function validateForm() {
		const errors = [];
		
		// Validasi field wajib dasar
		if (!selectedGelaran) {
			errors.push('Sila pilih gelaran anda');
		}
		if (!mainFormData.nama || mainFormData.nama.trim() === '') {
			errors.push('Sila masukkan nama penuh anda');
		}
		if (!mainFormData.nokp || mainFormData.nokp.trim() === '') {
			errors.push('Sila masukkan nombor K/P anda');
		}
		
		// Validasi field yang diperlukan untuk form
		const telefon = document.querySelector('input[name="telefon"]')?.value;
		if (!telefon || telefon.trim() === '') {
			errors.push('Sila masukkan nombor telefon anda');
		}
		
		const email = document.querySelector('input[name="email"]')?.value;
		if (!email || email.trim() === '') {
			errors.push('Sila masukkan alamat email anda');
		}
		
		const alamat = document.querySelector('input[name="alamat"]')?.value;
		if (!alamat || alamat.trim() === '') {
			errors.push('Sila masukkan alamat rumah anda');
		}
		
		// Validasi poskod
		if (!poskodValue || poskodValue.length !== 5) {
			errors.push('Sila masukkan poskod 5 digit yang lengkap');
		}
		if (poskodError) {
			errors.push('Sila pastikan poskod yang dimasukkan adalah betul');
		}
		if (!selectedNegeri || !selectedBandar) {
			errors.push('Sila pastikan negeri dan bandar telah dipilih');
		}
		
		// Validasi cawangan
		if (!selectedCawangan) {
			errors.push('Sila pilih cawangan anda');
		}
		
		// Validasi sales consultant
		if (!selectedKonsultan) {
			errors.push('Sila pilih sales consultant anda');
		}
		
		// Validasi pakej
		if (!selectedPackageType) {
			errors.push('Sila pilih jenis pakej anda');
		}
		
		// Validasi berdasarkan jenis pakej
		if (showDestinationSection) {
			// Validasi untuk pakej pelancongan
			if (!selectedDestinasi) {
				errors.push('Sila pilih destinasi pelancongan anda');
			}
			if (!selectedTarikh) {
				errors.push('Sila pilih tarikh pelancongan anda');
			}
		} else if (showUmrahSeasonSection) {
			// Validasi untuk pakej umrah
			if (!selectedMusimUmrah) {
				errors.push('Sila pilih musim umrah anda');
			}
			if (!selectedKategoriUmrah) {
				errors.push('Sila pilih kategori umrah anda');
			}
			if (!selectedAirline) {
				errors.push('Sila pilih penerbangan anda');
			}
			if (!selectedTarikhUmrah) {
				errors.push('Sila pilih tarikh umrah anda');
			}
			if (!selectedRoomType) {
				errors.push('Sila pilih jenis bilik anda');
			}
		}
		
		// Validasi bilangan peserta
		if (selectedTarikh || selectedTarikhUmrah) {
			if (selectedBilangan === '') {
				errors.push('Sila pilih bilangan peserta tambahan');
			}
		}
		
		// Validasi data peserta tambahan
		if (selectedBilangan && pesertaData.length > 0) {
			for (let i = 0; i < pesertaData.length; i++) {
				const peserta = pesertaData[i];
				if (!peserta.nama || peserta.nama.trim() === '') {
					errors.push(`Sila masukkan nama Peserta ${peserta.id}`);
				}
			}
		}
		
		return errors;
	}

	// Function untuk menampilkan error validasi
	function showValidationErrors(errors) {
		validationErrors = errors;
		showError = true;
		errorMessage = 'Sila lengkapkan maklumat berikut:';
		
		// Scroll ke atas form untuk menampilkan error
		window.scrollTo({ top: 0, behavior: 'smooth' });
		
		// Highlight field yang error
		highlightErrorFields();
	}

	// Function untuk clear error
	function clearErrors() {
		validationErrors = [];
		showError = false;
		errorMessage = '';
	}

	// Function untuk highlight field yang error
	function highlightErrorField(fieldName) {
		const field = document.querySelector(`[name="${fieldName}"]`);
		if (field) {
			field.classList.add('border-red-500');
			field.classList.add('focus:border-red-500');
			field.classList.add('focus:[box-shadow:0_0_0_4px_rgba(239,68,68,0.18)]');
			
			// Remove error styling after 3 seconds
			setTimeout(() => {
				field.classList.remove('border-red-500');
				field.classList.remove('focus:border-red-500');
				field.classList.remove('focus:[box-shadow:0_0_0_4px_rgba(239,68,68,0.18)]');
			}, 3000);
		}
	}

	// Function untuk highlight semua field yang error
	function highlightErrorFields() {
		// Highlight field berdasarkan error yang ditemukan
		if (validationErrors.some(e => e.includes('gelaran'))) {
			// Highlight gelaran dropdown
			const gelaranContainer = document.querySelector('[onclick*="isGelaranOpen"]');
			if (gelaranContainer) {
				gelaranContainer.classList.add('border-red-500');
				setTimeout(() => gelaranContainer.classList.remove('border-red-500'), 3000);
			}
		}
		
		if (validationErrors.some(e => e.includes('nama'))) {
			highlightErrorField('nama');
		}
		
		if (validationErrors.some(e => e.includes('nokp'))) {
			highlightErrorField('nokp');
		}
		
		if (validationErrors.some(e => e.includes('telefon'))) {
			highlightErrorField('telefon');
		}
		
		if (validationErrors.some(e => e.includes('email'))) {
			highlightErrorField('email');
		}
		
		if (validationErrors.some(e => e.includes('alamat'))) {
			highlightErrorField('alamat');
		}
		
		if (validationErrors.some(e => e.includes('poskod'))) {
			highlightErrorField('poskod');
		}
		
		if (validationErrors.some(e => e.includes('cawangan'))) {
			const cawanganContainer = document.querySelector('[onclick*="isCawanganOpen"]');
			if (cawanganContainer) {
				cawanganContainer.classList.add('border-red-500');
				setTimeout(() => cawanganContainer.classList.remove('border-red-500'), 3000);
			}
		}
		
		if (validationErrors.some(e => e.includes('sales consultant'))) {
			const konsultanContainer = document.querySelector('[onclick*="isKonsultanOpen"]');
			if (konsultanContainer) {
				konsultanContainer.classList.add('border-red-500');
				setTimeout(() => konsultanContainer.classList.remove('border-red-500'), 3000);
			}
		}
		
		if (validationErrors.some(e => e.includes('pakej'))) {
			const pakejContainer = document.querySelector('[onclick*="isPakejOpen"]');
			if (pakejContainer) {
				pakejContainer.classList.add('border-red-500');
				setTimeout(() => pakejContainer.classList.remove('border-red-500'), 3000);
			}
		}
	}

	// Function untuk mengupdate data peserta berdasarkan jumlah
	function updatePesertaData(bilangan) {
		const jumlah = parseInt(bilangan) || 0;
		// Buat array peserta tambahan (mulai dari peserta 2)
		pesertaData = Array.from({ length: jumlah }, (_, index) => ({
			id: index + 2, // Mulai dari ID 2 karena peserta 1 sudah ada
			nama: '',
			nokp: '',
			kategori: '' // Single choice: 'cwb', 'infant', 'cnb', atau kosong
		}));
	}
</script>

<section class="max-w-[1000px] mx-auto px-4 sm:px-6 box-border pt-4 sm:pt-10">
	<div class="text-center mb-4 sm:mb-5">
		<h2 class="m-0 text-[24px] sm:text-[28px] font-bold tracking-[0.4px]">ISI MAKLUMAT ANDA</h2>
	</div>

	{#if showSuccess}
		<div class="bg-[#d1fae5] border border-[#10b981] rounded-[14px] p-4 sm:p-7 text-center max-w-[720px] mx-auto">
			<h3 class="text-[#065f46] m-0 mb-3 text-2xl font-semibold">Terima Kasih!</h3>
			<p class="text-[#047857] m-0 text-base mb-4">Maklumat anda berjaya dihantar.</p>
			<div class="bg-white rounded-lg p-3 inline-block mb-4">
				<p class="text-[#065f46] m-0 text-sm font-medium">
					Anda akan kembali ke form dalam <span class="font-bold text-lg">{countdownSeconds}</span> saat
				</p>
			</div>
			<button 
				type="button" 
				class="bg-[#10b981] hover:bg-[#059669] text-white font-medium py-2 px-6 rounded-lg transition-colors duration-200"
				onclick={() => {
					cleanupTimers();
					showSuccess = false;
					isSubmitting = false;
					// Reset semua form data
					selectedGelaran = '';
					mainFormData = { nama: '', nokp: '', gelaran: '' };
					selectedNegeri = '';
					selectedBandar = '';
					poskodValue = '';
					poskodError = '';
					poskodLoading = false;
					poskodValidated = false;
					selectedDestinasi = '';
					selectedTarikh = '';
					selectedBilangan = '';
					selectedMusimUmrah = '';
					selectedKategoriUmrah = '';
					selectedAirline = '';
					selectedTarikhUmrah = '';
					perluPartnerBilik = false;
					selectedRoomType = '';
					selectedCawangan = '';
					selectedKonsultan = '';
					selectedPackageType = '';
					pesertaData = [];
					peserta1Nama = '';
					peserta1Nokp = '';
					dynamicNegeriList = [];
					dynamicBandarList = [];
					
					// Reset semua dropdown states
					isGelaranOpen = false;
					isPakejOpen = false;
					isDestinasiOpen = false;
					isMusimUmrahOpen = false;
					isKategoriUmrahOpen = false;
					isAirlineOpen = false;
					isTarikhUmrahOpen = false;
					isTarikhOpen = false;
					isPilihBilikOpen = false;
					isBilanganOpen = false;
					isNegeriOpen = false;
					isBandarOpen = false;
					isCawanganOpen = false;
					isKonsultanOpen = false;
					
					// Reset visibility sections
					showDestinationSection = false;
					showDateSection = false;
					showUmrahSeasonSection = false;
					showUmrahCategorySection = false;
					showAirlineSection = false;
					showUmrahDateSection = false;
					
					// Reset filtered data
					filteredOutboundDates = [];
					filteredUmrahDates = [];
					filteredBranches = [];
					filteredDestinations = [];
					searchTermBranches = '';
					searchTermDestinations = '';
					
					// Reset dynamic options
					dynamicRoomOptions = [];
					dynamicAirlineOptions = [];
					dynamicCategoryOptions = [];
					dynamicDestinationOptions = [];
					
					countdownSeconds = 5;
					countdownInterval = null;
				}}
			>
				Kembali ke Form Sekarang
			</button>
		</div>
	{:else}
		<div class="bg-white border border-[#e5e7eb] rounded-[14px] shadow-[0_10px_24px_rgba(17,24,39,0.06)] p-4 sm:p-7 max-w-[720px] mx-auto mb-6 sm:mb-10">
			<form class="grid grid-cols-2 gap-y-3 gap-x-4 sm:gap-y-4 sm:gap-x-5 max-[720px]:grid-cols-1" method="POST" use:enhance={() => {
				return async ({ result, cancel }) => {
					// Clear previous errors
					clearErrors();
					
					// Set loading state
					isSubmitting = true;
					
					// Validasi form sebelum submit
					const errors = validateForm();
					if (errors.length > 0) {
						showValidationErrors(errors);
						isSubmitting = false;
						cancel();
						return;
					}
					
					// Prevent form submission if there's a postcode error or incomplete postcode
					if (poskodError || poskodValue.length !== 5) {
						if (poskodValue.length !== 5) {
							poskodError = 'Sila masukkan poskod 5 digit yang lengkap';
						}
						isSubmitting = false;
						cancel();
						return;
					}
					
					if (result.type === 'success') {
						isSubmitting = false;
						showSuccess = true;
						showError = false;
						
						// Set timer untuk redirect kembali ke form setelah 5 detik
						countdownSeconds = 5;
						countdownInterval = setInterval(() => {
							countdownSeconds--;
							if (countdownSeconds <= 0) {
								clearInterval(countdownInterval);
								countdownInterval = null;
							}
						}, 1000);
						
						redirectTimer = setTimeout(() => {
							showSuccess = false;
							isSubmitting = false;
							// Reset semua form data
							selectedGelaran = '';
							mainFormData = { nama: '', nokp: '', gelaran: '' };
							selectedNegeri = '';
							selectedBandar = '';
							poskodValue = '';
							poskodError = '';
							poskodLoading = false;
							poskodValidated = false;
							selectedDestinasi = '';
							selectedTarikh = '';
							selectedBilangan = '';
							selectedMusimUmrah = '';
							selectedKategoriUmrah = '';
							selectedAirline = '';
							selectedTarikhUmrah = '';
							perluPartnerBilik = false;
							selectedRoomType = '';
							selectedCawangan = '';
							selectedKonsultan = '';
							selectedPackageType = '';
							pesertaData = [];
							peserta1Nama = '';
							peserta1Nokp = '';
							dynamicNegeriList = [];
							dynamicBandarList = [];
							
							// Reset semua dropdown states
							isGelaranOpen = false;
							isPakejOpen = false;
							isDestinasiOpen = false;
							isMusimUmrahOpen = false;
							isKategoriUmrahOpen = false;
							isAirlineOpen = false;
							isTarikhUmrahOpen = false;
							isTarikhOpen = false;
							isPilihBilikOpen = false;
							isBilanganOpen = false;
							isNegeriOpen = false;
							isBandarOpen = false;
							isCawanganOpen = false;
							isKonsultanOpen = false;
							
							// Reset visibility sections
							showDestinationSection = false;
							showDateSection = false;
							showUmrahSeasonSection = false;
							showUmrahCategorySection = false;
							showAirlineSection = false;
							showUmrahDateSection = false;
							
							// Reset filtered data
							filteredOutboundDates = [];
							filteredUmrahDates = [];
							filteredBranches = [];
							filteredDestinations = [];
							searchTermBranches = '';
							searchTermDestinations = '';
							
							// Reset dynamic options
							dynamicRoomOptions = [];
							dynamicAirlineOptions = [];
							dynamicCategoryOptions = [];
							dynamicDestinationOptions = [];
							
							// Clear timer
							redirectTimer = null;
							countdownInterval = null;
							countdownSeconds = 5;
						}, 5000); // 5 detik
					} else if (result.type === 'failure') {
						isSubmitting = false;
						showError = true;
						errorMessage = result.data?.error || 'Ralat berlaku. Sila cuba lagi.';
					}
				};
			}}>
			<div class="flex flex-col gap-2">
				<label class="text-[13px] font-semibold text-gray-700" for="gelaran">Gelaran<span class="text-red-500 ml-1">*</span></label>
				<div class="relative">
					<div 
						class="h-11 px-3 pr-5 rounded-[10px] border border-[#e5e7eb] bg-white text-[14px] outline-none cursor-pointer flex items-center justify-between focus-within:border-[#942392] focus-within:[box-shadow:0_0_0_4px_rgba(148,35,146,0.18)]"
						onclick={() => isGelaranOpen = !isGelaranOpen}
						onblur={() => setTimeout(() => isGelaranOpen = false, 200)}
					>
						<span class={selectedGelaran ? 'text-gray-900' : 'text-gray-500'}>
							{selectedGelaran || 'Pilih Gelaran'}
						</span>
						<svg 
							class={`w-4 h-4 text-gray-500 transition-transform duration-200 ${isGelaranOpen ? 'rotate-180' : ''}`}
							fill="none" 
							stroke="currentColor" 
							viewBox="0 0 24 24"
						>
							<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"></path>
						</svg>
					</div>
					
					{#if isGelaranOpen}
						<div class="absolute top-full left-0 right-0 mt-1 bg-white border border-[#e5e7eb] rounded-[10px] shadow-lg z-10 max-h-96 overflow-y-auto">
							<ul class="py-1">
								{#each ['Cik', 'Encik', 'Puan', 'Tuan', 'Datin', 'Dato'] as gelaran}
									<li 
										class="px-3 py-2 cursor-pointer hover:bg-purple-50 text-[14px] {selectedGelaran === gelaran ? 'bg-purple-100 text-purple-700' : 'text-gray-700'}"
										onclick={() => {
											selectedGelaran = gelaran;
											mainFormData.gelaran = gelaran;
											isGelaranOpen = false;
										}}
									>
										{gelaran}
									</li>
								{/each}
							</ul>
						</div>
					{/if}
				</div>
				<input type="hidden" name="gelaran" value={selectedGelaran} required />
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
				<label class="text-[13px] font-semibold text-gray-700" for="alamat">Alamat<span class="text-red-500 ml-1">*</span></label>
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
				<label class="text-[13px] font-semibold text-gray-700" for="bandar">Bandar<span class="text-red-500 ml-1">*</span></label>
				<div class="relative">
					<div 
						class={`h-11 px-3 pr-5 rounded-[10px] border border-[#e5e7eb] text-[14px] outline-none flex items-center justify-between focus-within:border-[#942392] focus-within:[box-shadow:0_0_0_4px_rgba(148,35,146,0.18)] ${!selectedNegeri || !(Array.isArray(dynamicBandarList) && dynamicBandarList.length > 0) ? 'bg-gray-100 text-gray-500 cursor-not-allowed' : 'bg-white cursor-pointer'}`}
						onclick={() => {
							if (selectedNegeri && Array.isArray(dynamicBandarList) && dynamicBandarList.length > 0) {
								isBandarOpen = !isBandarOpen;
							}
						}}
						onblur={() => setTimeout(() => isBandarOpen = false, 200)}
					>
						<span class={selectedBandar ? 'text-gray-900' : 'text-gray-500'}>
							{selectedBandar || 'Sila masukkan poskod yang sah terlebih dahulu'}
						</span>
						<svg 
							class={`w-4 h-4 text-gray-500 transition-transform duration-200 ${isBandarOpen ? 'rotate-180' : ''} ${!selectedNegeri || !(Array.isArray(dynamicBandarList) && dynamicBandarList.length > 0) ? 'opacity-50' : ''}`}
							fill="none" 
							stroke="currentColor" 
							viewBox="0 0 24 24"
						>
							<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"></path>
						</svg>
					</div>
					
					{#if isBandarOpen && selectedNegeri && Array.isArray(dynamicBandarList) && dynamicBandarList.length > 0}
						<div class="absolute top-full left-0 right-0 mt-1 bg-white border border-[#e5e7eb] rounded-[10px] shadow-lg z-50 max-h-96 overflow-y-auto">
							<ul class="py-1">
								{#each dynamicBandarList as b}
									<li 
										class={`px-3 py-2 cursor-pointer hover:bg-purple-50 text-[14px] ${selectedBandar === b ? 'bg-purple-100 text-purple-700' : 'text-gray-700'}`}
										onclick={() => {
											selectedBandar = b;
											// Only clear postcode error if bandar is selected and poskod is valid
											if (selectedBandar && poskodError && poskodValidated && !poskodLoading) {
												poskodError = '';
											}
											isBandarOpen = false;
										}}
									>
										{b}
									</li>
								{/each}
							</ul>
						</div>
					{/if}
				</div>
				<input type="hidden" name="bandar" value={selectedBandar} required />
				{#if !(Array.isArray(dynamicBandarList) && dynamicBandarList.length > 0)}
					<div class="text-gray-500 text-xs mt-1">Bandar akan dipilih secara automatik selepas poskod yang sah dimasukkan</div>
				{/if}
			</div>

			<div class="flex flex-col gap-2">
				<label class="text-[13px] font-semibold text-gray-700" for="negeri">Negeri<span class="text-red-500 ml-1">*</span></label>
				<div class="relative">
					<div 
						class={`h-11 px-3 pr-5 rounded-[10px] border border-[#e5e7eb] text-[14px] outline-none flex items-center justify-between focus-within:border-[#942392] focus-within:[box-shadow:0_0_0_4px_rgba(148,35,146,0.18)] ${!(Array.isArray(dynamicNegeriList) && dynamicNegeriList.length > 0) ? 'bg-gray-100 text-gray-500 cursor-not-allowed' : 'bg-white cursor-pointer'}`}
						onclick={() => {
							if (Array.isArray(dynamicNegeriList) && dynamicNegeriList.length > 0) {
								isNegeriOpen = !isNegeriOpen;
							}
						}}
						onblur={() => setTimeout(() => isNegeriOpen = false, 200)}
					>
						<span class={selectedNegeri ? 'text-gray-900' : 'text-gray-500'}>
							{selectedNegeri || 'Sila masukkan poskod yang sah terlebih dahulu'}
						</span>
						<svg 
							class={`w-4 h-4 text-gray-500 transition-transform duration-200 ${isNegeriOpen ? 'rotate-180' : ''} ${!(Array.isArray(dynamicNegeriList) && dynamicNegeriList.length > 0) ? 'opacity-50' : ''}`}
							fill="none" 
							stroke="currentColor" 
							viewBox="0 0 24 24"
						>
							<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"></path>
						</svg>
					</div>
					
					{#if isNegeriOpen && Array.isArray(dynamicNegeriList) && dynamicNegeriList.length > 0}
						<div class="absolute top-full left-0 right-0 mt-1 bg-white border border-[#e5e7eb] rounded-[10px] shadow-lg z-50 max-h-96 overflow-y-auto">
							<ul class="py-1">
								{#each dynamicNegeriList as n}
									<li 
										class={`px-3 py-2 cursor-pointer hover:bg-purple-50 text-[14px] ${selectedNegeri === n ? 'bg-purple-100 text-purple-700' : 'text-gray-700'}`}
										onclick={() => {
											selectedNegeri = n;
											selectedBandar = '';
											// Only clear postcode error if negeri is selected and poskod is valid
											if (selectedNegeri && poskodError && poskodValidated && !poskodLoading) {
												poskodError = '';
											}
											isNegeriOpen = false;
										}}
									>
										{n}
									</li>
								{/each}
							</ul>
						</div>
					{/if}
				</div>
				<input type="hidden" name="negeri" value={selectedNegeri} required />
				{#if !(Array.isArray(dynamicNegeriList) && dynamicNegeriList.length > 0)}
					<div class="text-gray-500 text-xs mt-1">Negeri akan dipilih secara automatik selepas poskod yang sah dimasukkan</div>
				{/if}
			</div>

			<div class="flex flex-col gap-2">
				<label class="text-[13px] font-semibold text-gray-700" for="cawangan">Cawangan<span class="text-red-500 ml-1">*</span></label>
				<div class="relative">
					<div 
						class="h-11 px-3 pr-5 rounded-[10px] border border-[#e5e7eb] bg-white text-[14px] outline-none cursor-pointer flex items-center justify-between focus-within:border-[#942392] focus-within:[box-shadow:0_0_0_4px_rgba(148,35,146,0.18)]"
						onclick={() => {
								isCawanganOpen = !isCawanganOpen;
								if (!isCawanganOpen) {
									searchTermBranches = '';
									filteredBranches = [];
									clearTimeout(searchTimeoutBranches);
								}
							}}
							onblur={() => setTimeout(() => {
								isCawanganOpen = false;
								searchTermBranches = '';
								filteredBranches = [];
								clearTimeout(searchTimeoutBranches);
							}, 200)}
					>
						<span class={selectedCawangan ? 'text-gray-900' : 'text-gray-500'}>
							{selectedCawangan ? branches.find(b => b.id === selectedCawangan)?.name || 'Pilih Cawangan Anda' : 'Pilih Cawangan Anda'}
						</span>
						<svg 
							class={`w-4 h-4 text-gray-500 transition-transform duration-200 ${isCawanganOpen ? 'rotate-180' : ''}`}
							fill="none" 
							stroke="currentColor" 
							viewBox="0 0 24 24"
						>
							<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"></path>
						</svg>
					</div>
					
					{#if isCawanganOpen}
						<div class="absolute top-full left-0 right-0 mt-1 bg-white border border-[#e5e7eb] rounded-[10px] shadow-lg z-50 max-h-96 overflow-y-auto">
							<!-- Search input untuk cawangan di atas dropdown -->
							<div class="sticky top-0 bg-white p-4 border-b border-gray-200 rounded-t-[10px]">
								<div class="relative">
									<input 
										type="text" 
										placeholder="Ketik untuk mencari cawangan..." 
										class="w-full h-11 pl-10 pr-4 py-2 text-[14px] border border-[#e5e7eb] rounded-[10px] focus:outline-none focus:border-[#942392] focus:[box-shadow:0_0_0_4px_rgba(148,35,146,0.18)] transition-all duration-200"
										oninput={(e) => {
											clearTimeout(searchTimeoutBranches);
											searchTimeoutBranches = setTimeout(() => {
												searchTermBranches = e.target.value.toLowerCase();
												if (searchTermBranches === '') {
													filteredBranches = [];
												} else {
													// Filter branches berdasarkan search term secara real-time
													filteredBranches = branches.filter(b => 
														b.name.toLowerCase().includes(searchTermBranches)
													);
												}
											}, 300);
										}}
									/>
									<svg class="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
										<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
									</svg>
								</div>
							</div>
							<ul class="py-1">
								{#each (filteredBranches.length > 0 ? filteredBranches : (filteredBranches.length === 0 && searchTermBranches !== '' ? [] : branches)) as b}
									<li 
										class={`px-3 py-2 cursor-pointer hover:bg-purple-50 text-[14px] ${selectedCawangan === b.id ? 'bg-purple-100 text-purple-700' : 'text-gray-700'}`}
										onclick={() => {
											selectedCawangan = b.id;
											isCawanganOpen = false;
										}}
									>
										{b.name}
									</li>
								{/each}
								{#if filteredBranches.length === 0 && searchTermBranches !== ''}
									<li class="px-3 py-2 text-[14px] text-gray-500 text-center">
										Tidak ada cawangan yang ditemukan
									</li>
								{/if}
							</ul>
						</div>
					{/if}
				</div>
				<input type="hidden" name="cawangan" value={selectedCawangan} required />
			</div>

			<div class="flex flex-col gap-2">
				<label class="text-[13px] font-semibold text-gray-700" for="konsultan">Sales Consultant<span class="text-red-500 ml-1">*</span></label>
				<div class="relative">
					<div 
						class="h-11 px-3 pr-5 rounded-[10px] border border-[#e5e7eb] bg-white text-[14px] outline-none cursor-pointer flex items-center justify-between focus-within:border-[#942392] focus-within:[box-shadow:0_0_0_4px_rgba(148,35,146,0.18)]"
						onclick={() => isKonsultanOpen = !isKonsultanOpen}
						onblur={() => setTimeout(() => isKonsultanOpen = false, 200)}
					>
						<span class={selectedKonsultan ? 'text-gray-900' : 'text-gray-500'}>
							{selectedKonsultan ? (() => {
								const consultant = consultants.find(c => c.id === selectedKonsultan);
								return consultant ? `${consultant.sales_consultant_number} - ${consultant.name}` : 'Pilih Sales Consultant';
							})() : 'Pilih Sales Consultant'}
						</span>
						<svg 
							class={`w-4 h-4 text-gray-500 transition-transform duration-200 ${isKonsultanOpen ? 'rotate-180' : ''}`}
							fill="none" 
							stroke="currentColor" 
							viewBox="0 0 24 24"
						>
							<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"></path>
						</svg>
					</div>
					
					{#if isKonsultanOpen}
						<div class="absolute top-full left-0 right-0 mt-1 bg-white border border-[#e5e7eb] rounded-[10px] shadow-lg z-10 max-h-96 overflow-y-auto">
							<ul class="py-1">
								{#each consultants.sort((a, b) => (a.sales_consultant_number || 0) - (b.sales_consultant_number || 0)) as c}
									<li 
										class={`px-3 py-2 cursor-pointer hover:bg-purple-50 text-[14px] ${selectedKonsultan === c.id ? 'bg-purple-100 text-purple-700' : 'text-gray-700'}`}
										onclick={() => {
											selectedKonsultan = c.id;
											isKonsultanOpen = false;
										}}
									>
										<span class="font-semibold text-gray-900 mr-2">{c.sales_consultant_number}</span> - {c.name}
									</li>
								{/each}
							</ul>
						</div>
					{/if}
				</div>
				<input type="hidden" name="konsultan" value={selectedKonsultan} required />
			</div>



			<div class="col-span-full flex items-center gap-5 my-[30px]">
				<hr class="flex-1 h-px m-0 border-0 bg-gray-300">
				<h3 class="text-[18px] font-bold text-gray-700 m-0 whitespace-nowrap text-center">SILA PILIH PAKEJ ANDA</h3>
				<hr class="flex-1 h-px m-0 border-0 bg-gray-300">
			</div>

			<div class="flex flex-col gap-2">
				<label class="text-[13px] font-semibold text-gray-700" for="pakej">Jenis Pakej<span class="text-red-500 ml-1">*</span></label>
				<div class="relative">
					<div 
						class="h-11 px-3 pr-5 rounded-[10px] border border-[#e5e7eb] bg-white text-[14px] outline-none cursor-pointer flex items-center justify-between focus-within:border-[#942392] focus-within:[box-shadow:0_0_0_4px_rgba(148,35,146,0.18)]"
						onclick={() => isPakejOpen = !isPakejOpen}
						onblur={() => setTimeout(() => isPakejOpen = false, 200)}
					>
						<span class={selectedPackageType ? 'text-gray-900' : 'text-gray-500'}>
							{selectedPackageType ? packageTypes.find(p => String(p.id) === String(selectedPackageType))?.name.replace(/outbound/ig, 'Pelancongan') || 'Pilihan Jenis Pakej' : 'Pilihan Jenis Pakej'}
						</span>
						<svg 
							class={`w-4 h-4 text-gray-500 transition-transform duration-200 ${isPakejOpen ? 'rotate-180' : ''}`}
							fill="none" 
							stroke="currentColor" 
							viewBox="0 0 24 24"
						>
							<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"></path>
						</svg>
					</div>
					
					{#if isPakejOpen}
						<div class="absolute top-full left-0 right-0 mt-1 bg-white border border-[#e5e7eb] rounded-[10px] shadow-lg z-10 max-h-96 overflow-y-auto">
							<ul class="py-1">
								{#each packageTypes as p}
									<li 
										class="px-3 py-2 cursor-pointer hover:bg-purple-50 text-[14px] {selectedPackageType === String(p.id) ? 'bg-purple-100 text-purple-700' : 'text-gray-700'}"
										onclick={() => {
											selectedPackageType = String(p.id);
											console.log('Package dropdown changed to:', selectedPackageType);
											isPakejOpen = false;
										}}
									>
										{p.name.replace(/outbound/ig, 'Pelancongan')}
									</li>
								{/each}
							</ul>
						</div>
					{/if}
				</div>
				<input type="hidden" name="pakej" value={selectedPackageType} required />
			</div>

			{#if showDestinationSection && destinations && destinations.length > 0}
				<div class="flex flex-col gap-2">
					<label class="text-[13px] font-semibold text-gray-700" for="destinasi">Destinasi<span class="text-red-500 ml-1">*</span></label>
					<div class="relative">
						<div 
							class="h-11 px-3 pr-5 rounded-[10px] border border-[#e5e7eb] text-[14px] outline-none cursor-pointer flex items-center justify-between focus-within:border-[#942392] focus-within:[box-shadow:0_0_0_4px_rgba(148,35,146,0.18)] bg-white"
							onclick={() => {
								console.log('=== DESTINATION DROPDOWN CLICKED ===');
								console.log('destinations:', destinations);
								console.log('destinations length:', destinations?.length || 0);
								
								// Selalu buka dropdown
								isDestinasiOpen = !isDestinasiOpen;
								
								if (!isDestinasiOpen) {
									searchTermDestinations = '';
									filteredDestinations = [];
									clearTimeout(searchTimeoutDestinations);
								}
							}}
							onblur={() => setTimeout(() => {
								isDestinasiOpen = false;
								searchTermDestinations = '';
								filteredDestinations = [];
								clearTimeout(searchTimeoutDestinations);
							}, 200)}
						>
							<span class={selectedDestinasi ? 'text-gray-900' : 'text-gray-500'}>
								{selectedDestinasi ? (() => {
									const destination = getDestinationAvailability().find(d => String(d.id) === selectedDestinasi);
									if (destination) {
										return destination.isAvailable ? destination.name : `${destination.name} (Tidak Tersedia)`;
									}
									return 'Pilih Destinasi';
								})() : 'Pilih Destinasi'}
							</span>
							<svg 
								class={`w-4 h-4 text-gray-500 transition-transform duration-200 ${isDestinasiOpen ? 'rotate-180' : ''} ${(dynamicDestinationOptions?.length || 0) === 0 ? 'opacity-50' : ''}`}
								fill="none" 
								stroke="currentColor" 
								viewBox="0 0 24 24"
							>
								<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"></path>
							</svg>
						</div>
						
						{#if isDestinasiOpen}
							<div class="absolute top-full left-0 right-0 mt-1 bg-white border border-[#e5e7eb] rounded-[10px] shadow-lg z-50 max-h-96 overflow-y-auto">
								<!-- Search input untuk destinasi di atas dropdown -->
								<div class="sticky top-0 bg-white p-4 border-b border-gray-200 rounded-t-[10px]">
									<div class="relative">
										<input 
											type="text" 
											placeholder="Ketik untuk mencari destinasi..." 
											class="w-full h-11 pl-10 pr-4 py-2 text-[14px] border border-[#e5e7eb] rounded-[10px] focus:outline-none focus:border-[#942392] focus:[box-shadow:0_0_0_4px_rgba(148,35,146,0.18)] transition-all duration-200"
											oninput={(e) => {
												clearTimeout(searchTimeoutDestinations);
												searchTimeoutDestinations = setTimeout(() => {
													searchTermDestinations = e.target.value.toLowerCase();
													if (searchTermDestinations === '') {
														filteredDestinations = [];
													} else {
														// Filter destinations berdasarkan search term secara real-time
														filteredDestinations = getDestinationAvailability().filter(d => 
															d.name.toLowerCase().includes(searchTermDestinations)
														);
													}
												}, 300);
											}}
										/>
										<svg class="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
											<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
										</svg>
									</div>
								</div>
								<ul class="py-1">
									{#each (filteredDestinations.length > 0 ? filteredDestinations : (filteredDestinations.length === 0 && searchTermDestinations !== '' ? [] : getDestinationAvailability())) as d}
										<li 
											class="px-3 py-2 text-[14px] {d.isAvailable ? 'cursor-pointer hover:bg-purple-50 text-gray-700' : 'text-gray-400 cursor-not-allowed'} {selectedDestinasi === String(d.id) ? 'bg-purple-100 text-purple-700' : ''}"
											onclick={() => {
												if (d.isAvailable) {
													console.log('Destination selected:', d.name, d.id);
													selectedDestinasi = String(d.id);
													selectedTarikh = '';
													isDestinasiOpen = false;
												} else {
													console.log('Cannot select unavailable destination:', d.name);
												}
											}}
										>
											{d.name}{!d.isAvailable ? ' (Tidak Tersedia)' : ''}
										</li>
									{/each}
									{#if filteredDestinations.length === 0 && searchTermDestinations !== ''}
										<li class="px-3 py-2 text-[14px] text-gray-500 text-center">
											Tidak ada destinasi yang ditemukan
										</li>
									{/if}
									{#if (!destinations || destinations.length === 0) && !searchTermDestinations}
										<li class="px-3 py-2 text-[14px] text-gray-500 text-center">
											Tidak ada data destinasi tersedia
										</li>
									{/if}

								</ul>
							</div>
						{/if}
					</div>
					<input type="hidden" name="destinasi" value={selectedDestinasi} required />
				</div>
			{/if}



			{#if showUmrahSeasonSection}
				<div class="flex flex-col gap-2">
					<label class="text-[13px] font-semibold text-gray-700" for="musim_umrah">Musim Umrah<span class="text-red-500 ml-1">*</span></label>
					<div class="relative">
						<div 
							class="h-11 px-3 pr-5 rounded-[10px] border border-[#e5e7eb] bg-white text-[14px] outline-none cursor-pointer flex items-center justify-between focus-within:border-[#942392] focus-within:[box-shadow:0_0_0_4px_rgba(148,35,146,0.18)]"
							onclick={() => isMusimUmrahOpen = !isMusimUmrahOpen}
							onblur={() => setTimeout(() => isMusimUmrahOpen = false, 200)}
						>
							<span class={selectedMusimUmrah ? 'text-gray-900' : 'text-gray-500'}>
								{selectedMusimUmrah ? umrahSeasons.find(season => String(season.id) === String(selectedMusimUmrah))?.name || 'Pilih Musim Umrah' : 'Pilih Musim Umrah'}
							</span>
							<svg 
								class={`w-4 h-4 text-gray-500 transition-transform duration-200 ${isMusimUmrahOpen ? 'rotate-180' : ''}`}
								fill="none" 
								stroke="currentColor" 
								viewBox="0 0 24 24"
							>
								<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"></path>
							</svg>
						</div>
						
						{#if isMusimUmrahOpen}
							<div class="absolute top-full left-0 right-0 mt-1 bg-white border border-[#e5e7eb] rounded-[10px] shadow-lg z-10 max-h-96 overflow-y-auto">
								<ul class="py-1">
									{#each umrahSeasons as season}
										<li 
											class={`px-3 py-2 cursor-pointer hover:bg-purple-50 text-[14px] ${selectedMusimUmrah === String(season.id) ? 'bg-purple-100 text-purple-700' : 'text-gray-700'}`}
											onclick={() => {
												selectedMusimUmrah = String(season.id);
												selectedKategoriUmrah = '';
												isMusimUmrahOpen = false;
											}}
										>
											{season.name}
										</li>
									{/each}
								</ul>
							</div>
						{/if}
					</div>
					<input type="hidden" name="musim_umrah" value={selectedMusimUmrah} required />
				</div>
			{/if}

			{#if showUmrahCategorySection}
				<div class="flex flex-col gap-2">
					<label class="text-[13px] font-semibold text-gray-700" for="kategori_umrah">Kategori Umrah<span class="text-red-500 ml-1">*</span></label>
					<div class="relative">
						<div 
							class={`h-11 px-3 pr-5 rounded-[10px] border border-[#e5e7eb] text-[14px] outline-none flex items-center justify-between focus-within:border-[#942392] focus-within:[box-shadow:0_0_0_4px_rgba(148,35,146,0.18)] ${(dynamicCategoryOptions?.length || 0) === 0 ? 'bg-gray-100 text-gray-500 cursor-not-allowed' : 'bg-white cursor-pointer'}`}
							onclick={() => {
								if ((dynamicCategoryOptions?.length || 0) > 0) {
									isKategoriUmrahOpen = !isKategoriUmrahOpen;
								}
							}}
							onblur={() => setTimeout(() => isKategoriUmrahOpen = false, 200)}
						>
							<span class={selectedKategoriUmrah ? 'text-gray-900' : 'text-gray-500'}>
								{selectedKategoriUmrah ? (() => {
									const categoryOption = (dynamicCategoryOptions.length > 0 ? dynamicCategoryOptions : fallbackCategoryOptions).find(opt => opt.value === selectedKategoriUmrah);
									return categoryOption ? categoryOption.label : 'Pilih Kategori Umrah';
								})() : 'Pilih Kategori Umrah'}
							</span>
							<svg 
								class={`w-4 h-4 text-gray-500 transition-transform duration-200 ${isKategoriUmrahOpen ? 'rotate-180' : ''} ${(dynamicCategoryOptions?.length || 0) === 0 ? 'opacity-50' : ''}`}
								fill="none" 
								stroke="currentColor" 
								viewBox="0 0 24 24"
							>
								<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"></path>
							</svg>
						</div>
						
						{#if isKategoriUmrahOpen && (dynamicCategoryOptions?.length || 0) > 0}
							<div class="absolute top-full left-0 right-0 mt-1 bg-white border border-[#e5e7eb] rounded-[10px] shadow-lg z-10 max-h-96 overflow-y-auto">
								<ul class="py-1">
									{#each (dynamicCategoryOptions.length > 0 ? dynamicCategoryOptions : fallbackCategoryOptions) as opt}
										<li 
											class={`px-3 py-2 text-[14px] ${opt.disabled ? 'text-gray-400 cursor-not-allowed' : 'cursor-pointer hover:bg-purple-50 text-gray-700'} ${selectedKategoriUmrah === opt.value ? 'bg-purple-100 text-purple-700' : ''}`}
											onclick={() => {
												if (!opt.disabled) {
													selectedKategoriUmrah = opt.value;
													selectedAirline = '';
													selectedTarikhUmrah = '';
													isKategoriUmrahOpen = false;
												}
											}}
										>
											{opt.label}
										</li>
									{/each}
								</ul>
							</div>
						{/if}
					</div>
					<input type="hidden" name="kategori_umrah" value={selectedKategoriUmrah} required />
				</div>
			{/if}

			{#if showAirlineSection}
				<div class="flex flex-col gap-2">
					<label class="text-[13px] font-semibold text-gray-700" for="airline">Penerbangan<span class="text-red-500 ml-1">*</span></label>
					<div class="relative">
						<div 
							class={`h-11 px-3 pr-5 rounded-[10px] border border-[#e5e7eb] text-[14px] outline-none flex items-center justify-between focus-within:border-[#942392] focus-within:[box-shadow:0_0_0_4px_rgba(148,35,146,0.18)] ${(dynamicAirlineOptions?.length || 0) === 0 ? 'bg-gray-100 text-gray-500 cursor-not-allowed' : 'bg-white cursor-pointer'}`}
							onclick={() => {
								if ((dynamicAirlineOptions?.length || 0) > 0) {
									isAirlineOpen = !isAirlineOpen;
								}
							}}
							onblur={() => setTimeout(() => isAirlineOpen = false, 200)}
						>
							<span class={selectedAirline ? 'text-gray-900' : 'text-gray-500'}>
								{selectedAirline ? (() => {
									const airlineOption = (dynamicAirlineOptions.length > 0 ? dynamicAirlineOptions : fallbackAirlineOptions).find(opt => opt.value === selectedAirline);
									return airlineOption ? airlineOption.label : 'Pilih Penerbangan';
								})() : 'Pilih Penerbangan'}
							</span>
							<svg 
								class={`w-4 h-4 text-gray-500 transition-transform duration-200 ${isAirlineOpen ? 'rotate-180' : ''} ${(dynamicAirlineOptions?.length || 0) === 0 ? 'opacity-50' : ''}`}
								fill="none" 
								stroke="currentColor" 
								viewBox="0 0 24 24"
							>
								<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"></path>
							</svg>
						</div>
						
						{#if isAirlineOpen && (dynamicAirlineOptions?.length || 0) > 0}
							<div class="absolute top-full left-0 right-0 mt-1 bg-white border border-[#e5e7eb] rounded-[10px] shadow-lg z-10 max-h-96 overflow-y-auto">
								<ul class="py-1">
									{#each (dynamicAirlineOptions.length > 0 ? dynamicAirlineOptions : fallbackAirlineOptions) as opt}
										<li 
											class={`px-3 py-2 text-[14px] ${opt.disabled ? 'text-gray-400 cursor-not-allowed' : 'cursor-pointer hover:bg-purple-50 text-gray-700'} ${selectedAirline === opt.value ? 'bg-purple-100 text-purple-700' : ''}`}
											onclick={() => {
												if (!opt.disabled) {
													selectedAirline = opt.value;
													selectedTarikhUmrah = '';
													isAirlineOpen = false;
												}
											}}
										>
											{opt.label}
										</li>
									{/each}
								</ul>
							</div>
						{/if}
					</div>
					<input type="hidden" name="airline" value={selectedAirline} required />
				</div>
			{/if}

			{#if showUmrahDateSection}
				<div class="flex flex-col gap-2">
					<label class="text-[13px] font-semibold text-gray-700" for="tarikh_umrah">Tarikh Umrah<span class="text-red-500 ml-1">*</span></label>
					<div class="relative">
						<div 
							class={`h-11 px-3 pr-5 rounded-[10px] border border-[#e5e7eb] text-[14px] outline-none flex items-center justify-between focus-within:border-[#942392] focus-within:[box-shadow:0_0_0_4px_rgba(148,35,146,0.18)] ${!selectedAirline || filteredUmrahDates.length === 0 ? 'bg-gray-100 text-gray-500 cursor-not-allowed' : 'bg-white cursor-pointer'}`}
							onclick={() => {
								if (selectedAirline && filteredUmrahDates.length > 0) {
									isTarikhUmrahOpen = !isTarikhUmrahOpen;
								}
							}}
							onblur={() => setTimeout(() => isTarikhUmrahOpen = false, 200)}
						>
							<span class={selectedTarikhUmrah ? 'text-gray-900' : 'text-gray-500'}>
								{selectedTarikhUmrah ? (() => {
									const date = filteredUmrahDates.find(d => String(d.id) === String(selectedTarikhUmrah));
									return date ? `${formatDate(date.start_date)} - ${formatDate(date.end_date)}` : 'Pilih Tarikh';
								})() : 'Pilih Tarikh'}
							</span>
							<svg 
								class={`w-4 h-4 text-gray-500 transition-transform duration-200 ${isTarikhUmrahOpen ? 'rotate-180' : ''} ${!selectedAirline || filteredUmrahDates.length === 0 ? 'opacity-50' : ''}`}
								fill="none" 
								stroke="currentColor" 
								viewBox="0 0 24 24"
							>
								<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"></path>
							</svg>
						</div>
						
						{#if isTarikhUmrahOpen && selectedAirline && filteredUmrahDates.length > 0}
							<div class="absolute top-full left-0 right-0 mt-1 bg-white border border-[#e5e7eb] rounded-[10px] shadow-lg z-10 max-h-96 overflow-y-auto">
								<ul class="py-1">
									{#each filteredUmrahDates as date}
										<li 
											class={`px-3 py-2 cursor-pointer hover:bg-purple-50 text-[14px] ${selectedTarikhUmrah === String(date.id) ? 'bg-purple-100 text-purple-700' : 'text-gray-700'}`}
											onclick={() => {
												selectedTarikhUmrah = String(date.id);
												isTarikhUmrahOpen = false;
											}}
										>
											{formatDate(date.start_date)} - {formatDate(date.end_date)}
										</li>
									{/each}
								</ul>
							</div>
						{/if}
					</div>
					<input type="hidden" name="tarikh_umrah" value={selectedTarikhUmrah} required />
				</div>
			{/if}

			{#if showDateSection}
				<div class="flex flex-col gap-2">
					<label class="text-[13px] font-semibold text-gray-700" for="tarikh_berlepas">Tarikh Pelancongan<span class="text-red-500 ml-1">*</span></label>
					<div class="relative">
						<div 
							class={`h-11 px-3 pr-5 rounded-[10px] border border-[#e5e7eb] text-[14px] outline-none flex items-center justify-between focus-within:border-[#942392] focus-within:[box-shadow:0_0_0_4px_rgba(148,35,146,0.18)] ${!selectedDestinasi || filteredOutboundDates.length === 0 ? 'bg-gray-100 text-gray-500 cursor-not-allowed' : 'bg-white cursor-pointer'}`}
							onclick={() => {
								if (selectedDestinasi && filteredOutboundDates.length > 0) {
									isTarikhOpen = !isTarikhOpen;
								}
							}}
							onblur={() => setTimeout(() => isTarikhOpen = false, 200)}
						>
							<span class={selectedTarikh ? 'text-gray-900' : 'text-gray-500'}>
								{selectedTarikh ? (() => {
									const date = filteredOutboundDates.find(d => String(d.id) === String(selectedTarikh));
									return date ? `${formatDate(date.start_date)} - ${formatDate(date.end_date)} (RM ${formatPrice(date.price)})` : 'Pilih Tarikh';
								})() : 'Pilih Tarikh'}
							</span>
							<svg 
								class={`w-4 h-4 text-gray-500 transition-transform duration-200 ${isTarikhOpen ? 'rotate-180' : ''} ${!selectedDestinasi || filteredOutboundDates.length === 0 ? 'opacity-50' : ''}`}
								fill="none" 
								stroke="currentColor" 
								viewBox="0 0 24 24"
							>
								<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"></path>
							</svg>
						</div>
						
						{#if isTarikhOpen && selectedDestinasi && filteredOutboundDates.length > 0}
							<div class="absolute top-full left-0 right-0 mt-1 bg-white border border-[#e5e7eb] rounded-[10px] shadow-lg z-10 max-h-96 overflow-y-auto">
								<ul class="py-1">
									{#each filteredOutboundDates as date}
										<li 
											class={`px-3 py-2 cursor-pointer hover:bg-purple-50 text-[14px] ${selectedTarikh === String(date.id) ? 'bg-purple-100 text-purple-700' : 'text-gray-700'}`}
											onclick={() => {
												selectedTarikh = String(date.id);
												isTarikhOpen = false;
											}}
										>
											{formatDate(date.start_date)} - {formatDate(date.end_date)} (RM {formatPrice(date.price)})
										</li>
									{/each}
								</ul>
							</div>
						{/if}
					</div>
					<input type="hidden" name="tarikh_berlepas" value={selectedTarikh} required />
				</div>
			{/if}

			{#if selectedTarikh || selectedTarikhUmrah}
				{#if selectedTarikhUmrah}
					<div class="flex flex-col gap-2">
						<label class="text-[13px] font-semibold text-gray-700" for="pilih_bilik">Pilih Bilik<span class="text-red-500 ml-1">*</span></label>
						<div class="relative">
							<div 
								class={`h-11 px-3 pr-5 rounded-[10px] border border-[#e5e7eb] text-[14px] outline-none flex items-center justify-between focus-within:border-[#942392] focus-within:[box-shadow:0_0_0_4px_rgba(148,35,146,0.18)] ${(dynamicRoomOptions?.length || 0) === 0 ? 'bg-gray-100 text-gray-500 cursor-not-allowed' : 'bg-white cursor-pointer'}`}
								onclick={() => {
									if ((dynamicRoomOptions?.length || 0) > 0) {
										isPilihBilikOpen = !isPilihBilikOpen;
									}
								}}
								onblur={() => setTimeout(() => isPilihBilikOpen = false, 200)}
							>
								<span class={selectedRoomType ? 'text-gray-900' : 'text-gray-500'}>
									{selectedRoomType ? (() => {
										const roomOption = (dynamicRoomOptions.length > 0 ? dynamicRoomOptions : fallbackRoomOptions).find(opt => opt.value === selectedRoomType);
										return roomOption ? roomOption.label : 'Pilih Jenis Bilik';
									})() : 'Pilih Jenis Bilik'}
								</span>
								<svg 
									class={`w-4 h-4 text-gray-500 transition-transform duration-200 ${isPilihBilikOpen ? 'rotate-180' : ''} ${(dynamicRoomOptions?.length || 0) === 0 ? 'opacity-50' : ''}`}
									fill="none" 
									stroke="currentColor" 
									viewBox="0 0 24 24"
								>
									<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"></path>
								</svg>
							</div>
							
							{#if isPilihBilikOpen && (dynamicRoomOptions?.length || 0) > 0}
								<div class="absolute top-full left-0 right-0 mt-1 bg-white border border-[#e5e7eb] rounded-[10px] shadow-lg z-10 max-h-96 overflow-y-auto">
									<ul class="py-1">
										{#each (dynamicRoomOptions.length > 0 ? dynamicRoomOptions : fallbackRoomOptions) as opt}
											<li 
												class={`px-3 py-2 text-[14px] ${opt.disabled ? 'text-gray-400 cursor-not-allowed' : 'cursor-pointer hover:bg-purple-50 text-gray-700'} ${selectedRoomType === opt.value ? 'bg-purple-100 text-purple-700' : ''}`}
												onclick={() => {
													if (!opt.disabled) {
														selectedRoomType = opt.value;
														isPilihBilikOpen = false;
													}
												}}
											>
												{opt.label}
											</li>
										{/each}
									</ul>
								</div>
							{/if}
						</div>
						<input type="hidden" name="pilih_bilik" value={selectedRoomType} required />
					</div>
				{/if}

				<div class="flex flex-col gap-2">
					<label class="text-[13px] font-semibold text-gray-700" for="bilangan">Bilangan Peserta Tambahan<span class="text-red-500 ml-1">*</span></label>
					<div class="relative">
						<div 
							class="h-11 px-3 pr-5 rounded-[10px] border border-[#e5e7eb] bg-white text-[14px] outline-none cursor-pointer flex items-center justify-between focus-within:border-[#942392] focus-within:[box-shadow:0_0_0_4px_rgba(148,35,146,0.18)]"
							onclick={() => isBilanganOpen = !isBilanganOpen}
							onblur={() => setTimeout(() => isBilanganOpen = false, 200)}
						>
							<span class={selectedBilangan !== '' ? 'text-gray-900' : 'text-gray-500'}>
								{selectedBilangan !== '' ? selectedBilangan : 'Pilih Bilangan Peserta Tambahan'}
							</span>
							<svg 
								class={`w-4 h-4 text-gray-500 transition-transform duration-200 ${isBilanganOpen ? 'rotate-180' : ''}`}
								fill="none" 
								stroke="currentColor" 
								viewBox="0 0 24 24"
							>
								<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"></path>
							</svg>
						</div>
						
						{#if isBilanganOpen}
							<div class="absolute top-full left-0 right-0 mt-1 bg-white border border-[#e5e7eb] rounded-[10px] shadow-lg z-10 max-h-48 overflow-y-auto">
								<ul class="py-1">
									{#each Array.from({length: 10}, (_, i) => i) as num}
										<li 
											class={`px-3 py-2 cursor-pointer hover:bg-purple-50 text-[14px] ${selectedBilangan === num ? 'bg-purple-100 text-purple-700' : 'text-gray-700'}`}
											onclick={() => {
												selectedBilangan = num;
												isBilanganOpen = false;
											}}
										>
											{num}
										</li>
									{/each}
								</ul>
							</div>
						{/if}
					</div>
					<input type="hidden" name="bilangan" value={selectedBilangan} required />
				</div>

				{#if selectedBilangan}
					<div class="col-span-full">
						<label class="flex items-center gap-3 cursor-pointer text-sm text-gray-700">
							<input type="checkbox" name="perlu_partner_bilik" bind:checked={perluPartnerBilik} class={checkboxInputClass} />
							<span>Perlukan partner bilik</span>
						</label>
					</div>
				{/if}
			{/if}

			<div class="col-span-full flex items-center gap-5 my-[30px]">
				<hr class="flex-1 h-px m-0 border-0 bg-gray-300">
				<h3 class="text-[18px] font-bold text-gray-700 m-0 whitespace-nowrap text-center">MAKLUMAT PESERTA</h3>
				<hr class="flex-1 h-px m-0 border-0 bg-gray-300">
			</div>
			
			

			<div class="flex flex-col gap-2">
				<p class="text-xs text-emerald-600 mt-2 italic">Data pendaftar akan ditambahkan sebagai Peserta 1 secara otomatis</p>
			</div>

			<div class="col-span-full border border-[#e5e7eb] rounded-[10px] p-4 sm:p-5 mb-4 bg-[#f9fafb]">
				<h4 class="text-[16px] font-semibold text-gray-700 m-0 mb-4 pb-2 border-b-2 border-[#d1d5db]">
					Peserta 1
					<span class="bg-[#059669] text-white text-[10px] px-2 py-[2px] rounded-full ml-2">Data Disalin</span>
				</h4>
				<div class="grid grid-cols-2 gap-3 sm:gap-4 max-[720px]:grid-cols-1">
					<div class="flex flex-col gap-2">
						<label class="text-[13px] font-semibold text-gray-700" for="peserta_nama_1">Nama Peserta 1<span class="text-red-500 ml-1">*</span></label>
						<input 
							id="peserta_nama_1" 
							name="peserta_nama_1" 
							type="text" 
							placeholder="Nama Penuh Peserta 1" 
							required 
							bind:value={peserta1Nama}
							oninput={handleNameInput}
							onkeypress={handleNameKeyPress}
							readonly={true}
							class={controlClass + ' bg-gray-100 text-gray-500 cursor-not-allowed focus:border-[#d1d5db] focus:shadow-none'}
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
							bind:value={peserta1Nokp}
							oninput={handleIdInput}
							onkeypress={handleIdKeyPress}
							readonly={true}
							class={controlClass + ' bg-gray-100 text-gray-500 cursor-not-allowed focus:border-[#d1d5db] focus:shadow-none'}
						/>
					</div>
				</div>
			</div>

			{#if selectedBilangan && pesertaData.length > 0}
				<!-- Peserta tambahan (Peserta 2, 3, dst) hanya muncul jika bilangan > 0 -->
				{#each pesertaData as peserta, index}
					<div class="col-span-full border border-[#e5e7eb] rounded-[10px] p-4 sm:p-5 mb-4 bg-[#f9fafb]">
						<h4 class="text-[16px] font-semibold text-gray-700 m-0 mb-4 pb-2 border-b-2 border-[#d1d5db]">
							Peserta {peserta.id}
						</h4>
						<div class="grid grid-cols-2 gap-3 sm:gap-4 max-[720px]:grid-cols-1">
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
								<label class="text-[13px] font-semibold text-gray-700" for="peserta_nokp_{peserta.id}">No K/P Peserta {peserta.id}</label>
								<input 
									id="peserta_nokp_{peserta.id}" 
									name="peserta_nokp_{peserta.id}" 
									type="text" 
									placeholder="Contoh: 970109015442" 
									maxlength="12"
									bind:value={peserta.nokp}
									oninput={handleIdInput}
									onkeypress={handleIdKeyPress}
									class={controlClass}
								/>
							</div>
						</div>
						<div class="col-span-full mt-3 sm:mt-4">
							<p class="text-[13px] font-semibold text-gray-700 mb-2">Kategori Peserta:</p>
							<div class="flex flex-wrap gap-3 sm:gap-4">
								<label class={checkboxLabelClass}>
									<input type="radio" name="peserta_kategori_{peserta.id}" value="cwb" bind:group={peserta.kategori} class={checkboxInputClass} />
									<span>CWB</span>
								</label>
								<label class={checkboxLabelClass}>
									<input type="radio" name="peserta_kategori_{peserta.id}" value="infant" bind:group={peserta.kategori} class={checkboxInputClass} />
									<span>Infant</span>
								</label>
								<label class={checkboxLabelClass}>
									<input type="radio" name="peserta_kategori_{peserta.id}" value="cnb" bind:group={peserta.kategori} class={checkboxInputClass} />
									<span>CNB</span>
								</label>
							</div>
						</div>
					</div>
				{/each}
			{/if}

			{#if showError}
				<div class="bg-[#fee2e2] border border-[#ef4444] rounded-[10px] p-4 mb-4 sm:mb-5 text-[#dc2626] text-sm">
					<p class="font-semibold mb-2">{errorMessage}</p>
					{#if validationErrors.length > 0}
						<ul class="list-disc list-inside space-y-1">
							{#each validationErrors as error}
								<li>{error}</li>
							{/each}
						</ul>
					{/if}
				</div>
			{/if}

			<div class="col-span-full mt-3 sm:mt-2">
				<button 
					type="submit" 
					disabled={isSubmitting}
					class={`w-full h-[46px] border-0 rounded-[10px] text-white font-semibold tracking-wide shadow-[0_6px_14px_rgba(148,35,146,0.25)] transition-all duration-200 ${
						isSubmitting 
							? 'bg-gray-400 cursor-not-allowed shadow-none' 
							: 'bg-gradient-to-r from-[#942392] to-[#942392] cursor-pointer hover:brightness-105'
					}`}
				>
					{#if isSubmitting}
						<div class="flex items-center justify-center gap-3">
							<div class="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent"></div>
							<span>Sedang Menghantar...</span>
						</div>
					{:else}
						HANTAR
					{/if}
				</button>
			</div>
		</form>
		</div>
	{/if}
</section>

