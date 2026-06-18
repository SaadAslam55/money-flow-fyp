// FILE: src/hooks/useReports.ts

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { useAuth } from './useAuth';
import * as reportApi from '@/services/api/reportApi';
import { handleError } from '@/lib/errorHandler';
import type { DateRange, ReportType, ReportFilters } from '@/types/report.types';

export function useProfitLossReport(dateRange: DateRange, includeComparison: boolean = false) {
  const { organization } = useAuth();

  return useQuery({
    queryKey: ['profit-loss-report', organization?.id, dateRange, includeComparison],
    queryFn: () => {
      if (!organization?.id) throw new Error('Organization ID is required');
      return reportApi.getProfitLossReport(organization.id, dateRange, includeComparison);
    },
    enabled: !!organization?.id && !!dateRange.start && !!dateRange.end,
    staleTime: 300000, // 5 minutes
  });
}

export function useBalanceSheet(asOfDate: string) {
  const { organization } = useAuth();

  return useQuery({
    queryKey: ['balance-sheet', organization?.id, asOfDate],
    queryFn: () => {
      if (!organization?.id) throw new Error('Organization ID is required');
      return reportApi.getBalanceSheet(organization.id, asOfDate);
    },
    enabled: !!organization?.id && !!asOfDate,
    staleTime: 300000,
  });
}

export function useCashFlowStatement(dateRange: DateRange) {
  const { organization } = useAuth();

  return useQuery({
    queryKey: ['cash-flow-statement', organization?.id, dateRange],
    queryFn: () => {
      if (!organization?.id) throw new Error('Organization ID is required');
      return reportApi.getCashFlowStatement(organization.id, dateRange);
    },
    enabled: !!organization?.id && !!dateRange.start && !!dateRange.end,
    staleTime: 300000,
  });
}

export function useSalesReport(dateRange: DateRange, filters?: ReportFilters) {
  const { organization } = useAuth();

  return useQuery({
    queryKey: ['sales-report', organization?.id, dateRange, filters],
    queryFn: () => {
      if (!organization?.id) throw new Error('Organization ID is required');
      return reportApi.getSalesReport(organization.id, dateRange, filters);
    },
    enabled: !!organization?.id && !!dateRange.start && !!dateRange.end,
    staleTime: 300000,
  });
}

export function useExpenseReport(dateRange: DateRange, filters?: ReportFilters) {
  const { organization } = useAuth();

  return useQuery({
    queryKey: ['expense-report', organization?.id, dateRange, filters],
    queryFn: () => {
      if (!organization?.id) throw new Error('Organization ID is required');
      return reportApi.getExpenseReport(organization.id, dateRange, filters);
    },
    enabled: !!organization?.id && !!dateRange.start && !!dateRange.end,
    staleTime: 300000,
  });
}

export function useTaxReport(dateRange: DateRange) {
  const { organization } = useAuth();

  return useQuery({
    queryKey: ['tax-report', organization?.id, dateRange],
    queryFn: () => {
      if (!organization?.id) throw new Error('Organization ID is required');
      return reportApi.getTaxReport(organization.id, dateRange);
    },
    enabled: !!organization?.id && !!dateRange.start && !!dateRange.end,
    staleTime: 300000,
  });
}

export function useCustomerReport(dateRange: DateRange) {
  const { organization } = useAuth();

  return useQuery({
    queryKey: ['customer-report', organization?.id, dateRange],
    queryFn: () => {
      if (!organization?.id) throw new Error('Organization ID is required');
      return reportApi.getCustomerReport(organization.id, dateRange);
    },
    enabled: !!organization?.id && !!dateRange.start && !!dateRange.end,
    staleTime: 300000,
  });
}

export function useProductReport(dateRange: DateRange) {
  const { organization } = useAuth();

  return useQuery({
    queryKey: ['product-report', organization?.id, dateRange],
    queryFn: () => {
      if (!organization?.id) throw new Error('Organization ID is required');
      return reportApi.getProductReport(organization.id, dateRange);
    },
    enabled: !!organization?.id && !!dateRange.start && !!dateRange.end,
    staleTime: 300000,
  });
}

export function useReportExport() {
  const { organization } = useAuth();

  const exportPDF = useMutation({
    mutationFn: ({ reportType, reportData }: { reportType: string; reportData: Record<string, unknown> }) => {
      if (!organization?.id) throw new Error('Organization ID is required');
      return reportApi.exportReportToPDF(reportType, reportData, organization.id);
    },
    onSuccess: (result) => {
      if (result.data) {
        const url = URL.createObjectURL(result.data);
        const link = document.createElement('a');
        link.href = url;
        link.download = `report-${Date.now()}.pdf`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
        toast.success('Report exported successfully');
      }
    },
    onError: (error: Error) => {
      handleError(error, 'useReports.exportPDF');
      toast.error(`Failed to export report: ${error.message}`);
    },
  });

  const exportExcel = useMutation({
    mutationFn: async ({ reportType, reportData }: { reportType: string; reportData: Record<string, unknown> }) => {
      return reportApi.exportReportToExcel(reportType, reportData);
    },
    onSuccess: (result: { data: Blob | null; error: Error | null }) => {
      if (result.data) {
        const url = URL.createObjectURL(result.data);
        const link = document.createElement('a');
        link.href = url;
        link.download = `report-${Date.now()}.csv`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
        toast.success('Report exported successfully');
      }
    },
    onError: (error: Error) => {
      handleError(error, 'useReports.exportExcel');
      toast.error(`Failed to export report: ${error.message}`);
    },
  });

  return {
    exportToPDF: exportPDF.mutateAsync,
    exportToExcel: exportExcel.mutateAsync,
    isExporting: exportPDF.isPending || exportExcel.isPending,
  };
}

export function useScheduleReport() {
  const { organization } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      reportType,
      frequency,
      recipients,
    }: {
      reportType: string;
      frequency: 'daily' | 'weekly' | 'monthly';
      recipients: string[];
    }) => reportApi.scheduleReport(organization!.id, reportType, frequency, recipients),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['scheduled-reports'] });
      toast.success('Report scheduled successfully');
    },
    onError: (error: Error) => {
      handleError(error, 'useReports.scheduleReport');
      toast.error(`Failed to schedule report: ${error.message}`);
    },
  });
}
