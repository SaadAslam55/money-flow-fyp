/**
 * Pakistani Localization Utilities
 * Formatting and validation for Pakistani market (PKR, CNIC, lakh/crore, phone)
 */

/**
 * Format number in Pakistani/South Asian numbering system (lakh, crore)
 * e.g., 12345678 → "1,23,45,678"
 */
export function formatPakistaniNumber(num: number): string {
  if (num === 0) return '0';

  const isNegative = num < 0;
  const absNum = Math.abs(num);
  const str = absNum.toString();

  // For numbers < 1000, no special formatting
  if (str.length <= 3) {
    return (isNegative ? '-' : '') + str;
  }

  // Last 3 digits
  const last3 = str.slice(-3);
  const rest = str.slice(0, -3);

  // Group remaining digits in pairs from right
  const grouped = rest.replace(/(\d)(?=(\d{2})+(?!\d))/g, '$1,');

  return (isNegative ? '-' : '') + grouped + ',' + last3;
}

/**
 * Format amount as PKR with lakh/crore notation
 * e.g., 1500000 → "₨ 15,00,000" or "PKR 15,00,000"
 */
export function formatPKR(amount: number, showSymbol: boolean = true): string {
  const formatted = formatPakistaniNumber(Math.round(amount));
  return showSymbol ? `₨ ${formatted}` : formatted;
}

/**
 * Convert number to words in Pakistani format (lakh, crore)
 * e.g., 1500000 → "Fifteen Lakh"
 * e.g., 50000000 → "Five Crore"
 */
export function numberToPakistaniWords(num: number): string {
  if (num === 0) return 'Zero';
  if (num < 0) return 'Minus ' + numberToPakistaniWords(-num);

  const units = ['', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine',
    'Ten', 'Eleven', 'Twelve', 'Thirteen', 'Fourteen', 'Fifteen', 'Sixteen', 'Seventeen',
    'Eighteen', 'Nineteen'];
  const tens = ['', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety'];

  if (num < 20) return units[num]!;
  if (num < 100) return tens[Math.floor(num / 10)]! + (num % 10 ? ' ' + units[num % 10]! : '');
  if (num < 1000) return units[Math.floor(num / 100)]! + ' Hundred' + (num % 100 ? ' ' + numberToPakistaniWords(num % 100) : '');
  if (num < 100000) return numberToPakistaniWords(Math.floor(num / 1000)) + ' Thousand' + (num % 1000 ? ' ' + numberToPakistaniWords(num % 1000) : '');
  if (num < 10000000) return numberToPakistaniWords(Math.floor(num / 100000)) + ' Lakh' + (num % 100000 ? ' ' + numberToPakistaniWords(num % 100000) : '');
  if (num < 1000000000) return numberToPakistaniWords(Math.floor(num / 10000000)) + ' Crore' + (num % 10000000 ? ' ' + numberToPakistaniWords(num % 10000000) : '');

  return num.toLocaleString('en-PK');
}

/**
 * Validate Pakistani CNIC number
 * Format: XXXXX-XXXXXXX-X (5-7-1 digits)
 */
export function validateCNIC(cnic: string): { valid: boolean; formatted: string; error?: string } {
  // Remove dashes and spaces
  const clean = cnic.replace(/[-\s]/g, '');

  if (!/^\d{13}$/.test(clean)) {
    return { valid: false, formatted: cnic, error: 'CNIC must be exactly 13 digits' };
  }

  // Format as XXXXX-XXXXXXX-X
  const formatted = `${clean.slice(0, 5)}-${clean.slice(5, 12)}-${clean.slice(12)}`;
  return { valid: true, formatted };
}

/**
 * Format CNIC for display
 * Adds dashes automatically as user types
 */
export function formatCNICInput(value: string): string {
  const digits = value.replace(/\D/g, '').slice(0, 13);
  if (digits.length <= 5) return digits;
  if (digits.length <= 12) return `${digits.slice(0, 5)}-${digits.slice(5)}`;
  return `${digits.slice(0, 5)}-${digits.slice(5, 12)}-${digits.slice(12)}`;
}

/**
 * Validate Pakistani mobile number
 * Format: 03XX-XXXXXXX (11 digits with leading 0)
 * International: +92 3XX-XXXXXXX
 */
export function validatePakistaniPhone(phone: string): { valid: boolean; formatted: string; error?: string } {
  const clean = phone.replace(/[-\s+]/g, '');

  // Check for +92 format
  let digits = clean;
  if (clean.startsWith('92') && clean.length === 12) {
    digits = '0' + clean.slice(2);
  }

  if (!/^0[3][0-9]{9}$/.test(digits)) {
    return { valid: false, formatted: phone, error: 'Enter a valid Pakistani mobile number (e.g., 0300-1234567)' };
  }

  const formatted = `${digits.slice(0, 4)}-${digits.slice(4)}`;
  return { valid: true, formatted };
}

/**
 * Calculate Pakistani sales tax (GST)
 * Standard rate: 17% (can vary by product category)
 */
export function calculatePakistaniTax(
  amount: number,
  taxRate: number = 17,
  isInclusive: boolean = false
): { taxableAmount: number; taxAmount: number; totalAmount: number } {
  if (isInclusive) {
    const taxableAmount = Math.round(amount / (1 + taxRate / 100) * 100) / 100;
    const taxAmount = amount - taxableAmount;
    return { taxableAmount, taxAmount, totalAmount: amount };
  }

  const taxAmount = Math.round(amount * taxRate / 100 * 100) / 100;
  const totalAmount = amount + taxAmount;
  return { taxableAmount: amount, taxAmount, totalAmount };
}

/**
 * Pakistani tax categories with their rates
 */
export const PAKISTANI_TAX_CATEGORIES = {
  standard: { rate: 17, label: 'Standard GST (17%)' },
  reduced: { rate: 10, label: 'Reduced Rate (10%)' },
  zero: { rate: 0, label: 'Zero Rated (0%)' },
  exempt: { rate: 0, label: 'Exempt' },
  telecom: { rate: 19.5, label: 'Telecom Services (19.5%)' },
  restaurant: { rate: 16, label: 'Restaurant/Accommodation (16%)' },
} as const;

export type PakistaniTaxCategory = keyof typeof PAKISTANI_TAX_CATEGORIES;
