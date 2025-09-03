# Perbaikan Masalah Deployment - Error Poskod

## Masalah yang Ditemukan

Error "Ralat semasa mencari poskod. Sila cuba lagi." terjadi karena:

1. **Environment Variables tidak terkonfigurasi** pada deployment
2. **API routes tidak berfungsi** dengan benar pada static hosting
3. **Konfigurasi Supabase** tidak konsisten antara development dan production

## Solusi yang Diterapkan

### 1. Perbaikan API Postcode (`src/routes/api/postcode/+server.js`)

- Menambahkan fallback configuration langsung di dalam API
- Menambahkan error logging yang lebih detail
- Menggunakan createClient langsung untuk menghindari dependency issues

### 2. Perbaikan Server Configuration (`src/lib/server/supabase.js`)

- Menambahkan validasi konfigurasi
- Memastikan fallback values tersedia

## Langkah-langkah untuk Deployment

### 1. Buat File Environment Variables

Buat file `.env` di root project dengan isi:

```env
# Supabase Configuration
VITE_SUPABASE_URL=https://lrpsrlmlrgqivfczbzqp.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxycHNybG1scmdxaXZmY3pienFwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTUyMjAxOTYsImV4cCI6MjA3MDc5NjE5Nn0.6FuahA3i5mZZHjLmOHnZdLn_g09fgfkmL9cPPyuOeJo

# Server-side Supabase (untuk API routes)
SUPABASE_URL=https://lrpsrlmlrgqivfczbzqp.supabase.co
SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxycHNybG1scmdxaXZmY3pienFwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTUyMjAxOTYsImV4cCI6MjA3MDc5NjE5Nn0.6FuahA3i5mZZHjLmOHnZdLn_g09fgfkmL9cPPyuOeJo
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxycHNybG1scmdxaXZmY3pienFwIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NTIyMDE5NiwiZXhwIjoyMDcwNzk2MTk2fQ.ruZkHF3apDEkVhyXL20L-wRueaa7iN7kGDopERi2KBU
```

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
- `SUPABASE_URL`
- `SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`

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

4. **Cek API Endpoint**:
   - Test langsung: `https://your-domain.com/api/postcode?poskod=50000`
   - Pastikan response tidak error

## Catatan Penting

- **Security**: API keys sudah di-hardcode sebagai fallback, tapi sebaiknya gunakan environment variables untuk production
- **Performance**: API sekarang memiliki fallback configuration yang lebih robust
- **Error Handling**: Error messages sudah diperbaiki untuk memberikan feedback yang lebih jelas

## Support

Jika masih ada masalah setelah mengikuti langkah-langkah di atas:

1. Cek log deployment platform
2. Cek Supabase dashboard untuk error logs
3. Test API endpoint secara langsung
4. Pastikan semua environment variables sudah terkonfigurasi dengan benar
