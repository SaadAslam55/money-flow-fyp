// Seed script for Malik Electronics & Trading
// Usage: node scripts/seed-malik-electronics.mjs

import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://wutvmjgnxlptowmjnyxt.supabase.co';
const SERVICE_ROLE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Ind1dHZtamdueGxwdG93bWpueXh0Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3Njc1NzIzNiwiZXhwIjoyMDkyMzMzMjM2fQ.os0ECjVQoBYvK20Dlfbj_bHR80tW7j3he3XGGJON0uw';

const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY, {
  auth: { autoRefreshToken: false, persistSession: false },
});

const USER_EMAIL = 'kaash0297@gmail.com';

async function main() {
  console.log('🔍 Finding user...');

  // Find the auth user
  const { data: authUsers, error: authError } = await supabase.auth.admin.listUsers();
  if (authError) {
    console.error('Error listing users:', authError);
    process.exit(1);
  }

  const authUser = authUsers.users.find(u => u.email === USER_EMAIL);
  if (!authUser) {
    console.error(`User with email ${USER_EMAIL} not found!`);
    process.exit(1);
  }

  console.log(`✅ Found auth user: ${authUser.id}`);

  // Find the public user record
  const { data: userRecord, error: userError } = await supabase
    .from('users')
    .select('*')
    .eq('auth_user_id', authUser.id)
    .single();

  if (userError) {
    console.error('Error finding user record:', userError);
    process.exit(1);
  }

  console.log(`✅ Found user record: ${userRecord.id}, org: ${userRecord.organization_id}`);

  const orgId = userRecord.organization_id;
  const userId = userRecord.id;

  // Update organization name
  console.log('📝 Updating organization...');
  const { error: orgError } = await supabase
    .from('organizations')
    .update({
      name: 'Malik Electronics & Trading',
      phone: '+92-300-1234567',
      address: 'Shop #12, Main Market, Satellite Town',
      city: 'Rawalpindi',
      country: 'Pakistan',
      currency: 'PKR',
      timezone: 'Asia/Karachi',
      tax_id: 'NTN-1234567-8',
      settings: {
        business_type: 'electronics',
        registration_number: 'REG-2024-ME-001',
      },
    })
    .eq('id', orgId);

  if (orgError) console.error('Error updating org:', orgError);
  else console.log('✅ Organization updated');

  // Update user role to admin
  console.log('📝 Updating user role to admin...');
  await supabase.from('users').update({ role: 'admin' }).eq('id', userId);

  // ============================================
  // SEED BANK ACCOUNTS
  // ============================================
  console.log('🏦 Seeding bank accounts...');
  const { data: bankAccounts, error: bankError } = await supabase
    .from('bank_accounts')
    .upsert([
      {
        organization_id: orgId,
        account_name: 'HBL Business Account',
        bank_name: 'Habib Bank Limited',
        account_number: '****4567',
        account_type: 'checking',
        opening_balance: 500000,
        current_balance: 1250000,
        currency: 'PKR',
        is_active: true,
      },
      {
        organization_id: orgId,
        account_name: 'Cash Register - Main Shop',
        bank_name: 'Cash',
        account_number: 'CASH-001',
        account_type: 'cash',
        opening_balance: 50000,
        current_balance: 175000,
        currency: 'PKR',
        is_active: true,
      },
      {
        organization_id: orgId,
        account_name: 'JazzCash Business',
        bank_name: 'JazzCash',
        account_number: '0300-1234567',
        account_type: 'checking',
        opening_balance: 0,
        current_balance: 89000,
        currency: 'PKR',
        is_active: true,
      },
    ], { onConflict: 'id' })
    .select();

  if (bankError) console.error('Error seeding bank accounts:', bankError);
  else console.log(`✅ Seeded ${bankAccounts?.length} bank accounts`);

  // ============================================
  // SEED EXPENSE CATEGORIES
  // ============================================
  console.log('📂 Seeding expense categories...');
  const { data: expenseCategories, error: catError } = await supabase
    .from('expense_categories')
    .upsert([
      { organization_id: orgId, name: 'Rent', description: 'Shop rent payments', color: '#ef4444', icon: 'home' },
      { organization_id: orgId, name: 'Utilities', description: 'Electricity, gas, water bills', color: '#f97316', icon: 'zap' },
      { organization_id: orgId, name: 'Salaries', description: 'Employee salaries and wages', color: '#3b82f6', icon: 'users' },
      { organization_id: orgId, name: 'Purchase Stock', description: 'Stock procurement from suppliers', color: '#8b5cf6', icon: 'package' },
      { organization_id: orgId, name: 'Transport', description: 'Delivery and transport costs', color: '#06b6d4', icon: 'truck' },
      { organization_id: orgId, name: 'Maintenance', description: 'Shop and equipment maintenance', color: '#22c55e', icon: 'wrench' },
      { organization_id: orgId, name: 'Marketing', description: 'Advertising and marketing expenses', color: '#ec4899', icon: 'megaphone' },
      { organization_id: orgId, name: 'Miscellaneous', description: 'Other expenses', color: '#6b7280', icon: 'more-horizontal' },
    ], { onConflict: 'id' })
    .select();

  if (catError) console.error('Error seeding expense categories:', catError);
  else console.log(`✅ Seeded ${expenseCategories?.length} expense categories`);

  // ============================================
  // SEED CUSTOMERS
  // ============================================
  console.log('👥 Seeding customers...');
  const { data: customers, error: custError } = await supabase
    .from('customers')
    .upsert([
      { organization_id: orgId, name: 'Ahmed Khan', email: 'ahmed.khan@gmail.com', phone: '+92-321-5551001', address: 'House #5, Street 10', city: 'Rawalpindi', outstanding_balance: 15000, credit_limit: 50000, is_active: true },
      { organization_id: orgId, name: 'Fatima Noor', email: 'fatima.noor@yahoo.com', phone: '+92-333-5552002', address: 'Flat #3, Plaza Market', city: 'Islamabad', outstanding_balance: 0, credit_limit: 30000, is_active: true },
      { organization_id: orgId, name: 'Usman Traders', email: 'usman.traders@outlook.com', phone: '+92-300-5553003', address: 'Shop #8, Commercial Market', city: 'Rawalpindi', tax_id: 'NTN-9876543', outstanding_balance: 45000, credit_limit: 100000, is_active: true },
      { organization_id: orgId, name: 'Zain Electronics', email: 'zain.elec@gmail.com', phone: '+92-345-5554004', address: 'Main Bazaar, Shop #22', city: 'Lahore', tax_id: 'NTN-5678901', outstanding_balance: 25000, credit_limit: 200000, is_active: true },
      { organization_id: orgId, name: 'Bilal Ahmed', email: 'bilal.ahmed@gmail.com', phone: '+92-312-5555005', address: 'House #15, Sector F-8', city: 'Islamabad', outstanding_balance: 8000, credit_limit: 25000, is_active: true },
      { organization_id: orgId, name: 'Hassan Brothers', email: 'hassan.bros@yahoo.com', phone: '+92-301-5556006', address: 'Wholesale Market, Godown #7', city: 'Rawalpindi', tax_id: 'NTN-3456789', outstanding_balance: 75000, credit_limit: 300000, is_active: true },
      { organization_id: orgId, name: 'Sadia Iqbal', email: 'sadia.iqbal@gmail.com', phone: '+92-321-5557007', address: 'Apartment #4, Bahria Town', city: 'Rawalpindi', outstanding_balance: 0, credit_limit: 20000, is_active: true },
      { organization_id: orgId, name: 'Rizwan Mobile Shop', email: 'rizwan.mobile@outlook.com', phone: '+92-333-5558008', address: 'Saddar Market, Shop #31', city: 'Rawalpindi', tax_id: 'NTN-7890123', outstanding_balance: 35000, credit_limit: 150000, is_active: true },
      { organization_id: orgId, name: 'Kashif Ali', email: 'kashif.ali@gmail.com', phone: '+92-300-5559009', address: 'House #22, DHA Phase 2', city: 'Islamabad', outstanding_balance: 12000, credit_limit: 40000, is_active: true },
      { organization_id: orgId, name: 'Malik General Store', email: 'malik.store@yahoo.com', phone: '+92-345-5551010', address: 'Raja Bazaar, Shop #5', city: 'Rawalpindi', outstanding_balance: 20000, credit_limit: 80000, is_active: true },
    ], { onConflict: 'id' })
    .select();

  if (custError) console.error('Error seeding customers:', custError);
  else console.log(`✅ Seeded ${customers?.length} customers`);

  // ============================================
  // SEED PRODUCTS (Electronics Shop)
  // ============================================
  console.log('📦 Seeding products...');
  const { data: products, error: prodError } = await supabase
    .from('products')
    .upsert([
      // Mobile Phones
      { organization_id: orgId, name: 'Samsung Galaxy A15', description: 'Samsung Galaxy A15 128GB, 6GB RAM', sku: 'ME-SAM-A15', category: 'Mobile Phones', unit_price: 52000, cost_price: 46000, tax_rate: 0, track_inventory: true, current_stock: 15, minimum_stock: 5, is_active: true },
      { organization_id: orgId, name: 'Samsung Galaxy A35', description: 'Samsung Galaxy A35 128GB, 8GB RAM', sku: 'ME-SAM-A35', category: 'Mobile Phones', unit_price: 78000, cost_price: 70000, tax_rate: 0, track_inventory: true, current_stock: 8, minimum_stock: 3, is_active: true },
      { organization_id: orgId, name: 'Samsung Galaxy S24 Ultra', description: 'Samsung Galaxy S24 Ultra 256GB', sku: 'ME-SAM-S24U', category: 'Mobile Phones', unit_price: 415000, cost_price: 385000, tax_rate: 0, track_inventory: true, current_stock: 3, minimum_stock: 2, is_active: true },
      { organization_id: orgId, name: 'Infinix Note 40 Pro', description: 'Infinix Note 40 Pro 256GB', sku: 'ME-INF-N40P', category: 'Mobile Phones', unit_price: 55000, cost_price: 48000, tax_rate: 0, track_inventory: true, current_stock: 12, minimum_stock: 5, is_active: true },
      { organization_id: orgId, name: 'Tecno Spark 20', description: 'Tecno Spark 20 128GB', sku: 'ME-TEC-S20', category: 'Mobile Phones', unit_price: 28000, cost_price: 24000, tax_rate: 0, track_inventory: true, current_stock: 20, minimum_stock: 8, is_active: true },
      { organization_id: orgId, name: 'Redmi Note 13', description: 'Xiaomi Redmi Note 13 128GB', sku: 'ME-XIA-RN13', category: 'Mobile Phones', unit_price: 48000, cost_price: 42000, tax_rate: 0, track_inventory: true, current_stock: 10, minimum_stock: 4, is_active: true },
      { organization_id: orgId, name: 'iPhone 15 Pro', description: 'Apple iPhone 15 Pro 256GB', sku: 'ME-APL-I15P', category: 'Mobile Phones', unit_price: 535000, cost_price: 490000, tax_rate: 0, track_inventory: true, current_stock: 2, minimum_stock: 1, is_active: true },
      // LED TVs
      { organization_id: orgId, name: 'TCL 43" Smart LED', description: 'TCL 43 inch Android Smart LED TV', sku: 'ME-TCL-43', category: 'LED TVs', unit_price: 72000, cost_price: 62000, tax_rate: 0, track_inventory: true, current_stock: 6, minimum_stock: 2, is_active: true },
      { organization_id: orgId, name: 'Samsung 55" Crystal 4K', description: 'Samsung 55 inch Crystal 4K UHD Smart TV', sku: 'ME-SAM-55TV', category: 'LED TVs', unit_price: 175000, cost_price: 155000, tax_rate: 0, track_inventory: true, current_stock: 4, minimum_stock: 2, is_active: true },
      { organization_id: orgId, name: 'Haier 32" LED', description: 'Haier 32 inch LED TV', sku: 'ME-HAI-32', category: 'LED TVs', unit_price: 38000, cost_price: 32000, tax_rate: 0, track_inventory: true, current_stock: 10, minimum_stock: 4, is_active: true },
      // Accessories
      { organization_id: orgId, name: 'AirPods Pro 2', description: 'Apple AirPods Pro 2nd Gen', sku: 'ME-APL-AP2', category: 'Accessories', unit_price: 58000, cost_price: 50000, tax_rate: 0, track_inventory: true, current_stock: 8, minimum_stock: 3, is_active: true },
      { organization_id: orgId, name: 'Samsung Buds FE', description: 'Samsung Galaxy Buds FE', sku: 'ME-SAM-BFE', category: 'Accessories', unit_price: 18000, cost_price: 14000, tax_rate: 0, track_inventory: true, current_stock: 15, minimum_stock: 5, is_active: true },
      { organization_id: orgId, name: 'Type-C Fast Charger 65W', description: 'Universal 65W Type-C Fast Charger', sku: 'ME-ACC-C65', category: 'Accessories', unit_price: 3500, cost_price: 2200, tax_rate: 0, track_inventory: true, current_stock: 50, minimum_stock: 15, is_active: true },
      { organization_id: orgId, name: 'Phone Cover (Universal)', description: 'Premium phone covers assorted', sku: 'ME-ACC-COV', category: 'Accessories', unit_price: 800, cost_price: 400, tax_rate: 0, track_inventory: true, current_stock: 100, minimum_stock: 30, is_active: true },
      { organization_id: orgId, name: 'Tempered Glass Pack', description: 'Tempered glass screen protectors (10 pack)', sku: 'ME-ACC-TG10', category: 'Accessories', unit_price: 1500, cost_price: 800, tax_rate: 0, track_inventory: true, current_stock: 80, minimum_stock: 20, is_active: true },
      // Home Appliances
      { organization_id: orgId, name: 'Dawlance Inverter AC 1.5 Ton', description: 'Dawlance Sprinter Inverter AC 1.5 Ton', sku: 'ME-DAW-AC15', category: 'Home Appliances', unit_price: 185000, cost_price: 160000, tax_rate: 0, track_inventory: true, current_stock: 3, minimum_stock: 1, is_active: true },
      { organization_id: orgId, name: 'Haier Refrigerator 14 CFT', description: 'Haier 14 CFT Refrigerator', sku: 'ME-HAI-REF14', category: 'Home Appliances', unit_price: 135000, cost_price: 115000, tax_rate: 0, track_inventory: true, current_stock: 4, minimum_stock: 2, is_active: true },
      { organization_id: orgId, name: 'National Washing Machine 8kg', description: 'National Semi-Automatic 8kg Washing Machine', sku: 'ME-NAT-WM8', category: 'Home Appliances', unit_price: 42000, cost_price: 35000, tax_rate: 0, track_inventory: true, current_stock: 5, minimum_stock: 2, is_active: true },
      // Power Banks & Speakers
      { organization_id: orgId, name: 'Anker PowerCore 20000mAh', description: 'Anker PowerCore 20000mAh Power Bank', sku: 'ME-ANK-PB20', category: 'Accessories', unit_price: 6500, cost_price: 4500, tax_rate: 0, track_inventory: true, current_stock: 25, minimum_stock: 8, is_active: true },
      { organization_id: orgId, name: 'JBL Go 3 Speaker', description: 'JBL Go 3 Portable Bluetooth Speaker', sku: 'ME-JBL-GO3', category: 'Accessories', unit_price: 9500, cost_price: 7000, tax_rate: 0, track_inventory: true, current_stock: 12, minimum_stock: 4, is_active: true },
      // Low stock items for alerts
      { organization_id: orgId, name: 'Samsung Galaxy A05', description: 'Samsung Galaxy A05 64GB', sku: 'ME-SAM-A05', category: 'Mobile Phones', unit_price: 29000, cost_price: 25000, tax_rate: 0, track_inventory: true, current_stock: 2, minimum_stock: 5, is_active: true },
      { organization_id: orgId, name: 'Oppo A17', description: 'Oppo A17 64GB', sku: 'ME-OPP-A17', category: 'Mobile Phones', unit_price: 32000, cost_price: 28000, tax_rate: 0, track_inventory: true, current_stock: 1, minimum_stock: 3, is_active: true },
    ], { onConflict: 'id' })
    .select();

  if (prodError) console.error('Error seeding products:', prodError);
  else console.log(`✅ Seeded ${products?.length} products`);

  // ============================================
  // SEED INVOICES
  // ============================================
  console.log('📄 Seeding invoices...');
  const invoices = [];
  const invoiceItems = [];

  // Helper to create invoice
  function makeInvoice(num, customerId, status, subtotal, taxAmt, total, paid, date, dueDate) {
    return {
      organization_id: orgId,
      customer_id: customerId,
      invoice_number: `INV-2025-${String(num).padStart(4, '0')}`,
      invoice_date: date,
      due_date: dueDate,
      status,
      subtotal,
      tax_amount: taxAmt,
      discount_amount: 0,
      total_amount: total,
      amount_paid: paid,
      amount_due: total - paid,
      notes: '',
      terms: 'Payment due within 30 days',
      created_by: userId,
    };
  }

  const inv1 = makeInvoice(1, customers[0].id, 'paid', 104000, 0, 104000, 104000, '2025-01-15', '2025-02-15');
  const inv2 = makeInvoice(2, customers[2].id, 'paid', 156000, 0, 156000, 156000, '2025-02-01', '2025-03-01');
  const inv3 = makeInvoice(3, customers[3].id, 'partially_paid', 72000, 0, 72000, 45000, '2025-03-10', '2025-04-10');
  const inv4 = makeInvoice(4, customers[5].id, 'sent', 227000, 0, 227000, 0, '2025-04-01', '2025-05-01');
  const inv5 = makeInvoice(5, customers[1].id, 'overdue', 38000, 0, 38000, 0, '2025-02-15', '2025-03-15');
  const inv6 = makeInvoice(6, customers[7].id, 'paid', 55000, 0, 55000, 55000, '2025-03-20', '2025-04-20');
  const inv7 = makeInvoice(7, customers[4].id, 'draft', 9500, 0, 9500, 0, '2025-04-15', '2025-05-15');
  const inv8 = makeInvoice(8, customers[9].id, 'paid', 42000, 0, 42000, 42000, '2025-01-25', '2025-02-25');
  const inv9 = makeInvoice(9, customers[6].id, 'sent', 185000, 0, 185000, 0, '2025-04-05', '2025-05-05');
  const inv10 = makeInvoice(10, customers[8].id, 'paid', 78000, 0, 78000, 78000, '2025-03-01', '2025-04-01');

  const allInvoices = [inv1, inv2, inv3, inv4, inv5, inv6, inv7, inv8, inv9, inv10];

  const { data: insertedInvoices, error: invError } = await supabase
    .from('invoices')
    .upsert(allInvoices, { onConflict: 'id' })
    .select();

  if (invError) console.error('Error seeding invoices:', invError);
  else console.log(`✅ Seeded ${insertedInvoices?.length} invoices`);

  // Seed invoice items
  if (insertedInvoices && products) {
    const items = [
      // Inv1: Ahmed Khan - 2x Samsung A15
      { invoice_id: insertedInvoices[0].id, product_id: products[0].id, description: 'Samsung Galaxy A15 128GB', quantity: 2, unit_price: 52000, tax_rate: 0, discount_percent: 0, line_total: 104000 },
      // Inv2: Usman Traders - 1x Samsung A35 + 1x Redmi Note 13
      { invoice_id: insertedInvoices[1].id, product_id: products[1].id, description: 'Samsung Galaxy A35 128GB', quantity: 1, unit_price: 78000, tax_rate: 0, discount_percent: 0, line_total: 78000 },
      { invoice_id: insertedInvoices[1].id, product_id: products[5].id, description: 'Redmi Note 13 128GB', quantity: 1, unit_price: 78000, tax_rate: 0, discount_percent: 0, line_total: 78000 },
      // Inv3: Zain Electronics - 1x TCL 43" LED
      { invoice_id: insertedInvoices[2].id, product_id: products[7].id, description: 'TCL 43" Smart LED', quantity: 1, unit_price: 72000, tax_rate: 0, discount_percent: 0, line_total: 72000 },
      // Inv4: Hassan Brothers - 1x Samsung 55" + 1x Haier 32"
      { invoice_id: insertedInvoices[3].id, product_id: products[8].id, description: 'Samsung 55" Crystal 4K', quantity: 1, unit_price: 175000, tax_rate: 0, discount_percent: 0, line_total: 175000 },
      { invoice_id: insertedInvoices[3].id, product_id: products[9].id, description: 'Haier 32" LED', quantity: 1, unit_price: 38000, tax_rate: 0, discount_percent: 0, line_total: 38000 },
      // Inv5: Fatima Noor - 1x Haier 32" LED
      { invoice_id: insertedInvoices[4].id, product_id: products[9].id, description: 'Haier 32" LED', quantity: 1, unit_price: 38000, tax_rate: 0, discount_percent: 0, line_total: 38000 },
      // Inv6: Rizwan Mobile Shop - 1x Infinix Note 40 Pro
      { invoice_id: insertedInvoices[5].id, product_id: products[3].id, description: 'Infinix Note 40 Pro 256GB', quantity: 1, unit_price: 55000, tax_rate: 0, discount_percent: 0, line_total: 55000 },
      // Inv7: Bilal Ahmed - 1x JBL Go 3
      { invoice_id: insertedInvoices[6].id, product_id: products[19].id, description: 'JBL Go 3 Speaker', quantity: 1, unit_price: 9500, tax_rate: 0, discount_percent: 0, line_total: 9500 },
      // Inv8: Malik General Store - 1x National WM 8kg
      { invoice_id: insertedInvoices[7].id, product_id: products[17].id, description: 'National Washing Machine 8kg', quantity: 1, unit_price: 42000, tax_rate: 0, discount_percent: 0, line_total: 42000 },
      // Inv9: Sadia Iqbal - 1x Dawlance AC
      { invoice_id: insertedInvoices[8].id, product_id: products[15].id, description: 'Dawlance Inverter AC 1.5 Ton', quantity: 1, unit_price: 185000, tax_rate: 0, discount_percent: 0, line_total: 185000 },
      // Inv10: Kashif Ali - 1x Samsung A35
      { invoice_id: insertedInvoices[9].id, product_id: products[1].id, description: 'Samsung Galaxy A35 128GB', quantity: 1, unit_price: 78000, tax_rate: 0, discount_percent: 0, line_total: 78000 },
    ];

    const { error: itemsError } = await supabase.from('invoice_items').upsert(items, { onConflict: 'id' });
    if (itemsError) console.error('Error seeding invoice items:', itemsError);
    else console.log(`✅ Seeded ${items.length} invoice items`);
  }

  // ============================================
  // SEED TRANSACTIONS
  // ============================================
  console.log('💰 Seeding transactions...');
  const bankId1 = bankAccounts?.[0]?.id;
  const bankId2 = bankAccounts?.[1]?.id;
  const bankId3 = bankAccounts?.[2]?.id;
  const catPurchase = expenseCategories?.[3]?.id;
  const catRent = expenseCategories?.[0]?.id;
  const catUtilities = expenseCategories?.[1]?.id;
  const catSalaries = expenseCategories?.[2]?.id;
  const catTransport = expenseCategories?.[4]?.id;

  const transactions = [
    // Income transactions
    { organization_id: orgId, type: 'income', amount: 104000, date: '2025-01-15', description: 'Payment from Ahmed Khan - INV-2025-0001', payment_method: 'bank_transfer', bank_account_id: bankId1, created_by: userId },
    { organization_id: orgId, type: 'income', amount: 156000, date: '2025-02-01', description: 'Payment from Usman Traders - INV-2025-0002', payment_method: 'bank_transfer', bank_account_id: bankId1, created_by: userId },
    { organization_id: orgId, type: 'income', amount: 45000, date: '2025-03-15', description: 'Partial payment from Zain Electronics - INV-2025-0003', payment_method: 'jazzcash', bank_account_id: bankId3, created_by: userId },
    { organization_id: orgId, type: 'income', amount: 55000, date: '2025-03-20', description: 'Payment from Rizwan Mobile Shop - INV-2025-0006', payment_method: 'cash', bank_account_id: bankId2, created_by: userId },
    { organization_id: orgId, type: 'income', amount: 42000, date: '2025-01-25', description: 'Payment from Malik General Store - INV-2025-0008', payment_method: 'cash', bank_account_id: bankId2, created_by: userId },
    { organization_id: orgId, type: 'income', amount: 78000, date: '2025-03-01', description: 'Payment from Kashif Ali - INV-2025-0010', payment_method: 'bank_transfer', bank_account_id: bankId1, created_by: userId },
    { organization_id: orgId, type: 'income', amount: 35000, date: '2025-04-02', description: 'Walk-in sale - 5x Tecno Spark 20', payment_method: 'cash', bank_account_id: bankId2, created_by: userId },
    { organization_id: orgId, type: 'income', amount: 28000, date: '2025-04-10', description: 'Walk-in sale - accessories', payment_method: 'cash', bank_account_id: bankId2, created_by: userId },
    { organization_id: orgId, type: 'income', amount: 65000, date: '2025-04-12', description: 'Walk-in sale - Samsung A15 + covers', payment_method: 'easypaisa', bank_account_id: bankId3, created_by: userId },
    // Expense transactions
    { organization_id: orgId, type: 'expense', category_id: catPurchase, amount: 460000, date: '2025-01-05', description: 'Stock purchase - Samsung mobile phones batch', payment_method: 'bank_transfer', bank_account_id: bankId1, created_by: userId },
    { organization_id: orgId, type: 'expense', category_id: catPurchase, amount: 185000, date: '2025-02-10', description: 'Stock purchase - LED TVs batch', payment_method: 'bank_transfer', bank_account_id: bankId1, created_by: userId },
    { organization_id: orgId, type: 'expense', category_id: catRent, amount: 60000, date: '2025-01-01', description: 'Shop rent - January 2025', payment_method: 'cash', bank_account_id: bankId2, created_by: userId },
    { organization_id: orgId, type: 'expense', category_id: catRent, amount: 60000, date: '2025-02-01', description: 'Shop rent - February 2025', payment_method: 'cash', bank_account_id: bankId2, created_by: userId },
    { organization_id: orgId, type: 'expense', category_id: catRent, amount: 60000, date: '2025-03-01', description: 'Shop rent - March 2025', payment_method: 'cash', bank_account_id: bankId2, created_by: userId },
    { organization_id: orgId, type: 'expense', category_id: catRent, amount: 60000, date: '2025-04-01', description: 'Shop rent - April 2025', payment_method: 'cash', bank_account_id: bankId2, created_by: userId },
    { organization_id: orgId, type: 'expense', category_id: catUtilities, amount: 18000, date: '2025-01-15', description: 'Electricity bill - January', payment_method: 'cash', bank_account_id: bankId2, created_by: userId },
    { organization_id: orgId, type: 'expense', category_id: catUtilities, amount: 22000, date: '2025-02-15', description: 'Electricity bill - February', payment_method: 'cash', bank_account_id: bankId2, created_by: userId },
    { organization_id: orgId, type: 'expense', category_id: catUtilities, amount: 25000, date: '2025-03-15', description: 'Electricity bill - March', payment_method: 'cash', bank_account_id: bankId2, created_by: userId },
    { organization_id: orgId, type: 'expense', category_id: catSalaries, amount: 80000, date: '2025-01-31', description: 'Staff salaries - January', payment_method: 'bank_transfer', bank_account_id: bankId1, created_by: userId },
    { organization_id: orgId, type: 'expense', category_id: catSalaries, amount: 80000, date: '2025-02-28', description: 'Staff salaries - February', payment_method: 'bank_transfer', bank_account_id: bankId1, created_by: userId },
    { organization_id: orgId, type: 'expense', category_id: catSalaries, amount: 80000, date: '2025-03-31', description: 'Staff salaries - March', payment_method: 'bank_transfer', bank_account_id: bankId1, created_by: userId },
    { organization_id: orgId, type: 'expense', category_id: catTransport, amount: 12000, date: '2025-02-20', description: 'Delivery charges - bulk order', payment_method: 'cash', bank_account_id: bankId2, created_by: userId },
    { organization_id: orgId, type: 'expense', category_id: catPurchase, amount: 320000, date: '2025-03-05', description: 'Stock purchase - accessories and chargers', payment_method: 'bank_transfer', bank_account_id: bankId1, created_by: userId },
    { organization_id: orgId, type: 'expense', category_id: catPurchase, amount: 275000, date: '2025-04-01', description: 'Stock purchase - home appliances', payment_method: 'bank_transfer', bank_account_id: bankId1, created_by: userId },
  ];

  const { data: insertedTxns, error: txnError } = await supabase
    .from('transactions')
    .upsert(transactions, { onConflict: 'id' })
    .select();

  if (txnError) console.error('Error seeding transactions:', txnError);
  else console.log(`✅ Seeded ${insertedTxns?.length} transactions`);

  // ============================================
  // SEED INVOICE SETTINGS
  // ============================================
  console.log('⚙️ Seeding invoice settings...');
  const { error: settingsError } = await supabase
    .from('invoice_settings')
    .upsert({
      organization_id: orgId,
      invoice_prefix: 'INV-',
      invoice_starting_number: 11,
      default_terms: 'Payment due within 30 days. Late payments subject to 2% monthly interest.',
      default_notes: 'Thank you for your business!',
      default_tax_rate: 0,
      payment_terms_days: 30,
      late_fee_percentage: 2,
    }, { onConflict: 'organization_id' });

  if (settingsError) console.error('Error seeding invoice settings:', settingsError);
  else console.log('✅ Seeded invoice settings');

  console.log('\n🎉 Seed complete! Malik Electronics & Trading data has been populated.');
  console.log(`   Organization: ${orgId}`);
  console.log(`   User: ${userId} (admin)`);
}

main().catch(err => {
  console.error('Fatal error:', err);
  process.exit(1);
});
