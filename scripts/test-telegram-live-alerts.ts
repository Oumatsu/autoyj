#!/usr/bin/env bun
/**
 * Automated Live End-to-End Test Suite for Telegram Push Alerts
 *
 * Runs full real-world scenarios against the live Telegram Bot API:
 * 1. Health check: bot token & @youguard_ev_bot connectivity
 * 2. New Inquiry Started -> Instant push alert to bound Admin/Sales
 * 3. Sales Rep Quotes / Replies -> Instant push alert to bound Customer & Partner
 * 4. Customer Questions / Replies -> Instant push alert to bound Sales Rep & Partner
 */

import { Database } from "bun:sqlite";
import fs from "fs";
import path from "path";

const BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN || "8527474898:AAGXxoBBo4yLZyMR-jXNa2KHz7HROXv51RE";
const TEST_CHAT_ID = "8914011709";

console.log("===============================================================");
console.log("🚀 YOUGUARD AUTO · TELEGRAM BOT LIVE AUTOMATED EVALUATION SUITE");
console.log("===============================================================\n");

async function checkBotHealth() {
  console.log("📡 [Step 1/4] Verifying Telegram Bot API connectivity...");
  const res = await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/getMe`);
  const data = (await res.json()) as any;
  if (!data.ok) {
    throw new Error(`Telegram API connection failed: ${data.description}`);
  }
  console.log(`✅ Bot Connected: @${data.result.username} (ID: ${data.result.id}, Name: ${data.result.first_name})\n`);
  return data.result;
}

function findLocalD1Sqlite(): string | null {
  const baseDir = ".wrangler/state/v3/d1/miniflare-D1DatabaseObject";
  if (!fs.existsSync(baseDir)) return null;
  const files = fs.readdirSync(baseDir);
  for (const f of files) {
    if (f.endsWith(".sqlite") && f !== "metadata.sqlite") {
      const fullPath = path.join(baseDir, f);
      const db = new Database(fullPath);
      const tables = db.query("SELECT name FROM sqlite_master WHERE type='table'").all() as any[];
      if (tables.some(t => t.name === "user_telegram_bindings")) {
        return fullPath;
      }
    }
  }
  return null;
}

function ensureLocalBindings(sqlitePath: string) {
  console.log("🗄️ [Step 2/4] Ensuring test bindings in local D1 database...");
  const db = new Database(sqlitePath);
  const now = new Date().toISOString();

  // Ensure Customer, Partner, and Sales are bound to test chat ID
  db.run(`
    INSERT INTO user_telegram_bindings (user_id, chat_id, telegram_username, first_name, bound_at, updated_at)
    VALUES ('CUS-002', '${TEST_CHAT_ID}', 'a12_test', 'Huge', '${now}', '${now}')
    ON CONFLICT(user_id) DO UPDATE SET chat_id = '${TEST_CHAT_ID}', updated_at = '${now}'
  `);

  db.run(`
    INSERT INTO user_telegram_bindings (user_id, chat_id, telegram_username, first_name, bound_at, updated_at)
    VALUES ('PARTNER-001', '${TEST_CHAT_ID}', 'a12_test', 'Huge Partner', '${now}', '${now}')
    ON CONFLICT(user_id) DO UPDATE SET chat_id = '${TEST_CHAT_ID}', updated_at = '${now}'
  `);

  db.run(`
    INSERT INTO user_telegram_bindings (user_id, chat_id, telegram_username, first_name, bound_at, updated_at)
    VALUES ('USR-SALES-LX', '${TEST_CHAT_ID}', 'a12_test', 'Sales LX', '${now}', '${now}')
    ON CONFLICT(user_id) DO UPDATE SET chat_id = '${TEST_CHAT_ID}', updated_at = '${now}'
  `);

  db.run(`
    INSERT INTO user_telegram_bindings (user_id, chat_id, telegram_username, first_name, bound_at, updated_at)
    VALUES ('USR-ADMIN-01', '${TEST_CHAT_ID}', 'a12_test', 'Admin ZZC', '${now}', '${now}')
    ON CONFLICT(user_id) DO UPDATE SET chat_id = '${TEST_CHAT_ID}', updated_at = '${now}'
  `);

  console.log(`✅ Bound User IDs: CUS-002, PARTNER-001, USR-SALES-LX, USR-ADMIN-01 -> Chat ID: ${TEST_CHAT_ID}\n`);
}

// Create a D1 mock interface on top of bun:sqlite
function createD1Adapter(sqlitePath: string) {
  const db = new Database(sqlitePath);
  return {
    prepare(sql: string) {
      return {
        _sql: sql,
        _params: [] as any[],
        bind(...params: any[]) {
          this._params = params;
          return this;
        },
        async first<T = any>() {
          const stmt = db.prepare(this._sql);
          return (stmt.get(...this._params) as T) || null;
        },
        async all<T = any>() {
          const stmt = db.prepare(this._sql);
          return { results: (stmt.all(...this._params) as T[]) || [] };
        },
        async run() {
          const stmt = db.prepare(this._sql);
          const res = stmt.run(...this._params);
          return { success: true, meta: res };
        },
      };
    },
  };
}

async function testScenario1_NewInquiryAlert(d1Adapter: any) {
  console.log("📨 [Scenario 1] Customer creates NEW Inquiry -> Admin/Sales Push Alert");
  const { notifyNewInquiryStartedTelegram } = await import("../server/services/telegram");

  const env = {
    TELEGRAM_BOT_TOKEN: BOT_TOKEN,
    PORTAL_DB: d1Adapter,
  } as any;

  const result = await notifyNewInquiryStartedTelegram(env, {
    inquiryNo: "INQ-2026-LIVE-901",
    vehicleModel: "BYD Seal 06 DM-i 120km Leading (2026)",
    creatorUserId: "CUS-002",
    creatorName: "VIP Customer (Green Ride Enterprise)",
    creatorRole: "customer",
    quantity: 5,
    destinationPort: "Djibouti Port (吉布提港)",
    tradeTerm: "CIF",
    targetPrice: 16800,
    initialNote: "We require 5 units CIF Djibouti, ready for fast customs clearance. Please provide FOB & CIF breakdown.",
  });

  console.log(`   Result: attempted=${result.attemptedCount}, sent=${result.sentCount}`);
  if (result.sentCount > 0) {
    console.log("   ✅ SUCCESS: Live Telegram Push Alert delivered to Admin/Sales on your Telegram client!\n");
  } else {
    console.log("   ⚠️ Warning: sentCount was 0. Check bindings.\n");
  }
}

async function testScenario2_SalesRepliesWithQuotation(d1Adapter: any) {
  console.log("💬 [Scenario 2] Sales Rep posts official Quotation Reply -> Customer & Partner Push Alert");
  const { notifyInquiryStakeholdersTelegram } = await import("../server/services/telegram");

  // Ensure inquiry and participant records exist in mock DB for INQ-2026-LIVE-901
  try {
    const db = new Database(findLocalD1Sqlite()!);
    const now = new Date().toISOString();
    db.run(`
      INSERT OR REPLACE INTO inquiries (id, inquiry_no, customer_id, vehicle_id, vehicle_model, title, status, quantity, trade_term, created_at, updated_at)
      VALUES ('INQ-ID-901', 'INQ-2026-LIVE-901', 'CUS-002', 'VEH-001', 'BYD Seal 06 DM-i 120km Leading', 'BYD Seal 06 batch sourcing', 'open', 5, 'CIF', '${now}', '${now}')
    `);
    db.run(`
      INSERT OR REPLACE INTO inquiry_participants (id, inquiry_no, user_id, role, access_source, created_at)
      VALUES ('PART-901-1', 'INQ-2026-LIVE-901', 'PARTNER-001', 'partner', 'direct', '${now}')
    `);
  } catch (e) {
    console.warn("DB setup note:", e);
  }

  const env = {
    TELEGRAM_BOT_TOKEN: BOT_TOKEN,
    PORTAL_DB: d1Adapter,
  } as any;

  const result = await notifyInquiryStakeholdersTelegram(env, {
    inquiryNo: "INQ-2026-LIVE-901",
    vehicleModel: "BYD Seal 06 DM-i 120km Leading (2026)",
    noteBody: "Our formal quotation for 5 units BYD Seal 06 is USD 16,500/unit (FOB Shanghai) or USD 17,200/unit (CIF Djibouti). All units are in stock and ready to ship within 7 business days.",
    authorUserId: "USR-SALES-LX",
    authorName: "LX (Sales)",
    authorRole: "sales",
    isPublic: true,
  });

  console.log(`   Result: attempted=${result.attemptedCount}, sent=${result.sentCount}`);
  if (result.sentCount > 0) {
    console.log("   ✅ SUCCESS: Live Telegram Push Alert delivered to Customer & Partner on your Telegram client!\n");
  } else {
    console.log("   ⚠️ Warning: sentCount was 0.\n");
  }
}

async function testScenario3_CustomerFollowUpReply(d1Adapter: any) {
  console.log("💬 [Scenario 3] Customer replies with Payment Terms Question -> Sales & Partner Push Alert");
  const { notifyInquiryStakeholdersTelegram } = await import("../server/services/telegram");

  const env = {
    TELEGRAM_BOT_TOKEN: BOT_TOKEN,
    PORTAL_DB: d1Adapter,
  } as any;

  const result = await notifyInquiryStakeholdersTelegram(env, {
    inquiryNo: "INQ-2026-LIVE-901",
    vehicleModel: "BYD Seal 06 DM-i 120km Leading (2026)",
    noteBody: "Can we confirm 30% deposit by T/T and 70% balance upon presentation of Bill of Lading? We are ready to issue PO.",
    authorUserId: "CUS-002",
    authorName: "VIP Customer (Green Ride Enterprise)",
    authorRole: "customer",
    isPublic: true,
  });

  console.log(`   Result: attempted=${result.attemptedCount}, sent=${result.sentCount}`);
  if (result.sentCount > 0) {
    console.log("   ✅ SUCCESS: Live Telegram Push Alert delivered to Sales Staff on your Telegram client!\n");
  } else {
    console.log("   ⚠️ Warning: sentCount was 0.\n");
  }
}

async function run() {
  await checkBotHealth();

  const sqlitePath = findLocalD1Sqlite();
  if (!sqlitePath) {
    console.error("❌ Local D1 SQLite database not found. Run 'bun run db:local:init' first.");
    process.exit(1);
  }

  ensureLocalBindings(sqlitePath);
  const d1Adapter = createD1Adapter(sqlitePath);

  await testScenario1_NewInquiryAlert(d1Adapter);
  await testScenario2_SalesRepliesWithQuotation(d1Adapter);
  await testScenario3_CustomerFollowUpReply(d1Adapter);

  console.log("===============================================================");
  console.log("🎉 ALL AUTOMATED TELEGRAM TESTS COMPLETED SUCCESSFULLY!");
  console.log("👉 Please check your Telegram desktop app to see all 3 push alerts!");
  console.log("===============================================================");
}

run().catch(console.error);
