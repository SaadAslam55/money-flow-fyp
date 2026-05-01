// scripts/fix-logger-imports.ts
import fs from 'fs';
import path from 'path';

let filesFixed = 0;

function fixLoggerImport(content: string, filePath: string): string {
  // Skip if file doesn't use logger
  if (!content.includes('logger.')) {
    return content;
  }
  
  // Check if logger is already imported
  const hasLoggerImport = /import\s+.*logger.*from\s+['"]@\/lib\/logger['"]/.test(content);
  
  if (hasLoggerImport) {
    return content; // Already has import
  }
  
  // Find the first import statement
  const lines = content.split('\n');
  let firstImportIndex = -1;
  
  for (let i = 0; i < lines.length; i++) {
    if (lines[i].trim().startsWith('import ')) {
      firstImportIndex = i;
      break;
    }
  }
  
  if (firstImportIndex === -1) {
    // No imports found, add at the beginning
    return "import { logger } from '@/lib/logger';\n\n" + content;
  }
  
  // Insert after first import
  lines.splice(firstImportIndex + 1, 0, "import { logger } from '@/lib/logger';");
  filesFixed++;
  
  return lines.join('\n');
}

function fixConstReassignment(content: string): string {
  // Fix: Cannot assign to 'data' because it is a constant
  // Change const to let when variable is reassigned
  
  const lines = content.split('\n');
  const modified: string[] = [];
  
  for (let i = 0; i < lines.length; i++) {
    let line = lines[i];
    
    // Look for pattern: const { data, error } = ...
    const constMatch = line.match(/const\s+{\s*([^}]+)\s*}\s*=/);
    if (constMatch) {
      const vars = constMatch[1].split(',').map(v => v.trim().split(':')[0].trim());
      
      // Check next 50 lines for reassignment
      const checkLines = lines.slice(i + 1, i + 50).join('\n');
      
      for (const varName of vars) {
        // Pattern: varName = something (reassignment)
        const reassignPattern = new RegExp(`\\b${varName}\\s*=\\s*[^=]`, 'g');
        if (reassignPattern.test(checkLines)) {
          line = line.replace('const {', 'let {');
          break;
        }
      }
    }
    
    modified.push(line);
  }
  
  return modified.join('\n');
}

function fixErrorType(content: string): string {
  // Fix: Argument of type 'unknown' is not assignable to parameter of type 'string | undefined'
  // Pattern: logger.error('message:', error)
  
  return content.replace(
    /logger\.(error|warn|info)\(([^,]+),\s*(\w+)\)/g,
    (match, level, message, errorVar) => {
      return `logger.${level}(${message}, ${errorVar} instanceof Error ? ${errorVar}.message : String(${errorVar}))`;
    }
  );
}

function fixShorthandProperty(content: string): string {
  // Fix: No value exists in scope for the shorthand property 'id'
  // This happens when destructured variable is renamed but object uses shorthand
  
  // Pattern: const { id: _id, ... } = data; return { id, ... }
  const lines = content.split('\n');
  const renamedVars = new Map<string, string>();
  
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    
    // Find destructuring with renames: { id: _id, created_at: _created_at }
    const destructureMatch = line.match(/{\s*([^}]+)\s*}\s*=/);
    if (destructureMatch) {
      const vars = destructureMatch[1].split(',');
      vars.forEach(v => {
        const renameMatch = v.trim().match(/(\w+):\s*_\1/);
        if (renameMatch) {
          renamedVars.set(renameMatch[1], `_${renameMatch[1]}`);
        }
      });
    }
    
    // Fix object shorthand references
    if (renamedVars.size > 0) {
      renamedVars.forEach((newName, oldName) => {
        // Pattern: return { id, ... } should become { id: _id, ... }
        const shorthandRegex = new RegExp(`(\\{[^}]*)(\\b${oldName}\\b)(?=\\s*[,}])`, 'g');
        lines[i] = lines[i].replace(shorthandRegex, `$1${oldName}: ${newName}`);
      });
    }
  }
  
  return lines.join('\n');
}

function processFile(filePath: string): void {
  if (!filePath.endsWith('.ts') && !filePath.endsWith('.tsx')) return;
  if (filePath.endsWith('.d.ts')) return;
  
  let content = fs.readFileSync(filePath, 'utf8');
  const original = content;
  
  // Apply all fixes
  content = fixLoggerImport(content, filePath);
  content = fixConstReassignment(content);
  content = fixErrorType(content);
  content = fixShorthandProperty(content);
  
  // Only write if changed
  if (content !== original) {
    fs.writeFileSync(filePath, content, 'utf8');
    console.log(`✓ Fixed: ${path.relative(process.cwd(), filePath)}`);
  }
}

function walkDir(dir: string): void {
  const files = fs.readdirSync(dir);
  
  files.forEach(file => {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);
    
    if (stat.isDirectory() && !file.startsWith('.') && file !== 'node_modules') {
      walkDir(filePath);
    } else {
      processFile(filePath);
    }
  });
}

console.log('🔧 Fixing logger imports and TypeScript errors...\n');

const srcDir = path.join(process.cwd(), 'src');
walkDir(srcDir);

console.log(`\n✨ Done! Fixed ${filesFixed} files with missing logger imports.`);
console.log('🧪 Run: npm run type-check');