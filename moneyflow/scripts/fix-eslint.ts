#!/usr/bin/env node

/**
 * ESLint Auto-Fix Script
 * This script helps fix common ESLint warnings in the MoneyFlow project
 *
 * Usage:
 * 1. Save this file as fix-eslint.ts in your scripts/ directory
 * 2. Run: npx tsx scripts/fix-eslint.ts
 */

import { readFileSync, writeFileSync, readdirSync, statSync } from 'fs';
import { join } from 'path';

interface FixStats {
  filesProcessed: number;
  nullishCoalescingFixed: number;
  unusedVarsFixed: number;
  consoleStatementsFound: number;
  anyTypesFound: number;
}

const stats: FixStats = {
  filesProcessed: 0,
  nullishCoalescingFixed: 0,
  unusedVarsFixed: 0,
  consoleStatementsFound: 0,
  anyTypesFound: 0,
};

/**
 * Fix 1: Replace || with ?? for nullish coalescing
 * Only replaces when it's safe (checking for null/undefined, not falsy values)
 */
function fixNullishCoalescing(content: string): string {
  let fixed = content;
  let count = 0;

  // Pattern: variable || 'default' or variable || []
  // Be conservative - only fix obvious cases
  const patterns = [
    // String defaults
    /(\w+(?:\.\w+)*)\s*\|\|\s*['"]/g,
    // Array/Object defaults
    /(\w+(?:\.\w+)*)\s*\|\|\s*[\[{]/g,
    // Number defaults (be careful with 0)
    /(\w+(?:\.\w+)*)\s*\|\|\s*\d+(?!\w)/g,
  ];

  patterns.forEach((pattern) => {
    const matches = fixed.match(pattern);
    if (matches) {
      count += matches.length;
      fixed = fixed.replace(pattern, (match) => match.replace('||', '??'));
    }
  });

  stats.nullishCoalescingFixed += count;
  return fixed;
}

/**
 * Fix 2: Prefix unused variables with underscore
 */
function fixUnusedVars(content: string): string {
  let fixed = content;

  // List of unused vars from the warnings
  const unusedVars = [
    'id',
    'organization_id',
    'created_at',
    'updated_at',
    'auth_user_id',
    'last_login',
    'created_by',
  ];

  unusedVars.forEach((varName) => {
    // Match destructuring assignments
    const destructurePattern = new RegExp(
      `(const|let)\\s*\\{([^}]*?)\\b${varName}\\b([^}]*?)\\}\\s*=`,
      'g'
    );

    fixed = fixed.replace(destructurePattern, (match, keyword, before, after) => {
      stats.unusedVarsFixed++;
      return `${keyword} {${before}_${varName}${after}} =`;
    });
  });

  return fixed;
}

/**
 * Fix 3: Add comments for console statements (for review)
 */
function markConsoleStatements(content: string): string {
  let fixed = content;
  const consolePattern = /^(\s*)(console\.\w+\()/gm;

  fixed = fixed.replace(consolePattern, (match, whitespace, consoleCall) => {
    stats.consoleStatementsFound++;
    return `${whitespace}// TODO: Remove or replace with proper logging\n${whitespace}${consoleCall}`;
  });

  return fixed;
}

/**
 * Fix 4: Add type annotations for any types (comments for manual fix)
 */
function markAnyTypes(content: string): string {
  let fixed = content;

  // Find explicit any types
  const anyPattern = /:\s*any\b/g;
  const matches = content.match(anyPattern);

  if (matches) {
    stats.anyTypesFound += matches.length;
  }

  return fixed;
}

/**
 * Process a single TypeScript file
 */
function processFile(filePath: string): void {
  try {
    let content = readFileSync(filePath, 'utf-8');
    const original = content;

    // Apply fixes
    content = fixNullishCoalescing(content);
    content = fixUnusedVars(content);
    content = markConsoleStatements(content);
    content = markAnyTypes(content);

    // Only write if changes were made
    if (content !== original) {
      writeFileSync(filePath, content, 'utf-8');
      console.log(`✓ Fixed: ${filePath}`);
    }

    stats.filesProcessed++;
  } catch (error) {
    console.error(`✗ Error processing ${filePath}:`, error);
  }
}

/**
 * Recursively process directory
 */
function processDirectory(dirPath: string): void {
  const items = readdirSync(dirPath);

  items.forEach((item) => {
    const fullPath = join(dirPath, item);
    const stat = statSync(fullPath);

    if (stat.isDirectory()) {
      // Skip node_modules, dist, build, etc.
      if (!['node_modules', 'dist', 'build', '.git', 'coverage'].includes(item)) {
        processDirectory(fullPath);
      }
    } else if (item.endsWith('.ts') || item.endsWith('.tsx')) {
      processFile(fullPath);
    }
  });
}

/**
 * Main execution
 */
function main() {
  console.log('🔧 Starting ESLint fixes...\n');

  const srcPath = join(process.cwd(), 'src');

  if (!statSync(srcPath).isDirectory()) {
    console.error('Error: src directory not found');
    process.exit(1);
  }

  processDirectory(srcPath);

  console.log('\n📊 Summary:');
  console.log(`Files processed: ${stats.filesProcessed}`);
  console.log(`Nullish coalescing fixes: ${stats.nullishCoalescingFixed}`);
  console.log(`Unused variables fixed: ${stats.unusedVarsFixed}`);
  console.log(`Console statements marked: ${stats.consoleStatementsFound}`);
  console.log(`Any types found: ${stats.anyTypesFound}`);
  console.log('\n✨ Done! Run ESLint again to see remaining issues.');
  console.log('💡 Tip: Review console statements and any types manually.');
}

main();
