// src/workers/pdfGenerator.worker.ts
/**
 * PDF Generator Web Worker
 *
 * Handles client-side PDF generation using browser APIs.
 * This is a lightweight fallback when server-side PDF generation is unavailable.
 *
 * Note: For production, consider using server-side PDF generation (Puppeteer, PDFKit)
 * or a service like PDFShift. This worker uses browser print API as a fallback.
 *
 * @module Workers/PDFGenerator
 *
 * @example
 * ```typescript
 * const worker = new Worker(
 *   new URL('./pdfGenerator.worker.ts', import.meta.url),
 *   { type: 'module' }
 * );
 *
 * worker.postMessage({
 *   type: 'generateFromHTML',
 *   payload: { html, filename: 'invoice.pdf' }
 * });
 * ```
 */

// ============================================================================
// Type Definitions
// ============================================================================

export interface PDFWorkerMessage {
  id: string;
  type: PDFWorkerMessageType;
  payload: PDFWorkerPayload;
}

export type PDFWorkerMessageType = 'generateFromHTML' | 'generateFromData' | 'validateHTML';

export type PDFWorkerPayload =
  | GenerateFromHTMLPayload
  | GenerateFromDataPayload
  | ValidateHTMLPayload;

export interface GenerateFromHTMLPayload {
  html: string;
  filename?: string;
  options?: PDFOptions;
}

export interface GenerateFromDataPayload {
  data: Record<string, unknown>;
  template: 'invoice' | 'report' | 'receipt';
  filename?: string;
  options?: PDFOptions;
}

export interface ValidateHTMLPayload {
  html: string;
}

export interface PDFOptions {
  format?: 'A4' | 'Letter' | 'Legal';
  orientation?: 'portrait' | 'landscape';
  margin?: {
    top?: number;
    right?: number;
    bottom?: number;
    left?: number;
  };
  printBackground?: boolean;
}

export interface PDFWorkerResponse {
  id: string;
  success: boolean;
  data?: {
    blob?: Blob;
    url?: string;
    html?: string;
    isValid?: boolean;
  };
  error?: string;
  processingTime?: number;
}

// ============================================================================
// PDF Generation Functions
// ============================================================================

/**
 * Generate PDF from HTML string
 * Note: In a Web Worker, we can't directly create PDFs.
 * This function prepares the HTML and returns it for client-side processing.
 */
function generateFromHTML(payload: GenerateFromHTMLPayload): { html: string; options: PDFOptions } {
  const { html, options = {} } = payload;

  // Validate HTML
  if (!html || typeof html !== 'string') {
    throw new Error('Invalid HTML provided');
  }

  // Prepare print-optimized HTML
  const printHTML = preparePrintHTML(html, options);

  return {
    html: printHTML,
    options: {
      format: options.format ?? 'A4',
      orientation: options.orientation ?? 'portrait',
      margin: options.margin ?? { top: 20, right: 20, bottom: 20, left: 20 },
      printBackground: options.printBackground ?? true,
    },
  };
}

/**
 * Generate PDF from structured data using a template
 */
function generateFromData(payload: GenerateFromDataPayload): { html: string; options: PDFOptions } {
  const { data, template, options = {} } = payload;

  let html = '';

  switch (template) {
    case 'invoice':
      html = generateInvoiceHTML(data);
      break;
    case 'report':
      html = generateReportHTML(data);
      break;
    case 'receipt':
      html = generateReceiptHTML(data);
      break;
    default:
      throw new Error(`Unknown template: ${String(template)}`);
  }

  return generateFromHTML({ html, options });
}

/**
 * Validate HTML structure
 */
function validateHTML(payload: ValidateHTMLPayload): { isValid: boolean; errors: string[] } {
  const { html } = payload;
  const errors: string[] = [];

  if (!html || typeof html !== 'string') {
    errors.push('HTML must be a non-empty string');
    return { isValid: false, errors };
  }

  // Basic HTML structure validation
  if (!html.includes('<html') && !html.includes('<!DOCTYPE')) {
    errors.push('HTML should include proper DOCTYPE or html tag');
  }

  // Check for unclosed tags (basic check)
  const openTags = (html.match(/<[^/][^>]*>/g) ?? []).length;
  const closeTags = (html.match(/<\/[^>]+>/g) ?? []).length;
  if (Math.abs(openTags - closeTags) > 10) {
    // Allow some difference for self-closing tags
    errors.push('Potential unclosed HTML tags detected');
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
}

/**
 * Prepare HTML for printing
 */
function preparePrintHTML(html: string, options: PDFOptions): string {
  const format = options.format ?? 'A4';
  const orientation = options.orientation ?? 'portrait';
  const margin = options.margin ?? { top: 20, right: 20, bottom: 20, left: 20 };
  const printBackground = options.printBackground ?? true;

  // Page size in mm
  const pageSizes: Record<string, { width: number; height: number }> = {
    A4: { width: 210, height: 297 },
    Letter: { width: 216, height: 279 },
    Legal: { width: 216, height: 356 },
  };

  const size = pageSizes[format] || pageSizes.A4;
  const width = orientation === 'landscape' ? size?.height ?? 0 : size?.width ?? 0;
  // Height is calculated but not used in current implementation
  // const height = orientation === 'landscape' ? size?.width ?? 0 : size?.height ?? 0;

  const printStyles = `
    <style>
      @page {
        size: ${format} ${orientation};
        margin: ${margin.top}mm ${margin.right}mm ${margin.bottom}mm ${margin.left}mm;
      }
      * {
        -webkit-print-color-adjust: ${printBackground ? 'exact' : 'economy'};
        print-color-adjust: ${printBackground ? 'exact' : 'economy'};
      }
      body {
        width: ${width}mm;
        margin: 0;
        padding: 0;
        font-family: Arial, sans-serif;
      }
      @media print {
        body {
          width: 100%;
        }
        .no-print {
          display: none !important;
        }
      }
    </style>
  `;

  // Wrap HTML if it doesn't have a complete structure
  if (!html.includes('<html')) {
    return `<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Document</title>
  ${printStyles}
</head>
<body>
  ${html}
</body>
</html>`;
  }

  // Inject print styles into existing HTML
  if (html.includes('</head>')) {
    return html.replace('</head>', `${printStyles}</head>`);
  }

  return html;
}

/**
 * Generate invoice HTML template
 */
function generateInvoiceHTML(data: Record<string, unknown>): string {
  // This is a basic template - can be enhanced
  const invoiceNumber = String(data.invoice_number ?? 'N/A');
  const date = String(data.invoice_date ?? new Date().toISOString().split('T')[0]);
  const total = String(data.total_amount ?? 0);

  return `
    <div style="padding: 20px; max-width: 800px; margin: 0 auto;">
      <h1>Invoice ${invoiceNumber}</h1>
      <p>Date: ${date}</p>
      <p>Total: ${total}</p>
      <!-- Add more invoice details here -->
    </div>
  `;
}

/**
 * Generate report HTML template
 */
function generateReportHTML(data: Record<string, unknown>): string {
  const reportType = String(data.reportType ?? 'Report');
  const period = String(data.period ?? '');

  return `
    <div style="padding: 20px; max-width: 800px; margin: 0 auto;">
      <h1>${reportType} Report</h1>
      <p>Period: ${period}</p>
      <!-- Add report data here -->
    </div>
  `;
}

/**
 * Generate receipt HTML template
 */
function generateReceiptHTML(data: Record<string, unknown>): string {
  const receiptNumber = String(data.receipt_number ?? 'N/A');
  const dateValue = data.date ?? new Date().toISOString().split('T')[0];
  const date = typeof dateValue === 'string' ? dateValue : String(dateValue);
  const amountValue = data.amount ?? 0;
  const amount = typeof amountValue === 'number' ? String(amountValue) : String(amountValue);

  return `
    <div style="padding: 20px; max-width: 400px; margin: 0 auto;">
      <h2>Receipt</h2>
      <p>Receipt #: ${receiptNumber}</p>
      <p>Date: ${date}</p>
      <p>Amount: ${amount}</p>
      <!-- Add more receipt details here -->
    </div>
  `;
}

// ============================================================================
// Message Handler
// ============================================================================

self.onmessage = (event: MessageEvent<PDFWorkerMessage>) => {
  const startTime = performance.now();
  const { id, type, payload } = event.data;

  try {
    let result: { html?: string; options?: PDFOptions; isValid?: boolean; errors?: string[] };

    switch (type) {
      case 'generateFromHTML':
        result = generateFromHTML(payload as GenerateFromHTMLPayload);
        break;
      case 'generateFromData':
        result = generateFromData(payload as GenerateFromDataPayload);
        break;
      case 'validateHTML':
        result = validateHTML(payload as ValidateHTMLPayload);
        break;
      default:
        throw new Error(`Unknown message type: ${String(type)}`);
    }

    const processingTime = performance.now() - startTime;

    const response: PDFWorkerResponse = {
      id,
      success: true,
      data: result,
      processingTime,
    };

    self.postMessage(response);
  } catch (error) {
    const processingTime = performance.now() - startTime;

    const response: PDFWorkerResponse = {
      id,
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred',
      processingTime,
    };

    self.postMessage(response);
  }
};
