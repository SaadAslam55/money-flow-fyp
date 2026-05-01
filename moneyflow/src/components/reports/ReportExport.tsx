// FILE: src/components/reports/ReportExport.tsx

import { logger } from '@/lib/logger';
import { useState } from 'react';
import { Download, FileText, FileSpreadsheet, File } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useReportExport } from '@/hooks/useReports';
import { toast } from 'sonner';
import type { ReportType, ReportExportOptions } from '@/types/report.types';

interface ReportExportProps {
  reportType: ReportType;
  reportData: unknown;
  reportName?: string;
}

export function ReportExport({ reportType, reportData, reportName }: ReportExportProps) {
  const { exportToPDF, exportToExcel, isExporting } = useReportExport();

  const handleExport = async (format: 'pdf' | 'excel' | 'csv') => {
    try {
      if (format === 'pdf') {
        await exportToPDF({ reportType, reportData });
      } else if (format === 'excel' || format === 'csv') {
        await exportToExcel({ reportType, reportData });
      }
    } catch (error) {
      toast.error('Failed to export report');

      logger.error('Export error:', error instanceof Error ? error.message : String(error));
    }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" disabled={isExporting}>
          <Download className="mr-2 h-4 w-4" />
          {isExporting ? 'Exporting...' : 'Export'}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={() => handleExport('pdf')} disabled={isExporting}>
          <FileText className="mr-2 h-4 w-4" />
          Export as PDF
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => handleExport('excel')} disabled={isExporting}>
          <FileSpreadsheet className="mr-2 h-4 w-4" />
          Export as Excel
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => handleExport('csv')} disabled={isExporting}>
          <File className="mr-2 h-4 w-4" />
          Export as CSV
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

