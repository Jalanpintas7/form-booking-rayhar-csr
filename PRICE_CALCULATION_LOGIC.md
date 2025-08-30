# Logika Perhitungan Total Price

## Overview
Dokumen ini menjelaskan logika perhitungan total price untuk sistem booking Rayhar yang mendukung dua jenis paket utama: **Pelancongan** dan **Umrah**.

## 1. Paket Pelancongan (Outbound)

### Prinsip Dasar
- **Semua peserta dikenakan harga yang sama**
- Tidak ada diskriminasi berdasarkan usia atau kategori
- Total price = Harga per orang × Jumlah total peserta

### Formula
```
Total Price = Base Price × Total Participants
```

### Contoh
- Harga paket: RM 1,000
- Jumlah peserta: 3 (1 pendaftar + 2 tambahan)
- Total: RM 1,000 × 3 = **RM 3,000**

### Implementasi
```javascript
async function calculateOutboundTotalPrice(outboundDateId, numberOfParticipants) {
    // Ambil harga dari tabel outbound_dates
    // Return: basePrice × numberOfParticipants
}
```

---

## 2. Paket Umrah

### Prinsip Dasar
- **Pendaftar membayar harga bilik penuh**
- **Peserta tambahan** dikenakan harga berbeda berdasarkan kategori:
  - **CWB** (Child Without Bed): Harga tetap dari database
- **CNB** (Child No Bed): Harga tetap dari database
- **Infant**: Harga tetap dari database
- **Normal**: Harga bilik penuh (jika tidak ada kategori)

### Jenis Bilik yang Didukung
1. **Bilik Biasa:**
   - Single, Double, Triple, Quad, Quintuple

2. **Kabin Kapal:**
   - Low Deck: Interior, Seaview, Balcony
   - High Deck: Interior, Seaview, Balcony

### Formula
```
Total Price = Harga Bilik Pendaftar + Σ(Harga Peserta Tambahan berdasarkan Kategori)
```

### Detail Perhitungan

#### Pendaftar (Peserta #1)
- Membayar: **Harga bilik penuh** sesuai jenis yang dipilih

#### Peserta Tambahan (Peserta #2, #3, dst)

**CWB (Child Without Bed):**
```
Harga = Harga CWB dari Database
```
- Contoh: RM 16,090 (harga tetap dari database)

**CNB (Child No Bed):**
```
Harga = Harga CNB dari Database
```
- Contoh: RM 250 (harga tetap)

**Infant:**
```
Harga = Harga Infant dari Database
```
- Contoh: RM 2,500 (harga tetap)

**Normal (tidak ada kategori):**
```
Harga = Harga Bilik Penuh
```
- Contoh: RM 16,590

### Contoh Perhitungan Lengkap

**Skenario:** Paket Umrah dengan 3 peserta
- Jenis bilik: Double (RM 16,590)
- Pendaftar: Normal
- Peserta #2: CWB
- Peserta #3: Infant

**Perhitungan:**
1. Pendaftar: RM 16,590
2. Peserta #2 (CWB): RM 16,090 (harga CWB dari database)
3. Peserta #3 (Infant): RM 2,500

**Total:** RM 16,590 + RM 16,090 + RM 2,500 = **RM 35,180**

### Implementasi
```javascript
async function calculateUmrahTotalPrice(umrahDateId, roomType, numberOfParticipants, participantCategories) {
    // 1. Ambil harga bilik dari database
    // 2. Pendaftar = harga bilik penuh
    // 3. Peserta tambahan = berdasarkan kategori
    // 4. Return total
}
```

---

## 3. Struktur Database

### Tabel `outbound_dates`
```sql
- id: UUID
- price: TEXT (harga per orang)
- start_date: DATE
- end_date: DATE
```

### Tabel `umrah_dates`
```sql
- id: UUID
- double: DOUBLE PRECISION (harga bilik double)
- triple: DOUBLE PRECISION (harga bilik triple)
- quadruple: DOUBLE PRECISION (harga bilik quad)
- quintuple: DOUBLE PRECISION (harga bilik quintuple)
- low_deck_interior: DOUBLE PRECISION
- low_deck_seaview: DOUBLE PRECISION
- low_deck_balcony: DOUBLE PRECISION
- high_deck_interior: DOUBLE PRECISION
- high_deck_seaview: DOUBLE PRECISION
- high_deck_balcony: DOUBLE PRECISION
- cwb: DOUBLE PRECISION (harga CWB)
- cnb: DOUBLE PRECISION (harga CNB)
- infant: DOUBLE PRECISION (harga infant)
```

### Tabel `members_booking`
```sql
- id: UUID
- booking_id: UUID (foreign key ke bookings)
- nama: VARCHAR
- nokp: VARCHAR
- cwb: BOOLEAN (apakah peserta CWB)
- infant: BOOLEAN (apakah peserta infant)
- cnb: BOOLEAN (apakah peserta CNB)
```

---

## 4. Flow Perhitungan

### Step 1: Identifikasi Jenis Paket
```javascript
if (outbound_date_id) {
    // Paket Pelancongan
    totalPrice = await calculateOutboundTotalPrice(outbound_date_id, totalParticipants);
} else if (umrah_date_id) {
    // Paket Umrah
    totalPrice = await calculateUmrahTotalPrice(umrah_date_id, roomType, totalParticipants, categories);
}
```

### Step 2: Kumpulkan Kategori Peserta
```javascript
function collectParticipantCategories(formData, numberOfParticipants) {
    // Ambil data dari form: peserta_kategori_2, peserta_kategori_3, dst
    // Return Map dengan kategori setiap peserta
}
```

### Step 3: Hitung Total
```javascript
// Untuk Pelancongan: simple multiplication
// Untuk Umrah: complex calculation berdasarkan kategori
```

---

## 5. Log dan Debug

### Console Output
```
=== PRICE CALCULATION DEBUG ===
Pelancongan price calculation: RM 1000 × 3 participants = RM 3000

=== UMRAN PRICE CALCULATION ===
Pendaftar (bilik double): RM 16590
Peserta 2 (CWB): RM 16590 - RM 500 = RM 16090
Peserta 3 (Infant): RM 2500
Umrah total price calculation: RM 35180
================================
```

---

## 6. Error Handling

### Validasi Input
- Pastikan `outbound_date_id` atau `umrah_date_id` ada
- Pastikan `pilih_bilik` diisi untuk paket Umrah
- Validasi format harga dari database

### Fallback
- Jika harga tidak ditemukan: `total_price = null`
- Jika error dalam perhitungan: `total_price = null`
- Log error untuk debugging

---

## 7. Testing

### Test Cases yang Harus Dicover
1. **Pelancongan:**
   - 1 peserta
   - 2+ peserta
   - Harga valid/invalid

2. **Umrah:**
   - Semua jenis bilik
   - Kombinasi kategori peserta
   - Edge cases (harga 0, null, dll)

### Cara Test
```bash
# Test dengan data real dari database
node test_price_calculation.js
```

---

## 8. Maintenance

### Update Harga
- Harga diupdate melalui tabel `outbound_dates` dan `umrah_dates`
- Tidak perlu update kode untuk perubahan harga

### Tambah Jenis Bilik Baru
- Tambah kolom baru di tabel `umrah_dates`
- Update switch case di `calculateUmrahTotalPrice()`

### Tambah Kategori Peserta Baru
- Tambah kolom baru di tabel `umrah_dates`
- Update logic di `calculateUmrahTotalPrice()`
