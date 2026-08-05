CARA MENAMBAHKAN ASET KAMU SENDIRI
====================================

1. MUSIK LATAR
   Simpan file musik kamu sebagai:
   assets/music/love-song.mp3
   (format MP3, disarankan di bawah 5MB agar loading cepat)
   Tombol play/pause/mute di kanan bawah akan otomatis memutarnya.
   Jika file belum ada, tombol tetap berfungsi (UI toggle) tanpa error.

2. FOTO GALERI
   Saat ini galeri (section #gallery di index.html) memakai placeholder
   gradient + ikon Font Awesome, bukan foto asli — supaya file tetap
   ringan dan tidak bergantung koneksi internet untuk gambar eksternal.

   Untuk mengganti dengan foto asli:
   a. Taruh foto kamu di folder assets/images/ (contoh: memory-1.jpg)
   b. Di index.html, cari elemen:
        <div class="gallery-placeholder ph-1"><i class="fa-solid fa-camera-retro"></i></div>
      Ganti isinya menjadi:
        <img src="assets/images/memory-1.jpg" alt="Pertama Kali Bertemu">
   c. Di style.css, class .gallery-placeholder bisa diberi
        object-fit: cover; width:100%; height:100%;
      pada elemen <img> agar mengisi kartu dengan rapi.

3. FONT
   Font di-load dari Google Fonts via CDN (Outfit, Poppins, Playfair Display).
   Jika ingin hosting font secara lokal (misalnya untuk offline use),
   unduh file .woff2 dan taruh di assets/fonts/, lalu ganti tag <link>
   Google Fonts di index.html dengan @font-face di style.css.
