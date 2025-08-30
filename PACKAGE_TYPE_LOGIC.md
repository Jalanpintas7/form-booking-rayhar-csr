# Logika Paket Booking

## Overview
Sistem booking memiliki 3 jenis paket utama dengan logika yang berbeda untuk setiap jenisnya.

## Jenis Paket

### 1. Paket Pelancongan (Outbound)
- **Kategori**: Paket perjalanan ke destinasi wisata
- **Alur**: Destinasi → Tarikh → Bilangan Peserta
- **Harga**: Semua peserta dikenakan harga yang sama
- **Alasan**: Semua peserta memerlukan tempat duduk transportasi

### 2. Paket Umrah
- **Kategori**: Paket ibadah umrah ke Mekah
- **Alur**: Musim → Kategori → Airline → Tarikh → Bilik → Bilangan Peserta
- **Harga**: **SEMUA PESERTA HARGA SAMA** (disederhanakan)
- **Kategori Peserta**: **TIDAK ADA** (semua peserta sama)

### 3. Paket Cruise
Ada 2 sub-kategori:

#### 3a. PELAYARAN (Cruise Murni)
- **Kategori**: Paket pelayaran kapal pesiar saja
- **Alur**: Musim → Kategori → Tarikh → Bilik → Bilangan Peserta
- **Airline**: **TIDAK DIPERLUKAN** (langsung ke tarikh)
- **Kategori Peserta**: **TIDAK DIPERLUKAN** (semua peserta sama)
- **Harga**: Berdasarkan jenis cabin yang dipilih

#### 3b. UMRAH + PELAYARAN (Kombinasi)
- **Kategori**: Paket umrah + pelayaran kapal pesiar
- **Alur**: Musim → Kategori → **Airline** → Tarikh → Bilik → Bilangan Peserta
- **Airline**: **DIPERLUKAN** (karena ada komponen umrah)
- **Kategori Peserta**: **TIDAK DIPERLUKAN** (semua peserta sama)
- **Harga**: Berdasarkan jenis cabin (semua peserta harga sama)

## Perbedaan Utama

| Aspek | PELAYARAN | UMRAH + PELAYARAN | UMRAH |
|-------|-----------|-------------------|-------|
| **Airline** | ❌ Tidak ada | ✅ Ada | ✅ Ada |
| **Kategori Peserta** | ❌ Tidak ada | ❌ Tidak ada | ❌ Tidak ada |
| **Komponen Umrah** | ❌ Tidak ada | ✅ Ada | ✅ Ada |
| **Komponen Cruise** | ✅ Ada | ✅ Ada | ❌ Tidak ada |
| **Harga Peserta** | Sama semua | Sama semua | Sama semua |

## ⚠️ PERUBAHAN PENTING

**SEMUA paket umrah (termasuk UMRAH biasa) sekarang TIDAK memiliki kategori peserta CWB, CNB, dan Infant.**

**Alasan**: 
- **Pricing yang disederhanakan** untuk semua paket umrah
- **Semua peserta dikenakan harga yang sama** sesuai jenis bilik yang dipilih
- **Tidak ada lagi perbedaan harga** berdasarkan usia atau kebutuhan tempat tidur
- **Lebih sederhana dan konsisten** untuk semua jenis paket

## Implementasi di Frontend

### Visibility Control
```javascript
// Effect untuk mengontrol visibility airline berdasarkan pilihan kategori umrah
$effect(() => {
    if (selectedKategoriUmrah && showUmrahCategorySection) {
        const selectedCategory = umrahCategories.find(cat => String(cat.id) === String(selectedKategoriUmrah));
        const isPureCruisePackage = selectedCategory && selectedCategory.name === 'PELAYARAN';
        const isUmrahPlusCruisePackage = selectedCategory && selectedCategory.name === 'UMRAH + PELAYARAN';
        
        if (isPureCruisePackage) {
            // PELAYARAN murni: skip airline, langsung ke tarikh
            showAirlineSection = false;
            showUmrahDateSection = true;
        } else if (isUmrahPlusCruisePackage) {
            // UMRAH + PELAYARAN: perlu airline karena ada komponen umrah
            showAirlineSection = true;
            showUmrahDateSection = false;
        } else {
            // UMRAH biasa: perlu airline
            showAirlineSection = true;
            showUmrahDateSection = false;
        }
    }
});
```

### Filter Logic
```javascript
// Effect untuk filter umrah dates
$effect(() => {
    const selectedCategory = umrahCategories.find(cat => String(cat.id) === String(selectedKategoriUmrah));
    const isPureCruisePackage = selectedCategory && selectedCategory.name === 'PELAYARAN';
    const isUmrahPlusCruisePackage = selectedCategory && selectedCategory.name === 'UMRAH + PELAYARAN';

    if (isPureCruisePackage) {
        // PELAYARAN murni: filter tanpa airline
        filtered = umrahDates.filter(date => 
            String(date.umrah_season_id) === String(selectedMusimUmrah) && 
            String(date.umrah_category_id) === String(selectedKategoriUmrah)
        );
    } else {
        // UMRAH + PELAYARAN dan UMRAH biasa: filter dengan airline
        filtered = umrahDates.filter(date => 
            String(date.umrah_season_id) === String(selectedMusimUmrah) && 
            String(date.umrah_category_id) === String(selectedKategoriUmrah) && 
            String(date.airline_id) === String(selectedAirline)
        );
    }
});
```

### Kategori Peserta
```javascript
// Kategori peserta TIDAK ADA untuk SEMUA paket umrah
<!-- Kategori peserta (CWB, CNB, Infant) dinonaktifkan untuk semua paket umrah -->
<!-- Semua peserta akan dikenakan harga yang sama -->
```

## Implementasi di Backend

### Perhitungan Harga
```javascript
// For all umrah packages (including regular UMRAH), all participants pay the same price
// No more CWB, CNB, Infant categories - simplified pricing
const totalParticipants = maklumat.bilangan + 1; // applicant + additional participants
const totalPrice = basePrice * totalParticipants;

console.log(`Umrah package price calculation: Base price RM ${basePrice} × ${totalParticipants} participants = RM ${totalPrice}`);
console.log('Note: All participants pay the same price for all umrah packages (simplified pricing)');

maklumat.total_price = totalPrice;
```

## Contoh Alur User

### Paket PELAYARAN
1. User pilih Musim Umrah
2. User pilih Kategori: "PELAYARAN"
3. **Langsung tampil section Tarikh Umrah** (skip airline)
4. User pilih Tarikh Umrah
5. User pilih Jenis Bilik (cabin)
6. User pilih Bilangan Peserta
7. **Tidak ada kategori peserta** (semua sama)

### Paket UMRAH + PELAYARAN
1. User pilih Musim Umrah
2. User pilih Kategori: "UMRAH + PELAYARAN"
3. **Tampil section Airline** (karena ada komponen umrah)
4. User pilih Airline
5. User pilih Tarikh Umrah
6. User pilih Jenis Bilik (cabin)
7. User pilih Bilangan Peserta
8. **Tidak ada kategori peserta** (semua sama)

### Paket UMRAH (Biasa)
1. User pilih Musim Umrah
2. User pilih Kategori: "UMRAH"
3. **Tampil section Airline**
4. User pilih Airline
5. User pilih Tarikh Umrah
6. User pilih Jenis Bilik
7. User pilih Bilangan Peserta
8. **Tidak ada kategori peserta** (semua sama - simplified pricing)

## Catatan Penting

1. **PELAYARAN murni** tidak memerlukan airline karena fokus pada pelayaran saja
2. **UMRAH + PELAYARAN** memerlukan airline karena ada komponen umrah yang memerlukan penerbangan
3. **Kategori peserta TIDAK ADA** untuk **SEMUA** paket umrah (termasuk UMRAH biasa)
4. **Harga cabin** untuk cruise tidak dipengaruhi kategori peserta (semua sama)
5. **Logika perhitungan** sekarang sama untuk semua paket umrah:
   - **Semua paket**: `harga_bilik × jumlah_peserta`
   - **Tidak ada lagi** perbedaan harga berdasarkan CWB, CNB, Infant

## Testing Scenarios

### Test 1: PELAYARAN Murni
- Pilih kategori "PELAYARAN"
- Verifikasi: Airline section tidak muncul
- Verifikasi: Langsung ke tarikh umrah
- Verifikasi: Tidak ada kategori peserta
- Verifikasi: Semua peserta harga sama

### Test 2: UMRAH + PELAYARAN
- Pilih kategori "UMRAH + PELAYARAN"
- Verifikasi: Airline section muncul
- Verifikasi: Harus pilih airline dulu
- Verifikasi: Tidak ada kategori peserta
- Verifikasi: Semua peserta harga sama

### Test 3: UMRAH Biasa
- Pilih kategori "UMRAH"
- Verifikasi: Airline section muncul
- Verifikasi: Harus pilih airline dulu
- Verifikasi: **Tidak ada kategori peserta** (simplified pricing)
- Verifikasi: **Semua peserta harga sama**
