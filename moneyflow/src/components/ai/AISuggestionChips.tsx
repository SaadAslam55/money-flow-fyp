// src/components/ai/AISuggestionChips.tsx
/**
 * AI Product Suggestion Chips
 * Shows frequently ordered products for a selected customer
 */

import { Sparkles, Plus, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useProductSuggestions } from '@/hooks/useAI';
import { useAIFeatures } from '@/hooks/useAIFeatures';
import type { Product } from '@/types/database.types';

interface AISuggestionChipsProps {
  customerId: string | undefined;
  onSelectProduct: (product: Product) => void;
  existingProductIds: string[];
}

export function AISuggestionChips({
  customerId,
  onSelectProduct,
  existingProductIds,
}: AISuggestionChipsProps) {
  const { isEnabled } = useAIFeatures();
  const { data: suggestions, isLoading } = useProductSuggestions(customerId);

  if (!isEnabled('ai_product_suggestions')) return null;
  if (!customerId || (!isLoading && (!suggestions || suggestions.length === 0))) {
    return null;
  }

  const filtered = suggestions?.filter(
    (s) => !existingProductIds.includes(s.id.replace('suggestion-', ''))
  );

  if (!filtered || filtered.length === 0) return null;

  return (
    <div className="rounded-lg border border-indigo-100 bg-indigo-50/50 p-3 dark:border-indigo-900/30 dark:bg-indigo-950/20">
      <div className="mb-2 flex items-center gap-2">
        <Sparkles className="h-3.5 w-3.5 text-indigo-500" />
        <span className="text-xs font-medium text-indigo-700 dark:text-indigo-300">
          Frequently Ordered
        </span>
        {isLoading && <Loader2 className="h-3 w-3 animate-spin text-indigo-400" />}
      </div>
      <div className="flex flex-wrap gap-2">
        {filtered.slice(0, 5).map((suggestion) => (
          <Button
            key={suggestion.id}
            type="button"
            variant="outline"
            size="sm"
            className="h-auto border-indigo-200 bg-white py-1 text-xs hover:bg-indigo-100 dark:border-indigo-800 dark:bg-black/30 dark:hover:bg-indigo-900/40"
            onClick={() => {
              // Create a minimal product object from suggestion
                          const product: Product = {
                id: suggestion.id.replace('suggestion-', ''),
                name: String(suggestion.value),
                unit_price: (suggestion as any).suggestedPrice ?? 0,
                cost_price: null,
                tax_rate: 17,
                sku: null,
                description: null,
                barcode: null,
                category: null,
                is_service: false,
                current_stock: 0,
                minimum_stock: 0,
                maximum_stock: null,
                track_inventory: false,
                image_url: null,
                is_active: true,
                organization_id: '',
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString(),
              };
              onSelectProduct(product);
            }}
          >
            <Plus className="mr-1 h-3 w-3" />
            {String(suggestion.value)}
            <Badge
              variant="secondary"
              className="ml-1 h-auto px-1 py-0 text-[10px]"
            >
              {Math.round(suggestion.confidence * 100)}%
            </Badge>
          </Button>
        ))}
      </div>
    </div>
  );
}
