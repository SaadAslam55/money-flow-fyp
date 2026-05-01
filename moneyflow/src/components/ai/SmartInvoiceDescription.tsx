// src/components/ai/SmartInvoiceDescription.tsx
/**
 * Smart Invoice Description Generator
 * AI-powered description suggestions for invoice line items
 */

import { useState, useEffect, useCallback } from 'react';
import { Sparkles, Wand2, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

interface SmartInvoiceDescriptionProps {
  productName: string;
  customerName?: string;
  quantity: number;
  onApply: (description: string) => void;
}

const DESCRIPTION_TEMPLATES: Record<string, string[]> = {
  default: [
    'Supply and delivery of {product} as per customer requirements',
    'Professional services for {product} - {qty} unit(s)',
    '{product} - supplied and installed per order',
    'Sale of {product} ({qty} units) to {customer}',
    'Supply of {product} as discussed and agreed',
  ],
  electronics: [
    'Brand new {product} with official warranty - {qty} unit(s)',
    '{product} - sealed pack, genuine product, supplied to {customer}',
    'Sale of {product} with standard manufacturer warranty',
    'Genuine {product} supplied with warranty card and accessories',
  ],
  service: [
    'Professional {product} services rendered for {customer}',
    '{product} service completed as per agreement',
    'Labor and materials for {product} - {qty} service(s)',
  ],
  repair: [
    'Repair and maintenance of {product} - parts and labor included',
    '{product} diagnostic and repair service completed',
    'Professional repair service for {product} with warranty',
  ],
};

function detectCategory(productName: string): string {
  const lower = productName.toLowerCase();
  if (/repair|fix|service|maintenance|install/i.test(lower)) return 'service';
  if (/phone|laptop|computer|tv|led|lcd|camera|electronic|pcb|board/i.test(lower)) return 'electronics';
  if (/repair/i.test(lower)) return 'repair';
  return 'default';
}

function generateDescription(product: string, customer: string, qty: number, category: string): string {
  const templates = DESCRIPTION_TEMPLATES[category] ?? DESCRIPTION_TEMPLATES.default;
  if (!templates || templates.length === 0) return `Supply of ${product}`;
  const template = templates[Math.floor(Math.random() * templates.length)] ?? templates[0];
  if (!template) return `Supply of ${product}`;
  return template
    .replace('{product}', product)
    .replace('{customer}', customer || 'valued customer')
    .replace('{qty}', String(qty));
}

export function SmartInvoiceDescription({
  productName,
  customerName,
  quantity,
  onApply,
}: SmartInvoiceDescriptionProps) {
  const [suggestion, setSuggestion] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);

  const generate = useCallback(() => {
    if (!productName) return;
    setIsGenerating(true);
    // Simulate slight delay for UX
    setTimeout(() => {
      const category = detectCategory(productName);
      const desc = generateDescription(productName, customerName || '', quantity, category);
      setSuggestion(desc);
      setIsGenerating(false);
    }, 300);
  }, [productName, customerName, quantity]);

  useEffect(() => {
    // Auto-generate when product name changes significantly
    if (productName && productName.length > 2 && !suggestion) {
      generate();
    }
  }, [productName]);

  if (!productName || productName.length < 2) return null;

  if (isGenerating) {
    return (
      <div className="flex items-center gap-2 text-xs text-indigo-600 dark:text-indigo-400">
        <Sparkles className="h-3 w-3 animate-pulse" />
        Generating description...
      </div>
    );
  }

  if (!suggestion) {
    return (
      <button
        type="button"
        onClick={generate}
        className="flex items-center gap-1.5 text-xs text-indigo-600 transition-colors hover:text-indigo-700 dark:text-indigo-400"
      >
        <Wand2 className="h-3 w-3" />
        Generate AI description
      </button>
    );
  }

  return (
    <div className="rounded-md border border-indigo-200 bg-indigo-50/50 px-3 py-2 text-xs dark:border-indigo-800 dark:bg-indigo-950/20">
      <div className="mb-1 flex items-center justify-between">
        <span className="flex items-center gap-1.5 font-medium text-indigo-700 dark:text-indigo-300">
          <Sparkles className="h-3 w-3" />
          AI Description
        </span>
        <button
          type="button"
          onClick={() => setSuggestion(null)}
          className="text-muted-foreground hover:text-foreground"
        >
          <X className="h-3 w-3" />
        </button>
      </div>
      <p className="mb-1.5 text-muted-foreground">{suggestion}</p>
      <div className="flex gap-2">
        <Button
          type="button"
          variant="outline"
          size="sm"
          className="h-6 text-[10px]"
          onClick={() => {
            onApply(suggestion);
            toast.success('Description applied');
          }}
        >
          Apply
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          className="h-6 text-[10px]"
          onClick={generate}
        >
          Regenerate
        </Button>
      </div>
    </div>
  );
}
