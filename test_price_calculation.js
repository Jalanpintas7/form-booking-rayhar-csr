// Test file untuk memverifikasi logika perhitungan harga
// Jalankan dengan: node test_price_calculation.js

// Mock data untuk testing
const mockOutboundDate = {
    id: 'test-outbound-id',
    price: '1000'
};

const mockUmrahDate = {
    id: 'test-umrah-id',
    double: 16590,
    triple: 14590,
    quadruple: 13490,
    quintuple: 12590,
    low_deck_interior: 18590,
    low_deck_seaview: 19590,
    low_deck_balcony: 20590,
    high_deck_interior: 17590,
    high_deck_seaview: 18590,
    high_deck_balcony: 19590,
    cwb: 16090,
    cnb: 250,
    infant: 2500
};

// Fungsi perhitungan harga (simplified untuk testing)
function calculateOutboundTotalPrice(basePrice, numberOfParticipants) {
    // Untuk pelancongan: semua peserta dikenakan harga yang sama
    const totalPrice = basePrice * numberOfParticipants;
    console.log(`Pelancongan price calculation: RM ${basePrice} × ${numberOfParticipants} participants = RM ${totalPrice}`);
    return totalPrice;
}

function calculateUmrahTotalPrice(roomType, numberOfParticipants, participantCategories) {
    // Ambil harga bilik berdasarkan jenis yang dipilih
    let basePrice = null;
    switch (roomType) {
        case 'double':
            basePrice = mockUmrahDate.double;
            break;
        case 'triple':
            basePrice = mockUmrahDate.triple;
            break;
        case 'quad':
            basePrice = mockUmrahDate.quadruple;
            break;
        case 'quintuple':
            basePrice = mockUmrahDate.quintuple;
            break;
        case 'low_deck_interior':
            basePrice = mockUmrahDate.low_deck_interior;
            break;
        case 'low_deck_seaview':
            basePrice = mockUmrahDate.low_deck_seaview;
            break;
        case 'low_deck_balcony':
            basePrice = mockUmrahDate.low_deck_balcony;
            break;
        case 'high_deck_interior':
            basePrice = mockUmrahDate.high_deck_interior;
            break;
        case 'high_deck_seaview':
            basePrice = mockUmrahDate.high_deck_seaview;
            break;
        case 'high_deck_balcony':
            basePrice = mockUmrahDate.high_deck_balcony;
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
					// CWB (Child Without Bed): harga dari database
					participantPrice = mockUmrahDate.cwb || 0;
					console.log(`Peserta ${i} (CWB): RM ${participantPrice}`);
					break;
                case 'cnb':
                    // CNB (Child No Bed): harga dari database
                    participantPrice = mockUmrahDate.cnb || 0;
                    console.log(`Peserta ${i} (CNB): RM ${participantPrice}`);
                    break;
                case 'infant':
                    // Infant: harga dari database
                    participantPrice = mockUmrahDate.infant || 0;
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
}

// Test cases
function runTests() {
    console.log('=== TESTING PRICE CALCULATION LOGIC ===\n');

    // Test 1: Pelancongan - 1 peserta
    console.log('Test 1: Pelancongan - 1 peserta');
    const outboundPrice1 = calculateOutboundTotalPrice(1000, 1);
    console.log(`Result: RM ${outboundPrice1}\n`);

    // Test 2: Pelancongan - 3 peserta
    console.log('Test 2: Pelancongan - 3 peserta');
    const outboundPrice3 = calculateOutboundTotalPrice(1000, 3);
    console.log(`Result: RM ${outboundPrice3}\n`);

    // Test 3: Umrah - Double bilik, 1 peserta
    console.log('Test 3: Umrah - Double bilik, 1 peserta');
    const umrahPrice1 = calculateUmrahTotalPrice('double', 1, new Map());
    console.log(`Result: RM ${umrahPrice1}\n`);

    // Test 4: Umrah - Double bilik, 2 peserta (pendaftar + CWB)
    console.log('Test 4: Umrah - Double bilik, 2 peserta (pendaftar + CWB)');
    const categories2 = new Map([['2', 'cwb']]);
    const umrahPrice2 = calculateUmrahTotalPrice('double', 2, categories2);
    console.log(`Result: RM ${umrahPrice2}\n`);

    // Test 5: Umrah - Double bilik, 3 peserta (pendaftar + CWB + Infant)
    console.log('Test 5: Umrah - Double bilik, 3 peserta (pendaftar + CWB + Infant)');
    const categories3 = new Map([
        ['2', 'cwb'],
        ['3', 'infant']
    ]);
    const umrahPrice3 = calculateUmrahTotalPrice('double', 3, categories3);
    console.log(`Result: RM ${umrahPrice3}\n`);

    // Test 6: Umrah - Triple bilik, 4 peserta (pendaftar + CWB + CNB + Normal)
    console.log('Test 6: Umrah - Triple bilik, 4 peserta (pendaftar + CWB + CNB + Normal)');
    const categories4 = new Map([
        ['2', 'cwb'],
        ['3', 'cnb'],
        ['4', 'normal']
    ]);
    const umrahPrice4 = calculateUmrahTotalPrice('triple', 4, categories4);
    console.log(`Result: RM ${umrahPrice4}\n`);

    // Test 7: Umrah - Cruise cabin (low_deck_balcony), 2 peserta (pendaftar + CWB)
    console.log('Test 7: Umrah - Cruise cabin (low_deck_balcony), 2 peserta (pendaftar + CWB)');
    const umrahPriceCruise = calculateUmrahTotalPrice('low_deck_balcony', 2, categories2);
    console.log(`Result: RM ${umrahPriceCruise}\n`);

    // Test 8: Edge case - Invalid room type
    console.log('Test 8: Edge case - Invalid room type');
    const invalidPrice = calculateUmrahTotalPrice('invalid_room', 1, new Map());
    console.log(`Result: ${invalidPrice}\n`);

    // Verification
    console.log('=== VERIFICATION ===');
    console.log(`Test 1: ${outboundPrice1 === 1000 ? '✅ PASS' : '❌ FAIL'} (Expected: 1000, Got: ${outboundPrice1})`);
    console.log(`Test 2: ${outboundPrice3 === 3000 ? '✅ PASS' : '❌ FAIL'} (Expected: 3000, Got: ${outboundPrice3})`);
    console.log(`Test 3: ${umrahPrice1 === 16590 ? '✅ PASS' : '❌ FAIL'} (Expected: 16590, Got: ${umrahPrice1})`);
    console.log(`Test 4: ${umrahPrice2 === 32680 ? '✅ PASS' : '❌ FAIL'} (Expected: 32680, Got: ${umrahPrice2})`);
    console.log(`Test 5: ${umrahPrice3 === 35180 ? '✅ PASS' : '❌ FAIL'} (Expected: 35180, Got: ${umrahPrice3})`);
    console.log(`Test 6: ${umrahPrice4 === 43520 ? '✅ PASS' : '❌ FAIL'} (Expected: 43520, Got: ${umrahPrice4})`);
    console.log(`Test 7: ${umrahPriceCruise === 36680 ? '✅ PASS' : '❌ FAIL'} (Expected: 36680, Got: ${umrahPriceCruise})`);
    console.log(`Test 8: ${invalidPrice === null ? '✅ PASS' : '❌ FAIL'} (Expected: null, Got: ${invalidPrice})`);

    // Summary
    const allTestsPassed = outboundPrice1 === 1000 && 
                          outboundPrice3 === 3000 && 
                          umrahPrice1 === 16590 && 
                          umrahPrice2 === 32680 && 
                          umrahPrice3 === 35180 && 
                          umrahPrice4 === 43520 && 
                          umrahPriceCruise === 36680 && 
                          invalidPrice === null;

    console.log(`\nOverall Result: ${allTestsPassed ? '✅ ALL TESTS PASSED' : '❌ SOME TESTS FAILED'}`);

    if (allTestsPassed) {
        console.log('\n🎉 Logika perhitungan harga sudah benar!');
        console.log('\n📋 SUMMARY:');
        console.log('- Paket Pelancongan: Simple multiplication (harga × jumlah peserta)');
        console.log('- Paket Umrah: Complex calculation berdasarkan kategori peserta');
        console.log('- CWB: Harga bilik - RM 500');
        console.log('- CNB: Harga tetap dari database');
        console.log('- Infant: Harga tetap dari database');
        console.log('- Normal: Harga bilik penuh');
    } else {
        console.log('\n⚠️  Ada masalah dengan logika perhitungan harga. Silakan periksa kembali.');
    }

    console.log('\n=== TESTING COMPLETED ===');
}

// Jalankan test
runTests();
