import { useNavigationStore } from '@/stores/navigationStore';
import { motion, AnimatePresence } from 'framer-motion';
import { FileText, UserPlus, Package, Receipt, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';

export function MobileActionSheet() {
  const { bottomSheetOpen, closeAllMobileMenus } = useNavigationStore();
  const navigate = useNavigate();

  const actions = [
    {
      label: 'New Invoice',
      icon: FileText,
      path: '/invoices/new',
      color: 'text-blue-500 bg-blue-50',
    },
    {
      label: 'New Customer',
      icon: UserPlus,
      path: '/customers/new',
      color: 'text-green-500 bg-green-50',
    },
    {
      label: 'Add Product',
      icon: Package,
      path: '/products/new',
      color: 'text-purple-500 bg-purple-50',
    },
    {
      label: 'Record Expense',
      icon: Receipt,
      path: '/expenses/new',
      color: 'text-amber-500 bg-amber-50',
    },
  ];

  const handleAction = (path: string) => {
    closeAllMobileMenus();
    navigate(path);
  };

  return (
    <AnimatePresence>
      {bottomSheetOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm lg:hidden"
            onClick={closeAllMobileMenus}
          />

          {/* Bottom Sheet */}
          <motion.div
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="pb-safe-area-bottom fixed bottom-0 left-0 right-0 z-50 rounded-t-3xl bg-background shadow-[0_-4px_24px_rgba(0,0,0,0.1)] lg:hidden"
          >
            <div className="mx-auto mb-5 mt-3 h-1.5 w-12 rounded-full bg-muted" />

            <div className="px-6 pb-8">
              <div className="mb-6 flex items-center justify-between">
                <h3 className="text-lg font-semibold">Quick Actions</h3>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={closeAllMobileMenus}
                  className="h-8 w-8 rounded-full"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>

              <div className="grid grid-cols-2 gap-4">
                {actions.map((action) => (
                  <button
                    key={action.label}
                    onClick={() => handleAction(action.path)}
                    className="flex flex-col items-center justify-center gap-3 rounded-xl border bg-card p-4 transition-all hover:bg-accent/50 active:scale-95"
                  >
                    <div className={`rounded-full p-3 ${action.color}`}>
                      <action.icon className="h-6 w-6" />
                    </div>
                    <span className="text-sm font-medium">{action.label}</span>
                  </button>
                ))}
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
