import { Stagehand } from "@browserbasehq/stagehand";
import { z } from "zod";

async function main() {
  console.log("🚀 Initializing Stagehand AI Browser Agent (v3)...");

  const stagehand = new Stagehand({
    env: "LOCAL",
    verbose: 1,
    localBrowserLaunchOptions: {
      headless: true,
    },
  });

  await stagehand.init();
  const page = stagehand.context.pages[0] || (await stagehand.context.newPage());

  console.log("🌐 Navigating to Youguard Portal login screen via Stagehand...");
  await page.goto("http://localhost:3000/portal");

  console.log("👀 Performing Stagehand AI Observation...");
  try {
    const observations = await stagehand.observe({
      instruction: "Inspect interactive login forms and buttons",
      page,
    });
    console.log("AI Observations:", observations);
  } catch (obsErr) {
    console.log("Note: AI observation requires OPENAI_API_KEY / ANTHROPIC_API_KEY env for LLM inference");
  }

  console.log("🤖 Stagehand v3 Integration Ready!");
  await stagehand.close();
  console.log("✅ Stagehand Initialization & Navigation Completed Cleanly!");
}

main().catch((err) => {
  console.error("Stagehand Error:", err);
  process.exit(1);
});
