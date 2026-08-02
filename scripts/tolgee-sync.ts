import zh from "../i18n/translations/zh";
import en from "../i18n/translations/en";
import am from "../i18n/translations/am";

const apiUrl = process.env.TOLGEE_API_URL || "https://app.tolgee.io";
const apiKey = process.env.TOLGEE_API_KEY;

// Select core UI modules to fit within Tolgee Cloud Free tier limit (500 keys limit)
const coreModules = [
  "nav", "home", "footer", "common", "sectionTabs", "qr", "contact", 
  "specs", "privacy", "terms", "products", "solutions"
];

function filterObj(obj: Record<string, any>) {
  const filtered: Record<string, any> = {};
  for (const m of coreModules) {
    if (obj[m]) filtered[m] = obj[m];
  }
  return filtered;
}

async function main() {
  const action = process.argv[2] || "push";
  console.log(`[Tolgee Sync] Executing action: ${action}`);
  console.log(`Target Tolgee Server: ${apiUrl}`);

  if (!apiKey) {
    console.log("⚠️ TOLGEE_API_KEY environment variable is not set.");
    console.log("💡 Set TOLGEE_API_KEY in .env.local or .dev.vars.");
    return;
  }

  // Fetch project details
  const projectsRes = await fetch(`${apiUrl}/v2/projects`, {
    headers: { "X-API-Key": apiKey }
  });
  
  if (!projectsRes.ok) {
    console.error("❌ Failed to authenticate with Tolgee API. Check your TOLGEE_API_KEY.");
    return;
  }

  const projectsData = (await projectsRes.json()) as any;
  const project = projectsData._embedded?.projects?.[0];
  if (!project) {
    console.error("❌ No Tolgee projects found for this API Key.");
    return;
  }

  console.log(`✓ Connected to Tolgee Project: ${project.name} (ID: ${project.id})`);

  if (action === "push") {
    console.log("🚀 Syncing core UI translations across zh, en, am to Tolgee Cloud...");

    // Clean previous pending imports
    await fetch(`${apiUrl}/v2/projects/${project.id}/import`, {
      method: "DELETE",
      headers: { "X-API-Key": apiKey }
    });

    // Fetch existing project languages
    const langRes = await fetch(`${apiUrl}/v2/projects/${project.id}/languages`, {
      headers: { "X-API-Key": apiKey }
    });
    const langs = ((await langRes.json()) as any)._embedded?.languages || [];
    const langMap: Record<string, number> = {};
    langs.forEach((l: any) => (langMap[l.tag] = l.id));

    // Upload filtered core files
    const zhCore = filterObj(zh);
    const enCore = filterObj(en);
    const amCore = filterObj(am);

    const formData = new FormData();
    formData.append("files", new Blob([JSON.stringify(zhCore, null, 2)], { type: "application/json" }), "zh.json");
    formData.append("files", new Blob([JSON.stringify(enCore, null, 2)], { type: "application/json" }), "en.json");
    formData.append("files", new Blob([JSON.stringify(amCore, null, 2)], { type: "application/json" }), "am.json");

    const importRes = await fetch(`${apiUrl}/v2/projects/${project.id}/import`, {
      method: "POST",
      headers: { "X-API-Key": apiKey },
      body: formData
    });

    if (!importRes.ok) {
      console.error(`❌ Upload failed: ${await importRes.text()}`);
      return;
    }

    const importData = (await importRes.json()) as any;
    const impLangs = importData.result?._embedded?.languages || [];

    // Pair uploaded languages with existing project languages
    for (const impLang of impLangs) {
      const tag = impLang.importFileName.replace(".json", "");
      const existingId = langMap[tag];
      if (existingId) {
        await fetch(`${apiUrl}/v2/projects/${project.id}/import/result/languages/${impLang.id}/select-existing/${existingId}`, {
          method: "PUT",
          headers: { "X-API-Key": apiKey }
        });
      }
    }

    // Apply import with OVERRIDE
    const applyRes = await fetch(`${apiUrl}/v2/projects/${project.id}/import/apply?forceMode=OVERRIDE`, {
      method: "PUT",
      headers: { "X-API-Key": apiKey }
    });

    if (applyRes.ok) {
      console.log("✅ Core UI Translations successfully applied to Tolgee Cloud!");
    } else {
      console.error(`❌ Tolgee Apply error: ${await applyRes.text()}`);
    }
  }
}

main().catch(console.error);

