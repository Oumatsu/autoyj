import fs from 'fs';
import path from 'path';

const siteDir = '/Users/a12/projects/youguard/site';

function walk(dir) {
  let results = [];
  const list = fs.readdirSync(dir);
  list.forEach(file => {
    const fullPath = path.join(dir, file);
    const stat = fs.statSync(fullPath);
    if (stat && stat.isDirectory()) {
      results = results.concat(walk(fullPath));
    } else if (file.endsWith('.html')) {
      results.push(fullPath);
    }
  });
  return results;
}

const htmlFiles = walk(siteDir);
console.log(`Found ${htmlFiles.length} HTML files.`);

let updatedCount = 0;

htmlFiles.forEach(filePath => {
  let content = fs.readFileSync(filePath, 'utf8');
  let original = content;

  // Regex to remove Google Fonts link tags
  // Matches <link href="...fonts.googleapis.com..." ...>
  const fontLinkRegex = /<link\s+[^>]*fonts\.googleapis\.com[^>]*>/gi;
  content = content.replace(fontLinkRegex, '');

  // Regex to replace font-family: 'Inter', sans-serif or similar
  const fontFamilyRegex = /font-family\s*:\s*(['"])Inter\1\s*,\s*sans-serif/gi;
  content = content.replace(fontFamilyRegex, "font-family: system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif");

  if (content !== original) {
    fs.writeFileSync(filePath, content, 'utf8');
    updatedCount++;
    console.log(`Updated: ${path.relative(siteDir, filePath)}`);
  }
});

console.log(`Successfully updated ${updatedCount} files.`);
