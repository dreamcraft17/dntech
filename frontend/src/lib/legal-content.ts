/**
 * Fallback HTML for /privacy and /terms when CMS settings are empty.
 * Source of truth for seeding: dntech/legal/*.html
 *
 * The `_EN` variants are the English rendering of the same clauses. Indonesian
 * statutes and the legal entity keep their official Indonesian names, because
 * those references are what actually binds — only the surrounding prose is
 * translated. Use `getLegalFallback()` to pick the right one for a locale.
 */
export const PRIVACY_POLICY_HTML = "<h1>Kebijakan Privasi</h1>\r\n<p><strong>Berlaku mulai:</strong> 9 September 2026<br />\r\n<strong>Pengendali data:</strong> PT. Dozer Napitupulu Technology (“DN Tech”, “kami”)</p>\r\n<p>Kebijakan ini menjelaskan bagaimana kami memproses data pribadi pengunjung dan calon klien situs <a href=\"https://www.dntech.id\">www.dntech.id</a> beserta subdomain yang kami kelola. Dokumen ini disusun agar Anda mendapat informasi yang diwajibkan sebelum atau pada saat data dikumpulkan, sesuai Pasal 21 Undang-Undang Nomor 27 Tahun 2022 tentang Pelindungan Data Pribadi (“UU PDP”).</p>\r\n<p>Dokumen ini adalah kebijakan perusahaan, bukan nasihat hukum. Jika ketentuan peraturan berubah, kami akan menyesuaikan kebijakan ini.</p>\r\n\r\n<h2>1. Dasar hukum</h2>\r\n<p>Pemrosesan data pribadi oleh DN Tech merujuk pada:</p>\r\n<ul>\r\n  <li>Undang-Undang Nomor 27 Tahun 2022 tentang Pelindungan Data Pribadi;</li>\r\n  <li>Undang-Undang Nomor 11 Tahun 2008 tentang Informasi dan Transaksi Elektronik sebagaimana diubah terakhir dengan Undang-Undang Nomor 1 Tahun 2024 (“UU ITE”), termasuk Pasal 26 terkait penggunaan data pribadi dalam media elektronik;</li>\r\n  <li>Peraturan Pemerintah Nomor 71 Tahun 2019 tentang Penyelenggaraan Sistem dan Transaksi Elektronik (“PP PSTE”).</li>\r\n</ul>\r\n<p>Dasar pemrosesan yang kami gunakan (Pasal 20 ayat (2) UU PDP), sesuai konteksnya:</p>\r\n<ul>\r\n  <li><strong>Persetujuan eksplisit</strong> — misalnya langganan newsletter, cookie analitik yang tidak wajib, dan kotak persetujuan pada formulir kontak;</li>\r\n  <li><strong>Pelaksanaan perjanjian atau langkah pra-perjanjian</strong> — menindaklanjuti permintaan konsultasi, proposal, atau kontrak kerja;</li>\r\n  <li><strong>Kewajiban hukum</strong> — misalnya pencatatan perpajakan dan pembukuan;</li>\r\n  <li><strong>Kepentingan yang sah</strong> — keamanan situs, pencegahan spam/bot, dan perbaikan layanan, sepanjang tidak mengesampingkan hak Anda.</li>\r\n</ul>\r\n\r\n<h2>2. Identitas pengendali data</h2>\r\n<ul>\r\n  <li><strong>Nama:</strong> PT. Dozer Napitupulu Technology</li>\r\n  <li><strong>Nama dagang:</strong> DN Tech</li>\r\n  <li><strong>Email:</strong> <a href=\"mailto:info@dntech.id\">info@dntech.id</a></li>\r\n  <li><strong>Permintaan hak subjek data:</strong> <a href=\"mailto:info@dntech.id\">info@dntech.id</a> dengan subjek “Permintaan Data Pribadi”</li>\r\n</ul>\r\n<p>Alamat kantor yang tercantum di halaman Kontak atau pengaturan situs (jika diisi) adalah alamat korespondensi kami.</p>\r\n\r\n<h2>3. Data yang kami kumpulkan</h2>\r\n<p>Kami tidak menjual data pribadi. Data yang diproses terbatas pada yang diperlukan untuk tujuan di bawah ini (prinsip minimalisasi).</p>\r\n<h3>3.1 Data yang Anda berikan</h3>\r\n<ul>\r\n  <li>Nama, email, nomor telepon, nama perusahaan;</li>\r\n  <li>Jenis proyek, layanan yang diminati, kisaran anggaran, timeline, dan isi pesan;</li>\r\n  <li>Email untuk newsletter;</li>\r\n  <li>Jawaban kuis “temukan solusi” (kebutuhan bisnis, bukan data sensitif);</li>\r\n  <li>Lamaran kerja (CV dan data yang Anda kirim ke email karier), jika ada;</li>\r\n  <li>Isi percakapan chat (Crisp), jika fitur chat aktif.</li>\r\n</ul>\r\n<h3>3.2 Data yang terekam otomatis</h3>\r\n<ul>\r\n  <li>Alamat IP, jenis peramban, perangkat, halaman yang dikunjungi, dan waktu kunjungan;</li>\r\n  <li>Log server dan peristiwa error (termasuk Sentry, jika diaktifkan);</li>\r\n  <li>Pengukuran lalu lintas situs melalui Google Analytics / Google Tag Manager, jika ID pengukuran diaktifkan;</li>\r\n  <li>Cookie sesi yang diperlukan agar situs berfungsi (termasuk cookie autentikasi httpOnly untuk panel admin).</li>\r\n</ul>\r\n<p>Kami <strong>tidak</strong> secara sengaja mengumpulkan data pribadi spesifik sebagaimana dimaksud Pasal 4 ayat (2) UU PDP (misalnya data kesehatan, biometrik, atau data keuangan lengkap kartu kredit) melalui situs pemasaran ini. Jangan kirimkan data semacam itu lewat formulir publik.</p>\r\n\r\n<h2>4. Tujuan pemrosesan</h2>\r\n<ul>\r\n  <li>Menjawab pertanyaan, menjadwalkan konsultasi, dan menyusun penawaran;</li>\r\n  <li>Mengirim newsletter atau materi yang Anda minta, dan memproses konfirmasi langganan;</li>\r\n  <li>Mengoperasikan, mengamankan, dan memperbaiki situs;</li>\r\n  <li>Memahami halaman mana yang berguna (analitik agregat);</li>\r\n  <li>Memenuhi kewajiban hukum dan menyelesaikan sengketa;</li>\r\n  <li>Memproses lamaran kerja.</li>\r\n</ul>\r\n<p>Kami tidak menggunakan data Anda untuk pengambilan keputusan otomatis yang menimbulkan akibat hukum bagi Anda (Pasal 10 UU PDP).</p>\r\n\r\n<h2>5. Periode retensi</h2>\r\n<ul>\r\n  <li><strong>Lead / formulir kontak:</strong> selama proses penawaran dan pelaksanaan kerja, kemudian paling lama 5 tahun untuk keperluan pembukuan dan klaim, kecuali Anda meminta penghapusan lebih awal dan tidak ada kewajiban hukum untuk menyimpan;</li>\r\n  <li><strong>Newsletter:</strong> sampai Anda berhenti berlangganan atau menarik persetujuan;</li>\r\n  <li><strong>Log teknis:</strong> umumnya hingga 90 hari, kecuali diperlukan lebih lama untuk insiden keamanan;</li>\r\n  <li><strong>Lamaran kerja:</strong> hingga 12 bulan setelah proses rekrutmen selesai, kecuali disepakati lain;</li>\r\n  <li><strong>Data kontrak klien:</strong> sesuai jangka waktu kontrak dan kewajiban arsip yang berlaku.</li>\r\n</ul>\r\n\r\n<h2>6. Penerima dan prosesor</h2>\r\n<p>Data dapat diproses oleh kami dan oleh pihak yang membantu operasional, antara lain:</p>\r\n<ul>\r\n  <li>Penyedia hosting, email transaksional, dan infrastruktur cloud;</li>\r\n  <li>Google (Analytics / Tag Manager) jika analitik diaktifkan;</li>\r\n  <li>Sentry untuk pemantauan error, jika diaktifkan;</li>\r\n  <li>Crisp Chat untuk percakapan, jika diaktifkan;</li>\r\n  <li>Konsultan atau subkontraktor yang terikat kerahasiaan, hanya sebatas keperluan proyek Anda.</li>\r\n</ul>\r\n<p>Pihak tersebut bertindak sebagai prosesor atau pengendali mandiri sesuai peran mereka. Kami mewajibkan pengamanan yang wajar sesuai kontrak dan UU PDP.</p>\r\n\r\n<h2>7. Transfer ke luar Indonesia</h2>\r\n<p>Sebagian layanan di atas dapat menyimpan atau memproses data di server di luar wilayah Indonesia. Jika transfer lintas batas terjadi, kami berupaya memastikan pelindungan yang setara sebagaimana diwajibkan Bab V UU PDP (antara lain melalui penilaian negara tujuan, kontrak, dan langkah pengamanan teknis).</p>\r\n\r\n<h2>8. Cookie</h2>\r\n<ul>\r\n  <li><strong>Wajib:</strong> cookie yang menjaga sesi, keamanan, dan fungsi inti situs. Dasar: kepentingan sah / pelaksanaan layanan.</li>\r\n  <li><strong>Analitik:</strong> Google Analytics mengukur kunjungan. Dasar: persetujuan atau kepentingan sah untuk statistik, tergantung konfigurasi yang kami pasang. Anda dapat memblokir cookie lewat pengaturan peramban.</li>\r\n</ul>\r\n<p>Cookie chat pihak ketiga (Crisp) hanya dipasang jika widget chat dimuat.</p>\r\n\r\n<h2>9. Hak Anda sebagai subjek data</h2>\r\n<p>Sesuai Pasal 6 sampai Pasal 13 UU PDP, Anda berhak antara lain:</p>\r\n<ul>\r\n  <li>Memperoleh informasi tentang identitas pengendali, dasar hukum, tujuan, dan pemrosesan data Anda;</li>\r\n  <li>Melengkapi, memperbarui, dan/atau memperbaiki kesalahan data;</li>\r\n  <li>Mengakses dan memperoleh salinan data tentang diri Anda dalam format yang lazim;</li>\r\n  <li>Mengakhiri pemrosesan, menghapus, dan/atau memusnahkan data sesuai ketentuan;</li>\r\n  <li>Menarik persetujuan (penarikan tidak membatalkan keabsahan pemrosesan sebelumnya);</li>\r\n  <li>Menunda atau membatasi pemrosesan secara proporsional;</li>\r\n  <li>Mengajukan keberatan atas pemrosesan untuk pemasaran langsung;</li>\r\n  <li>Mengajukan gugatan dan menerima ganti rugi atas pelanggaran pemrosesan sesuai peraturan perundang-undangan.</li>\r\n</ul>\r\n<p>Ajukan permintaan secara tercatat ke <a href=\"mailto:info@dntech.id\">info@dntech.id</a>. Kami akan merespons dalam jangka waktu yang wajar, pada praktiknya paling lama 3×24 jam untuk konfirmasi penerimaan dan paling lama 14 hari kerja untuk penyelesaian, kecuali peraturan mensyaratkan lain atau permintaan sangat kompleks. Kami dapat meminta verifikasi identitas agar data tidak diserahkan kepada pihak yang salah.</p>\r\n\r\n<h2>10. Keamanan dan insiden</h2>\r\n<p>Kami menerapkan pengamanan teknis dan organisasi yang wajar (enkripsi transport/HTTPS, pembatasan akses admin, sanitasi konten, dan pemantauan error) sesuai kewajiban kerahasiaan dan keamanan pada UU PDP (antara lain Pasal 35–39).</p>\r\n<p>Jika terjadi kegagalan pelindungan data pribadi, kami akan memberitahukan subjek data yang terdampak dan lembaga yang berwenang secara tertulis paling lambat 3×24 jam sejak diketahuinya kegagalan tersebut, sesuai Pasal 46 UU PDP, sepanjang pemberitahuan itu diwajibkan dan tidak dikecualikan oleh peraturan.</p>\r\n\r\n<h2>11. Anak</h2>\r\n<p>Situs ini ditujukan untuk pelaku usaha dan profesional. Kami tidak secara sengaja mengumpulkan data anak di bawah 18 tahun. Jika Anda adalah orang tua atau wali dan mengetahui data anak terkirim kepada kami, hubungi kami untuk penghapusan.</p>\r\n\r\n<h2>12. Situs dan produk pihak ketiga</h2>\r\n<p>Tautan ke produk kami (misalnya dnPeople, dnCore) atau situs lain memiliki kebijakan tersendiri. Kebijakan ini mengatur situs pemasaran DN Tech. Produk SaaS yang sudah live dapat memiliki pemberitahuan privasi tambahan di dalam aplikasi.</p>\r\n\r\n<h2>13. Perubahan</h2>\r\n<p>Perubahan material akan kami umumkan di halaman ini dengan tanggal “berlaku mulai” yang baru. Penggunaan situs setelah perubahan berarti Anda telah membaca versi terbaru.</p>\r\n\r\n<h2>14. Pengaduan</h2>\r\n<p>Selain menghubungi kami, Anda dapat menempuh upaya hukum sesuai UU PDP dan peraturan pelaksana, termasuk pengaduan kepada instansi yang berwenang di bidang pelindungan data pribadi setelah lembaga pengawas beroperasi penuh, dan/atau ke pengadilan yang berwenang di Indonesia.</p>\r\n";

export const TERMS_OF_SERVICE_HTML = "<h1>Syarat dan Ketentuan</h1>\r\n<p><strong>Berlaku mulai:</strong> 9 September 2026<br />\r\n<strong>Penyelenggara:</strong> PT. Dozer Napitupulu Technology (“DN Tech”, “kami”)</p>\r\n<p>Syarat ini mengatur penggunaan situs <a href=\"https://www.dntech.id\">www.dntech.id</a> (termasuk formulir, kuis, blog, dan materi yang kami terbitkan) serta kerangka hubungan sebelum kontrak kerja terpisah ditandatangani. Dengan mengakses situs atau mengirim formulir, Anda menyatakan telah membaca syarat ini.</p>\r\n<p>Transaksi dan persetujuan melalui sistem elektronik kami merupakan kontrak elektronik yang mengikat para pihak sebagaimana Pasal 18 Undang-Undang Nomor 11 Tahun 2008 tentang Informasi dan Transaksi Elektronik sebagaimana diubah terakhir dengan Undang-Undang Nomor 1 Tahun 2024 (“UU ITE”). Informasi elektronik dan/atau dokumen elektronik (termasuk log, email, dan hasil cetaknya) dapat menjadi alat bukti yang sah sesuai Pasal 5 UU ITE, sepanjang sistem elektronik memenuhi ketentuan yang berlaku.</p>\r\n<p>Dokumen ini adalah syarat penggunaan situs, bukan nasihat hukum, dan tidak menggantikan surat perjanjian, statement of work, atau invoice yang disepakati secara terpisah.</p>\r\n\r\n<h2>1. Pihak dan kecakapan</h2>\r\n<p>Anda menyatakan cakap melakukan perbuatan hukum (Pasal 1320 Kitab Undang-Undang Hukum Perdata) dan, jika bertindak untuk badan usaha, berwenang mewakili badan tersebut. Layanan kami ditujukan untuk kebutuhan bisnis, bukan konsumen ritel massal.</p>\r\n\r\n<h2>2. Sifat informasi di situs</h2>\r\n<p>Deskripsi produk, kisaran harga, timeline, dan studi kasus di situs bersifat informasi umum. Penawaran yang mengikat baru timbul setelah kami mengirim proposal atau kontrak tertulis (termasuk email yang secara tegas menyatakan penerimaan). Kami berhak memperbarui konten, status rilis produk, dan harga tanpa pemberitahuan sebelumnya, kecuali sudah dikunci dalam kontrak.</p>\r\n<p>Kami berupaya menyajikan informasi yang akurat. Kekeliruan ketik atau status produk yang berubah (beta, soft launch, live) dapat terjadi; status yang ditampilkan di halaman Produk adalah acuan terkini.</p>\r\n\r\n<h2>3. Layanan yang ditawarkan</h2>\r\n<p>DN Tech menyediakan, antara lain:</p>\r\n<ul>\r\n  <li>Pengembangan perangkat lunak kustom dan konsultasi teknologi;</li>\r\n  <li>Produk perangkat lunak first-party (misalnya HRIS, ERP, atau tools operasional) sesuai halaman Produk;</li>\r\n  <li>Konten edukasi, newsletter, dan formulir penjangkauan.</li>\r\n</ul>\r\n<p>Lingkup, harga, jadwal, dan penyerahan hak atas kode diatur dalam kontrak proyek. Kecuali disepakati lain secara tertulis, kode hasil proyek klien menjadi milik klien setelah pembayaran lunas; pustaka, pola, dan tools internal DN Tech tetap milik kami.</p>\r\n\r\n<h2>4. Akun admin dan keamanan</h2>\r\n<p>Akses panel administrasi hanya untuk orang yang kami tunjuk. Anda wajib menjaga kerahasiaan kredensial. Aktivitas yang dilakukan melalui akun yang sah dianggap dilakukan oleh pemegang akun, kecuali Anda segera memberitahu kami tentang penyalahgunaan.</p>\r\n\r\n<h2>5. Perilaku yang dilarang</h2>\r\n<p>Anda dilarang menggunakan situs untuk perbuatan yang melanggar hukum, termasuk ketentuan pidana dalam UU ITE, antara lain:</p>\r\n<ul>\r\n  <li>Menyebarkan informasi elektronik yang melanggar kesusilaan, menghina, atau mencemarkan nama baik secara melawan hukum;</li>\r\n  <li>Menyebarkan berita bohong yang menimbulkan keonaran, atau informasi yang menimbulkan rasa kebencian berdasarkan SARA;</li>\r\n  <li>Mengakses sistem kami secara tanpa hak, merusak, atau mengganggu (termasuk percobaan serangan, scraping agresif, atau membanjiri formulir);</li>\r\n  <li>Mengirim malware, spam, atau data pribadi pihak ketiga tanpa dasar yang sah.</li>\r\n</ul>\r\n<p>Kami dapat menolak, menghapus, atau memblokir kiriman dan akses yang kami nilai melanggar syarat ini atau hukum yang berlaku, dan melaporkan kepada aparat jika diperlukan.</p>\r\n\r\n<h2>6. Kekayaan intelektual</h2>\r\n<p>Desain, teks, merek, logo, dan kode situs DN Tech dilindungi Undang-Undang Nomor 28 Tahun 2014 tentang Hak Cipta dan peraturan merek yang berlaku. Anda tidak boleh menyalin, membingkai, atau mengeksploitasi konten secara komersial tanpa izin tertulis, kecuali kutipan wajar untuk keperluan nonkomersial dengan atribusi.</p>\r\n<p>Merek dan nama produk pihak ketiga yang disebut di situs tetap milik pemiliknya masing-masing.</p>\r\n\r\n<h2>7. Formulir, email, dan komunikasi elektronik</h2>\r\n<p>Dengan mengirim formulir atau email, Anda setuju kami menghubungi Anda terkait permintaan tersebut. Komunikasi elektronik memiliki akibat hukum sebagaimana diatur UU ITE dan PP PSTE. Jangan kirim rahasia dagang atau data pribadi berlebih melalui formulir publik; gunakan saluran yang kami tunjuk setelah NDA jika diperlukan.</p>\r\n<p>Penggunaan data pribadi diatur dalam <a href=\"/privacy\">Kebijakan Privasi</a>.</p>\r\n\r\n<h2>8. Produk SaaS dan uji coba</h2>\r\n<p>Akses ke produk perangkat lunak (termasuk versi beta) dapat tunduk pada syarat produk terpisah, ketersediaan layanan, dan batasan fitur. Kami tidak menjamin ketersediaan 100% untuk produk yang masih beta atau soft launch. Data yang Anda masukkan ke produk terpisah diatur kebijakan privasi produk tersebut.</p>\r\n\r\n<h2>9. Pembayaran dan pajak</h2>\r\n<p>Harga di situs atau percakapan awal dapat berubah sampai dikunci dalam proposal. Pembayaran mengikuti invoice. Pajak pertambahan nilai dan kewajiban perpajakan lain mengikuti peraturan Indonesia, kecuali disepakati lain secara sah.</p>\r\n<p>Keterlambatan pembayaran dapat menghentikan pekerjaan atau akses sesuai kontrak. Uang muka umumnya tidak dikembalikan untuk pekerjaan yang sudah berjalan, kecuali kontrak mengatur lain.</p>\r\n\r\n<h2>10. Garansi dan batasan tanggung jawab</h2>\r\n<p>Situs disediakan “sebagaimana adanya”. Kami tidak menjamin situs bebas gangguan atau bebas dari ketidakakuratan informatif.</p>\r\n<p>Sejauh diizinkan hukum Indonesia, tanggung jawab DN Tech atas kerugian yang timbul dari penggunaan situs (bukan dari kontrak proyek yang mengatur sendiri) dibatasi pada kerugian langsung yang terbukti, dan tidak mencakup kerugian tidak langsung, kehilangan data, atau kehilangan keuntungan. Untuk proyek berbayar, plafon tanggung jawab mengikuti kontrak (umumnya tidak melebihi nilai yang telah dibayar untuk fase yang bersangkutan), kecuali kerugian disebabkan kesengajaan atau kelalaian berat kami, atau tidak dapat dikesampingkan oleh undang-undang.</p>\r\n<p>Perbaikan bug selama periode yang disebutkan di proposal (misalnya 30 hari setelah rilis, jika ada) hanya mencakup cacat yang menyimpang dari spesifikasi yang disepakati, bukan perubahan ruang lingkup.</p>\r\n\r\n<h2>11. Ganti rugi</h2>\r\n<p>Anda bertanggung jawab atas materi yang Anda kirimkan kepada kami (termasuk klaim bahwa materi itu melanggar hak pihak ketiga) dan akan mengganti kerugian DN Tech atas klaim yang timbul dari pelanggaran syarat ini atau hukum oleh Anda, sepanjang kerugian itu tidak disebabkan kesalahan kami.</p>\r\n\r\n<h2>12. Force majeure</h2>\r\n<p>Keterlambatan atau kegagalan memenuhi kewajiban karena peristiwa di luar kendali wajar (bencana, gangguan infrastruktur nasional, pemadaman penyedia cloud utama, perubahan regulasi mendadak) bukan wanprestasi selama peristiwa itu berlangsung, dengan pemberitahuan yang wajar.</p>\r\n\r\n<h2>13. Perubahan syarat</h2>\r\n<p>Kami dapat memperbarui syarat ini. Tanggal “berlaku mulai” di atas akan diubah. Kelanjutan penggunaan situs setelah perubahan merupakan penerimaan versi baru, kecuali peraturan mensyaratkan persetujuan terpisah.</p>\r\n\r\n<h2>14. Hukum yang berlaku dan sengketa</h2>\r\n<p>Syarat ini dan penggunaan situs diatur hukum Republik Indonesia. Klausula baku pada sistem elektronik kami tunduk pada prinsip iktikad baik dan transparansi sebagaimana diamanatkan perubahan UU ITE terkait kontrak elektronik.</p>\r\n<p>Sengketa diupayakan diselesaikan secara musyawarah dalam 30 hari sejak pemberitahuan tertulis. Jika tidak tercapai, sengketa diselesaikan melalui pengadilan negeri di wilayah hukum tempat kedudukan DN Tech, tanpa mengurangi hak para pihak menempuh alternatif penyelesaian sengketa sesuai Undang-Undang Nomor 30 Tahun 1999 tentang Arbitrase dan Alternatif Penyelesaian Sengketa, jika disepakati secara tertulis.</p>\r\n\r\n<h2>15. Keterpisahan</h2>\r\n<p>Jika suatu ketentuan dinyatakan tidak sah, ketentuan lain tetap berlaku. Kegagalan kami menegakkan suatu hak bukan merupakan pengesampingan hak tersebut.</p>\r\n\r\n<h2>16. Kontak</h2>\r\n<p>PT. Dozer Napitupulu Technology<br />\r\nEmail: <a href=\"mailto:info@dntech.id\">info@dntech.id</a><br />\r\nHalaman kontak: <a href=\"/contact\">/contact</a></p>\r\n";

export const PRIVACY_POLICY_HTML_EN = `<h1>Privacy Policy</h1>
<p><strong>Effective:</strong> 9 September 2026<br />
<strong>Data controller:</strong> PT. Dozer Napitupulu Technology (&ldquo;DN Tech&rdquo;, &ldquo;we&rdquo;, &ldquo;us&rdquo;)</p>
<p>This policy explains how we process the personal data of visitors and prospective clients of <a href="https://www.dntech.id">www.dntech.id</a> and the subdomains we operate. It is written to give you the information you are entitled to receive before or at the point your data is collected, in line with Article 21 of Law No. 27 of 2022 on Personal Data Protection (Undang-Undang Nomor 27 Tahun 2022 tentang Pelindungan Data Pribadi, the &ldquo;PDP Law&rdquo;).</p>
<p>This is a company policy, not legal advice. If the applicable regulations change, we will update it.</p>

<h2>1. Legal basis</h2>
<p>DN Tech processes personal data under:</p>
<ul>
  <li>Law No. 27 of 2022 on Personal Data Protection (UU PDP);</li>
  <li>Law No. 11 of 2008 on Electronic Information and Transactions, as last amended by Law No. 1 of 2024 (&ldquo;UU ITE&rdquo;), including Article 26 on the use of personal data in electronic media;</li>
  <li>Government Regulation No. 71 of 2019 on the Implementation of Electronic Systems and Transactions (&ldquo;PP PSTE&rdquo;).</li>
</ul>
<p>Depending on the context, we rely on the following grounds under Article 20(2) of the PDP Law:</p>
<ul>
  <li><strong>Explicit consent</strong> &mdash; for example newsletter subscriptions, non-essential analytics cookies, and the consent checkbox on our contact forms;</li>
  <li><strong>Performance of a contract or pre-contractual steps</strong> &mdash; following up on consultation requests, proposals, or engagement agreements;</li>
  <li><strong>Legal obligation</strong> &mdash; such as tax and accounting records;</li>
  <li><strong>Legitimate interest</strong> &mdash; site security, spam and bot prevention, and service improvement, where this does not override your rights.</li>
</ul>

<h2>2. Identity of the data controller</h2>
<ul>
  <li><strong>Name:</strong> PT. Dozer Napitupulu Technology</li>
  <li><strong>Trading name:</strong> DN Tech</li>
  <li><strong>Email:</strong> <a href="mailto:info@dntech.id">info@dntech.id</a></li>
  <li><strong>Data subject requests:</strong> <a href="mailto:info@dntech.id">info@dntech.id</a> with the subject line &ldquo;Personal Data Request&rdquo;</li>
</ul>
<p>The office address shown on our Contact page or in the site settings, where provided, is our correspondence address.</p>

<h2>3. Data we collect</h2>
<p>We do not sell personal data. We process only what is needed for the purposes below (data minimisation).</p>
<h3>3.1 Data you give us</h3>
<ul>
  <li>Name, email address, phone number, company name;</li>
  <li>Project type, services of interest, budget range, timeline, and the content of your message;</li>
  <li>Email address for the newsletter;</li>
  <li>Answers to the &ldquo;find your solution&rdquo; quiz (business needs, not sensitive data);</li>
  <li>Job applications (CV and whatever you send to our careers address), where applicable;</li>
  <li>Chat transcripts (Crisp), if the chat widget is enabled.</li>
</ul>
<h3>3.2 Data recorded automatically</h3>
<ul>
  <li>IP address, browser type, device, pages visited, and visit times;</li>
  <li>Server logs and error events (including Sentry, where enabled);</li>
  <li>Traffic measurement via Google Analytics / Google Tag Manager, if a measurement ID is configured;</li>
  <li>Session cookies required for the site to work (including the httpOnly authentication cookie for the admin panel).</li>
</ul>
<p>We do <strong>not</strong> knowingly collect the specific categories of personal data referred to in Article 4(2) of the PDP Law (for instance health data, biometrics, or full credit card details) through this marketing site. Please do not send that kind of data through our public forms.</p>

<h2>4. Purposes of processing</h2>
<ul>
  <li>Answering enquiries, scheduling consultations, and preparing proposals;</li>
  <li>Sending the newsletter or materials you asked for, and handling subscription confirmations;</li>
  <li>Operating, securing, and improving the website;</li>
  <li>Understanding which pages are useful (aggregate analytics);</li>
  <li>Meeting legal obligations and resolving disputes;</li>
  <li>Processing job applications.</li>
</ul>
<p>We do not use your data for automated decision-making that produces legal effects for you (Article 10 of the PDP Law).</p>

<h2>5. Retention periods</h2>
<ul>
  <li><strong>Leads / contact forms:</strong> for the duration of the proposal and the engagement, then up to 5 years for accounting and claims purposes, unless you ask for earlier deletion and no legal obligation requires us to keep the data;</li>
  <li><strong>Newsletter:</strong> until you unsubscribe or withdraw consent;</li>
  <li><strong>Technical logs:</strong> generally up to 90 days, longer only where a security incident requires it;</li>
  <li><strong>Job applications:</strong> up to 12 months after the recruitment process closes, unless agreed otherwise;</li>
  <li><strong>Client contract data:</strong> for the contract term and any applicable record-keeping obligations.</li>
</ul>

<h2>6. Recipients and processors</h2>
<p>Data may be processed by us and by the parties that support our operations, including:</p>
<ul>
  <li>Hosting, transactional email, and cloud infrastructure providers;</li>
  <li>Google (Analytics / Tag Manager) where analytics is enabled;</li>
  <li>Sentry for error monitoring, where enabled;</li>
  <li>Crisp Chat for conversations, where enabled;</li>
  <li>Consultants or subcontractors bound by confidentiality, strictly as needed for your project.</li>
</ul>
<p>These parties act as processors or as independent controllers depending on their role. We require reasonable safeguards under contract and under the PDP Law.</p>

<h2>7. Transfers outside Indonesia</h2>
<p>Some of the services above may store or process data on servers outside Indonesia. Where a cross-border transfer takes place, we work to ensure an equivalent level of protection as required by Chapter V of the PDP Law &mdash; through assessment of the destination country, contractual terms, and technical safeguards.</p>

<h2>8. Cookies</h2>
<ul>
  <li><strong>Essential:</strong> cookies that maintain sessions, security, and core site functions. Basis: legitimate interest / performance of the service.</li>
  <li><strong>Analytics:</strong> Google Analytics measures visits. Basis: consent or legitimate interest in statistics, depending on the configuration we deploy. You can block cookies through your browser settings.</li>
</ul>
<p>Third-party chat cookies (Crisp) are only set if the chat widget loads.</p>

<h2>9. Your rights as a data subject</h2>
<p>Under Articles 6 to 13 of the PDP Law, your rights include:</p>
<ul>
  <li>Obtaining information about the controller&rsquo;s identity, the legal basis, the purposes, and the processing of your data;</li>
  <li>Completing, updating, and/or correcting inaccurate data;</li>
  <li>Accessing and obtaining a copy of your data in a commonly used format;</li>
  <li>Ending the processing, deleting, and/or destroying your data as provided by law;</li>
  <li>Withdrawing consent (withdrawal does not affect the lawfulness of processing carried out beforehand);</li>
  <li>Postponing or restricting processing on a proportionate basis;</li>
  <li>Objecting to processing for direct marketing;</li>
  <li>Bringing a claim and receiving compensation for unlawful processing, in accordance with applicable regulations.</li>
</ul>
<p>Send requests in writing to <a href="mailto:info@dntech.id">info@dntech.id</a>. We respond within a reasonable period &mdash; in practice within 3&times;24 hours to acknowledge receipt and within 14 business days to resolve the request, unless the regulations require otherwise or the request is unusually complex. We may ask you to verify your identity so that data is not disclosed to the wrong person.</p>

<h2>10. Security and incidents</h2>
<p>We apply reasonable technical and organisational safeguards (transport encryption/HTTPS, restricted admin access, content sanitisation, and error monitoring) consistent with the confidentiality and security obligations of the PDP Law, including Articles 35&ndash;39.</p>
<p>If a personal data breach occurs, we will notify the affected data subjects and the competent authority in writing no later than 3&times;24 hours from the moment the breach becomes known to us, in accordance with Article 46 of the PDP Law, where such notification is required and not otherwise exempted.</p>

<h2>11. Children</h2>
<p>This site is intended for businesses and professionals. We do not knowingly collect data from children under 18. If you are a parent or guardian and believe a child&rsquo;s data has been sent to us, contact us and we will delete it.</p>

<h2>12. Third-party sites and products</h2>
<p>Links to our products (such as dnPeople or dnCore) or to other websites are governed by their own policies. This policy covers the DN Tech marketing site. SaaS products that are already live may carry additional privacy notices inside the application.</p>

<h2>13. Changes</h2>
<p>We will announce material changes on this page with a new &ldquo;effective&rdquo; date. Continuing to use the site after a change means you have read the current version.</p>

<h2>14. Complaints</h2>
<p>In addition to contacting us, you may pursue the remedies available under the PDP Law and its implementing regulations, including a complaint to the authority competent for personal data protection once the supervisory body is fully operational, and/or to the competent courts in Indonesia.</p>
`;

export const TERMS_OF_SERVICE_HTML_EN = `<h1>Terms of Service</h1>
<p><strong>Effective:</strong> 9 September 2026<br />
<strong>Operator:</strong> PT. Dozer Napitupulu Technology (&ldquo;DN Tech&rdquo;, &ldquo;we&rdquo;, &ldquo;us&rdquo;)</p>
<p>These terms govern your use of <a href="https://www.dntech.id">www.dntech.id</a> (including the forms, quiz, blog, and materials we publish) and the framework of our relationship before a separate engagement agreement is signed. By accessing the site or submitting a form, you confirm that you have read these terms.</p>
<p>Transactions and agreements concluded through our electronic systems constitute electronic contracts binding on the parties under Article 18 of Law No. 11 of 2008 on Electronic Information and Transactions, as last amended by Law No. 1 of 2024 (&ldquo;UU ITE&rdquo;). Electronic information and/or electronic documents (including logs, emails, and printouts of them) may serve as lawful evidence under Article 5 of the UU ITE, provided the electronic system meets the applicable requirements.</p>
<p>This document sets out the terms of use for the website. It is not legal advice, and it does not replace any separately agreed engagement letter, statement of work, or invoice.</p>

<h2>1. Parties and capacity</h2>
<p>You confirm that you have the legal capacity to enter into agreements (Article 1320 of the Indonesian Civil Code, Kitab Undang-Undang Hukum Perdata) and, if acting for a company, that you are authorised to represent it. Our services are aimed at business needs, not at mass retail consumers.</p>

<h2>2. Nature of the information on this site</h2>
<p>Product descriptions, price ranges, timelines, and case studies on this site are general information. A binding offer only arises once we send a written proposal or contract (including an email that expressly states acceptance). We may update content, product release status, and pricing without prior notice, except where they are already fixed in a contract.</p>
<p>We work to keep the information accurate. Typographical errors and changing product status (beta, soft launch, live) can occur; the status shown on the Products page is the current reference.</p>

<h2>3. Services offered</h2>
<p>DN Tech provides, among other things:</p>
<ul>
  <li>Custom software development and technology consulting;</li>
  <li>First-party software products (such as HRIS, ERP, or operational tools) as listed on the Products page;</li>
  <li>Educational content, a newsletter, and outreach forms.</li>
</ul>
<p>Scope, pricing, schedule, and the transfer of rights in the code are governed by the project contract. Unless agreed otherwise in writing, code produced for a client project becomes the client&rsquo;s property once payment is settled in full; DN Tech&rsquo;s internal libraries, patterns, and tooling remain ours.</p>

<h2>4. Admin accounts and security</h2>
<p>Access to the administration panel is limited to people we designate. You must keep your credentials confidential. Activity carried out through a valid account is treated as the account holder&rsquo;s, unless you notify us promptly of misuse.</p>

<h2>5. Prohibited conduct</h2>
<p>You must not use the site for unlawful purposes, including conduct criminalised by the UU ITE, such as:</p>
<ul>
  <li>Distributing electronic information that is obscene, insulting, or unlawfully defamatory;</li>
  <li>Spreading false information that causes public unrest, or content inciting hatred on grounds of ethnicity, religion, race, or intergroup relations (SARA);</li>
  <li>Accessing our systems without authorisation, damaging or disrupting them (including attempted attacks, aggressive scraping, or flooding our forms);</li>
  <li>Sending malware, spam, or third-party personal data without a lawful basis.</li>
</ul>
<p>We may refuse, remove, or block submissions and access that we consider to breach these terms or the law, and report the matter to the authorities where necessary.</p>

<h2>6. Intellectual property</h2>
<p>The design, text, trade marks, logos, and code of the DN Tech website are protected by Law No. 28 of 2014 on Copyright and by applicable trade mark regulations. You may not copy, frame, or commercially exploit the content without written permission, except for fair quotation for non-commercial purposes with attribution.</p>
<p>Third-party trade marks and product names mentioned on the site remain the property of their respective owners.</p>

<h2>7. Forms, email, and electronic communication</h2>
<p>By submitting a form or sending an email, you agree that we may contact you about that request. Electronic communications carry the legal effects set out in the UU ITE and PP PSTE. Please do not send trade secrets or excessive personal data through public forms; use the channel we designate after an NDA where that is needed.</p>
<p>Use of personal data is governed by our <a href="/privacy">Privacy Policy</a>.</p>

<h2>8. SaaS products and trials</h2>
<p>Access to our software products (including beta versions) may be subject to separate product terms, service availability, and feature limitations. We do not guarantee 100% availability for products still in beta or soft launch. Data you enter into a separate product is governed by that product&rsquo;s privacy policy.</p>

<h2>9. Payment and taxes</h2>
<p>Prices quoted on the site or in early conversations may change until they are fixed in a proposal. Payment follows the invoice. Value added tax and other tax obligations follow Indonesian regulations, unless lawfully agreed otherwise.</p>
<p>Late payment may suspend work or access in accordance with the contract. Deposits are generally non-refundable for work already performed, unless the contract provides otherwise.</p>

<h2>10. Warranties and limitation of liability</h2>
<p>The site is provided &ldquo;as is&rdquo;. We do not warrant that it will be uninterrupted or free of informational inaccuracies.</p>
<p>To the extent permitted by Indonesian law, DN Tech&rsquo;s liability for loss arising from use of the site (as distinct from a project contract, which governs itself) is limited to proven direct loss and excludes indirect loss, loss of data, and loss of profit. For paid projects, the liability cap follows the contract &mdash; usually not exceeding the amount paid for the relevant phase &mdash; except where the loss results from our wilful misconduct or gross negligence, or where liability cannot be excluded by law.</p>
<p>Bug fixing during the period stated in the proposal (for example 30 days after release, where applicable) covers only defects that deviate from the agreed specification, not changes of scope.</p>

<h2>11. Indemnity</h2>
<p>You are responsible for the materials you send us (including any claim that they infringe third-party rights) and will indemnify DN Tech against claims arising from your breach of these terms or of the law, to the extent the loss was not caused by our own fault.</p>

<h2>12. Force majeure</h2>
<p>Delay or failure to perform caused by events beyond reasonable control (natural disaster, national infrastructure failure, an outage at a major cloud provider, sudden regulatory change) is not a default for as long as the event continues, provided reasonable notice is given.</p>

<h2>13. Changes to these terms</h2>
<p>We may update these terms. The &ldquo;effective&rdquo; date above will be revised. Continued use of the site after a change constitutes acceptance of the new version, unless the regulations require separate consent.</p>

<h2>14. Governing law and disputes</h2>
<p>These terms and your use of the site are governed by the law of the Republic of Indonesia. Standard clauses in our electronic systems are subject to the principles of good faith and transparency mandated by the amendments to the UU ITE on electronic contracts.</p>
<p>The parties will first attempt to settle disputes amicably within 30 days of written notice. Failing that, disputes are resolved by the district court with jurisdiction over DN Tech&rsquo;s domicile, without prejudice to the parties&rsquo; right to pursue alternative dispute resolution under Law No. 30 of 1999 on Arbitration and Alternative Dispute Resolution, where agreed in writing.</p>

<h2>15. Severability</h2>
<p>If any provision is held invalid, the remaining provisions stay in force. Our failure to enforce a right is not a waiver of that right.</p>

<h2>16. Contact</h2>
<p>PT. Dozer Napitupulu Technology<br />
Email: <a href="mailto:info@dntech.id">info@dntech.id</a><br />
Contact page: <a href="/contact">/contact</a></p>
`;

/** Pick the built-in legal copy matching the active locale. */
export function getLegalFallback(kind: 'privacy' | 'terms', locale: string): string {
  if (kind === 'privacy') {
    return locale === 'en' ? PRIVACY_POLICY_HTML_EN : PRIVACY_POLICY_HTML;
  }
  return locale === 'en' ? TERMS_OF_SERVICE_HTML_EN : TERMS_OF_SERVICE_HTML;
}

/**
 * Legal copy is stored as HTML (CMS or the fallbacks above), so its internal
 * links are plain root-relative paths. Prefix them with the active locale so a
 * reader on /en/terms stays on the English side of the site.
 */
export function localizeLegalLinks(html: string, locale: string): string {
  return html.replace(/href="\/(?!\/)/g, `href="/${locale}/`);
}
