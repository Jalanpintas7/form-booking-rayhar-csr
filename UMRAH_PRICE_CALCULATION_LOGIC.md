# Logika Penghitungan Harga Pakej Umrah

## Overview
Dokumen ini menjelaskan logika penghitungan harga untuk pakej umrah berdasarkan jenis bilik dan kategori peserta.

## Jenis Bilik yang Tersedia
- **Single**: Bilik untuk 1 orang
- **Double/Twin**: Bilik untuk 2 orang
- **Triple**: Bilik untuk 3 orang
- **Quad**: Bilik untuk 4 orang
- **Quintuple**: Bilik untuk 5 orang

## Kategori Peserta

### 1. CWB (Child With Bed)
- **Harga Standard**: RM 500 kurang dari harga bilik yang dipilih
- **Harga Promosi 4990**: RM 300 kurang dari harga bilik yang dipilih (untuk paket Umrah Musim Biasa - Promosi 4990)
- **Harga Hijazi Kembara 5 Kota**: RM 1000 kurang dari harga bilik yang dipilih (untuk paket Umrah Hijazi Kembara 5 Kota)

- **Contoh Standard**:
  - Jika pilih bilik Double RM 2000 → CWB = RM 1500
  - Jika pilih bilik Triple RM 1500 → CWB = RM 1000
  - Jika pilih bilik Quad RM 1200 → CWB = RM 700
  - Jika pilih bilik Quintuple RM 1000 → CWB = RM 500

- **Contoh Promosi 4990**:
  - Jika pilih bilik Double RM 2000 → CWB = RM 1700
  - Jika pilih bilik Triple RM 1500 → CWB = RM 1200
  - Jika pilih bilik Quad RM 1200 → CWB = RM 900
  - Jika pilih bilik Quintuple RM 1000 → CWB = RM 700

- **Contoh Hijazi Kembara 5 Kota**:
  - Jika pilih bilik Double RM 2000 → CWB = RM 1000
  - Jika pilih bilik Triple RM 1500 → CWB = RM 500
  - Jika pilih bilik Quad RM 1200 → CWB = RM 200
  - Jika pilih bilik Quintuple RM 1000 → CWB = RM 0

### 2. CNB (Child No Bed)
- **Harga**: Menggunakan harga spesifik dari database Supabase
- **Fallback**: Jika harga CNB tidak tersedia, gunakan harga dewasa penuh

### 3. Infant
- **Harga**: Menggunakan harga spesifik dari database Supabase
- **Fallback**: Jika harga Infant tidak tersedia, gunakan harga dewasa penuh

### 4. Dewasa (Tidak ada kategori khusus)
- **Harga**: 100% dari harga bilik yang dipilih

## Logika Penghitungan

### Peserta 1 (Pendaftar Utama)
- Selalu dikenakan harga penuh sesuai jenis bilik yang dipilih
- Tidak ada diskon atau pengurangan

### Peserta Tambahan (Peserta 2, 3, dst)
- Harga dihitung berdasarkan kategori yang dipilih
- Setiap peserta tambahan akan menambah total harga

## Formula Penghitungan

```
Total Harga = Harga Bilik (Peserta 1) + Σ Harga Peserta Tambahan

Dimana:
- Harga Peserta Tambahan = f(kategori, harga_bilik)
```

### Detail Formula per Kategori

#### CWB (Child With Bed)
```
// Standard package
Harga CWB = MAX(harga_bilik - 500, 0)

// Promosi 4990 package: Umrah Musim Biasa - Promosi 4990
Harga CWB = MAX(harga_bilik - 300, 0)

// Special package: Umrah Hijazi Kembara 5 Kota
Harga CWB = MAX(harga_bilik - 1000, 0)
```

#### CNB (Child No Bed)
```
Harga CNB = harga_cnb_database || harga_bilik
```

#### Infant
```
Harga Infant = harga_infant_database || harga_bilik
```

#### Dewasa
```
Harga Dewasa = harga_bilik
```

## Logika Identifikasi Paket Khusus

### Paket Khusus dengan Diskon CWB Berbeda

#### 1. Paket Umrah Hijazi Kembara 5 Kota
Sistem akan mengidentifikasi paket khusus ini berdasarkan:
- **Season ID**: `065a1f1f-9fe2-4643-b613-8bf355d2c487`
- **Kategori**: Semua kategori (tidak ada filter kategori khusus)

#### 2. Paket Umrah Musim Biasa - Promosi 4990
Sistem akan mengidentifikasi paket khusus ini berdasarkan:
- **Season ID**: `593e7550-adc8-440f-af46-2b35cf35391e`
- **Category ID**: `fe935569-7a63-48e1-881d-a8f123017632`

```javascript
const isHijaziKembara5Kota = umrahDateData.umrah_seasons?.id === '065a1f1f-9fe2-4643-b613-8bf355d2c487';

const isPromosi4990 = umrahDateData.umrah_seasons?.id === '593e7550-adc8-440f-af46-2b35cf35391e' && 
                      umrahDateData.umrah_categories?.id === 'fe935569-7a63-48e1-881d-a8f123017632';
```

### Dampak pada Perhitungan CWB
- **Paket Standard**: CWB = harga bilik - RM 500
- **Paket Promosi 4990**: CWB = harga bilik - RM 300
- **Paket Hijazi Kembara 5 Kota**: CWB = harga bilik - RM 1000

### Logika Prioritas Identifikasi
1. **Prioritas 1**: Jika Season ID = `065a1f1f-9fe2-4643-b613-8bf355d2c487` → Diskon CWB = RM 1000 (semua kategori)
2. **Prioritas 2**: Jika Season ID = `593e7550-adc8-440f-af46-2b35cf35391e` DAN Category ID = `fe935569-7a63-48e1-881d-a8f123017632` → Diskon CWB = RM 300
3. **Default**: Semua paket lainnya → Diskon CWB = RM 500

## Implementasi dalam Kode

### Fungsi Utama
```javascript
function calculateUmrahTotalPrice() {
    // 1. Ambil data umrah termasuk musim dan kategori
    // 2. Identifikasi paket khusus (Hijazi Kembara 5 Kota)
    // 3. Tentukan diskon CWB berdasarkan paket
    // 4. Validasi input
    // 5. Dapatkan harga dasar berdasarkan jenis bilik
    // 6. Hitung total untuk peserta 1
    // 7. Loop peserta tambahan dan hitung berdasarkan kategori
    // 8. Return total harga
}
```

### Effect untuk Auto-calculation
```javascript
$effect(() => {
    if (showUmrahDateSection && selectedRoomType && selectedBilangan !== '') {
        const calculatedPrice = calculateUmrahTotalPrice();
        totalHargaUmrah = calculatedPrice;
    } else {
        totalHargaUmrah = 0;
    }
});
```

## Contoh Perhitungan

### Skenario 1: 2 Peserta, Bilik Double RM 2000
- **Peserta 1**: RM 2000 (Dewasa)
- **Peserta 2**: RM 1500 (CWB = RM 2000 - RM 500)
- **Total**: RM 3500

### Skenario 2: 3 Peserta, Bilik Triple RM 1500
- **Peserta 1**: RM 1500 (Dewasa)
- **Peserta 2**: RM 1000 (CWB = RM 1500 - RM 500)
- **Peserta 3**: RM 800 (CNB dari database)
- **Total**: RM 3300

### Skenario 3: 2 Peserta, Bilik Quad RM 1200
- **Peserta 1**: RM 1200 (Dewasa)
- **Peserta 2**: RM 700 (CWB = RM 1200 - RM 500)
- **Total**: RM 1900

### Skenario 4: 2 Peserta, Bilik Double RM 2000 (Paket Hijazi Kembara 5 Kota)
- **Peserta 1**: RM 2000 (Dewasa)
- **Peserta 2**: RM 1000 (CWB = RM 2000 - RM 1000)
- **Total**: RM 3000

### Skenario 5: 3 Peserta, Bilik Triple RM 1500 (Paket Hijazi Kembara 5 Kota)
- **Peserta 1**: RM 1500 (Dewasa)
- **Peserta 2**: RM 500 (CWB = RM 1500 - RM 1000)
- **Peserta 3**: RM 800 (CNB dari database)
- **Total**: RM 2800

### Skenario 6: 2 Peserta, Bilik Double RM 2000 (Paket Promosi 4990)
- **Peserta 1**: RM 2000 (Dewasa)
- **Peserta 2**: RM 1700 (CWB = RM 2000 - RM 300)
- **Total**: RM 3700

### Skenario 7: 3 Peserta, Bilik Quad RM 1200 (Paket Promosi 4990)
- **Peserta 1**: RM 1200 (Dewasa)
- **Peserta 2**: RM 900 (CWB = RM 1200 - RM 300)
- **Peserta 3**: RM 800 (CNB dari database)
- **Total**: RM 2900

## Validasi dan Error Handling

### Validasi Input
- Pastikan `selectedTarikhUmrah` dan `selectedRoomType` sudah dipilih
- Pastikan `selectedBilangan` sudah diisi
- Pastikan data peserta valid

### Error Handling
- Jika harga bilik tidak tersedia, return 0
- Jika harga CWB menjadi negatif, gunakan 0
- Fallback ke harga dewasa jika harga spesifik tidak tersedia

## Database Schema

### Tabel umrah_dates
```sql
CREATE TABLE umrah_dates (
    id SERIAL PRIMARY KEY,
    single DECIMAL(10,2),
    double DECIMAL(10,2),
    triple DECIMAL(10,2),
    quadruple DECIMAL(10,2),
    quintuple DECIMAL(10,2),
    cnb DECIMAL(10,2),
    infant DECIMAL(10,2),
    -- ... field lainnya
);
```

## UI Components

### Tampilan Total Harga
- Box hijau dengan border hijau untuk total harga umrah
- Menampilkan jumlah peserta dan total harga
- Format harga menggunakan fungsi `formatPrice()`

### Hidden Inputs
```html
<input type="hidden" name="total_harga_umrah" value={totalHargaUmrah} />
<input type="hidden" name="jumlah_peserta_umrah" value={selectedBilangan ? parseInt(selectedBilangan) + 1 : 1} />
```

## Debug dan Logging

### Console Logs
```javascript
console.log('=== UMRAH PRICE CALCULATION ===');
console.log('selectedTarikhUmrah:', selectedTarikhUmrah);
console.log('selectedRoomType:', selectedRoomType);
console.log('selectedBilangan:', selectedBilangan);
console.log('pesertaData:', pesertaData);
console.log('calculatedPrice:', calculatedPrice);
console.log('totalHargaUmrah:', totalHargaUmrah);
```

## Testing

### Test Cases yang Perlu Diuji
1. **Single Participant**: Hanya 1 peserta (pendaftar utama)
2. **Multiple Participants**: 2+ peserta dengan berbagai kombinasi kategori
3. **Edge Cases**: Harga bilik yang sangat rendah (kurang dari RM 500)
4. **Database Fallbacks**: Ketika harga spesifik tidak tersedia
5. **Validation**: Input yang tidak valid atau kosong

### Expected Results
- Total harga selalu positif
- CWB selalu RM 500 kurang dari harga bilik (minimum 0)
- CNB dan Infant menggunakan harga database atau fallback ke harga dewasa
- Dewasa selalu 100% dari harga bilik

## Maintenance dan Updates

### Perubahan yang Mungkin Diperlukan
1. **Penyesuaian Diskon CWB**: Ubah nilai RM 500 menjadi variabel konfigurasi
2. **Penambahan Kategori**: Tambah kategori peserta baru jika diperlukan
3. **Perubahan Formula**: Modifikasi logika perhitungan sesuai kebijakan baru
4. **Database Schema**: Update struktur database jika ada field baru

### Monitoring
- Log semua perhitungan harga untuk audit trail
- Monitor error rate dan fallback usage
- Track perubahan harga dan diskon
