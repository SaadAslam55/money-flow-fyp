// FILE: src/components/reports/ScheduledReports.tsx

import { logger } from '@/lib/logger';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Calendar, Mail, Trash2, Play, Pause } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { scheduleReportSchema, type ScheduleReportInput } from '@/schemas/reportSchemas';
import { useScheduleReport } from '@/hooks/useReports';
import { toast } from 'sonner';
import { formatDate } from '@/lib/formatters';

interface ScheduledReport {
  id: string;
  report_type: string;
  frequency: 'daily' | 'weekly' | 'monthly';
  recipients: string[];
  is_active: boolean;
  created_at: string;
  last_run?: string;
  next_run?: string;
}

interface ScheduledReportsProps {
  scheduledReports?: ScheduledReport[];
}

export function ScheduledReports({ scheduledReports = [] }: ScheduledReportsProps) {
  const [showForm, setShowForm] = useState(false);
  const scheduleReport = useScheduleReport();

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    reset,
    formState: { errors },
  } = useForm<ScheduleReportInput>({
    resolver: zodResolver(scheduleReportSchema),
    defaultValues: {
      report_type: 'profit_loss',
      frequency: 'monthly',
      recipients: [],
    },
  });

  const recipients = watch('recipients') || [];
  const [emailInput, setEmailInput] = useState('');

  const handleAddEmail = () => {
    if (emailInput && !recipients.includes(emailInput)) {
      setValue('recipients', [...recipients, emailInput]);
      setEmailInput('');
    }
  };

  const handleRemoveEmail = (email: string) => {
    setValue(
      'recipients',
      recipients.filter((e) => e !== email)
    );
  };

  const onFormSubmit = async (data: ScheduleReportInput) => {
    try {
      await scheduleReport.mutateAsync({
        reportType: data.report_type,
        frequency: data.frequency,
        recipients: data.recipients,
      });
      reset();
      setShowForm(false);
      toast.success('Report scheduled successfully');
    } catch (error) {

      logger.error('Error scheduling report:', error instanceof Error ? error.message : String(error));
    }
  };

  const reportTypeLabels: Record<string, string> = {
    profit_loss: 'Profit & Loss',
    balance_sheet: 'Balance Sheet',
    cash_flow: 'Cash Flow',
    sales: 'Sales Report',
    expenses: 'Expense Report',
    tax: 'Tax Report',
    customer: 'Customer Report',
    product: 'Product Report',
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-xl font-bold">Scheduled Reports</h3>
          <p className="text-sm text-muted-foreground">
            Automatically generate and email reports on a schedule
          </p>
        </div>
        <Button onClick={() => setShowForm(!showForm)}>
          <Calendar className="mr-2 h-4 w-4" />
          Schedule New Report
        </Button>
      </div>

      {/* Schedule Form */}
      {showForm && (
        <Card>
          <CardHeader>
            <CardTitle>Schedule New Report</CardTitle>
            <CardDescription>
              Configure automatic report generation and email delivery
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit(onFormSubmit)} className="space-y-6">
              {/* Report Type */}
              <div className="space-y-2">
                <Label htmlFor="report_type">
                  Report Type <span className="text-destructive">*</span>
                </Label>
                <Select
                  value={watch('report_type')}
                  onValueChange={(value) => setValue('report_type', value as ScheduleReportInput['report_type'])}
                >
                  <SelectTrigger id="report_type">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="profit_loss">Profit & Loss</SelectItem>
                    <SelectItem value="balance_sheet">Balance Sheet</SelectItem>
                    <SelectItem value="cash_flow">Cash Flow</SelectItem>
                    <SelectItem value="sales">Sales Report</SelectItem>
                    <SelectItem value="expenses">Expense Report</SelectItem>
                    <SelectItem value="tax">Tax Report</SelectItem>
                    <SelectItem value="customer">Customer Report</SelectItem>
                    <SelectItem value="product">Product Report</SelectItem>
                  </SelectContent>
                </Select>
                {errors.report_type && (
                  <p className="text-sm text-destructive">{errors.report_type.message}</p>
                )}
              </div>

              {/* Frequency */}
              <div className="space-y-2">
                <Label htmlFor="frequency">
                  Frequency <span className="text-destructive">*</span>
                </Label>
                <Select
                  value={watch('frequency')}
                  onValueChange={(value) => setValue('frequency', value as ScheduleReportInput['frequency'])}
                >
                  <SelectTrigger id="frequency">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="daily">Daily</SelectItem>
                    <SelectItem value="weekly">Weekly</SelectItem>
                    <SelectItem value="monthly">Monthly</SelectItem>
                  </SelectContent>
                </Select>
                {errors.frequency && (
                  <p className="text-sm text-destructive">{errors.frequency.message}</p>
                )}
              </div>

              {/* Recipients */}
              <div className="space-y-2">
                <Label>
                  Recipients <span className="text-destructive">*</span>
                </Label>
                <div className="flex gap-2">
                  <Input
                    type="email"
                    placeholder="Enter email address"
                    value={emailInput}
                    onChange={(e) => setEmailInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        handleAddEmail();
                      }
                    }}
                  />
                  <Button type="button" onClick={handleAddEmail} variant="outline">
                    Add
                  </Button>
                </div>
                {recipients.length > 0 && (
                  <div className="flex flex-wrap gap-2 mt-2">
                    {recipients.map((email) => (
                      <Badge key={email} variant="secondary" className="flex items-center gap-1">
                        <Mail className="h-3 w-3" />
                        {email}
                        <button
                          type="button"
                          onClick={() => handleRemoveEmail(email)}
                          className="ml-1 hover:text-destructive"
                        >
                          ×
                        </button>
                      </Badge>
                    ))}
                  </div>
                )}
                {errors.recipients && (
                  <p className="text-sm text-destructive">{errors.recipients.message}</p>
                )}
              </div>

              {/* Actions */}
              <div className="flex justify-end gap-3">
                <Button type="button" variant="outline" onClick={() => setShowForm(false)}>
                  Cancel
                </Button>
                <Button type="submit" disabled={scheduleReport.isPending}>
                  {scheduleReport.isPending ? 'Scheduling...' : 'Schedule Report'}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {/* Scheduled Reports List */}
      {scheduledReports.length > 0 ? (
        <Card>
          <CardHeader>
            <CardTitle>Active Schedules</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Report Type</TableHead>
                  <TableHead>Frequency</TableHead>
                  <TableHead>Recipients</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Next Run</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {scheduledReports.map((report) => (
                  <TableRow key={report.id}>
                    <TableCell className="font-medium">
                      {reportTypeLabels[report.report_type] || report.report_type}
                    </TableCell>
                    <TableCell className="capitalize">{report.frequency}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <Mail className="h-3 w-3 text-muted-foreground" />
                        <span>{report.recipients.length} recipient(s)</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant={report.is_active ? 'default' : 'secondary'}>
                        {report.is_active ? 'Active' : 'Paused'}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {report.next_run ? formatDate(report.next_run) : 'N/A'}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Button variant="ghost" size="sm">
                          {report.is_active ? (
                            <Pause className="h-4 w-4" />
                          ) : (
                            <Play className="h-4 w-4" />
                          )}
                        </Button>
                        <Button variant="ghost" size="sm" className="text-destructive">
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardContent className="p-6 text-center">
            <p className="text-muted-foreground">No scheduled reports yet</p>
            <p className="text-sm text-muted-foreground mt-2">
              Schedule your first report to get started
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

