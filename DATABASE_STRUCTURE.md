# Struktur Database untuk Data Peserta

## Overview

Sistem ini menggunakan **tabel terpisah** untuk menyimpan data peserta, bukan array. Ini adalah pendekatan yang direkomendasikan untuk normalisasi database dan fleksibilitas query.

## Struktur Tabel

### 1. Tabel `maklumat_pelanggan` (Sudah Ada)
Tabel utama untuk menyimpan data pelanggan yang melakukan booking.

```sql
-- Struktur yang sudah ada
CREATE TABLE maklumat_pelanggan (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    gelaran VARCHAR(50),
    nama VARCHAR(255),
    nokp VARCHAR(12),
    telefon VARCHAR(20),
    email VARCHAR(255),
    alamat TEXT,
    poskod VARCHAR(10),
    negeri VARCHAR(100),
    bandar VARCHAR(100),
    cawangan UUID REFERENCES branches(id),
    destinasi UUID REFERENCES destinations(id),
    tarikh_berlepas UUID REFERENCES outbound_dates(id),
    musim_umrah_id UUID REFERENCES umrah_seasons(id),
    kategori_umrah_id UUID REFERENCES umrah_categories(id),
    konsultan UUID REFERENCES sales_consultant(id),
    pakej UUID REFERENCES package_types(id),
    bilangan INTEGER,
    catatan TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

### 2. Tabel `peserta` (Baru Dibuat)
Tabel untuk menyimpan data peserta yang mengikuti perjalanan.

```sql
CREATE TABLE peserta (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    maklumat_pelanggan_id UUID NOT NULL REFERENCES maklumat_pelanggan(id) ON DELETE CASCADE,
    nama VARCHAR(255) NOT NULL,
    nokp VARCHAR(12) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

### 3. View `peserta_with_maklumat` (Baru Dibuat)
View untuk memudahkan query data peserta beserta maklumat pelanggan.

```sql
CREATE OR REPLACE VIEW peserta_with_maklumat AS
SELECT 
    p.id as peserta_id,
    p.nama as nama_peserta,
    p.nokp as nokp_peserta,
    p.created_at as peserta_created_at,
    mp.id as maklumat_id,
    mp.gelaran,
    mp.nama as nama_pelanggan,
    mp.nokp as nokp_pelanggan,
    mp.telefon,
    mp.email,
    mp.alamat,
    mp.poskod,
    mp.negeri,
    mp.bandar,
    mp.cawangan,
    mp.destinasi,
    mp.tarikh_berlepas,
    mp.musim_umrah_id,
    mp.kategori_umrah_id,
    mp.pakej,
    mp.bilangan,
    mp.catatan,
    mp.created_at as maklumat_created_at
FROM peserta p
JOIN maklumat_pelanggan mp ON p.maklumat_pelanggan_id = mp.id
ORDER BY mp.created_at DESC, p.created_at ASC;
```

## Keuntungan Struktur Ini

### 1. **Normalisasi Database**
- Mengikuti prinsip normalisasi database
- Menghindari duplikasi data
- Memastikan integritas data

### 2. **Fleksibilitas Query**
- Mudah mencari peserta berdasarkan kriteria tertentu
- Bisa filter berdasarkan nama, No KP, atau data lainnya
- Query yang efisien untuk data besar

### 3. **Skalabilitas**
- Mudah menambah field baru untuk peserta (misal: umur, jenis kelamin, dll)
- Bisa menambah relasi dengan tabel lain (misal: dokumen perjalanan)

### 4. **Integritas Data**
- Foreign key constraints memastikan data konsisten
- Cascade delete memastikan data peserta terhapus jika booking dihapus

### 5. **Performance**
- Index pada foreign key untuk query yang cepat
- View untuk query yang kompleks

## Cara Penggunaan

### 1. Menyimpan Data Peserta
```javascript
// Di +page.server.js
const pesertaData = [];
for (let i = 1; i <= maklumat.bilangan; i++) {
    const namaPeserta = formData.get(`peserta_nama_${i}`);
    const nokpPeserta = formData.get(`peserta_nokp_${i}`);
    
    if (namaPeserta && nokpPeserta) {
        pesertaData.push({
            maklumat_pelanggan_id: maklumatId,
            nama: namaPeserta,
            nokp: nokpPeserta
        });
    }
}

// Insert ke database
const { error } = await supabase
    .from('peserta')
    .insert(pesertaData);
```

### 2. Mengambil Data Peserta
```javascript
// Menggunakan service
import { PesertaService } from '$lib/services/pesertaService.js';

// Ambil semua peserta dengan maklumat
const allPeserta = await PesertaService.getAllPesertaWithMaklumat();

// Ambil peserta berdasarkan booking ID
const peserta = await PesertaService.getPesertaByMaklumatId(bookingId);
```

### 3. Query Langsung
```sql
-- Ambil semua peserta dengan maklumat pelanggan
SELECT * FROM peserta_with_maklumat;

-- Ambil peserta berdasarkan booking ID
SELECT * FROM peserta WHERE maklumat_pelanggan_id = 'uuid-here';

-- Hitung jumlah peserta per booking
SELECT maklumat_pelanggan_id, COUNT(*) as jumlah_peserta 
FROM peserta 
GROUP BY maklumat_pelanggan_id;
```

## Manajemen Data

Sistem ini menyediakan service untuk manajemen data booking dan peserta melalui:
- `PesertaService` untuk operasi CRUD peserta
- Query langsung ke database untuk data booking
- View `booking_with_members` untuk data terintegrasi

## Alternatif yang Tidak Direkomendasikan

### ❌ Array dalam JSON
```sql
-- JANGAN GUNAKAN INI
CREATE TABLE maklumat_pelanggan (
    -- ... field lainnya
    peserta_data JSONB -- Array data peserta
);
```

**Masalah:**
- Sulit untuk query dan filter
- Tidak bisa menggunakan index
- Sulit untuk update data individual
- Tidak ada integritas data

### ❌ String Terpisah
```sql
-- JANGAN GUNAKAN INI
CREATE TABLE maklumat_pelanggan (
    -- ... field lainnya
    peserta_nama TEXT, -- "Nama1,Nama2,Nama3"
    peserta_nokp TEXT  -- "KP1,KP2,KP3"
);
```

**Masalah:**
- Sulit untuk query
- Tidak ada validasi data
- Sulit untuk update data individual
- Tidak fleksibel untuk field tambahan

## Kesimpulan

Struktur tabel terpisah adalah pilihan terbaik untuk sistem booking ini karena:
1. **Mengikuti best practice database**
2. **Mudah untuk maintenance dan scaling**
3. **Performance yang baik**
4. **Fleksibilitas untuk pengembangan masa depan**

Sistem ini siap untuk digunakan dan dapat dikembangkan lebih lanjut sesuai kebutuhan bisnis.
