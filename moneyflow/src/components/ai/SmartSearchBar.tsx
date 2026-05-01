// src/components/ai/SmartSearchBar.tsx
/**
 * Natural Language Smart Search
 * Parses plain-English queries into structured filters
 * Examples:
 *   - "overdue invoices from last month"
 *   - "customers with outstanding balance over 5000"
 *   - "expenses for electricity this quarter"
 */

import { useState, useCallback, useRef, useEffect } from 'react';
import { Search, Sparkles, X, Loader2, Command, ArrowRight } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { useAIFeatures } from '@/hooks/useAIFeatures';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { useNLSearch, type ParsedQuery as HookParsedQuery } from '@/hooks/useAI';

export interface ParsedQuery {
  entity: 'invoices' | 'customers' | 'transactions' | 'products' | 'unknown';
  filters: {
    status?: string;
    dateRange?: 'today' | 'week' | 'month' | 'quarter' | 'year' | 'last_month' | 'last_quarter';
    amountMin?: number;
    amountMax?: number;
    category?: string;
    searchTerm?: string;
  };
  sort?: 'date_desc' | 'date_asc' | 'amount_desc' | 'amount_asc';
}

const ENTITY_PATTERNS = [
  { entity: 'invoices' as const, patterns: ['invoice', 'bill', 'receipt', 'payment due', 'unpaid'] },
  { entity: 'customers' as const, patterns: ['customer', 'client', 'buyer', 'party', 'debtor'] },
  { entity: 'transactions' as const, patterns: ['transaction', 'expense', 'income', 'spending', 'payment made', 'cash out'] },
  { entity: 'products' as const, patterns: ['product', 'item', 'stock', 'inventory', 'goods'] },
];

const STATUS_PATTERNS = [
  { status: 'overdue', patterns: ['overdue', 'past due', 'late', 'unpaid', 'pending payment'] },
  { status: 'paid', patterns: ['paid', 'settled', 'completed', 'received'] },
  { status: 'draft', patterns: ['draft', 'unpublished', 'pending'] },
  { status: 'sent', patterns: ['sent', 'emailed', 'dispatched'] },
];

const DATE_PATTERNS = [
  { range: 'today' as const, patterns: ['today', 'this day'] },
  { range: 'week' as const, patterns: ['this week', 'past week', 'last 7 days'] },
  { range: 'month' as const, patterns: ['this month', 'past month', 'last 30 days'] },
  { range: 'last_month' as const, patterns: ['last month', 'previous month'] },
  { range: 'quarter' as const, patterns: ['this quarter', 'past quarter', 'last 3 months'] },
  { range: 'last_quarter' as const, patterns: ['last quarter', 'previous quarter'] },
  { range: 'year' as const, patterns: ['this year', 'past year', 'last 12 months', 'annual'] },
];

const AMOUNT_PATTERNS = [
  { pattern: /over\s+(\d+(?:,\d{3})*)/i, type: 'min' as const },
  { pattern: /above\s+(\d+(?:,\d{3})*)/i, type: 'min' as const },
  { pattern: /more\s+than\s+(\d+(?:,\d{3})*)/i, type: 'min' as const },
  { pattern: /under\s+(\d+(?:,\d{3})*)/i, type: 'max' as const },
  { pattern: /below\s+(\d+(?:,\d{3})*)/i, type: 'max' as const },
  { pattern: /less\s+than\s+(\d+(?:,\d{3})*)/i, type: 'max' as const },
  { pattern: /between\s+(\d+(?:,\d{3})*)\s+and\s+(\d+(?:,\d{3})*)/i, type: 'range' as const },
];

const CATEGORY_PATTERNS = [
  { category: 'Utilities', patterns: ['electricity', 'water', 'gas', 'utility', 'bill', 'lesco', 'iesco'] },
  { category: 'Equipment', patterns: ['equipment', 'machine', 'hardware', 'laptop', 'computer'] },
  { category: 'Office Supplies', patterns: ['office', 'stationery', 'paper', 'pen', 'printer'] },
  { category: 'Marketing', patterns: ['marketing', 'advertising', 'ads', 'promotion', 'campaign'] },
  { category: 'Travel', patterns: ['travel', 'flight', 'hotel', 'transport', 'taxi', 'uber'] },
  { category: 'Rent', patterns: ['rent', 'lease', 'property'] },
  { category: 'Software', patterns: ['software', 'subscription', 'license', 'app', 'saas'] },
];

function parseNaturalLanguageQuery(raw: string): ParsedQuery {
  const lower = raw.toLowerCase();
  const result: ParsedQuery = { entity: 'unknown', filters: {} };

  // Detect entity
  for (const { entity, patterns } of ENTITY_PATTERNS) {
    if (patterns.some((p) => lower.includes(p))) {
      result.entity = entity;
      break;
    }
  }

  // Detect status
  for (const { status, patterns } of STATUS_PATTERNS) {
    if (patterns.some((p) => lower.includes(p))) {
      result.filters.status = status;
      break;
    }
  }

  // Detect date range
  for (const { range, patterns } of DATE_PATTERNS) {
    if (patterns.some((p) => lower.includes(p))) {
      result.filters.dateRange = range;
      break;
    }
  }

  // Detect amount filters
  for (const { pattern, type } of AMOUNT_PATTERNS) {
    const match = raw.match(pattern);
    if (match) {
      if (type === 'min' && match[1]) {
        result.filters.amountMin = parseInt(match[1].replace(/,/g, ''), 10);
      } else if (type === 'max' && match[1]) {
        result.filters.amountMax = parseInt(match[1].replace(/,/g, ''), 10);
      } else if (type === 'range' && match[1] && match[2]) {
        result.filters.amountMin = parseInt(match[1].replace(/,/g, ''), 10);
        result.filters.amountMax = parseInt(match[2].replace(/,/g, ''), 10);
      }
      break;
    }
  }

  // Detect category (for transactions/expenses)
  for (const { category, patterns } of CATEGORY_PATTERNS) {
    if (patterns.some((p) => lower.includes(p))) {
      result.filters.category = category;
      break;
    }
  }

  // Extract remaining as search term if no entity found
  if (result.entity === 'unknown') {
    result.filters.searchTerm = raw.trim();
  }

  // Default sort
  result.sort = 'date_desc';

  return result;
}

function getRouteFromQuery(query: ParsedQuery): string {
  switch (query.entity) {
    case 'invoices':
      return '/invoices';
    case 'customers':
      return '/customers';
    case 'transactions':
      return '/transactions';
    case 'products':
      return '/products';
    default:
      return '/search';
  }
}

function formatQueryDescription(query: ParsedQuery): string {
  const parts: string[] = [];
  if (query.filters.status) parts.push(`Status: ${query.filters.status}`);
  if (query.filters.dateRange) parts.push(`Date: ${query.filters.dateRange.replace('_', ' ')}`);
  if (query.filters.amountMin !== undefined && query.filters.amountMax !== undefined) {
    parts.push(`Amount: PKR ${query.filters.amountMin.toLocaleString()} - ${query.filters.amountMax.toLocaleString()}`);
  } else if (query.filters.amountMin !== undefined) {
    parts.push(`Amount: > PKR ${query.filters.amountMin.toLocaleString()}`);
  } else if (query.filters.amountMax !== undefined) {
    parts.push(`Amount: < PKR ${query.filters.amountMax.toLocaleString()}`);
  }
  if (query.filters.category) parts.push(`Category: ${query.filters.category}`);
  return parts.join(' · ');
}

interface SmartSearchBarProps {
  className?: string;
  placeholder?: string;
  onQueryParsed?: (query: ParsedQuery) => void;
}

export function SmartSearchBar({
  className,
  placeholder = 'Ask AI anything... "overdue invoices from last month"',
  onQueryParsed,
}: SmartSearchBarProps) {
  const [query, setQuery] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const [isParsing, setIsParsing] = useState(false);
  const [parsed, setParsed] = useState<ParsedQuery | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();
  const { isEnabled } = useAIFeatures();
  const isEnabled_flag = isEnabled('ai_business_insights');
  const { parseQuery } = useNLSearch();

  const handleParse = useCallback(async () => {
    if (!query.trim()) return;
    setIsParsing(true);
    // Try backend first (with artificial delay for UX), fallback to client-side
    const result = await parseQuery(query);
    setParsed(result as ParsedQuery);
    setIsParsing(false);
    setIsOpen(true);
    onQueryParsed?.(result as ParsedQuery);
  }, [query, onQueryParsed, parseQuery]);

  const handleSubmit = useCallback(async () => {
    if (!parsed) {
      await handleParse();
      return;
    }
    const route = getRouteFromQuery(parsed);
    toast.success(`Searching ${parsed.entity}...`);
    navigate(route);
    setIsOpen(false);
    setQuery('');
    setParsed(null);
  }, [parsed, handleParse, navigate]);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === 'Enter') {
        e.preventDefault();
        handleSubmit();
      } else if (e.key === 'Escape') {
        setIsOpen(false);
      } else if (e.key === 'k' && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        inputRef.current?.focus();
      }
    },
    [handleSubmit]
  );

  // Global keyboard shortcut
  useEffect(() => {
    if (!isEnabled_flag) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'k' && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        inputRef.current?.focus();
      }
    };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [isEnabled_flag]);

  if (!isEnabled_flag) return null;

  return (
    <div className={cn('relative', className)}>
      <div className="relative">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          ref={inputRef}
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            if (e.target.value.length > 3) {
              handleParse();
            } else {
              setParsed(null);
              setIsOpen(false);
            }
          }}
          onKeyDown={handleKeyDown}
          onFocus={() => parsed && setIsOpen(true)}
          placeholder={placeholder}
          className="pl-10 pr-20"
        />
        <div className="absolute right-2 top-1/2 flex -translate-y-1/2 items-center gap-1">
          {query && (
            <button
              onClick={() => {
                setQuery('');
                setParsed(null);
                setIsOpen(false);
              }}
              className="rounded p-1 hover:bg-muted"
            >
              <X className="h-3.5 w-3.5 text-muted-foreground" />
            </button>
          )}
          <Badge variant="secondary" className="hidden text-[10px] sm:inline-flex">
            <Command className="mr-1 h-3 w-3" />K
          </Badge>
        </div>
      </div>

      {/* Results dropdown */}
      {isOpen && parsed && (
        <div className="absolute z-50 mt-1 w-full rounded-md border bg-popover p-2 shadow-lg">
          <div className="mb-2 flex items-center gap-2 text-xs text-muted-foreground">
            <Sparkles className="h-3 w-3 text-indigo-500" />
            AI understood your query
          </div>

          <div className="mb-2 rounded-md bg-muted p-2">
            <div className="flex items-center gap-2">
              <Badge variant="secondary" className="text-[10px] capitalize">
                {parsed.entity}
              </Badge>
              <span className="text-xs text-muted-foreground">
                {formatQueryDescription(parsed)}
              </span>
            </div>
          </div>

          {isParsing ? (
            <div className="flex items-center justify-center py-3">
              <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
            </div>
          ) : (
            <Button
              size="sm"
              className="w-full text-xs"
              onClick={handleSubmit}
            >
              Search {parsed.entity}
              <ArrowRight className="ml-1 h-3 w-3" />
            </Button>
          )}
        </div>
      )}
    </div>
  );
}

export { parseNaturalLanguageQuery };
