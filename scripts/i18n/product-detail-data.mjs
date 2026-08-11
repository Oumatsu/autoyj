const ui = {
  home: ["首页", "መነሻ"], revenueKing: ["网约创收利器", "የገቢ ንጉሥ"], eliteFlagship: ["商务行政旗舰", "የልሂቃን ፍላግሺፕ"], utilityPro: ["多功能商用先锋", "የንግድ ባለሙያ"],
  whatsappInquiry: ["WhatsApp 咨询", "በWhatsApp ይጠይቁ"], viewFullSpecs: ["查看完整参数", "ሙሉ መረጃውን ይመልከቱ"], factoryPrice: ["出厂价", "የፋብሪካ ዋጋ"], requestBatchQuote: ["获取批量报价", "የጅምላ ዋጋ ይጠይቁ"],
  businessCase: ["商业价值", "የንግድ ጥቅም"], yourMargin: ["您的利润。", "የእርስዎ ትርፍ።"], yourMarket: ["您的市场", "የእርስዎ ገበያ"],
  businessCaseDescription: ["越来越多有前瞻眼光的车队买家准备从燃油车转向电动车，但他们需要合适的价格。该车型以亲民的入门价格和突出的全生命周期成本优势切入这一市场空白，而这正是您的利润空间。", "ወደፊት የሚያስቡ የፍሊት ገዢዎች ከነዳጅ መኪና ወደ EV ለመሸጋገር ዝግጁ ናቸው፤ ነገር ግን ትክክለኛ ዋጋ ይፈልጋሉ። ይህ ሞዴል በተደራሽ መግቢያ ዋጋና በጠንካራ የጠቅላላ ባለቤትነት ወጪ ጥቅም ይህን ክፍተት ይሞላል፤ ያ ክፍተት የእርስዎ ትርፍ ነው።"],
  lowEntryPrice: ["入门价格低，最低订购量易于接受", "ዝቅተኛ መግቢያ ዋጋ እና ተደራሽ ዝቅተኛ የትዕዛዝ ብዛት"], fastTurnover: ["库存周转快，每月显著节省更易促成交易", "ፈጣን የክምችት ዝውውር፤ ጠንካራ ወርሃዊ ቁጠባ ሽያጭን ያፋጥናል"], typicalBatchGross: ["典型10辆批次毛利", "የ10 መኪና ትዕዛዝ የተለመደ ጠቅላላ ትርፍ"],
  estimatedMarginPerUnit: ["单车预估毛利", "በአንድ መኪና የተገመተ ጠቅላላ ትርፍ"], batchProfitEstimator: ["批量利润估算器", "የጅምላ ትርፍ ማስያ"], unitsOrdered: ["订购数量", "የታዘዙ መኪናዎች"], unitsLower: ["辆", "መኪናዎች"], unitsCount: ["{count, plural, =0 {0 辆} =1 {1 辆} other {# 辆}}", "{count, plural, =0 {0 መኪናዎች} =1 {1 መኪና} other {# መኪናዎች}}"], estimatedGrossProfit: ["预估毛利", "የተገመተ ጠቅላላ ትርፍ"], beforeDuties: ["未计进口关税及当地成本", "የጉምሩክ ቀረጥና የአካባቢ ወጪ ሳይጨምር"], units: ["数量", "ብዛት"], marginPerUnit: ["单车利润", "ትርፍ / መኪና"], totalGross: ["总毛利", "ጠቅላላ ትርፍ"], pricingDisclaimer: ["基于新兴市场的典型零售价格。", "በታዳጊ ገበያዎች የተለመደ የችርቻሮ ዋጋ ላይ የተመሠረተ።"], requestDetailedQuote: ["获取详细报价", "ዝርዝር ዋጋ ይጠይቁ"],
  fullSpecifications: ["完整参数", "ሙሉ መረጃ"], model: ["款", "ሞዴል"], performanceRange: ["性能与续航", "አፈጻጸም እና የመንዳት ርቀት"], dimensionsFeatures: ["尺寸与配置", "መጠኖች እና ባህሪያት"], specificationsDisclaimer: ["所示参数适用于最新年款。提供多个配置版本，请联系我们获取完整版本对比。", "የታዩት መረጃዎች ለአዲሱ የሞዴል ዓመት ናቸው። ብዙ ትሪሞች አሉ፤ ሙሉ ንጽጽር ለማግኘት ያነጋግሩን።"],
  idealCustomerProfile: ["理想客户画像", "ተስማሚ የደንበኛ መገለጫ"], whoShouldBuy: ["谁适合购买这款车？", "ይህን መኪና ማን መግዛት አለበት?"],
  allVersions: ["全部版本横向对比", "ሁሉም ትሪሞች ጎን ለጎን"], trimMap: ["版本图谱", "የትሪም ካርታ"], trimMapDescription: ["先看版本卡片，再看各版本之间发生变化的配置。所有版本共有的配置单独列在下方，便于经销商快速识别真正差异。", "በመጀመሪያ የትሪም ካርዶችን፣ ከዚያም የተለወጡ መሳሪያዎችን ይመልከቱ። ለሁሉም የጋራ የሆኑ መሳሪያዎች ከታች ተለይተዋል።"], trimData: ["版本数据", "የትሪም መረጃ"], recommended: ["推荐", "የሚመከር"], level: ["级别", "ደረጃ"], price: ["价格", "ዋጋ"], range: ["续航", "የመንዳት ርቀት"], battery: ["电池", "ባትሪ"], drive: ["驱动", "አንቀሳቃሽ"], entryEquipment: ["入门版配置", "የመግቢያ ትሪም መሳሪያ"], addsOverPrevious: ["相比上一版本新增", "ከቀዳሚው ትሪም በላይ የተጨመረ"], fromLevel: ["继承自级别", "ከደረጃ"],
  versionLadderPending: ["版本阶梯待完善", "የትሪም ደረጃ መረጃ ይጠበቃል"], trimAdditionsUnverified: ["各版本新增配置尚未核实", "የትሪም ተጨማሪ ባህሪያት ገና አልተረጋገጡም"], trimPendingDescription: ["本区域已为有来源依据的版本记录做好准备。在每个版本完成核实前，页面仅展示下方车型级共有配置。", "ይህ ክፍል ምንጭ ላላቸው የትሪም መዝገቦች ዝግጁ ነው። እያንዳንዱ ትሪም እስኪረጋገጥ ድረስ ከታች ያለውን የሞዴል የጋራ ውቅር ብቻ ያሳያል።"], coreSpec: ["核心参数", "ዋና መረጃ"], powertrain: ["动力系统", "የኃይል ስርዓት"], drivetrain: ["驱动形式", "የአንቀሳቃሽ አይነት"], motor: ["电机", "ሞተር"], charging: ["充电", "መሙላት"], packageLogic: ["配置逻辑", "የጥቅል አወቃቀር"], baseEquipment: ["基础配置", "መሠረታዊ መሳሪያ"], addedFeatures: ["新增配置", "የተጨመሩ ባህሪያት"], upgrades: ["升级配置", "የተሻሻሉ ባህሪያት"], allTrimsInclude: ["全系标配", "ሁሉም ትሪሞች ያካትታሉ"], trimFramework: ["版本体系——所有版本共有的标准配置", "የትሪም መዋቅር — በሁሉም ትሪሞች የጋራ መደበኛ መሳሪያ"], requestTrimPricing: ["咨询版本报价", "የትሪም ዋጋ ይጠይቁ"],
};

const englishUi = {
  home: "Home", revenueKing: "Revenue King", eliteFlagship: "Elite Flagship", utilityPro: "Utility Pro", whatsappInquiry: "WhatsApp Inquiry", viewFullSpecs: "View Full Specs", factoryPrice: "Factory Price", requestBatchQuote: "Request Batch Quote", businessCase: "The Business Case", yourMargin: "Your Margin.", yourMarket: "Your Market", businessCaseDescription: "Forward-thinking fleet buyers are ready to transition from ICE to EV — but they need the right price point. The vehicle lands exactly in that gap: an accessible entry price backed by a powerful total-cost-of-ownership story. That gap is your margin.", lowEntryPrice: "Low entry price — accessible minimum order quantity", fastTurnover: "Fast inventory turnover — strong monthly savings close deals quickly", typicalBatchGross: "Typical 10-unit batch gross", estimatedMarginPerUnit: "Estimated Gross Margin per Unit", batchProfitEstimator: "Batch Profit Estimator", unitsOrdered: "Units Ordered", unitsLower: "units", unitsCount: "{count, plural, =0 {0 units} =1 {1 unit} other {# units}}", estimatedGrossProfit: "Estimated Gross Profit", beforeDuties: "Before import duties & local costs", units: "Units", marginPerUnit: "Margin / unit", totalGross: "Total gross", pricingDisclaimer: "Based on typical emerging market retail pricing.", requestDetailedQuote: "Request a detailed quote", fullSpecifications: "Full Specifications", model: "Model", performanceRange: "Performance & Range", dimensionsFeatures: "Dimensions & Features", specificationsDisclaimer: "Specifications shown for latest model year. Multiple trim levels available — contact us for full trim comparison.", idealCustomerProfile: "Ideal Customer Profile", whoShouldBuy: "Who Should Buy This Vehicle?", allVersions: "All Versions - Side by Side", trimMap: "Trim Map", trimMapDescription: "Version cards first, then only the equipment that changes. Shared equipment is separated below so dealers can see the real differences faster.", trimData: "trim data", recommended: "Recommended", level: "Level", price: "Price", range: "Range", battery: "Battery", drive: "Drive", entryEquipment: "Entry equipment", addsOverPrevious: "Adds over previous trim", fromLevel: "from Level", versionLadderPending: "Version ladder pending", trimAdditionsUnverified: "Trim-level additions are not verified yet", trimPendingDescription: "The section is ready for source-backed trim records. Until each version is verified, this page only shows shared model-level configuration below.", coreSpec: "Core Spec", powertrain: "Powertrain", drivetrain: "Drivetrain", motor: "Motor", charging: "Charging", packageLogic: "Package Logic", baseEquipment: "Base Equipment", addedFeatures: "Added Features", upgrades: "Upgrades", allTrimsInclude: "All Trims Include", trimFramework: "Trim Framework - Standard Equipment Across Every Version", requestTrimPricing: "Request Trim Pricing",
};

ui.whyThisModel = ["为什么选择这款车", "ይህን ሞዴል ለምን ይምረጡ"];
englishUi.whyThisModel = "Why this model";

export const sharedDetailTranslations = Object.entries(ui).map(([name, [ZH, AM]]) => ({
  Key: `productsDetail.ui.${name}`, Module: "产品", ZH, EN: englishUi[name] || name, AM,
  Notes: "Shared vehicle-detail interface; intentionally has no vehicle relation",
}));

const dictionaries = {
  zh: {
    "Carried from": "继承自", Edition: "版", Standard: "标配", Optional: "选装", Supported: "支持", supported: "支持", battery: "电池", seats: "座", years: "年", sec: "秒", "Front + rear": "前部+后部", Front: "前部", Rear: "后部", front: "前部", rear: "后部", heating: "加热", ventilation: "通风", adjustment: "调节", "Cruise control": "定速巡航", "Full-speed adaptive cruise control": "全速自适应巡航", "Rearview camera": "倒车影像", "360 camera": "360°全景影像", "touch LCD": "触控液晶屏", "Synthetic leather": "仿皮", "driver side": "驾驶员侧", "front row": "前排", "Market Dependent": "视市场而定", "By Trim": "视配置而定", LHD: "左舵", "Production: 30 days": "生产周期：30天", "Rear motor RWD": "后置电机 RWD", "Hatchback (Sub-Compact)": "两厢车（次紧凑型）", Verified: "已核实", "Needs Source": "需要来源", TBC: "待确认",
  },
  am: {
    "Carried from": "ከዚህ ትሪም የተወረሰ", Edition: "ትሪም", Standard: "መደበኛ", Optional: "አማራጭ", Supported: "ይደገፋል", supported: "ይደገፋል", battery: "ባትሪ", seats: "መቀመጫዎች", years: "ዓመታት", sec: "ሰከንድ", "Front + rear": "ፊት + ኋላ", Front: "ፊት", Rear: "ኋላ", front: "ፊት", rear: "ኋላ", heating: "ማሞቂያ", ventilation: "አየር ማስገቢያ", adjustment: "ማስተካከያ", "Cruise control": "የፍጥነት መቆጣጠሪያ", "Full-speed adaptive cruise control": "ሙሉ-ፍጥነት አዳፕቲቭ ክሩዝ", "Rearview camera": "የኋላ እይታ ካሜራ", "360 camera": "360° ካሜራ", "touch LCD": "ንክኪ LCD", "Synthetic leather": "ሰው ሠራሽ ቆዳ", "driver side": "የአሽከርካሪ ጎን", "front row": "የፊት ረድፍ", "Market Dependent": "እንደ ገበያው", "By Trim": "እንደ ትሪሙ", LHD: "ግራ መሪ (LHD)", "Production: 30 days": "ምርት፦ 30 ቀናት", "Rear motor RWD": "የኋላ ሞተር RWD", "Hatchback (Sub-Compact)": "ሃችባክ (ንዑስ ኮምፓክት)", Verified: "የተረጋገጠ", "Needs Source": "ምንጭ ያስፈልጋል", TBC: "ማረጋገጫ ይጠበቃል",
  },
};

const labels = {
  zh: { "Parking radar": "泊车雷达", "Driver assistance camera": "驾驶辅助影像", "Keyless entry": "无钥匙进入", "Center display size": "中控屏尺寸", "Speaker count": "扬声器数量", "Built-in dashcam": "内置行车记录仪", "Transparent chassis / 540 camera": "透明底盘 / 540°影像", "Cruise system": "巡航系统", "Power tailgate": "电动尾门", "Front seat functions": "前排座椅功能", "Lane departure warning": "车道偏离预警", "AEB / active safety": "AEB / 主动安全", "Forward collision warning": "前方碰撞预警", "Lane keeping assist": "车道保持辅助", "Lane centering": "车道居中", "Traffic sign recognition": "交通标志识别", "Sentry mode": "哨兵模式", "Remote parking": "遥控泊车", "Full LCD instrument cluster": "全液晶仪表", "Wireless phone charging": "手机无线充电", "Driver assistance system": "驾驶辅助系统", "Heated steering wheel": "方向盘加热", "Battery chemistry": "电池化学体系", "Energy type": "能源类型", Drivetrain: "驱动形式", "DC fast charging": "直流快充", "Fast charge range": "快充区间", "Keyless start": "无钥匙启动", "Center display": "中控屏", "Seat material": "座椅材质", "Driver seat adjustment": "驾驶席调节", "Passenger seat adjustment": "副驾驶席调节", "PM2.5 filter": "PM2.5过滤", "Vehicle-to-load": "对外放电", "V2L AC discharge power": "V2L交流放电功率" },
  am: { "Parking radar": "የፓርኪንግ ራዳር", "Driver assistance camera": "የአሽከርካሪ እገዛ ካሜራ", "Keyless entry": "ያለ ቁልፍ መግቢያ", "Center display size": "የመሃል ማያ መጠን", "Speaker count": "የድምፅ ማጉያ ብዛት", "Built-in dashcam": "አብሮገነብ ዳሽካም", "Transparent chassis / 540 camera": "ግልጽ ቻሲ / 540° ካሜራ", "Cruise system": "የክሩዝ ስርዓት", "Power tailgate": "ኤሌክትሪክ የኋላ በር", "Front seat functions": "የፊት መቀመጫ ተግባራት", "Lane departure warning": "ከመስመር መውጣት ማስጠንቀቂያ", "AEB / active safety": "AEB / ንቁ ደህንነት", "Forward collision warning": "የፊት ግጭት ማስጠንቀቂያ", "Lane keeping assist": "የመስመር ጥበቃ እገዛ", "Lane centering": "በመስመር መሃል መቆየት", "Traffic sign recognition": "የትራፊክ ምልክት ማወቂያ", "Sentry mode": "የጥበቃ ሁነታ", "Remote parking": "የርቀት ፓርኪንግ", "Full LCD instrument cluster": "ሙሉ LCD የመሳሪያ ሰሌዳ", "Wireless phone charging": "ገመድ አልባ ስልክ መሙላት", "Driver assistance system": "የአሽከርካሪ እገዛ ስርዓት", "Heated steering wheel": "የሚሞቅ መሪ", "Battery chemistry": "የባትሪ ኬሚስትሪ", "Energy type": "የኃይል አይነት", Drivetrain: "የአንቀሳቃሽ አይነት", "DC fast charging": "DC ፈጣን መሙላት", "Fast charge range": "የፈጣን መሙላት ክልል", "Keyless start": "ያለ ቁልፍ ማስነሳት", "Center display": "የመሃል ማያ", "Seat material": "የመቀመጫ ቁሳቁስ", "Driver seat adjustment": "የአሽከርካሪ መቀመጫ ማስተካከያ", "Passenger seat adjustment": "የተሳፋሪ መቀመጫ ማስተካከያ", "PM2.5 filter": "PM2.5 ማጣሪያ", "Vehicle-to-load": "V2L ውጫዊ ኃይል", "V2L AC discharge power": "V2L AC የውጤት ኃይል" },
};

Object.assign(dictionaries.zh, {
  "Adaptive cruise control": "自适应巡航", "Power sunroof": "电动天窗", "Openable panoramic sunroof": "可开启全景天窗", "Fixed panoramic sunroof": "固定式全景天窗", "Segmented fixed sunroof": "分段式固定天窗",
  Fabric: "织物", Leather: "真皮", Suede: "麂皮", "Leather/fabric mix": "真皮/织物混搭", "Leather/suede mix": "真皮/麂皮混搭", "Leather/Alcantaramix": "真皮/Alcantara混搭",
  "fore-aft": "前后", backrest: "靠背", height: "高低", lumbar: "腰部", "lumbar support": "腰部支撑", "leg-rest": "腿托", footrest: "脚托", lateral: "侧向", swivel: "旋转", massage: "按摩", "side bolster support": "侧翼支撑", active: "主动", "all seats": "全部座椅", "rear row": "后排", "only driver side": "仅驾驶员侧", "only passenger side": "仅副驾驶侧", headrestspeakers: "头枕扬声器", speakers: "扬声器", "standard LCD": "普通液晶屏", "side blind-spot camera": "侧方盲区影像", "from Vehicle Models": "（来自车型主表）", "from BYD official page": "（来自比亚迪官网）", "system output": "系统输出", "range": "续航", "plug-in hybrid architecture": "插电混动架构",
});
Object.assign(dictionaries.am, {
  "Adaptive cruise control": "አዳፕቲቭ ክሩዝ", "Power sunroof": "ኤሌክትሪክ ሰንሩፍ", "Openable panoramic sunroof": "የሚከፈት ፓኖራሚክ ሰንሩፍ", "Fixed panoramic sunroof": "ቋሚ ፓኖራሚክ ሰንሩፍ", "Segmented fixed sunroof": "የተከፋፈለ ቋሚ ሰንሩፍ",
  Fabric: "ጨርቅ", Leather: "ቆዳ", Suede: "ሱዌድ", "Leather/fabric mix": "ቆዳ/ጨርቅ ድብልቅ", "Leather/suede mix": "ቆዳ/ሱዌድ ድብልቅ", "Leather/Alcantaramix": "ቆዳ/Alcantara ድብልቅ",
  "fore-aft": "ወደፊት-ወደኋላ", backrest: "የጀርባ መደገፊያ", height: "ከፍታ", lumbar: "ወገብ", "lumbar support": "የወገብ ድጋፍ", "leg-rest": "የእግር ማሳረፊያ", footrest: "የእግር መደገፊያ", lateral: "የጎን", swivel: "መዞር", massage: "ማሳጅ", "side bolster support": "የጎን ድጋፍ", active: "ንቁ", "all seats": "ሁሉም መቀመጫዎች", "rear row": "የኋላ ረድፍ", "only driver side": "የአሽከርካሪ ጎን ብቻ", "only passenger side": "የተሳፋሪ ጎን ብቻ", headrestspeakers: "የራስ መደገፊያ ድምፅ ማጉያ", speakers: "ድምፅ ማጉያዎች", "standard LCD": "መደበኛ LCD", "side blind-spot camera": "የጎን ዓይነ ስውር ካሜራ", "from Vehicle Models": "ከVehicle Models", "from BYD official page": "ከBYD ኦፊሴላዊ ገጽ", "system output": "የስርዓት ውጤት", "range": "የመንዳት ርቀት", "plug-in hybrid architecture": "የPHEV አወቃቀር",
  "EREV式": "EREV", "图灵": "Turing", "-seat垫侧翼": "seat side bolster", "Deepal AD Pro 深蓝driving驶辅助": "Deepal AD Pro driver assistance", "分段式": "segmented ",
});
Object.assign(labels.zh, {
  "Cabin air purifier": "座舱空气净化器", "Driver assistance chip": "驾驶辅助芯片", "Hands-free tailgate": "感应式尾门", "Heat pump": "热泵", "Negative ion generator": "负离子发生器", "Second-row seat adjustment": "第二排座椅调节", "Second-row seat functions": "第二排座椅功能", "Speaker brand": "音响品牌", "Steering wheel memory": "方向盘记忆", "Sunroof type": "天窗类型", "Tailgate position memory": "尾门位置记忆",
});
Object.assign(labels.am, {
  "Cabin air purifier": "የካቢን አየር ማጣሪያ", "Driver assistance chip": "የአሽከርካሪ እገዛ ቺፕ", "Hands-free tailgate": "ያለ እጅ የሚከፈት የኋላ በር", "Heat pump": "የሙቀት ፓምፕ", "Negative ion generator": "ኔጌቲቭ አይዮን ጀነሬተር", "Second-row seat adjustment": "የሁለተኛ ረድፍ መቀመጫ ማስተካከያ", "Second-row seat functions": "የሁለተኛ ረድፍ መቀመጫ ተግባራት", "Speaker brand": "የድምፅ ማጉያ ብራንድ", "Steering wheel memory": "የመሪ ማስታወሻ", "Sunroof type": "የሰንሩፍ አይነት", "Tailgate position memory": "የኋላ በር ቦታ ማስታወሻ",
});

function replaceTokens(value, locale) {
  let output = value;
  const entries = Object.entries(dictionaries[locale]).sort((a, b) => b[0].length - a[0].length);
  for (const [source, target] of entries) output = output.split(source).join(target);
  return output;
}

export function translateTrimName(value, locale) {
  if (locale === "en" || !value) return value;
  return replaceTokens(value, locale);
}

export function translateAutomotivePhrase(value, locale) {
  if (locale === "en" || !value) return value;
  const arrowParts = value.split(/\s*->\s*/);
  if (arrowParts.length > 1) return arrowParts.map((part) => translateAutomotivePhrase(part, locale)).join(" -> ");
  const carried = value.match(/^Carried from ([^:]+):\s*(.*)$/i);
  if (carried) return `${dictionaries[locale]["Carried from"]} ${translateTrimName(carried[1], locale)}：${translateAutomotivePhrase(carried[2], locale)}`;
  const colon = value.indexOf(":");
  if (colon >= 0) {
    const label = value.slice(0, colon).trim();
    const rest = value.slice(colon + 1).trim();
    return `${labels[locale][label] || replaceTokens(label, locale)}：${translateAutomotivePhrase(rest, locale)}`;
  }
  return value.split(";").map((part) => replaceTokens(part.trim(), locale)).join(locale === "zh" ? "；" : "፤ ");
}

export function translateAutomotiveArray(values, locale) {
  return values.map((value) => translateAutomotivePhrase(value, locale));
}
