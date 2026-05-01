import { logger } from '@/lib/logger';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Calculator, AlertCircle, CheckCircle2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Card, CardContent } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { bankReconciliationSchema, type BankReconciliationFormData } from '@/schemas/transactionSchemas';
import { useActiveBankAccounts, useBankReconciliation } from '@/hooks/useBankAccounts';
import { Loader } from '@/components/common/Loader';
import { CurrencyDisplay } from '@/components/common/CurrencyDisplay';

interface BankReconciliationProps {
  open: boolean;
  onClose: () => void;
}

export function BankReconciliation({ open, onClose }: BankReconciliationProps) {
  const [selectedAccountId, setSelectedAccountId] = useState<string>('');
  const { bankAccounts, isLoading: accountsLoading } = useActiveBankAccounts();
  const { reconcileAccount, isReconciling } = useBankReconciliation();

  const selectedAccount = bankAccounts.find((acc) => acc.id === selectedAccountId);

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    reset,
    formState: { errors },
  } = useForm<BankReconciliationFormData>({
    resolver: zodResolver(bankReconciliationSchema),
    defaultValues: {
      bank_account_id: '',
      statement_balance: 0,
      statement_date: new Date().toISOString().split('T')[0],
      notes: '',
    },
  });

  const statementBalance = watch('statement_balance');
  const statementDate = watch('statement_date');

  const difference = selectedAccount
    ? statementBalance - selectedAccount.current_balance
    : 0;

  const handleAccountChange = (accountId: string) => {
    setSelectedAccountId(accountId);
    setValue('bank_account_id', accountId);
  };

  const onSubmit = async (data: BankReconciliationFormData) => {
    try {
      await reconcileAccount({
        bankAccountId: data.bank_account_id,
        data,
      });
      reset();
      setSelectedAccountId('');
      onClose();
    } catch (error) {

      logger.error('Reconciliation error:', error instanceof Error ? error.message : String(error));
    }
  };

  if (!open) return null;

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Calculator className="h-5 w-5" />
            Bank Reconciliation
          </DialogTitle>
          <DialogDescription>
            Reconcile your bank account balance with your bank statement
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {/* Account Selection */}
          <div className="space-y-2">
            <Label htmlFor="bank_account_id">Bank Account *</Label>
            {accountsLoading ? (
              <Loader message="Loading bank accounts..." size="sm" />
            ) : (
              <Select
                value={selectedAccountId}
                onValueChange={handleAccountChange}
                disabled={isReconciling}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select bank account" />
                </SelectTrigger>
                <SelectContent>
                  {bankAccounts.map((account) => (
                    <SelectItem key={account.id} value={account.id}>
                      {account.account_name} ({account.bank_name}) -{' '}
                      <CurrencyDisplay amount={account.current_balance} />
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
            {errors.bank_account_id && (
              <p className="text-sm text-destructive">{errors.bank_account_id.message}</p>
            )}
          </div>

          {/* Current Balance Display */}
          {selectedAccount && (
            <Card>
              <CardContent className="p-4">
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Current Balance:</span>
                    <CurrencyDisplay amount={selectedAccount.current_balance} size="sm" />
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Account:</span>
                    <span className="font-medium">
                      {selectedAccount.account_name} ({selectedAccount.bank_name})
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Statement Details */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="statement_date">Statement Date *</Label>
              <Input
                id="statement_date"
                type="date"
                {...register('statement_date')}
                disabled={isReconciling}
              />
              {errors.statement_date && (
                <p className="text-sm text-destructive">{errors.statement_date.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="statement_balance">Statement Balance (PKR) *</Label>
              <Input
                id="statement_balance"
                type="number"
                step="0.01"
                placeholder="0.00"
                {...register('statement_balance', { valueAsNumber: true })}
                disabled={isReconciling}
              />
              {errors.statement_balance && (
                <p className="text-sm text-destructive">{errors.statement_balance.message}</p>
              )}
            </div>
          </div>

          {/* Difference Display */}
          {selectedAccount && statementBalance !== 0 && (
            <Alert
              className={
                Math.abs(difference) < 0.01
                  ? 'bg-green-50 border-green-200 dark:bg-green-950 dark:border-green-900'
                  : difference > 0
                  ? 'bg-blue-50 border-blue-200 dark:bg-blue-950 dark:border-blue-900'
                  : 'bg-red-50 border-red-200 dark:bg-red-950 dark:border-red-900'
              }
            >
              <div className="flex items-start gap-3">
                {Math.abs(difference) < 0.01 ? (
                  <CheckCircle2 className="h-5 w-5 text-green-600 dark:text-green-400 mt-0.5" />
                ) : (
                  <AlertCircle className="h-5 w-5 text-blue-600 dark:text-blue-400 mt-0.5" />
                )}
                <div className="flex-1">
                  <div className="font-semibold mb-1">
                    {Math.abs(difference) < 0.01
                      ? 'Balances Match!'
                      : 'Balance Difference Detected'}
                  </div>
                  <div className="text-sm space-y-1">
                    <div className="flex justify-between">
                      <span>Current Balance:</span>
                      <CurrencyDisplay amount={selectedAccount.current_balance} size="sm" />
                    </div>
                    <div className="flex justify-between">
                      <span>Statement Balance:</span>
                      <CurrencyDisplay amount={statementBalance} size="sm" />
                    </div>
                    <div className="flex justify-between font-semibold pt-1 border-t">
                      <span>Difference:</span>
                      <CurrencyDisplay
                        amount={Math.abs(difference)}
                        variant={difference > 0 ? 'positive' : 'negative'}
                        size="sm"
                      />
                    </div>
                    {Math.abs(difference) >= 0.01 && (
                      <p className="text-xs text-muted-foreground mt-2">
                        An adjustment transaction will be created to reconcile the difference.
                      </p>
                    )}
                  </div>
                </div>
              </div>
            </Alert>
          )}

          {/* Notes */}
          <div className="space-y-2">
            <Label htmlFor="notes">Notes (Optional)</Label>
            <Textarea
              id="notes"
              placeholder="Add any notes about this reconciliation..."
              rows={3}
              {...register('notes')}
              disabled={isReconciling}
            />
            {errors.notes && (
              <p className="text-sm text-destructive">{errors.notes.message}</p>
            )}
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-3">
            <Button type="button" variant="outline" onClick={onClose} disabled={isReconciling}>
              Cancel
            </Button>
            <Button type="submit" disabled={isReconciling || !selectedAccountId}>
              {isReconciling ? 'Reconciling...' : 'Reconcile Account'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

