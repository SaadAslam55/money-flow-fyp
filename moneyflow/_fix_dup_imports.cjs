const fs = require('fs');
const path = require('path');

function walk(dir) {
  let files = [];
  for (const f of fs.readdirSync(dir)) {
    const p = path.join(dir, f);
    if (fs.statSync(p).isDirectory() && !f.startsWith('.') && f !== 'node_modules')
      files = files.concat(walk(p));
    else if (/\.(ts|tsx)$/.test(f))
      files.push(p);
  }
  return files;
}

let count = 0;
for (const f of walk('src')) {
  let c = fs.readFileSync(f, 'utf8');
  const orig = c;
  
  // Find all logger import lines
  const loggerImport = "import { logger } from '@/lib/logger';";
  const lines = c.split('\n');
  const importIndices = [];
  for (let i = 0; i < lines.length; i++) {
    if (lines[i].trim() === loggerImport) importIndices.push(i);
  }
  
  // If more than one, remove the duplicates (keep the first one)
  if (importIndices.length > 1) {
    for (let i = importIndices.length - 1; i > 0; i--) {
      lines.splice(importIndices[i], 1);
    }
    c = lines.join('\n');
  }
  
  if (c !== orig) {
    fs.writeFileSync(f, c);
    count++;
  }
}
console.log('Fixed duplicate imports in ' + count + ' files');
