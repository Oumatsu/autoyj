export type DetailTranslate = (key: string, fallback?: string) => unknown;

function normalizeDetailId(value: string): string {
  return value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

export function detailModelKey(slug: string, field: string): string {
  return `productsDetail.models.${normalizeDetailId(slug)}.${field}`;
}

export function detailVariantKey(trimConfigId: string, field: string): string {
  return `productsDetail.variants.${normalizeDetailId(trimConfigId)}.${field}`;
}

export function detailValueKey(source: string): string {
  let hash = 0x811c9dc5;
  for (let index = 0; index < source.length; index += 1) {
    hash ^= source.charCodeAt(index);
    hash = Math.imul(hash, 0x01000193);
  }
  return `productsDetail.values.${(hash >>> 0).toString(16).padStart(8, "0")}`;
}

const PHRASE_TRANSLATIONS: Record<string, Record<string, string>> = {
  zh: {
    "A 30-80% DC top-up takes about 30 minutes, with household charging support making overnight energy easy and economical.": "直流快充 30-80% 约需 30 分钟，支持家用充电，让夜间补能轻松又经济。",
    "Best-selling compact SUV — DiLink cockpit + Blade Battery + V2L": "畅销紧凑型SUV——DiLink座舱、刀片电池及V2L",
    "DiLink Cockpit": "DiLink 智能座舱",
    "Compact SUV Bestseller": "畅销紧凑型SUV",
    "High ground clearance, hot seller": "高离地间隙，热销车型",
    "V2L + Fast Charge 30min": "V2L 对外放电 + 30分钟快充",
    "LFP Blade": "磷酸铁锂刀片电池",
    "MacPherson": "麦弗逊式独立悬架",
    "Torsion Beam": "扭力梁式非独立悬架",
    "Heat Pump + Fast Charge": "热泵空调 + 直流快充",
    "DiPilot 100": "DiPilot 100 智能驾驶辅助",
    "Comfort Urban Hatchback": "舒适城市两厢车",
    "Global Export Flagship": "全球出口旗舰车型",
    "Fast Charge 30min": "30分钟快充",
    "DiPilot": "DiPilot 智能驾驶",
    "Commercial Taxi & Fleet Standard": "网约出租及车队标配",
    "1M+ units market tested": "百万销量市场验证",
    "Fast Charge 20min": "20分钟快充",
    "Flyme Auto Cockpit": "Flyme Auto 智能座舱",
    "Global Family Smart SUV": "全球家用智能SUV",
    "High international interest": "海外市场高关注度",
    "Air Suspension": "空气悬架",
    "Full-Size Luxury Family SUV": "全尺寸豪华家用SUV",
    "800V HyperCharge": "800V 超级快充",
    "Ultra-Tech Performance SUV": "高科技性能SUV",
    "DC Fast Charge 20min": "20分钟直流快充",
    "Luxury Family EREV SUV": "豪华家用增程式SUV",
    "Dual Airbags + Touchscreen": "双安全气囊 + 触控中控屏",
    "Entry City Commuter": "入门代步微型车",
    "High reliability entry car": "高可靠性入门车型",
    "5-min Flash Charge": "5分钟闪充",
    "Commercial Operating System": "营运车辆专用系统",
    "Commercial Ride-Hailing Fleet": "网约车队首选",
    "6-year / 600,000km durability": "6年/60万公里营运耐久度",
  },
  am: {
    "A 30-80% DC top-up takes about 30 minutes, with household charging support making overnight energy easy and economical.": "ከ30-80% DC ፈጣን መሙላት አነስተኛ 30 ደቂቃ ይወስዳል፣ የቤት መሙያ ድጋፍ ያለው ሲሆን የሌሊት ኃይል መሙላት ቀላል እና ቆጣቢ ያደርገዋል።",
    "Best-selling compact SUV — DiLink cockpit + Blade Battery + V2L": "በጣም የተሸጠ ኮምፓክት SUV — DiLink ኮክፒት + ብሌድ ባትሪ + V2L",
    "DiLink Cockpit": "DiLink ስማርት ኮክፒት",
    "Compact SUV Bestseller": "በጣም የተሸጠ ኮምፓክት SUV",
    "High ground clearance, hot seller": "ከፍ ያለ የመሬት ርቀት፣ ትኩስ ተሸጭ",
    "V2L + Fast Charge 30min": "V2L + 30 ደቂቃ ፈጣን መሙላት",
    "LFP Blade": "LFP ብሌድ ባትሪ",
    "MacPherson": "ማክፈርሰን እገዳ",
    "Torsion Beam": "ቶርሽን ቢም እገዳ",
    "Heat Pump + Fast Charge": "ሂት ፓምፕ + ፈጣን መሙላት",
    "DiPilot 100": "DiPilot 100 አሽከርካሪ እገዛ",
    "Comfort Urban Hatchback": "ምቹ የከተማ ሃችባክ",
    "Global Export Flagship": "የዓለም አቀፍ ኤክስፖርት ፍላግሺፕ",
    "Fast Charge 30min": "30 ደቂቃ ፈጣን መሙላት",
    "DiPilot": "DiPilot አሽከርካሪ እገዛ",
    "Commercial Taxi & Fleet Standard": "የታክሲ እና የፍሊት መደበኛ",
    "1M+ units market tested": "ከ1 ሚሊዮን በላይ ተሽከርካሪዎች የተረጋገጡ",
    "Fast Charge 20min": "20 ደቂቃ ፈጣን መሙላት",
    "Flyme Auto Cockpit": "Flyme Auto ስማርት ኮክፒት",
    "Global Family Smart SUV": "የዓለም አቀፍ ቤተሰብ ስማርት SUV",
    "High international interest": "ከፍተኛ የዓለም አቀፍ ፍላጎት",
    "Air Suspension": "ኤር እገዳ",
    "Full-Size Luxury Family SUV": "ሙሉ መጠን የቅንጦት ቤተሰብ SUV",
    "800V HyperCharge": "800V ሃይፐር ቻርጅ",
    "Ultra-Tech Performance SUV": "ከፍተኛ ቴክኖሎጂ ፐርፎርማንስ SUV",
    "DC Fast Charge 20min": "20 ደቂቃ DC ፈጣን መሙላት",
    "Luxury Family EREV SUV": "የቅንጦት ቤተሰብ EREV SUV",
    "Dual Airbags + Touchscreen": "ሁለት ኤርባግ + ንክኪ ማያ",
    "Entry City Commuter": "የመግቢያ የከተማ መኪና",
    "High reliability entry car": "ከፍተኛ ተዓማኒነት ያለው መኪና",
    "5-min Flash Charge": "5 ደቂቃ ፍላሽ ቻርጅ",
    "Commercial Operating System": "የንግድ ኦፐሬቲንግ ስርዓት",
    "Commercial Ride-Hailing Fleet": "የንግድ ራይድ ፍሊት",
    "6-year / 600,000km durability": "6 ዓመት / 600,000 ኪ.ሜ የረጅም ጊዜ ጽናት",
  },
};

export function translatedDetailValue(
  translate: DetailTranslate,
  source: string,
  locale?: string,
): string {
  if (!source) return source;
  const key = detailValueKey(source);
  const value = translate(key, source);
  if (
    typeof value === "string" &&
    value &&
    value !== key &&
    value !== source &&
    !value.startsWith("productsDetail.") &&
    !value.includes("productsDetail.values")
  ) {
    return value;
  }
  if (locale && locale !== "en" && PHRASE_TRANSLATIONS[locale]?.[source]) {
    return PHRASE_TRANSLATIONS[locale][source];
  }
  return source;
}

export function translatedDetailValues(
  translate: DetailTranslate,
  source: string[],
  locale?: string,
): string[] {
  return source.map((value) => translatedDetailValue(translate, value, locale));
}

export function translatedDetailString(
  translate: DetailTranslate,
  key: string,
  fallback: string,
): string {
  const value = translate(key, fallback);
  if (
    typeof value === "string" &&
    value &&
    value !== key &&
    !value.startsWith("productsDetail.") &&
    !value.includes("productsDetail.values")
  ) {
    return value;
  }
  return fallback;
}

export function translatedDetailArray<T>(
  translate: DetailTranslate,
  key: string,
  fallback: T[],
): T[] {
  const value = translate(key);
  return Array.isArray(value) && value.length === fallback.length ? value as T[] : fallback;
}
