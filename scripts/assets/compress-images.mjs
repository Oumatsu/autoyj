import sharp from "sharp";
import { promises as fs } from "fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../..");
const inputPath = path.join(root, "public", "pic", "elite-flagship", "E-HS9", "6cut.jpeg");
const outputPath = inputPath.replace(/\.jpe?g$/i, ".webp");
const TARGET_BYTES = 500 * 1024;

async function convert() {
  const originalBuffer = await fs.readFile(inputPath);
  const metadata = await sharp(originalBuffer).metadata();
  console.log(`原始大小: ${(originalBuffer.length / 1024).toFixed(1)}KB`);
  console.log(`尺寸: ${metadata.width}x${metadata.height}`);

  let lo = 1, hi = 100, bestQuality = 1;

  while (lo <= hi) {
    const mid = Math.floor((lo + hi) / 2);
    const buf = await sharp(originalBuffer)
      .webp({ quality: mid })
      .toBuffer();
    const size = buf.length;

    console.log(`quality=${mid} => ${(size / 1024).toFixed(1)}KB`);

    if (size <= TARGET_BYTES) {
      bestQuality = mid;
      lo = mid + 1;
    } else {
      hi = mid - 1;
    }
  }

  console.log(`\n最佳质量: ${bestQuality}`);

  const finalBuf = await sharp(originalBuffer)
    .webp({ quality: bestQuality })
    .toBuffer();

  await fs.writeFile(outputPath, finalBuf);
  console.log(`输出: ${outputPath}`);
  console.log(`最终大小: ${(finalBuf.length / 1024).toFixed(1)}KB`);
  console.log("原文件已保留，转换完成！");
}

convert().catch((err) => {
  console.error("转换失败:", err);
  process.exit(1);
});
