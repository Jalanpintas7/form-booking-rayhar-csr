# Implementasi Dropdown Destinasi dengan Status "Tidak Tersedia"

## Overview
Implementasi ini menambahkan fitur yang sama seperti dropdown bilik, penerbangan, dan kategori umrah pada field pilih destinasi untuk paket pelancongan. Destinasi yang tidak memiliki tanggal pelancongan sama sekali akan ditampilkan dengan status "Tidak Tersedia" dan tidak dapat dipilih.

## Fitur yang Ditambahkan

### 1. Dynamic Destination Options
- **State Baru**: `dynamicDestinationOptions` - menyimpan opsi destinasi yang dinamis berdasarkan ketersediaan
- **Fallback Options**: `fallbackDestinationOptions` - opsi default ketika tidak ada destinasi yang tersedia

### 2. Fungsi `buildDestinationOptionsFromOutboundDates()`
Fungsi ini membangun opsi destinasi berdasarkan:
- Data `outboundDates` dari database
- Relasi dengan tabel `destinations`

**Logika:**
1. Group `outboundDates` berdasarkan `destination_id`
2. Buat mapping destinasi yang memiliki tanggal
3. Buat opsi untuk semua destinasi dengan status disabled jika tidak memiliki tanggal

### 3. Effect untuk Update Dynamic Options
```javascript
$effect(() => {
    const built = buildDestinationOptionsFromOutboundDates();
    dynamicDestinationOptions = built.length > 0 ? built : fallbackDestinationOptions;
});
```

### 4. Update Dropdown Destinasi
Dropdown destinasi sekarang:
- Menggunakan `dynamicDestinationOptions` sebagai sumber data utama
- Menampilkan status "Tidak Tersedia" untuk destinasi yang disabled
- Mencegah pemilihan destinasi yang tidak tersedia
- Mengubah tampilan visual (abu-abu) untuk opsi yang disabled
- Tetap mempertahankan fitur search yang sudah ada

## Struktur Data

### Destination Option Object
```javascript
{
    value: "1",                    // ID destinasi
    label: "Thailand",             // Nama destinasi atau "Nama (Tidak Tersedia)"
    disabled: false                // true jika tidak memiliki tanggal pelancongan
}
```

### Fallback Options
```javascript
const fallbackDestinationOptions = $derived(() => {
    return destinations.map(destination => ({
        value: String(destination.id),
        label: `${destination.name} (Tidak Tersedia)`,
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
- Hanya destinasi yang tersedia yang dapat diklik
- Destinasi yang disabled tidak dapat dipilih
- Dropdown tidak dapat dibuka jika semua destinasi disabled

### 2. Selection Reset
- Ketika destinasi dipilih, `selectedTarikh` direset ke kosong
- Ini memastikan konsistensi data dan mencegah pemilihan yang tidak valid

### 3. Search Functionality
- Fitur search tetap berfungsi dan dapat mencari destinasi yang tersedia maupun tidak tersedia
- Search berdasarkan `label` (termasuk status "Tidak Tersedia")
- Filter real-time dengan debouncing 300ms

## Integration dengan Existing Features

### 1. Search Box
- Search input tetap berada di atas dropdown
- Placeholder: "Ketik untuk mencari destinasi..."
- Focus otomatis ketika dropdown dibuka
- Clear search ketika dropdown ditutup

### 2. Filtered Results
- `filteredDestinations` sekarang menggunakan `dynamicDestinationOptions`
- Search berdasarkan `opt.label` bukan `opt.name`
- Menampilkan "Tidak ada destinasi yang ditemukan" jika search tidak ada hasil

### 3. Existing State Management
- Tetap menggunakan `searchTermDestinations` dan `searchTimeoutDestinations`
- Tetap menggunakan `filteredDestinations` untuk search results
- Tetap menggunakan `isDestinasiOpen` untuk toggle state

## Flow Logic

### 1. Destinasi Dipilih
- Sistem mengecek `outboundDates` untuk mencari destinasi yang memiliki tanggal
- Destinasi yang tidak memiliki tanggal akan ditampilkan dengan status "(Tidak Tersedia)"

### 2. Tanggal Pelancongan
- Hanya destinasi yang tersedia yang dapat dipilih
- Ketika destinasi dipilih, tanggal pelancongan direset

### 3. Peserta
- Setelah destinasi dan tanggal dipilih, field peserta akan muncul

## Testing

File `test_destination_dropdown.html` tersedia untuk testing implementasi dengan berbagai skenario:
- **Semua Destinasi Tersedia**: Semua destinasi memiliki tanggal pelancongan
- **Beberapa Destinasi Tidak Tersedia**: Beberapa destinasi tidak memiliki tanggal pelancongan
- **Semua Destinasi Tidak Tersedia**: Tidak ada destinasi yang memiliki tanggal pelancongan
- **Ketersediaan Campuran**: Kombinasi destinasi yang tersedia dan tidak tersedia

## Integration dengan Existing Code

Implementasi ini terintegrasi dengan:
- State management yang sudah ada (`selectedDestinasi`, `searchTermDestinations`)
- Search functionality yang sudah ada
- Effect system untuk reactive updates
- Visual styling yang konsisten dengan dropdown lainnya
- Database structure yang sudah ada (`outboundDates`, `destinations`)

## Benefits

1. **User Experience**: User dapat melihat dengan jelas destinasi mana yang tersedia
2. **Data Consistency**: Mencegah pemilihan destinasi yang tidak memiliki tanggal pelancongan
3. **Visual Feedback**: Status "Tidak Tersedia" memberikan informasi yang jelas
4. **Code Reusability**: Menggunakan pattern yang sama dengan dropdown lainnya
5. **Search Preservation**: Fitur search tetap berfungsi dengan baik
6. **Logical Flow**: Memastikan user hanya dapat memilih kombinasi yang valid

## Future Enhancements

1. **Tooltip**: Menambahkan tooltip untuk menjelaskan mengapa destinasi tidak tersedia
2. **Filtering**: Menambahkan filter untuk hanya menampilkan destinasi yang tersedia
3. **Availability Calendar**: Menampilkan kalender ketersediaan untuk setiap destinasi
4. **Price Display**: Menampilkan harga paket untuk setiap destinasi yang tersedia
5. **Seasonal Availability**: Menampilkan ketersediaan berdasarkan musim

## Dependencies

Implementasi ini bergantung pada:
- `outboundDates` - data tanggal pelancongan dari database
- `destinations` - data destinasi dari database
- Effect system Svelte untuk reactive updates
- Existing search functionality

## Error Handling

- Jika tidak ada `outboundDates`, `dynamicDestinationOptions` akan kosong
- Jika tidak ada destinasi yang tersedia, fallback options akan digunakan
- Dropdown akan disabled jika semua destinasi tidak tersedia
- Search tetap berfungsi meskipun tidak ada destinasi yang tersedia

## Search Integration

### Search Logic
```javascript
filteredDestinations = (dynamicDestinationOptions.length > 0 ? 
    dynamicDestinationOptions : fallbackDestinationOptions).filter(d => 
        d.label.toLowerCase().includes(searchTermDestinations)
    );
```

### Search Features
- Real-time filtering dengan debouncing
- Search berdasarkan full label (termasuk status)
- Clear search ketika dropdown ditutup
- Focus otomatis pada search input
- "No results" message untuk search yang tidak ada hasil
