// src/lib/calculations.ts
/**
 * Business Calculations Library
 * Financial and business calculation utilities
 */

/**
 * Calculate tax amount
 * 
 * @param amount - Base amount
 * @param taxRate - Tax rate as percentage (e.g., 17 for 17%)
 * @param isInclusive - Whether tax is included in the amount (default: false)
 * @returns Tax amount
 * 
 * @example
 * ```ts
 * calculateTax(1000, 17) // Returns 170 (17% of 1000)
 * calculateTax(1170, 17, true) // Returns 170 (17% inclusive)
 * ```
 */
export function calculateTax(amount: number, taxRate: number, isInclusive = false): number {
  if (amount < 0 || taxRate < 0) {
    return 0;
  }

  if (isInclusive) {
    // Tax is included in the amount
    // Formula: tax = amount - (amount / (1 + taxRate/100))
    return amount - amount / (1 + taxRate / 100);
  }

  // Tax is added to the amount
  return (amount * taxRate) / 100;
}

/**
 * Calculate discount amount
 * 
 * @param amount - Base amount
 * @param discountRate - Discount rate as percentage (e.g., 10 for 10%)
 * @param discountType - 'percentage' or 'fixed'
 * @returns Discount amount
 * 
 * @example
 * ```ts
 * calculateDiscount(1000, 10, 'percentage') // Returns 100 (10% of 1000)
 * calculateDiscount(1000, 50, 'fixed') // Returns 50
 * ```
 */
export function calculateDiscount(
  amount: number,
  discountRate: number,
  discountType: 'percentage' | 'fixed' = 'percentage'
): number {
  if (amount < 0 || discountRate < 0) {
    return 0;
  }

  if (discountType === 'fixed') {
    return Math.min(discountRate, amount);
  }

  // Percentage discount
  const discount = (amount * discountRate) / 100;
  return Math.min(discount, amount);
}

/**
 * Calculate subtotal (amount before tax and discount)
 * 
 * @param lineItems - Array of line items with quantity and unit price
 * @returns Subtotal amount
 * 
 * @example
 * ```ts
 * const items = [
 *   { quantity: 2, unit_price: 100 },
 *   { quantity: 1, unit_price: 50 }
 * ];
 * calculateSubtotal(items) // Returns 250
 * ```
 */
export function calculateSubtotal(
  lineItems: Array<{ quantity: number; unit_price: number }>
): number {
  return lineItems.reduce((sum, item) => {
    const itemTotal = item.quantity * item.unit_price;
    return sum + itemTotal;
  }, 0);
}

/**
 * Calculate invoice total
 * 
 * @param subtotal - Subtotal amount
 * @param taxRate - Tax rate as percentage
 * @param discountRate - Discount rate
 * @param discountType - 'percentage' or 'fixed'
 * @param taxInclusive - Whether tax is included in subtotal
 * @returns Total amount
 * 
 * @example
 * ```ts
 * calculateTotal(1000, 17, 10, 'percentage') // Returns 1053 (1000 - 100 + 153)
 * ```
 */
export function calculateTotal(
  subtotal: number,
  taxRate: number = 0,
  discountRate: number = 0,
  discountType: 'percentage' | 'fixed' = 'percentage',
  taxInclusive: boolean = false
): number {
  // Apply discount first
  const discount = calculateDiscount(subtotal, discountRate, discountType);
  const amountAfterDiscount = subtotal - discount;

  // Calculate tax
  const tax = calculateTax(amountAfterDiscount, taxRate, taxInclusive);

  if (taxInclusive) {
    // Tax is already included, just return the amount after discount
    return amountAfterDiscount;
  }

  // Add tax to amount after discount
  return amountAfterDiscount + tax;
}

/**
 * Calculate profit margin
 * 
 * @param revenue - Revenue amount
 * @param cost - Cost amount
 * @returns Profit margin as percentage
 * 
 * @example
 * ```ts
 * calculateProfitMargin(1000, 700) // Returns 30 (30% margin)
 * ```
 */
export function calculateProfitMargin(revenue: number, cost: number): number {
  if (revenue === 0) {
    return 0;
  }

  const profit = revenue - cost;
  return (profit / revenue) * 100;
}

/**
 * Calculate profit amount
 * 
 * @param revenue - Revenue amount
 * @param cost - Cost amount
 * @returns Profit amount
 */
export function calculateProfit(revenue: number, cost: number): number {
  return Math.max(0, revenue - cost);
}

/**
 * Calculate percentage change
 * 
 * @param oldValue - Previous value
 * @param newValue - New value
 * @returns Percentage change
 * 
 * @example
 * ```ts
 * calculatePercentageChange(100, 120) // Returns 20 (20% increase)
 * calculatePercentageChange(100, 80) // Returns -20 (20% decrease)
 * ```
 */
export function calculatePercentageChange(oldValue: number, newValue: number): number {
  if (oldValue === 0) {
    return newValue === 0 ? 0 : 100;
  }

  return ((newValue - oldValue) / oldValue) * 100;
}

/**
 * Calculate compound interest
 * 
 * @param principal - Initial amount
 * @param rate - Interest rate as percentage per period
 * @param periods - Number of periods
 * @returns Final amount
 * 
 * @example
 * ```ts
 * calculateCompoundInterest(1000, 5, 12) // Returns amount after 12 periods at 5% per period
 * ```
 */
export function calculateCompoundInterest(
  principal: number,
  rate: number,
  periods: number
): number {
  if (principal <= 0 || rate < 0 || periods < 0) {
    return 0;
  }

  return principal * Math.pow(1 + rate / 100, periods);
}

/**
 * Calculate simple interest
 * 
 * @param principal - Initial amount
 * @param rate - Interest rate as percentage
 * @param time - Time period (in years or as specified)
 * @returns Interest amount
 */
export function calculateSimpleInterest(principal: number, rate: number, time: number): number {
  if (principal <= 0 || rate < 0 || time < 0) {
    return 0;
  }

  return (principal * rate * time) / 100;
}

/**
 * Calculate payment amount for installment
 * 
 * @param principal - Loan/principal amount
 * @param rate - Interest rate as percentage per period
 * @param periods - Number of payment periods
 * @returns Payment amount per period
 * 
 * @example
 * ```ts
 * calculateInstallmentPayment(10000, 1, 12) // Monthly payment for 12 months at 1% per month
 * ```
 */
export function calculateInstallmentPayment(
  principal: number,
  rate: number,
  periods: number
): number {
  if (principal <= 0 || rate < 0 || periods <= 0) {
    return 0;
  }

  if (rate === 0) {
    return principal / periods;
  }

  const monthlyRate = rate / 100;
  const payment =
    (principal * monthlyRate * Math.pow(1 + monthlyRate, periods)) /
    (Math.pow(1 + monthlyRate, periods) - 1);

  return payment;
}

/**
 * Round to specified decimal places
 * 
 * @param value - Value to round
 * @param decimals - Number of decimal places (default: 2)
 * @returns Rounded value
 */
export function roundTo(value: number, decimals: number = 2): number {
  const factor = Math.pow(10, decimals);
  return Math.round(value * factor) / factor;
}

/**
 * Calculate average
 * 
 * @param values - Array of numbers
 * @returns Average value
 */
export function calculateAverage(values: number[]): number {
  if (values.length === 0) {
    return 0;
  }

  const sum = values.reduce((acc, val) => acc + val, 0);
  return sum / values.length;
}

/**
 * Calculate sum
 * 
 * @param values - Array of numbers
 * @returns Sum of values
 */
export function calculateSum(values: number[]): number {
  return values.reduce((acc, val) => acc + val, 0);
}

/**
 * Calculate minimum value
 * 
 * @param values - Array of numbers
 * @returns Minimum value
 */
export function calculateMin(values: number[]): number {
  if (values.length === 0) {
    return 0;
  }

  return Math.min(...values);
}

/**
 * Calculate maximum value
 * 
 * @param values - Array of numbers
 * @returns Maximum value
 */
export function calculateMax(values: number[]): number {
  if (values.length === 0) {
    return 0;
  }

  return Math.max(...values);
}

