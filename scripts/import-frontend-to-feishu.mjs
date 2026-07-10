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

function createField(tableId, fieldDefinition) {
  const definition = typeof fieldDefinition === "string"
    ? { name: fieldDefinition, type: "text" }
    : fieldDefinition;
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
    JSON.stringify(definition)
  ]);
}

// Get slug→record_id map from a table
function getSlugRecordMap(tableId) {
  const map = {};
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
      "--field-id",
      "slug",
      "--field-id",
      "content",
      "--limit",
      "200",
      "--offset",
      String(offset),
      "--format",
      "json",
    ]);
    const body = res.data || {};
    const records = body.data || [];
    const ids = body.record_id_list || [];
    for (let i = 0; i < records.length; i++) {
      const slug = Array.isArray(records[i]) ? records[i][0] : records[i]?.slug;
      const id = ids[i];
      if (slug && id) map[slug] = id;
    }
    if (!body.has_more || records.length < 200) {
      hasMore = false;
    } else {
      offset += 200;
    }
  }
  return map;
}

function upsertRecord(tableId, recordId, fields) {
  const args = [
    "base",
    "+record-upsert",
    "--as",
    "user",
    "--base-token",
    FEISHU_BASE_TOKEN,
    "--table-id",
    tableId,
    "--json",
    JSON.stringify(fields),
  ];
  if (recordId) args.push("--record-id", recordId);
  return runLarkCli(args);
}

function upsertContentRecords(tableId, records) {
  const slugMap = getSlugRecordMap(tableId);
  console.log(`  Found ${Object.keys(slugMap).length} existing records`);
  let updated = 0;
  let created = 0;

  for (const rec of records) {
    const recordId = slugMap[rec.slug];
    if (recordId) {
      upsertRecord(tableId, recordId, { content: rec.content });
      updated++;
    } else {
      upsertRecord(tableId, null, rec);
      created++;
    }
  }

  console.log(`  Updated: ${updated}, Created: ${created}`);
}

// 5. Markdown article parser
function parseMarkdownArticle(filePath) {
  const content = fs.readFileSync(filePath, "utf-8").replace(/\r/g, "");
  const lines = content.split("\n");

  const meta = { category: "", date: "", readTime: "", tag: "" };
  let title = "";
  let overview = "";
  let bodyStart = 0;
  let inOverview = false;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();

    if (line.startsWith("**Category:**")) { meta.category = line.replace("**Category:**", "").trim(); continue; }
    if (line.startsWith("**Date:**")) { meta.date = line.replace("**Date:**", "").trim(); continue; }
    if (line.startsWith("**Read Time:**")) { meta.readTime = line.replace("**Read Time:**", "").trim(); continue; }
    if (line.startsWith("**Tag:**")) { meta.tag = line.replace("**Tag:**", "").trim(); continue; }

    if (line.startsWith("# ") && !title) {
      title = line.replace("# ", "").trim();
      continue;
    }

    if (line === "## Overview" || line.startsWith("## Overview")) {
      inOverview = true;
      continue;
    }

    if (inOverview && line.startsWith("*")) {
      overview = line.replace(/^\*/, "").replace(/\*$/, "").trim();
      inOverview = false;
      bodyStart = i + 1;
      continue;
    }
    if (inOverview && line && !line.startsWith("#")) {
      overview = line;
      inOverview = false;
      bodyStart = i + 1;
    }
  }

  // Extract body content (everything after frontmatter and title/overview)
  const bodyLines = [];
  let started = false;
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    if (i >= bodyStart) {
      started = true;
    }
    if (started) {
      // Skip empty lines at the very beginning of body
      if (bodyLines.length === 0 && !line.trim()) continue;
      bodyLines.push(line);
    }
  }
  const bodyContent = bodyLines.join("\n").trim();

  if (!meta.category && !meta.date && !title) return { meta: null, title: "", overview: "", bodyContent: "" };
  return { meta, title, overview, bodyContent };
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
  "Page Title": "BYD Seagull",
  "Page Subtitle": "The Global #1 EV",
  "Hero Description": "The world's top-selling compact EV. The strongest weapon against the used ICE market — your customers save up to $250 every month.",
  "Why Section Description": "The strongest weapon against used ICE.",
  specsLeft: [
    { label: "Vehicle Class", value: "Small Sedan" },
    { label: "Range (CLTC)", value: "405 km" },
    { label: "Battery Capacity", value: "38.88 kWh" },
    { label: "Battery Type", value: "LFP Blade" },
    { label: "Motor Power", value: "70 kW (95 hp)" },
    { label: "Drive Type", value: "Front-Wheel Drive" },
    { label: "0 – 100 km/h", value: "13 sec" },
    { label: "Top Speed", value: "130 km/h" },
    { label: "DC Fast Charge", value: "~30 min (30%→80%)" },
    { label: "AC Slow Charge", value: "6 hrs (0-100%)" }
  ],
  specsRight: [
    { label: "Household Charging", value: "Yes - export charger depends on market" },
    { label: "Battery Warranty", value: "8 Yrs / 150,000 km" },
    { label: "Dimensions (L×W×H)", value: "3,780 × 1,715 × 1,540 mm" },
    { label: "Boot Volume", value: "226 L" },
    { label: "Seating Capacity", value: "5 Seats" },
    { label: "Sunroof", value: "Available (Higher Trims)" },
    { label: "Ground Clearance", value: "130 mm" },
    { label: "Airbags", value: "6 (Front + Side + Curtain)" },
    { label: "V2L Support", value: "Not Supported" }
  ],
  "Gallery Images JSON": [
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
  "Trim Data JSON": [
    { name: "Standard", range: "305 km", accel: "10.9 sec", sunroof: "✗ None", airbags: "4", seat: "Fabric", fob: "Lowest" },
    { name: "Comfort", range: "305 km", accel: "10.9 sec", sunroof: "✗ None", airbags: "6", seat: "Fabric", fob: "Low" },
    { name: "Honor", range: "405 km", accel: "13 sec", sunroof: "○ Optional", airbags: "6", seat: "Leatherette", fob: "Mid ★", rec: true },
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
    "Page Subtitle", "Hero Description",
    "Why Section Description",
    "Gallery Images JSON",
    "Trim Data JSON", "Guide Price Display", "Guide Price Min USD", "Guide Price Max USD",
    "Model Year Text", "Model Year", "Battery Capacity Text", "Battery Capacity Min kWh", "Battery Capacity Max kWh",
    { name: "Battery Chemistry", type: "select", multiple: false, description: "Normalized battery chemistry for filtering, statistics, and Hero Metric 3. Use Battery Technology for Blade/Magazine branding.", options: [{ name: "LFP" }, { name: "NCM" }, { name: "NMC" }, { name: "NCM / LFP" }] },
    { name: "Battery Technology", type: "select", multiple: false, description: "Battery technology or structural battery family such as Blade, 2nd Gen Blade, Magazine, or Aegis Short Blade. Leave blank when the source only identifies a supplier product line or when not verified.", options: [{ name: "Blade" }, { name: "2nd Gen Blade" }, { name: "Magazine" }, { name: "Aegis Short Blade" }] },
    "CLTC Range Text", "CLTC Range Min KM", "CLTC Range Max KM", "Motor Power Text", "Motor Power Min KW", "Motor Power Max KW",
    { name: "AC Slow Charge Supported", type: "checkbox" },
    { name: "AC Slow Charge Full Time Hours", type: "number", style: { type: "plain", precision: 2, percentage: false, thousands_separator: false } },
    { name: "0 - 100 km/h (sec)", type: "number", style: { type: "plain", precision: 2, percentage: false, thousands_separator: false } },
    "Top Speed Text", "Top Speed Min KMH", "Top Speed Max KMH", "Battery Warranty Text", "Battery Warranty Years", "Battery Warranty Distance KM",
    "Dimensions Text", "Dimensions LxWxH Text", "Length MM", "Width MM", "Height MM", "Wheelbase Text", "Wheelbase MM",
    "Seating Text", "Seating Capacity Text", "Seats Min", "Seats Max",
    { name: "Sunroof Availability", type: "select", multiple: false, description: "Normalized model-level sunroof availability. Use Standard when broadly standard, Optional when offered as an option, By Trim when availability varies by trim, Not Available when verified unavailable, and leave blank when not verified.", options: [{ name: "Standard" }, { name: "Optional" }, { name: "By Trim" }, { name: "Not Available" }] },
    { name: "Airbags", type: "number", description: "Verified airbag count for the catalog model or representative export trim. Store numeric count only; leave blank when exact count is not verified.", style: { type: "plain", precision: 0, percentage: false, thousands_separator: false } },
    { name: "V2L Availability", type: "select", multiple: false, description: "Normalized model-level V2L / vehicle-to-load availability. Use Standard when broadly standard, Optional when offered as an option, By Trim when availability varies by trim, Market Dependent when export/market equipment varies, Not Supported when verified unavailable, and leave blank when not verified.", options: [{ name: "Standard" }, { name: "Optional" }, { name: "By Trim" }, { name: "Market Dependent" }, { name: "Not Supported" }] },
    { name: "V2L Output Power (kW)", type: "number", description: "Verified V2L / vehicle-to-load output power in kilowatts. Store numeric kW only; leave blank when the exact output is not verified.", style: { type: "plain", precision: 1, percentage: false, thousands_separator: false } },
    { name: "Steering Setup", type: "select", multiple: false, description: "Normalized steering configuration for catalog filtering. Store option only; frontend displays the long label.", options: [{ name: "LHD" }, { name: "RHD" }, { name: "LHD / RHD" }] },
    { name: "Voltage Platform (V)", type: "number", description: "Nominal high-voltage platform in volts. Store numeric volts only, for example 400, 800, 900, or 1000.", style: { type: "plain", precision: 0, percentage: false, thousands_separator: false } },
    { name: "Powertrain Type", type: "select", multiple: false, description: "Normalized powertrain type for filtering and frontend tags.", options: [{ name: "BEV" }, { name: "PHEV" }, { name: "EREV" }, { name: "HEV" }] },
    { name: "Household Charging", type: "checkbox", description: "Whether household charging is supported. If checked, frontend displays Yes - export charger depends on market; unchecked is hidden." },
    "Product Path"
  ];
  for (const fieldDefinition of requiredFields) {
    const fieldName = typeof fieldDefinition === "string" ? fieldDefinition : fieldDefinition.name;
    if (!existingFieldNames.has(fieldName)) {
      console.log(`Adding missing field ${fieldName} to Vehicle Models table...`);
      createField(tables["Vehicle Models"], fieldDefinition);
    }
  }

  // -- SKIP VEHICLE POPULATION: vehicles managed directly in Feishu --
  console.log("Skipping vehicle sync (managed in Feishu)");

  // -- UPSERT ARTICLES FROM EXAMPLE/MARKDOWN --
  console.log("Processing articles from example/insights/...");
  const articleRecords = [];
  const insightsDir = path.resolve(process.cwd(), "example/insights");
  const catDirMap = {
    "market-analysis": "Market Analysis",
    "policy-tariffs": "Policy & Tariffs",
    "sourcing-intelligence": "Sourcing Intelligence",
    "operator-hub": "Operator Hub",
    "product-watch": "Product Watch",
    "pricing-trade": "Pricing & Trade",
  };

  if (fs.existsSync(insightsDir)) {
    for (const catDirName of fs.readdirSync(insightsDir, { withFileTypes: true })) {
      if (!catDirName.isDirectory() || !catDirMap[catDirName.name]) continue;
      const catDir = path.join(insightsDir, catDirName.name);
      for (const slugDir of fs.readdirSync(catDir, { withFileTypes: true })) {
        if (!slugDir.isDirectory()) continue;
        const mdPath = path.join(catDir, slugDir.name, "article.md");
        if (!fs.existsSync(mdPath)) continue;
        const { meta, title, overview, bodyContent } = parseMarkdownArticle(mdPath);
        if (!meta || !title) continue;

        // Find cover image in directory
        const imgDir = path.join(catDir, slugDir.name);
        const imgFiles = fs.readdirSync(imgDir).filter(f => /\.(jpg|png|webp|jpeg)$/i.test(f));
        const coverImage = imgFiles[0] || "hero.jpg";
        const coverImageUrl = `/insights/images/${slugDir.name}/${coverImage}`;

        articleRecords.push({
          "slug": slugDir.name,
          "title": title,
          "category": catDirMap[catDirName.name],
          "overview": overview || "",
          "cover_image": coverImageUrl,
          "publish_date": meta.date || "",
          "read_time": meta.readTime || "",
          "content": bodyContent,
          "status": "Published",
        });
      }
    }
  }

  console.log(`Upserting ${articleRecords.length} articles to Feishu...`);
  upsertContentRecords(tables["Articles"], articleRecords);

  // -- POPULATE ACADEMY FROM EXAMPLE/MARKDOWN --
  console.log("Processing academy lessons from example/academy/...");
  const lessonRecords = [];
  const academyDir = path.resolve(process.cwd(), "example/academy");
  const academyCatMap = {
    "ev-fundamentals": "fundamentals",
    "dealer-playbook": "playbook",
    "technical-workshop": "workshop",
  };

  if (fs.existsSync(academyDir)) {
    for (const catDirName of fs.readdirSync(academyDir, { withFileTypes: true })) {
      if (!catDirName.isDirectory() || !academyCatMap[catDirName.name]) continue;
      const catDir = path.join(academyDir, catDirName.name);
      for (const slugDir of fs.readdirSync(catDir, { withFileTypes: true })) {
        if (!slugDir.isDirectory()) continue;
        const mdPath = path.join(catDir, slugDir.name, "article.md");
        if (!fs.existsSync(mdPath)) continue;
        const { meta, title, overview, bodyContent } = parseMarkdownArticle(mdPath);
        if (!meta || !title) continue;

        const imgDir = path.join(catDir, slugDir.name);
        const imgFiles = fs.readdirSync(imgDir).filter(f => /\.(jpg|png|webp|jpeg)$/i.test(f));
        const coverImage = imgFiles[0] || "";

        lessonRecords.push({
          "slug": slugDir.name,
          "title": title,
          "category": academyCatMap[catDirName.name],
          "tag": meta.tag || "",
          "description": overview || "",
          "cover_image": coverImage,
          "content": bodyContent,
          "status": "Published",
        });
      }
    }
  }

  console.log(`Upserting ${lessonRecords.length} academy lessons to Feishu...`);
  upsertContentRecords(tables["Academy Lessons"], lessonRecords);

  // -- SKIP VAULT: static items already in Feishu --
  console.log("Skipping academy vault sync (static)");

  console.log("\nFeishu Bitable Data Sync Completed successfully!");
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
