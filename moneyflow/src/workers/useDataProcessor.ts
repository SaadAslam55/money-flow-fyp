// src/workers/useDataProcessor.ts
/**
 * React Hook for Data Processor Worker
 *
 * Provides a convenient React hook for using the Data Processor Worker.
 * Handles worker lifecycle, error handling, and cleanup automatically.
 *
 * @module Workers/Hooks
 *
 * @example
 * ```typescript
 * function MyComponent() {
 *   const { processReport, isProcessing, error } = useDataProcessor();
 *
 *   const handleGenerateReport = async () => {
 *     const result = await processReport('sales', invoiceData);
 *     logger.info(result);
 *   };
 *
 *   return (
 *     <button onClick={handleGenerateReport} disabled={isProcessing}>
 *       {isProcessing ? 'Processing...' : 'Generate Report'}
 *     </button>
 *   );
 * }
 * ```
 */

import { logger } from '@/lib/logger';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { createDataProcessorWorker, WorkerUtils } from './index';
import type { WorkerMessageType, WorkerResponse } from './dataProcessor.worker';

interface UseDataProcessorReturn {
  processReport: (
    reportType: 'profit_loss' | 'sales' | 'expenses',
    data: unknown[],
    filters?: Record<string, unknown>,
    dateRange?: { start: string; end: string }
  ) => Promise<unknown>;
  aggregateData: (
    data: unknown[],
    groupBy: string | string[],
    aggregations: Array<{ field: string; operation: 'sum' | 'avg' | 'min' | 'max' | 'count' }>
  ) => Promise<unknown[]>;
  filterData: (
    data: unknown[],
    filters: Array<{
      field: string;
      operator: 'equals' | 'contains' | 'greaterThan' | 'lessThan' | 'between' | 'in';
      value: unknown;
    }>
  ) => Promise<unknown[]>;
  sortData: (
    data: unknown[],
    sortBy: string | Array<{ field: string; direction: 'asc' | 'desc' }>
  ) => Promise<unknown[]>;
  calculateTotals: (data: Array<{ amount: number; [key: string]: unknown }>, groupBy?: string) => Promise<Record<string, unknown>>;
  isProcessing: boolean;
  error: Error | null;
  lastProcessingTime: number | null;
}

/**
 * React hook for Data Processor Worker
 *
 * @returns Object with processing functions and state
 */
export function useDataProcessor(): UseDataProcessorReturn {
  const workerRef = useRef<Worker | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [lastProcessingTime, setLastProcessingTime] = useState<number | null>(null);

  // Create worker once
  const worker = useMemo(() => {
    if (typeof window === 'undefined') return null;
    return createDataProcessorWorker();
  }, []);

  workerRef.current = worker;

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (workerRef.current) {
        WorkerUtils.terminate(workerRef.current);
      }
    };
  }, []);

  const sendMessage = useCallback(
    async <T = unknown>(type: WorkerMessageType, payload: unknown): Promise<T> => {
      if (!worker) {
        throw new Error('Worker not available');
      }

      setIsProcessing(true);
      setError(null);

      try {
        const messageId = WorkerUtils.generateMessageId();
        const result = await WorkerUtils.sendMessage<WorkerResponse<T>>(
          worker,
          {
            id: messageId,
            type,
            payload,
          },
          60000 // 60 second timeout
        );

        setLastProcessingTime(result.processingTime ?? null);
        return result.data as T;
      } catch (err) {
        const error = err instanceof Error ? err : new Error('Worker operation failed');
        setError(error);
        throw error;
      } finally {
        setIsProcessing(false);
      }
    },
    [worker]
  );

  const processReport = useCallback(
    (
      reportType: 'profit_loss' | 'sales' | 'expenses',
      data: unknown[],
      filters?: Record<string, unknown>,
      dateRange?: { start: string; end: string }
    ) => {
      return sendMessage('processReport', { reportType, data, filters, dateRange });
    },
    [sendMessage]
  );

  const aggregateData = useCallback(
    (
      data: unknown[],
      groupBy: string | string[],
      aggregations: Array<{ field: string; operation: 'sum' | 'avg' | 'min' | 'max' | 'count' }>
    ) => {
      return sendMessage<unknown[]>('aggregateData', { data, groupBy, aggregations });
    },
    [sendMessage]
  );

  const filterData = useCallback(
    (
      data: unknown[],
      filters: Array<{
        field: string;
        operator: 'equals' | 'contains' | 'greaterThan' | 'lessThan' | 'between' | 'in';
        value: unknown;
      }>
    ) => {
      return sendMessage<unknown[]>('filterData', { data, filters });
    },
    [sendMessage]
  );

  const sortData = useCallback(
    (data: unknown[], sortBy: string | Array<{ field: string; direction: 'asc' | 'desc' }>) => {
      return sendMessage<unknown[]>('sortData', { data, sortBy });
    },
    [sendMessage]
  );

  const calculateTotals = useCallback(
    (data: Array<{ amount: number; [key: string]: unknown }>, groupBy?: string) => {
      return sendMessage<Record<string, unknown>>('calculateTotals', { data, groupBy });
    },
    [sendMessage]
  );

  return {
    processReport,
    aggregateData,
    filterData,
    sortData,
    calculateTotals,
    isProcessing,
    error,
    lastProcessingTime,
  };
}

