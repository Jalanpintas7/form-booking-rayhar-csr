# Implementasi Dropdown Kategori Umrah dengan Status "Tidak Tersedia"

## Overview
Implementasi ini menambahkan fitur yang sama seperti dropdown bilik dan penerbangan pada field pilih kategori umrah. Kategori yang tidak memiliki penerbangan/tanggal sama sekali untuk musim yang dipilih akan ditampilkan dengan status "Tidak Tersedia" dan tidak dapat dipilih.

## Fitur yang Ditambahkan

### 1. Dynamic Category Options
- **State Baru**: `dynamicCategoryOptions` - menyimpan opsi kategori yang dinamis berdasarkan ketersediaan
- **Fallback Options**: `fallbackCategoryOptions` - opsi default ketika tidak ada kategori yang tersedia

### 2. Fungsi `buildCategoryOptionsFromUmrahDates()`
Fungsi ini membangun opsi kategori berdasarkan:
- Musim umrah yang dipilih (`selectedMusimUmrah`)
- Data `umrahDates` dari database

**Logika:**
1. Filter `umrahDates` berdasarkan musim
2. Buat mapping kategori yang memiliki tanggal
3. Buat opsi untuk semua kategori dengan status disabled jika tidak memiliki tanggal

### 3. Effect untuk Update Dynamic Options
```javascript
$effect(() => {
    if (!selectedMusimUmrah) {
        dynamicCategoryOptions = [];
        return;
    }
    
    const built = buildCategoryOptionsFromUmrahDates(selectedMusimUmrah);
    dynamicCategoryOptions = built.length > 0 ? built : fallbackCategoryOptions;
});
```

### 4. Update Dropdown Kategori Umrah
Dropdown kategori umrah sekarang:
- Menggunakan `dynamicCategoryOptions` sebagai sumber data utama
- Menampilkan status "Tidak Tersedia" untuk kategori yang disabled
- Mencegah pemilihan kategori yang tidak tersedia
- Mengubah tampilan visual (abu-abu) untuk opsi yang disabled

## Struktur Data

### Category Option Object
```javascript
{
    value: "1",                    // ID kategori
    label: "Ekonomi",             // Nama kategori atau "Nama (Tidak Tersedia)"
    disabled: false                // true jika tidak memiliki tanggal umrah
}
```

### Fallback Options
```javascript
const fallbackCategoryOptions = $derived(() => {
    return umrahCategories.map(category => ({
        value: String(category.id),
        label: `${category.name} (Tidak Tersedia)`,
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
- Hanya kategori yang tersedia yang dapat diklik
- Kategori yang disabled tidak dapat dipilih
- Dropdown tidak dapat dibuka jika semua kategori disabled

### 2. Selection Reset
- Ketika kategori dipilih, `selectedAirline` dan `selectedTarikhUmrah` direset ke kosong
- Ini memastikan konsistensi data dan mencegah pemilihan yang tidak valid

## Flow Logic

### 1. Musim Umrah Dipilih
- Sistem mengecek `umrahDates` untuk mencari kategori yang memiliki tanggal
- Kategori yang tidak memiliki tanggal akan ditampilkan dengan status "(Tidak Tersedia)"

### 2. Kategori Umrah Dipilih
- Hanya kategori yang tersedia yang dapat dipilih
- Ketika kategori dipilih, penerbangan dan tanggal umrah direset

### 3. Penerbangan Dipilih
- Sistem mengecek `umrahDates` untuk mencari penerbangan yang memiliki tanggal untuk musim dan kategori yang dipilih
- Penerbangan yang tidak memiliki tanggal akan ditampilkan dengan status "(Tidak Tersedia)"

## Testing

File `test_category_dropdown.html` tersedia untuk testing implementasi dengan berbagai skenario:
- **Semua Kategori Tersedia**: Semua kategori memiliki tanggal umrah
- **Beberapa Kategori Tidak Tersedia**: Beberapa kategori tidak memiliki tanggal umrah
- **Semua Kategori Tidak Tersedia**: Tidak ada kategori yang memiliki tanggal umrah
- **Ketersediaan Campuran**: Kombinasi kategori yang tersedia dan tidak tersedia

## Integration dengan Existing Code

Implementasi ini terintegrasi dengan:
- State management yang sudah ada (`selectedMusimUmrah`, `selectedKategoriUmrah`)
- Effect system untuk reactive updates
- Visual styling yang konsisten dengan dropdown bilik dan penerbangan
- Database structure yang sudah ada (`umrahDates`, `umrahCategories`)

## Benefits

1. **User Experience**: User dapat melihat dengan jelas kategori mana yang tersedia untuk musim yang dipilih
2. **Data Consistency**: Mencegah pemilihan kategori yang tidak memiliki tanggal umrah
3. **Visual Feedback**: Status "Tidak Tersedia" memberikan informasi yang jelas
4. **Code Reusability**: Menggunakan pattern yang sama dengan dropdown bilik dan penerbangan
5. **Logical Flow**: Memastikan user hanya dapat memilih kombinasi yang valid

## Future Enhancements

1. **Tooltip**: Menambahkan tooltip untuk menjelaskan mengapa kategori tidak tersedia
2. **Filtering**: Menambahkan filter untuk hanya menampilkan kategori yang tersedia
3. **Search**: Menambahkan fitur pencarian untuk kategori yang tersedia
4. **Grouping**: Mengelompokkan kategori berdasarkan status ketersediaan
5. **Availability Calendar**: Menampilkan kalender ketersediaan untuk setiap kategori

## Dependencies

Implementasi ini bergantung pada:
- `umrahDates` - data tanggal umrah dari database
- `umrahCategories` - data kategori umrah dari database
- `selectedMusimUmrah` - state musim umrah yang dipilih
- Effect system Svelte untuk reactive updates

## Error Handling

- Jika tidak ada musim yang dipilih, `dynamicCategoryOptions` akan kosong
- Jika tidak ada kategori yang tersedia, fallback options akan digunakan
- Dropdown akan disabled jika semua kategori tidak tersedia
