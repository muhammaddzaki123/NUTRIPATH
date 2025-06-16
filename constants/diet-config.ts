interface Meal {
  bahan: string;
  berat: string;
  urt: string;
  penukar: string;
  exmenu : string
}

interface MealPlan {
  title: string;
  meals: {
    pagi: Meal[];
    selinganPagi?: Meal[];
    siang: Meal[];
    selinganSiang?: Meal[];
    malam: Meal[];
    selinganMalam?: Meal[]; // Menambahkan selingan malam
  };
}

interface DietPlansByCalories {
  [calories: number]: MealPlan;
}

interface DietPlans {
  [disease: string]: DietPlansByCalories;
}

export const DIET_PLANS: DietPlans = {
  Diabetes: {
    1100: {
      title: "Standar Diet Diabetes 1100 Kalori",
      meals: {
        pagi: [
          { bahan: "Karbohidrat", berat: "50 gram", urt: "1/2 gls", penukar: "1 karbohidrat", exmenu: "Nasi" },
          { bahan: "Hewani", berat: "35 gram", urt: "1 ptg sedang", penukar: "1 hewani", exmenu: "Semur daging" },
          { bahan: "Sayuran A", berat: "55 gram", urt: "1/2 gls", penukar: "1/2 sayuran", exmenu: "Bening kelor" },
          { bahan: "Minyak", berat: "10 gram", urt: "1 sdt", penukar: "1 minyak", exmenu: "Minyak" }
        ],
        selinganPagi: [
          { bahan: "Buah", berat: "90 gram", urt: "1 bh bsr", penukar: "1 buah", exmenu: "Jus mangga" }
        ],
        siang: [
          { bahan: "Karbohidrat", berat: "200 gram", urt: "2 gls", penukar: "2 karbohidrat", exmenu: "Nasi" },
          { bahan: "Hewani", berat: "40 gram", urt: "1 ptg sdg", penukar: "1 Hewani", exmenu: "Ikan Goreng" },
          { bahan: "Nabati", berat: "50 gram", urt: "1 ptg sdg", penukar: "1 Nabati", exmenu: "Tempe Goreng" },
          { bahan: "Sayur B", berat: "100 gram", urt: "1 gls", penukar: "1 sayuran", exmenu: "Sayur asem" },
          { bahan: "Buah", berat: "110 gram", urt: "1 bh", penukar: "1 buah", exmenu: "Jeruk" },
          { bahan: "Minyak", berat: "5 gram", urt: "1 sdt", penukar: "1 minyak", exmenu: "Minyak" }
        ],
        selinganSiang: [
          { bahan: "Buah", berat: "50 gram", urt: "1 bh", penukar: "1 buah", exmenu: "Pisang" }
        ],
        malam: [
          { bahan: "Karbohidrat", berat: "50 gram", urt: "1/2 gls", penukar: "1/2 Karbohidrat", exmenu: "Nasi" },
          { bahan: "Hewani", berat: "40 gram", urt: "1 ptg sdg", penukar: "1 hewani", exmenu: "Botok ayam" },
          { bahan: "Nabati", berat: "110 gram", urt: "1 bj bsr", penukar: "1 nabati", exmenu: "Pepes tahu" },
          { bahan: "Sayur B", berat: "100 gram", urt: "1 gls", penukar: "1 sayuran", exmenu: "Bening labu siam" },
          { bahan: "Buah", berat: "110 gram", urt: "1 ptg bsr", penukar: "1 buah", exmenu: "Pepaya" }
        ],
        selinganMalam: [
          { bahan: "Buah", berat: "55 gram", urt: "1/2 ptg", penukar: "1/2 buah", exmenu: "Pepaya" }
        ]
      }
    },
    1300: {
      title: "Standar Diet Diabetes 1300 Kalori",
      meals: {
        pagi: [
          { bahan: "Karbohidrat", berat: "100 gram", urt: "1 gls", penukar: "1 karbohidrat", exmenu: "Nasi" },
          { bahan: "Hewani", berat: "35 gram", urt: "1 ptg sedang", penukar: "1 hewani", exmenu: "Semur daging" },
          { bahan: "Sayran A", berat: "55 gram", urt: "1/2 gls", penukar: "1/2 Sayran", exmenu: "Bening kelor" },
          { bahan: "Minyak", berat: "5 gram", urt: "1 sdt", penukar: "1 minyak", exmenu: "" }
        ],
        selinganPagi: [
          { bahan: "Buah", berat: "90 gram", urt: "1 bh bsr", penukar: "1 Buah", exmenu: "Jus mangga" }
        ],
        siang: [
          { bahan: "Karbohidrat", berat: "200 gram", urt: "2 gls", penukar: "2 karbohidrat", exmenu: "Nasi" },
          { bahan: "Hewani", berat: "40 gram", urt: "1 ptg sdng", penukar: "1 hewani", exmenu: "Ikan panggang" },
          { bahan: "Nabati", berat: "50 gram", urt: "1 ptg sdg", penukar: "1 nabati", exmenu: "Tempe kuah kuning" },
          { bahan: "Sayur B", berat: "100 gram", urt: "1 gls", penukar: "1 sayuran", exmenu: "Sayur asem" },
          { bahan: "Buah", berat: "110 gram", urt: "1 bh", penukar: "1 buah", exmenu: "Jeruk" },
          { bahan: "Minyak", berat: "10 gram", urt: "2 sdt", penukar: "2 miyak", exmenu: "" }
        ],
        selinganSiang: [
          { bahan: "Buah", berat: "50 gram", urt: "1 bh", penukar: "1 buah", exmenu: "Pisang" }
        ],
        malam: [
          { bahan: "Karbohidrat", berat: "100 gram", urt: "1 gls", penukar: "1 karbohidrat", exmenu: "Nasi" },
          { bahan: "Hewani", berat: "40 gram", urt: "1 ptg sdg", penukar: "1 hewani", exmenu: "Botok ayam" },
          { bahan: "Nabati", berat: "110 gram", urt: "1 bj bsr", penukar: "1 Nabati", exmenu: "Pepes tahu" },
          { bahan: "Sayur B", berat: "100 gram", urt: "1 gls", penukar: "1 sayr Bening", exmenu: "Labu siam" },
          { bahan: "Buah", berat: "55 gram", urt: "1/2 ptg", penukar: "1/2 buah", exmenu: "Pepaya" }
        ],
        selinganMalam: [
          { bahan: "Buah", berat: "55 gram", urt: "1/2 ptg", penukar: "1/2 buah", exmenu: "Pepaya" }
        ]
      }
    },
    1500: {
      title: "Standar Diet Diabetes 1500 Kalori",
      meals: {
        pagi: [
          { bahan: "Karbohidrat", berat: "100 gram", urt: "1 gls", penukar: "1 Karbohidrat", exmenu: "Nasi" },
          { bahan: "Hewani", berat: "35 gram", urt: "1 ptg sedang", penukar: "1 Hewani", exmenu: "Semur daging tanpa lemak" },
          { bahan: "Nabati", berat: "25 gram", urt: "1/2 ptg sdg", penukar: "1/2 nabati", exmenu: "Tempe kukus" },
          { bahan: "Sayran A", berat: "50 gram", urt: "1/2 gls", penukar: "1/2 Sayran A", exmenu: "Bening kelor" },
          { bahan: "Minyak", berat: "5 gram", urt: "1 sdt", penukar: "1 Minyak", exmenu: "" }
        ],
        selinganPagi: [
          { bahan: "Buah", berat: "90 gram", urt: "1 bh bsr", penukar: "1 Buah", exmenu: "Jus mangga" }
        ],
        siang: [
          { bahan: "Karbohidrat", berat: "200 gram", urt: "2 gls", penukar: "2 Karbohidrat", exmenu: "Nasi" },
          { bahan: "Hewani", berat: "40 gram", urt: "1 ptg sdng", penukar: "1 Hewani", exmenu: "Ikan kuah kuning" },
          { bahan: "Nabati", berat: "110 gram", urt: "1 bj besar", penukar: "1 Nabati", exmenu: "Tempe kukus" },
          { bahan: "Sayur B", berat: "100 gram", urt: "1 gls", penukar: "1 Sayur B", exmenu: "Sayur asem" },
          { bahan: "Buah", berat: "110 gram", urt: "1 bh", penukar: "1 Buah", exmenu: "Jeruk" },
          { bahan: "Minyak", berat: "10 gram", urt: "2 sdt", penukar: "2 Minyak", exmenu: "" }
        ],
        selinganSiang: [
          { bahan: "Buah", berat: "50 gram", urt: "1 bh", penukar: "1 Buah", exmenu: "Pisang" }
        ],
        malam: [
          { bahan: "Karbohidrat", berat: "100 gram", urt: "1 gls", penukar: "1 Karbohidrat", exmenu: "Nasi" },
          { bahan: "Hewani", berat: "40 gram", urt: "1 ptg sdg", penukar: "1 Hewani", exmenu: "Botok ayam" },
          { bahan: "Nabati", berat: "110 gram", urt: "1 bj bsr", penukar: "1 Nabati", exmenu: "Pepes tahu" },
          { bahan: "Sayur B", berat: "100 gram", urt: "1 gls", penukar: "1 Sayur B", exmenu: "Bening labu siam" },
          { bahan: "Buah", berat: "55 gram", urt: "1/2 ptg", penukar: "1/2 buah", exmenu: "Pepaya" }
        ],
        selinganMalam: [
          { bahan: "Buah", berat: "55 gram", urt: "1/2 ptg", penukar: "1/2 buah", exmenu: "Pepaya" }
        ]
      }
    },
    1700: {
      title: "Standar Diet Diabetes 1700 Kalori",
      meals: {
        pagi: [
          { bahan: "Nasi", berat: "100 g", urt: "1 gls", penukar: "1 karbohidrat", exmenu: "Nasi" },
          { bahan: "Hewani", berat: "35 g", urt: "1 ptg sedang", penukar: "1 hewani", exmenu: "Semur daging" },
          { bahan: "Nabati", berat: "55 g", urt: "1/2 bj sdg", penukar: "1/2 nabati", exmenu: "Tahu masak jamur" },
          { bahan: "Minyak", berat: "5 g", urt: "1 sdt", penukar: "1 minyak", exmenu: "Sup lobak + tomat" }
        ],
        selinganPagi: [
          { bahan: "Buah", berat: "90 g", urt: "1 buah", penukar: "1 buah", exmenu: "Jus mangga" }
        ],
        siang: [
          { bahan: "Karbohidrat", berat: "200 g", urt: "2 gls", penukar: "2 karbohidrat", exmenu: "Nasi" },
          { bahan: "Hewani", berat: "40 g", urt: "1 ptg sdng", penukar: "1 hewani", exmenu: "Ikan Goreng" },
          { bahan: "Nabati", berat: "50 g", urt: "1 ptg sdg", penukar: "1 nabati", exmenu: "Tempe Goreng" },
          { bahan: "Sayur B", berat: "100 g", urt: "1 gls", penukar: "1 sayuran", exmenu: "Sayur asem" },
          { bahan: "Buah", berat: "110 g", urt: "1 bh", penukar: "1 buah", exmenu: "Jeruk" },
          { bahan: "Minyak", berat: "10 g", urt: "2 sdt", penukar: "2 minyak", exmenu: "Minyak" }
        ],
        selinganSiang: [
          { bahan: "Buah", berat: "50 g", urt: "1 bh", penukar: "1 buah", exmenu: "Pisang" }
        ],
        malam: [
          { bahan: "Karbohidrat", berat: "150 g", urt: "1 1/2 gls", penukar: "1 1/2 karbohidrat", exmenu: "Nasi" },
          { bahan: "Hewani", berat: "40 g", urt: "1 ptg sdg", penukar: "1 hewani", exmenu: "Botok ayam" },
          { bahan: "Nabati", berat: "110 g", urt: "1 bj bsr", penukar: "1 nabati", exmenu: "Pepes tahu" },
          { bahan: "Sayur B", berat: "100 g", urt: "1 gls", penukar: "1 sayuran", exmenu: "Tumis buncis" },
          { bahan: "Buah", berat: "110 g", urt: "1 ptg bsr", penukar: "1 buah", exmenu: "Pepaya" },
          { bahan: "Minyak", berat: "10 g", urt: "2 sdt", penukar: "2 minyak", exmenu: "Minyak" }
        ],
        selinganMalam: [
          { bahan: "Buah", berat: "55 gram", urt: "1/2 ptg", penukar: "1/2 buah", exmenu: "Pepaya" }
        ]
      }
    },
    1900: {
      title: "Standar Diet Diabetes 1900 Kalori",
      meals: {
        pagi: [
          { bahan: "Karbohidrat", berat: "150 gram", urt: "1 1/2 gls", penukar: "1/2 karbohidrat", exmenu: "Nasi" },
          { bahan: "Hewani", berat: "35 gram", urt: "1 ptg sedang", penukar: "1 Hewani", exmenu: "Semur daging rendah lemak" },
          { bahan: "Nabati", berat: "25 gram", urt: "1/2 ptg sdg", penukar: "1/2 Nabati", exmenu: "Tempe kukus" },
          { bahan: "Sayran A", berat: "50 gram", urt: "1/2 gls", penukar: "1/2 Sayran A", exmenu: "Bening kelor" },
          { bahan: "Minyak", berat: "10 gram", urt: "2 sdt", penukar: "2 minyak", exmenu: "" }
        ],
        selinganPagi: [
          { bahan: "Buah", berat: "90 gram", urt: "1 bh bsr", penukar: "1 Buah", exmenu: "Jus mangga" }
        ],
        siang: [
          { bahan: "Karbohidrat", berat: "200 gram", urt: "2 gls", penukar: "2 karbohidrat", exmenu: "Nasi" },
          { bahan: "Hewani", berat: "40 gram", urt: "1 ptg sdng", penukar: "1 Hewani", exmenu: "Ikan kuah kuning" },
          { bahan: "Nabati", berat: "110 gram", urt: "1 bj besar", penukar: "1 Nabati", exmenu: "Tahu kukus" },
          { bahan: "Sayur B", berat: "100 gram", urt: "1 gls", penukar: "1 Sayur B", exmenu: "Sayur asem" },
          { bahan: "Buah", berat: "110 gram", urt: "1 bh", penukar: "1 buah", exmenu: "Jeruk" },
          { bahan: "Minyak", berat: "20 gram", urt: "2 sdt", penukar: "4 minyak", exmenu: "" }
        ],
        selinganSiang: [
          { bahan: "Buah", berat: "55 gram", urt: "1/2 ptg", penukar: "1/2 buah", exmenu: "Pisang" }
        ],
        malam: [
          { bahan: "Karbohidrat", berat: "200 gram", urt: "2 gls", penukar: "2 karbohidrat", exmenu: "Nasi" },
          { bahan: "Hewani", berat: "40 gram", urt: "1 ptg sdg", penukar: "1 Hewani", exmenu: "Botok ayam" },
          { bahan: "Nabati", berat: "110 gram", urt: "1 bj bsr", penukar: "1 Nabati", exmenu: "Pepes tahu" },
          { bahan: "Sayur B", berat: "100 gram", urt: "1 gls", penukar: "1 sayur b", exmenu: "Bening labu siam" },
          { bahan: "Buah", berat: "55 gram", urt: "1/2 ptg", penukar: "1/2 buah", exmenu: "Pepaya" }
        ],
        selinganMalam: [
          { bahan: "Buah", berat: "55 gram", urt: "1/2 ptg", penukar: "1/2 buah", exmenu: "Pepaya" }
        ]
      }
    },
    2100: {
      title: "Standar Diet Diabetes 2100 Kalori",
      meals: {
        pagi: [
          { bahan: "Karbohidrat", berat: "100 gram", urt: "1 gelas", penukar: "1 karbohidrat", exmenu: "Nasi" },
          { bahan: "Hewani", berat: "35 gram", urt: "1 ptg sedang", penukar: "1 ptg hewani", exmenu: "Semur daging rendah lemak" },
          { bahan: "Nabati", berat: "25 gram", urt: "1 ptg sdg", penukar: "1 ptg nabati", exmenu: "Tempe kukus" },
          { bahan: "Sayran A", berat: "50 gram", urt: "1/2 gls", penukar: "1/2 sayran a", exmenu: "Bening kelor" },
          { bahan: "Minyak", berat: "10 gram", urt: "2 sdt", penukar: "2 minyak", exmenu: "" }
        ],
        selinganPagi: [
          { bahan: "Buah", berat: "90 gram", urt: "1 bh bsr", penukar: "1 bh buah", exmenu: "Jus mangga" }
        ],
        siang: [
          { bahan: "Karbohidrat", berat: "200 gram", urt: "2 gls", penukar: "2 karbohidrat", exmenu: "Nasi" },
          { bahan: "Hewani", berat: "40 gram", urt: "1 ptg sdng", penukar: "1 ptg hewani", exmenu: "Ikan kuah kuning" },
          { bahan: "Nabati", berat: "110 gram", urt: "1 bj besar", penukar: "1 bj nabati", exmenu: "Tempe kukus" },
          { bahan: "Sayur B", berat: "100 gram", urt: "1 gls", penukar: "1 sayur b", exmenu: "Sayur asem" },
          { bahan: "Buah", berat: "110 gram", urt: "1 bh", penukar: "1 buah", exmenu: "Jeruk" },
          { bahan: "Minyak", berat: "20 gram", urt: "2 sdt", penukar: "2 minyak", exmenu: "" }
        ],
        selinganSiang: [
          { bahan: "Karbohidrat", berat: "50 gram", urt: "8 sdm", penukar: "8 karbohidrat", exmenu: "Nagasari dari tepung beras" },
          { bahan: "Buah", berat: "50 gram", urt: "1 buah", penukar: "1 buah", exmenu: "Pisang" }
        ],
        malam: [
          { bahan: "Karbohidrat", berat: "200 gram", urt: "2 gls", penukar: "2 karbohidrat", exmenu: "Nasi" },
          { bahan: "Hewani", berat: "40 gram", urt: "1 ptg sdg", penukar: "1 ptg hewani", exmenu: "Botok ayam" },
          { bahan: "Nabati", berat: "110 gram", urt: "1 bj bsr", penukar: "1 bj nabati", exmenu: "Pepes tahu" },
          { bahan: "Sayur B", berat: "100 gram", urt: "1 gls", penukar: "1 sayur b", exmenu: "Bening labu siam" },
          { bahan: "Buah", berat: "55 gram", urt: "1/2 ptg", penukar: "1/2 buah", exmenu: "Pepaya" }
        ],
        selinganMalam: [
          { bahan: "Buah", berat: "55 gram", urt: "1/2 ptg", penukar: "1/2 buah", exmenu: "Pepaya" }
        ]
      }
    },
    2500 : {
      title : "Standar Diet Diabetes 2500 Kalori",
      meals: {
        pagi: [
          { bahan: "Karbohidrat", berat: "150 gram", urt: "1 1/2 gelas", penukar: "1 1/2 karbohidrat", exmenu: "Nasi" },
          { bahan: "Hewani", berat: "35 gram", urt: "1 ptg sedang", penukar: "1 hewani", exmenu: "Semur daging rendah lemak" },
          { bahan: "Nabati", berat: "25 gram", urt: "1 ptg sdg", penukar: "1 nabati", exmenu: "Tempe kukus" },
          { bahan: "Sayran A", berat: "50 gram", urt: "1/2 gls", penukar: "1/2 sayran a", exmenu: "Bening kelor" },
          { bahan: "Minyak", berat: "10 gram", urt: "2 sdt", penukar: "2 minyak", exmenu: "" }
        ],
        selinganPagi: [
          { bahan: "Buah", berat: "90 gram", urt: "1 bh bsr", penukar: "1 buah", exmenu: "Jus mangga" }
        ],
        siang: [
          { bahan: "Karbohidrat", berat: "200 gram", urt: "2 gls", penukar: "2 karbohidrat", exmenu: "Nasi" },
          { bahan: "Hewani", berat: "40 gram", urt: "1 ptg sdng", penukar: "1 hewani", exmenu: "Ikan kuah kuning" },
          { bahan: "Nabati", berat: "110 gram", urt: "1 bj besar", penukar: "1 nabati", exmenu: "Tahu kukus" },
          { bahan: "Sayur B", berat: "100 gram", urt: "1 gls", penukar: "1 sayur b", exmenu: "Sayur asem" },
          { bahan: "Buah", berat: "110 gram", urt: "1 bh", penukar: "1 buah", exmenu: "Jeruk" },
          { bahan: "Minyak", berat: "10 gram", urt: "2 sdt", penukar: "2 minyak", exmenu: "" }
        ],
        selinganSiang: [
          { bahan: "Karbohidrat", berat: "50 gram", urt: "8 sdm", penukar: "8 karbohidrat", exmenu: "Nagasari" },
          { bahan: "Buah", berat: "50 gram", urt: "1 buah", penukar: "1 buah", exmenu: "Pisang" },
          { bahan: "Minyak", berat: "10 gram", urt: "2 sdt", penukar: "2 minyak", exmenu: "" }
        ],
        malam: [
          { bahan: "Karbohidrat", berat: "200 gram", urt: "2 gls", penukar: "2 karbohidrat", exmenu: "Nasi" },
          { bahan: "Hewani", berat: "40 gram", urt: "1 ptg sdg", penukar: "1 hewani", exmenu: "Botok ayam" },
          { bahan: "Nabati", berat: "110 gram", urt: "1 bj bsr", penukar: "1 nabati", exmenu: "Pepes tahu" },
          { bahan: "Sayur B", berat: "100 gram", urt: "1 gls", penukar: "1 sayur b", exmenu: "Bening labu siam" },
          { bahan: "Buah", berat: "55 gram", urt: "1/2 ptg", penukar: "1/2 buah", exmenu: "Pepaya" }
        ],
        selinganMalam: [
          { bahan: "Buah", berat: "55 gram", urt: "1/2 ptg", penukar: "1/2 buah", exmenu: "Pepaya" }
        ]
      }
    },
  },

  Hipertensi: {
    1100: {
      title: "Standar Diet Hipertensi 1100 Kalori",
      meals: {
        pagi: [
          { bahan: "Karbohidrat", berat: "50 gram", urt: "1/2 gls", penukar: "1 karbohidrat", exmenu: "Nasi" },
          { bahan: "Hewani", berat: "35 gram", urt: "1 ptg sedang", penukar: "1 hewani", exmenu: "Semur daging" },
          { bahan: "Sayuran A", berat: "55 gram", urt: "1/2 gls", penukar: "1/2 sayuran", exmenu: "Bening kelor" },
          { bahan: "Minyak", berat: "10 gram", urt: "1 sdt", penukar: "1 minyak", exmenu: "" }
        ],
        selinganPagi: [
          { bahan: "Buah", berat: "90 gram", urt: "1 bh bsr", penukar: "1 buah", exmenu: "Jus mangga" }
        ],
        siang: [
          { bahan: "Karbohidrat", berat: "200 gram", urt: "2 gls", penukar: "2 karbohidrat", exmenu: "Nasi" },
          { bahan: "Hewani", berat: "40 gram", urt: "1 ptg sdng", penukar: "1 Hewani", exmenu: "Ikan pepes" },
          { bahan: "Nabati", berat: "50 gram", urt: "1 ptg sdg", penukar: "1 Nabati", exmenu: "Tempe kukus" },
          { bahan: "Sayur B", berat: "100 gram", urt: "1 gls", penukar: "1 sayuran", exmenu: "Sayur asem" },
          { bahan: "Buah", berat: "110 gram", urt: "1 bh", penukar: "1 buah", exmenu: "Jeruk" },
          { bahan: "Minyak", berat: "5 gram", urt: "1 sdt", penukar: "1 minyak", exmenu: "" }
        ],
        selinganSiang: [
          { bahan: "Buah", berat: "50 gram", urt: "1 bh", penukar: "1 buah", exmenu: "Pisang" }
        ],
        malam: [
          { bahan: "Karbohidrat", berat: "50 gram", urt: "1/2 gls", penukar: "1/2 Karbohidrat", exmenu: "Nasi" },
          { bahan: "Hewani", berat: "40 gram", urt: "1 ptg sdg", penukar: "1 hewani", exmenu: "Botok ayam" },
          { bahan: "Nabati", berat: "110 gram", urt: "1 bj bsr", penukar: "1 nabati", exmenu: "Pepes tahu" },
          { bahan: "Sayur B", berat: "100 gram", urt: "1 gls", penukar: "1 sayuran", exmenu: "Bening labu siam" },
          { bahan: "Buah", berat: "55 gram", urt: "1/2 ptg", penukar: "1/2 buah", exmenu: "Pepaya" }
        ]
      }
    }
  },

  Kanker: {
    1700: {
      title: "Standar Diet Kanker 1700 Kalori",
      meals: {
        pagi: [
        { bahan: "Karbohidrat", berat: "75", urt: "1 sdk nasi", penukar: "1 1/2", exmenu: "Nasi" },
        { bahan: "Protein hewani", berat: "75", urt: "1 potong sedang", penukar: "1 1/2", exmenu: "Sup daging" },
        { bahan: "Protein Nabati", berat: "30", urt: "2 sdm", penukar: "1", exmenu: "Orek Tempe" },
        { bahan: "Sayuran", berat: "30", urt: "1 sndk sayur", penukar: "1", exmenu: "Tumis Kacang Panjang" },
        { bahan: "Buah Segar", berat: "50", urt: "1 bh", penukar: "1", exmenu: "Buah Pisang" },
        { bahan: "Air Mineral", berat: "600", urt: "1 btl", penukar: "1", exmenu: "Air mineral" }
      ],
        selinganPagi: [
        { bahan: "Selingan", berat: "150", urt: "1 mangkok", penukar: "1", exmenu: "Bubur sum-sum" }
      ],
        siang: [
        { bahan: "Karbohidrat", berat: "75", urt: "1 sdk nasi", penukar: "1 1/2", exmenu: "Nasi" },
        { bahan: "Protein hewani", berat: "75", urt: "1 potong sedang", penukar: "1 1/2", exmenu: "Tim Ikan" },
        { bahan: "Protein Nabati", berat: "40", urt: "1 potong sdg", penukar: "1", exmenu: "Pepes Tahu" },
        { bahan: "Sayuran", berat: "30", urt: "1 sndk sayur", penukar: "1", exmenu: "Sayur Sop" },
        { bahan: "Buah Segar", berat: "100", urt: "2 ptg sdg", penukar: "1", exmenu: "Buah Pepaya" },
        { bahan: "Air Mineral", berat: "600", urt: "1 btl", penukar: "1", exmenu: "Air mineral" }
      ],
      malam: [
        { bahan: "Karbohidrat", berat: "75", urt: "1 sdk nasi", penukar: "1 1/2", exmenu: "Nasi" },
        { bahan: "Protein hewani", berat: "75", urt: "1 btr", penukar: "1 1/2", exmenu: "Telur Opor" },
        { bahan: "Protein Nabati", berat: "40", urt: "1 potong sdg", penukar: "1", exmenu: "Tahu Kukus" },
        { bahan: "Sayuran", berat: "15", urt: "1 sndk sayur", penukar: "1", exmenu: "Sayur Bening bayam" },
        { bahan: "Buah Segar", berat: "200", urt: "2 ptg sdg", penukar: "1", exmenu: "Buah Semangka" },
        { bahan: "Air Mineral", berat: "600", urt: "1 btl", penukar: "1", exmenu: "Air mineral" }
      ]
      }
    },
    1900: {
      title: "Standar Diet Kanker 1900 Kalori",
      meals: {
          pagi: [
          { bahan: "Karbohidrat", berat: "75", urt: "1 sdk nasi", penukar: "1 1/2", exmenu: "Nasi" },
          { bahan: "Protein hewani", berat: "75", urt: "1 potong sedang", penukar: "1 1/2", exmenu: "Ayam Ungkep" },
          { bahan: "Protein Nabati", berat: "80", urt: "2 potong sdg", penukar: "1", exmenu: "Tahu Kukus" },
          { bahan: "Sayuran", berat: "15", urt: "1 sndk sayur", penukar: "1", exmenu: "Sayur Bening" },
          { bahan: "Buah Segar", berat: "50", urt: "1 bh", penukar: "1", exmenu: "Buah Pisang" },
          { bahan: "Air Mineral", berat: "600", urt: "1 btl", penukar: "1", exmenu: "Air mineral" }
        ],
        selinganPagi: [
          { bahan: "Selingan", berat: "50", urt: "1 cup sdg", penukar: "1", exmenu: "Puding" }
        ],
        siang: [
          { bahan: "Karbohidrat", berat: "75", urt: "1 sdk nasi", penukar: "1 1/2", exmenu: "Nasi" },
          { bahan: "Protein hewani", berat: "75", urt: "1 potong sedang", penukar: "1 1/2", exmenu: "Ikan kuah kuning" },
          { bahan: "Protein Nabati", berat: "50", urt: "1 potong sdg", penukar: "1", exmenu: "Perkedel Tahu" },
          { bahan: "Sayuran", berat: "30", urt: "1 sndk sayur", penukar: "1", exmenu: "Tumis Kangkung" },
          { bahan: "Buah Segar", berat: "100", urt: "2 bh", penukar: "1", exmenu: "Buah Apel" },
          { bahan: "Air Mineral", berat: "600", urt: "1 btl", penukar: "1", exmenu: "Air mineral" }
        ],
        selinganSiang: [
          { bahan: "Selingan", berat: "250", urt: "1 gelas", penukar: "1", exmenu: "Jus buah" }
        ],
        malam: [
          { bahan: "Karbohidrat", berat: "75", urt: "1 sdk nasi", penukar: "1 1/2", exmenu: "Nasi" },
          { bahan: "Protein hewani", berat: "75", urt: "1 btr", penukar: "1 1/2", exmenu: "Telur dadar" },
          { bahan: "Protein Nabati", berat: "50", urt: "2 potong sdg", penukar: "1", exmenu: "Tempe Bacem" },
          { bahan: "Sayuran", berat: "30", urt: "1 sndk sayur", penukar: "1", exmenu: "Capcay" },
          { bahan: "Buah Segar", berat: "200", urt: "2 ptg sdg", penukar: "1", exmenu: "Buah Semangka" },
          { bahan: "Air Mineral", berat: "600", urt: "1 btl", penukar: "1", exmenu: "Air mineral" }
        ]
      }
    },
    2100: {
      title: "Standar Diet Kanker 2100 Kalori",
      meals: {
        pagi: [
        { bahan: "Karbohidrat", berat: "75", urt: "1 sdk nasi", penukar: "1 1/2", exmenu: "Nasi" },
        { bahan: "Protein hewani", berat: "50", urt: "1 btr", penukar: "1", exmenu: "Telur Rebus" },
        { bahan: "Protein Nabati", berat: "50", urt: "2 ptg sdg", penukar: "2", exmenu: "Tempe Ungkep" },
        { bahan: "Sayuran", berat: "30", urt: "1 sndk sayur", penukar: "1", exmenu: "Cah wortel jamur" },
        { bahan: "Buah Segar", berat: "50", urt: "1 bh", penukar: "1", exmenu: "Buah Jeruk" },
        { bahan: "Air Mineral", berat: "600", urt: "1 btl", penukar: "1", exmenu: "Air mineral" }
      ],
      selinganPagi: [
        { bahan: "Selingan", berat: "75", urt: "1 bh", penukar: "1", exmenu: "Roti manis" }
      ],
      siang: [
        { bahan: "Karbohidrat", berat: "75", urt: "1 sdk nasi", penukar: "1 1/2", exmenu: "Nasi" },
        { bahan: "Protein hewani", berat: "100", urt: "2 potong sedang", penukar: "1 1/2", exmenu: "Rolade Ayam" },
        { bahan: "Protein Nabati", berat: "40", urt: "1 potong sdg", penukar: "1", exmenu: "Tahu bacem" },
        { bahan: "Sayuran", berat: "30", urt: "1 sndk sayur", penukar: "1", exmenu: "Tumis sawi" },
        { bahan: "Buah Segar", berat: "100", urt: "1 bh", penukar: "1", exmenu: "Buah Apel" },
        { bahan: "Air Mineral", berat: "600", urt: "1 btl", penukar: "1", exmenu: "Air mineral" }
      ],
      selinganSiang: [
        { bahan: "Selingan", berat: "20", urt: "1 ptg sdg", penukar: "1", exmenu: "Bolu" }
      ],
      malam: [
        { bahan: "Karbohidrat", berat: "75", urt: "1 sdk nasi", penukar: "1 1/2", exmenu: "Nasi" },
        { bahan: "Protein hewani", berat: "75", urt: "1 ptg sdg", penukar: "1 1/2", exmenu: "Ikan asam manis" },
        { bahan: "Protein Nabati", berat: "50", urt: "1 sndk sayur", penukar: "1", exmenu: "Sup bening tahu" },
        { bahan: "Sayuran", berat: "30", urt: "1 sndk sayur", penukar: "1", exmenu: "Tumis buncis wortel" },
        { bahan: "Buah Segar", berat: "50", urt: "2 ptg sdg", penukar: "1", exmenu: "Buah Semangka" },
        { bahan: "Air Mineral", berat: "600", urt: "1 btl", penukar: "1", exmenu: "Air mineral" }
      ]
      }
    },
    2300: {
      title: "Standar Diet Kanker 2300 Kalori",
      meals: {
        pagi: [
        { bahan: "Karbohidrat", berat: "75", urt: "1 sdk nasi", penukar: "1 1/2", exmenu: "Nasi" },
        { bahan: "Protein hewani", berat: "50", urt: "1 btr", penukar: "1", exmenu: "Telur Dadar" },
        { bahan: "Protein Nabati", berat: "50", urt: "2 potong sdg", penukar: "1", exmenu: "Tempe ungkep" },
        { bahan: "Sayuran", berat: "30", urt: "2 sdm", penukar: "1", exmenu: "Oseng buncis" },
        { bahan: "Buah Segar", berat: "50", urt: "1 bh", penukar: "1", exmenu: "Buah Jeruk" },
        { bahan: "Air Mineral", berat: "600", urt: "1 btl", penukar: "1", exmenu: "Air mineral" }
      ],
      selinganPagi: [
        { bahan: "Selingan", berat: "75", urt: "1 bh", penukar: "1", exmenu: "Bubur kacang hijau" }
      ],
      siang: [
        { bahan: "Karbohidrat", berat: "75", urt: "1 sdk nasi", penukar: "1 1/2", exmenu: "Nasi" },
        { bahan: "Protein hewani", berat: "100", urt: "2 potong sedang", penukar: "1 1/2", exmenu: "Ayam balado" },
        { bahan: "Protein Nabati", berat: "40", urt: "1 potong sdg", penukar: "1", exmenu: "Tahu saus tomat" },
        { bahan: "Sayuran", berat: "30", urt: "1 sndk sayur", penukar: "1", exmenu: "Sayur sop" },
        { bahan: "Buah Segar", berat: "100", urt: "2 ptg sdg", penukar: "1", exmenu: "Buah pepaya" },
        { bahan: "Air Mineral", berat: "600", urt: "1 btl", penukar: "1", exmenu: "Air mineral" }
      ],
      selinganSiang: [
        { bahan: "Selingan", berat: "95", urt: "1 cup", penukar: "1", exmenu: "Salad buah" }
      ],
      malam: [
        { bahan: "Karbohidrat", berat: "75", urt: "1 sdk nasi", penukar: "1 1/2", exmenu: "Nasi" },
        { bahan: "Protein hewani", berat: "75", urt: "1 ptg sdg", penukar: "1 1/2", exmenu: "Semur daging" },
        { bahan: "Protein Nabati", berat: "50", urt: "2 potong sdg", penukar: "1", exmenu: "Tempe manis" },
        { bahan: "Sayuran", berat: "15", urt: "1 sndk sayur", penukar: "1", exmenu: "Sayur bening kelor" },
        { bahan: "Buah Segar", berat: "50", urt: "1 bh", penukar: "1", exmenu: "Buah pisang" },
        { bahan: "Air Mineral", berat: "600", urt: "1 btl", penukar: "1", exmenu: "Air mineral" }
      ]
      }
    }
  }
};
