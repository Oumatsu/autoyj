import sharp from "sharp";
import { promises as fs } from "fs";

const INPUTS = [
  "utility-pro/Hi4-T/3cut.jpg",
  "utility-pro/Hi4-T/8.jpg",
];

async function convert(input) {
  const output = input.replace(/\.jpe?g$/i, ".webp");
  const originalBuffer = await fs.readFile(input);
  const metadata = await sharp(originalBuffer).metadata();

  const buf = await sharp(originalBuffer)
    .webp({ quality: 85 })
    .toBuffer();

  await fs.writeFile(output, buf);

  console.log(`[${input}]`);
  console.log(`  原始: ${(originalBuffer.length / 1024).toFixed(1)}KB | ${metadata.width}x${metadata.height}`);
  console.log(`  输出: ${output} => ${(buf.length / 1024).toFixed(1)}KB`);
}

async function main() {
  for (const input of INPUTS) {
    await convert(input);
  }
  console.log("\n全部转换完成！");
}

main().catch((err) => {
  console.error("转换失败:", err);
  process.exit(1);
});
