// src/stores/cartStore.ts
/**
 * Shopping Cart Store
 *
 * Manages POS shopping cart functionality with item management, calculations, and persistence.
 * Production-ready with validation, error handling, and session storage.
 *
 * @module Stores/Cart
 */

import { logger } from '@/lib/logger';
import { create } from 'zustand';
import { persist, createJSONStorage, type PersistStorage } from 'zustand/middleware';
import type { Product } from '@/types/index';

// Constants
const MIN_QUANTITY = 0.01;
const MAX_QUANTITY = 999999;
const MIN_PRICE = 0;
const MAX_PRICE = 999999999;
const MIN_TAX_RATE = 0;
const MAX_TAX_RATE = 100;
const MAX_DISCOUNT_PERCENT = 100;

export interface CartItem {
  product: Product;
  quantity: number;
  unitPrice: number;
  taxRate: number;
  discount?: number;
  notes?: string;
}

interface CartState {
  // State
  items: CartItem[];
  customerId: string | null;
  paymentMethod: string | null;
  notes: string;
  isOpen: boolean;

  // Actions
  addItem: (item: CartItem) => void;
  updateItem: (productId: string, updates: Partial<CartItem>) => void;
  removeItem: (productId: string) => void;
  clearCart: () => void;
  setCustomer: (customerId: string | null) => void;
  setPaymentMethod: (method: string | null) => void;
  setNotes: (notes: string) => void;
  setOpen: (open: boolean) => void;

  // Calculations
  getSubtotal: () => number;
  getTaxAmount: () => number;
  getTotal: () => number;
  getItemCount: () => number;
  getItemQuantity: (productId: string) => number;
}

interface PersistedCartState {
  items: CartItem[];
  customerId: string | null;
  paymentMethod: string | null;
  notes: string;
  _version: number;
}

/**
 * Validates cart item structure
 */
function isValidCartItem(item: unknown): item is CartItem {
  if (!item || typeof item !== 'object') return false;
  const i = item as Partial<CartItem>;
  return (
    i.product !== undefined &&
    typeof i.quantity === 'number' &&
    typeof i.unitPrice === 'number' &&
    typeof i.taxRate === 'number' &&
    i.quantity >= MIN_QUANTITY &&
    i.quantity <= MAX_QUANTITY &&
    i.unitPrice >= MIN_PRICE &&
    i.unitPrice <= MAX_PRICE &&
    i.taxRate >= MIN_TAX_RATE &&
    i.taxRate <= MAX_TAX_RATE
  );
}

/**
 * Validates product structure
 */
function isValidProduct(product: unknown): product is Product {
  if (!product || typeof product !== 'object') return false;
  const p = product as Partial<Product>;
  return typeof p.id === 'string' && typeof p.name === 'string';
}

/**
 * Shopping cart store for POS functionality
 *
 * Features:
 * - Cart item management with validation
 * - Automatic calculations (subtotal, tax, total)
 * - Session storage (cleared on browser close)
 * - Customer and payment method tracking
 * - Quantity and price validation
 * - Type-safe operations
 */
export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      // Initial state
      items: [],
      customerId: null,
      paymentMethod: null,
      notes: '',
      isOpen: false,

      addItem: (item) => {
        if (!isValidCartItem(item)) {
          logger.error('Invalid cart item provided to addItem');
          return;
        }

        if (!isValidProduct(item.product)) {
          logger.error('Invalid product in cart item');
          return;
        }

        // Validate discount
        if (item.discount !== undefined) {
          const maxDiscount = (item.unitPrice * item.quantity * MAX_DISCOUNT_PERCENT) / 100;
          if (item.discount < 0 || item.discount > maxDiscount) {
            logger.error(`Invalid discount amount: ${item.discount}`);
            return;
          }
        }

        set((state) => {
          const existingIndex = state.items.findIndex((i) => i.product.id === item.product.id);

          if (existingIndex >= 0) {
            // Update quantity if item exists
            const updatedItems = [...state.items];
            const existingItem = updatedItems[existingIndex];
            if (!existingItem) return state;

            const newQuantity = existingItem.quantity + item.quantity;

            if (newQuantity > MAX_QUANTITY) {
              logger.warn(`Quantity exceeds maximum: ${MAX_QUANTITY}`);
              return state;
            }

            updatedItems[existingIndex] = {
              ...existingItem,
              quantity: newQuantity,
            };
            return { items: updatedItems };
          }

          // Add new item
          return { items: [...state.items, item] };
        });
      },

      updateItem: (productId, updates) => {
        if (!productId || typeof productId !== 'string') {
          logger.error('Invalid product ID provided to updateItem');
          return;
        }

        set((state) => {
          const itemIndex = state.items.findIndex((item) => item.product.id === productId);
          if (itemIndex === -1) {
            logger.warn(`Cart item with product ID ${productId} not found`);
            return state;
          }

          const item = state.items[itemIndex];
          if (!item) {
            logger.warn(`Cart item at index ${itemIndex} not found`);
            return state;
          }

          const updatedItem: CartItem = {
            product: updates.product || item.product,
            quantity: updates.quantity ?? item.quantity,
            unitPrice: updates.unitPrice ?? item.unitPrice,
            taxRate: updates.taxRate ?? item.taxRate,
            discount: updates.discount ?? item.discount,
            notes: updates.notes ?? item.notes,
          };

          // Validate updated item
          if (!isValidCartItem(updatedItem)) {
            logger.error('Invalid updates provided to updateItem');
            return state;
          }

          const updatedItems = [...state.items];
          updatedItems[itemIndex] = updatedItem;

          return { items: updatedItems };
        });
      },

      removeItem: (productId) => {
        if (!productId || typeof productId !== 'string') {
          logger.error('Invalid product ID provided to removeItem');
          return;
        }

        set((state) => ({
          items: state.items.filter((item) => item.product.id !== productId),
        }));
      },

      clearCart: () =>
        set({
          items: [],
          customerId: null,
          paymentMethod: null,
          notes: '',
          isOpen: false,
        }),

      setCustomer: (customerId) =>
        set({ customerId: customerId && typeof customerId === 'string' ? customerId : null }),

      setPaymentMethod: (method) =>
        set({ paymentMethod: method && typeof method === 'string' ? method : null }),

      setNotes: (notes) => set({ notes: typeof notes === 'string' ? notes : '' }),

      setOpen: (open) => set({ isOpen: Boolean(open) }),

      getSubtotal: () => {
        const { items } = get();
        return items.reduce((sum, item) => {
          const itemSubtotal = item.unitPrice * item.quantity;
          const discount = item.discount ?? 0;
          return sum + itemSubtotal - discount;
        }, 0);
      },

      getTaxAmount: () => {
        const { items } = get();
        return items.reduce((sum, item) => {
          const itemSubtotal = item.unitPrice * item.quantity;
          const discount = item.discount ?? 0;
          const taxableAmount = itemSubtotal - discount;
          return sum + taxableAmount * (item.taxRate / 100);
        }, 0);
      },

      getTotal: () => {
        const subtotal = get().getSubtotal();
        const tax = get().getTaxAmount();
        return Math.round((subtotal + tax) * 100) / 100; // Round to 2 decimal places
      },

      getItemCount: () => {
        return get().items.reduce((sum, item) => sum + item.quantity, 0);
      },

      getItemQuantity: (productId) => {
        const item = get().items.find((item) => item.product.id === productId);
        return item ? item.quantity : 0;
      },
    }),
    {
      name: 'cart-storage',
      storage: createJSONStorage(() => sessionStorage) as PersistStorage<PersistedCartState>,
      partialize: (state) => ({
        items: state.items.filter((item) => isValidCartItem(item)),
        customerId: state.customerId,
        paymentMethod: state.paymentMethod,
        notes: state.notes,
        _version: 1,
      }),
      version: 1,
      migrate: (persistedState: unknown, _version: number): PersistedCartState => {
        const state = persistedState as Partial<PersistedCartState>;
        return {
          items: state.items ? state.items.filter((item) => isValidCartItem(item)) : [],
          customerId:
            state.customerId && typeof state.customerId === 'string' ? state.customerId : null,
          paymentMethod:
            state.paymentMethod && typeof state.paymentMethod === 'string'
              ? state.paymentMethod
              : null,
          notes: state.notes && typeof state.notes === 'string' ? state.notes : '',
          _version: 1,
        };
      },
      skipHydration: false,
    }
  )
);
