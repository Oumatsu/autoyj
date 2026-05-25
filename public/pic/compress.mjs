import sharp from "sharp";
import { promises as fs } from "fs";

const INPUT = "revenue-king/dolphin/7cut.jpg";
const OUTPUT = INPUT.replace(/\.jpe?g$/i, ".webp");

async function convert() {
  const originalBuffer = await fs.readFile(INPUT);
  const metadata = await sharp(originalBuffer).metadata();

  console.log(`原始大小: ${(originalBuffer.length / 1024).toFixed(1)}KB`);
  console.log(`尺寸: ${metadata.width}x${metadata.height}`);

  const buf = await sharp(originalBuffer)
    .webp({ quality: 85 })
    .toBuffer();

  await fs.writeFile(OUTPUT, buf);
  console.log(`输出: ${OUTPUT}`);
  console.log(`最终大小: ${(buf.length / 1024).toFixed(1)}KB`);
  console.log("转换完成！");
}

convert().catch((err) => {
  console.error("转换失败:", err);
  process.exit(1);
});
