// src/workers/index.ts
/**
 * Web Workers - Centralized Exports
 *
 * This module exports types and utilities for Web Workers used in the application.
 * Web Workers run in a separate thread to prevent blocking the main UI thread.
 *
 * @module Workers
 *
 * @example
 * ```typescript
 * // Data Processor Worker
 * import { createDataProcessorWorker } from '@/workers';
 *
 * const worker = createDataProcessorWorker();
 * worker.postMessage({
 *   id: '1',
 *   type: 'processReport',
 *   payload: { reportType: 'sales', data: [...] }
 * });
 *
 * // PDF Generator Worker
 * import { createPDFGeneratorWorker } from '@/workers';
 *
 * const pdfWorker = createPDFGeneratorWorker();
 * pdfWorker.postMessage({
 *   id: '1',
 *   type: 'generateFromHTML',
 *   payload: { html: '<html>...</html>', filename: 'invoice.pdf' }
 * });
 * ```
 */

// ============================================================================
// Data Processor Worker
// ============================================================================
/**
 * Data Processor Worker Types
 *
 * Used for heavy data processing operations like report calculations,
 * data aggregations, and large dataset transformations.
 */
export type {
  WorkerMessage,
  WorkerResponse,
  WorkerMessageType,
} from './dataProcessor.worker';

/**
 * Create a new Data Processor Worker instance
 *
 * @returns Worker instance configured for data processing
 */
export function createDataProcessorWorker(): Worker {
  return new Worker(new URL('./dataProcessor.worker.ts', import.meta.url), {
    type: 'module',
  });
}

// ============================================================================
// PDF Generator Worker
// ============================================================================
/**
 * PDF Generator Worker Types
 *
 * Used for client-side PDF generation from HTML or structured data.
 * Note: For production, prefer server-side PDF generation.
 */
export type {
  PDFWorkerMessage,
  PDFWorkerResponse,
  PDFWorkerMessageType,
  PDFWorkerPayload,
  GenerateFromHTMLPayload,
  GenerateFromDataPayload,
  ValidateHTMLPayload,
  PDFOptions,
} from './pdfGenerator.worker';

/**
 * Create a new PDF Generator Worker instance
 *
 * @returns Worker instance configured for PDF generation
 */
export function createPDFGeneratorWorker(): Worker {
  return new Worker(new URL('./pdfGenerator.worker.ts', import.meta.url), {
    type: 'module',
  });
}

// ============================================================================
// React Hooks
// ============================================================================
/**
 * React hook for Data Processor Worker
 *
 * @example
 * ```typescript
 * const { processReport, isProcessing } = useDataProcessor();
 * const result = await processReport('sales', data);
 * ```
 */
export { useDataProcessor } from './useDataProcessor';

// ============================================================================
// Worker Utilities
// ============================================================================

/**
 * Worker helper utilities
 */
export const WorkerUtils = {
  /**
   * Generate a unique message ID
   */
  generateMessageId: (): string => {
    return `msg-${Date.now()}-${Math.random().toString(36).substring(2, 11)}`;
  },

  /**
   * Create a promise-based worker communication
   *
   * @param worker - Worker instance
   * @param message - Message to send
   * @param timeout - Timeout in milliseconds (default: 30000)
   * @returns Promise that resolves with worker response
   */
  sendMessage: <T = unknown>(
    worker: Worker,
    message: { id: string; type: string; payload: unknown },
    timeout = 30000
  ): Promise<{ data: T; processingTime?: number }> => {
    return new Promise((resolve, reject) => {
      const timeoutId = setTimeout(() => {
        worker.removeEventListener('message', handler);
        reject(new Error('Worker operation timed out'));
      }, timeout);

      const handler = (event: MessageEvent<{ id: string; success: boolean; data?: T; error?: string; processingTime?: number }>) => {
        if (event.data.id === message.id) {
          clearTimeout(timeoutId);
          worker.removeEventListener('message', handler);

          if (event.data.success) {
            resolve({
              data: event.data.data as T,
              processingTime: event.data.processingTime,
            });
          } else {
            reject(new Error(event.data.error ?? 'Worker operation failed'));
          }
        }
      };

      worker.addEventListener('message', handler);
      worker.postMessage(message);
    });
  },

  /**
   * Terminate worker and clean up
   *
   * @param worker - Worker instance to terminate
   */
  terminate: (worker: Worker): void => {
    worker.terminate();
  },
};

