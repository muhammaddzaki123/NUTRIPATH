// constants/data.ts

import images from "./images";

// Interface untuk setiap bagian konten
export interface ContentBlock {
  type: 'heading' | 'paragraph' | 'list' | 'table';
  data: any;
}

// Interface untuk informasi penyakit
export interface DiseaseInfo {
  title: string;
  content: ContentBlock[];
}

export interface DiseaseInformation {
  [key:string]: DiseaseInfo;
}

export const diseaseInformation: DiseaseInformation = {
  hipertensi: {
    title: "Hipertensi",
    content: [
      { type: 'heading', data: 'Klasifikasi Hipertensi berdasarkan JNC 7' },
      { type: 'table', data: {
        headers: ['Kategori Tekanan Darah', 'TDS (mmHg)', '', 'TDD (mmHg)'],
        rows: [
          ['Normal', '<120', 'dan', '>80'],
          ['Pra-hipertensi', '120 – 139', 'atau', '80 – 89'],
          ['Hipertensi tingkat 1', '140 – 159', 'atau', '90 – 99'],
          ['Hipertensi tingkat 2', '>160', 'atau', '>100'],
          ['Hipertensi sistolik terisolasi', '>140', 'dan', '<90']
        ]
      }},
      { type: 'heading', data: 'Anjuran Bahan Makanan' },
      { type: 'table', data: {
        headers: ['Bahan Makanan', 'Dianjurkan', 'Tidak Dianjurkan'],
        rows: [
          ['Sumber Karbohidrat', 'beras terutama beras tum- buk/beras merah, pasta, ma- karoni, roti tinggi serat (whole wheat bread), cereal, ubi, ken- tang, kue buatan sendiri dengan menggunakan sedikit minyak/lemak tak jenuh', 'produk makanan jadi: pie, cake, croissant, pastries, bis- kuit, krekers berlemak, dan kue-kue berlemak lain.'],
          ['Sumber Protein Hewani', 'ikan, unggas tanpa kulit, daging kurus, putih telur, susu skim, yoghurt rendah lemak, dan keju rendah lemak.', 'daging gemuk, daging kam- bing, daging babi, jeroan, otak, sosis, sardin, kuning telur (batasi hingga 3 btr/ minggu), susu whole, susu kental manis, krim, yoghurt dari susu penuh, keju, dan es krim'],
          ['Sumber Protein Nabati', 'Tempe Tahu dan kacang kacangan', 'dimasak dengan santan dan digoreng dengan minyak jenuh, seperti kelapa dan kelapa sawit.'],
          ['Sayuran', 'semua sayur dalam bentuk segar, direbus, dikukus, di- setup, ditumis menggunakan minyak jagung, minyak kedelai atau margarin tanpa garam yang dibuat dari minyak tidak jenuh ganda; dimasak dengan santan encer.', 'sayuran yang dimasak dengan mentega, minyak ke lapa atau minyak kelapa sawit dan santan kental.'],
          ['Buah', 'Semua buah dalam keadaan segar dan jus', 'Buah yang diawet dengan gula seperti buah kaleng dan buah kering'],
          ['Sumber Lemak', 'minyak jagung, kedelai, ka- cang tanah, bunga matahari dan wijen; margarin tanpa garam yang dibuat dari mi nyak tidak jenuh ganda; mayones dan salad dressing tanpa garam yang dibuat dari mi- nyak tidak jenuh ganda.', 'minyak kelapa dan minyak kelapa sawit; mentega, margarin, kelapa, santan, krim, lemak babi/lard, bacon, cocoa mentega, mayones dan dressing dibuat dengan telur.'],
          ['Lemak', 'Minyak Goreng, Margarin, dan mentega tanpa garam', 'Margarin dan mentega biasa'],
          ['Minuman', 'Teh, kopi', 'Minuman ringan'],
          ['Bumbu', 'semua bumbu-bumbu ke- ring yang tidak mengan- dung garam dapur dan lain ikatan natrium. Garam dapur sesuai ketentuan untuk Diet Garam Rendah II dan III.', 'garam dapur untuk Diet Garam Rendah I, baking powder, soda kue, vetsin, dan bumbu-bumbu yang me- ngandung garam dapur se- perti: kecap, terasi, maggi, tomato ketchup, petis, dan tauco']
        ]
      }},
      { type: 'heading', data: 'Syarat Diet Penderita Hipertensi' },
      { type: 'list', data: [
        'Energi cukup, jika pasien dengan berat badan 115% dari berat badan ideal disarankan untuk diet rendah kalori dan olahraga.',
        'Protein cukup, menyesuaikan dengan kebutuhan pasien.',
        'Karbohidrat cukup, menyesuaikan dengan kebutuhan pasien.',
        'Membatasi konsumsi lemak jenuh dan kolesterol.',
        'Asupan Natrium dibatasi <2300 mg/hari, jika penurunan tekanan darah belum mencapai target dibatasi hingga mencapai 1500 mg/hari.',
        'Konsumsi kalium >4700 mg/hari, terdapat hubungan antara peningkatan asupan kalium dan penurunan asupan rasio Na-K dengan penurunan tekanan darah.',
        'Memenuhi kebutuhan asupan kalsium harian sesuai usia untuk membantu penurunan tekanan darah, asupan kalsium >800 mg/hari dapat menurunkan tekanan darah sistolik hingga 4 mmHg dan 2 mmHg tekanan darah diastolik.',
        'Asupan magnesium memenuhi kebutuhan harian serta dapat ditambah dengan suplementasi magnesium 240-1000 mg/hari dapat menurunkan tekanan darah sistolik 1,0-5,6 mmHg.'
      ]}
    ]
  },
  diabetes: {
    title: "Diabetes",
    content: [
      { type: 'paragraph', data: 'Menurut Word Health Organization (WHO), diabetes adalah penyakit kronis yang terjadi ketika pankreas tidak memproduksi insulin dalam jumlah cukup atau ketika tubuh tidak dapat menggunakan insulin yang diproduksinya secara efektif. Insulin adalah hormon yang mengatur glukosa darah. Hiperglikemia, yang juga disebut peningkatan glukosa darah atau gula darah, efek umum dari diabetes yang tidak terkontrol adalah seiring waktu akan menyebabkan kerusakan serius pada banyak sistem tubuh, terutama pada saraf dan pembuluh darah.' },
      { type: 'heading', data: 'Gejala Umum' },
      { type: 'list', data: [
        'Poliuri (sering buang air kecil)',
        'Polidipsi (sering merasa haus)',
        'Polifagi (cepat merasa lapar)'
      ]},
      { type: 'paragraph', data: 'Pasien DM perlu diberikan penekanan mengenai pentingnya keteraturan jadwal makan, jenis dan jumlah kandungan kalori. Makanan yang perlu dihindari antara lain gula pasir, gula jawa, susu kental manis, minuman botol manis, es krim, kue-kue manis, dodol, dan makanan siap saji.'},
      { type: 'paragraph', data: 'Penderita diabetes melitus perlu membatasi makanan seperti Nasi, roti, mie, kentang, dan lainnya dalam jumlah terbatas. Makanan sebaiknya diolah dengan cara dipanggang, dikukus, direbus, atau dibakar.'}
    ]
  },
  kanker: {
    title: "Kanker",
    content: [
      { type: 'heading', data: 'Apa Itu Kanker?' },
      { type: 'paragraph', data: 'Kanker merupakan sebuah penyakit akibat pertumbuhan sel tubuh yang tidak terkendali, dapat menyebar ke jaringan sekitarnya dan bahkan ke organ tubuh lain melalui darah atau getah bening. Kanker bisa menyerang siapa saja dan penyebabnya sangat kompleks, melibatkan faktor genetik, lingkungan, gaya hidup, hingga infeksi tertentu.' },
      { type: 'heading', data: 'Kejadian Kanker' },
      { type: 'paragraph', data: 'Secara global, lebih dari setengah kematian akibat kanker terjadi di Asia. Di Indonesia, tahun 2024 tercatat hampir 400 ribu kasus baru. Di NTB, sekitar 0,8 dari setiap 1.000 penduduk didiagnosis kanker.' },
      { type: 'heading', data: 'Tahapan Kanker' },
      { type: 'list', data: [
        'Stadium 1–2: terbatas pada jaringan sekitar.',
        'Stadium 3: menyebar ke kelenjar getah bening.',
        'Stadium 4: menyebar ke organ tubuh atau jaringan lain.'
      ]},
      { type: 'heading', data: 'Penyebab Kanker' },
      { type: 'list', data: [
        'Mutasi gen bawaan (misalnya BRCA1/2)',
        'Paparan sinar UV, polusi, zat kimia berbahaya',
        'Infeksi virus seperti HPV, hepatitis B/C',
        'Gaya hidup buruk (merokok, kurang olahraga, pola makan tidak sehat)',
        'Efek pengobatan seperti kemoterapi sebelumnya.'
      ]},
      { type: 'heading', data: 'Terapi Gizi: Peran Diet dalam Penyembuhan Kanker' },
      { type: 'paragraph', data: 'Tujuan diet kanker adalah untuk memenuhi kebutuhan gizi, mencegah malnutrisi, mengurangi gejala efek samping pengobatan, dan mendorong pola makan sehat.' },
      { type: 'heading', data: 'Syarat Diet Kanker' },
      { type: 'table', data: {
        headers: ['Komponen', 'Penjelasan & Contoh'],
        rows: [
          ['Energi', '36 kkal/kgBB (pria), 32 kkal/kgBB (wanita). Jika malnutrisi: 40 dan 36 kkal/kgBB.'],
          ['Protein', 'Tinggi (1–1,5 g/kgBB). Contoh: ikan, dada ayam, almond.'],
          ['Lemak', 'Sedang (15–20% energi total). Hindari makanan tinggi lemak jenuh.'],
          ['Karbohidrat', 'Cukup, sebagai sumber energi utama. Fokus pada karbohidrat kompleks.'],
          ['Vitamin & Mineral', 'Disesuaikan, terutama A, C, E, K, Zn, Fe, Na untuk kekebalan dan regenerasi sel.'],
          ['Serat', 'Cukup (25 g/hari). Dari buah, sayur, dan biji-bijian.'],
          ['Cairan', '100 cc/kgBB ideal/hari. Untuk cegah dehidrasi.'],
          ['Frekuensi & Porsi', 'Porsi kecil tapi sering: 3x makan utama + 2x camilan.'],
          ['Tekstur Makanan', 'Bertahap sesuai kondisi: cair → lunak → biasa.'],
          ['Kondisi Khusus', 'Rendah iodium saat radioaktif. Makanan steril bila leukosit <10/µL.'],
        ]
      }},
      { type: 'heading', data: 'Kepatuhan Diet: Kunci Keberhasilan Pengobatan' },
      { type: 'paragraph', data: 'Penatalaksanaan kanker tidak hanya bergantung pada pengobatan medis, tetapi juga sangat dipengaruhi oleh pola makan dan kepatuhan pasien terhadap diet yang dianjurkan. Diet kanker bukanlah diet “larangan”, melainkan pengaturan makan yang terukur untuk mendukung kualitas hidup, daya tahan tubuh, serta mencegah efek samping dari terapi. Edukasi gizi yang berkelanjutan, dukungan keluarga, dan pengawasan tenaga kesehatan adalah kunci dari keberhasilan terapi kanker secara menyeluruh.'}
    ]
  }
};


export const features = [
  {
    title: "Food Record",
    description:
      "Food record asupan makan 24 jam adalah fitur yang berfungsi untuk melakukan pencatatan asupan makan selama 24 jam, fitur ini berfungsi untuk mengetahui apakah makanan yang dikonsumsi sudah sesuai dengan anjuran diet penderita.",
    image: images.asupan,
    route: "/recall", // Rute ke halaman Food Record
  },
  {
    title: "Artikel Gizi",
    description:
      "Jelajahi artikel-artikel gizi terkini yang selalu diperbarui untuk menambah wawasan kesehatan Anda.",
    image: images.artikel,
    route: "/artikel", // Rute ke halaman Artikel
  },
  {
    title: "Diet Plan",
    description:
      "Hitung kebutuhan kalori dan temukan rencana diet yang sesuai dengan kondisi kesehatan Anda.",
    image: images.diet,
    route: "/dietPlan", // Rute ke halaman Diet Plan
  },
  {
    title: "Konsultasi Gizi",
    description:
      "Diskusikan masalah gizi Anda langsung dengan ahli gizi terpercaya untuk mendapatkan solusi terbaik.",
    image: images.konsultasi,
    route: "/konsultasi", // Rute ke halaman Konsultasi
  },
  {
    title: "Kalkulator Gizi",
    description:
      "Hitung Indeks Massa Tubuh (IMT) dan Berat Badan Ideal (BBI) untuk mengetahui status gizi Anda.",
    image: images.kalkulator,
    route: "/KalkulatorGizi", // Rute ke halaman Kalkulator Gizi
  },
]as const;