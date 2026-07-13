import fs from "node:fs";
import path from "node:path";
import { execFileSync } from "node:child_process";

const AUTOHOME_BASE = "https://www.autohome.com.cn/web-main";
const USER_AGENT = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36";
const DEFAULT_VEHICLE_MODELS_TABLE = "tblJq4Un2LQQaFPU";
const DEFAULT_TRIM_TABLE = "tblj7HRxFw7VLUXx";

const MODEL_ALIASES = new Map(Object.entries({
  "BYD Seal": ["海豹"],
  "BYD Han EV": ["汉"],
  "Geely Galaxy M9": ["银河M9"],
  "BYD Sealion 7": ["海狮07 EV", "海狮07"],
  "Fangchengbao Leopard 5": ["豹5"],
  "Fangchengbao Ti 7": ["钛7"],
  "Xiaomi YU7": ["小米YU7", "YU7"],
  "BYD Tang L EV": ["唐L"],
  "Leapmotor D19": ["零跑D19", "D19"],
  "Voyah Taishan X8": ["岚图泰山", "泰山"],
  "Li Auto L6": ["理想L6"],
  "XPENG G9": ["小鹏G9"],
  "Zeekr 001": ["极氪001"],
  "Xiaomi SU7 Ultra": ["小米SU7", "SU7"],
  "Stelato S9": ["享界S9"],
  "AITO M9": ["问界M9"],
  "Hongqi E-HS9": ["红旗E-HS9", "E-HS9"],
  "Geely Geome": ["星愿"],
  "BYD Yuan UP": ["元UP"],
  "Leapmotor Lafa 5": ["零跑Lafa5", "Lafa5", "零跑B05", "B05"],
  "BYD Seagull": ["海鸥"],
  "Leapmotor T03": ["零跑T03"],
  "Changan Lumin": ["长安Lumin", "Lumin"],
  "Wuling Bingo Plus": ["五菱缤果PLUS", "缤果PLUS"],
  "BYD Dolphin": ["海豚"],
  "GAC Aion RT": ["AION RT", "埃安RT"],
  "GAC Aion i60": ["埃安i60", "AION i60"],
  "GAC Aion V": ["AION V", "埃安V"],
  "Deepal S07": ["深蓝S07"],
  "Deepal S05": ["深蓝S05"],
  "Dongfeng Nammi 01": ["纳米01"],
  "Changan Nevo Q05": ["长安启源Q05", "启源Q05"],
  "Fangchengbao Ti 3": ["钛3"],
  "GAC Motor Aion Y Plus": ["AION Y", "埃安Y"],
  "Geely Galaxy E5": ["银河E5"],
  "BYD Qin PLUS EV": ["秦PLUS", "秦PLUS EV"],
  "Geely Geometry C": ["几何C"],
  "BYD Shark": ["SHARK", "鲨鱼"],
  "Radar RD6": ["雷达RD6", "RD6"],
  "Tank 500 Hi4-T": ["坦克500新能源", "坦克500 Hi4-T"],
  "Fangchengbao Leopard 8": ["豹8"],
  "Zeekr 9X": ["极氪9X"],
  "GWM Cannon EV": ["炮新能源", "山海炮新能源"],
  "Dongfeng Rich 6 EV": ["锐骐6新能源", "锐骐6 EV"],
  "Farizon Xingxiang V": ["星享V"],
  "Linghui e7": ["领汇e7", "凌汇e7", "e7"],
  "MG MG4 EV": ["MG4 EV", "MG4"],
}));

const PREFERRED_SERIES_IDS = new Map(Object.entries({
  "BYD Shark": 7257,
  "Radar RD6": 6820,
}));

const FIELD_LABELS = new Map(Object.entries({
  "车型名称": "Trim name",
  "厂商指导价(元)": "MSRP",
  "CLTC纯电续航里程(km)": "CLTC electric range",
  "WLTC综合续航(km)": "WLTC combined range",
  "电池能量(kWh)": "Battery capacity",
  "电池类型": "Battery chemistry",
  "能源类型": "Energy type",
  "驱动方式": "Drivetrain",
  "电动机总功率(kW)": "Motor power",
  "电动机总扭矩(N·m)": "Motor torque",
  "最大功率(kW)": "Maximum power",
  "最大扭矩(N·m)": "Maximum torque",
  "快充功能": "DC fast charging",
  "电池快充时间(小时)": "DC fast charge time",
  "电池快充电量范围(%)": "Fast charge range",
  "车道偏离预警系统": "Lane departure warning",
  "主动刹车/主动安全系统": "AEB / active safety",
  "前方碰撞预警": "Forward collision warning",
  "车道保持辅助系统": "Lane keeping assist",
  "车道居中保持": "Lane centering",
  "道路交通标识识别": "Traffic sign recognition",
  "主动安全预警系统": "Active safety alerts",
  "哨兵模式/千里眼": "Sentry mode",
  "前/后驻车雷达": "Parking radar",
  "驾驶辅助影像": "Driver assistance camera",
  "透明底盘/540度影像": "Transparent chassis / 540 camera",
  "巡航系统": "Cruise system",
  "自动泊车入位": "Automatic parking",
  "遥控泊车": "Remote parking",
  "自动变道辅助": "Automatic lane change assist",
  "辅助驾驶芯片": "Driver assistance chip",
  "辅助驾驶系统": "Driver assistance system",
  "天窗类型": "Sunroof type",
  "电动后备厢": "Power tailgate",
  "感应后备厢": "Hands-free tailgate",
  "电动后备厢位置记忆": "Tailgate position memory",
  "无钥匙进入功能": "Keyless entry",
  "无钥匙启动系统": "Keyless start",
  "远程启动功能": "Remote start",
  "方向盘加热": "Heated steering wheel",
  "方向盘记忆": "Steering wheel memory",
  "全液晶仪表盘": "Full LCD instrument cluster",
  "中控彩色屏幕": "Center display",
  "中控屏幕尺寸": "Center display size",
  "副驾娱乐屏": "Passenger entertainment display",
  "HUD抬头数字显示": "HUD",
  "内置行车记录仪": "Built-in dashcam",
  "手机无线充电功能": "Wireless phone charging",
  "座椅材质": "Seat material",
  "主座椅调节方式": "Driver seat adjustment",
  "副座椅调节方式": "Passenger seat adjustment",
  "前排座椅功能": "Front seat functions",
  "第二排座椅调节": "Second-row seat adjustment",
  "第二排座椅功能": "Second-row seat functions",
  "扬声器品牌名称": "Speaker brand",
  "扬声器数量": "Speaker count",
  "车内氛围灯": "Ambient lighting",
  "热泵空调": "Heat pump",
  "车载空气净化器": "Cabin air purifier",
  "车内PM2.5过滤装置": "PM2.5 filter",
  "负离子发生器": "Negative ion generator",
  "车载香氛装置": "Cabin fragrance",
  "对外放电": "Vehicle-to-load",
  "对外交流放电功率(kW)": "V2L AC discharge power",
}));

const TEXT_TRANSLATIONS = [
  ["智驾版", "Smart Driving Edition"],
  ["智航版", "Smart Navigation Edition"],
  ["冠军版", "Champion Edition"],
  ["荣耀版", "Honor Edition"],
  ["领先型", "Lead Trim"],
  ["舒适型", "Comfort Trim"],
  ["精英型", "Elite Trim"],
  ["豪华型", "Luxury Trim"],
  ["尊贵型", "Premium Trim"],
  ["旗舰型", "Flagship Trim"],
  ["旗舰版", "Flagship Edition"],
  ["标准版", "Standard Edition"],
  ["长续航版", "Long Range Edition"],
  ["超长续航版", "Ultra Long Range Edition"],
  ["四驱版", "AWD Edition"],
  ["两驱版", "2WD Edition"],
  ["长箱", "Long Bed"],
  ["短箱", "Short Bed"],
  ["高寒版", "Cold Climate Edition"],
  ["全能版", "All-round Edition"],
  ["智能版", "Smart Edition"],
  ["悦享版", "Enjoy Edition"],
  ["臻享版", "Premium Edition"],
  ["乐享版", "Comfort Edition"],
  ["向往版", "Aspiration Edition"],
  ["青春版", "Youth Edition"],
  ["进取型", "Progressive Trim"],
  ["入门版", "Entry Edition"],
  ["尊享版", "Premium Edition"],
  ["探索版", "Explorer Edition"],
  ["领航版", "Pilot Edition"],
  ["行政版", "Executive Edition"],
  ["大师版", "Master Edition"],
  ["运动版", "Sport Edition"],
  ["家庭版", "Family Edition"],
  ["商务版", "Business Edition"],
  ["创业版", "Startup Edition"],
  ["财富版", "Wealth Edition"],
  ["星享", "Xingxiang"],
  ["纯电", "BEV"],
  ["插电混动", "PHEV"],
  ["增程远航", "EREV Long Range"],
  ["增程", "EREV"],
  ["超值", "Value"],
  ["智尊", "Premium Smart"],
  ["埃安霸王龙", "Aion T-Rex"],
  ["功能智慧", "Functional Smart"],
  ["功能智富", "Functional Wealth"],
  ["功能智尊", "Functional Premium"],
  ["功能", "Functional"],
  ["智慧", "Smart"],
  ["智享", "Smart Enjoy"],
  ["闪充尊荣", "Flash Charge Prestige"],
  ["闪充领先", "Flash Charge Lead"],
  ["闪充高能", "Flash Charge High Energy"],
  ["闪充", "Flash Charge"],
  ["宁德时代", "CATL"],
  ["宁德", "CATL"],
  ["国轩高科", "Gotion High-Tech"],
  ["国轩", "Gotion"],
  ["中航锂电", "CALB"],
  ["亿纬锂能", "EVE Energy"],
  ["亿纬", "EVE"],
  ["远程智芯", "Farizon Smart Core"],
  ["智芯", "Smart Core"],
  ["代电池包", "Battery Pack"],
  ["长轴国轩", "Long Wheelbase Gotion"],
  ["长轴宁德", "Long Wheelbase CATL"],
  ["长轴中航", "Long Wheelbase CALB"],
  ["长轴智芯", "Long Wheelbase Smart Core"],
  ["长轴", "Long Wheelbase"],
  ["短轴中航", "Short Wheelbase CALB"],
  ["短轴远程智芯", "Short Wheelbase Farizon Smart Core"],
  ["短轴国轩", "Short Wheelbase Gotion"],
  ["短轴", "Short Wheelbase"],
  ["两驱启航", "2WD Launch"],
  ["两驱远航", "2WD Long Range"],
  ["两驱科创", "2WD Tech Innovation"],
  ["两驱", "2WD"],
  ["启航出行", "Launch Mobility"],
  ["进阶出行", "Advanced Mobility"],
  ["悦享出行", "Enjoy Mobility"],
  ["领先出行", "Lead Mobility"],
  ["高能出行", "High Energy Mobility"],
  ["出行", "Mobility"],
  ["启航", "Launch"],
  ["远航", "Long Range"],
  ["超越", "Beyond"],
  ["领航", "Pilot"],
  ["帕拉索", "Palaso"],
  ["雷达尊享", "Radar Premium"],
  ["尊荣", "Prestige"],
  ["尊享", "Premium"],
  ["黑金智曜", "Black Gold Smart Shine"],
  ["黑武士", "Black Warrior"],
  ["云辇激光乾崑", "Yunnian LiDAR Qiankun"],
  ["云辇乾崑", "Yunnian Qiankun"],
  ["云辇闪充", "Yunnian Flash Charge"],
  ["云辇天神", "Yunnian Tianshen"],
  ["云辇", "Yunnian"],
  ["天神智驾", "Tianshen Smart Driving"],
  ["天神", "Tianshen"],
  ["激光乾崑", "LiDAR Qiankun"],
  ["激光极智", "LiDAR Ultra Smart"],
  ["激光", "LiDAR"],
  ["乾崑", "Qiankun"],
  ["智能焕新", "Smart Refresh"],
  ["焕新", "Refresh"],
  ["领世加长", "Executive Long Wheelbase"],
  ["旗悦", "Qiyue"],
  ["旗享", "Qixiang"],
  ["旗畅", "Qichang"],
  ["旗领", "Qiling"],
  ["乘风", "Ride the Wind"],
  ["梦想", "Dream"],
  ["自在", "Freedom"],
  ["自由", "Free"],
  ["探索", "Explorer"],
  ["飞翔", "Flying"],
  ["舒享", "Comfort Enjoy"],
  ["清悦款", "Fresh Joy Edition"],
  ["清香款", "Fresh Scent Edition"],
  ["香沁款", "Fragrance Edition"],
  ["蜜沁款", "Honey Fragrance Edition"],
  ["橙风", "Orange Wind"],
  ["西柚", "Grapefruit"],
  ["蓝莓", "Blueberry"],
  ["葡萄", "Grape"],
  ["纯爱米", "Pure Love Beige"],
  ["心爱米", "Beloved Beige"],
  ["酷爱米", "Cool Beige"],
  ["臻爱米", "Premium Beige"],
  ["萌宝", "Cute Edition"],
  ["马到成功", "Success Edition"],
  ["活力", "Vitality"],
  ["宝藏", "Treasure"],
  ["进阶", "Advanced"],
  ["初心款", "Original Edition"],
  ["挚爱款", "Beloved Edition"],
  ["时尚", "Fashion"],
  ["骑士", "Knight"],
  ["畅行", "Smooth Drive"],
  ["星耀", "Star Shine"],
  ["星舰", "Starship"],
  ["性能", "Performance"],
  ["五周年纪念", "5th Anniversary"],
  ["基本", "Base"],
  ["高配", "High Spec"],
  ["顶配", "Top Spec"],
  ["商用两驱", "Commercial 2WD"],
  ["商用", "Commercial"],
  ["行业", "Industry"],
  ["公务", "Government"],
  ["乘用", "Passenger"],
  ["标箱矿山", "Standard Bed Mining"],
  ["标箱", "Standard Bed"],
  ["小双", "Small Double Cab"],
  ["大双", "Large Double Cab"],
  ["斗式远航", "Bucket Long Range"],
  ["斗式", "Bucket"],
  ["厢式远征", "Van Expedition"],
  ["厢式远行", "Van Long Trip"],
  ["厢式远航", "Van Long Range"],
  ["厢式", "Van"],
  ["工程车", "Engineering Vehicle"],
  ["多功能", "Multi-purpose"],
  ["玄武创富", "Xuanwu Wealth Builder"],
  ["玄武", "Xuanwu"],
  ["营运", "Operating"],
  ["随心", "Flexible"],
  ["从容", "Calm"],
  ["半固态安芯", "Semi-solid Safe Core"],
  ["焕能", "Energy Refresh"],
  ["智富", "Smart Wealth"],
  ["智豪", "Smart Luxury"],
  ["智趣", "Smart Fun"],
  ["驾培", "Driver Training"],
  ["人机玩家", "Human-machine Player"],
  ["人机", "Human-machine"],
  ["六座", "6-seat"],
  ["七座", "7-seat"],
  ["五座", "5-seat"],
  ["四座", "4-seat"],
  ["改款", "Updated"],
  ["磷酸铁锂电池", "LFP battery"],
  ["三元锂电池", "NCM battery"],
  ["三元锂+磷酸铁锂电池", "NCM + LFP battery"],
  ["三元锂+磷酸铁锂", "NCM + LFP"],
  ["磷酸铁锂", "LFP"],
  ["三元锂", "NCM"],
  ["纯电动", "BEV"],
  ["插电式混合动力", "PHEV"],
  ["增程式", "EREV"],
  ["油电混合", "HEV"],
  ["前置前驱", "Front motor FWD"],
  ["后置后驱", "Rear motor RWD"],
  ["双电机四驱", "Dual-motor AWD"],
  ["前置四驱", "Front-engine AWD"],
  ["中置四驱", "Mid-engine AWD"],
  ["四轮驱动", "AWD"],
  ["前驱", "FWD"],
  ["后驱", "RWD"],
  ["四驱", "AWD"],
  ["有", "Yes"],
  ["无", "No"],
  ["标配", "Standard"],
  ["选配", "Optional"],
  ["- 前", " Front"],
  ["前●/后●", "Front + rear"],
  ["前-/后●", "Rear"],
  ["前●/后-", "Front"],
  ["前-/后-", "No"],
  ["前驻车雷达", "Front parking radar"],
  ["后驻车雷达", "Rear parking radar"],
  ["倒车影像", "Rearview camera"],
  ["360度全景影像", "360 camera"],
  ["540度全景影像", "540 camera"],
  ["透明底盘", "Transparent chassis"],
  ["定速巡航", "Cruise control"],
  ["自适应巡航", "Adaptive cruise control"],
  ["全速自适应巡航", "Full-speed adaptive cruise control"],
  ["自动泊车入位", "Automatic parking"],
  ["遥控泊车", "Remote parking"],
  ["高通骁龙", "Qualcomm Snapdragon"],
  ["征程", "Journey"],
  ["地平线", "Horizon Robotics"],
  ["英伟达", "NVIDIA"],
  ["不可开启全景天窗", "Fixed panoramic sunroof"],
  ["可开启全景天窗", "Openable panoramic sunroof"],
  ["分段式不可开启天窗", "Segmented fixed sunroof"],
  ["单天窗", "Single sunroof"],
  ["仿皮", "Synthetic leather"],
  ["皮/织物混搭", "Leather/fabric mix"],
  ["皮/翻毛皮混搭", "Leather/suede mix"],
  ["皮/翻毛材质混搭", "Leather/suede mix"],
  ["皮/Fabric混搭", "Leather/fabric mix"],
  ["Leather/Alcantara混搭", "Leather/Alcantara mix"],
  ["翻毛材质", "Suede"],
  ["真皮", "Leather"],
  ["织物", "Fabric"],
  ["皮", "Leather"],
  ["加热", "heating"],
  ["通风", "ventilation"],
  ["按摩", "massage"],
  ["记忆", "memory"],
  ["电动调节", "power adjustment"],
  ["手动调节", "manual adjustment"],
  ["靠背调节", "backrest adjustment"],
  ["前后调节", "fore-aft adjustment"],
  ["高低调节", "height adjustment"],
  ["腰部支撑", "lumbar support"],
  ["腰部调节", "lumbar adjustment"],
  ["腿托调节", "leg-rest adjustment"],
  ["左右调节", "lateral adjustment"],
  ["旋转调节", "swivel adjustment"],
  ["脚踏调节", "footrest adjustment"],
  ["侧翼支撑", "side bolster support"],
  ["比例放倒", "split folding"],
  ["整体放倒", "one-piece folding"],
  ["多色", "multi-color"],
  ["单色", "single-color"],
  ["热泵", "heat pump"],
  ["头枕", "headrest"],
  ["主驾驶位", "driver side"],
  ["副驾驶位", "passenger side"],
  ["第一排", "front row"],
  ["第二排", "second row"],
  ["第三排", "third row"],
  ["前排", "front row"],
  ["后排", "rear row"],
  ["外放电", "V2L"],
  ["支持", "supported"],
  ["不支持", "not supported"],
  ["全车", "all seats"],
  ["车内", "cabin"],
  ["扬声器", "speakers"],
  ["喇叭", "speakers"],
  ["英寸", "in"],
  ["触控液晶屏", "touch LCD"],
  ["车侧盲区影像", "side blind-spot camera"],
  ["驾驶位", "driver side"],
  ["仅", "only "],
  ["华为乾崑智驾ADS", "Huawei Qiankun ADS"],
  ["华为乾崑智驾", "Huawei Qiankun ADS"],
  ["华为乾崑", "Huawei Qiankun"],
  ["华为", "Huawei"],
  ["智驾", "Smart Driving"],
  ["千里浩瀚", "Qianli Haohan"],
  ["理想AD", "Li Auto AD"],
  ["天枢智能驾驶辅助激光版", "Tianshu intelligent driving assistance LiDAR edition"],
  ["天枢", "Tianshu"],
  ["能驾驶辅助", "driving assistance"],
  ["广汽", "GAC"],
  ["漫步者", "Edifier"],
  ["电动天窗", "Power sunroof"],
  ["普通液晶屏", "standard LCD"],
  ["选装", "Optional"],
  ["待查", "TBC"],
  ["半固态电池", "Semi-solid-state battery"],
  ["三电机", "Tri-motor "],
  ["前置RWD", "Front motor RWD"],
  ["混搭", "mix"],
  ["主动", "active"],
  ["版", " Edition"],
  ["型", " Trim"],
  ["座", "-seat"],
  ["线", "-line"],
  ["度", " kWh"],
  ["智", "Smart"],
  ["曜黑", "Shine Black"],
  ["丹拿", "Dynaudio"],
  ["雅马哈", "Yamaha"],
  ["柏林之声", "Burmester"],
  ["燕飞利仕", "Infinity"],
  ["帝瓦雷", "Devialet"],
  ["单目", "mono"],
  ["双目", "stereo"],
  ["毫米波雷达", "mmWave radar"],
  ["激光雷达", "LiDAR"],
  ["雷达", "radar"],
  ["摄像头", "camera"],
  ["驾", "driving"],
  ["多", "multi"],
];

const CORE_FIELDS = [
  "车型名称",
  "厂商指导价(元)",
  "CLTC纯电续航里程(km)",
  "WLTC综合续航(km)",
  "电池能量(kWh)",
  "电池类型",
  "能源类型",
  "驱动方式",
  "电动机总功率(kW)",
  "电动机总扭矩(N·m)",
  "最大功率(kW)",
  "最大扭矩(N·m)",
  "快充功能",
  "电池快充时间(小时)",
  "电池快充电量范围(%)",
];

const DISPLAY_FEATURE_FIELDS = [
  "车道偏离预警系统",
  "主动刹车/主动安全系统",
  "前方碰撞预警",
  "车道保持辅助系统",
  "车道居中保持",
  "道路交通标识识别",
  "主动安全预警系统",
  "哨兵模式/千里眼",
  "前/后驻车雷达",
  "驾驶辅助影像",
  "透明底盘/540度影像",
  "巡航系统",
  "自动泊车入位",
  "遥控泊车",
  "自动变道辅助",
  "辅助驾驶芯片",
  "辅助驾驶系统",
  "天窗类型",
  "电动后备厢",
  "感应后备厢",
  "电动后备厢位置记忆",
  "无钥匙进入功能",
  "无钥匙启动系统",
  "远程启动功能",
  "方向盘加热",
  "方向盘记忆",
  "全液晶仪表盘",
  "中控彩色屏幕",
  "中控屏幕尺寸",
  "副驾娱乐屏",
  "HUD抬头数字显示",
  "内置行车记录仪",
  "手机无线充电功能",
  "座椅材质",
  "主座椅调节方式",
  "副座椅调节方式",
  "前排座椅功能",
  "第二排座椅调节",
  "第二排座椅功能",
  "扬声器品牌名称",
  "扬声器数量",
  "车内氛围灯",
  "热泵空调",
  "车载空气净化器",
  "车内PM2.5过滤装置",
  "负离子发生器",
  "车载香氛装置",
  "对外放电",
  "对外交流放电功率(kW)",
];

const TRIM_FIELDS = [
  "Trim Config ID",
  "Model ID",
  "Vehicle Model",
  "Trim Name",
  "Trim Order",
  "Trim Price Display",
  "Range Display",
  "Battery Capacity kWh",
  "Battery Chemistry",
  "Drivetrain Display",
  "Motor Power kW",
  "Motor Torque N-m",
  "DC Fast Charge Supported",
  "DC Fast Charge Time Hours",
  "DC Fast Charge Min Percent",
  "DC Fast Charge Max Percent",
  "Base Spec Summary JSON",
  "Added Features JSON",
  "Upgraded Features JSON",
  "Recommended",
  "Source URL",
  "Source Status",
  "Last Verified At",
  "Notes",
];

function readDotEnv(file) {
  if (!fs.existsSync(file)) return {};
  const values = {};
  for (const line of fs.readFileSync(file, "utf8").split(/\r?\n/)) {
    const match = line.match(/^\s*([A-Za-z_][A-Za-z0-9_]*)\s*=\s*(.*)\s*$/);
    if (!match || match[1].startsWith("#")) continue;
    values[match[1]] = match[2].replace(/^['"]|['"]$/g, "");
  }
  return values;
}

function config() {
  const vars = { ...readDotEnv(".dev.vars"), ...process.env };
  const baseToken = vars.FEISHU_BASE_APP_TOKEN || vars.FEISHU_BASE_TOKEN;
  if (!baseToken) throw new Error("Missing FEISHU_BASE_APP_TOKEN in environment or .dev.vars");
  return {
    baseToken,
    vehicleModelsTable: vars.FEISHU_TABLE_VEHICLE_MODELS || DEFAULT_VEHICLE_MODELS_TABLE,
    trimTable: vars.FEISHU_TABLE_VEHICLE_TRIM_CONFIGURATIONS || DEFAULT_TRIM_TABLE,
  };
}

function runLark(args) {
  const command = process.platform === "win32" ? "powershell.exe" : (process.env.LARK_CLI_BIN || "lark-cli");
  const commandArgs = process.platform === "win32"
    ? ["-NoProfile", "-ExecutionPolicy", "Bypass", "-File", process.env.LARK_CLI_BIN || path.join(process.env.APPDATA || "", "npm", "lark-cli.ps1"), ...args]
    : args;
  const output = execFileSync(command, commandArgs, {
    cwd: process.cwd(),
    encoding: "utf8",
    stdio: ["ignore", "pipe", "pipe"],
    maxBuffer: 20 * 1024 * 1024,
  });
  const start = output.indexOf("{");
  const end = output.lastIndexOf("}");
  if (start === -1 || end === -1) throw new Error(output);
  const parsed = JSON.parse(output.slice(start, end + 1));
  if (parsed.ok === false) throw new Error(JSON.stringify(parsed.error, null, 2));
  return parsed.data || parsed;
}

function jsonFileArg(name, value) {
  const tempDir = ".lark-tmp";
  fs.mkdirSync(tempDir, { recursive: true });
  const file = path.join(tempDir, `${name}-${Math.random().toString(36).slice(2)}.json`);
  fs.writeFileSync(file, JSON.stringify(value), "utf8");
  return `@./${file.replaceAll("\\", "/")}`;
}

async function autohome(pathname, params = {}) {
  const url = new URL(`${AUTOHOME_BASE}${pathname}`);
  for (const [key, value] of Object.entries(params)) url.searchParams.set(key, String(value));
  const response = await fetch(url, { headers: { "user-agent": USER_AGENT, accept: "application/json" } });
  if (!response.ok) throw new Error(`${response.status} ${url}`);
  const data = await response.json();
  if (data.returncode !== 0) throw new Error(`${data.message || data.returncode} ${url}`);
  return data.result;
}

function titleIndex(result) {
  const byName = new Map();
  for (const group of result.titlelist || []) {
    for (const item of group.items || []) byName.set(item.itemname, item.titleid);
  }
  return byName;
}

function fieldValue(spec, byName, name) {
  const titleId = byName.get(name);
  if (!titleId) return "";
  const cell = spec.paramconflist?.find((item) => item.titleid === titleId);
  if (!cell) return "";
  if (cell.itemname && cell.itemname !== "-") return cell.itemname;
  if (Array.isArray(cell.sublist)) {
    return cell.sublist
      .filter((item) => item.name && item.value && item.value !== "-")
      .map((item) => (item.value === "●" ? item.name : `${item.name}: ${item.value}`))
      .join("; ");
  }
  return "";
}

function translateText(value) {
  let text = String(value || "").trim();
  for (const [source, target] of TEXT_TRANSLATIONS) {
    text = text.replaceAll(source, target);
  }
  return text
    .replaceAll("全速Adaptive cruise control", "Full-speed adaptive cruise control")
    .replaceAll("Huawei Qiankun ADSADS", "Huawei Qiankun ADS")
    .replaceAll("Huawei QiankunADS", "Huawei Qiankun ADS")
    .replaceAll("Qianli HaohanH", "Qianli Haohan H")
    .replaceAll("DynaudioDynaudio", "Dynaudio")
    .replaceAll("YamahaYamaha", "Yamaha")
    .replaceAll("BurmesterBurmester", "Burmester")
    .replaceAll("InfinityInfinity", "Infinity")
    .replaceAll("DevialetDevialet", "Devialet")
    .replaceAll("EDIFIEREdifier", "EDIFIER")
    .replaceAll("EdifierEdifier", "Edifier")
    .replaceAll("HuaweiQiankun", "Huawei Qiankun")
    .replaceAll("LiDARradar", "LiDAR")
    .replace(/\b(2WD|AWD|RWD|PHEV|BEV|EREV)(?=[A-Z])/g, "$1 ")
    .replace(/\b(\d+)(Smart|Champion|Premium|Comfort|Elite|Flagship|Aspiration|Youth|Long|Short|Pilot|Launch|Beyond|Value|Max|Ultra)/g, "$1 $2")
    .replaceAll("前Optional/后Standard", "Front optional / rear standard")
    .replaceAll("前Standard/后Optional", "Front standard / rear optional")
    .replaceAll("前Optional/后Optional", "Front optional / rear optional")
    .replaceAll("前Standard/后Standard", "Front + rear standard")
    .replace(/(\d+)向/g, "$1-way")
    .replace(/(\d+)颗/g, "$1 pcs")
    .replaceAll("，", ", ")
    .replaceAll("、", ", ")
    .replaceAll("；", "; ")
    .replaceAll("：", ": ")
    .replaceAll("（", " (")
    .replaceAll("）", ")")
    .replace(/\s+/g, " ")
    .trim();
}

function normalizeFeatureValue(value) {
  return translateText(String(value || ""))
    .replaceAll("●", "Standard")
    .replaceAll("○", "Optional")
    .replaceAll("前●/后●", "Front + rear")
    .replaceAll("前-/后●", "Rear")
    .replaceAll("前Optional/后Standard", "Front optional / rear standard")
    .replaceAll("前Standard/后Optional", "Front standard / rear optional")
    .replaceAll("前Optional/后Optional", "Front optional / rear optional")
    .replaceAll("前Standard/后Standard", "Front + rear standard")
    .trim();
}

function meaningful(value) {
  const text = String(value || "").trim();
  return Boolean(text && text !== "-" && text !== "暂无报价");
}

function money(value) {
  const text = String(value || "").trim();
  if (!text) return "";
  if (text === "暂无报价") return "Price TBC";
  const wanMatch = text.match(/^([\d.]+)万$/);
  if (wanMatch) {
    const amount = Math.round(Number(wanMatch[1]) * 10000);
    return `RMB ${amount.toLocaleString("en-US")}`;
  }
  if (text.includes("万")) return translateText(`RMB ${text}`);
  return text;
}

function featureLine(name, value) {
  const label = FIELD_LABELS.get(name) || name;
  return `${label}: ${normalizeFeatureValue(value)}`;
}

function trimName(spec, seriesName) {
  const rawName = (spec.specname || "")
    .replace(seriesName, "")
    .replace(/^\s*\d{4}款\s*/, "")
    .trim() || spec.specname || `Spec ${spec.specid}`;
  return translateText(rawName);
}

function buildComparison(seriesId, result) {
  const byName = titleIndex(result);
  const specs = [...(result.datalist || [])].sort((a, b) => {
    const ap = Number(String(a.minprice || "").replace(/[^\d.]/g, "")) || 0;
    const bp = Number(String(b.minprice || "").replace(/[^\d.]/g, "")) || 0;
    return ap - bp || Number(a.specid || 0) - Number(b.specid || 0);
  });

  const rows = specs.map((spec, index) => {
    const get = (name) => fieldValue(spec, byName, name);
    const featureMap = new Map();
    for (const name of DISPLAY_FEATURE_FIELDS) {
      const value = normalizeFeatureValue(get(name));
      if (meaningful(value)) featureMap.set(name, value);
    }
    return {
      spec,
      featureMap,
      record: {
        name: trimName(spec, result.bread.seriesname),
        order: index + 1,
        priceDisplay: money(get("厂商指导价(元)") || spec.minprice || ""),
        rangeDisplay: get("CLTC纯电续航里程(km)") ? `${get("CLTC纯电续航里程(km)")} km CLTC` : "",
        batteryDisplay: [get("电池能量(kWh)") && `${get("电池能量(kWh)")} kWh`, translateText(get("电池类型"))].filter(Boolean).join(" "),
        drivetrainDisplay: translateText(get("驱动方式")),
        motorDisplay: [
          get("电动机总功率(kW)") && `${get("电动机总功率(kW)")} kW`,
          get("电动机总扭矩(N·m)") && `${get("电动机总扭矩(N·m)")} N-m`,
        ].filter(Boolean).join(" / "),
        chargingDisplay: [
          get("快充功能") && `DC fast charge: ${normalizeFeatureValue(get("快充功能"))}`,
          get("电池快充时间(小时)") && `${get("电池快充时间(小时)")} h`,
          get("电池快充电量范围(%)") && `${get("电池快充电量范围(%)")}%`,
        ].filter(Boolean).join(" / "),
      },
    };
  });

  const commonFeatures = [];
  for (const name of DISPLAY_FEATURE_FIELDS) {
    const values = rows.map((row) => row.featureMap.get(name) || "");
    if (values.length && values.every(Boolean) && values.every((value) => value === values[0])) {
      commonFeatures.push(featureLine(name, values[0]));
      for (const row of rows) row.featureMap.delete(name);
    }
  }

  for (let i = 0; i < rows.length; i += 1) {
    const prev = i > 0 ? rows[i - 1].featureMap : new Map();
    const added = [];
    const upgraded = [];
    for (const [name, value] of rows[i].featureMap.entries()) {
      const previous = prev.get(name);
      if (!previous) added.push(featureLine(name, value));
      else if (previous !== value) upgraded.push(`${FIELD_LABELS.get(name) || name}: ${previous} -> ${value}`);
    }
    rows[i].record.baseFeatures = i === 0
      ? [...rows[i].featureMap].slice(0, 14).map(([name, value]) => featureLine(name, value))
      : [];
    rows[i].record.addedFeatures = i === 0 ? [] : added.slice(0, 18);
    rows[i].record.upgradedFeatures = upgraded.slice(0, 12);
  }

  const commonSpecs = CORE_FIELDS.map((name) => {
    const values = rows.map((row) => fieldValue(row.spec, byName, name)).filter(meaningful);
    return values.length === rows.length && values.every((value) => value === values[0]) ? featureLine(name, values[0]) : "";
  }).filter(Boolean);

  return {
    sourceUrl: `https://www.autohome.com.cn/config/series/${seriesId}.html#pvareaid=3454437`,
    trims: rows.map((row) => row.record),
    commonFeatures: [
      { category: "Core model specs", items: commonSpecs.slice(0, 18) },
      { category: "Shared equipment", items: commonFeatures.slice(0, 36) },
    ].filter((group) => group.items.length),
  };
}

function compactName(value) {
  return String(value || "").toLowerCase().replace(/[\s·_\-+()（）]/g, "");
}

function candidateScore(model, alias, series) {
  const s = compactName(series.seriesname);
  const a = compactName(alias);
  const m = compactName(model);
  if (s === a) return 100;
  if (s.includes(a) || a.includes(s)) return 80;
  if (s === m || s.includes(m) || m.includes(s)) return 60;
  return 0;
}

function readModels(cfg) {
  const data = runLark([
    "base", "+record-list",
    "--base-token", cfg.baseToken,
    "--table-id", cfg.vehicleModelsTable,
    "--as", "user",
    "--format", "json",
    "--limit", "100",
    "--field-id", "Model ID",
    "--field-id", "Brand",
    "--field-id", "Model",
    "--field-id", "Status",
    "--field-id", "Product Path",
  ]);
  return data.data.map((row, index) => ({
    recordId: data.record_id_list[index],
    modelId: row[0],
    brand: row[1],
    model: row[2],
    status: Array.isArray(row[3]) ? row[3][0] : row[3],
    productPath: row[4],
  })).filter((row) => row.status === "Active");
}

async function buildSeriesIndex() {
  const brands = (await autohome("/car/brand/getbrand", { sorttype: 1 })).brandlist || [];
  const series = [];
  for (const brand of brands) {
    try {
      const info = await autohome("/car/series/getserieslistbybrandid", { brandid: brand.id });
      for (const item of info.serieslist || []) series.push({ ...item, brandId: brand.id, brandName: brand.name });
    } catch {
      // Some brands return empty or restricted lists; skip them.
    }
  }
  return series;
}

function matchSeries(model, seriesIndex) {
  const key = `${model.brand} ${model.model}`;
  const preferredSeriesId = PREFERRED_SERIES_IDS.get(key);
  if (preferredSeriesId) {
    const series = seriesIndex.find((item) => Number(item.seriesid) === preferredSeriesId);
    if (series) return { score: 1000, alias: `series:${preferredSeriesId}`, series };
  }
  const aliases = MODEL_ALIASES.get(key) || [model.model];
  const candidates = [];
  for (const series of seriesIndex) {
    for (const alias of aliases) {
      const score = candidateScore(model.model, alias, series);
      if (score > 0) candidates.push({ score, alias, series });
    }
  }
  candidates.sort((a, b) => b.score - a.score || (b.series.seriesstate || 0) - (a.series.seriesstate || 0));
  return candidates[0] || null;
}

function trimRowValues(model, match, comparison, trim, index, verifiedAt) {
  const battery = parseBatteryStructured(trim.batteryDisplay);
  const motor = parseMotorStructured(trim.motorDisplay);
  const charging = parseChargingStructured(trim.chargingDisplay);
  const fields = {
    "Trim Config ID": `${model.modelId}-${match.series.seriesid}-${trim.order || index + 1}`,
    "Model ID": model.modelId,
    "Vehicle Model": [{ id: model.recordId }],
    "Trim Name": trim.name,
    "Trim Order": trim.order || index + 1,
    "Trim Price Display": parsePriceRmb(trim.priceDisplay),
    "Range Display": parseRangeKm(trim.rangeDisplay),
    "Battery Capacity kWh": battery.capacity,
    "Battery Chemistry": battery.chemistry || null,
    "Drivetrain Display": trim.drivetrainDisplay,
    "Motor Power kW": motor.power,
    "Motor Torque N-m": motor.torque,
    "DC Fast Charge Supported": charging.supported,
    "DC Fast Charge Time Hours": charging.timeHours,
    "DC Fast Charge Min Percent": charging.minPercent,
    "DC Fast Charge Max Percent": charging.maxPercent,
    "Base Spec Summary JSON": JSON.stringify(trim.baseFeatures || []),
    "Added Features JSON": JSON.stringify(trim.addedFeatures || []),
    "Upgraded Features JSON": JSON.stringify(trim.upgradedFeatures || []),
    "Recommended": false,
    "Source URL": comparison.sourceUrl,
    "Source Status": "Verified",
    "Last Verified At": verifiedAt,
    "Notes": `Autohome series ${match.series.seriesid}; matched for ${model.brand} ${model.model}`,
  };
  return TRIM_FIELDS.map((field) => fields[field] ?? null);
}

function buildRows(model, match, comparison, verifiedAt) {
  return comparison.trims.map((trim, index) => trimRowValues(model, match, comparison, trim, index, verifiedAt));
}

function numericFromText(value) {
  const match = String(value || "").match(/-?\d+(?:,\d{3})*(?:\.\d+)?/);
  if (!match) return null;
  const parsed = Number(match[0].replace(/,/g, ""));
  return Number.isFinite(parsed) ? parsed : null;
}

function parsePriceRmb(value) {
  const text = String(value || "");
  if (!text || /TBC/i.test(text)) return null;
  return numericFromText(text);
}

function parseRangeKm(value) {
  return numericFromText(value);
}

function parseBatteryStructured(value) {
  const text = String(value || "");
  const capacity = /kWh/i.test(text) ? numericFromText(text) : null;
  let chemistry = "";
  if (/semi-solid/i.test(text)) chemistry = "Semi-solid-state";
  else if (/NCM\s*\+\s*LFP/i.test(text)) chemistry = "NCM+LFP";
  else if (/NMC/i.test(text)) chemistry = "NMC";
  else if (/NCM/i.test(text)) chemistry = "NCM";
  else if (/LFP/i.test(text)) chemistry = "LFP";
  return { capacity, chemistry };
}

function parseMotorStructured(value) {
  const text = String(value || "");
  const power = text.match(/(\d+(?:\.\d+)?)\s*kW/i);
  const torque = text.match(/(\d+(?:\.\d+)?)\s*N-m/i);
  return {
    power: power ? Number(power[1]) : null,
    torque: torque ? Number(torque[1]) : null,
  };
}

function parseChargingStructured(value) {
  const text = String(value || "");
  const supported = /supported|optional/i.test(text);
  const time = text.match(/(\d+(?:\.\d+)?)\s*h/i);
  const range = text.match(/(\d+(?:\.\d+)?)\s*-\s*(\d+(?:\.\d+)?)%/);
  const upperOnly = !range ? text.match(/(?:^|\/|\s)(\d+(?:\.\d+)?)%/) : null;
  return {
    supported,
    timeHours: time ? Number(time[1]) : null,
    minPercent: range ? Number(range[1]) : null,
    maxPercent: range ? Number(range[2]) : upperOnly ? Number(upperOnly[1]) : null,
  };
}

function readExistingTrimRecords(cfg) {
  const records = [];
  for (let offset = 0; ; offset += 200) {
    const data = runLark([
      "base", "+record-list",
      "--base-token", cfg.baseToken,
      "--table-id", cfg.trimTable,
      "--as", "user",
      "--format", "json",
      "--limit", "200",
      "--offset", String(offset),
      "--field-id", "Model ID",
      "--field-id", "Trim Config ID",
    ]);
    const rows = data.data || [];
    rows.forEach((row, index) => {
      records.push({
        recordId: data.record_id_list[index],
        modelId: row[0],
        trimConfigId: row[1],
      });
    });
    if (rows.length < 200) break;
  }
  return records;
}

function deleteRecords(cfg, recordIds) {
  for (let i = 0; i < recordIds.length; i += 200) {
    runLark([
      "base", "+record-delete",
      "--base-token", cfg.baseToken,
      "--table-id", cfg.trimTable,
      "--as", "user",
      "--json", jsonFileArg("delete-trim-records", { record_id_list: recordIds.slice(i, i + 200) }),
      "--yes",
    ]);
  }
}

function batchCreate(cfg, rows) {
  for (let i = 0; i < rows.length; i += 200) {
    runLark([
      "base", "+record-batch-create",
      "--base-token", cfg.baseToken,
      "--table-id", cfg.trimTable,
      "--as", "user",
      "--json", jsonFileArg("trim-records", { fields: TRIM_FIELDS, rows: rows.slice(i, i + 200) }),
    ]);
  }
}

function updateModel(cfg, recordId, fields) {
  runLark([
    "base", "+record-upsert",
    "--base-token", cfg.baseToken,
    "--table-id", cfg.vehicleModelsTable,
    "--record-id", recordId,
    "--as", "user",
    "--json", jsonFileArg("model-trim-summary", fields),
  ]);
}

async function main() {
  const mode = process.argv.includes("--write") ? "write" : "report";
  const cfg = config();
  const verifiedAt = new Date().toISOString().slice(0, 10) + " 00:00:00";
  const models = readModels(cfg);
  console.log(`active_models=${models.length}`);
  const seriesIndex = await buildSeriesIndex();
  console.log(`series_index=${seriesIndex.length}`);

  const report = [];
  const rows = [];
  const updates = [];
  for (const model of models) {
    const match = matchSeries(model, seriesIndex);
    if (!match) {
      report.push({ model: `${model.brand} ${model.model}`, modelId: model.modelId, status: "unmatched" });
      continue;
    }
    try {
      const result = await autohome("/car/param/getParamConf", { mode: 1, site: 1, seriesid: match.series.seriesid });
      const comparison = buildComparison(match.series.seriesid, result);
      if (!comparison.trims.length) {
        report.push({ model: `${model.brand} ${model.model}`, modelId: model.modelId, status: "no_trims", seriesid: match.series.seriesid, seriesname: match.series.seriesname });
        continue;
      }
      rows.push(...buildRows(model, match, comparison, verifiedAt));
      updates.push({
        recordId: model.recordId,
        modelId: model.modelId,
        fields: {
          "Trim Section Status": "Verified",
          "Common Features JSON": JSON.stringify(comparison.commonFeatures),
          "Trim Source Summary": `Trim data verified from Autohome configuration page: ${comparison.sourceUrl}`,
          "Trim Last Verified At": verifiedAt,
        },
      });
      report.push({
        model: `${model.brand} ${model.model}`,
        modelId: model.modelId,
        status: "matched",
        seriesid: match.series.seriesid,
        seriesname: match.series.seriesname,
        alias: match.alias,
        trims: comparison.trims.length,
      });
    } catch (error) {
      report.push({ model: `${model.brand} ${model.model}`, modelId: model.modelId, status: "fetch_failed", seriesid: match.series.seriesid, seriesname: match.series.seriesname, error: error.message });
    }
  }

  fs.mkdirSync(".lark-tmp", { recursive: true });
  fs.writeFileSync(".lark-tmp/autohome-trim-report.json", JSON.stringify(report, null, 2), "utf8");
  fs.writeFileSync(".lark-tmp/autohome-trim-records.json", JSON.stringify({ fields: TRIM_FIELDS, rows }, null, 2), "utf8");
  console.log(`matched=${report.filter((item) => item.status === "matched").length}`);
  console.log(`rows=${rows.length}`);
  console.log(`unmatched=${report.filter((item) => item.status !== "matched").length}`);
  console.log("report=.lark-tmp/autohome-trim-report.json");

  if (mode === "write") {
    const updatedModelIds = new Set(updates.map((item) => item.modelId));
    const existing = readExistingTrimRecords(cfg).filter((item) => updatedModelIds.has(item.modelId));
    console.log(`delete_existing=${existing.length}`);
    if (existing.length) deleteRecords(cfg, existing.map((item) => item.recordId));
    batchCreate(cfg, rows);
    for (const update of updates) updateModel(cfg, update.recordId, update.fields);
    console.log(`wrote_rows=${rows.length}`);
    console.log(`updated_models=${updates.length}`);
  }
}

await main();
