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
    description: `Hipertensi adalah kondisi di mana tekanan darah seseorang meningkat melebihi batas normal secara konsisten. Ini berarti tekanan darah pada dinding arteri (pembuluh darah) terlalu tinggi. Hipertensi sering disebut sebagai "silent killer" karena sering tidak memiliki gejala yang jelas. 

Lebih Detail:
Tekanan Darah:
- Tekanan darah adalah kekuatan yang dihasilkan oleh aliran darah ketika memompa melalui pembuluh darah. 
- Ada dua jenis tekanan darah: 
  * Tekanan Sistolik: Tekanan saat jantung berkontraksi dan memompa darah. 
  * Tekanan Diastolik: Tekanan saat jantung beristirahat di antara detak jantung. 

Gejala:
- Sakit kepala
- Pusing
- Pendarahan hidung
- Mual dan muntah
- Kelelahan
- Pandangan kabur

Pencegahan:
- Kurangi konsumsi garam
- Olahraga teratur
- Hindari stres
- Jaga berat badan ideal
- Hindari rokok dan alkohol`
  },
  diabetes: {
    title: "Diabetes",
    description: `Diabetes adalah penyakit kronis yang terjadi ketika tubuh tidak dapat menghasilkan insulin yang cukup atau tidak dapat menggunakan insulin secara efektif. Insulin adalah hormon yang mengatur kadar gula darah.

Lebih Detail:
Tipe Diabetes:
- Diabetes Tipe 1: Sistem kekebalan tubuh menyerang sel penghasil insulin
- Diabetes Tipe 2: Tubuh tidak dapat menggunakan insulin dengan baik
- Diabetes Gestasional: Terjadi selama kehamilan

Gejala:
- Sering haus dan buang air kecil
- Mudah lelah
- Penurunan berat badan
- Luka yang sulit sembuh
- Penglihatan kabur

Pencegahan:
- Makan makanan sehat
- Kontrol berat badan
- Olahraga teratur
- Pantau kadar gula darah
- Hindari makanan tinggi gula`
  },
  kanker: {
    title: "Kanker",
    description: `Kanker adalah penyakit yang terjadi ketika sel-sel abnormal dalam tubuh tumbuh tidak terkendali. Sel-sel ini dapat menyebar ke bagian tubuh lainnya melalui darah dan sistem limfatik.

Lebih Detail:
Jenis Kanker:
- Karsinoma: Kanker yang dimulai di kulit atau jaringan
- Sarkoma: Kanker di jaringan ikat
- Leukemia: Kanker darah
- Limfoma: Kanker sistem limfatik

Gejala Umum:
- Benjolan atau pertumbuhan tidak normal
- Perubahan pada kulit
- Perubahan kebiasaan buang air
- Penurunan berat badan tidak wajar
- Kelelahan berkepanjangan

Pencegahan:
- Hindari merokok
- Makan makanan sehat
- Olahraga teratur
- Hindari paparan sinar UV berlebihan
- Pemeriksaan rutin`
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
