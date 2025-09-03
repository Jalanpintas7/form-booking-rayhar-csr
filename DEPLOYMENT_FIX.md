# Perbaikan Masalah Deployment - Error Poskod

## Masalah yang Ditemukan

Error "Ralat semasa mencari poskod. Sila cuba lagi." terjadi karena:

1. **API routes tidak berfungsi** pada static hosting (404 error)
2. **Static deployment** tidak mendukung server-side API routes
3. **Konfigurasi Supabase** tidak konsisten antara development dan production

## Solusi yang Diterapkan

### 1. Migrasi ke Client-Side Implementation

- **Menghapus API route** `/api/postcode/+server.js` yang tidak berfungsi pada static hosting
- **Mengubah implementasi poskod** dari server-side ke client-side langsung
- **Menggunakan Supabase client** langsung di frontend untuk query poskod

### 2. Perbaikan Server Configuration (`src/lib/server/supabase.js`)

- Menambahkan validasi konfigurasi
- Memastikan fallback values tersedia

## Langkah-langkah untuk Deployment

### 1. Buat File Environment Variables

Buat file `.env` di root project dengan isi:

```env
# Supabase Configuration (Client-side)
VITE_SUPABASE_URL=https://lrpsrlmlrgqivfczbzqp.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxycHNybG1scmdxaXZmY3pienFwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTUyMjAxOTYsImV4cCI6MjA3MDc5NjE5Nn0.6FuahA3i5mZZHjLmOHnZdLn_g09fgfkmL9cPPyuOeJo
```

**Catatan**: Sekarang hanya perlu environment variables untuk client-side karena API routes sudah dihapus.

### 2. Konfigurasi Platform Deployment

#### Untuk Vercel:
1. Masuk ke dashboard Vercel
2. Pilih project Anda
3. Pergi ke Settings > Environment Variables
4. Tambahkan semua environment variables di atas

#### Untuk Netlify:
1. Masuk ke dashboard Netlify
2. Pilih site Anda
3. Pergi ke Site settings > Environment variables
4. Tambahkan semua environment variables di atas

#### Untuk Platform Lain:
Pastikan environment variables berikut tersedia:
- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_ANON_KEY`

### 3. Build dan Deploy

```bash
# Install dependencies
npm install

# Build untuk production
npm run build

# Deploy (sesuai dengan platform yang digunakan)
```

## Testing

Setelah deployment, test dengan:

1. Buka website yang sudah di-deploy
2. Masukkan poskod yang valid (contoh: 50000, 10000, 20000)
3. Pastikan tidak ada error "Ralat semasa mencari poskod"

## Troubleshooting

### Jika masih ada error:

1. **Cek Browser Console**:
   - Buka Developer Tools (F12)
   - Lihat tab Console untuk error messages
   - Lihat tab Network untuk failed requests

2. **Cek Environment Variables**:
   - Pastikan semua environment variables sudah terkonfigurasi
   - Pastikan tidak ada typo dalam nama variable

3. **Cek Supabase Connection**:
   - Pastikan Supabase project masih aktif
   - Pastikan API keys masih valid
   - Cek RLS policies di Supabase dashboard

4. **Cek Supabase Connection**:
   - Buka browser console (F12)
   - Lihat apakah ada error koneksi ke Supabase
   - Pastikan environment variables sudah terkonfigurasi dengan benar

## Catatan Penting

- **Static Deployment**: Sekarang menggunakan client-side Supabase langsung, tidak memerlukan server-side API routes
- **Performance**: Query poskod langsung dari client ke Supabase, lebih cepat dan efisien
- **Error Handling**: Error messages sudah diperbaiki untuk memberikan feedback yang lebih jelas
- **Security**: Pastikan RLS (Row Level Security) policies sudah dikonfigurasi dengan benar di Supabase

## Support

Jika masih ada masalah setelah mengikuti langkah-langkah di atas:

1. Cek browser console untuk error messages
2. Cek Supabase dashboard untuk error logs dan RLS policies
3. Pastikan environment variables sudah terkonfigurasi dengan benar
4. Test koneksi Supabase langsung di browser console
