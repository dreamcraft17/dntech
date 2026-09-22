# Blog layout refresh — DN Tech

Tanggal: 2026-09-22

## Keputusan yang ingin dijawab

Bagaimana membuat halaman detail blog DN Tech lebih menarik dan lebih nyaman dibaca tanpa mengubahnya menjadi landing page yang ramai atau mengorbankan aksesibilitas?

## Hipotesis

1. Hero editorial dua kolom dengan cover yang kuat akan membuat artikel terasa lebih bernilai daripada panel teks tunggal.
2. Hierarki heading, lebar kolom baca, dan daftar isi akan membantu pembaca memindai artikel panjang.
3. Artikel terkait yang memiliki gambar dan konteks singkat akan memberi jalur lanjutan yang lebih jelas.

## Batasan implementasi

- Pertahankan konten HTML dari CMS dan sanitasi yang sudah ada.
- Tidak menambah library UI atau mengubah model data.
- Tidak memakai glassmorphism, gradient dekoratif, atau animasi yang tidak membantu.
- Mobile tetap satu kolom dan daftar isi tidak boleh mengganggu pembacaan.

## Keputusan desain

- Latar halaman editorial netral, permukaan putih untuk artikel.
- Hero: kategori, judul, excerpt, metadata, dan gambar cover dalam grid responsif.
- Daftar isi dibuat dari heading H2 yang sudah ada; heading diberi ID aman untuk anchor.
- Body memakai ukuran dan lebar kolom yang mendukung scanning serta long-form reading.
- CTA tetap satu blok setelah isi, lalu artikel terkait dengan thumbnail.

## Risiko dan mitigasi

- Artikel tanpa gambar: tampilkan panel fallback sederhana, bukan ruang kosong.
- Heading tidak ada/terlalu sedikit: daftar isi tidak ditampilkan.
- HTML heading berbahaya: sanitasi tetap dilakukan sebelum ID ditambahkan.
- Related post tanpa gambar: kartu tetap memiliki struktur dan tidak bergantung pada thumbnail.

