/**
 * Algerian wilayas after the 2026 reform (69 wilayas). Communes stay free text.
 *
 * French names and codes, consulted 21 September 2026:
 * - 1–48: décret n° 84-79 du 3 avril 1984 fixant les noms et les chefs-lieux des
 *   wilayas, in the accented French of later Journal officiel editions
 *   (for example « Tébessa » in JO n° 40).
 * - 49–58: décret présidentiel n° 21-117 du 22 mars 2021, Journal officiel n° 22
 *   du 25 mars 2021. Code 57 is spelled « El M'Ghaier ».
 *   https://www.joradp.dz/FTP/jo-francais/2021/F2021022.pdf
 * - 59–69: décret présidentiel n° 26-206 du 25 mai 2026, Journal officiel n° 40
 *   du 3 juin 2026, completing décret n° 84-79 after loi n° 26-06 du 4 avril 2026
 *   (Journal officiel n° 25 du 5 avril 2026), which sets the country at 69 wilayas
 *   and 1 541 communes. Code 65 is spelled « Aïn Ouessara ».
 *   https://www.joradp.dz/FTP/jo-francais/2026/F2026025.pdf
 *   https://www.joradp.dz/FTP/jo-francais/2026/F2026040.pdf
 *
 * Arabic names follow the Arabic edition of the same official nomenclature,
 * including JO n° 40 for wilayas 59–69 (أفلو، بريكة، القنطرة، بئر العاتر،
 * العريشة، قصر الشلالة، عين وسارة، مسعد، قصر البخاري، بوسعادة، الأبيض سيدي الشيخ).
 *
 * The patrimonial transition runs through the end of 2026. Décret exécutif
 * n° 26-208 du 26 mai 2026 (JO n° 40 du 3 juin 2026) splits the 2026 accounts
 * and starts recovery by the concerned wilaya on 1 January 2027.
 */
export const WILAYA_LIST_VERSION = "2026-06-03" as const;
export const WILAYA_TRANSITION_ENDS = "2026-12-31" as const;
export const WILAYA_COUNT = 69;

export type Wilaya = {
  code: number;
  nameFr: string;
  nameAr: string;
};

export const WILAYAS = [
  { code: 1, nameFr: "Adrar", nameAr: "أدرار" },
  { code: 2, nameFr: "Chlef", nameAr: "الشلف" },
  { code: 3, nameFr: "Laghouat", nameAr: "الأغواط" },
  { code: 4, nameFr: "Oum El Bouaghi", nameAr: "أم البواقي" },
  { code: 5, nameFr: "Batna", nameAr: "باتنة" },
  { code: 6, nameFr: "Béjaïa", nameAr: "بجاية" },
  { code: 7, nameFr: "Biskra", nameAr: "بسكرة" },
  { code: 8, nameFr: "Béchar", nameAr: "بشار" },
  { code: 9, nameFr: "Blida", nameAr: "البليدة" },
  { code: 10, nameFr: "Bouira", nameAr: "البويرة" },
  { code: 11, nameFr: "Tamanrasset", nameAr: "تمنراست" },
  { code: 12, nameFr: "Tébessa", nameAr: "تبسة" },
  { code: 13, nameFr: "Tlemcen", nameAr: "تلمسان" },
  { code: 14, nameFr: "Tiaret", nameAr: "تيارت" },
  { code: 15, nameFr: "Tizi Ouzou", nameAr: "تيزي وزو" },
  { code: 16, nameFr: "Alger", nameAr: "الجزائر" },
  { code: 17, nameFr: "Djelfa", nameAr: "الجلفة" },
  { code: 18, nameFr: "Jijel", nameAr: "جيجل" },
  { code: 19, nameFr: "Sétif", nameAr: "سطيف" },
  { code: 20, nameFr: "Saïda", nameAr: "سعيدة" },
  { code: 21, nameFr: "Skikda", nameAr: "سكيكدة" },
  { code: 22, nameFr: "Sidi Bel Abbès", nameAr: "سيدي بلعباس" },
  { code: 23, nameFr: "Annaba", nameAr: "عنابة" },
  { code: 24, nameFr: "Guelma", nameAr: "قالمة" },
  { code: 25, nameFr: "Constantine", nameAr: "قسنطينة" },
  { code: 26, nameFr: "Médéa", nameAr: "المدية" },
  { code: 27, nameFr: "Mostaganem", nameAr: "مستغانم" },
  { code: 28, nameFr: "M'Sila", nameAr: "المسيلة" },
  { code: 29, nameFr: "Mascara", nameAr: "معسكر" },
  { code: 30, nameFr: "Ouargla", nameAr: "ورقلة" },
  { code: 31, nameFr: "Oran", nameAr: "وهران" },
  { code: 32, nameFr: "El Bayadh", nameAr: "البيض" },
  { code: 33, nameFr: "Illizi", nameAr: "إليزي" },
  { code: 34, nameFr: "Bordj Bou Arréridj", nameAr: "برج بوعريريج" },
  { code: 35, nameFr: "Boumerdès", nameAr: "بومرداس" },
  { code: 36, nameFr: "El Tarf", nameAr: "الطارف" },
  { code: 37, nameFr: "Tindouf", nameAr: "تندوف" },
  { code: 38, nameFr: "Tissemsilt", nameAr: "تيسمسيلت" },
  { code: 39, nameFr: "El Oued", nameAr: "الوادي" },
  { code: 40, nameFr: "Khenchela", nameAr: "خنشلة" },
  { code: 41, nameFr: "Souk Ahras", nameAr: "سوق أهراس" },
  { code: 42, nameFr: "Tipaza", nameAr: "تيبازة" },
  { code: 43, nameFr: "Mila", nameAr: "ميلة" },
  { code: 44, nameFr: "Aïn Defla", nameAr: "عين الدفلى" },
  { code: 45, nameFr: "Naâma", nameAr: "النعامة" },
  { code: 46, nameFr: "Aïn Témouchent", nameAr: "عين تموشنت" },
  { code: 47, nameFr: "Ghardaïa", nameAr: "غرداية" },
  { code: 48, nameFr: "Relizane", nameAr: "غليزان" },
  { code: 49, nameFr: "Timimoun", nameAr: "تيميمون" },
  { code: 50, nameFr: "Bordj Badji Mokhtar", nameAr: "برج باجي مختار" },
  { code: 51, nameFr: "Ouled Djellal", nameAr: "أولاد جلال" },
  { code: 52, nameFr: "Béni Abbès", nameAr: "بني عباس" },
  { code: 53, nameFr: "In Salah", nameAr: "عين صالح" },
  { code: 54, nameFr: "In Guezzam", nameAr: "عين قزام" },
  { code: 55, nameFr: "Touggourt", nameAr: "تقرت" },
  { code: 56, nameFr: "Djanet", nameAr: "جانت" },
  { code: 57, nameFr: "El M'Ghaier", nameAr: "المغير" },
  { code: 58, nameFr: "El Meniaa", nameAr: "المنيعة" },
  { code: 59, nameFr: "Aflou", nameAr: "أفلو" },
  { code: 60, nameFr: "Barika", nameAr: "بريكة" },
  { code: 61, nameFr: "El Kantara", nameAr: "القنطرة" },
  { code: 62, nameFr: "Bir El Ater", nameAr: "بئر العاتر" },
  { code: 63, nameFr: "El Aricha", nameAr: "العريشة" },
  { code: 64, nameFr: "Ksar Chellala", nameAr: "قصر الشلالة" },
  { code: 65, nameFr: "Aïn Ouessara", nameAr: "عين وسارة" },
  { code: 66, nameFr: "Messaad", nameAr: "مسعد" },
  { code: 67, nameFr: "Ksar El Boukhari", nameAr: "قصر البخاري" },
  { code: 68, nameFr: "Bou Saâda", nameAr: "بوسعادة" },
  { code: 69, nameFr: "El Abiodh Sidi Cheikh", nameAr: "الأبيض سيدي الشيخ" },
] as const satisfies readonly Wilaya[];

export function wilayaByCode(code: number): Wilaya | undefined {
  return WILAYAS.find((wilaya) => wilaya.code === code);
}
