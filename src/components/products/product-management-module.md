Product Management Module
📖 Overview
The Product Management Module provides complete inventory and service management with stock tracking, pricing controls, and category organization.
🎯 Module Objectives

Manage product and service catalog
Track inventory with real-time stock levels
Set pricing with automatic calculations
Organize products by categories
Generate SKUs automatically
Monitor low stock alerts
Import/export product data
Track stock movement history

👥 User Roles Involved
RoleAccess LevelPermissionsAdminFull AccessAll product operationsManagerFull AccessAll product operationsAccountantCreate/EditCreate, edit products, view stockCashierView OnlyView products, check stockCustomerView OnlyView public product catalog
🏗️ Architecture
Product Data Flow:
┌──────────────┐ ┌───────────────┐ ┌──────────────┐
│Product Form │────▶│ Price │────▶│ Database │
│ (Client) │ │ Calculation │ │ (Supabase) │
└──────────────┘ └───────────────┘ └──────────────┘
│ │ │
▼ ▼ ▼
Validation Profit Margin Product Record
SKU Generation Tax Calculation + Stock Level
Final Price + Movements
📁 File Structure
src/
├── components/products/
│ ├── ProductForm.tsx ✅ Product creation/edit form
│ ├── ProductList.tsx ✅ Product table/cards
│ ├── ProductDetail.tsx ⬜ Product detail view
│ ├── StockAdjustmentDialog.tsx ✅ Stock adjustment modal
│ ├── LowStockAlert.tsx ⬜ Low stock notification
│ ├── CategoryManager.tsx ⬜ Category management
│ └── ProductImport.tsx ⬜ CSV import dialog
│
├── pages/products/
│ ├── ProductsPage.tsx ✅ Main product list page
│ ├── CreateProductPage.tsx ⬜ New product page
│ ├── EditProductPage.tsx ⬜ Edit product page
│ └── ProductDetailPage.tsx ⬜ Product detail page
│
├── services/api/
│ └── productApi.ts ✅ Product CRUD + inventory
│
├── hooks/
│ ├── useProducts.ts ✅ Product state management
│ ├── useLowStockProducts.ts ✅ Low stock monitoring
│ └── useProductCategories.ts ✅ Category management
│
├── schemas/
│ └── productSchemas.ts ✅ Zod validation schemas
│
└── types/
└── product.types.ts ✅ TypeScript types
✅ Implementation Checklist
Phase 1: Core Setup ✅

Product types and interfaces
Validation schemas (Zod)
API service functions
React Query hooks
Price calculation utilities

Phase 2: Product Form ✅

Product/service selection
Automatic SKU generation
Price and cost inputs
Tax rate configuration
Profit margin calculator
Category selection
Inventory tracking toggle
Stock level inputs
Mobile-responsive design

Phase 3: Product List ✅

Filterable table view
Category filtering
Stock level filtering
Search functionality
Mobile card view
Low stock indicators

Phase 4: Inventory Management ✅

Stock adjustment dialog
Stock movement tracking
Reason categorization
Historical movements view
Automatic stock updates on sales
Low stock alerts

Phase 5: Import/Export ✅

CSV import functionality
CSV export functionality
Data validation on import
Duplicate detection
Bulk operations

Phase 6: Advanced Features ⬜

Product variants (size, color)
Product bundles
Barcode generation
Image gallery
Product reviews
Related products

🔑 Key Features

1. Automatic SKU Generation
   typescriptexport function generateSKU(productName: string, existingSKUs: string[] = []): string {
   const base = productName
   .toUpperCase()
   .replace(/[^A-Z0-9]/g, '')
   .substring(0, 6);

let counter = 1;
let sku = `${base}-${counter.toString().padStart(3, '0')}`;

while (existingSKUs.includes(sku)) {
counter++;
sku = `${base}-${counter.toString().padStart(3, '0')}`;
}

return sku;
} 2. Price Calculations
typescript// Calculate profit margin
const profitMargin = unitPrice && costPrice
? ((unitPrice - costPrice) / unitPrice) \* 100
: 0;

// Calculate price with tax
const priceWithTax = unitPrice \* (1 + taxRate / 100);

// Calculate markup percentage
const markup = costPrice > 0 ? ((unitPrice - costPrice) / costPrice) \* 100 : 0; 3. Stock Movement Tracking
sql-- Stock movements table
CREATE TABLE stock_movements (
id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
product_id UUID REFERENCES products(id) ON DELETE CASCADE,
adjustment INTEGER NOT NULL,
reason VARCHAR(100) NOT NULL,
notes TEXT,
previous_stock INTEGER NOT NULL,
new_stock INTEGER NOT NULL,
created_by UUID REFERENCES users(id),
created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Function to adjust stock
CREATE OR REPLACE FUNCTION adjust_stock(
product_uuid UUID,
adjustment_amount INTEGER,
reason_text TEXT,
notes_text TEXT DEFAULT NULL
) RETURNS VOID AS $$
DECLARE
current_stock_value INTEGER;
new_stock_value INTEGER;
user_uuid UUID;
BEGIN
-- Get current stock
SELECT current_stock INTO current_stock_value
FROM products
WHERE id = product_uuid AND track_inventory = true;

IF NOT FOUND THEN
RAISE EXCEPTION 'Product not found or inventory tracking disabled';
END IF;

new_stock_value := current_stock_value + adjustment_amount;

IF new_stock_value < 0 THEN
RAISE EXCEPTION 'Stock cannot be negative';
END IF;

-- Get current user
SELECT id INTO user_uuid FROM users WHERE auth_user_id = auth.uid() LIMIT 1;

-- Update stock
UPDATE products SET current_stock = new_stock_value WHERE id = product_uuid;

-- Log movement
INSERT INTO stock_movements (
product_id, adjustment, reason, notes, previous_stock, new_stock, created_by
) VALUES (
product_uuid, adjustment_amount, reason_text, notes_text,
current_stock_value, new_stock_value, user_uuid
);
END;

$$
LANGUAGE plpgsql SECURITY DEFINER;
4. Low Stock Monitoring
typescriptexport function useLowStockProducts() {
  const { organization } = useAuth();

  const query = useQuery({
    queryKey: ['low-stock-products', organization?.id],
    queryFn: () => getLowStockProducts(organization!.id),
    enabled: !!organization?.id,
    staleTime: 60000,
    refetchInterval: 300000, // Refetch every 5 minutes
  });

  return {
    products: query.data?.data || [],
    isLoading: query.isLoading,
    error: query.error,
  };
}

// API function
export async function getLowStockProducts(organizationId: string) {
  const { data, error } = await supabase
    .from('products')
    .select('*')
    .eq('organization_id', organizationId)
    .eq('is_active', true)
    .eq('track_inventory', true)
    .lte('current_stock', 'minimum_stock')
    .order('current_stock', { ascending: true });

  if (error) throw error;
  return { data: data as Product[], error: null };
}
📊 Database Schema
sql-- Products table
CREATE TABLE products (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  sku VARCHAR(100),
  category VARCHAR(100),
  unit_price DECIMAL(15,2) NOT NULL CHECK (unit_price >= 0),
  cost_price DECIMAL(15,2) CHECK (cost_price IS NULL OR cost_price >= 0),
  tax_rate DECIMAL(5,2) DEFAULT 0 CHECK (tax_rate >= 0 AND tax_rate <= 100),
  is_service BOOLEAN DEFAULT false,
  track_inventory BOOLEAN DEFAULT true,
  current_stock INTEGER DEFAULT 0 CHECK (current_stock >= 0),
  minimum_stock INTEGER DEFAULT 0 CHECK (minimum_stock >= 0),
  image_url TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),

  CONSTRAINT products_unique_sku UNIQUE (organization_id, sku)
);

-- Indexes
CREATE INDEX idx_products_organization ON products(organization_id);
CREATE INDEX idx_products_sku ON products(organization_id, sku);
CREATE INDEX idx_products_category ON products(organization_id, category);
CREATE INDEX idx_products_active ON products(organization_id, is_active) WHERE is_active = true;
CREATE INDEX idx_products_low_stock ON products(organization_id)
  WHERE track_inventory = true AND current_stock <= minimum_stock;

-- Stock movements table
CREATE TABLE stock_movements (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  adjustment INTEGER NOT NULL,
  reason VARCHAR(100) NOT NULL,
  notes TEXT,
  previous_stock INTEGER NOT NULL,
  new_stock INTEGER NOT NULL,
  created_by UUID NOT NULL REFERENCES users(id),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_stock_movements_product ON stock_movements(product_id, created_at DESC);
🔄 State Management
typescript// React Query hooks
export function useProducts(filters?: ProductFilters) {
  const { organization } = useAuth();

  return useQuery({
    queryKey: ['products', organization?.id, filters],
    queryFn: () => getProducts(organization!.id, filters),
    enabled: !!organization?.id,
    staleTime: 30000,
  });
}

// Mutations
const createMutation = useMutation({
  mutationFn: (data: ProductFormData) =>
    createProduct(data, organization!.id),
  onSuccess: () => {
    queryClient.invalidateQueries(['products']);
    queryClient.invalidateQueries(['dashboard-stats']);
    toast.success('Product created successfully');
  },
});

const adjustStockMutation = useMutation({
  mutationFn: (data: StockAdjustmentFormData) =>
    adjustStock(data.product_id, data.adjustment, data.reason, data.notes),
  onSuccess: () => {
    queryClient.invalidateQueries(['products']);
    queryClient.invalidateQueries(['product']);
    toast.success('Stock adjusted successfully');
  },
});
🧪 Testing
typescript// Test product creation
test('should create product with auto-generated SKU', async () => {
  const productData = {
    name: 'Test Product',
    unit_price: 100,
    cost_price: 60,
    tax_rate: 17,
  };

  const { data } = await createProduct(productData, organizationId);

  expect(data).toBeDefined();
  expect(data.sku).toMatch(/^TEST-\d{3}$/);
  expect(data.is_active).toBe(true);
});

// Test stock adjustment
test('should adjust stock and create movement record', async () => {
  const product = await createTestProduct({ current_stock: 100 });

  await adjustStock(product.id, -20, 'sale', 'Sold to customer');

  const updated = await getProduct(product.id);
  expect(updated.current_stock).toBe(80);
  expect(updated.stock_movements).toHaveLength(1);
  expect(updated.stock_movements[0].reason).toBe('sale');
});

// Test low stock detection
test('should identify low stock products', async () => {
  await createTestProduct({
    current_stock: 5,
    minimum_stock: 10
  });

  const { data: lowStock } = await getLowStockProducts(organizationId);

  expect(lowStock.length).toBeGreaterThan(0);
  expect(lowStock[0].current_stock).toBeLessThanOrEqual(lowStock[0].minimum_stock);
});
🐛 Common Issues & Solutions
Issue: Negative stock allowed
Solution: Database constraint + application validation:
sqlALTER TABLE products ADD CONSTRAINT check_positive_stock
CHECK (current_stock >= 0);
Issue: SKU conflicts on import
Solution: Check existing SKUs before batch insert:
typescriptconst existingSKUs = new Set(
  (await getProducts(organizationId))
    .data?.map(p => p.sku)
    .filter(Boolean)
);

validProducts.forEach(product => {
  while (existingSKUs.has(product.sku)) {
    product.sku = generateSKU(product.name, Array.from(existingSKUs));
  }
  existingSKUs.add(product.sku);
});
Issue: Stock not updating on invoice deletion
Solution: Use database triggers or manual restoration:
typescriptexport async function deleteInvoice(invoiceId: string) {
  const { data: invoice } = await getInvoice(invoiceId);

  // Restore stock for each item
  for (const item of invoice.items) {
    if (item.product_id) {
      await adjustStock(
        item.product_id,
        item.quantity, // Positive adjustment to restore
        'invoice_deleted',
        `Restoring stock from deleted invoice ${invoice.invoice_number}`
      );
    }
  }

  await supabase.from('invoices').delete().eq('id', invoiceId);
}
```

## 📚 Related Documentation

- [Inventory Tracking Guide](../guides/inventory-tracking.md)
- [Pricing Strategies](../guides/pricing-strategies.md)
- [Import/Export Data](../guides/import-export.md)

---
$$
