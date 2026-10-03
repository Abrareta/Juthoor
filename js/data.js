/**
 * data.js — البيانات المرجعية والبيانات التجريبية (Mock Data) لمشروع جذور
 * لا يحتوي هذا الملف على أي مفاتيح API أو بيانات حقيقية. كل الأسماء والمعرفات وهمية بالكامل لأغراض العرض.
 */
(function (global) {
  "use strict";

  // أنواع القريبات المدعومة بشجرة العائلة.
  // side: 'maternal' (أمومي) | 'paternal' (أبوي) | 'both' (يُحسب على الجهتين لأنها تتشارك الوالدين)
  // degree: درجة القرابة (تُعرض للمستخدمة كمعلومة، وتُشتق تلقائيًا من نوع القرابة لضمان اتساق البيانات)
  const RELATION_TYPES = [
    { id: "mother", label: "الأم", label_en: "Mother", side: "maternal", degree: "أولى", degree_en: "1st degree", gender: "female" },
    { id: "father", label: "الأب", label_en: "Father", side: "paternal", degree: "أولى", degree_en: "1st degree", gender: "male" },
    { id: "sister", label: "الأخت", label_en: "Sister", side: "both", degree: "أولى", degree_en: "1st degree", gender: "female" },
    { id: "brother", label: "الأخ", label_en: "Brother", side: "both", degree: "أولى", degree_en: "1st degree", gender: "male" },
    { id: "maternal_aunt", label: "الخالة", label_en: "Maternal aunt", side: "maternal", degree: "ثانية", degree_en: "2nd degree", gender: "female" },
    { id: "paternal_aunt", label: "العمة", label_en: "Paternal aunt", side: "paternal", degree: "ثانية", degree_en: "2nd degree", gender: "female" },
    { id: "maternal_grandmother", label: "الجدة لأم", label_en: "Maternal grandmother", side: "maternal", degree: "ثانية", degree_en: "2nd degree", gender: "female" },
    { id: "paternal_grandmother", label: "الجدة لأب", label_en: "Paternal grandmother", side: "paternal", degree: "ثانية", degree_en: "2nd degree", gender: "female" },
  ];

  // genders: أي صلات قرابة يصلح لها نوع الإصابة هذا (يُستخدم لفلترة قائمة الاختيار حسب جنس القريب المختار)
  const CANCER_TYPES = [
    { id: "breast", label: "سرطان الثدي", label_en: "Breast cancer", genders: ["female"] },
    { id: "ovarian", label: "سرطان المبيض", label_en: "Ovarian cancer", genders: ["female"] },
    { id: "breast_male", label: "سرطان الثدي (ذكوري)", label_en: "Breast cancer (male)", genders: ["male"] },
    { id: "prostate", label: "سرطان البروستاتا", label_en: "Prostate cancer", genders: ["male"] },
    { id: "pancreatic", label: "سرطان البنكرياس", label_en: "Pancreatic cancer", genders: ["female", "male"] },
  ];

  // نطاقات الأعمار تختلف حسب نوع الإصابة (تطابق جدول Manchester Scoring الموثّق)
  const AGE_BANDS = {
    breast: [
      { id: "<30", label: "أقل من 30", label_en: "Under 30" },
      { id: "30-39", label: "30 – 39", label_en: "30–39" },
      { id: "40-49", label: "40 – 49", label_en: "40–49" },
      { id: "50-59", label: "50 – 59", label_en: "50–59" },
      { id: "60+", label: "60 فأكثر", label_en: "60 and older" },
    ],
    ovarian: [
      { id: "<60", label: "أقل من 60", label_en: "Under 60" },
      { id: "60+", label: "60 فأكثر", label_en: "60 and older" },
    ],
    breast_male: [
      { id: "<60", label: "أقل من 60", label_en: "Under 60" },
      { id: "60+", label: "60 فأكثر", label_en: "60 and older" },
    ],
    prostate: [
      { id: "<60", label: "أقل من 60", label_en: "Under 60" },
      { id: "60+", label: "60 فأكثر", label_en: "60 and older" },
    ],
    pancreatic: [
      { id: "any", label: "أي عمر", label_en: "Any age" },
    ],
  };

  // جدول نقاط Manchester Scoring System — تم التحقق منه بتاريخ 2026-09-15
  // المصادر: NHS Genomics Education Knowledge Hub + ملحق مراجعة USPSTF المنهجية (NCBI Bookshelf)
  const MANCHESTER_POINTS = {
    breast: {
      "<30": { brca1: 6, brca2: 5 },
      "30-39": { brca1: 4, brca2: 4 },
      "40-49": { brca1: 3, brca2: 3 },
      "50-59": { brca1: 2, brca2: 2 },
      "60+": { brca1: 1, brca2: 1 },
    },
    ovarian: {
      "<60": { brca1: 8, brca2: 5 },
      "60+": { brca1: 5, brca2: 5 },
    },
    breast_male: {
      "<60": { brca1: 5, brca2: 8 },
      "60+": { brca1: 5, brca2: 5 },
    },
    prostate: {
      "<60": { brca1: 0, brca2: 2 },
      "60+": { brca1: 0, brca2: 1 },
    },
    pancreatic: {
      any: { brca1: 0, brca2: 1 },
    },
  };

  // عتبات الإحالة السريرية (NHS): مجموع مُجمّع ≥ 15، أو نتيجة جين منفرد ≥ 10
  const THRESHOLDS = { combined: 15, singleGene: 10 };

  // أطباء تجريبيون بالكامل — لأغراض العرض فقط، لا يمثلون أشخاصًا حقيقيين
  const MOCK_DOCTORS = [
    { id: "d1", name: "د. لمى الحربي", name_en: "Dr. Lama Al-Harbi", specialty: "استشارية الوراثة الطبية", specialty_en: "Medical Genetics Consultant", org: "مركز استشاري تجريبي" },
    { id: "d2", name: "د. فهد العتيبي", name_en: "Dr. Fahad Al-Otaibi", specialty: "استشاري الأورام الوراثية", specialty_en: "Hereditary Oncology Consultant", org: "مركز استشاري تجريبي" },
  ];

  // القيم الكنسية (Arabic) هي ما يُخزَّن ويُقارَن بمنطق الحالة (referral.status) — لا تُغيَّر أبدًا.
  // REFERRAL_STATUSES_EN مصفوفة موازية لأغراض العرض فقط بنفس الترتيب.
  const REFERRAL_STATUSES = [
    "تقديم الطلب",
    "مراجعة طبيب جذور",
    "التحويل للمستشفى / برنامج الجينوم",
    "جاهز لاستشارة BRCA",
  ];

  const REFERRAL_STATUSES_EN = [
    "Request submitted",
    "Juthoor physician review",
    "Transfer to hospital / genome program",
    "Ready for BRCA consultation",
  ];

  // مسارا الإحالة المتاحان بعد قرار الطبيب — معلوماتي بالطبقة الأولى (بدون تكامل تقني فعلي)
  const REFERRAL_PATHWAYS = [
    {
      id: "hospital",
      label: "المسار الصحي",
      label_en: "Health pathway",
      short: "مركز استشارة وراثية",
      short_en: "Genetic counseling center",
      description: "إحالة لأقرب مركز استشارة وراثية بمستشفى تخصصي معتمد، لإجراء الفحص الوراثي (BRCA1/2 أو لوحة أوسع) ومتابعة الاستشارة العائلية.",
      description_en: "Referral to the nearest accredited genetic counseling center at a specialized hospital, for genetic testing (BRCA1/2 or a broader panel) and family counseling follow-up.",
      icon: "hospital",
    },
    {
      id: "genome_program",
      label: "المسار الوطني",
      label_en: "National pathway",
      short: "برنامج الجينوم السعودي",
      short_en: "Saudi Genome Program",
      description: "تسجيل الحالة ضمن برنامج الجينوم السعودي، لإثراء الأبحاث الوطنية وحصر الطفرات المحلية، إضافة لمسار الفحص والاستشارة.",
      description_en: "Registering the case within the Saudi Genome Program to enrich national research and catalog local mutations, in addition to the testing and counseling pathway.",
      icon: "flask",
    },
  ];

  // مناطق المملكة الإدارية الثلاث عشرة — تُستخدم فقط لتقريب "أقرب جهة مقترحة" للمستخدمة، بدون أي تحديد موقع فعلي
  const SAUDI_REGIONS = [
    { id: "riyadh", label: "الرياض", label_en: "Riyadh" },
    { id: "makkah", label: "مكة المكرمة", label_en: "Makkah" },
    { id: "madinah", label: "المدينة المنورة", label_en: "Madinah" },
    { id: "eastern", label: "المنطقة الشرقية", label_en: "Eastern Province" },
    { id: "qassim", label: "القصيم", label_en: "Qassim" },
    { id: "asir", label: "عسير", label_en: "Asir" },
    { id: "tabuk", label: "تبوك", label_en: "Tabuk" },
    { id: "hail", label: "حائل", label_en: "Hail" },
    { id: "jazan", label: "جازان", label_en: "Jazan" },
    { id: "najran", label: "نجران", label_en: "Najran" },
    { id: "albaha", label: "الباحة", label_en: "Al Bahah" },
    { id: "jouf", label: "الجوف", label_en: "Al Jouf" },
    { id: "northern", label: "الحدود الشمالية", label_en: "Northern Borders" },
  ];

  // شبكة مختبرات برنامج الجينوم السعودي الثمانية المُعلنة رسميًا (مصدر: Saudipedia، تم التحقق 2026-10-02) —
  // تُعرض كمثال توضيحي لأقرب "جهة ضمن المسار الوطني" فقط، وليست شراكة فعلية مؤكدة لجذور بهذا البروتوتايب.
  // المناطق بدون مختبر مباشر ضمن الشبكة المُعلنة (approximate: true) تُقارَب بأقرب مختبر جغرافيًا تقديريًا فقط.
  const GENOME_PROGRAM_LABS = {
    riyadh: { name: "مستشفى الملك فيصل التخصصي ومركز الأبحاث — الرياض", name_en: "King Faisal Specialist Hospital & Research Centre — Riyadh" },
    makkah: { name: "مستشفى الملك فيصل التخصصي ومركز الأبحاث — جدة", name_en: "King Faisal Specialist Hospital & Research Centre — Jeddah" },
    madinah: { name: "جامعة طيبة — المدينة المنورة", name_en: "Taibah University — Madinah" },
    eastern: { name: "مستشفى الملك فهد التخصصي — المنطقة الشرقية", name_en: "King Fahd Specialist Hospital — Eastern Province" },
    hail: { name: "جامعة حائل — حائل", name_en: "Hail University — Hail" },
    qassim: { name: "مستشفى الملك فيصل التخصصي ومركز الأبحاث — الرياض", name_en: "King Faisal Specialist Hospital & Research Centre — Riyadh", approximate: true },
    asir: { name: "مستشفى الملك فيصل التخصصي ومركز الأبحاث — جدة", name_en: "King Faisal Specialist Hospital & Research Centre — Jeddah", approximate: true },
    tabuk: { name: "جامعة طيبة — المدينة المنورة", name_en: "Taibah University — Madinah", approximate: true },
    jazan: { name: "مستشفى الملك فيصل التخصصي ومركز الأبحاث — جدة", name_en: "King Faisal Specialist Hospital & Research Centre — Jeddah", approximate: true },
    najran: { name: "مستشفى الملك فيصل التخصصي ومركز الأبحاث — جدة", name_en: "King Faisal Specialist Hospital & Research Centre — Jeddah", approximate: true },
    albaha: { name: "مستشفى الملك فيصل التخصصي ومركز الأبحاث — جدة", name_en: "King Faisal Specialist Hospital & Research Centre — Jeddah", approximate: true },
    jouf: { name: "جامعة حائل — حائل", name_en: "Hail University — Hail", approximate: true },
    northern: { name: "جامعة حائل — حائل", name_en: "Hail University — Hail", approximate: true },
  };

  // رمز دخول تجريبي وهمي لمحاكاة "دخول محدود الصلاحيات" للطبيب — ليس آلية أمان حقيقية
  const MOCK_PHYSICIAN_ACCESS_CODE = "1234";

  // أنواع الملفات المقبولة بحقل الرفع الجيني الاختياري (تجريبي — يُرفق للمراجعة اليدوية فقط، لا يُحلَّل آليًا هنا)
  const GENOMIC_FILE_ACCEPT = ".vcf,.fastq,.fq,.pdf";

  function generateReferralId(seq) {
    const year = new Date().getFullYear();
    return "JTH-" + year + "-" + String(seq).padStart(4, "0");
  }

  function relationById(id) {
    return RELATION_TYPES.find(function (r) { return r.id === id; });
  }

  function pathwayById(id) {
    return REFERRAL_PATHWAYS.find(function (p) { return p.id === id; });
  }

  function regionLabel(regionId, lang) {
    const item = SAUDI_REGIONS.find(function (r) { return r.id === regionId; });
    if (!item) return "";
    return lang === "en" && item.label_en ? item.label_en : item.label;
  }

  // أقرب جهة ضمن شبكة برنامج الجينوم السعودي الثمانية لمنطقة مُعطاة — راجعي التعليق أعلى GENOME_PROGRAM_LABS
  function nearestGenomeLab(regionId, lang) {
    const entry = GENOME_PROGRAM_LABS[regionId];
    if (!entry) return null;
    return {
      name: lang === "en" && entry.name_en ? entry.name_en : entry.name,
      approximate: !!entry.approximate,
    };
  }

  // أنواع الإصابة المتاحة لجنس قريب معيّن (تمنع تركيبات غير واقعية مثل "الأم" + "سرطان البروستاتا")
  function cancerTypesForGender(gender) {
    return CANCER_TYPES.filter(function (c) { return c.genders.indexOf(gender) > -1; });
  }

  // ————— طبقة عرض ثنائية اللغة فوق البيانات المرجعية (لا تغيّر أي معرّف/منطق كنسي) —————
  function relationLabel(relation, lang) {
    if (!relation) return "";
    return lang === "en" && relation.label_en ? relation.label_en : relation.label;
  }

  function relationDegree(relation, lang) {
    if (!relation) return "";
    return lang === "en" && relation.degree_en ? relation.degree_en : relation.degree;
  }

  function cancerLabel(id, lang) {
    const item = CANCER_TYPES.find(function (c) { return c.id === id; });
    if (!item) return id;
    return lang === "en" && item.label_en ? item.label_en : item.label;
  }

  function ageLabel(cancerType, ageId, lang) {
    const list = AGE_BANDS[cancerType] || [];
    const item = list.find(function (a) { return a.id === ageId; });
    if (!item) return ageId;
    return lang === "en" && item.label_en ? item.label_en : item.label;
  }

  function doctorName(doctor, lang) {
    if (!doctor) return "";
    return lang === "en" && doctor.name_en ? doctor.name_en : doctor.name;
  }

  function doctorSpecialty(doctor, lang) {
    if (!doctor) return "";
    return lang === "en" && doctor.specialty_en ? doctor.specialty_en : doctor.specialty;
  }

  function statusLabel(status, lang) {
    const idx = REFERRAL_STATUSES.indexOf(status);
    if (idx === -1) return status;
    return lang === "en" ? REFERRAL_STATUSES_EN[idx] : status;
  }

  function pathwayLabel(pathway, lang) {
    if (!pathway) return "";
    return lang === "en" && pathway.label_en ? pathway.label_en : pathway.label;
  }

  function pathwayDescription(pathway, lang) {
    if (!pathway) return "";
    return lang === "en" && pathway.description_en ? pathway.description_en : pathway.description;
  }

  global.JuthoorData = {
    RELATION_TYPES: RELATION_TYPES,
    CANCER_TYPES: CANCER_TYPES,
    AGE_BANDS: AGE_BANDS,
    MANCHESTER_POINTS: MANCHESTER_POINTS,
    THRESHOLDS: THRESHOLDS,
    MOCK_DOCTORS: MOCK_DOCTORS,
    REFERRAL_STATUSES: REFERRAL_STATUSES,
    REFERRAL_STATUSES_EN: REFERRAL_STATUSES_EN,
    REFERRAL_PATHWAYS: REFERRAL_PATHWAYS,
    SAUDI_REGIONS: SAUDI_REGIONS,
    GENOME_PROGRAM_LABS: GENOME_PROGRAM_LABS,
    regionLabel: regionLabel,
    nearestGenomeLab: nearestGenomeLab,
    MOCK_PHYSICIAN_ACCESS_CODE: MOCK_PHYSICIAN_ACCESS_CODE,
    GENOMIC_FILE_ACCEPT: GENOMIC_FILE_ACCEPT,
    generateReferralId: generateReferralId,
    relationById: relationById,
    pathwayById: pathwayById,
    cancerTypesForGender: cancerTypesForGender,
    relationLabel: relationLabel,
    relationDegree: relationDegree,
    cancerLabel: cancerLabel,
    ageLabel: ageLabel,
    doctorName: doctorName,
    doctorSpecialty: doctorSpecialty,
    statusLabel: statusLabel,
    pathwayLabel: pathwayLabel,
    pathwayDescription: pathwayDescription,
  };
})(window);
