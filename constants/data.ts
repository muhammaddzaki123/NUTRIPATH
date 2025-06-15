import images from "./images";

// src/data/diseaseData.ts

export interface DiseaseInfo {
  title: string;
  description: string;
}

export interface DiseaseInformation {
  [key: string]: DiseaseInfo;
}

export const diseaseInformation: DiseaseInformation = {
  hipertensi: {
    title: "Hipertensi",
    description: `Hipertensi, atau tekanan darah tinggi, adalah kondisi di mana tekanan darah dalam tubuh melebihi batas normal. Kondisi ini sering disebut sebagai "silent killer" atau pembunuh diam-diam karena biasanya tidak menunjukkan gejala yang jelas, namun dapat menyebabkan komplikasi serius seperti serangan jantung, stroke, dan kerusakan organ lainnya jika tidak ditangani dengan baik.

penyebab :
1. Hipertensi Primer (Esensial)
Hipertensi primer adalah jenis yang paling umum, mencakup sekitar 90–95% kasus. Penyebab pastinya tidak diketahui, namun faktor-faktor seperti gaya hidup tidak sehat (misalnya konsumsi garam berlebih, kurang olahraga, stres), kelebihan berat badan, dan faktor genetik diduga berperan dalam perkembangannya.
2. Hipertensi Sekunder
Hipertensi sekunder terjadi akibat kondisi medis tertentu, seperti penyakit ginjal, gangguan pada kelenjar adrenal atau tiroid, sleep apnea, serta penggunaan obat-obatan tertentu (misalnya pil KB atau obat antiinflamasi nonsteroid). ~Jenis ini lebih jarang terjadi, mencakup sekitar 5–10% kasus.

Gejala Umum Hipertensi:
-Sakit kepala berulang, terutama di bagian belakang kepala.
-Pusing atau sensasi berputar.
-Rasa berat di tengkuk.
-Telinga berdenging (tinnitus).
-Mata berkunang-kunang atau pandangan kabur.
-Mudah lelah meskipun melakukan aktivitas ringan.
-Sesak napas.
-Mimisan tanpa sebab yang jelas.
-Wajah memerah atau bercak merah pada mata.
-Jantung berdebar atau detak jantung tidak teratur.
-Sulit tidur atau insomnia.
-Mual atau muntah.
-Sering buang air kecil di malam hari (nokturia).
-Gangguan penglihatan atau kehilangan penglihatan sementara.
-Lumpuh sementara pada satu sisi tubuh (hemiplegia).

Faktor Risiko : Faktor Risiko yang Tidak Dapat Diubah
-Usia: Semakin bertambah usia, risiko hipertensi meningkat karena elastisitas pembuluh darah menurun.
-Jenis Kelamin: Pria cenderung lebih berisiko pada usia muda hingga paruh baya, sedangkan wanita lebih berisiko setelah menopause.
-Genetik (Riwayat Keluarga): Memiliki anggota keluarga dengan hipertensi meningkatkan risiko seseorang untuk mengalami kondisi serupa.

Faktor Risiko yang Dapat Diubah
-Merokok: Zat dalam rokok merusak pembuluh darah dan meningkatkan tekanan darah.
Konsumsi Garam Berlebih: Asupan natrium yang tinggi dapat menyebabkan retensi cairan dan peningkatan tekanan darah.
-Diet Rendah Serat dan Tinggi Lemak: Pola makan tidak sehat dapat meningkatkan berat badan dan risiko hipertensi.
-Kurang Aktivitas Fisik: Kurangnya olahraga dapat menyebabkan obesitas dan tekanan darah tinggi.
-Stres: Stres kronis dapat memicu peningkatan tekanan darah melalui aktivasi sistem saraf simpatis.
-Konsumsi Alkohol Berlebihan: Alkohol dapat meningkatkan tekanan darah dan merusak organ tubuh.
-Dislipidemia: Kadar kolesterol yang tidak normal dapat menyebabkan penyempitan pembuluh darah dan hipertensi.`
  },
  diabetes: {
    title: "Diabetes",
    description: `Menurut Word Health Organization (WHO), diabetes adalah penyakit kronis yang terjadi ketika pankreas tidak memproduksi insulin dalam jumlah cukup atau ketika tubuh tidak dapat menggunakan insulin yang diproduksinya secara efektif. Insulin adalah hormon yang mengatur glukosa darah. Hiperglikemia, yang juga disebut peningkatan glukosa darah atau gula darah, efek umum dari diabetes yang tidak terkontrol adalah seiring waktu akan menyebabkan kerusakan serius pada banyak sistem tubuh, terutama pada saraf dan pembuluh darah. gejala yang sering terjadi pada penderita seperti ,Poliuri (sering buang air kecil),Poliuri (sering buang air kecil),Polifagi (cepat merasa lapar). Pasien DM perlu diberikan penekanan mengenai pentingnya keteraturan jadwal makan, jenis dan jumlah kandungan kalori, terutama pada mereka yang menggunakan obat yang meningkatkan sekresi insulin atau terapi insulin itu sendiri. adapun makanan yang dihindari yaitu gula pasir, gula jawa, susu kental manis, minuman botol manis, es krim, kue-kue manis, dodol, cake, makanan siap saji/ fast food, goreng-gorengan, ikan asin, telur asin dan makanan yang diawetkan harus dihindari untuk penderita Diabetes Melitus.serta penderita diabetes melitus perlu membatasi makanan seperti Nasi, roti, mie, kentang, singkong, ubi dan sagu, ikan, ayam tanpa kulit, susu skim, tempe, tahu dan kacang-kacangan, dalam jumlah terbatas yaitu bentuk makananyang mudah dicerna. Makanan terutama yang diolah dengan cara dipanggang, dikukus, direbus, disetup dan dibakar.`
  },
  kanker: {
    title: "Kanker",
    description: `Kanker adalah sebuah istilah untuk penyakit yang dimana sel abnormal membelah tanpa kendali dan dapat menyerang jaringan di sekitarnya.Menurut data Global Burden of Cancer (Globocan) yang dirilis oleh WHO, di Indonesia terdapat 396.914 kasus kanker baru dengan 234.511 kematian yang disebabkan oleh kanker (KEMENKES RI, 2024).

beberapa tahapan kanker tertentu, yaitu :
1) Tahap awal memasuki stadium satu yaitu kanker telah masuk ke lapisan sekitarnya. 
2) Tahap lanjut atau stadium lanjut apabila kanker memasuki stadium tiga. 
3) Tahap akhir atau disebut kanker stadium akhir apabila telah masuk pada stadium empat. 

Faktor penyebab kanker :
1) Perilaku merokok.
2) Kurangnya aktivitas fisik.
3) Kelebihan berat badan hingga obesitas.
4) Konsumsi alkohol berlebihan
5) Penularan human papilloma virus (HPV)

Kanker payudara adalah sel-sel yang ganas yang bermula dari sel kelenjar, jaringan penunjang payudara, saluran kelenjar namun tidak termasuk kulit payudara.
- Tingkatan stadium kanker yaitu terdiri dari 4 stadium kanker.
- penyebab terjadinya kanker payudara seperti : faktor genetic,  hormonal, dan dari lingkungan. Perubahan pada genetik ini bisa terjadi karena perubahan atau mutasi dalam gen normal, juga pengaruh kondisi protein yang menekan atau menigkatkan perkembangan ca mammae.
- Pemicu Awal (Inisiasi)
Senyawa karsinogenik seperti Benzo(a)pyrene merupakan prekarsinogen yang diaktifkan oleh enzim sitokrom P450 menjadi karsinogen aktif.
- Karsinogen aktif bersifat sangat reaktif dan menyerang DNA, RNA, dan protein, menyebabkan mutasi genetik, khususnya mutasi pada gen p53.
- Gen p53 berfungsi sebagai penekan tumor. Mutasi gen ini menghasilkan protein p53 mutan yang gagal menghentikan proliferasi sel abnormal.
- Perkembangan Penyakit
Akumulasi protein p53 mutan dalam jaringan dan serum darah pasien kanker menunjukkan adanya kerusakan seluler dan progresivitas tumor.
Protein ini dapat digunakan sebagai biomarker awal tumor karena kadarnya meningkat seiring tingkat keparahan kanker.
- Manifestasi Klinis
Tahap awal: Asimptomatik.
Tahap lanjut: Benjolan payudara, kulit seperti kulit jeruk, retraksi puting, nyeri, dan keluarnya cairan berdarah dari puting.
Keterlibatan nodul limfa: Nodul menjadi keras dan membesar (aksilaris/supraklavikula).
- Metastasis: Gejala sistemik seperti penurunan berat badan, nyeri tulang, batuk menetap, gangguan penglihatan, dan sakit kepala.
Prognosis dan Deteksi Dini
Ukuran tumor berkorelasi dengan risiko metastasis (semakin kecil, semakin rendah risiko).
- Deteksi dini penting untuk efektivitas pengobatan, efisiensi biaya, dan peluang kesembuhan yang lebih tinggi.

- Teori Inisiasi Kanker
1. Teori sel induk kanker: Semua subtipe tumor berasal dari sel batang/progenitor yang mengalami mutasi genetik atau epigenetik.
2. Teori stokastik: Setiap sel di jaringan payudara (induk, progenitor, atau terdiferensiasi) berpotensi menjadi tumor akibat akumulasi mutasi acak.

- Penatalaksanan farmakologi kanker :
1. Pembedahan
2. Kemoterapi
3. Terapi Radiasi
4. Adjuvant

Syarat Diet :
1. Energi tinggi:
36 kkal/kg BB (laki-laki), 32 kkal/kg BB (perempuan).
Bila kurang gizi: 40 kkal/kg BB (laki-laki), 36 kkal/kg BB (perempuan).
2. Protein tinggi:
1–1,5 g/kg BB.
Sumber: ikan, dada ayam, almond, dll.
3. Lemak sedang:
15–20% dari kebutuhan energi.
Sumber: ikan, daging sapi, ayam, domba.
4. Karbohidrat cukup:
Sebagai sumber energi utama.
Sumber: beras, gandum, dll.
5. Vitamin cukup:
Terutama vitamin A, C, E, dan K untuk metabolisme dan antioksidan.
6. Mineral cukup:
Terutama Fe, Zn, dan Na untuk metabolisme dan penyembuhan luka.
7. Serat cukup:
25 g/hari.
Sumber: pepaya, kiwi, pir, apel, dll.
8. Cairan cukup:
100 cc/kg BBI/hari untuk mencegah dehidrasi.

9. Makan Porsi kecil, frekuensi sering (3 kali makan utama + 2 selingan).
10. Tekstur bertahap:
Disesuaikan dengan kondisi pasien: cair → lunak → biasa.
Khusus:
11. Rendah iodium saat terapi radioaktif.
Makanan steril jika imunitas rendah atau kemoterapi agresif.

C. Jenis Diet dan Indikasi
Disesuaikan secara individual sesuai kondisi dan kemampuan pasien.
- Bentuk pemberian: oral, enteral, atau parenteral.
Konsistensi: makanan padat, cair, atau kombinasi (biasa, lunak, lumat).
Status gizi baik membantu mencegah komplikasi terapi kanker

              KEPATUHAN DIET
Kepatuhan adalah sebuah perilaku dalam mengikuti saran medis atau kesehatan. Kepatuhan dalam treatment sangat diperlukan terutama pada penyakit kronis.
Perencanaan Kepatuhan Diet
(1) Terapi diet rendah lemak 
(2) Terapi diet dengan puasa 
(3) Terapi suplementasi diet`
  }
};

export const features = [
  {
    title: "Recall Asupan 24 Jam",
    description:
      "Recall asupan 24 jam adalah fitur yang berfungsi melakukan pencatatan asupan makan selama 24 jam, untuk mengetahui dampak dari makanan tersebut terhadap kesehatan.",
      image :  images.asupan,
  },
  {
    title: "Artikel Gizi",
    description:
      "Artikel gizi adalah fitur yang berisikan artikel-artikel gizi terkini yang selalu di up-date, yang bisa anda baca untuk menambah pengetahuan.",
      image :  images.artikel,
  },
  {
    title: "Diet Plan",
    description:
      "Diet plan adalah fitur diet yang dapat digunakan untuk menghitung kebutuhan kalori harian anda, serta melihat standar menu diet berdasarkan penyakit anda.",
    image :  images.diet,
  },
  {
    title: "Konsultasi Gizi",
    description:
      "Konsultasi gizi adalah fitur konsultasi langsung dengan ahli gizi guna mengkomunikasikan masalah gizi anda dan tindak lanjut solusi diet anda.",
    image: images.konsultasi,
  },
  {
    title: "Kalkulator Gizi",
    description:
      "Kalkulator gizi adalah fitur untuk mengetahui status gizi anda serta menghitung berat badan ideal anda.",
    image: images.kalkulator,
  },
];
