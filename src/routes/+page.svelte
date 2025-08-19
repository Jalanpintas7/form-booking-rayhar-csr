<script>
	import { enhance } from '$app/forms';
	let { data, form } = $props();
	const branches = data?.branches ?? [];
	const packageTypes = data?.packageTypes ?? [];
	const destinations = data?.destinations ?? [];
	const outboundDates = data?.outboundDates ?? [];
	const umrahSeasons = data?.umrahSeasons ?? [];
	const umrahCategories = data?.umrahCategories ?? [];
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
	let selectedDestinasi = $state('');
	let selectedTarikh = $state('');
	let selectedBilangan = $state('');
	let selectedMusimUmrah = $state('');
	let selectedKategoriUmrah = $state('');
	
	// State untuk filtered dates
	let filteredOutboundDates = $state([]);
	
	// State untuk data peserta
	let pesertaData = $state([]);
	
	// Effect untuk mengontrol visibility berdasarkan pilihan paket
	$effect(() => {
		if (selectedPackageType) {
			// Cek apakah paket yang dipilih adalah outbound atau umrah
			const selectedPackage = packageTypes.find(p => p.id == selectedPackageType);
			if (selectedPackage) {
				const packageName = selectedPackage.name.toLowerCase();
				if (packageName.includes('outbound')) {
					showDestinationSection = true;
					showUmrahSeasonSection = false;
					showUmrahCategorySection = false;
				} else if (packageName.includes('umrah')) {
					showDestinationSection = false;
					showUmrahSeasonSection = true;
					showUmrahCategorySection = false;
				} else {
					// Paket lain (jika ada)
					showDestinationSection = false;
					showUmrahSeasonSection = false;
					showUmrahCategorySection = false;
				}
			}
		} else {
			showDestinationSection = false;
			showDateSection = false;
			showUmrahSeasonSection = false;
			showUmrahCategorySection = false;
			selectedDestinasi = '';
			selectedTarikh = '';
			selectedMusimUmrah = '';
			selectedKategoriUmrah = '';
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

	// Effect untuk mengontrol visibility tarikh berdasarkan pilihan destinasi
	$effect(() => {
		if (selectedDestinasi && showDestinationSection) {
			showDateSection = true;
		} else {
			showDateSection = false;
			selectedTarikh = '';
		}
	});
	
	// Effect untuk filter outbound dates berdasarkan destinasi yang dipilih
	$effect(() => {
		if (!selectedDestinasi) {
			filteredOutboundDates = [];
			return;
		}
		
		// Debug: log data untuk troubleshooting
		console.log('Selected Destinasi:', selectedDestinasi);
		console.log('All Outbound Dates:', outboundDates);
		
		const filtered = outboundDates.filter((date) => {
			// Pastikan destination_id ada dan cocok dengan destinasi yang dipilih
			const matches = date.destination_id === selectedDestinasi;
			console.log(`Date ${date.id}: destination_id=${date.destination_id}, selected=${selectedDestinasi}, matches=${matches}`);
			return matches;
		});
		
		console.log('Filtered Dates:', filtered);
		filteredOutboundDates = filtered;
	});

	// Effect untuk reset data peserta ketika tarikh atau kategori umrah berubah
	$effect(() => {
		if (!selectedTarikh && !selectedKategoriUmrah) {
			selectedBilangan = '';
			pesertaData = [];
		}
	});

	// Effect untuk mengupdate data peserta ketika bilangan berubah
	$effect(() => {
		if (selectedBilangan) {
			updatePesertaData(selectedBilangan);
		} else {
			pesertaData = [];
		}
	});

	// Debug: log data ketika komponen dimuat
	$effect(() => {
		console.log('=== DEBUG DATA ===');
		console.log('Destinations:', destinations);
		console.log('Outbound Dates:', outboundDates);
		console.log('Umrah Seasons:', umrahSeasons);
		console.log('Umrah Categories:', umrahCategories);
		console.log('Selected Destinasi:', selectedDestinasi);
		console.log('Filtered Outbound Dates:', filteredOutboundDates);
		console.log('Filtered Length:', filteredOutboundDates.length);
		
		// Debug struktur data destinations
		if (destinations.length > 0) {
			console.log('First Destination:', destinations[0]);
			console.log('First Destination ID:', destinations[0].id);
			console.log('First Destination ID Type:', typeof destinations[0].id);
		}
		
		// Debug struktur data outbound dates
		if (outboundDates.length > 0) {
			console.log('First Outbound Date:', outboundDates[0]);
			console.log('First Outbound Date destination_id:', outboundDates[0].destination_id);
			console.log('First Outbound Date destination_id Type:', typeof outboundDates[0].destination_id);
		}
		
		// Debug struktur data umrah seasons
		if (umrahSeasons.length > 0) {
			console.log('First Umrah Season:', umrahSeasons[0]);
		}
		
		// Debug struktur data umrah categories
		if (umrahCategories.length > 0) {
			console.log('First Umrah Category:', umrahCategories[0]);
		}
		
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
		pesertaData = Array.from({ length: jumlah }, (_, index) => ({
			id: index + 1,
			nama: '',
			nokp: ''
		}));
	}
</script>

<section class="container page-section">
	<div class="page-title">
		<h2>ISI MAKLUMAT ANDA</h2>
	</div>

	{#if showSuccess}
		<div class="success-message">
			<h3>Terima Kasih!</h3>
			<p>Maklumat anda berjaya dihantar.</p>
		</div>
	{:else}
		<div class="card">
			<form class="form-grid" method="POST" use:enhance={() => {
				return async ({ result }) => {
					if (result.type === 'success') {
						showSuccess = true;
						showError = false;
					} else if (result.type === 'failure') {
						showError = true;
						errorMessage = result.data?.error || 'Ralat berlaku. Sila cuba lagi.';
					}
				};
			}}>
			<div class="field">
				<label for="gelaran">Gelaran<span class="req">*</span></label>
				<select id="gelaran" name="gelaran" required>
					<option value="">Pilih Gelaran</option>
					<option>Cik</option>
					<option>Encik</option>
					<option>Puan</option>
					<option>Tuan</option>
					<option>Datin</option>
					<option>Dato</option>
				</select>
			</div>

			<div class="field">
				<label for="nama">Nama<span class="req">*</span></label>
				<input id="nama" name="nama" type="text" placeholder="Nama Penuh" required />
			</div>

			<div class="field">
				<label for="nokp">No K/P<span class="req">*</span></label>
				<input 
					id="nokp" 
					name="nokp" 
					type="text" 
					placeholder="Contoh: 970109015442" 
					maxlength="12"
					required 
					oninput={handleIdInput}
					onkeypress={handleIdKeyPress}
				/>
			</div>

			<div class="field">
				<label for="telefon">Telefon<span class="req">*</span></label>
				<input 
					id="telefon" 
					name="telefon" 
					type="tel" 
					placeholder="Contoh: 0177285445" 
					required 
					oninput={handlePhoneInput}
					onkeypress={handlePhoneKeyPress}
				/>
			</div>

			<div class="field">
				<label for="email">Email<span class="req">*</span></label>
				<input 
					id="email" 
					name="email" 
					type="email" 
					placeholder="Contoh: aziah@gmail.com" 
					required 
				/>
			</div>

			<div class="field">
				<label for="alamat">ALAMAT<span class="req">*</span></label>
				<input 
					id="alamat" 
					name="alamat" 
					type="text" 
					placeholder="Nombor Rumah" 
					required 
				/>
			</div>

			<div class="field">
				<label for="poskod">Poskod<span class="req">*</span></label>
				<input 
					id="poskod" 
					name="poskod" 
					type="text" 
					placeholder="Poskod" 
					maxlength="5"
					required 
				/>
			</div>

			<div class="field">
				<label for="negeri">Negeri<span class="req">*</span></label>
				<select id="negeri" name="negeri" bind:value={selectedNegeri} required>
					<option value="">Select Negeri</option>
					{#each negeri as n}
						<option value={n}>{n}</option>
					{/each}
				</select>
			</div>

			<div class="field">
				<label for="bandar">Bandar<span class="req">*</span></label>
				<select id="bandar" name="bandar" required disabled={!selectedNegeri}>
					<option value="">Select Bandar</option>
					{#if selectedNegeri && bandar[selectedNegeri]}
						{#each bandar[selectedNegeri] as b}
							<option value={b}>{b}</option>
						{/each}
					{/if}
				</select>
			</div>

			<div class="field">
				<label for="cawangan">Cawangan<span class="req">*</span></label>
				<select id="cawangan" name="cawangan" required>
					<option value="">Pilih Cawangan Anda</option>
					{#each branches as b}
						<option value={b.id}>{b.name}</option>
					{/each}
				</select>
			</div>

			<!-- Section Divider -->
			<div class="section-divider">
				<hr class="divider-line">
				<h3 class="section-title">SILA PILIH PAKEJ ANDA</h3>
				<hr class="divider-line">
			</div>

			<!-- Jenis Paket - Selalu Tampil -->
			<div class="field">
				<label for="pakej">Jenis Paket<span class="req">*</span></label>
				<select id="pakej" name="pakej" required bind:value={selectedPackageType}>
					<option value="">Pilihan Jenis Paket</option>
					{#each packageTypes as p}
						<option value={p.id}>{p.name}</option>
					{/each}
				</select>
			</div>

			<!-- Destinasi - Hanya tampil jika paket outbound dipilih -->
			{#if showDestinationSection}
				<div class="field">
					<label for="destinasi">Destinasi<span class="req">*</span></label>
					<select id="destinasi" name="destinasi" required bind:value={selectedDestinasi} onchange={() => { selectedTarikh = ''; }}>
						<option value="">Pilih Destinasi</option>
						{#each destinations as d}
							<option value={String(d.id)}>{d.name}</option>
						{/each}
					</select>
				</div>
			{/if}

			<!-- Musim Umrah - Hanya tampil jika paket umrah dipilih -->
			{#if showUmrahSeasonSection}
				<div class="field">
					<label for="musim_umrah">Musim Umrah<span class="req">*</span></label>
					<select id="musim_umrah" name="musim_umrah" required bind:value={selectedMusimUmrah} onchange={() => { selectedKategoriUmrah = ''; }}>
						<option value="">Pilih Musim Umrah</option>
						{#each umrahSeasons as season}
							<option value={season.id}>{season.name}</option>
						{/each}
					</select>
				</div>
			{/if}

			<!-- Kategori Umrah - Hanya tampil jika musim umrah dipilih -->
			{#if showUmrahCategorySection}
				<div class="field">
					<label for="kategori_umrah">Kategori Umrah<span class="req">*</span></label>
					<select id="kategori_umrah" name="kategori_umrah" required bind:value={selectedKategoriUmrah}>
						<option value="">Pilih Kategori Umrah</option>
						{#each umrahCategories as category}
							<option value={category.id}>{category.name} - {category.price_range} ({category.duration_days} hari)</option>
						{/each}
					</select>
				</div>
			{/if}

			<!-- Tarikh Pelancongan - Hanya tampil jika destinasi dipilih -->
			{#if showDateSection}
				<div class="field">
					<label for="tarikh_berlepas">Tarikh Pelancongan<span class="req">*</span></label>
					<select id="tarikh_berlepas" name="tarikh_berlepas" required disabled={!selectedDestinasi || filteredOutboundDates.length === 0} bind:value={selectedTarikh}>
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

			<!-- Bilangan Peserta - Hanya tampil jika tarikh dipilih (outbound) atau kategori umrah dipilih -->
			{#if (showDateSection && selectedTarikh) || (showUmrahCategorySection && selectedKategoriUmrah)}
				<div class="field">
					<label for="bilangan">Bilangan Peserta Yang Akan Mengikuti<span class="req">*</span></label>
					<select id="bilangan" name="bilangan" required bind:value={selectedBilangan}>
						<option value="">0</option>
						{#each Array.from({length: 20}, (_, i) => i + 1) as num}
							<option value={num}>{num}</option>
						{/each}
					</select>
				</div>
			{/if}

			<!-- Field Peserta - Hanya tampil jika bilangan peserta dipilih -->
			{#if selectedBilangan && pesertaData.length > 0}
				<div class="section-divider">
					<hr class="divider-line">
					<h3 class="section-title">MAKLUMAT PESERTA</h3>
					<hr class="divider-line">
				</div>
				
				{#each pesertaData as peserta, index}
					<div class="peserta-section">
						<h4 class="peserta-title">Peserta {peserta.id}</h4>
						<div class="peserta-fields">
							<div class="field">
								<label for="peserta_nama_{peserta.id}">Nama Peserta {peserta.id}<span class="req">*</span></label>
								<input 
									id="peserta_nama_{peserta.id}" 
									name="peserta_nama_{peserta.id}" 
									type="text" 
									placeholder="Nama Penuh Peserta {peserta.id}" 
									required 
									bind:value={peserta.nama}
								/>
							</div>
							<div class="field">
								<label for="peserta_nokp_{peserta.id}">No K/P Peserta {peserta.id}<span class="req">*</span></label>
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
								/>
							</div>
						</div>
					</div>
				{/each}
			{/if}

			<!-- Error Message - Ditampilkan di bawah form -->
			{#if showError}
				<div class="error-message">
					<p>{errorMessage}</p>
				</div>
			{/if}

			<div class="actions">
				<button type="submit" class="btn-primary">HANTAR</button>
			</div>
		</form>
		</div>
	{/if}
</section>

<style>
	.page-section {
		padding: 40px 0 0;
	}

	.page-title {
		text-align: center;
		margin-bottom: 20px;
	}

	.page-title h2 {
		margin: 0;
		font-size: 28px;
		font-weight: 700;
		letter-spacing: 0.4px;
	}

	.card {
		background: var(--card-bg);
		border: 1px solid var(--border);
		border-radius: 14px;
		box-shadow: 0 10px 24px rgba(17, 24, 39, 0.06);
		padding: 28px;
		max-width: 720px;
		margin: 0 auto;
	}

	.form-grid {
		display: grid;
		grid-template-columns: 1fr 1fr;
		gap: 16px 20px;
	}

	.field {
		display: flex;
		flex-direction: column;
		gap: 8px;
	}

	label {
		font-size: 13px;
		font-weight: 600;
		color: #374151;
	}

	.req { color: #ef4444; margin-left: 4px; }

	input, select, textarea {
		border-radius: 10px;
		border: 1px solid var(--border);
		padding: 0 12px;
		font-size: 14px;
		background: #fff;
		outline: none;
		transition: box-shadow 120ms ease, border-color 120ms ease;
	}

	input, select {
		height: 44px;
	}

	textarea {
		min-height: 80px;
		resize: vertical;
		padding: 12px;
		font-family: inherit;
	}

	input:focus, select:focus, textarea:focus {
		border-color: var(--primary-600);
		box-shadow: var(--ring);
	}

	select:disabled {
		background: #f3f4f6;
		color: #9ca3af;
		cursor: not-allowed;
	}

	.actions {
		grid-column: 1 / -1;
		margin-top: 8px;
	}

	.btn-primary {
		width: 100%;
		height: 46px;
		border: none;
		border-radius: 10px;
		color: #fff;
		font-weight: 600;
		letter-spacing: 0.6px;
		background: linear-gradient(90deg, var(--primary-800), var(--primary-600));
		box-shadow: 0 6px 14px rgba(123, 31, 162, 0.25);
		cursor: pointer;
	}

	.btn-primary:hover { filter: brightness(1.02); }

	@media (max-width: 720px) {
		.form-grid { grid-template-columns: 1fr; }
	}

	.success-message {
		background: #d1fae5;
		border: 1px solid #10b981;
		border-radius: 14px;
		padding: 28px;
		text-align: center;
		max-width: 720px;
		margin: 0 auto;
	}

	.success-message h3 {
		color: #065f46;
		margin: 0 0 12px 0;
		font-size: 24px;
		font-weight: 600;
	}

	.success-message p {
		color: #047857;
		margin: 0;
		font-size: 16px;
	}

	.error-message {
		background: #fee2e2;
		border: 1px solid #ef4444;
		border-radius: 10px;
		padding: 16px;
		margin-bottom: 20px;
		color: #dc2626;
		font-size: 14px;
		text-align: center;
	}

	.section-divider {
		grid-column: 1 / -1;
		display: flex;
		align-items: center;
		gap: 20px;
		margin: 30px 0;
	}

	.divider-line {
		flex: 1;
		height: 1px;
		background: #d1d5db;
		border: none;
		margin: 0;
	}

	.section-title {
		font-size: 18px;
		font-weight: 700;
		color: #374151;
		margin: 0;
		white-space: nowrap;
		text-align: center;
	}

	.peserta-section {
		grid-column: 1 / -1;
		border: 1px solid #e5e7eb;
		border-radius: 10px;
		padding: 20px;
		margin-bottom: 16px;
		background: #f9fafb;
	}

	.peserta-title {
		font-size: 16px;
		font-weight: 600;
		color: #374151;
		margin: 0 0 16px 0;
		padding-bottom: 8px;
		border-bottom: 2px solid #d1d5db;
	}

	.peserta-fields {
		display: grid;
		grid-template-columns: 1fr 1fr;
		gap: 16px;
	}

	@media (max-width: 720px) {
		.peserta-fields {
			grid-template-columns: 1fr;
		}
	}
</style>
