// src/workers/worker.d.ts
/**
 * TypeScript declarations for Web Workers
 *
 * Extends the Worker global scope with proper types
 */

declare global {
  interface WorkerGlobalScope {
    onmessage: ((event: MessageEvent) => void) | null;
    postMessage(message: unknown, transfer?: Transferable[]): void;
    close(): void;
  }

  const self: WorkerGlobalScope;
}

export {};

