// FILE: src/components/reports/ReportsDashboard.tsx

import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  BarChart3,
  TrendingUp,
  TrendingDown,
  DollarSign,
  Receipt,
  Users,
  Package,
  FileText,
  Calendar,
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { formatDate } from '@/lib/formatters';
import type { ReportType } from '@/types/report.types';

interface ReportCard {
  id: ReportType;
  title: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
  color: string;
  bgColor: string;
}

const reportCards: ReportCard[] = [
  {
    id: 'profit_loss',
    title: 'Profit & Loss',
    description: 'View income, expenses, and net profit',
    icon: TrendingUp,
    color: 'text-green-600',
    bgColor: 'bg-green-50',
  },
  {
    id: 'balance_sheet',
    title: 'Balance Sheet',
    description: 'Assets, liabilities, and equity overview',
    icon: FileText,
    color: 'text-blue-600',
    bgColor: 'bg-blue-50',
  },
  {
    id: 'cash_flow',
    title: 'Cash Flow',
    description: 'Track cash inflows and outflows',
    icon: DollarSign,
    color: 'text-purple-600',
    bgColor: 'bg-purple-50',
  },
  {
    id: 'sales',
    title: 'Sales Report',
    description: 'Revenue analysis and sales trends',
    icon: BarChart3,
    color: 'text-indigo-600',
    bgColor: 'bg-indigo-50',
  },
  {
    id: 'expenses',
    title: 'Expense Report',
    description: 'Expense breakdown by category',
    icon: TrendingDown,
    color: 'text-red-600',
    bgColor: 'bg-red-50',
  },
  {
    id: 'tax',
    title: 'Tax Report',
    description: 'Tax collected and tax liability',
    icon: Receipt,
    color: 'text-orange-600',
    bgColor: 'bg-orange-50',
  },
  {
    id: 'customer',
    title: 'Customer Report',
    description: 'Customer analytics and segments',
    icon: Users,
    color: 'text-cyan-600',
    bgColor: 'bg-cyan-50',
  },
  {
    id: 'product',
    title: 'Product Report',
    description: 'Product performance and inventory',
    icon: Package,
    color: 'text-pink-600',
    bgColor: 'bg-pink-50',
  },
];

interface ReportsDashboardProps {
  onSelectReport?: (reportType: ReportType) => void;
}

export function ReportsDashboard({ onSelectReport }: ReportsDashboardProps) {
  const navigate = useNavigate();
  const [selectedCategory, setSelectedCategory] = useState<'financial' | 'operational' | 'all'>('all');

  const categories = {
    financial: ['profit_loss', 'balance_sheet', 'cash_flow', 'tax'],
    operational: ['sales', 'expenses', 'customer', 'product'],
  };

  const filteredReports =
    selectedCategory === 'all'
      ? reportCards
      : reportCards.filter((card) =>
          categories[selectedCategory].includes(card.id)
        );

  const handleReportClick = (reportType: ReportType) => {
    if (onSelectReport) {
      onSelectReport(reportType);
    } else {
      navigate(`/reports/${reportType.replace('_', '-')}`);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold">Reports & Analytics</h2>
        <p className="text-muted-foreground">
          Comprehensive financial and operational reports for your business
        </p>
      </div>

      {/* Category Tabs */}
      <Tabs value={selectedCategory} onValueChange={(v) => setSelectedCategory(v as typeof selectedCategory)}>
        <TabsList>
          <TabsTrigger value="all">All Reports</TabsTrigger>
          <TabsTrigger value="financial">Financial</TabsTrigger>
          <TabsTrigger value="operational">Operational</TabsTrigger>
        </TabsList>
      </Tabs>

      {/* Report Cards Grid */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
        {filteredReports.map((report) => {
          const Icon = report.icon;
          return (
            <Card
              key={report.id}
              className="cursor-pointer transition-all hover:shadow-md"
              onClick={() => handleReportClick(report.id)}
            >
              <CardHeader>
                <div className={`mb-2 flex h-12 w-12 items-center justify-center rounded-lg ${report.bgColor}`}>
                  <Icon className={`h-6 w-6 ${report.color}`} />
                </div>
                <CardTitle className="text-lg">{report.title}</CardTitle>
                <CardDescription>{report.description}</CardDescription>
              </CardHeader>
              <CardContent>
                <Button variant="ghost" className="w-full">
                  View Report
                </Button>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Quick Actions
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-3">
            <Button
              variant="outline"
              onClick={() => {
                const today = new Date();
                const firstDay = new Date(today.getFullYear(), today.getMonth(), 1);
                const lastDay = new Date(today.getFullYear(), today.getMonth() + 1, 0);
                navigate(
                  `/reports/profit-loss?start=${firstDay.toISOString().split('T')[0]}&end=${lastDay.toISOString().split('T')[0]}`
                );
              }}
            >
              This Month P&L
            </Button>
            <Button
              variant="outline"
              onClick={() => {
                const today = new Date();
                const firstDay = new Date(today.getFullYear(), today.getMonth(), 1);
                const lastDay = new Date(today.getFullYear(), today.getMonth() + 1, 0);
                navigate(
                  `/reports/sales?start=${firstDay.toISOString().split('T')[0]}&end=${lastDay.toISOString().split('T')[0]}`
                );
              }}
            >
              This Month Sales
            </Button>
            <Button
              variant="outline"
              onClick={() => {
                const today = new Date();
                const firstDay = new Date(today.getFullYear(), today.getMonth(), 1);
                const lastDay = new Date(today.getFullYear(), today.getMonth() + 1, 0);
                navigate(
                  `/reports/expenses?start=${firstDay.toISOString().split('T')[0]}&end=${lastDay.toISOString().split('T')[0]}`
                );
              }}
            >
              This Month Expenses
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

