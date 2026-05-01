// src/components/dashboard/QuickActions.tsx

import { useNavigate } from 'react-router-dom';
import { Plus, FileText, Users, Package, DollarSign } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

export function QuickActions() {
  const navigate = useNavigate();

  const actions = [
    {
      label: 'New Invoice',
      icon: FileText,
      color: 'bg-blue-500',
      onClick: () => navigate('/invoices/new'),
    },
    {
      label: 'New Customer',
      icon: Users,
      color: 'bg-green-500',
      onClick: () => navigate('/customers/new'),
    },
    {
      label: 'New Product',
      icon: Package,
      color: 'bg-purple-500',
      onClick: () => navigate('/products/new'),
    },
    {
      label: 'Record Payment',
      icon: DollarSign,
      color: 'bg-orange-500',
      onClick: () => navigate('/transactions/new'),
    },
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle>Quick Actions</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 gap-4">
          {actions.map((action) => (
            <Button
              key={action.label}
              variant="outline"
              className="flex h-24 flex-col items-center justify-center gap-2 transition-transform hover:scale-105"
              onClick={action.onClick}
            >
              <div
                className={`h-10 w-10 rounded-lg ${action.color} flex items-center justify-center`}
              >
                <action.icon className="h-5 w-5 text-white" />
              </div>
              <span className="text-sm font-medium">{action.label}</span>
            </Button>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
