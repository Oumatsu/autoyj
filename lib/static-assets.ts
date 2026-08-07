/**
 * Centralized Static Asset Resolver for Autoyj
 * Ensures zero dependency on D1 database for public image URLs,
 * and maps every vehicle model, academy lesson, and insight article
 * strictly to verified static assets in /public/pic/...
 */

const VEHICLE_IMAGE_MAP: Record<string, string> = {
  // Revenue King
  "geely-geome": "/pic/hero/Geome display.webp",
  "byd-yuan-up": "/pic/revenue-king/yuanup/5.webp",
  "leapmotor-lafa5": "/pic/revenue-king/lafa5/8cut.webp",
  "byd-seagull": "/pic/revenue-king/seagull/7.webp",
  "leapmotor-t03": "/pic/revenue-king/T03/5.webp",
  "changan-lumin": "/pic/revenue-king/lumin/5.webp",
  "wuling-bingo-plus": "/pic/revenue-king/bingoplus/5.webp",
  "byd-dolphin": "/pic/revenue-king/dolphin/7cut.webp",
  "gac-aion-rt": "/pic/revenue-king/RT/7.webp",
  "leopard-ti3": "/pic/revenue-king/Ti3/6.webp",
  "gac-aion-y-plus": "/pic/revenue-king/Yplus/5.webp",
  "geely-galaxy-e5": "/pic/revenue-king/Galaxye5/5.webp",
  "byd-qin-plus": "/pic/revenue-king/qinplusev/3.webp",
  "geely-geometry-c": "/pic/revenue-king/geometryc/6.webp",
  "gac-aion-i60": "/pic/revenue-king/I60/1.webp",
  "gac-aion-v": "/pic/revenue-king/V/1.webp",
  "deepal-s07": "/pic/revenue-king/S07/1.webp",
  "deepal-s05": "/pic/revenue-king/S05/1.webp",
  "linghui-e7": "/pic/revenue-king/E7/1.webp",
  "mg-mg4-ev": "/pic/revenue-king/MG4/1.webp",
  "dongfeng-nammi-01": "/pic/revenue-king/01/1.webp",
  "changan-nevo-q05": "/pic/revenue-king/Q05/1.webp",

  // Utility Pro
  "byd-shark": "/pic/utility-pro/shark/4cut2.webp",
  "radar-rd6": "/pic/utility-pro/RD6/7.webp",
  "tank-500-hi4t": "/pic/utility-pro/Hi4-T/3cut.webp",
  "fangchengbao-leopard-8": "/pic/utility-pro/leopard8/7.webp",
  "zeekr-9x": "/pic/utility-pro/9x/6.webp",
  "gwm-cannon-ev": "/pic/utility-pro/cannonev/7.webp",
  "dongfeng-rich-6-ev": "/pic/utility-pro/rich6ev/7.webp",
  "farizon-xingxiang-v": "/pic/utility-pro/xingxiangv/5.webp",
  "farizon-super-van": "/pic/utility-pro/supervan/1.webp",
  "farizon-t5": "/pic/utility-pro/T5/1.webp",
  "maxus-edeliver9": "/pic/utility-pro/edeliver9/1.webp",
  "foton-aumark-ev": "/pic/utility-pro/eaumark/1.webp",

  // Elite Flagship
  "byd-seal": "/pic/elite-flagship/seal/5.webp",
  "byd-han-ev": "/pic/elite-flagship/hanev/5.webp",
  "geely-galaxy-m9": "/pic/elite-flagship/M9/1.webp",
  "byd-sealion-7": "/pic/elite-flagship/sealion/13.webp",
  "fangchengbao-leopard-5": "/pic/elite-flagship/leopard5/7.webp",
  "fangchengbao-ti7": "/pic/elite-flagship/Ti7/5.webp",
  "xiaomi-yu7": "/pic/elite-flagship/YU7/7cut.webp",
  "byd-tang-l-ev": "/pic/elite-flagship/tanglev/5.webp",
  "li-auto-l6": "/pic/elite-flagship/L6/5cut.webp",
  "xpeng-g9": "/pic/elite-flagship/XpengG9/5cut.webp",
  "zeekr-001": "/pic/elite-flagship/001/1.webp",
  "xiaomi-su7-ultra": "/pic/elite-flagship/SU7ultra/6.webp",
  "stelato-s9": "/pic/elite-flagship/S9/5.webp",
  "aito-m9": "/pic/elite-flagship/M9/6.webp",
  "hongqi-e-hs9": "/pic/elite-flagship/E-HS9/1.webp",
  "leapmotor-d19": "/pic/elite-flagship/D19/1.webp",
  "voyah-taishan-x8": "/pic/elite-flagship/X8/1.webp",
  "denza-d9-dmi": "/pic/elite-flagship/denza d9 dm-i/1.webp",
  "yangwang-u8": "/pic/elite-flagship/yangwang U8/1.webp",
};

const MODEL_FOLDER_MAP: Record<string, { catDir: string; folderName: string }> = {
  // Revenue King
  "geely-geome": { catDir: "revenue-king", folderName: "Geome" },
  "byd-yuan-up": { catDir: "revenue-king", folderName: "yuanup" },
  "leapmotor-lafa5": { catDir: "revenue-king", folderName: "lafa5" },
  "byd-seagull": { catDir: "revenue-king", folderName: "seagull" },
  "leapmotor-t03": { catDir: "revenue-king", folderName: "T03" },
  "changan-lumin": { catDir: "revenue-king", folderName: "lumin" },
  "wuling-bingo-plus": { catDir: "revenue-king", folderName: "bingoplus" },
  "byd-dolphin": { catDir: "revenue-king", folderName: "dolphin" },
  "gac-aion-rt": { catDir: "revenue-king", folderName: "RT" },
  "leopard-ti3": { catDir: "revenue-king", folderName: "Ti3" },
  "gac-aion-y-plus": { catDir: "revenue-king", folderName: "Yplus" },
  "geely-galaxy-e5": { catDir: "revenue-king", folderName: "Galaxye5" },
  "byd-qin-plus": { catDir: "revenue-king", folderName: "qinplusev" },
  "geely-geometry-c": { catDir: "revenue-king", folderName: "geometryc" },
  "gac-aion-i60": { catDir: "revenue-king", folderName: "I60" },
  "gac-aion-v": { catDir: "revenue-king", folderName: "V" },
  "deepal-s07": { catDir: "revenue-king", folderName: "S07" },
  "deepal-s05": { catDir: "revenue-king", folderName: "S05" },
  "linghui-e7": { catDir: "revenue-king", folderName: "E7" },
  "mg-mg4-ev": { catDir: "revenue-king", folderName: "MG4" },
  "dongfeng-nammi-01": { catDir: "revenue-king", folderName: "01" },
  "changan-nevo-q05": { catDir: "revenue-king", folderName: "Q05" },

  // Utility Pro
  "byd-shark": { catDir: "utility-pro", folderName: "shark" },
  "radar-rd6": { catDir: "utility-pro", folderName: "RD6" },
  "tank-500-hi4t": { catDir: "utility-pro", folderName: "Hi4-T" },
  "fangchengbao-leopard-8": { catDir: "utility-pro", folderName: "leopard8" },
  "zeekr-9x": { catDir: "utility-pro", folderName: "9x" },
  "gwm-cannon-ev": { catDir: "utility-pro", folderName: "cannonev" },
  "dongfeng-rich-6-ev": { catDir: "utility-pro", folderName: "rich6ev" },
  "farizon-xingxiang-v": { catDir: "utility-pro", folderName: "xingxiangv" },
  "farizon-super-van": { catDir: "utility-pro", folderName: "supervan" },
  "farizon-t5": { catDir: "utility-pro", folderName: "T5" },
  "maxus-edeliver9": { catDir: "utility-pro", folderName: "edeliver9" },
  "foton-aumark-ev": { catDir: "utility-pro", folderName: "eaumark" },

  // Elite Flagship
  "byd-seal": { catDir: "elite-flagship", folderName: "seal" },
  "byd-han-ev": { catDir: "elite-flagship", folderName: "hanev" },
  "geely-galaxy-m9": { catDir: "elite-flagship", folderName: "M9" },
  "byd-sealion-7": { catDir: "elite-flagship", folderName: "sealion" },
  "fangchengbao-leopard-5": { catDir: "elite-flagship", folderName: "leopard5" },
  "fangchengbao-ti7": { catDir: "elite-flagship", folderName: "Ti7" },
  "xiaomi-yu7": { catDir: "elite-flagship", folderName: "YU7" },
  "byd-tang-l-ev": { catDir: "elite-flagship", folderName: "tanglev" },
  "li-auto-l6": { catDir: "elite-flagship", folderName: "L6" },
  "xpeng-g9": { catDir: "elite-flagship", folderName: "XpengG9" },
  "zeekr-001": { catDir: "elite-flagship", folderName: "001" },
  "xiaomi-su7-ultra": { catDir: "elite-flagship", folderName: "SU7ultra" },
  "stelato-s9": { catDir: "elite-flagship", folderName: "S9" },
  "aito-m9": { catDir: "elite-flagship", folderName: "M9" },
  "hongqi-e-hs9": { catDir: "elite-flagship", folderName: "E-HS9" },
  "leapmotor-d19": { catDir: "elite-flagship", folderName: "D19" },
  "voyah-taishan-x8": { catDir: "elite-flagship", folderName: "X8" },
  "denza-d9-dmi": { catDir: "elite-flagship", folderName: "denza d9 dm-i" },
  "yangwang-u8": { catDir: "elite-flagship", folderName: "yangwang U8" },
};

/** Returns the main static cover image for a given vehicle model slug. */
export function getVehicleModelImage(slug: string, rawImageUrl?: string): string {
  if (slug && VEHICLE_IMAGE_MAP[slug]) {
    return VEHICLE_IMAGE_MAP[slug];
  }
  if (rawImageUrl && rawImageUrl.startsWith("/pic/")) {
    return rawImageUrl;
  }
  return "/pic/hero/0.webp";
}

/** Returns static gallery slide images for a given vehicle model. */
export function getVehicleGalleryImages(slug: string, primaryImg?: string): Array<{ src: string; cat: string; label: string }> {
  const mainCover = getVehicleModelImage(slug, primaryImg);
  const folderInfo = MODEL_FOLDER_MAP[slug];
  if (!folderInfo) {
    return [
      { src: mainCover, cat: "Exterior", label: "Main Profile" },
      { src: "/pic/hero/photo-1593941707882-a5bba14938c7.webp", cat: "Charging", label: "Depot Charger" },
      { src: "/pic/hero/photo-1486262715619-67b85e0b08d3.webp", cat: "Interior", label: "Cockpit View" },
    ];
  }

  const { catDir, folderName } = folderInfo;
  return [
    { src: mainCover, cat: "Exterior", label: "Front Angle" },
    { src: `/pic/${catDir}/${folderName}/1.webp`, cat: "Exterior", label: "Side Profile" },
    { src: `/pic/${catDir}/${folderName}/2.webp`, cat: "Interior", label: "Cabin & Dashboard" },
    { src: `/pic/${catDir}/${folderName}/3.webp`, cat: "Details", label: "Trunk & Powertrain" },
  ];
}
