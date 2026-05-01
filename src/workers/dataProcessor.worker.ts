// src/workers/dataProcessor.worker.ts
/**
 * Data Processor Web Worker
 *
 * Handles heavy data processing operations off the main thread to prevent UI blocking.
 * Useful for large dataset transformations, report calculations, and complex aggregations.
 *
 * @module Workers/DataProcessor
 *
 * @example
 * ```typescript
 * const worker = new Worker(
 *   new URL('./dataProcessor.worker.ts', import.meta.url),
 *   { type: 'module' }
 * );
 *
 * worker.postMessage({
 *   type: 'processReport',
 *   payload: { reportData, filters }
 * });
 *
 * worker.onmessage = (e) => {
 *   const { data, error } = e.data;
 *   // Handle result
 * };
 * ```
 */

// ============================================================================
// Type Definitions
// ============================================================================

export interface WorkerMessage<T = unknown> {
  id: string;
  type: WorkerMessageType;
  payload: T;
}

export type WorkerMessageType =
  | 'processReport'
  | 'aggregateData'
  | 'filterData'
  | 'sortData'
  | 'calculateTotals'
  | 'transformData'
  | 'processCSV'
  | 'generateChartData';

export interface WorkerResponse<T = unknown> {
  id: string;
  success: boolean;
  data?: T;
  error?: string;
  processingTime?: number;
}

interface ProcessReportPayload {
  reportType: 'profit_loss' | 'balance_sheet' | 'cash_flow' | 'sales' | 'expenses';
  data: unknown[];
  filters?: Record<string, unknown>;
  dateRange?: { start: string; end: string };
}

interface AggregateDataPayload {
  data: unknown[];
  groupBy: string | string[];
  aggregations: Array<{
    field: string;
    operation: 'sum' | 'avg' | 'min' | 'max' | 'count';
  }>;
}

interface FilterDataPayload {
  data: unknown[];
  filters: Array<{
    field: string;
    operator: 'equals' | 'contains' | 'greaterThan' | 'lessThan' | 'between' | 'in';
    value: unknown;
  }>;
}

interface SortDataPayload {
  data: unknown[];
  sortBy: string | Array<{ field: string; direction: 'asc' | 'desc' }>;
}

interface CalculateTotalsPayload {
  data: Array<{ amount: number; [key: string]: unknown }>;
  groupBy?: string;
}

interface TransformDataPayload {
  data: unknown[];
  transformations: Array<{
    type: 'map' | 'filter' | 'reduce' | 'group';
    operation: (item: unknown) => unknown;
  }>;
}

// ============================================================================
// Worker Implementation
// ============================================================================

/**
 * Process report data with aggregations and calculations
 */
function processReport(payload: ProcessReportPayload): unknown {
  const { reportType, data, filters, dateRange } = payload;

  try {
    switch (reportType) {
      case 'profit_loss':
        return processProfitLossReport(data as Array<Record<string, unknown>>, dateRange);
      case 'sales':
        return processSalesReport(data as Array<Record<string, unknown>>, filters);
      case 'expenses':
        return processExpenseReport(data as Array<Record<string, unknown>>, filters);
      default:
        throw new Error(`Unsupported report type: ${String(reportType)}`);
    }
  } catch (error) {
    throw new Error(
      `Failed to process report: ${error instanceof Error ? error.message : 'Unknown error'}`
    );
  }
}

/**
 * Process Profit & Loss report data
 */
function processProfitLossReport(
  data: Array<Record<string, unknown>>,
  dateRange?: { start: string; end: string }
): Record<string, unknown> {
  let revenue = 0;
  let expenses = 0;
  let costOfGoodsSold = 0;

  data.forEach((item) => {
    const type = item.type as string;
    const amount = Number(item.amount) || 0;

    if (type === 'income') {
      revenue += amount;
    } else if (type === 'expense') {
      expenses += amount;
      // Check if it's COGS
      const category = item.category as string;
      if (category?.toLowerCase().includes('cost') || category?.toLowerCase().includes('cogs')) {
        costOfGoodsSold += amount;
      }
    }
  });

  const grossProfit = revenue - costOfGoodsSold;
  const operatingExpenses = expenses - costOfGoodsSold;
  const netProfit = grossProfit - operatingExpenses;

  return {
    revenue,
    costOfGoodsSold,
    grossProfit,
    operatingExpenses,
    netProfit,
    grossProfitMargin: revenue > 0 ? (grossProfit / revenue) * 100 : 0,
    netProfitMargin: revenue > 0 ? (netProfit / revenue) * 100 : 0,
    dateRange,
  };
}

/**
 * Process sales report data
 */
function processSalesReport(
  data: Array<Record<string, unknown>>,
  _filters?: Record<string, unknown>
): Record<string, unknown> {
  let totalSales = 0;
  let invoiceCount = 0;
  const byStatus: Record<string, { count: number; amount: number }> = {};
  const byCustomer: Record<string, { count: number; amount: number }> = {};

  data.forEach((item) => {
    const amount = Number(item.total_amount) || 0;
    const status = (item.status as string) || 'unknown';
    const customerId = (item.customer_id as string) || 'unknown';

    totalSales += amount;
    invoiceCount += 1;

    // Aggregate by status
    if (!byStatus[status]) {
      byStatus[status] = { count: 0, amount: 0 };
    }
    byStatus[status].count += 1;
    byStatus[status].amount += amount;

    // Aggregate by customer
    if (!byCustomer[customerId]) {
      byCustomer[customerId] = { count: 0, amount: 0 };
    }
    byCustomer[customerId].count += 1;
    byCustomer[customerId].amount += amount;
  });

  return {
    summary: {
      totalSales,
      invoiceCount,
      averageInvoiceValue: invoiceCount > 0 ? totalSales / invoiceCount : 0,
    },
    byStatus: Object.entries(byStatus).map(([status, data]) => ({
      status,
      count: data.count,
      amount: data.amount,
      percentage: totalSales > 0 ? (data.amount / totalSales) * 100 : 0,
    })),
    byCustomer: Object.entries(byCustomer)
      .map(([customerId, data]) => ({
        customerId,
        count: data.count,
        amount: data.amount,
        percentage: totalSales > 0 ? (data.amount / totalSales) * 100 : 0,
      }))
      .sort((a, b) => b.amount - a.amount)
      .slice(0, 10), // Top 10 customers
  };
}

/**
 * Process expense report data
 */
function processExpenseReport(
  data: Array<Record<string, unknown>>,
  _filters?: Record<string, unknown>
): Record<string, unknown> {
  let totalExpenses = 0;
  const byCategory: Record<string, { count: number; amount: number }> = {};

  data.forEach((item) => {
    const amount = Math.abs(Number(item.amount) || 0); // Ensure positive
    const categoryObj = item.category as { name?: string } | null | undefined;
    const category = (categoryObj?.name as string) || 'Uncategorized';

    totalExpenses += amount;

    if (!byCategory[category]) {
      byCategory[category] = { count: 0, amount: 0 };
    }
    byCategory[category].count += 1;
    byCategory[category].amount += amount;
  });

  return {
    summary: {
      totalExpenses,
      transactionCount: data.length,
      averageExpense: data.length > 0 ? totalExpenses / data.length : 0,
      categoriesCount: Object.keys(byCategory).length,
    },
    byCategory: Object.entries(byCategory)
      .map(([category, data]) => ({
        category,
        amount: data.amount,
        count: data.count,
        percentage: totalExpenses > 0 ? (data.amount / totalExpenses) * 100 : 0,
      }))
      .sort((a, b) => b.amount - a.amount),
  };
}

/**
 * Aggregate data by specified fields
 */
function aggregateData(payload: AggregateDataPayload): unknown[] {
  const { data, groupBy, aggregations } = payload;
  const groups = new Map<string, unknown[]>();

  // Group data
  const groupByFields = Array.isArray(groupBy) ? groupBy : [groupBy];
  data.forEach((item: unknown) => {
    const itemRecord = item as Record<string, unknown>;
    const key = groupByFields.map((field) => String(itemRecord[field] ?? '')).join('|');
    if (!groups.has(key)) {
      groups.set(key, []);
    }
    groups.get(key)!.push(item);
  });

  // Aggregate each group
  const result: unknown[] = [];
  groups.forEach((groupItems, key) => {
    const groupValues = key.split('|');
    const aggregated: Record<string, unknown> = {};

    groupByFields.forEach((field, index) => {
      aggregated[field] = groupValues[index];
    });

    aggregations.forEach((agg) => {
      const values = groupItems.map((item: unknown) => {
        const itemRecord = item as Record<string, unknown>;
        return Number(itemRecord[agg.field]) || 0;
      });
      switch (agg.operation) {
        case 'sum':
          aggregated[`${agg.field}_sum`] = values.reduce((a, b) => a + b, 0);
          break;
        case 'avg':
          aggregated[`${agg.field}_avg`] =
            values.length > 0 ? values.reduce((a, b) => a + b, 0) / values.length : 0;
          break;
        case 'min':
          aggregated[`${agg.field}_min`] = values.length > 0 ? Math.min(...values) : 0;
          break;
        case 'max':
          aggregated[`${agg.field}_max`] = values.length > 0 ? Math.max(...values) : 0;
          break;
        case 'count':
          aggregated[`${agg.field}_count`] = values.length;
          break;
      }
    });

    result.push(aggregated);
  });

  return result;
}

/**
 * Filter data based on criteria
 */
function filterData(payload: FilterDataPayload): unknown[] {
  const { data, filters } = payload;

  return data.filter((item: unknown) => {
    const itemRecord = item as Record<string, unknown>;
    return filters.every((filter) => {
      const fieldValue = itemRecord[filter.field];
      const filterValue = filter.value;

      switch (filter.operator) {
        case 'equals':
          return fieldValue === filterValue;
        case 'contains':
          return String(fieldValue).toLowerCase().includes(String(filterValue).toLowerCase());
        case 'greaterThan':
          return Number(fieldValue) > Number(filterValue);
        case 'lessThan':
          return Number(fieldValue) < Number(filterValue);
        case 'between':
          if (Array.isArray(filterValue) && filterValue.length === 2) {
            const num = Number(fieldValue);
            return num >= Number(filterValue[0]) && num <= Number(filterValue[1]);
          }
          return false;
        case 'in':
          if (Array.isArray(filterValue)) {
            return filterValue.includes(fieldValue);
          }
          return false;
        default:
          return true;
      }
    });
  });
}

/**
 * Sort data by specified fields
 */
function sortData(payload: SortDataPayload): unknown[] {
  const { data, sortBy } = payload;
  const sorted = [...data];

  if (typeof sortBy === 'string') {
    sorted.sort((a: unknown, b: unknown) => {
      const aRecord = a as Record<string, unknown>;
      const bRecord = b as Record<string, unknown>;
      const aVal = aRecord[sortBy];
      const bVal = bRecord[sortBy];
      
      // Type-safe comparison
      if (typeof aVal === 'number' && typeof bVal === 'number') {
        if (aVal < bVal) return -1;
        if (aVal > bVal) return 1;
      } else if (typeof aVal === 'string' && typeof bVal === 'string') {
        if (aVal < bVal) return -1;
        if (aVal > bVal) return 1;
      } else {
        const aStr = String(aVal ?? '');
        const bStr = String(bVal ?? '');
        if (aStr < bStr) return -1;
        if (aStr > bStr) return 1;
      }
      return 0;
    });
  } else if (Array.isArray(sortBy)) {
    sorted.sort((a: unknown, b: unknown) => {
      const aRecord = a as Record<string, unknown>;
      const bRecord = b as Record<string, unknown>;
      for (const sort of sortBy) {
        const aVal = aRecord[sort.field];
        const bVal = bRecord[sort.field];
        const direction = sort.direction === 'desc' ? -1 : 1;

        // Type-safe comparison
        if (typeof aVal === 'number' && typeof bVal === 'number') {
          if (aVal < bVal) return -1 * direction;
          if (aVal > bVal) return 1 * direction;
        } else if (typeof aVal === 'string' && typeof bVal === 'string') {
          if (aVal < bVal) return -1 * direction;
          if (aVal > bVal) return 1 * direction;
        } else {
          const aStr = String(aVal ?? '');
          const bStr = String(bVal ?? '');
          if (aStr < bStr) return -1 * direction;
          if (aStr > bStr) return 1 * direction;
        }
      }
      return 0;
    });
  }

  return sorted;
}

/**
 * Calculate totals from data
 */
function calculateTotals(payload: CalculateTotalsPayload): Record<string, unknown> {
  const { data, groupBy } = payload;

  if (groupBy) {
    const grouped: Record<string, number> = {};
    data.forEach((item) => {
      const key = String(item[groupBy as keyof typeof item] ?? '');
      grouped[key] = (grouped[key] || 0) + (item.amount ?? 0);
    });
    return grouped;
  }

  const total = data.reduce((sum, item) => sum + (item.amount ?? 0), 0);
  return { total, count: data.length, average: data.length > 0 ? total / data.length : 0 };
}

/**
 * Transform data using custom operations
 */
function transformData(payload: TransformDataPayload): unknown[] {
  const { data, transformations } = payload;
  let result = [...data];

  transformations.forEach((transformation) => {
    switch (transformation.type) {
      case 'map':
        result = result.map(transformation.operation);
        break;
      case 'filter':
        result = result.filter((item) => Boolean(transformation.operation(item)));
        break;
      case 'reduce':
        // For reduce, operation should return accumulated value
        result = [
          result.reduce((acc, item) => transformation.operation({ acc, item }), {}),
        ];
        break;
      case 'group':
        // Grouping logic
        const groups: Record<string, unknown[]> = {};
        result.forEach((item) => {
          const key = String(transformation.operation(item) ?? '');
          if (!groups[key]) groups[key] = [];
          groups[key].push(item);
        });
        result = Object.entries(groups).map(([key, items]) => ({ key, items }));
        break;
    }
  });

  return result;
}

// ============================================================================
// Message Handler
// ============================================================================

self.onmessage = (event: MessageEvent<WorkerMessage>) => {
  const startTime = performance.now();
  const { id, type, payload } = event.data;

  try {
    let result: unknown;

    switch (type) {
      case 'processReport':
        result = processReport(payload as ProcessReportPayload);
        break;
      case 'aggregateData':
        result = aggregateData(payload as AggregateDataPayload);
        break;
      case 'filterData':
        result = filterData(payload as FilterDataPayload);
        break;
      case 'sortData':
        result = sortData(payload as SortDataPayload);
        break;
      case 'calculateTotals':
        result = calculateTotals(payload as CalculateTotalsPayload);
        break;
      case 'transformData':
        result = transformData(payload as TransformDataPayload);
        break;
      default:
        throw new Error(`Unknown message type: ${type}`);
    }

    const processingTime = performance.now() - startTime;

    const response: WorkerResponse = {
      id,
      success: true,
      data: result,
      processingTime,
    };

    self.postMessage(response);
  } catch (error) {
    const processingTime = performance.now() - startTime;

    const response: WorkerResponse = {
      id,
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred',
      processingTime,
    };

    self.postMessage(response);
  }
};
