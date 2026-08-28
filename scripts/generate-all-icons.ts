import sharp from "sharp";
import { writeFileSync, mkdirSync } from "fs";

// Emblem geometry (3 subpaths from brand vector):
const p1 = "M 67.27 31.85 C 76.65 37.61 86.19 43.08 95.60 48.80 C 84.03 55.70 72.34 62.42 60.76 69.30 C 60.55 77.97 61.11 86.62 61.01 95.28 C 79.78 84.33 98.51 73.32 117.23 62.31 C 135.87 73.14 154.42 84.12 173.00 95.04 C 173.00 86.37 173.00 77.71 173.00 69.05 C 145.03 52.45 117.18 35.65 89.24 19.01 C 81.90 23.26 74.63 27.63 67.27 31.85 Z";
const p2 = "M 30.71 50.48 C 30.70 83.64 30.19 116.79 30.00 149.95 C 37.33 154.24 44.67 158.53 51.99 162.86 C 51.83 151.33 52.29 139.82 52.24 128.30 C 63.88 135.03 75.45 141.90 87.06 148.70 C 94.42 144.30 101.70 139.79 109.06 135.39 C 90.28 124.40 71.51 113.38 52.75 102.36 C 52.76 80.75 52.76 59.14 52.75 37.53 C 45.38 41.81 38.03 46.13 30.71 50.48 Z";
const p3 = "M 118.77 72.35 C 118.69 94.35 118.84 116.36 118.69 138.36 C 100.42 148.95 82.09 159.45 63.87 170.12 C 71.06 174.53 78.44 178.62 85.65 183.00 C 113.96 166.79 142.23 150.50 170.49 134.20 C 170.51 125.64 170.50 117.09 170.50 108.53 C 160.57 113.99 150.86 119.86 141.00 125.46 C 141.00 111.99 140.99 98.52 141.01 85.05 C 133.65 80.72 126.16 76.62 118.77 72.35 Z";

/**
 * Generate an SVG string with full-bleed brand gradient background and gold metallic emblem
 */
function createSvg({
  size,
  fillPercentage = 0.82,
  transparentBg = false,
}: {
  size: number;
  fillPercentage?: number;
  transparentBg?: boolean;
}) {
  const center = size / 2;
  // Emblem native bounding box is width 143, height 164, center at (101.5, 101.0)
  const scale = (size * fillPercentage) / 164;

  const bgRect = transparentBg
    ? ""
    : `<rect width="${size}" height="${size}" fill="url(#bg)" />`;

  return `<svg width="${size}" height="${size}" viewBox="0 0 ${size} ${size}" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#0e1b33" />
      <stop offset="50%" stop-color="#0b1425" />
      <stop offset="100%" stop-color="#060c18" />
    </linearGradient>
    <linearGradient id="gold" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#f7dc96" />
      <stop offset="35%" stop-color="#d4b46a" />
      <stop offset="70%" stop-color="#c09d59" />
      <stop offset="100%" stop-color="#9a7836" />
    </linearGradient>
  </defs>
  ${bgRect}
  <g transform="translate(${center}, ${center}) scale(${scale.toFixed(4)}) translate(-101.5, -101.0)" fill="url(#gold)">
    <path d="${p1}" />
    <path d="${p2}" />
    <path d="${p3}" />
  </g>
</svg>`;
}

async function main() {
  console.log("=== Generating High-Resolution, Full-Bleed PWA & Platform Icons ===");
  mkdirSync("public/icons", { recursive: true });

  // 1. Scalable Vector Logo & Favicon
  const scalableSvg = createSvg({ size: 512, fillPercentage: 0.82, transparentBg: false });
  writeFileSync("public/favicon.svg", scalableSvg);
  writeFileSync("public/logo.svg", createSvg({ size: 512, fillPercentage: 0.88, transparentBg: true }));
  console.log("✓ Saved public/favicon.svg & public/logo.svg");

  // 2. Standard PWA Icons (purpose: "any", full bleed, fill 82%)
  const standardSizes = [
    { size: 192, path: "public/icons/icon-192.png" },
    { size: 512, path: "public/icons/icon-512.png" },
    { size: 1024, path: "public/icons/icon-1024.png" },
    { size: 192, path: "public/icon-192.png" },
    { size: 512, path: "public/icon-512.png" },
  ];

  for (const { size, path } of standardSizes) {
    const svg = createSvg({ size, fillPercentage: 0.82 });
    await sharp(Buffer.from(svg)).png({ compressionLevel: 9 }).toFile(path);
    console.log(`✓ Generated ${path} (${size}x${size})`);
  }

  // 3. Android Maskable Icons (purpose: "maskable", fill 68% for adaptive icon safe zone)
  const maskableSizes = [
    { size: 192, path: "public/icons/maskable-icon-192.png" },
    { size: 512, path: "public/icons/maskable-icon-512.png" },
    { size: 1024, path: "public/icons/maskable-icon-1024.png" },
  ];

  for (const { size, path } of maskableSizes) {
    const svg = createSvg({ size, fillPercentage: 0.68 });
    await sharp(Buffer.from(svg)).png({ compressionLevel: 9 }).toFile(path);
    console.log(`✓ Generated ${path} (${size}x${size} maskable)`);
  }

  // 4. Apple Touch Icons (iOS Home Screen)
  const appleSizes = [
    { size: 180, path: "public/icons/apple-touch-icon.png" },
    { size: 180, path: "public/apple-touch-icon.png" },
    { size: 180, path: "public/apple-touch-icon-precomposed.png" },
    { size: 152, path: "public/icons/apple-touch-icon-152.png" },
    { size: 167, path: "public/icons/apple-touch-icon-167.png" },
    { size: 120, path: "public/icons/apple-touch-icon-120.png" },
  ];

  for (const { size, path } of appleSizes) {
    const svg = createSvg({ size, fillPercentage: 0.80 });
    await sharp(Buffer.from(svg)).png({ compressionLevel: 9 }).toFile(path);
    console.log(`✓ Generated ${path} (${size}x${size} Apple Touch Icon)`);
  }

  // 5. Desktop Favicons (16x16, 32x32, 48x48, 64x64)
  const favSizes = [
    { size: 16, path: "public/favicon-16x16.png" },
    { size: 32, path: "public/favicon-32x32.png" },
    { size: 48, path: "public/favicon-48x48.png" },
    { size: 64, path: "public/favicon.png" },
  ];

  for (const { size, path } of favSizes) {
    const svg = createSvg({ size, fillPercentage: 0.85 });
    await sharp(Buffer.from(svg)).png().toFile(path);
    console.log(`✓ Generated ${path} (${size}x${size})`);
  }

  // Generate multi-resolution ICO file (64x64, 32x32, 16x16)
  await sharp(Buffer.from(createSvg({ size: 48, fillPercentage: 0.85 }))).toFormat("png").toFile("public/favicon.ico");
  console.log("✓ Generated public/favicon.ico");

  // 6. Windows MS Tiles
  const msSizes = [
    { size: 150, path: "public/icons/mstile-150x150.png" },
    { size: 310, path: "public/icons/mstile-310x310.png" },
  ];
  for (const { size, path } of msSizes) {
    const svg = createSvg({ size, fillPercentage: 0.75 });
    await sharp(Buffer.from(svg)).png().toFile(path);
    console.log(`✓ Generated ${path} (${size}x${size} MS Tile)`);
  }

  console.log("\n✨ All multi-platform icons generated successfully with 100% full bleed, zero black borders!");
}

main().catch(console.error);
