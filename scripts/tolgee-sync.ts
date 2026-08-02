import zh from "../i18n/translations/zh";
import en from "../i18n/translations/en";
import am from "../i18n/translations/am";

const apiUrl = process.env.TOLGEE_API_URL || "https://app.tolgee.io";
const apiKey = process.env.TOLGEE_API_KEY;

async function main() {
  const action = process.argv[2] || "push";
  console.log(`[Tolgee Sync] Executing action: ${action}`);
  console.log(`Target Tolgee Server: ${apiUrl}`);

  if (!apiKey) {
    console.log("⚠️ TOLGEE_API_KEY environment variable is not set.");
    console.log("💡 Set TOLGEE_API_KEY in .env.local or environment.");
    return;
  }

  if (action === "push") {
    console.log("🚀 Syncing translations across zh, en, am to Tolgee Cloud...");
    
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

    // Prepare import form data
    const formData = new FormData();
    formData.append("files", new Blob([JSON.stringify(zh, null, 2)], { type: "application/json" }), "zh.json");
    formData.append("files", new Blob([JSON.stringify(en, null, 2)], { type: "application/json" }), "en.json");
    formData.append("files", new Blob([JSON.stringify(am, null, 2)], { type: "application/json" }), "am.json");

    const importRes = await fetch(`${apiUrl}/v2/projects/${project.id}/import`, {
      method: "POST",
      headers: { "X-API-Key": apiKey },
      body: formData
    });

    if (importRes.ok) {
      console.log("✅ Translations successfully uploaded to Tolgee Cloud!");
    } else {
      const errText = await importRes.text();
      console.log(`ℹ️ Tolgee Import status (${importRes.status}): ${errText}`);
    }
  }
}

main().catch(console.error);
