# Logika Paket Cruise (Pelayaran & Umrah + Pelayaran)

## Overview
Sistem sekarang mendukung 3 kategori paket umrah:
1. **UMRAH** - Paket umrah biasa dengan bilik standar (double, triple, quad, dll)
2. **PELAYARAN** - Paket cruise murni dengan pilihan deck
3. **UMRAH + PELAYARAN** - Paket kombinasi umrah dan cruise

## Logika Harga untuk Kategori Cruise

### 1. Pelayaran (Cruise Murni)
- **Tidak memerlukan airline** - langsung ke section tarikh umrah
- **Harga berdasarkan deck yang dipilih**, bukan bilik biasa
- **Opsi deck yang tersedia:**
  - LOW DECK + INTERIOR
  - LOW DECK + SEAVIEW  
  - LOW DECK + BALCONY
  - HIGH DECK + INTERIOR
  - HIGH DECK + SEAVIEW
  - HIGH DECK + BALCONY

### 2. Umrah + Pelayaran
- **Memerlukan airline** - harus memilih penerbangan dulu
- **Harga berdasarkan deck yang dipilih**, bukan bilik biasa
- **Opsi deck sama seperti Pelayaran**

### 3. Umrah (Biasa)
- **Memerlukan airline** - harus memilih penerbangan dulu
- **Harga berdasarkan bilik standar:**
  - Bilik Double/Twin
  - Bilik Triple
  - Bilik Quad
  - Bilik Quintuple
  - Bilik Single

## Implementasi Teknis

### Fungsi Perhitungan Harga
```javascript
function calculateUmrahTotalPrice() {
    // Mendeteksi tipe kamar deck
    switch (selectedRoomType) {
        case 'low_deck_interior':
            basePrice = parseFloat(selectedUmrahDate.low_deck_interior) || 0;
            roomTypeLabel = 'LOW DECK + INTERIOR';
            break;
        case 'low_deck_seaview':
            basePrice = parseFloat(selectedUmrahDate.low_deck_seaview) || 0;
            roomTypeLabel = 'LOW DECK + SEAVIEW';
            break;
        // ... dan seterusnya untuk semua tipe deck
    }
}
```

### Filter Data
- **Pelayaran murni**: Filter berdasarkan musim dan kategori saja
- **Umrah + Pelayaran**: Filter berdasarkan musim, kategori, dan airline
- **Umrah biasa**: Filter berdasarkan musim, kategori, dan airline

### Tampilan UI
- **Opsi deck** hanya muncul untuk kategori Pelayaran dan Umrah + Pelayaran
- **Breakdown harga detail** untuk kategori cruise menampilkan:
  - Kategori paket
  - Deck & tipe kamar
  - Harga per orang
  - Breakdown per peserta

## Flow User Experience

### Untuk Paket Pelayaran:
1. Pilih Musim Umrah
2. Pilih Kategori: "Pelayaran"
3. Pilih Deck & Tipe Kamar
4. Pilih Tarikh Umrah
5. Input data peserta
6. Lihat total harga

### Untuk Paket Umrah + Pelayaran:
1. Pilih Musim Umrah
2. Pilih Kategori: "Umrah + Pelayaran"
3. Pilih Airline
4. Pilih Deck & Tipe Kamar
5. Pilih Tarikh Umrah
6. Input data peserta
7. Lihat total harga

### Untuk Paket Umrah Biasa:
1. Pilih Musim Umrah
2. Pilih Kategori: "UMRAH"
3. Pilih Airline
4. Pilih Tipe Bilik
5. Pilih Tarikh Umrah
6. Input data peserta
7. Lihat total harga

## Keuntungan Implementasi Ini

1. **Fleksibilitas**: User bisa memilih paket sesuai kebutuhan
2. **Transparansi Harga**: Harga deck ditampilkan dengan jelas
3. **Konsistensi**: Logika yang sama untuk semua kategori
4. **User Experience**: Flow yang intuitif dan mudah dipahami
5. **Maintainability**: Kode yang terstruktur dan mudah diupdate

## Catatan Penting

- Harga deck diambil dari field database yang sesuai (low_deck_interior, high_deck_balcony, dll)
- Jika harga deck tidak tersedia, opsi akan di-disable
- Perhitungan harga untuk peserta tambahan tetap mengikuti logika yang ada (CWB, CNB, Infant)
- Breakdown harga detail hanya ditampilkan untuk kategori cruise
