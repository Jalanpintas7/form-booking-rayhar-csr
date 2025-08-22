# Fix untuk Data Checkbox CWB, Infant, dan CNB

## Masalah
Data checkbox untuk CWB (Child with Bag), Infant, dan CNB (Child No Bag) tidak tersimpan di database Supabase. Semua nilai selalu false meskipun checkbox dicentang.

## Penyebab
1. **Server-side processing**: Kode di `+page.server.js` tidak memproses data checkbox untuk CWB, Infant, dan CNB
2. **Database structure**: Tabel `members_booking` tidak memiliki kolom untuk menyimpan data checkbox tersebut

## Solusi yang Diterapkan

### 1. Update Server-side Code (`src/routes/+page.server.js`)

#### A. Menambahkan Processing untuk Checkbox Data
```javascript
// Process checkbox data for CWB, Infant, and CNB
match = /^peserta_cwb_(\d+)$/.exec(String(key));
if (match) {
    const id = match[1];
    const existing = pesertaMap.get(id) || {};
    existing.cwb = value === 'on';
    pesertaMap.set(id, existing);
    continue;
}
match = /^peserta_infant_(\d+)$/.exec(String(key));
if (match) {
    const id = match[1];
    const existing = pesertaMap.get(id) || {};
    existing.infant = value === 'on';
    pesertaMap.set(id, existing);
    continue;
}
match = /^peserta_cnb_(\d+)$/.exec(String(key));
if (match) {
    const id = match[1];
    const existing = pesertaMap.get(id) || {};
    existing.cnb = value === 'on';
    pesertaMap.set(id, existing);
}
```

#### B. Menambahkan Checkbox Data ke Database Record
```javascript
const pesertaRecord = {
    booking_id: bookingId,
    nama: trimmedNamaPeserta,
    nokp: nokpDigits.length === 12 ? nokpDigits : peserta.nokp,
    cwb: peserta.cwb || false,
    infant: peserta.infant || false,
    cnb: peserta.cnb || false
};
```

#### C. Menambahkan Debug Logging
```javascript
// Debug: log all form data entries
console.log('=== ALL FORM DATA ENTRIES ===');
for (const [key, value] of formData.entries()) {
    console.log(`${key}: ${value}`);
}
console.log('=============================');

// Debug: log checkbox data processing
console.log('=== CHECKBOX DATA DEBUG ===');
for (const [id, peserta] of pesertaMap.entries()) {
    console.log(`Peserta ${id}:`, {
        nama: peserta.nama,
        nokp: peserta.nokp,
        cwb: peserta.cwb,
        infant: peserta.infant,
        cnb: peserta.cnb
    });
}
console.log('==========================');
```

### 2. Database Migration (`add_checkbox_columns_migration.sql`)

Jalankan migration berikut di database Supabase:

```sql
-- Migration: Add checkbox columns to members_booking table
-- Date: 2024-12-19
-- Description: Add CWB, Infant, and CNB checkbox columns to store participant categories

-- Add the new columns to members_booking table
ALTER TABLE members_booking 
ADD COLUMN cwb BOOLEAN DEFAULT FALSE,
ADD COLUMN infant BOOLEAN DEFAULT FALSE,
ADD COLUMN cnb BOOLEAN DEFAULT FALSE;

-- Add comments to document the purpose of these columns
COMMENT ON COLUMN members_booking.cwb IS 'Child with Bag - indicates if participant is a child with luggage';
COMMENT ON COLUMN members_booking.infant IS 'Infant - indicates if participant is an infant';
COMMENT ON COLUMN members_booking.cnb IS 'Child No Bag - indicates if participant is a child without luggage';

-- Create indexes for better query performance (optional)
CREATE INDEX idx_members_booking_cwb ON members_booking(cwb);
CREATE INDEX idx_members_booking_infant ON members_booking(infant);
CREATE INDEX idx_members_booking_cnb ON members_booking(cnb);
```

## Cara Menerapkan Fix

### 1. Jalankan Database Migration
1. Buka Supabase Dashboard
2. Pergi ke SQL Editor
3. Copy dan paste isi file `add_checkbox_columns_migration.sql`
4. Jalankan query

### 2. Deploy Code Changes
1. Commit perubahan ke repository
2. Deploy ke production server
3. Restart server jika diperlukan

### 3. Testing
1. Buka form booking
2. Isi data peserta
3. Centang beberapa checkbox CWB, Infant, atau CNB
4. Submit form
5. Cek di database Supabase apakah data tersimpan dengan benar

## Verifikasi

### 1. Cek Database
```sql
-- Cek struktur tabel
SELECT column_name, data_type, is_nullable, column_default 
FROM information_schema.columns 
WHERE table_name = 'members_booking' 
AND column_name IN ('cwb', 'infant', 'cnb');

-- Cek data yang tersimpan
SELECT id, nama, cwb, infant, cnb 
FROM members_booking 
ORDER BY created_at DESC 
LIMIT 10;
```

### 2. Cek Server Logs
Setelah submit form, cek server logs untuk memastikan:
- Form data entries ditampilkan dengan benar
- Checkbox data processing berjalan
- Data tersimpan ke database tanpa error

## Struktur Data yang Diharapkan

Setelah fix diterapkan, data di tabel `members_booking` akan memiliki struktur:

```json
{
  "id": "uuid",
  "booking_id": "uuid",
  "nama": "Nama Peserta",
  "nokp": "123456789012",
  "cwb": true,        // true jika checkbox dicentang
  "infant": false,    // true jika checkbox dicentang
  "cnb": true,        // true jika checkbox dicentang
  "created_at": "2024-12-19T10:00:00Z"
}
```

## Troubleshooting

### Jika data masih false semua:
1. Cek apakah migration sudah dijalankan
2. Cek server logs untuk error
3. Pastikan form data entries menampilkan checkbox data
4. Verifikasi bahwa checkbox di frontend memiliki name yang benar

### Jika ada error database:
1. Cek apakah kolom sudah ditambahkan ke tabel
2. Pastikan tipe data BOOLEAN didukung
3. Cek foreign key constraints

## File yang Dimodifikasi
- `src/routes/+page.server.js` - Server-side processing
- `add_checkbox_columns_migration.sql` - Database migration
- `test_checkbox_data.html` - Test file untuk verifikasi
- `CHECKBOX_FIX_README.md` - Dokumentasi ini
