// scripts/fix-template-literals.ts
import fs from 'fs';
import path from 'path';

const filesToFix = [
  'src/pages/customers/CustomerDetailPage.tsx',
  'src/pages/customers/EditCustomerPage.tsx',
  'src/pages/invoices/EditInvoicePage.tsx',
  'src/pages/invoices/InvoiceDetailPage.tsx',
  'src/pages/products/EditProductPage.tsx',
  'src/pages/products/ProductDetailPage.tsx',
];

function fixTemplateLiterals(content: string): string {
  // Fix pattern: ${id: _id} → ${_id}
  // This was incorrectly changed from ${id}
  
  // Pattern 1: ${id: _id} in template literals
  content = content.replace(/\$\{id:\s*_id\}/g, '${_id}');
  
  // Pattern 2: ${product.id: _id}
  content = content.replace(/\$\{(\w+)\.id:\s*_id\}/g, '${$1._id}');
  
  // Pattern 3: ${item.id: _id}
  content = content.replace(/\$\{item\.id:\s*_id\}/g, '${item._id}');
  
  // Pattern 4: key={item.id: _id}
  content = content.replace(/key=\{item\.id:\s*_id\}/g, 'key={item._id}');
  
  // Pattern 5: id: product.id: _id (nested destructuring error)
  content = content.replace(/id:\s*product\.id:\s*_id/g, 'id: product._id');
  
  return content;
}

function revertBadRenames(content: string): string {
  // The script incorrectly renamed id to _id in some places
  // We need to check if id was actually destructured with underscore
  
  const lines = content.split('\n');
  let hasIdUnderscore = false;
  
  // Check if file actually has: const { id: _id } = ...
  for (const line of lines) {
    if (/{\s*id:\s*_id/.test(line) && /}\s*=/.test(line)) {
      hasIdUnderscore = true;
      break;
    }
  }
  
  // If it doesn't have the destructuring, we should use 'id' not '_id'
  if (!hasIdUnderscore) {
    content = content.replace(/\$\{_id\}/g, '${id}');
    content = content.replace(/\$\{(\w+)\._id\}/g, '${$1.id}');
    content = content.replace(/key=\{item\._id\}/g, 'key={item.id}');
  }
  
  return content;
}

console.log('🔧 Fixing template literal errors...\n');

let fixed = 0;
for (const filePath of filesToFix) {
  const fullPath = path.join(process.cwd(), filePath);
  
  if (!fs.existsSync(fullPath)) {
    console.log(`⚠️  Not found: ${filePath}`);
    continue;
  }
  
  let content = fs.readFileSync(fullPath, 'utf8');
  const original = content;
  
  content = fixTemplateLiterals(content);
  content = revertBadRenames(content);
  
  if (content !== original) {
    fs.writeFileSync(fullPath, content, 'utf8');
    console.log(`✓ Fixed: ${filePath}`);
    fixed++;
  }
}

console.log(`\n✨ Done! Fixed ${fixed} files.`);
console.log('🧪 Run: npm run type-check');