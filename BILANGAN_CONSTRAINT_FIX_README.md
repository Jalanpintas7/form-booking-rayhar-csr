# Fix Bilangan Constraint - Allow Single Participant (0)

## Masalah yang Ditemukan

Sistem mengalami error saat user memilih bilangan peserta = 0:

```
Error message: new row for relation "bookings" violates check constraint "check_bilangan_positive"
Error code: 23514
```

## Penyebab Masalah

Database memiliki constraint `check_bilangan_positive` yang memaksa field `bilangan` harus lebih dari 0. Ini bertentangan dengan logika bisnis yang seharusnya mengizinkan:

- **Bilangan = 0**: Hanya pendaftar saja yang akan pergi (1 orang total)
- **Bilangan = 1**: Pendaftar + 1 peserta tambahan (2 orang total)
- **Bilangan = 2**: Pendaftar + 2 peserta tambahan (3 orang total)
- Dan seterusnya...

## Solusi

### 1. **Migration SQL** (`fix_bilangan_constraint_migration.sql`)

File ini berisi langkah-langkah untuk:
- Menghapus constraint lama `check_bilangan_positive`
- Membuat constraint baru `check_bilangan_non_negative` yang mengizinkan `bilangan >= 0`
- Menambahkan dokumentasi constraint

### 2. **Cara Menjalankan Migration**

```bash
# Masuk ke database Supabase
psql -h [host] -U [username] -d [database] -f fix_bilangan_constraint_migration.sql

# Atau jalankan via Supabase Dashboard SQL Editor
```

### 3. **Verifikasi Perubahan**

Setelah migration berhasil, constraint baru akan:
- Mengizinkan `bilangan = 0` (single participant)
- Tetap mencegah `bilangan < 0` (negative values)
- Memiliki dokumentasi yang jelas

## Logika Bisnis yang Benar

### **Peserta 1 (Selalu Ada)**
- Adalah **pendaftar** yang mengisi form
- Data otomatis tersimpan sebagai peserta utama
- Wajib diisi terlepas dari pilihan bilangan

### **Bilangan Peserta Tambahan**
- **0** = Tidak ada peserta tambahan (total: 1 orang)
- **1** = 1 peserta tambahan (total: 2 orang)
- **2** = 2 peserta tambahan (total: 3 orang)

## File yang Telah Diupdate

### Frontend (`src/routes/+page.svelte`)
- ✅ Label diperjelas: "Bilangan Peserta Tambahan"
- ✅ Penjelasan ditambahkan: "Pilih 0 jika hanya Anda sendiri yang akan pergi"
- ✅ Placeholder text diperbaiki
- ✅ Penjelasan Peserta 1 ditambahkan

### Backend (`src/routes/+page.server.js`)
- ✅ Validation untuk `bilangan >= 0` (bukan `> 0`)
- ✅ Logging yang lebih baik untuk tracking booking scenario
- ✅ Error message yang lebih jelas

## Testing

Setelah constraint diperbaiki, test case berikut harus berhasil:

1. **Bilangan = 0**: Booking berhasil, hanya data pendaftar tersimpan
2. **Bilangan = 1**: Booking berhasil, data pendaftar + 1 peserta tambahan tersimpan
3. **Bilangan = 2**: Booking berhasil, data pendaftar + 2 peserta tambahan tersimpan

## Catatan Penting

- **Jangan hapus constraint sepenuhnya** tanpa validasi
- **Gunakan constraint baru** yang mengizinkan 0 tapi mencegah nilai negatif
- **Test thoroughly** setelah migration untuk memastikan semua skenario berfungsi
- **Update dokumentasi** untuk tim development

## Backup

Sebelum menjalankan migration, pastikan untuk:
- Backup database
- Test di environment development terlebih dahulu
- Memiliki rollback plan jika ada masalah
