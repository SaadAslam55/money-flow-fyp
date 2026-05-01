# Supabase TypeScript Integration Guide

This guide explains how to properly structure your Database interface for Supabase TypeScript client and avoid common 'never' type errors.

## 🎯 The Problem

You were getting 'never' type errors when using Supabase operations like `.update()`, `.insert()`, etc. This happens when the Database interface isn't properly structured for the Supabase TypeScript client.

## ✅ The Correct Structure

### 1. Database Interface Pattern

```typescript
export interface Database {
  public: {
    Tables: {
      table_name: {
        Row: YourTableType;        // Complete row type
        Insert: InsertType;        // Fields needed for insert
        Update: UpdateType;        // Fields allowed for update
        Relationships: [];         // Foreign key relationships
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: {
      your_enum: YourEnumType;
    };
    CompositeTypes: Record<string, never>;
  };
}
```

### 2. Insert Type Pattern

For INSERT operations, you typically want to omit auto-generated fields:

```typescript
// ❌ WRONG - Using Partial makes everything optional
Insert: Partial<YourTableType>;

// ✅ CORRECT - Omit auto-generated fields
Insert: Omit<YourTableType, 'id' | 'created_at' | 'updated_at'>;

// For tables without id or timestamps
Insert: Omit<YourTableType, 'created_at' | 'updated_at'>;
```

### 3. Update Type Pattern

For UPDATE operations, most fields should be optional:

```typescript
// ✅ CORRECT - Partial with specific omissions
Update: Partial<Omit<YourTableType, 'id' | 'created_at'>> & { id?: string };

// For tables with different primary keys
Update: Partial<Omit<YourTableType, 'organization_id' | 'created_at'>>;
```

### 4. Helper Types

We've created helper types that work with different table structures:

```typescript
/**
 * Smart Insert type that handles different table structures
 */
export type Insert<T> = T extends { id: string; created_at: string; updated_at: string }
  ? Omit<T, 'id' | 'created_at' | 'updated_at'>
  : T extends { id: string; created_at: string }
  ? Omit<T, 'id' | 'created_at'>
  : T extends { created_at: string; updated_at: string }
  ? Omit<T, 'created_at' | 'updated_at'>
  : T extends { created_at: string }
  ? Omit<T, 'created_at'>
  : Omit<T, never>;

/**
 * Smart Update type that handles different primary key patterns
 */
export type Update<T> = T extends { id: string }
  ? Partial<Omit<T, 'id' | 'created_at'>> & { id?: string }
  : T extends { organization_id: string }
  ? Partial<Omit<T, 'organization_id' | 'created_at'>> & { organization_id?: string }
  : T extends { user_id: string }
  ? Partial<Omit<T, 'user_id' | 'created_at'>> & { user_id?: string }
  : Partial<Omit<T, 'created_at'>>;
```

## 🔧 Usage Examples

### Basic Operations

```typescript
// ✅ Insert - TypeScript knows what fields are required
const { data, error } = await supabase
  .from('invoices')
  .insert({
    organization_id: 'uuid',
    customer_id: 'uuid',
    invoice_number: 'INV-001',
    total_amount: 100.00,
    // id, created_at, updated_at are automatically handled
  });

// ✅ Update - TypeScript knows what fields can be updated
const { data, error } = await supabase
  .from('invoices')
  .update({
    status: 'paid',
    amount_paid: 100.00,
    // Only allowed fields can be updated
  })
  .eq('id', invoiceId);

// ✅ Select with proper typing
const { data, error } = await supabase
  .from('invoices')
  .select('*')
  .returns<Invoice[]>(); // Full type safety
```

### Complex Queries with Relations

```typescript
// ✅ Select with relations
const { data, error } = await supabase
  .from('invoices')
  .select(`
    *,
    customer:customers(*),
    items:invoice_items(*)
  `)
  .returns<(Invoice & {
    customer: Customer;
    items: InvoiceItem[];
  })[]>();
```

## ❌ Common Pitfalls

### 1. Using Partial for Insert Types

```typescript
// ❌ WRONG - Makes all fields optional
Tables: {
  invoices: {
    Row: Invoice;
    Insert: Partial<Invoice>; // This causes 'never' types
    Update: Partial<Invoice>;
  };
}

// ✅ CORRECT
Tables: {
  invoices: {
    Row: Invoice;
    Insert: Omit<Invoice, 'id' | 'created_at' | 'updated_at'>;
    Update: Partial<Omit<Invoice, 'id' | 'created_at'>> & { id?: string };
  };
}
```

### 2. Incorrect Supabase Client Setup

```typescript
// ❌ WRONG - No type parameter
const supabase = createClient(url, key);

// ✅ CORRECT - With Database type
const supabase = createClient<Database>(url, key);
```

### 3. Missing Type Assertion for Complex Updates

```typescript
// ❌ WRONG - TypeScript can't infer complex types
await supabase
  .from('invoices')
  .update({
    status: 'paid',
    custom_field: 'value'
  });

// ✅ CORRECT - Use type assertion for complex cases
await supabase
  .from('invoices')
  .update({
    status: 'paid',
    custom_field: 'value'
  } as Database['public']['Tables']['invoices']['Update']);
```

### 4. Not Handling Enum Types

```typescript
// ❌ WRONG - Using string literals
status: 'paid' | 'pending' | 'cancelled'

// ✅ CORRECT - Using database enums
status: Database['public']['Enums']['invoice_status']
```

## 🚀 Best Practices

### 1. Auto-generate Types from Database

```bash
# Generate types from your Supabase database
npx supabase gen types typescript --project-id your-project-id > src/types/database.types.ts
```

### 2. Use Type-safe Wrappers

```typescript
// Create type-safe wrapper functions
export const createInvoice = async (invoice: Database['public']['Tables']['invoices']['Insert']) => {
  return await supabase.from('invoices').insert(invoice);
};

export const updateInvoice = async (
  id: string, 
  updates: Database['public']['Tables']['invoices']['Update']
) => {
  return await supabase.from('invoices').update(updates).eq('id', id);
};
```

### 3. Use Branded Types for IDs

```typescript
// Create branded types for better type safety
type InvoiceId = string & { readonly brand: unique symbol };
type CustomerId = string & { readonly brand: unique symbol };

interface Invoice {
  id: InvoiceId;
  customer_id: CustomerId;
  // ... other fields
}
```

### 4. Validate Environment Variables

```typescript
// Validate Supabase config at startup
if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

try {
  new URL(supabaseUrl);
} catch {
  throw new Error('Invalid VITE_SUPABASE_URL format');
}
```

## 🔍 Debugging 'never' Types

If you're still getting 'never' types:

1. **Check your Database interface structure** - Make sure Insert/Update types are properly defined
2. **Verify your Supabase client setup** - Ensure you're using `createClient<Database>()`
3. **Look at the specific error** - TypeScript will tell you which operation is failing
4. **Use type assertions as a last resort** - `as any` or proper type assertions

## 📚 Additional Resources

- [Supabase TypeScript Guide](https://supabase.com/docs/guides/api/generating-types)
- [TypeScript Utility Types](https://www.typescriptlang.org/docs/handbook/utility-types.html)
- [Supabase JavaScript Client Docs](https://supabase.com/docs/reference/javascript)

## 🎉 Your Fixed Implementation

With the changes we made to your `database.types.ts`, you should now have:

✅ Proper Insert/Update types for all tables  
✅ Smart helper types that adapt to different table structures  
✅ Type-safe Supabase operations  
✅ No more 'never' type errors  

Your Supabase operations should now work with full type safety and IntelliSense support!