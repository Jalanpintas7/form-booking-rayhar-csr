# Web Form Booking Rayhar

Aplikasi web form booking untuk Rayhar Travel menggunakan SvelteKit dan Supabase.

## Fitur Utama

### 1. Form Booking Lengkap
- Form pendaftaran dengan validasi lengkap
- Pilihan jenis pakej (Pelancongan/Umrah)
- Pemilihan destinasi, tarikh, dan detail perjalanan
- Sistem peserta dengan kategori (CWB, Infant, CNB)
- Integrasi dengan database Supabase

### 2. Validasi Form yang Canggih
- **Validasi Client-Side**: Mencegah pengiriman form dengan field kosong
- **Validasi Real-time**: Pengecekan poskod dengan API
- **Pesan Error Informatif**: Menampilkan daftar lengkap field yang perlu dilengkapi
- **Validasi UUID**: Mencegah error "invalid input syntax for type uuid"

### 3. Sistem Validasi yang Komprehensif
- Validasi field wajib (gelaran, nama, nokp, telefon, email, alamat)
- Validasi poskod (5 digit, lookup otomatis negeri/bandar)
- Validasi pilihan pakej dan detail terkait
- Validasi data peserta tambahan
- Validasi berdasarkan jenis pakej yang dipilih

### 4. User Experience yang Baik
- Pesan error yang jelas dan informatif
- Scroll otomatis ke atas saat ada error
- Highlight field yang bermasalah
- Mencegah pengiriman form yang tidak lengkap

## Teknologi yang Digunakan

- **Frontend**: SvelteKit 2.0
- **Backend**: Supabase (PostgreSQL)
- **Styling**: Tailwind CSS
- **Form Handling**: SvelteKit Form Actions
- **Validation**: Custom validation logic

## Struktur Validasi

### Validasi Field Wajib
```javascript
// Field dasar yang selalu wajib
- Gelaran
- Nama lengkap
- No K/P (12 digit)
- Telefon
- Email
- Alamat
- Poskod (5 digit)
- Negeri & Bandar
- Cawangan
- Jenis Pakej
```

### Validasi Berdasarkan Jenis Pakej
```javascript
// Pakej Pelancongan
- Destinasi (wajib)
- Tarikh pelancongan (wajib)

// Pakej Umrah
- Musim Umrah (wajib)
- Kategori Umrah (wajib)
- Penerbangan (wajib)
- Tarikh Umrah (wajib)
- Jenis Bilik (wajib)
```

### Validasi Peserta
```javascript
// Bilangan peserta tambahan (wajib)
// Nama peserta tambahan (wajib)
// Kategori peserta (opsional)
```

## Cara Kerja Validasi

1. **Pre-submission Validation**: Form divalidasi sebelum dikirim ke server
2. **Field Highlighting**: Field yang error akan di-highlight dengan border merah
3. **Error Message**: Daftar lengkap error ditampilkan di atas form
4. **Auto-scroll**: Form otomatis scroll ke atas untuk menampilkan error
5. **Form Prevention**: Form tidak akan dikirim jika ada validasi yang gagal

## Keuntungan Validasi Client-Side

- **Menghemat Bandwidth**: Tidak ada request ke server yang sia-sia
- **User Experience**: Feedback instan kepada user
- **Mengurangi Server Load**: Validasi dilakukan di client
- **Error Prevention**: Mencegah error database seperti UUID invalid

## Error Handling

### Error yang Dihandle
- Field kosong
- Format tidak valid (email, poskod, nokp)
- Pilihan yang belum dibuat
- Data yang tidak lengkap

### Pesan Error yang Informatif
- Bahasa Indonesia yang jelas
- Daftar lengkap field yang bermasalah
- Instruksi yang spesifik untuk setiap error

## Instalasi dan Penggunaan

1. Clone repository
2. Install dependencies: `npm install`
3. Setup environment variables untuk Supabase
4. Jalankan development server: `npm run dev`

## Kontribusi

Silakan buat issue atau pull request untuk perbaikan dan fitur baru.

## Lisensi

Proyek ini dikembangkan untuk Rayhar Travel.
