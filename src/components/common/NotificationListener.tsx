import { useEffect } from 'react';
import { useNotificationStore } from '@/stores/notificationStore';
import { useTableSubscription } from '@/hooks/useRealtime';
import { useToast } from '@/hooks/useToast';
import { logger } from '@/lib/logger';

/**
 * NotificationListener - Headless component that listens for global events
 * and adds them to the in-app notification store.
 */
export function NotificationListener() {
  const addNotification = useNotificationStore((state) => state.addNotification);
  const { success, info } = useToast();

  // Expose addNotification to window for testing/global access
  useEffect(() => {
    (window as any).__addNotification = addNotification;
    return () => {
      delete (window as any).__addNotification;
    };
  }, [addNotification]);

  // Listen for real notifications table
  useTableSubscription('notifications', (newNotif: any) => {
    try {
      addNotification({
        type: (newNotif.type as any) || 'info',
        title: newNotif.title || 'Notification',
        message: newNotif.message || '',
        actionUrl: newNotif.action_url,
        actionLabel: newNotif.action_label,
      });

      if (newNotif.type === 'success') {
        success(newNotif.title, { description: newNotif.message });
      } else {
        info(newNotif.title, { description: newNotif.message });
      }
      logger.info('Direct notification received:', newNotif.id);
    } catch (error) {
      logger.error('Error handling direct notification:', error);
    }
  });

  // Listen for new invoices
  useTableSubscription('invoices', (newInvoice: any) => {
    try {
      const title = 'New Invoice Created';
      const message = `Invoice ${newInvoice.invoice_number || 'N/A'} has been generated.`;
      
      addNotification({
        type: 'info',
        title,
        message,
        actionUrl: `/invoices/${newInvoice.id}`,
        actionLabel: 'View Invoice',
      });

      info(title, { description: message });
      logger.info('Notification added for new invoice:', newInvoice.id);
    } catch (error) {
      logger.error('Error handling invoice notification:', error);
    }
  });

  // Listen for payment transactions
  useTableSubscription('payment_transactions', (newPayment: any) => {
    try {
      const title = 'Payment Received';
      const message = `A payment of ${newPayment.amount || 0} has been received.`;
      
      addNotification({
        type: 'success',
        title,
        message,
        actionUrl: newPayment.invoice_id ? `/invoices/${newPayment.invoice_id}` : undefined,
        actionLabel: 'View Details',
      });

      success(title, { description: message });
      logger.info('Notification added for new payment:', newPayment.id);
    } catch (error) {
      logger.error('Error handling payment notification:', error);
    }
  });

  return null; // Headless component
}
