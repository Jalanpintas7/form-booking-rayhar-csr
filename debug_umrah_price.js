// Debug script untuk mencari akar masalah totalHargaUmrah yang null
console.log('=== DEBUG UMRah PRICE CALCULATION ===');

// Simulasi data yang seharusnya ada
const mockData = {
    selectedTarikhUmrah: '1',
    selectedRoomType: 'double',
    selectedBilangan: '1',
    pesertaData: [
        { kategori: 'cwb' }
    ],
    filteredUmrahDates: [
        {
            id: '1',
            double: '2000',
            triple: '1500',
            quadruple: '1200',
            quintuple: '1000',
            single: '2500',
            cnb: '800',
            infant: '400'
        }
    ]
};

console.log('Mock Data:', mockData);

// Test fungsi calculateUmrahTotalPrice
function calculateUmrahTotalPrice() {
    const { selectedTarikhUmrah, selectedRoomType, selectedBilangan, pesertaData, filteredUmrahDates } = mockData;
    
    console.log('=== FUNCTION EXECUTION ===');
    console.log('selectedTarikhUmrah:', selectedTarikhUmrah);
    console.log('selectedRoomType:', selectedRoomType);
    console.log('selectedBilangan:', selectedBilangan);
    console.log('pesertaData:', pesertaData);
    console.log('filteredUmrahDates:', filteredUmrahDates);
    
    if (!selectedTarikhUmrah || !selectedRoomType) {
        console.log('❌ Early return: selectedTarikhUmrah atau selectedRoomType kosong');
        return 0;
    }

    // Cari data tarikh umrah yang dipilih
    const selectedUmrahDate = filteredUmrahDates.find(d => String(d.id) === String(selectedTarikhUmrah));
    console.log('selectedUmrahDate found:', selectedUmrahDate);
    
    if (!selectedUmrahDate) {
        console.log('❌ Early return: selectedUmrahDate tidak ditemukan');
        return 0;
    }

    // Dapatkan harga dasar berdasarkan jenis bilik yang dipilih
    let basePrice = 0;
    let roomTypeLabel = '';
    
    switch (selectedRoomType) {
        case 'double':
            basePrice = parseFloat(selectedUmrahDate.double) || 0;
            roomTypeLabel = 'Bilik Double/Twin';
            break;
        case 'triple':
            basePrice = parseFloat(selectedUmrahDate.triple) || 0;
            roomTypeLabel = 'Bilik Triple';
            break;
        case 'quad':
            basePrice = parseFloat(selectedUmrahDate.quadruple) || 0;
            roomTypeLabel = 'Bilik Quad';
            break;
        case 'quintuple':
            basePrice = parseFloat(selectedUmrahDate.quintuple) || 0;
            roomTypeLabel = 'Bilik Quintuple';
            break;
        case 'single':
            basePrice = parseFloat(selectedUmrahDate.single) || 0;
            roomTypeLabel = 'Bilik Single';
            break;
        default:
            console.log('❌ Early return: selectedRoomType tidak valid');
            return 0;
    }

    console.log('basePrice:', basePrice);
    console.log('roomTypeLabel:', roomTypeLabel);

    if (basePrice <= 0) {
        console.log('❌ Early return: basePrice <= 0');
        return 0;
    }

    // Hitung total berdasarkan jumlah peserta
    let totalPrice = basePrice; // Peserta 1 (pendaftar utama)
    console.log('totalPrice awal (peserta 1):', totalPrice);

    // Tambahkan harga untuk peserta tambahan berdasarkan kategori
    if (selectedBilangan && pesertaData.length > 0) {
        console.log('Memproses peserta tambahan...');
        pesertaData.forEach((peserta, index) => {
            console.log(`Peserta ${index + 2}:`, peserta);
            
            if (peserta.kategori === 'cwb') {
                // CWB (Child With Bed) - kurangi RM 500 dari harga bilik yang dipilih
                let cwbPrice = basePrice - 500;
                // Pastikan harga tidak negatif
                cwbPrice = Math.max(cwbPrice, 0);
                totalPrice += cwbPrice;
                console.log(`CWB: ${basePrice} - 500 = ${cwbPrice}, totalPrice: ${totalPrice}`);
            } else if (peserta.kategori === 'cnb') {
                // CNB (Child No Bed) - gunakan harga spesifik dari Supabase
                const cnbPrice = parseFloat(selectedUmrahDate.cnb) || 0;
                const finalCnbPrice = cnbPrice > 0 ? cnbPrice : basePrice;
                totalPrice += finalCnbPrice;
                console.log(`CNB: ${cnbPrice} > 0 ? ${cnbPrice} : ${basePrice} = ${finalCnbPrice}, totalPrice: ${totalPrice}`);
            } else if (peserta.kategori === 'infant') {
                // Infant - gunakan harga spesifik dari Supabase
                const infantPrice = parseFloat(selectedUmrahDate.infant) || 0;
                const finalInfantPrice = infantPrice > 0 ? infantPrice : basePrice;
                totalPrice += finalInfantPrice;
                console.log(`Infant: ${infantPrice} > 0 ? ${infantPrice} : ${basePrice} = ${finalInfantPrice}, totalPrice: ${totalPrice}`);
            } else {
                // Dewasa (tidak ada kategori khusus) - 100% dari harga bilik yang dipilih
                totalPrice += basePrice;
                console.log(`Dewasa: ${basePrice}, totalPrice: ${totalPrice}`);
            }
        });
    } else {
        console.log('Tidak ada peserta tambahan atau selectedBilangan kosong');
    }

    console.log('✅ Final totalPrice:', totalPrice);
    return totalPrice;
}

// Test execution
console.log('\n=== TESTING FUNCTION ===');
const result = calculateUmrahTotalPrice();
console.log('Result:', result);
console.log('Result type:', typeof result);
console.log('Result is null:', result === null);
console.log('Result is undefined:', result === undefined);

// Test dengan data yang berbeda
console.log('\n=== TESTING WITH DIFFERENT DATA ===');

// Test 1: Tanpa peserta tambahan
mockData.selectedBilangan = '';
mockData.pesertaData = [];
console.log('\nTest 1: Tanpa peserta tambahan');
const result1 = calculateUmrahTotalPrice();
console.log('Result 1:', result1);

// Test 2: Dengan peserta CWB
mockData.selectedBilangan = '1';
mockData.pesertaData = [{ kategori: 'cwb' }];
console.log('\nTest 2: Dengan peserta CWB');
const result2 = calculateUmrahTotalPrice();
console.log('Result 2:', result2);

// Test 3: Dengan peserta CNB
mockData.pesertaData = [{ kategori: 'cnb' }];
console.log('\nTest 3: Dengan peserta CNB');
const result3 = calculateUmrahTotalPrice();
console.log('Result 3:', result3);

// Test 4: Dengan peserta Infant
mockData.pesertaData = [{ kategori: 'infant' }];
console.log('\nTest 4: Dengan peserta Infant');
const result4 = calculateUmrahTotalPrice();
console.log('Result 4:', result4);

// Test 5: Dengan peserta dewasa
mockData.pesertaData = [{ kategori: 'dewasa' }];
console.log('\nTest 5: Dengan peserta dewasa');
const result5 = calculateUmrahTotalPrice();
console.log('Result 5:', result5);

// Test 6: Dengan multiple peserta
mockData.pesertaData = [
    { kategori: 'cwb' },
    { kategori: 'cnb' },
    { kategori: 'infant' }
];
console.log('\nTest 6: Dengan multiple peserta');
const result6 = calculateUmrahTotalPrice();
console.log('Result 6:', result6);

console.log('\n=== DEBUG COMPLETE ===');
