import fs from 'fs';
import path from 'path';
import { execFileSync } from 'child_process';

// 1. Load environment variables from .dev.vars
function loadEnv() {
  const envPath = path.resolve(process.cwd(), '.dev.vars');
  if (!fs.existsSync(envPath)) return {};
  const content = fs.readFileSync(envPath, 'utf8');
  const env = {};
  for (const line of content.split(/\r?\n/)) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;
    const index = trimmed.indexOf('=');
    if (index === -1) continue;
    env[trimmed.slice(0, index)] = trimmed.slice(index + 1);
  }
  return env;
}

const env = { ...loadEnv(), ...process.env };
const FEISHU_APP_ID = env.FEISHU_APP_ID;
const FEISHU_APP_SECRET = env.FEISHU_APP_SECRET;
const FEISHU_BASE_TOKEN = env.FEISHU_BASE_APP_TOKEN;

if (!FEISHU_APP_ID || !FEISHU_APP_SECRET || !FEISHU_BASE_TOKEN) {
  console.error("Missing required Feishu credentials in .dev.vars or environment.");
  process.exit(1);
}

// 2. Setup Lark CLI runner helper
function runLarkCli(args) {
  const command = process.platform === "win32" ? "powershell.exe" : (process.env.LARK_CLI_BIN || "lark-cli");
  const commandArgs = process.platform === "win32"
    ? [
        "-NoProfile",
        "-ExecutionPolicy",
        "Bypass",
        "-File",
        process.env.LARK_CLI_BIN || path.join(process.env.APPDATA || "", "npm", "lark-cli.ps1"),
        ...args,
      ]
    : args;
  
  const output = execFileSync(command, commandArgs, {
    cwd: process.cwd(),
    encoding: "utf8",
    stdio: ["ignore", "pipe", "pipe"],
  });
  const start = output.indexOf("{");
  const end = output.lastIndexOf("}");
  if (start === -1 || end === -1) {
    throw new Error(`lark-cli returned non-JSON output:\n${output}`);
  }
  return JSON.parse(output.slice(start, end + 1));
}

function jsonFileArg(name, value) {
  const tempDir = ".lark-tmp";
  if (!fs.existsSync(tempDir)) {
    fs.mkdirSync(tempDir, { recursive: true });
  }
  const file = path.join(tempDir, `${name}-${Math.random().toString(36).slice(2)}.json`);
  fs.writeFileSync(file, JSON.stringify(value), "utf8");
  return `@./${file.replaceAll("\\", "/")}`;
}

function tableList(baseToken) {
  const data = runLarkCli(["base", "+table-list", "--as", "user", "--base-token", baseToken, "--limit", "100"]);
  const tables = data.items || data.tables || data.data?.items || data.data?.tables || [];
  const result = {};
  for (const table of tables) {
    const id = table.table_id || table.id;
    const name = table.name || table.table_name;
    if (id && name) result[name] = id;
  }
  return result;
}

function createTable(baseToken, name, fields) {
  runLarkCli([
    "base",
    "+table-create",
    "--as",
    "user",
    "--base-token",
    baseToken,
    "--name",
    name,
    "--fields",
    jsonFileArg(`${name}-fields`, fields),
  ]);
}

// 3. New Table Schemas definition
const newSchemas = {
  "Articles": [
    { name: "slug", type: "text" },
    { name: "title", type: "text" },
    { name: "category", type: "select", multiple: false, options: [
      { name: "Market Analysis" },
      { name: "Policy & Tariffs" },
      { name: "Sourcing Intelligence" },
      { name: "Operator Hub" },
      { name: "Product Watch" },
      { name: "Pricing & Trade" }
    ]},
    { name: "overview", type: "text" },
    { name: "cover_image", type: "text" },
    { name: "publish_date", type: "text" },
    { name: "read_time", type: "text" },
    { name: "content", type: "text" },
    { name: "status", type: "select", multiple: false, options: [{ name: "Published" }, { name: "Draft" }]}
  ],
  "Academy Lessons": [
    { name: "slug", type: "text" },
    { name: "title", type: "text" },
    { name: "category", type: "select", multiple: false, options: [
      { name: "fundamentals" },
      { name: "playbook" },
      { name: "workshop" }
    ]},
    { name: "tag", type: "text" },
    { name: "description", type: "text" },
    { name: "cover_image", type: "text" },
    { name: "content", type: "text" },
    { name: "status", type: "select", multiple: false, options: [{ name: "Published" }, { name: "Draft" }]}
  ],
  "Academy Vault": [
    { name: "title", type: "text" },
    { name: "type", type: "select", multiple: false, options: [
      { name: "Excel Model" },
      { name: "PDF Guide" },
      { name: "Video Tutorial" },
      { name: "PDF Checklist" },
      { name: "PDF Whitepaper" }
    ]},
    { name: "size", type: "text" },
    { name: "download_link", type: "text" },
    { name: "description", type: "text" }
  ]
};

// 4. Feishu API helpers using lark-cli (with --as user for authorized operations)
function getTableFields(tableId) {
  const res = runLarkCli([
    "base",
    "+field-list",
    "--as",
    "user",
    "--base-token",
    FEISHU_BASE_TOKEN,
    "--table-id",
    tableId
  ]);
  const fields = res.data?.fields || [];
  return fields.map(f => ({ field_name: f.name }));
}

function createField(tableId, fieldName, type) {
  return runLarkCli([
    "base",
    "+field-create",
    "--as",
    "user",
    "--base-token",
    FEISHU_BASE_TOKEN,
    "--table-id",
    tableId,
    "--json",
    JSON.stringify({
      name: fieldName,
      type: "text"
    })
  ]);
}

function getAllRecords(tableId) {
  let recordIds = [];
  let offset = 0;
  let hasMore = true;
  while (hasMore) {
    const res = runLarkCli([
      "base",
      "+record-list",
      "--as",
      "user",
      "--base-token",
      FEISHU_BASE_TOKEN,
      "--table-id",
      tableId,
      "--format",
      "json",
      "--limit",
      "100",
      "--offset",
      String(offset)
    ]);
    const ids = res.data?.record_id_list || [];
    recordIds = recordIds.concat(ids);
    if (ids.length < 100) {
      hasMore = false;
    } else {
      offset += 100;
    }
  }
  return recordIds;
}

function deleteRecords(tableId, recordIds) {
  if (recordIds.length === 0) return;
  for (let i = 0; i < recordIds.length; i += 50) {
    const chunk = recordIds.slice(i, i + 50);
    const args = [
      "base",
      "+record-delete",
      "--as",
      "user",
      "--base-token",
      FEISHU_BASE_TOKEN,
      "--table-id",
      tableId,
      "--yes"
    ];
    for (const id of chunk) {
      args.push("--record-id", id);
    }
    runLarkCli(args);
  }
}

function clearTable(tableId) {
  const recordIds = getAllRecords(tableId);
  if (recordIds.length > 0) {
    console.log(`Clearing ${recordIds.length} records from table ${tableId}...`);
    deleteRecords(tableId, recordIds);
  }
}

function batchCreateRecords(tableId, records) {
  if (records.length === 0) return [];
  const fields = Object.keys(records[0]);
  const rows = records.map(row => fields.map(f => row[f] === undefined ? null : row[f]));
  
  const createdIds = [];
  for (let i = 0; i < records.length; i += 200) {
    const chunkRows = rows.slice(i, i + 200);
    const payload = { fields, rows: chunkRows };
    const res = runLarkCli([
      "base",
      "+record-batch-create",
      "--as",
      "user",
      "--base-token",
      FEISHU_BASE_TOKEN,
      "--table-id",
      tableId,
      "--json",
      jsonFileArg("batch-create", payload)
    ]);
    const items = res.items || res.records || res.data?.items || res.data?.records || [];
    createdIds.push(...items.map(it => it.record_id || it.id));
  }
  return createdIds;
}

// 5. Array extraction and parsing helpers
function extractArrayFromContent(content, marker) {
  const index = content.indexOf(marker);
  if (index === -1) return null;
  const start = index + marker.length - 1; // start with '['
  let braceCount = 0;
  let inString = false;
  let stringChar = "";
  let escape = false;
  let end = start;
  for (let i = start; i < content.length; i++) {
    const char = content[i];
    if (escape) { escape = false; continue; }
    if (char === "\\") { escape = true; continue; }
    if (inString) { if (char === stringChar) inString = false; continue; }
    if (char === '"' || char === "'" || char === '`') { inString = true; stringChar = char; continue; }
    if (char === '[') { braceCount++; }
    else if (char === ']') {
      braceCount--;
      if (braceCount === 0) { end = i + 1; break; }
    }
  }
  const raw = content.slice(start, end);
  return new Function(`return ${raw}`)();
}

function extractContentString(fileContent) {
  const marker = "const content = ";
  const index = fileContent.indexOf(marker);
  if (index === -1) return null;
  const start = index + marker.length;
  const quote = fileContent[start];
  let inEscape = false;
  let result = "";
  for (let i = start + 1; i < fileContent.length; i++) {
    const char = fileContent[i];
    if (inEscape) {
      inEscape = false;
      result += char;
      continue;
    }
    if (char === "\\") {
      inEscape = true;
      result += char;
      continue;
    }
    if (char === quote) {
      break;
    }
    result += char;
  }
  try {
    return new Function(`return ${quote}${result}${quote}`)();
  } catch (err) {
    return result;
  }
}

function parseVehiclePageData(filePath) {
  const content = fs.readFileSync(filePath, 'utf8');
  const marker = "const data = ";
  const index = content.indexOf(marker);
  if (index === -1) {
    throw new Error(`Could not find "const data = " in ${filePath}`);
  }
  const start = index + marker.length;
  let braceCount = 0;
  let inString = false;
  let stringChar = "";
  let escape = false;
  let end = start;
  for (let i = start; i < content.length; i++) {
    const char = content[i];
    if (escape) { escape = false; continue; }
    if (char === "\\") { escape = true; continue; }
    if (inString) { if (char === stringChar) inString = false; continue; }
    if (char === '"' || char === "'" || char === '`') { inString = true; stringChar = char; continue; }
    if (char === '{') { braceCount++; }
    else if (char === '}') {
      braceCount--;
      if (braceCount === 0) { end = i + 1; break; }
    }
  }
  const raw = content.slice(start, end);
  const cleaned = raw
    .replace(/as\s+const/g, "")
    .replace(/:\s*(Category|VehicleSpec\[\]|VehicleFit\[\]|TrimItem\[\])/g, "");
  
  return new Function("return " + cleaned)();
}

// 6. Hardcoded custom fallback for byd-seagull
const bydSeagullData = {
  vehicle: {
    brand: "BYD",
    name: "Seagull",
    fob: "$10,000 – $12,300",
    battery: "38.88 kWh",
    batteryType: "LFP Blade",
    range: "405 km",
    charging: "Global #1 commuter — Blade Battery + rotating touchscreen + mature 3-electric system",
    img: "/pic/revenue-king/seagull/7.webp",
    status: "in-stock",
    statusText: "In Stock: Shenzhen",
  },
  category: "revenue-king",
  title: "BYD Seagull",
  subtitle: "The Global #1 EV",
  heroDesc: "The world's top-selling compact EV. The strongest weapon against the used ICE market — your customers save up to $250 every month.",
  stat1Label: "km CLTC Range", stat1Value: "405",
  stat2Label: "Max Monthly Saving", stat2Value: "$250",
  stat3Label: "LFP Battery", stat3Value: "Blade",
  whyTitle: "Why It Sells",
  whyDesc: "The strongest weapon against used ICE.",
  features: [
    { icon: "🛡️", title: "Blade Battery Safety", desc: "BYD's proprietary LFP Blade cell design eliminates thermal runaway — the #1 safety concern your customers ask about. Zero fire risk, maximum owner confidence." },
    { icon: "📱", title: "Rotating 10.1\" Touchscreen", desc: "A premium feature typically seen in $30,000+ cars — now standard in a budget EV. Your showroom's strongest visual closer when customers sit inside." },
    { icon: "✅", title: "1M+ Units Validated", desc: "Over one million Seagulls in daily operation worldwide. The maturity of this platform means lower defect rates, globally available parts, and minimal after-sales headache." }
  ],
  specsLeft: [
    { label: "Vehicle Class", value: "Small Sedan" },
    { label: "Range (CLTC)", value: "405 km" },
    { label: "Battery Capacity", value: "38.88 kWh" },
    { label: "Battery Type", value: "LFP Blade" },
    { label: "Motor Power", value: "70 kW (95 hp)" },
    { label: "Drive Type", value: "Front-Wheel Drive" },
    { label: "0 – 100 km/h", value: "9.7 sec" },
    { label: "Top Speed", value: "130 km/h" },
    { label: "DC Fast Charge", value: "~30 min (30%→80%)" },
    { label: "AC Slow Charge", value: "~6 hrs (0→100%)" }
  ],
  specsRight: [
    { label: "Household Charging", value: "Yes — 220V / ~18 hrs" },
    { label: "Battery Warranty", value: "8 Yrs / 150,000 km" },
    { label: "Dimensions (L×W×H)", value: "3,780 × 1,715 × 1,540 mm" },
    { label: "Boot Volume", value: "226 L" },
    { label: "Seating Capacity", value: "5 Seats" },
    { label: "Sunroof", value: "Available (Higher Trims)" },
    { label: "Ground Clearance", value: "130 mm" },
    { label: "Airbags", value: "6 (Front + Side + Curtain)" },
    { label: "V2L Support", value: "Not Supported" }
  ],
  fits: [
    { icon: "🚕", title: "Network Taxi", desc: "Perfect for ride-hailing with low operational costs.", accent: "High yield" },
    { icon: "🏢", title: "Urban Fleet", desc: "Reliable city runner for business operations.", accent: "Fleet ready" },
    { icon: "👨‍👩‍👧‍👦", title: "Family 2nd Car", desc: "Ideal school and shopping runner.", accent: "Smart commute" }
  ],
  relatedModels: [
    { name: "BYD Dolphin", href: "/products/revenue-king/byd-dolphin" },
    { name: "Geely Geome", href: "/products/revenue-king/geely-geome" }
  ],
  tags: ["Hatchback (Sub-Compact)", "LFP (Lithium Iron Phosphate)", "300 km - 450 km", "Under $15,000", "LHD (Left-Hand Drive)", "In Stock (Port)"],
  galleryImages: [
    { src: "/pic/revenue-king/seagull/0.webp", cat: "Exterior", label: "" },
    { src: "/pic/revenue-king/seagull/1.webp", cat: "Exterior", label: "" },
    { src: "/pic/revenue-king/seagull/2.webp", cat: "Exterior", label: "" },
    { src: "/pic/revenue-king/seagull/3.webp", cat: "Exterior", label: "" },
    { src: "/pic/revenue-king/seagull/4.webp", cat: "Interior", label: "" },
    { src: "/pic/revenue-king/seagull/5.webp", cat: "Interior", label: "" },
    { src: "/pic/revenue-king/seagull/6.webp", cat: "Interior", label: "" },
    { src: "/pic/revenue-king/seagull/9.webp", cat: "Interior", label: "" },
    { src: "/pic/revenue-king/seagull/10.webp", cat: "Detail", label: "" },
    { src: "/pic/revenue-king/seagull/11.webp", cat: "Detail", label: "" },
    { src: "/pic/revenue-king/seagull/12.webp", cat: "Detail", label: "" },
    { src: "/pic/revenue-king/seagull/13.webp", cat: "Detail", label: "" },
    { src: "/pic/revenue-king/seagull/14.webp", cat: "Detail", label: "" },
    { src: "/pic/revenue-king/seagull/15.webp", cat: "Detail", label: "" },
    { src: "/pic/revenue-king/seagull/16.webp", cat: "Detail", label: "" }
  ],
  batchLevels: [
    { units: 10, display: "$45K – $65K" },
    { units: 20, display: "$90K – $130K" },
    { units: 50, display: "$225K – $325K" },
    { units: 100, display: "$450K – $650K" }
  ],
  trimData: [
    { name: "Standard", range: "305 km", accel: "10.9 sec", sunroof: "✗ None", airbags: "4", seat: "Fabric", fob: "Lowest" },
    { name: "Comfort", range: "305 km", accel: "10.9 sec", sunroof: "✗ None", airbags: "6", seat: "Fabric", fob: "Low" },
    { name: "Honor", range: "405 km", accel: "9.7 sec", sunroof: "○ Optional", airbags: "6", seat: "Leatherette", fob: "Mid ★", rec: true },
    { name: "Distinguished", range: "405 km", accel: "9.7 sec", sunroof: "✓ Standard", airbags: "6", seat: "Full Leather", fob: "Premium" }
  ]
};

const EXISTING_MODEL_IDS = {
  "byd yuan plus": "MDL-001",
  "byd seagull": "MDL-002",
  "geely galaxy e5": "MDL-003"
};

let nextModelNum = 4;
function getModelId(brand, name) {
  const key = `${brand.trim()} ${name.trim()}`.toLowerCase();
  if (EXISTING_MODEL_IDS[key]) return EXISTING_MODEL_IDS[key];
  const id = `MDL-${String(nextModelNum++).padStart(3, '0')}`;
  return id;
}

function mapSpecLabelToCategory(label) {
  const l = label.toLowerCase().trim();
  if (l === "vehicle class" || l === "0 - 100 km/h" || l === "0 – 100 km/h" || l === "top speed") {
    return "基本参数";
  }
  if (l.includes("dimensions") || l === "wheelbase" || l === "boot volume" || l === "frunk volume" || l === "fuel tank" || l === "ground clearance") {
    return "车身";
  }
  if (l.includes("motor") || l.includes("drive type") || l === "system power" || l.includes("torque")) {
    return "电动机";
  }
  if (l.includes("battery") || l.includes("charge") || l.includes("charging") || l.includes("range")) {
    return "电池/充电";
  }
  if (l === "airbags" || l === "safety") {
    return "被动安全";
  }
  if (l === "seating capacity" || l === "seating" || l === "seats" || l === "audio" || l === "screens" || l === "sunroof") {
    return "内部配置";
  }
  if (l.includes("v2l")) {
    return "电池/充电";
  }
  return "其他";
}

// 7. Update .dev.vars with new table keys
function updateEnvVars(newVars) {
  const paths = [
    path.resolve(process.cwd(), '.dev.vars'),
    path.resolve(process.cwd(), '.dev.vars.feishu.example')
  ];

  for (const p of paths) {
    if (!fs.existsSync(p)) continue;
    let content = fs.readFileSync(p, 'utf8');
    for (const [key, value] of Object.entries(newVars)) {
      const regex = new RegExp(`^${key}=.*$`, 'm');
      if (regex.test(content)) {
        content = content.replace(regex, `${key}=${value}`);
      } else {
        content = content.trim() + `\n${key}=${value}\n`;
      }
    }
    fs.writeFileSync(p, content, 'utf8');
    console.log(`Updated environment keys in ${p}`);
  }
}

// 8. Main migration script
async function main() {
  console.log("Starting data import to Feishu...");

  // Check and create missing tables
  let tables = tableList(FEISHU_BASE_TOKEN);
  let tableCreated = false;
  for (const [name, fields] of Object.entries(newSchemas)) {
    if (!tables[name]) {
      console.log(`Creating table: ${name}`);
      createTable(FEISHU_BASE_TOKEN, name, fields);
      tableCreated = true;
    }
  }
  if (tableCreated) {
    tables = tableList(FEISHU_BASE_TOKEN);
  }

  // Update .dev.vars files with the new table IDs
  updateEnvVars({
    FEISHU_TABLE_ARTICLES: tables["Articles"],
    FEISHU_TABLE_ACADEMY_LESSONS: tables["Academy Lessons"],
    FEISHU_TABLE_ACADEMY_VAULT: tables["Academy Vault"]
  });

  // Ensure all missing fields exist on Vehicle Models
  const modelFields = getTableFields(tables["Vehicle Models"]);
  const existingFieldNames = new Set(modelFields.map(f => f.field_name));
  const requiredFields = [
    "subtitle", "heroDesc", "stat1Label", "stat1Value", "stat2Label", "stat2Value",
    "stat3Label", "stat3Value", "whyTitle", "whyDesc", "features", "fits",
    "relatedModels", "tags", "galleryImages", "batchLevels", "trimData"
  ];
  for (const fieldName of requiredFields) {
    if (!existingFieldNames.has(fieldName)) {
      console.log(`Adding missing field ${fieldName} to Vehicle Models table...`);
      createField(tables["Vehicle Models"], fieldName, 1);
    }
  }

  // Clear existing records for clean population
  clearTable(tables["Vehicle Models"]);
  clearTable(tables["Vehicle Model Specs"]);
  clearTable(tables["Articles"]);
  clearTable(tables["Academy Lessons"]);
  clearTable(tables["Academy Vault"]);

  // -- POPULATE VEHICLES --
  console.log("Processing vehicles...");
  const categories = ["elite-flagship", "revenue-king", "utility-pro"];
  const vehicleRecords = [];
  const specRecords = [];

  for (const category of categories) {
    const dataPath = path.resolve(process.cwd(), `app/products/${category}/data.ts`);
    const { vehicles } = await import(dataPath);
    console.log(`Found ${vehicles.length} vehicles in category ${category}`);

    for (const v of vehicles) {
      const slug = v.link.split('/').pop();
      let pageData;
      if (slug === "byd-seagull") {
        pageData = bydSeagullData;
      } else {
        const pagePath = path.resolve(process.cwd(), `app/products/${category}/${slug}/page.tsx`);
        pageData = parseVehiclePageData(pagePath);
      }

      const modelId = getModelId(pageData.vehicle.brand, pageData.vehicle.name);

      // Map model fields
      const modelFields = {
        "Model ID": modelId,
        "Brand": pageData.vehicle.brand,
        "Model": pageData.vehicle.name,
        "Year": "2026",
        "Version": pageData.subtitle || "",
        "China Guide Price CNY": pageData.vehicle.fob,
        "Review Notes": pageData.whyDesc || "",
        "Image URL": pageData.vehicle.img,
        "Brochure URL": "",
        "Source URL": `http://localhost:3000/products/${category}/${slug}`,
        "Source Name": "autoYJ",
        "Last Synced At": new Date().toISOString().replace('T', ' ').substring(0, 16),
        "Status": "Active",
        "subtitle": pageData.subtitle || "",
        "heroDesc": pageData.heroDesc || "",
        "stat1Label": pageData.stat1Label || "",
        "stat1Value": pageData.stat1Value || "",
        "stat2Label": pageData.stat2Label || "",
        "stat2Value": pageData.stat2Value || "",
        "stat3Label": pageData.stat3Label || "",
        "stat3Value": pageData.stat3Value || "",
        "whyTitle": pageData.whyTitle || "",
        "whyDesc": pageData.whyDesc || "",
        "features": JSON.stringify(pageData.features || []),
        "fits": JSON.stringify(pageData.fits || []),
        "relatedModels": JSON.stringify(pageData.relatedModels || []),
        "tags": JSON.stringify(pageData.tags || []),
        "galleryImages": JSON.stringify(pageData.galleryImages || []),
        "batchLevels": JSON.stringify(pageData.batchLevels || []),
        "trimData": JSON.stringify(pageData.trimData || [])
      };
      vehicleRecords.push(modelFields);

      // Map specs Left & Right
      let sortOrder = 10;
      const allSpecs = [
        ...(pageData.specsLeft || []).map(s => ({ ...s, level: "Core" })),
        ...(pageData.specsRight || []).map(s => ({ ...s, level: "Standard" }))
      ];

      for (const spec of allSpecs) {
        specRecords.push({
          "Model ID": modelId,
          "Brand": pageData.vehicle.brand,
          "Model": pageData.vehicle.name,
          "Year": "2026",
          "Version": "",
          "Category": mapSpecLabelToCategory(spec.label),
          "Spec Name": spec.label,
          "Spec Value": spec.value,
          "Unit": "",
          "Normalized Value": spec.value,
          "Visible Level": spec.level,
          "Sort Order": sortOrder,
          "Source Name": "autoYJ",
          "Source URL": `http://localhost:3000/products/${category}/${slug}`,
          "Confidence": "High",
          "Last Synced At": new Date().toISOString().replace('T', ' ').substring(0, 16),
          "Notes": ""
        });
        sortOrder += 10;
      }
    }
  }

  console.log(`Uploading ${vehicleRecords.length} vehicle models to Feishu...`);
  batchCreateRecords(tables["Vehicle Models"], vehicleRecords);
  console.log(`Uploading ${specRecords.length} specs to Feishu...`);
  batchCreateRecords(tables["Vehicle Model Specs"], specRecords);

  // -- POPULATE ARTICLES --
  console.log("Processing articles...");
  const insightsPath = path.resolve(process.cwd(), "app/insights/page.tsx");
  const insightsContent = fs.readFileSync(insightsPath, "utf8");
  const articlesList = extractArrayFromContent(insightsContent, "const articles = [");
  const articleRecords = [];

  for (const art of articlesList) {
    const articlePagePath = path.resolve(process.cwd(), `app/insights/${art.slug}/page.tsx`);
    if (!fs.existsSync(articlePagePath)) {
      console.warn(`Article page not found: ${articlePagePath}`);
      continue;
    }
    const pageContent = fs.readFileSync(articlePagePath, "utf8");
    const htmlBody = extractContentString(pageContent) || "";
    const coverImageUrl = `/insights/images/${art.slug}/${art.coverImage}`;

    articleRecords.push({
      "slug": art.slug,
      "title": art.title,
      "category": art.category,
      "overview": art.overview,
      "cover_image": coverImageUrl,
      "publish_date": art.sortDate,
      "read_time": art.readTime,
      "content": htmlBody.replace(/images\//g, '/insights/images/'),
      "status": "Published"
    });
  }

  console.log(`Uploading ${articleRecords.length} articles to Feishu...`);
  batchCreateRecords(tables["Articles"], articleRecords);

  // -- POPULATE ACADEMY --
  console.log("Processing academy lessons & vault...");
  const academyPagePath = path.resolve(process.cwd(), "app/academy/page.tsx");
  const academyContent = fs.readFileSync(academyPagePath, "utf8");

  const fundLessons = extractArrayFromContent(academyContent, "const fundamentalsArticles = [");
  const playLessons = extractArrayFromContent(academyContent, "const playbookArticles = [");
  const workLessons = extractArrayFromContent(academyContent, "const workshopArticles = [");
  const vaultItems = extractArrayFromContent(academyContent, "const vaultItems = [");

  const lessonRecords = [];
  const lessonsWithCategories = [
    { list: fundLessons, catName: "fundamentals", dirName: "ev-fundamentals" },
    { list: playLessons, catName: "playbook", dirName: "dealer-playbook" },
    { list: workLessons, catName: "workshop", dirName: "technical-workshop" }
  ];

  for (const { list, catName, dirName } of lessonsWithCategories) {
    for (const les of list) {
      const lessonPagePath = path.resolve(process.cwd(), `app/academy/${dirName}/${les.slug}/page.tsx`);
      if (!fs.existsSync(lessonPagePath)) {
        console.warn(`Lesson page not found: ${lessonPagePath}`);
        continue;
      }
      const pageContent = fs.readFileSync(lessonPagePath, "utf8");
      const htmlBody = extractContentString(pageContent) || "";

      // Try to parse cover image from page.tsx or fallback to les.img
      const imgMatch = pageContent.match(/aspect-\[21\/9\][\s\S]*?src="([^"]+)"/);
      const coverImage = imgMatch ? imgMatch[1] : (les.img || "");

      lessonRecords.push({
        "slug": les.slug,
        "title": les.title,
        "category": catName,
        "tag": les.tag || "",
        "description": les.desc || "",
        "cover_image": coverImage,
        "content": htmlBody,
        "status": "Published"
      });
    }
  }

  console.log(`Uploading ${lessonRecords.length} academy lessons to Feishu...`);
  batchCreateRecords(tables["Academy Lessons"], lessonRecords);

  // Populate Academy Vault
  const vaultRecords = vaultItems.map(item => {
    // Map type "PDF Checklist" / "PDF Whitepaper" -> "PDF Guide"
    let type = item.type;
    if (type === "PDF Checklist" || type === "PDF Whitepaper") {
      type = "PDF Guide";
    }
    return {
      "title": item.title,
      "type": type,
      "size": "2.4 MB",
      "download_link": "/qr",
      "description": item.desc
    };
  });

  console.log(`Uploading ${vaultRecords.length} vault items to Feishu...`);
  batchCreateRecords(tables["Academy Vault"], vaultRecords);

  console.log("\nFeishu Bitable Data Sync Completed successfully!");
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
