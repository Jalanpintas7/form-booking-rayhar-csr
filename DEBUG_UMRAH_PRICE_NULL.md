# Debug Total Harga Umrah yang Null

## **Masalah yang Dilaporkan**
User melaporkan bahwa "total price is null" untuk paket umrah setelah implementasi logika perhitungan harga.

## **Analisis Kode yang Sudah Dilakukan**

### 1. **Struktur Fungsi `calculateUmrahTotalPrice()`**
- Fungsi ini **TIDAK PERNAH** mengembalikan `null`
- Fungsi selalu mengembalikan angka (number) atau `0` jika ada masalah
- Jika ada masalah, fungsi akan `return 0`, bukan `null`

### 2. **Kondisi `$effect` untuk Update `totalHargaUmrah`**
```javascript
$effect(() => {
    if (showUmrahDateSection && selectedRoomType && selectedBilangan !== '') {
        const calculatedPrice = calculateUmrahTotalPrice();
        totalHargaUmrah = calculatedPrice;
        // ... debug logging
    } else {
        totalHargaUmrah = 0; // ← Ini yang menyebabkan nilai 0, bukan null
    }
});
```

### 3. **Variabel State yang Terlibat**
- `totalHargaUmrah = $state(0)` - Inisialisasi dengan 0
- `selectedTarikhUmrah = $state('')` - ID tarikh umrah yang dipilih
- `selectedRoomType = $state('')` - Jenis bilik yang dipilih
- `selectedBilangan = $state('')` - Jumlah peserta tambahan
- `pesertaData = $state([])` - Data peserta tambahan
- `filteredUmrahDates = $state([])` - Data tarikh umrah yang sudah difilter

## **Kemungkinan Penyebab Nilai 0 (Bukan Null)**

### **A. Kondisi `$effect` Tidak Terpenuhi**
```javascript
// Semua kondisi harus true:
showUmrahDateSection && selectedRoomType && selectedBilangan !== ''
```

**Kemungkinan masalah:**
- `showUmrahDateSection = false`
- `selectedRoomType = ''` (kosong)
- `selectedBilangan = ''` (kosong)

### **B. Data `filteredUmrahDates` Kosong**
```javascript
// Effect untuk filter umrah dates
$effect(() => {
    if (!selectedMusimUmrah || !selectedKategoriUmrah) {
        filteredUmrahDates = []; // ← Array kosong
        return;
    }
    // ... filtering logic
});
```

**Kemungkinan masalah:**
- `selectedMusimUmrah` kosong
- `selectedKategoriUmrah` kosong
- Filtering gagal karena data tidak cocok

### **C. `selectedUmrahDate` Tidak Ditemukan**
```javascript
const selectedUmrahDate = filteredUmrahDates.find(d => String(d.id) === String(selectedTarikhUmrah));
if (!selectedUmrahDate) return 0; // ← Return 0, bukan null
```

**Kemungkinan masalah:**
- `filteredUmrahDates` kosong
- `selectedTarikhUmrah` tidak ada di dalam `filteredUmrahDates`
- Mismatch tipe data (string vs number)

### **D. `basePrice` <= 0**
```javascript
if (basePrice <= 0) return 0; // ← Return 0, bukan null
```

**Kemungkinan masalah:**
- Data harga bilik kosong atau `null` di database
- `parseFloat()` gagal dan mengembalikan `NaN`
- Field harga bilik tidak ada di record

## **Langkah Debug yang Sudah Ditambahkan**

### 1. **Enhanced Logging di `$effect`**
```javascript
$effect(() => {
    console.log('=== UMRah PRICE EFFECT TRIGGERED ===');
    console.log('showUmrahDateSection:', showUmrahDateSection);
    console.log('selectedRoomType:', selectedRoomType);
    console.log('selectedBilangan:', selectedBilangan);
    console.log('Condition met:', showUmrahDateSection && selectedRoomType && selectedBilangan !== '');
    
    if (showUmrahDateSection && selectedRoomType && selectedBilangan !== '') {
        console.log('✅ Condition met, calculating price...');
        const calculatedPrice = calculateUmrahTotalPrice();
        console.log('calculatedPrice from function:', calculatedPrice);
        console.log('calculatedPrice type:', typeof calculatedPrice);
        // ... more logging
    } else {
        console.log('❌ Condition not met, setting totalHargaUmrah to 0');
        totalHargaUmrah = 0;
    }
});
```

### 2. **Enhanced Logging di `calculateUmrahTotalPrice()`**
```javascript
function calculateUmrahTotalPrice() {
    console.log('🔍 calculateUmrahTotalPrice() called');
    console.log('Input values:');
    console.log('- selectedTarikhUmrah:', selectedTarikhUmrah);
    console.log('- selectedRoomType:', selectedRoomType);
    console.log('- filteredUmrahDates:', filteredUmrahDates);
    
    // ... more detailed logging throughout the function
}
```

### 3. **Logging untuk Data Bilik**
```javascript
console.log('selectedUmrahDate data:', {
    double: selectedUmrahDate.double,
    triple: selectedUmrahDate.triple,
    quadruple: selectedUmrahDate.quadruple,
    quintuple: selectedUmrahDate.quintuple,
    single: selectedUmrahDate.single
});
```

### 4. **Logging untuk Perhitungan Harga**
```javascript
console.log('basePrice:', basePrice);
console.log('roomTypeLabel:', roomTypeLabel);
console.log('totalPrice awal (peserta 1):', totalPrice);
// ... logging untuk setiap peserta
```

## **Langkah Selanjutnya untuk Debug**

### 1. **Buka Browser Console**
- Jalankan aplikasi dengan `npm run dev`
- Buka browser dan navigasi ke form umrah
- Pilih paket umrah dan isi form step by step
- Perhatikan semua log di console

### 2. **Periksa Urutan Log**
1. **Package Selection**: Pastikan `showUmrahDateSection = true`
2. **Musim & Kategori**: Pastikan `filteredUmrahDates` terisi
3. **Airline Selection**: Pastikan `selectedAirline` terisi (jika diperlukan)
4. **Tarikh Umrah**: Pastikan `selectedTarikhUmrah` terisi
5. **Room Type**: Pastikan `selectedRoomType` terisi
6. **Bilangan**: Pastikan `selectedBilangan` terisi
7. **Price Calculation**: Periksa semua log perhitungan

### 3. **Periksa Data Database**
- Pastikan data `umrahDates` ada dan lengkap
- Pastikan field harga bilik (`double`, `triple`, dll) terisi
- Pastikan field `cnb` dan `infant` terisi (jika diperlukan)

### 4. **Periksa Tipe Data**
- Pastikan `selectedTarikhUmrah` adalah string
- Pastikan `selectedRoomType` adalah string yang valid
- Pastikan `selectedBilangan` adalah string yang valid

## **Kesimpulan**

**`totalHargaUmrah` TIDAK AKAN PERNAH `null`** karena:
1. Fungsi `calculateUmrahTotalPrice()` selalu mengembalikan number
2. `$effect` selalu mengassign nilai number ke `totalHargaUmrah`
3. Jika ada masalah, nilai akan menjadi `0`, bukan `null`

**Masalah sebenarnya kemungkinan:**
- Nilai `0` (bukan `null`)
- Kondisi `$effect` tidak terpenuhi
- Data database kosong atau tidak lengkap
- Filtering data gagal

Dengan logging yang sudah ditambahkan, kita akan bisa melihat di console browser apa yang sebenarnya terjadi dan mengapa nilai menjadi `0`.
