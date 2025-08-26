# Implementasi Dropdown Penerbangan dengan Status "Tidak Tersedia"

## Overview
Implementasi ini menambahkan fitur yang sama seperti dropdown bilik pada field pilih penerbangan. Penerbangan yang tidak memiliki tanggal umrah untuk musim dan kategori yang dipilih akan ditampilkan dengan status "Tidak Tersedia" dan tidak dapat dipilih.

## Fitur yang Ditambahkan

### 1. Dynamic Penerbangan Options
- **State Baru**: `dynamicAirlineOptions` - menyimpan opsi penerbangan yang dinamis berdasarkan ketersediaan
- **Fallback Options**: `fallbackAirlineOptions` - opsi default ketika tidak ada penerbangan yang tersedia

### 2. Fungsi `buildAirlineOptionsFromUmrahDates()`
Fungsi ini membangun opsi penerbangan berdasarkan:
- Musim umrah yang dipilih (`selectedMusimUmrah`)
- Kategori umrah yang dipilih (`selectedKategoriUmrah`)
- Data `umrahDates` dari database

**Logika:**
1. Filter `umrahDates` berdasarkan musim dan kategori
2. Buat mapping penerbangan yang memiliki tanggal
3. Buat opsi untuk semua penerbangan dengan status disabled jika tidak memiliki tanggal

### 3. Effect untuk Update Dynamic Options
```javascript
$effect(() => {
    if (!selectedMusimUmrah || !selectedKategoriUmrah) {
        dynamicAirlineOptions = [];
        return;
    }
    
    const built = buildAirlineOptionsFromUmrahDates(selectedMusimUmrah, selectedKategoriUmrah);
    dynamicAirlineOptions = built.length > 0 ? built : fallbackAirlineOptions;
});
```

### 4. Update Dropdown Penerbangan
Dropdown penerbangan sekarang:
- Menggunakan `dynamicAirlineOptions` sebagai sumber data utama
- Menampilkan status "Tidak Tersedia" untuk penerbangan yang disabled
- Mencegah pemilihan penerbangan yang tidak tersedia
- Mengubah tampilan visual (abu-abu) untuk opsi yang disabled

## Struktur Data

### Penerbangan Option Object
```javascript
{
    value: "1",                    // ID penerbangan
    label: "Malaysia Airlines",    // Nama penerbangan atau "Nama (Tidak Tersedia)"
    disabled: false                // true jika tidak memiliki tanggal umrah
}
```

### Fallback Options
```javascript
const fallbackAirlineOptions = $derived(() => {
    return airlines.map(airline => ({
        value: String(airline.id),
        label: `${airline.name} (Tidak Tersedia)`,
        disabled: true
    }));
});
```

## Visual Changes

### 1. Disabled State
- Background: `bg-gray-100`
- Text color: `text-gray-500`
- Cursor: `cursor-not-allowed`
- Arrow opacity: `opacity-50`

### 2. Available State
- Background: `bg-white`
- Text color: `text-gray-700`
- Cursor: `cursor-pointer`
- Arrow opacity: normal

### 3. Selected State
- Background: `bg-purple-100`
- Text color: `text-purple-700`

## Behavior Changes

### 1. Click Handling
- Hanya penerbangan yang tersedia yang dapat diklik
- Penerbangan yang disabled tidak dapat dipilih
- Dropdown tidak dapat dibuka jika semua penerbangan disabled

### 2. Selection Reset
- Ketika penerbangan dipilih, `selectedTarikhUmrah` direset ke kosong
- Ini memastikan konsistensi data

## Testing

File `test_penerbangan_dropdown.html` tersedia untuk testing implementasi dengan berbagai skenario:
- Semua penerbangan tersedia
- Beberapa penerbangan tidak tersedia
- Semua penerbangan tidak tersedia

## Integration dengan Existing Code

Implementasi ini terintegrasi dengan:
- State management yang sudah ada
- Effect system untuk reactive updates
- Visual styling yang konsisten dengan dropdown bilik
- Database structure yang sudah ada

## Benefits

1. **User Experience**: User dapat melihat dengan jelas penerbangan mana yang tersedia
2. **Data Consistency**: Mencegah pemilihan penerbangan yang tidak memiliki tanggal umrah
3. **Visual Feedback**: Status "Tidak Tersedia" memberikan informasi yang jelas
4. **Code Reusability**: Menggunakan pattern yang sama dengan dropdown bilik

## Future Enhancements

1. **Tooltip**: Menambahkan tooltip untuk menjelaskan mengapa penerbangan tidak tersedia
2. **Filtering**: Menambahkan filter untuk hanya menampilkan penerbangan yang tersedia
3. **Search**: Menambahkan fitur pencarian untuk penerbangan yang tersedia
4. **Grouping**: Mengelompokkan penerbangan berdasarkan status ketersediaan
