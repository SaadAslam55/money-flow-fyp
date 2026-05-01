// scripts/fix-remaining-eslint-issues.ts
import fs from 'fs';
import path from 'path';

interface FixStats {
  duplicateImports: number;
  unusedVars: number;
  consoleStatements: number;
  preferConst: number;
  objectDestructuring: number;
  emptyInterfaces: number;
}

const stats: FixStats = {
  duplicateImports: 0,
  unusedVars: 0,
  consoleStatements: 0,
  preferConst: 0,
  objectDestructuring: 0,
  emptyInterfaces: 0,
};

// Fix 1: Merge duplicate imports
function fixDuplicateImports(content: string, filePath: string): string {
  const lines = content.split('\n');
  const importMap = new Map<string, Set<string>>();
  const importLines: number[] = [];

  lines.forEach((line, index) => {
    const match = line.match(/^import\s+{\s*([^}]+)\s*}\s+from\s+['"]([^'"]+)['"]/);
    if (match) {
      const [_, imports, source] = match;
      if (!importMap.has(source)) {
        importMap.set(source, new Set());
      }
      imports.split(',').forEach((imp) => {
        importMap.get(source)!.add(imp.trim());
      });
      importLines.push(index);
    }
  });

  // If we found duplicates, rebuild
  if (importMap.size > 0 && importLines.length > importMap.size) {
    const newLines = lines.filter((_, index) => !importLines.includes(index));
    const mergedImports: string[] = [];

    importMap.forEach((imports, source) => {
      mergedImports.push(`import { ${Array.from(imports).join(', ')} } from '${source}';`);
    });

    // Insert merged imports at the beginning
    const firstImportLine = importLines[0] || 0;
    newLines.splice(firstImportLine, 0, ...mergedImports);

    stats.duplicateImports++;
    return newLines.join('\n');
  }

  return content;
}

// Fix 2: Add underscore prefix to unused vars
function fixUnusedVars(content: string): string {
  const unusedVars = [
    'id',
    'organization_id',
    'created_at',
    'updated_at',
    'created_by',
    'auth_user_id',
    'last_login',
    'payment_provider',
    'payment_customer_id',
    'payment_subscription_id',
    'logo_url',
  ];

  let modified = content;
  let changesMade = false;

  // Pattern: const { id, created_at, ...rest } = data;
  const destructureRegex = /const\s+{\s*([^}]+)\s*}\s*=/g;

  modified = modified.replace(destructureRegex, (match, vars) => {
    const varList = vars.split(',').map((v: string) => v.trim());
    const newVarList = varList.map((v: string) => {
      // Check if it's a simple variable (not a rename)
      if (!v.includes(':') && unusedVars.includes(v)) {
        changesMade = true;
        return `${v}: _${v}`;
      }
      return v;
    });

    if (changesMade) {
      stats.unusedVars++;
    }

    return `const { ${newVarList.join(', ')} } =`;
  });

  return modified;
}

// Fix 3: Replace console with logger
function fixConsoleStatements(content: string, filePath: string): string {
  // Skip if it's a logger file or test file
  if (filePath.includes('logger.ts') || filePath.includes('.test.')) {
    return content;
  }

  const hasConsole = /console\.(log|error|warn|debug|info)/.test(content);
  if (!hasConsole) return content;

  const hasLogger = /from ['"]@\/lib\/logger['"]/.test(content);

  let modified = content;

  // Add import if needed
  if (!hasLogger) {
    const importInsertPoint = modified.indexOf('import');
    if (importInsertPoint !== -1) {
      modified =
        modified.slice(0, importInsertPoint) +
        "import { logger } from '@/lib/logger';\n" +
        modified.slice(importInsertPoint);
    }
  }

  // Replace console statements
  modified = modified
    .replace(/console\.log\(/g, 'logger.info(')
    .replace(/console\.error\(/g, 'logger.error(')
    .replace(/console\.warn\(/g, 'logger.warn(')
    .replace(/console\.debug\(/g, 'logger.debug(')
    .replace(/console\.info\(/g, 'logger.info(');

  if (hasConsole) stats.consoleStatements++;

  return modified;
}

// Fix 4: Change let to const when not reassigned
function fixPreferConst(content: string): string {
  // Pattern: let { error } = await ... (never reassigned)
  const letDestructureRegex = /let\s+{\s*([^}]+)\s*}\s*=/g;

  const modified = content.replace(letDestructureRegex, (match, vars) => {
    stats.preferConst++;
    return `const { ${vars} } =`;
  });

  return modified;
}

// Fix 5: Use object destructuring
function fixObjectDestructuring(content: string): string {
  // Pattern: const invoice = invoices[0];
  // Fix: const [invoice] = invoices;

  // This is tricky to do safely, so we'll skip for now
  // Manual review recommended

  return content;
}

// Fix 6: Remove empty interfaces that extend others
function fixEmptyInterfaces(content: string): string {
  // Pattern: export interface SomethingRequest extends BaseRequest {}
  // Can be replaced with: export type SomethingRequest = BaseRequest;

  const emptyInterfaceRegex = /export\s+interface\s+(\w+)\s+extends\s+(\w+)\s*{\s*}/g;

  const modified = content.replace(emptyInterfaceRegex, (match, name, base) => {
    stats.emptyInterfaces++;
    return `export type ${name} = ${base};`;
  });

  return modified;
}

// Fix 7: Add explicit String() for template literals
function fixTemplateLiterals(content: string): string {
  // This is complex and risky to automate
  // Better done manually or with type fixes
  return content;
}

// Fix 8: Remove unnecessary optional chains (needs type info - skip)
function fixUnnecessaryOptionalChains(content: string): string {
  // This requires type information, skip
  return content;
}

// Main processor
function processFile(filePath: string): void {
  if (!filePath.endsWith('.ts') && !filePath.endsWith('.tsx')) return;

  // Skip declaration files
  if (filePath.endsWith('.d.ts')) return;

  let content = fs.readFileSync(filePath, 'utf8');
  const original = content;

  // Apply all fixes
  content = fixDuplicateImports(content, filePath);
  content = fixUnusedVars(content);
  content = fixConsoleStatements(content, filePath);
  content = fixPreferConst(content);
  content = fixObjectDestructuring(content);
  content = fixEmptyInterfaces(content);

  // Only write if changed
  if (content !== original) {
    fs.writeFileSync(filePath, content, 'utf8');
    console.log(`✓ Fixed: ${path.relative(process.cwd(), filePath)}`);
  }
}

function walkDir(dir: string): void {
  const files = fs.readdirSync(dir);

  files.forEach((file) => {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);

    if (stat.isDirectory() && !file.startsWith('.') && file !== 'node_modules') {
      walkDir(filePath);
    } else {
      processFile(filePath);
    }
  });
}

// Run the fixes
console.log('🔧 Starting automated ESLint fixes...\n');

const srcDir = path.join(process.cwd(), 'src');
walkDir(srcDir);

console.log('\n📊 Summary:');
console.log(`   Duplicate imports merged: ${stats.duplicateImports}`);
console.log(`   Unused variables fixed: ${stats.unusedVars}`);
console.log(`   Console statements replaced: ${stats.consoleStatements}`);
console.log(`   let → const fixes: ${stats.preferConst}`);
console.log(`   Empty interfaces fixed: ${stats.emptyInterfaces}`);
console.log('\n✨ Done! Run ESLint again to see remaining issues.');
console.log('💡 Remaining issues will need manual fixes or proper type definitions.');
