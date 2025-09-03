# Migrasi ke Client-Side Rendering (CSR)

Project ini telah berhasil dimigrasi dari Server-Side Rendering (SSR) ke Client-Side Rendering (CSR).

## Perubahan yang Dilakukan

### 1. Konfigurasi Adapter
- **File**: `svelte.config.js`
- **Perubahan**: Mengubah dari `@sveltejs/adapter-auto` ke `@sveltejs/adapter-static`
- **Dampak**: Project sekarang akan di-build sebagai static files

### 2. Data Loading
- **File**: `src/routes/+page.server.js` → **DIHAPUS**
- **File Baru**: `src/routes/+page.js`
- **Perubahan**: Data loading dipindahkan ke client-side menggunakan `onMount`

### 3. Supabase Configuration
- **File Baru**: `src/lib/supabase.js`
- **Fitur**: 
  - Client-side Supabase configuration
  - Helper functions untuk semua data fetching
  - Error handling yang robust

### 4. Business Logic
- **File Baru**: `src/lib/bookingService.js`
- **Fitur**:
  - Price calculation functions
  - Form validation
  - N8n webhook integration
  - NRIC parsing

### 5. Form Handling
- **File**: `src/routes/+page.svelte`
- **Perubahan**:
  - Menghapus `enhance` dari `$app/forms`
  - Menambahkan `handleFormSubmit` function
  - Client-side form validation
  - Loading states dan error handling

### 6. Dependencies
- **File**: `package.json`
- **Perubahan**: Mengganti `@sveltejs/adapter-auto` dengan `@sveltejs/adapter-static`

## Environment Variables

Buat file `.env` di root project dengan konfigurasi berikut:

```env
VITE_SUPABASE_URL=your_supabase_project_url_here
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key_here
```

## Cara Menjalankan

1. **Install dependencies**:
   ```bash
   npm install
   ```

2. **Setup environment variables**:
   - Copy `.env.example` ke `.env`
   - Isi dengan Supabase credentials

3. **Development**:
   ```bash
   npm run dev
   ```

4. **Build untuk production**:
   ```bash
   npm run build
   ```

5. **Preview build**:
   ```bash
   npm run preview
   ```

## Fitur yang Dipertahankan

✅ **Semua fitur booking tetap berfungsi**:
- Form validation
- Price calculation
- NRIC parsing
- Postcode validation
- N8n webhook integration
- User inquiry tracking
- Member data handling

✅ **UI/UX tetap sama**:
- Loading states
- Error handling
- Success messages
- Form interactions

## Keuntungan CSR

1. **Performance**: Halaman load lebih cepat setelah initial load
2. **Scalability**: Tidak memerlukan server untuk rendering
3. **Deployment**: Bisa di-deploy ke CDN atau static hosting
4. **Cost**: Lebih murah untuk hosting

## Pertimbangan

1. **SEO**: Data tidak ter-render di server (tidak masalah untuk booking form)
2. **Initial Load**: Halaman akan kosong dulu, baru load data
3. **Security**: API keys ter-expose di client (gunakan RLS di Supabase)

## Troubleshooting

### Error: "Missing Supabase environment variables"
- Pastikan file `.env` sudah dibuat
- Pastikan `VITE_SUPABASE_URL` dan `VITE_SUPABASE_ANON_KEY` sudah diisi

### Error: "Failed to load data"
- Cek koneksi internet
- Cek Supabase credentials
- Cek RLS policies di Supabase

### Form tidak submit
- Cek browser console untuk error
- Pastikan semua required fields terisi
- Cek network tab untuk API calls

## Support

Jika ada masalah, cek:
1. Browser console untuk error messages
2. Network tab untuk failed requests
3. Supabase dashboard untuk RLS policies
4. Environment variables configuration
