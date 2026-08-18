import { chromium } from "@playwright/test";
import { readFileSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";

async function main() {
  const browser = await chromium.launch();
  const page = await browser.newPage();

  const logoSvg = readFileSync(resolve(import.meta.dir, "../public/logo.svg"), "utf-8");

  // 1. Generate 192x192 icon (with brand background and centered crisp emblem)
  await page.setViewportSize({ width: 192, height: 192 });
  await page.setContent(`
    <!DOCTYPE html>
    <html>
      <head>
        <style>
          * { margin: 0; padding: 0; box-sizing: border-box; }
          body {
            width: 192px;
            height: 192px;
            background: #0b1425;
            display: flex;
            align-items: center;
            justify-content: center;
            overflow: hidden;
          }
          .icon-container {
            width: 144px;
            height: 144px;
            display: flex;
            align-items: center;
            justify-content: center;
          }
          svg {
            width: 100%;
            height: 100%;
            object-fit: contain;
          }
        </style>
      </head>
      <body>
        <div class="icon-container">
          ${logoSvg}
        </div>
      </body>
    </html>
  `);
  const icon192Buffer = await page.screenshot({ type: "png" });
  writeFileSync(resolve(import.meta.dir, "../public/icons/icon-192.png"), icon192Buffer);
  console.log("✅ Generated public/icons/icon-192.png (192x192)");

  // 2. Generate 512x512 icon
  await page.setViewportSize({ width: 512, height: 512 });
  await page.setContent(`
    <!DOCTYPE html>
    <html>
      <head>
        <style>
          * { margin: 0; padding: 0; box-sizing: border-box; }
          body {
            width: 512px;
            height: 512px;
            background: #0b1425;
            display: flex;
            align-items: center;
            justify-content: center;
            overflow: hidden;
          }
          .icon-container {
            width: 384px;
            height: 384px;
            display: flex;
            align-items: center;
            justify-content: center;
          }
          svg {
            width: 100%;
            height: 100%;
            object-fit: contain;
          }
        </style>
      </head>
      <body>
        <div class="icon-container">
          ${logoSvg}
        </div>
      </body>
    </html>
  `);
  const icon512Buffer = await page.screenshot({ type: "png" });
  writeFileSync(resolve(import.meta.dir, "../public/icons/icon-512.png"), icon512Buffer);
  console.log("✅ Generated public/icons/icon-512.png (512x512)");

  // 3. Generate 512x512 Maskable Icon (safe zone is 80% inner circle/square: 320px)
  await page.setContent(`
    <!DOCTYPE html>
    <html>
      <head>
        <style>
          * { margin: 0; padding: 0; box-sizing: border-box; }
          body {
            width: 512px;
            height: 512px;
            background: #0b1425;
            display: flex;
            align-items: center;
            justify-content: center;
            overflow: hidden;
          }
          .icon-container {
            width: 300px;
            height: 300px;
            display: flex;
            align-items: center;
            justify-content: center;
          }
          svg {
            width: 100%;
            height: 100%;
            object-fit: contain;
          }
        </style>
      </head>
      <body>
        <div class="icon-container">
          ${logoSvg}
        </div>
      </body>
    </html>
  `);
  const maskableBuffer = await page.screenshot({ type: "png" });
  writeFileSync(resolve(import.meta.dir, "../public/icons/maskable-icon-512.png"), maskableBuffer);
  console.log("✅ Generated public/icons/maskable-icon-512.png (512x512 maskable)");

  // 4. Generate 180x180 Apple Touch Icon (solid dark background, perfect for iOS Home Screen)
  await page.setViewportSize({ width: 180, height: 180 });
  await page.setContent(`
    <!DOCTYPE html>
    <html>
      <head>
        <style>
          * { margin: 0; padding: 0; box-sizing: border-box; }
          body {
            width: 180px;
            height: 180px;
            background: #0b1425;
            display: flex;
            align-items: center;
            justify-content: center;
            overflow: hidden;
          }
          .icon-container {
            width: 130px;
            height: 130px;
            display: flex;
            align-items: center;
            justify-content: center;
          }
          svg {
            width: 100%;
            height: 100%;
            object-fit: contain;
          }
        </style>
      </head>
      <body>
        <div class="icon-container">
          ${logoSvg}
        </div>
      </body>
    </html>
  `);
  const appleTouchBuffer = await page.screenshot({ type: "png" });
  writeFileSync(resolve(import.meta.dir, "../public/icons/apple-touch-icon.png"), appleTouchBuffer);
  console.log("✅ Generated public/icons/apple-touch-icon.png (180x180)");

  await browser.close();
}

main().catch(console.error);
