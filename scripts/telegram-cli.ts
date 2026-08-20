#!/usr/bin/env bun
/**
 * Telegram CLI & Diagnostic Tool for Youguard Portal
 *
 * Usage:
 *   bun run scripts/telegram-cli.ts info
 *   bun run scripts/telegram-cli.ts send --chat-id=<CHAT_ID> --message="Hello"
 *   bun run scripts/telegram-cli.ts notify --chat-id=<CHAT_ID> --inquiry-no="INQ-2026-001" --vehicle="BYD Seal 06 DM-i" --message="FOB Shanghai price is $16,800"
 */

const DEFAULT_BOT_TOKEN = "8527474898:AAGXxoBBo4yLZyMR-jXNa2KHz7HROXv51RE";
const BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN || DEFAULT_BOT_TOKEN;
const API_BASE = `https://api.telegram.org/bot${BOT_TOKEN}`;

function parseArgs() {
  const args = process.argv.slice(2);
  const command = args[0] || "help";
  const params: Record<string, string> = {};

  for (let i = 1; i < args.length; i++) {
    const arg = args[i];
    if (arg.startsWith("--")) {
      const eqIdx = arg.indexOf("=");
      if (eqIdx !== -1) {
        const key = arg.slice(2, eqIdx);
        const val = arg.slice(eqIdx + 1);
        params[key] = val;
      } else {
        const key = arg.slice(2);
        const next = args[i + 1];
        if (next && !next.startsWith("--")) {
          params[key] = next;
          i++;
        } else {
          params[key] = "true";
        }
      }
    }
  }

  return { command, params };
}

async function getMe() {
  console.log("🔍 Checking Telegram Bot Token status...\n");
  try {
    const res = await fetch(`${API_BASE}/getMe`);
    const data = (await res.json()) as any;
    if (data.ok) {
      console.log("✅ Bot Token is VALID!");
      console.log(`   - Bot ID:       ${data.result.id}`);
      console.log(`   - Bot Name:     ${data.result.first_name}`);
      console.log(`   - Username:     @${data.result.username}`);
      console.log(`   - Direct Link:  https://t.me/${data.result.username}`);
    } else {
      console.error("❌ Telegram API returned error:", data.description || data);
    }
  } catch (err) {
    console.error("❌ Network error connecting to Telegram API:", err);
  }
}

async function getWebhookInfo() {
  try {
    const res = await fetch(`${API_BASE}/getWebhookInfo`);
    const data = (await res.json()) as any;
    if (data.ok) {
      console.log("\n📡 Webhook Info:");
      console.log(`   - URL:          ${data.result.url || "(None / Polling mode)"}`);
      console.log(`   - Custom Cert:  ${data.result.has_custom_certificate}`);
      console.log(`   - Pending:      ${data.result.pending_update_count} updates`);
      if (data.result.last_error_message) {
        console.log(`   - Last Error:   ${data.result.last_error_message}`);
      }
    }
  } catch (err) {
    console.error("❌ Failed to fetch webhook info:", err);
  }
}

async function sendMessage(chatId: string, text: string, buttonUrl?: string) {
  if (!chatId) {
    console.error("❌ Error: --chat-id is required.");
    process.exit(1);
  }

  console.log(`📤 Sending Telegram message to Chat ID: ${chatId}...`);
  const payload: Record<string, any> = {
    chat_id: chatId,
    text,
    parse_mode: "Markdown",
  };

  if (buttonUrl) {
    payload.reply_markup = {
      inline_keyboard: [
        [
          {
            text: "🔘 Open in Youguard Portal",
            url: buttonUrl,
          },
        ],
      ],
    };
  }

  try {
    const res = await fetch(`${API_BASE}/sendMessage`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    const data = (await res.json()) as any;
    if (data.ok) {
      console.log("✅ Message sent successfully!");
      console.log(`   - Message ID: ${data.result.message_id}`);
      console.log(`   - Date:       ${new Date(data.result.date * 1000).toLocaleString()}`);
    } else {
      console.error("❌ Telegram API error:", data.description || data);
    }
  } catch (err) {
    console.error("❌ Network error:", err);
  }
}

async function sendInquiryNotification(params: {
  chatId: string;
  inquiryNo: string;
  vehicleModel?: string;
  authorName?: string;
  authorRole?: string;
  noteBody?: string;
}) {
  const {
    chatId,
    inquiryNo = "INQ-DEMO-001",
    vehicleModel = "BYD Seal 06 DM-i",
    authorName = "Sarah Sales",
    authorRole = "Sales Specialist",
    noteBody = "FOB Shanghai price is USD 16,800. Fast dispatch in 7 days.",
  } = params;

  if (!chatId) {
    console.error("❌ Error: --chat-id is required.");
    process.exit(1);
  }

  const text = [
    `🚗 *Youguard Auto · Inquiry Message*`,
    ``,
    `*Inquiry*: \`#${inquiryNo}\``,
    `*Vehicle*: *${vehicleModel}*`,
    `*From*: ${authorName} (${authorRole})`,
    ``,
    `💬 _"${noteBody}"_`,
    ``,
    `👉 Tap the button below to view and reply directly on your Portal:`,
  ].join("\n");

  const portalUrl = `https://youguard.net/portal?inquiry=${encodeURIComponent(inquiryNo)}&src=tg`;

  await sendMessage(chatId, text, portalUrl);
}

function showHelp() {
  console.log(`
🤖 Youguard Telegram CLI & Diagnostic Tool
===========================================

Available Commands:

1. Check Bot Status & Webhook:
   bun run scripts/telegram-cli.ts info

2. Send a direct test message:
   bun run scripts/telegram-cli.ts send --chat-id=<CHAT_ID> --message="Hello from Youguard Auto!"

3. Simulate a realistic Inquiry reply notification (with Portal jump button):
   bun run scripts/telegram-cli.ts notify --chat-id=<CHAT_ID> \\
     --inquiry-no="INQ-2026-001" \\
     --vehicle="BYD Seal 06 DM-i" \\
     --from="Sarah Sales" \\
     --message="The FOB Shanghai quotation has been prepared."
`);
}

async function main() {
  const { command, params } = parseArgs();

  switch (command) {
    case "info":
    case "get-me":
      await getMe();
      await getWebhookInfo();
      break;

    case "send":
      await sendMessage(
        params["chat-id"] || params.chatId || params.chat,
        params.message || params.text || "Hello from Youguard Auto CLI!",
        params.url || params.buttonUrl
      );
      break;

    case "notify":
    case "simulate-reply":
      await sendInquiryNotification({
        chatId: params["chat-id"] || params.chatId || params.chat,
        inquiryNo: params["inquiry-no"] || params.inquiryNo || "INQ-2026-001",
        vehicleModel: params.vehicle || params.vehicleModel,
        authorName: params.from || params.authorName,
        authorRole: params.role || params.authorRole,
        noteBody: params.message || params.noteBody,
      });
      break;

    case "help":
    default:
      showHelp();
      break;
  }
}

main().catch(console.error);
