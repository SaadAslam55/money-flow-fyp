# Web Workers - Production Ready ✅

Production-ready Web Workers for offloading heavy computations from the main thread.

## Overview

Web Workers allow you to run JavaScript code in a separate thread, preventing UI blocking during heavy operations like:
- Large dataset processing
- Complex calculations
- Report generation
- Data transformations

## Available Workers

### 1. Data Processor Worker (`dataProcessor.worker.ts`)

Handles heavy data processing operations:

- **Report Processing**: Profit & Loss, Sales, Expense reports
- **Data Aggregation**: Group and aggregate large datasets
- **Data Filtering**: Complex multi-criteria filtering
- **Data Sorting**: Multi-field sorting
- **Total Calculations**: Sum, average, min, max calculations
- **Data Transformation**: Custom map/filter/reduce operations

**Usage:**
```typescript
import { createDataProcessorWorker, WorkerUtils } from '@/workers';

const worker = createDataProcessorWorker();
const messageId = WorkerUtils.generateMessageId();

// Process a report
const result = await WorkerUtils.sendMessage(worker, {
  id: messageId,
  type: 'processReport',
  payload: {
    reportType: 'sales',
    data: invoiceData,
    filters: { status: ['paid', 'sent'] },
    dateRange: { start: '2024-01-01', end: '2024-12-31' }
  }
});

// Clean up
WorkerUtils.terminate(worker);
```

**Supported Operations:**
- `processReport` - Process financial reports
- `aggregateData` - Aggregate data by fields
- `filterData` - Filter data with multiple criteria
- `sortData` - Sort data by fields
- `calculateTotals` - Calculate totals and averages
- `transformData` - Custom data transformations

### 2. PDF Generator Worker (`pdfGenerator.worker.ts`)

Handles client-side PDF generation (fallback when server-side is unavailable):

- **HTML to PDF**: Convert HTML strings to print-ready format
- **Template-based PDFs**: Generate PDFs from structured data
- **HTML Validation**: Validate HTML structure before processing
- **Print Optimization**: Prepare HTML for browser print API

**Usage:**
```typescript
import { createPDFGeneratorWorker, WorkerUtils } from '@/workers';

const worker = createPDFGeneratorWorker();
const messageId = WorkerUtils.generateMessageId();

// Generate PDF from HTML
const result = await WorkerUtils.sendMessage(worker, {
  id: messageId,
  type: 'generateFromHTML',
  payload: {
    html: '<html>...</html>',
    filename: 'invoice.pdf',
    options: {
      format: 'A4',
      orientation: 'portrait',
      margin: { top: 20, right: 20, bottom: 20, left: 20 }
    }
  }
});

// Use the HTML with browser print API
if (result.data?.html) {
  const printWindow = window.open('', '_blank');
  printWindow?.document.write(result.data.html);
  printWindow?.print();
}

// Clean up
WorkerUtils.terminate(worker);
```

**Note:** For production, prefer server-side PDF generation. This worker is a fallback.

## Worker Utilities

### `WorkerUtils.generateMessageId()`

Generate unique message IDs for worker communication:

```typescript
const id = WorkerUtils.generateMessageId();
// Returns: "msg-1234567890-abc123def"
```

### `WorkerUtils.sendMessage(worker, message, timeout)`

Send a message to a worker and wait for response:

```typescript
const result = await WorkerUtils.sendMessage(
  worker,
  { id: 'msg-1', type: 'processReport', payload: {...} },
  30000 // 30 second timeout
);
```

### `WorkerUtils.terminate(worker)`

Terminate a worker and clean up resources:

```typescript
WorkerUtils.terminate(worker);
```

## Best Practices

### 1. Always Clean Up Workers

```typescript
useEffect(() => {
  const worker = createDataProcessorWorker();
  
  return () => {
    WorkerUtils.terminate(worker);
  };
}, []);
```

### 2. Handle Errors

```typescript
try {
  const result = await WorkerUtils.sendMessage(worker, message);
  // Use result.data
} catch (error) {
  console.error('Worker error:', error);
  // Handle error gracefully
}
```

### 3. Use Timeouts

```typescript
// Set appropriate timeout for long-running operations
const result = await WorkerUtils.sendMessage(worker, message, 60000); // 60 seconds
```

### 4. Reuse Workers When Possible

```typescript
// Create worker once and reuse
const worker = useMemo(() => createDataProcessorWorker(), []);

// Send multiple messages
await WorkerUtils.sendMessage(worker, message1);
await WorkerUtils.sendMessage(worker, message2);

// Clean up on unmount
useEffect(() => () => WorkerUtils.terminate(worker), []);
```

## React Hook Example

```typescript
import { useEffect, useMemo, useState } from 'react';
import { createDataProcessorWorker, WorkerUtils } from '@/workers';

function useDataProcessor() {
  const [isProcessing, setIsProcessing] = useState(false);
  const worker = useMemo(() => createDataProcessorWorker(), []);

  useEffect(() => {
    return () => WorkerUtils.terminate(worker);
  }, [worker]);

  const processReport = async (reportType: string, data: unknown[]) => {
    setIsProcessing(true);
    try {
      const messageId = WorkerUtils.generateMessageId();
      const result = await WorkerUtils.sendMessage(worker, {
        id: messageId,
        type: 'processReport',
        payload: { reportType, data },
      });
      return result.data;
    } finally {
      setIsProcessing(false);
    }
  };

  return { processReport, isProcessing };
}
```

## Performance Considerations

1. **Worker Overhead**: Creating workers has overhead. Reuse workers when possible.
2. **Data Transfer**: Large data transfers can be slow. Consider chunking large datasets.
3. **Memory**: Workers have their own memory space. Monitor memory usage for large operations.
4. **Timeout**: Set appropriate timeouts based on expected processing time.

## Error Handling

Workers return error information in the response:

```typescript
const result = await WorkerUtils.sendMessage(worker, message);

if (!result.success) {
  console.error('Worker error:', result.error);
  // Handle error
}
```

## Browser Support

Web Workers are supported in all modern browsers:
- Chrome/Edge: ✅
- Firefox: ✅
- Safari: ✅
- Mobile browsers: ✅

## Type Safety

All worker types are exported for type-safe usage:

```typescript
import type {
  WorkerMessage,
  WorkerResponse,
  PDFWorkerMessage,
  PDFWorkerResponse,
} from '@/workers';
```

## Production Notes

1. **PDF Generation**: For production, use server-side PDF generation (Puppeteer, PDFKit) when possible. The PDF worker is a fallback.

2. **Data Processing**: Use workers for operations that take >100ms or process >1000 items.

3. **Monitoring**: Consider logging processing times to monitor performance.

4. **Testing**: Test workers in isolation and with realistic data volumes.

---

**Status**: ✅ All workers are production-ready and fully typed

