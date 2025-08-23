# User Journey Tracking System

## Overview
Sistem ini mendeteksi apakah user yang melakukan booking pernah mengisi form inquiry sebelumnya, menggunakan nomor telepon sebagai identifier.

## Struktur Database

### 1. Field Baru di Tabel `bookings`
- `is_from_inquiry` (BOOLEAN): `true` jika user pernah inquiry, `false` jika direct booking
- `lead_reference_id` (UUID): Reference ke tabel `leads` jika user dari inquiry

### 2. Function untuk Deteksi
```sql
check_if_user_inquired(p_telefon VARCHAR(20))
```
Function ini mengembalikan JSON dengan informasi:
- `is_from_inquiry`: boolean
- `lead_id`: UUID lead jika ada
- `lead_date`: tanggal inquiry jika ada

## Cara Penggunaan

### 1. Tracking Total Persentase
```sql
-- Cek berapa persen user dari inquiry
SELECT * FROM inquiry_booking_tracking;
```

### 2. Tracking per Periode
```sql
-- Cek per bulan
SELECT * FROM inquiry_booking_period_tracking;
```

### 3. Query Manual
```sql
-- Hitung persentase manual
SELECT 
    COUNT(*) as total_bookings,
    COUNT(CASE WHEN is_from_inquiry = true THEN 1 END) as from_inquiry,
    ROUND(
        (COUNT(CASE WHEN is_from_inquiry = true THEN 1 END)::DECIMAL / COUNT(*)::DECIMAL) * 100, 2
    ) as inquiry_percentage
FROM bookings;
```

### 4. Tracking per Branch
```sql
-- Cek per cawangan
SELECT 
    b.name as branch_name,
    COUNT(*) as total_bookings,
    COUNT(CASE WHEN bk.is_from_inquiry = true THEN 1 END) as from_inquiry,
    ROUND(
        (COUNT(CASE WHEN bk.is_from_inquiry = true THEN 1 END)::DECIMAL / COUNT(*)::DECIMAL) * 100, 2
    ) as inquiry_percentage
FROM bookings bk
JOIN branches b ON bk.branch_id = b.id
GROUP BY b.id, b.name
ORDER BY inquiry_percentage DESC;
```

## Implementasi di Kode

### 1. Di +page.server.js
```javascript
// Cek apakah user pernah inquiry sebelum booking
const { data: userJourney, error: journeyError } = await supabase.rpc('check_if_user_inquired', {
    p_telefon: maklumat.telefon
});

// Set field tracking
if (userJourney && userJourney.is_from_inquiry) {
    maklumat.is_from_inquiry = true;
    maklumat.lead_reference_id = userJourney.lead_id;
} else {
    maklumat.is_from_inquiry = false;
}
```

## Keuntungan Sistem Ini

1. **Simple**: Hanya 2 field tambahan
2. **Fast**: Tidak ada join yang kompleks
3. **Accurate**: Menggunakan nomor telepon sebagai identifier
4. **Easy to Track**: Cukup query `is_from_inquiry = true/false`
5. **Real-time**: Update otomatis saat user booking

## Monitoring

### 1. Console Log
Sistem akan log di console:
- `=== USER FROM INQUIRY ===` jika user pernah inquiry
- `=== DIRECT BOOKING ===` jika user booking langsung

### 2. Database Tracking
- Field `is_from_inquiry` akan otomatis terisi
- Field `lead_reference_id` akan terisi jika user dari inquiry

## Contoh Output

### 1. User dari Inquiry
```json
{
    "is_from_inquiry": true,
    "lead_id": "uuid-here",
    "lead_date": "2025-08-23T08:46:37.570164+00:00"
}
```

### 2. Direct Booking
```json
{
    "is_from_inquiry": false
}
```

## Maintenance

### 1. Backup Data
Sebelum menjalankan migration, backup tabel `bookings`:
```sql
CREATE TABLE bookings_backup AS SELECT * FROM bookings;
```

### 2. Rollback
Jika ada masalah, bisa rollback:
```sql
ALTER TABLE bookings DROP COLUMN is_from_inquiry;
ALTER TABLE bookings DROP COLUMN lead_reference_id;
```

## Kesimpulan

Sistem tracking ini memberikan insight sederhana namun powerful tentang:
- Berapa persen user yang convert dari inquiry ke booking
- Performance inquiry system
- Efektivitas follow-up inquiry

Dengan data ini, tim marketing dan sales bisa:
- Mengukur efektivitas inquiry system
- Meningkatkan follow-up strategy
- Mengoptimalkan conversion rate
