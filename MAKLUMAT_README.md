# Halaman Utama - Web Form Booking Rayhar

## Deskripsi
Halaman utama sekarang menampilkan form lengkap dengan 12 field yang diperlukan sesuai dengan kebutuhan yang ditampilkan dalam gambar. Halaman ini menggantikan halaman maklumat sebelumnya.

## Fitur
- Form dengan 12 field yang diperlukan
- Validasi input untuk field tertentu (No K/P, Telefon)
- Dropdown yang saling terkait (Negeri → Bandar)
- Integrasi dengan database Supabase
- Handling form submission dengan feedback sukses/error
- Responsive design

## Field yang Tersedia

### 1. Gelaran* (Title)
- Dropdown dengan pilihan: Cik, Encik, Puan, Tuan, Datin, Dato

### 2. Nama* (Name)
- Input text untuk nama lengkap

### 3. No K/P* (ID Number)
- Input text dengan validasi hanya angka
- Maksimal 12 karakter
- Placeholder: "Contoh: 970109015442"

### 4. Telefon* (Phone)
- Input tel dengan validasi hanya angka
- Placeholder: "Contoh: 0177285445"

### 5. Email*
- Input email dengan validasi format email
- Placeholder: "Contoh: aziah@gmail.com"

### 6. ALAMAT* (Address)
- Input text untuk alamat rumah
- Placeholder: "Nombor Rumah"

### 7. Poskod* (Postcode)
- Input text untuk kode pos
- Maksimal 5 karakter

### 8. Negeri* (State)
- Dropdown dengan 16 negeri Malaysia
- Termasuk Wilayah Persekutuan

### 9. Bandar* (City)
- Dropdown yang terkait dengan pilihan negeri
- Otomatis disabled sampai negeri dipilih

### 10. Cawangan* (Branch)
- Dropdown yang mengambil data dari database
- Data diambil dari tabel `branches`

### 11. Pakej* (Package)
- Dropdown yang mengambil data dari database
- Data diambil dari tabel `package_types`

### 12. Bilangan Peserta Yang Akan Mengikuti*
- Dropdown dengan pilihan 0-20 peserta

## Struktur File
```
src/routes/
├── +page.svelte          # Halaman utama dengan form lengkap
├── +page.server.js       # Server-side logic dan form handling
└── +layout.svelte        # Layout utama dengan navbar dan footer
```

## Database
Halaman ini memerlukan tabel berikut:
- `branches` - untuk data cawangan
- `package_types` - untuk data pakej
- `maklumat_pelanggan` - untuk menyimpan data form

## Cara Akses
- URL: `/` (halaman utama)
- Form langsung tersedia di halaman utama

## Styling
- Menggunakan style yang sama dengan design system sebelumnya
- Warna dan font konsisten dengan design system
- Responsive grid layout
- Form validation styling

## Validasi
- Semua field wajib diisi
- No K/P dan Telefon hanya menerima angka
- Email harus dalam format yang valid
- Bandar hanya bisa dipilih setelah negeri dipilih

## Feedback
- Pesan sukses hijau setelah form berhasil disubmit
- Pesan error merah jika ada masalah
- Form otomatis reset setelah sukses

## Perubahan dari Versi Sebelumnya
- Halaman maklumat sekarang menjadi halaman utama
- Form lengkap langsung tersedia di URL `/`
- Tidak ada lagi halaman terpisah untuk maklumat
- Semua fitur tetap sama dan berfungsi normal
