import { spawnSync } from "node:child_process";
import path from "node:path";

const BASE_TOKEN = process.env.FEISHU_BASE_APP_TOKEN || "Is6Xb3btbazhFhsDXgFcqFG1nRc";
const TABLE_ID = "tblATd4EWHge1l1k";
const PRODUCT_URLS = process.env.CATALOG_PRODUCTS_URL
  ? [process.env.CATALOG_PRODUCTS_URL]
  : [
      "https://youguard-preview.wx1556282800.workers.dev/api/portal/public/products",
      "https://youguard-preview.haipee.workers.dev/api/portal/public/products",
    ];
const WRITE = process.argv.includes("--write");

const modelNamesZh = {
  "aito-m9": "问界M9",
  "byd-han-ev": "比亚迪汉EV",
  "byd-seal": "比亚迪海豹",
  "byd-sealion-7": "比亚迪海狮07 EV",
  "byd-tang-l-ev": "比亚迪唐L EV",
  "fangchengbao-leopard-5": "方程豹豹5",
  "fangchengbao-ti7": "方程豹钛7",
  "geely-galaxy-m9": "吉利银河M9",
  "hongqi-e-hs9": "红旗E-HS9",
  "leapmotor-d19": "零跑D19",
  "li-auto-l6": "理想L6",
  "stelato-s9": "享界S9",
  "voyah-taishan-x8": "岚图泰山X8",
  "xiaomi-su7-ultra": "小米SU7 Ultra",
  "xiaomi-yu7": "小米YU7",
  "xpeng-g9": "小鹏G9",
  "zeekr-001": "极氪001",
  "byd-dolphin": "比亚迪海豚",
  "byd-qin-plus": "比亚迪秦PLUS EV",
  "byd-seagull": "比亚迪海鸥",
  "byd-yuan-up": "比亚迪元UP",
  "changan-lumin": "长安Lumin",
  "changan-nevo-q05": "长安启源Q05",
  "deepal-s05": "深蓝S05",
  "deepal-s07": "深蓝S07",
  "dongfeng-nammi-01": "东风纳米01",
  "gac-aion-i60": "广汽埃安i60",
  "gac-aion-rt": "广汽埃安RT",
  "gac-aion-v": "广汽埃安AION V",
  "gac-aion-y-plus": "广汽埃安AION Y Plus",
  "geely-galaxy-e5": "吉利银河E5",
  "geely-geome": "吉利星愿",
  "geely-geometry-c": "吉利几何C",
  "leapmotor-lafa5": "零跑Lafa5",
  "leapmotor-t03": "零跑T03",
  "leopard-ti3": "方程豹钛3",
  "linghui-e7": "领汇e7",
  "mg-mg4-ev": "MG4 EV",
  "wuling-bingo-plus": "五菱缤果PLUS",
  "byd-shark": "比亚迪SHARK",
  "dongfeng-rich-6-ev": "东风锐骐6 EV",
  "fangchengbao-leopard-8": "方程豹豹8",
  "farizon-xingxiang-v": "远程星享V",
  "gwm-cannon-ev": "长城炮EV",
  "radar-rd6": "雷达RD6",
  "tank-500-hi4t": "坦克500 Hi4-T",
  "zeekr-9x": "极氪9X",
};

const highlightsZh = {
  "aito-m9": "【中国科技旗舰】华为ADS 3.0——投影大灯、途灵底盘及完整鸿蒙生态",
  "byd-han-ev": "【中国旗舰轿车】Dragon Face设计、刀片电池、DiPilot 300激光雷达及丹拿音响",
  "byd-seal": "激光雷达+800V快充——CTB技术与DiPilot 300；设计、操控和补能全面升级",
  "byd-sealion-7": "【2025旗舰SUV】e平台3.0 Evo——23,000转电机、双枪快充及全球旗舰定位",
  "byd-tang-l-ev": "【家庭旗舰】超级e平台——810 kW三电机、3.6秒破百、7座及闪充",
  "fangchengbao-leopard-5": "DMO超级混动越野——4.8秒破百、豹式掉头、双差速锁及35°接近角",
  "fangchengbao-ti7": "【闪充标杆】方盒子SUV——充电5分钟、755 km续航及201 L前备箱",
  "geely-galaxy-m9": "【高价值旗舰】同级少有的空气悬架+三电机四驱——5.2米全尺寸六座SUV及AI座舱",
  "hongqi-e-hs9": "“中国劳斯莱斯”——强大气场、空气悬架、豪华内饰及中东与中亚高端市场辨识度",
  "leapmotor-d19": "纯电版1000V / 增程版800V；15分钟可从30%充至80%",
  "li-auto-l6": "【稳健增程之选】2024年中国豪华增程SUV销量领先——电视、冰箱、大沙发；运行成本较同级燃油车低60%",
  "stelato-s9": "【华为旗舰轿车】对标S级——零重力后排座椅、隐私屏及ADS高阶辅助驾驶",
  "voyah-taishan-x8": "800V / 5C；12分钟可从20%充至80%",
  "xiaomi-su7-ultra": "高性能科技旗舰——1,500+马力、碳纤维空气动力学套件及完整小米生态",
  "xiaomi-yu7": "【热门高端SUV】小米首款SUV——835 km续航、3.2秒破百及澎湃OS",
  "xpeng-g9": "800V智能驾驶标杆——SiC平台与丹拿座舱；在北欧及东南亚市场口碑良好",
  "zeekr-001": "全系800V+激光雷达——超快充、自研电机及高水准猎装车设计",
  "byd-dolphin": "2025款舒适悬架——e平台3.0，全系配备热泵",
  "byd-qin-plus": "百万辆级市场验证——超低风阻、大后备箱及较低售后成本",
  "byd-seagull": "全球畅销通勤车——刀片电池、旋转中控屏及成熟三电系统",
  "byd-yuan-up": "畅销紧凑型SUV——DiLink座舱、刀片电池及V2L",
  "changan-lumin": "入门价格下的高品质——高强度钢车身及灵活充电方式",
  "changan-nevo-q05": "3C快充，15分钟可从30%充至80%",
  "deepal-s05": "3C快充，15分钟可从30%充至80%",
  "deepal-s07": "提供华为乾崑辅助驾驶版本；纯电版支持快充",
  "dongfeng-nammi-01": "提供超级快充版本",
  "gac-aion-i60": "支持直流快充；提供纯电和增程车型",
  "gac-aion-rt": "【2025新标杆】激光雷达辅助驾驶、宽裕后排腿部空间及400V快充",
  "gac-aion-v": "宣称快充15分钟即可恢复长续航能力",
  "gac-aion-y-plus": "方盒子设计、宽开度车门及适合露营的空间布局",
  "geely-galaxy-e5": "【成熟可靠】神盾短刀电池、银河OS及全球化安全设计",
  "geely-geome": "智能城市两厢车——Flyme Auto、36处储物空间及540°全景影像",
  "geely-geometry-c": "中东畅销车型——出色真实续航及高温环境优化",
  "leapmotor-lafa5": "科技潮流车型——800V、激光雷达、2.5K座舱屏及605 km续航",
  "leapmotor-t03": "Stellantis支持、欧洲标准及8英寸+10英寸双屏",
  "leopard-ti3": "方程豹硬派纯电SUV——4.9秒破百及151 L前备箱",
  "linghui-e7": "闪充版本：5分钟从10%充至70%，9分钟从10%充至97%",
  "mg-mg4-ev": "MG×OPPO智能座舱；CTB电池车身一体化",
  "wuling-bingo-plus": "复古设计、510 km续航及轻松易驾",
  "byd-shark": "【2025全球焦点】DMO越野平台——大功率V2L、1,000 km+综合续航及50%–60%燃料成本节省",
  "dongfeng-rich-6-ev": "经典耐用纯电皮卡——日产纳瓦拉平台、高离地间隙及成熟动力系统；适合矿区高强度使用",
  "fangchengbao-leopard-8": "【旗舰越野】DMO超级混动、华为ADS双激光雷达、豹式掉头及800V闪充",
  "farizon-xingxiang-v": "远程城市配送主力——6 m³货厢、低故障率及成熟售后；每月可节省约350–500美元",
  "gwm-cannon-ev": "坦克平台、坚固车身及成熟越野能力——适应严苛环境，海外市场口碑良好",
  "radar-rd6": "6 kW V2L、SUV级舒适性及大前备箱——运行成本约为柴油皮卡的1/5",
  "tank-500-hi4t": "硬派越野PHEV——机械四驱、豪华内饰及强脱困能力；兼顾城市纯电与长途穿越",
  "zeekr-9x": "【超豪华SUV】900V浩瀚-S——1,030 kW三电机、3.1秒破百、6座及6C超快充",
};

const highlightsAm = {
  "aito-m9": "[የቻይና የቴክኖሎጂ ቁንጮ] Huawei ADS 3.0 — ፕሮጀክሽን የፊት መብራቶች፣ Turing ቻሲ እና ሙሉ የHuawei ሥነ-ምህዳር",
  "byd-dolphin": "የ2025 ምቹ የማንጠልጠያ ስርዓት — e-Platform 3.0 እና በሁሉም ሞዴል አማራጮች የሙቀት ፓምፕ",
  "byd-han-ev": "[የቻይና ፍላግሺፕ ሴዳን] Dragon Face ዲዛይን፣ Blade Battery፣ DiPilot 300 LiDAR እና Dynaudio ድምፅ",
  "byd-qin-plus": "ከ1 ሚሊዮን በላይ ተሽከርካሪዎች የተረጋገጠ — እጅግ ዝቅተኛ የአየር መቋቋም፣ ትልቅ የሻንጣ ክፍል እና ዝቅተኛ የከሽያጭ አገልግሎት ወጪ",
  "byd-seagull": "በዓለም ተወዳጅ የከተማ መጓጓዣ መኪና — Blade Battery፣ የሚሽከረከር ንክኪ ማያ ገጽ እና የተረጋገጠ የኤሌክትሪክ ስርዓት",
  "byd-seal": "LiDAR እና 800V ፈጣን መሙላት — CTB ቴክኖሎጂ እና DiPilot 300፤ ውብ ዲዛይን፣ የተሻለ አነዳድ እና ፈጣን መሙላት",
  "byd-sealion-7": "[የ2025 ፍላግሺፕ SUV] e-Platform 3.0 Evo — 23,000 rpm ሞተር፣ ባለሁለት መሙያ ፈጣን ቻርጅ እና ዓለም አቀፍ ፍላግሺፕ አቀማመጥ",
  "byd-shark": "[የ2025 ዓለም አቀፍ ትኩረት] DMO ከመንገድ ውጭ መድረክ — ከፍተኛ ኃይል V2L፣ ከ1,000 km በላይ የመንዳት ርቀት እና 50–60% የነዳጅ ቁጠባ",
  "byd-tang-l-ev": "[የቤተሰብ ፍላግሺፕ] Super e-Platform — 810 kW ባለሦስት ሞተር፣ ከ0–100 km/h በ3.6 ሰከንድ፣ 7 መቀመጫዎች እና እጅግ ፈጣን መሙላት",
  "byd-yuan-up": "በጣም ተወዳጅ ኮምፓክት SUV — DiLink የአሽከርካሪ ክፍል፣ Blade Battery እና V2L",
  "changan-lumin": "በመግቢያ ዋጋ ከፍተኛ ጥራት — ከፍተኛ ጥንካሬ ያለው ብረት እና ተለዋዋጭ የመሙላት አማራጮች",
  "changan-nevo-q05": "3C ፈጣን መሙላት፤ ባትሪውን ከ30% ወደ 80% በ15 ደቂቃ",
  "deepal-s05": "3C ፈጣን መሙላት፤ ባትሪውን ከ30% ወደ 80% በ15 ደቂቃ",
  "deepal-s07": "Huawei Qiankun ADAS ያላቸው ሞዴል አማራጮች፤ ፈጣን መሙላት የሚደግፍ BEV",
  "dongfeng-nammi-01": "እጅግ ፈጣን መሙላት የሚደግፉ ሞዴል አማራጮች",
  "dongfeng-rich-6-ev": "ጠንካራና የተረጋገጠ ኤሌክትሪክ ፒካፕ — Nissan Navara መድረክ፣ ከፍተኛ የመሬት ክፍተት እና የበሰለ የኃይል ስርዓት፤ በማዕድን ሥራ ዝቅተኛ የብልሽት መጠን",
  "fangchengbao-leopard-5": "DMO ሱፐር ሃይብሪድ ከመንገድ ውጭ ስርዓት — ከ0–100 km/h በ4.8 ሰከንድ፣ Tank Turn፣ ባለሁለት ዲፈረንሻል መቆለፊያ እና 35° የመግቢያ አንግል",
  "fangchengbao-leopard-8": "[ፍላግሺፕ ከመንገድ ውጭ SUV] DMO ሱፐር ሃይብሪድ — Huawei ADS ባለሁለት LiDAR፣ Tank Turn እና 800V እጅግ ፈጣን መሙላት",
  "fangchengbao-ti7": "[የፈጣን መሙላት መሪ] ሳጥን ቅርጽ SUV — በ5 ደቂቃ መሙላት፣ 755 km የመንዳት ርቀት እና 201 L የፊት ሻንጣ ክፍል",
  "farizon-xingxiang-v": "የFarizon የከተማ ማድረሻ መሪ — 6 m³ የጭነት ቦታ፣ እጅግ ዝቅተኛ የብልሽት መጠን እና የተረጋገጠ ከሽያጭ በኋላ አገልግሎት፤ በወር $350–$500 ይቆጥባል",
  "gac-aion-i60": "DC ፈጣን መሙላት፤ BEV እና EREV የኃይል አማራጮች",
  "gac-aion-rt": "[የ2025 አዲስ መሪ] LiDAR ብልህ አነዳድ፣ ሰፊ የኋላ እግር ቦታ እና 400V ፈጣን መሙላት",
  "gac-aion-v": "በ15 ደቂቃ ፈጣን መሙላት ረጅም የመንዳት ርቀትን እንደሚመልስ የተገለጸ",
  "gac-aion-y-plus": "ሳጥን ቅርጽ ዲዛይን፣ በሰፊው የሚከፈቱ በሮች እና ለካምፒንግ ምቹ የውስጥ አቀማመጥ",
  "geely-galaxy-e5": "[በተግባር የተፈተነ] Shield Short-Blade Battery፣ Galaxy OS እና ዓለም አቀፍ የደህንነት ዲዛይን",
  "geely-galaxy-m9": "[ከፍተኛ ዋጋ የሚሰጥ] በክፍሉ ውስጥ ልዩ የአየር ማንጠልጠያ እና ባለሦስት ሞተር AWD — 5.2 m ሙሉ መጠን ባለ6 መቀመጫ SUV እና AI የአሽከርካሪ ክፍል",
  "geely-geome": "ብልህ የከተማ ሃችባክ — Flyme Auto፣ 36 የማከማቻ ክፍሎች እና 540° ካሜራ",
  "geely-geometry-c": "በመካከለኛው ምሥራቅ ተወዳጅ — በእውነተኛ አጠቃቀም ጥሩ የመንዳት ርቀት እና ለከፍተኛ ሙቀት የተመቻቸ",
  "gwm-cannon-ev": "Tank ቻሲ፣ እጅግ ጠንካራ አካል እና የተረጋገጠ ከመንገድ ውጭ ብቃት — በከባድ ሁኔታዎች እጅግ አስተማማኝ እና በውጭ ገበያ ጥሩ ስም",
  "hongqi-e-hs9": "“የቻይና Rolls-Royce” — የሚያስደምም ገጽታ፣ የአየር ማንጠልጠያ እና የቅንጦት ውስጣዊ ክፍል፤ በመካከለኛው ምሥራቅና በማዕከላዊ እስያ የክብር ምልክት",
  "leapmotor-d19": "1000V BEV / 800V EREV፤ ባትሪውን ከ30% ወደ 80% በ15 ደቂቃ",
  "leapmotor-lafa5": "የቴክኖሎጂ አዲስ ተፎካካሪ — 800V፣ LiDAR፣ 2.5K የአሽከርካሪ ማያ ገጽ እና 605 km የመንዳት ርቀት",
  "leapmotor-t03": "በStellantis የተደገፈ፣ የአውሮፓ ደረጃዎች እና ባለ8 ኢንች + 10 ኢንች ሁለት ማያ ገጾች",
  "leopard-ti3": "Formula Leopard ጠንካራ ኤሌክትሪክ SUV — ከ0–100 km/h በ4.9 ሰከንድ እና 151 L የፊት ሻንጣ ክፍል",
  "li-auto-l6": "[አስተማማኝ የEREV ምርጫ] በ2024 በቻይና ቁጥር 1 የቅንጦት EREV SUV — ቲቪ፣ ማቀዝቀዣ እና ሶፋ፤ ከተመሳሳይ የነዳጅ መኪና 60% ዝቅተኛ የስራ ወጪ",
  "linghui-e7": "ፈጣን መሙላት ያላቸው ሞዴሎች፦ ከ10% ወደ 70% በ5 ደቂቃ፣ ከ10% ወደ 97% በ9 ደቂቃ",
  "mg-mg4-ev": "MG × OPPO የአሽከርካሪ ክፍል፤ CTB ባትሪና የመኪና አካል ውህደት",
  "radar-rd6": "6 kW V2L፣ የSUV ደረጃ ምቾት እና ትልቅ የፊት ሻንጣ ክፍል — የስራ ወጪው ከዲዝል ፒካፕ 1/5 ብቻ",
  "stelato-s9": "[Huawei ፍላግሺፕ ሴዳን] ከS-Class ጋር የሚወዳደር — ዜሮ-ግራቪቲ የኋላ መቀመጫዎች፣ የግላዊነት ማያ ገጽ እና ADS የላቀ የአነዳድ እገዛ",
  "tank-500-hi4t": "ጠንካራ ከመንገድ ውጭ PHEV — ሜካኒካል 4WD፣ የቅንጦት ውስጣዊ ክፍል እና ከባድ ሁኔታ የማለፍ ብቃት፤ ለከተማ ኤሌክትሪክ አነዳድና ለረጅም ጉዞ",
  "voyah-taishan-x8": "800V / 5C፤ ባትሪውን ከ20% ወደ 80% በ12 ደቂቃ",
  "wuling-bingo-plus": "ሬትሮ ዲዛይን፣ 510 km የመንዳት ርቀት እና ቀላል አነዳድ",
  "xiaomi-su7-ultra": "ከፍተኛ አፈጻጸምና የቴክኖሎጂ ክብር — ከ1,500 hp በላይ፣ የካርቦን ፋይበር ኤሮ ኪት እና ሙሉ የXiaomi ሥነ-ምህዳር",
  "xiaomi-yu7": "[ተወዳጅ ፕሪሚየም SUV] የXiaomi የመጀመሪያ SUV — 835 km የመንዳት ርቀት፣ ከ0–100 km/h በ3.2 ሰከንድ እና HyperOS",
  "xpeng-g9": "የ800V ብልህ አነዳድ መለኪያ — SiC መድረክ እና Dynaudio የውስጥ ድምፅ፤ በሰሜን አውሮፓና በደቡብ-ምሥራቅ እስያ ጥሩ ስም",
  "zeekr-001": "በሁሉም ሞዴሎች 800V እና LiDAR — እጅግ ፈጣን መሙላት፣ በኩባንያው የተሠራ ሞተር እና ከፍተኛ ደረጃ የshooting brake ዲዛይን",
  "zeekr-9x": "[እጅግ የቅንጦት SUV] 900V SEA-S — 1,030 kW ባለሦስት ሞተር፣ ከ0–100 km/h በ3.1 ሰከንድ፣ 6 መቀመጫዎች እና 6C እጅግ ፈጣን መሙላት",
};

const filterTranslations = {
  vehicleClass: {
    "Cargo Van": ["厢式货车", "የጭነት ቫን"],
    "Compact EV Hatch": ["紧凑型纯电两厢车", "ኮምፓክት ኤሌክትሪክ ሃችባክ"],
    "Compact Sedan": ["紧凑型轿车", "ኮምፓክት ሴዳን"],
    "Compact SUV": ["紧凑型SUV", "ኮምፓክት SUV"],
    "Executive Sedan": ["行政级轿车", "የአስፈጻሚ ሴዳን"],
    "Full-size SUV": ["全尺寸SUV", "ሙሉ መጠን SUV"],
    "Hatchback (Sub-Compact)": ["小型两厢车", "ንዑስ-ኮምፓክት ሃችባክ"],
    "Large SUV": ["大型SUV", "ትልቅ SUV"],
    "Mid-size EV Sedan": ["中型纯电轿车", "መካከለኛ መጠን ኤሌክትሪክ ሴዳን"],
    "Mid-size SUV": ["中型SUV", "መካከለኛ መጠን SUV"],
    "Pickup Truck": ["皮卡", "ፒካፕ መኪና"],
    "Premium SUV": ["高端SUV", "ፕሪሚየም SUV"],
    Sedan: ["轿车", "ሴዳን"],
    "Small EV Hatch": ["小型纯电两厢车", "አነስተኛ ኤሌክትሪክ ሃችባክ"],
    "Small Sedan": ["小型轿车", "አነስተኛ ሴዳን"],
  },
  batteryChemistry: {
    LFP: ["磷酸铁锂（LFP）", "ሊቲየም ብረት ፎስፌት (LFP)"],
    NCM: ["三元锂（NCM）", "ኒኬል-ኮባልት-ማንጋኒዝ (NCM)"],
    "Semi-solid-state": ["半固态电池", "ከፊል-ጠንካራ ባትሪ"],
  },
  steeringSetup: { LHD: ["左舵", "ግራ መሪ (LHD)"] },
  powertrainType: {
    EREV: ["增程式（EREV）", "የተራዘመ ርቀት ኤሌክትሪክ ተሽከርካሪ (EREV)"],
    PHEV: ["插电式混合动力（PHEV）", "በመሙያ የሚሞላ ሃይብሪድ (PHEV)"],
  },
  inventoryStatus: {
    "In Stock": ["现货", "በክምችት ይገኛል"],
    "Production: 30 days": ["生产周期：30天", "ምርት፦ 30 ቀናት"],
    "Production: 35 days": ["生产周期：35天", "ምርት፦ 35 ቀናት"],
    TBC: ["待确认", "ማረጋገጫ ይጠበቃል"],
  },
  voltagePlatform: {
    "1000V": ["1000V", "1000V"],
    "400V": ["400V", "400V"],
    "800V": ["800V", "800V"],
  },
  v2lAvailability: {
    "By Trim": ["视配置而定", "እንደ ትሪም"],
    "Market Dependent": ["视市场而定", "እንደ ገበያው"],
    "Not Supported": ["不支持", "አይደገፍም"],
    Optional: ["选装", "አማራጭ"],
    Standard: ["标配", "መደበኛ"],
  },
  drivetrain: {
    "Dual-motor AWD": ["双电机四驱", "ባለሁለት ሞተር ሁሉንም ጎማ አንቀሳቃሽ (AWD)"],
    "Front motor FWD": ["前置前驱", "የፊት ሞተር፣ የፊት ጎማ አንቀሳቃሽ (FWD)"],
    "Front motor RWD": ["前置电机后驱", "የፊት ሞተር፣ የኋላ ጎማ አንቀሳቃሽ (RWD)"],
    "Front-engine AWD": ["前置四驱", "የፊት ሞተር፣ ሁሉንም ጎማ አንቀሳቃሽ (AWD)"],
    "Rear motor RWD": ["后置后驱", "የኋላ ሞተር፣ የኋላ ጎማ አንቀሳቃሽ (RWD)"],
    "Tri-motor AWD": ["三电机四驱", "ባለሦስት ሞተር ሁሉንም ጎማ አንቀሳቃሽ (AWD)"],
  },
};

const filterFields = {
  vehicleClass: "vehicleClasses",
  batteryChemistry: "batteryChemistries",
  steeringSetup: "steeringSetups",
  powertrainType: "powertrainTypes",
  inventoryStatus: "inventoryStatuses",
  voltagePlatform: "voltagePlatforms",
  v2lAvailability: "v2lAvailability",
  drivetrain: "drivetrains",
};

const categoryPageTranslations = [
  translationRecord("productsRevenueKing.heading", "Revenue King", "The", "የገቢ", "Amharic category heading segment"),
  translationRecord("productsRevenueKing.headingAccent1", "网约创收利器", "Revenue King", "ንጉሥ", "Amharic category heading segment"),
  translationRecord("productsRevenueKing.headingAccent2", "Matrix", "Matrix", "ማትሪክስ", "Amharic category heading segment"),
  translationRecord("productsRevenueKing.showing", "显示第 {start}–{end} 款，共 {total} 款车型", "Showing {start}–{end} of {total} models", "ከ{total} ሞዴሎች {start}–{end} በማሳየት ላይ", "Runtime placeholders must remain unchanged"),
  translationRecord("productsRevenueKing.estPrice", "预估价格", "Est. Price", "ግምታዊ ዋጋ", "Automotive price label"),
  translationRecord("productsRevenueKing.filterGroups.bodyStyle", "车身类型", "Body Style", "የመኪና አካል ዓይነት", "Automotive body-style label"),
  translationRecord("productsRevenueKing.filterGroups.range", "城市续航 (NEDC)", "Urban Range (NEDC)", "የከተማ የመንዳት ርቀት (NEDC)", "Automotive driving-range label"),
  translationRecord("productsRevenueKing.filterGroups.availability", "现货状态", "Stock Status", "የክምችት ሁኔታ", "Inventory status, not financial stock"),
  translationRecord("productsEliteFlagship.heading", "Elite Flagship", "The", "የልሂቃን", "Amharic category heading segment"),
  translationRecord("productsEliteFlagship.headingAccent1", "商务行政旗舰", "Elite", "ዋና", "Amharic category heading segment"),
  translationRecord("productsEliteFlagship.headingAccent2", "Flagship", "Flagship", "ሞዴል", "Amharic category heading segment"),
  translationRecord("productsEliteFlagship.headingSuffix", "Circle", "Circle", "ስብስብ", "Amharic category heading segment"),
  translationRecord("productsEliteFlagship.showing", "显示第 {start}–{end} 款，共 {total} 款车型", "Showing {start}–{end} of {total} models", "ከ{total} ሞዴሎች {start}–{end} በማሳየት ላይ", "Runtime placeholders must remain unchanged"),
  translationRecord("productsEliteFlagship.estPrice", "预估价格", "Est. Price", "ግምታዊ ዋጋ", "Automotive price label"),
  translationRecord("productsEliteFlagship.filterGroups.bodyStyle", "车身类型", "Body Style", "የመኪና አካል ዓይነት", "Automotive body-style label"),
  translationRecord("productsEliteFlagship.filterGroups.range", "续航 (CLTC)", "Range (CLTC)", "የመንዳት ርቀት (CLTC)", "Automotive driving-range label"),
  translationRecord("productsEliteFlagship.filterGroups.availability", "现货状态", "Stock Status", "የክምችት ሁኔታ", "Inventory status, not financial stock"),
  translationRecord("productsUtilityPro.heading", "Utility Pro", "The", "የባለሙያ", "Amharic category heading segment"),
  translationRecord("productsUtilityPro.headingAccent1", "多功能商用先锋", "Utility", "የንግድ", "Amharic category heading segment"),
  translationRecord("productsUtilityPro.headingAccent2", "Pro", "Pro", "ተሽከርካሪ", "Amharic category heading segment"),
  translationRecord("productsUtilityPro.headingSuffix", "Fleet", "Fleet", "ስብስብ", "Amharic category heading segment"),
  translationRecord("productsUtilityPro.showing", "显示第 {start}–{end} 款，共 {total} 款车型", "Showing {start}–{end} of {total} models", "ከ{total} ሞዴሎች {start}–{end} በማሳየት ላይ", "Runtime placeholders must remain unchanged"),
  translationRecord("productsUtilityPro.estPrice", "预估价格", "Est. Price", "ግምታዊ ዋጋ", "Automotive price label"),
  translationRecord("productsUtilityPro.filterGroups.range", "续航 (NEDC)", "Range (NEDC)", "የመንዳት ርቀት (NEDC)", "Automotive driving-range label"),
  translationRecord("productsUtilityPro.filterGroups.availability", "现货状态", "Stock Status", "የክምችት ሁኔታ", "Inventory status, not financial stock"),
  translationRecord(
    "productsEliteFlagship.filterGroups.powertrainType",
    "动力类型",
    "Powertrain Type",
    "የኃይል ስርዓት ዓይነት",
    "Dynamic Elite Flagship filter group heading",
  ),
  translationRecord(
    "productsEliteFlagship.filterOptions.priceUnder35k",
    "$35,000 以下",
    "Under $35,000",
    "ከ$35,000 በታች",
    "Elite Flagship price interval label",
  ),
  translationRecord(
    "productsUtilityPro.filterGroups.drivetrain",
    "驱动形式",
    "Drivetrain",
    "የጎማ አንቀሳቃሽ ስርዓት",
    "Dynamic Utility Pro filter group heading",
  ),
  translationRecord(
    "productsUtilityPro.filterGroups.v2lAvailability",
    "V2L 外放电",
    "V2L Availability",
    "የV2L ኃይል ማቅረብ",
    "Dynamic Utility Pro filter group heading",
  ),
  translationRecord(
    "productsUtilityPro.filterGroups.groundClearance",
    "离地间隙",
    "Ground Clearance",
    "የመሬት ክፍተት",
    "Dynamic Utility Pro filter group heading",
  ),
];

function valueId(value) {
  return value.trim().toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
}

function runLark(args) {
  const cli = path.join(
    process.env.APPDATA || "",
    "npm",
    "node_modules",
    "@larksuite",
    "cli",
    "scripts",
    "run.js",
  );
  const result = spawnSync(process.execPath, [cli, ...args], {
    encoding: "utf8",
    env: {
      ...process.env,
      LARKSUITE_CLI_NO_UPDATE_NOTIFIER: "1",
      LARKSUITE_CLI_NO_SKILLS_NOTIFIER: "1",
    },
  });
  if (result.status !== 0) {
    throw new Error(result.stderr || result.stdout || `lark-cli exited ${result.status}`);
  }
  return JSON.parse(result.stdout);
}

function translationRecord(key, zh, en, am, notes) {
  return { Key: key, Module: "产品", ZH: zh, EN: en, AM: am, Notes: notes };
}

function comparableCell(value) {
  if (value === null || value === undefined) return "";
  if (Array.isArray(value)) return value.map(comparableCell).join("");
  if (typeof value === "object") {
    return comparableCell(value.text ?? value.name ?? value.value);
  }
  return String(value);
}

async function buildRecords() {
  let products;
  const failures = [];
  for (const url of PRODUCT_URLS) {
    try {
      const response = spawnSync("powershell.exe", [
        "-NoProfile",
        "-Command",
        "$ProgressPreference='SilentlyContinue'; $data=Invoke-RestMethod -Uri $env:CATALOG_PRODUCTS_FETCH_URL; ConvertTo-Json -InputObject $data -Depth 20 -Compress",
      ], {
        encoding: "utf8",
        env: { ...process.env, CATALOG_PRODUCTS_FETCH_URL: url },
      });
      if (response.status !== 0) throw new Error(response.stderr.trim() || `PowerShell exited ${response.status}`);
      const parsed = JSON.parse(response.stdout);
      const candidate = Array.isArray(parsed) ? parsed : parsed.value;
      if (!Array.isArray(candidate) || candidate.length !== 47) {
        throw new Error(`expected 47 products, received ${Array.isArray(candidate) ? candidate.length : "non-array"}`);
      }
      products = candidate;
      break;
    } catch (error) {
      failures.push(`${url}: ${error instanceof Error ? error.message : error}`);
    }
  }
  if (!products) throw new Error(`Unable to load product catalog: ${failures.join("; ")}`);
  if (!Array.isArray(products) || products.length !== 47) {
    throw new Error(`Expected 47 products, received ${Array.isArray(products) ? products.length : "non-array"}`);
  }

  const slugs = new Set(products.map((product) => product.slug));
  const expectedSlugs = new Set(Object.keys(modelNamesZh));
  const missingNames = [...slugs].filter((slug) => !expectedSlugs.has(slug));
  const staleNames = [...expectedSlugs].filter((slug) => !slugs.has(slug));
  const missingHighlights = [...slugs].filter((slug) => !highlightsZh[slug]);
  const missingAmHighlights = [...slugs].filter((slug) => !highlightsAm[slug]);
  if (missingNames.length || staleNames.length || missingHighlights.length || missingAmHighlights.length) {
    throw new Error(JSON.stringify({ missingNames, staleNames, missingHighlights, missingAmHighlights }));
  }

  const records = [];
  for (const product of products) {
    const englishName = `${product.brand} ${product.name}`.trim();
    records.push(translationRecord(
      `catalog.models.${product.slug}.displayName`,
      modelNamesZh[product.slug],
      englishName,
      englishName,
      "Official or source-backed product display name keyed by slug",
    ));

    const englishHighlight = product.slug === "zeekr-9x"
      ? String(product.charging).replace("900V浩瀚-S", "900V SEA-S")
      : product.charging;
    records.push(translationRecord(
      `catalog.models.${product.slug}.cardHighlight`,
      highlightsZh[product.slug],
      englishHighlight,
      highlightsAm[product.slug],
      "Product-card highlight keyed by slug; technical names and acronyms remain embedded in Amharic copy",
    ));
  }

  for (const [translationField, apiField] of Object.entries(filterFields)) {
    const liveValues = [...new Set(products.flatMap((product) => product.filterData?.[apiField] ?? []))]
      .filter(Boolean)
      .sort((a, b) => a.localeCompare(b));
    const translatedValues = filterTranslations[translationField];
    const missing = liveValues.filter((value) => !translatedValues[value]);
    const stale = Object.keys(translatedValues).filter((value) => !liveValues.includes(value));
    if (missing.length || stale.length) {
      throw new Error(JSON.stringify({ translationField, missing, stale }));
    }

    for (const value of liveValues) {
      const [zh, am] = translatedValues[value];
      records.push(translationRecord(
        `catalog.filters.${translationField}.${valueId(value)}`,
        zh,
        value,
        am,
        `Dynamic catalog filter label; raw match value: ${value}`,
      ));
    }
  }

  records.push(translationRecord(
    "catalog.cardField.vehicleHighlights",
    "车型亮点",
    "Vehicle Highlights",
    "የተሽከርካሪ ዋና ባህሪያት",
    "Correct label for the card description previously shown as Steering Configuration",
  ));

  records.push(...categoryPageTranslations);

  const keys = records.map((record) => record.Key);
  if (new Set(keys).size !== keys.length) throw new Error("Duplicate catalog translation keys");
  return records.sort((a, b) => a.Key.localeCompare(b.Key));
}

function existingTargetRecords() {
  const records = new Map();
  let offset = 0;
  let hasMore = true;
  while (hasMore) {
    const result = runLark([
      "base", "+record-list",
      "--base-token", BASE_TOKEN,
      "--table-id", TABLE_ID,
      "--filter-json", JSON.stringify({ logic: "and", conditions: [["Module", "==", ["产品"]]] }),
      "--field-id", "Key",
      "--field-id", "Module",
      "--field-id", "ZH",
      "--field-id", "EN",
      "--field-id", "AM",
      "--field-id", "Notes",
      "--offset", String(offset),
      "--limit", "200",
      "--as", "user",
      "--format", "json",
    ]);
    const payload = result.data;
    const recordIds = payload.record_id_list ?? [];
    recordIds.forEach((recordId, index) => {
      const row = payload.data[index];
      records.set(row[0], { recordId, row });
    });
    offset += recordIds.length;
    hasMore = payload.has_more === true;
    if (hasMore && recordIds.length === 0) throw new Error("Product translation pagination made no progress");
  }
  return records;
}

async function main() {
  const records = await buildRecords();
  const existing = existingTargetRecords();
  const fields = ["Key", "Module", "ZH", "EN", "AM", "Notes"];
  const creates = records.filter((record) => !existing.has(record.Key));
  const updates = records.filter((record) => existing.has(record.Key));
  let changed = 0;

  if (creates.length) {
    const body = { fields, rows: creates.map((record) => fields.map((field) => record[field])) };
    runLark([
      "base", "+record-batch-create",
      "--base-token", BASE_TOKEN,
      "--table-id", TABLE_ID,
      "--json", JSON.stringify(body),
      ...(WRITE ? [] : ["--dry-run"]),
      "--as", "user",
      "--format", "json",
    ]);
  }

  for (const record of updates) {
    const current = existing.get(record.Key);
    const currentValues = Object.fromEntries(fields.map((field, index) => [field, comparableCell(current.row[index])]));
    if (fields.every((field) => currentValues[field] === record[field])) continue;
    changed += 1;
    runLark([
      "base", "+record-upsert",
      "--base-token", BASE_TOKEN,
      "--table-id", TABLE_ID,
      "--record-id", current.recordId,
      "--json", JSON.stringify(record),
      ...(WRITE ? [] : ["--dry-run"]),
      "--as", "user",
      "--format", "json",
    ]);
  }

  console.log(JSON.stringify({ mode: WRITE ? "write" : "dry-run", total: records.length, creates: creates.length, existing: updates.length, changed }));
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exitCode = 1;
});
