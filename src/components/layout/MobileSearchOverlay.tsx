import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useNavigationStore } from '@/stores/navigationStore';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, X, Clock, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

export function MobileSearchOverlay() {
  const { searchOpen, setSearchOpen } = useNavigationStore();
  const navigate = useNavigate();
  const [query, setQuery] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  // Focus input when opened
  useEffect(() => {
    if (searchOpen) {
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [searchOpen]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      setSearchOpen(false);
      navigate(`/search?q=${encodeURIComponent(query)}`);
    }
  };

  const handleClose = () => {
    setSearchOpen(false);
    setQuery('');
  };

  return (
    <AnimatePresence>
      {searchOpen && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 20 }}
          className="fixed inset-0 z-[60] flex flex-col bg-background lg:hidden"
        >
          {/* Header */}
          <div className="flex items-center gap-2 border-b p-4">
            <Search className="h-5 w-5 text-muted-foreground" />
            <form onSubmit={handleSearch} className="flex-1">
              <Input
                ref={inputRef}
                type="search"
                placeholder="Search anything..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                className="h-auto border-none px-0 text-base shadow-none focus-visible:ring-0"
              />
            </form>
            <Button
              variant="ghost"
              size="icon"
              onClick={handleClose}
              className="h-8 w-8 rounded-full"
            >
              <X className="h-5 w-5" />
            </Button>
          </div>

          {/* Recent Searches / Suggestions */}
          <div className="flex-1 overflow-y-auto p-4">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-sm font-medium text-muted-foreground">Recent</h3>
              <Button
                variant="ghost"
                size="sm"
                className="h-auto px-2 text-xs text-muted-foreground"
              >
                Clear
              </Button>
            </div>

            <div className="space-y-1">
              {['Invoice #1023', 'John Doe', 'MacBook Pro'].map((item) => (
                <button
                  key={item}
                  onClick={() => {
                    setQuery(item);
                    navigate(`/search?q=${encodeURIComponent(item)}`);
                    setSearchOpen(false);
                  }}
                  className="group flex w-full items-center gap-3 rounded-lg p-3 text-left hover:bg-accent"
                >
                  <Clock className="h-4 w-4 text-muted-foreground" />
                  <span className="flex-1 text-sm">{item}</span>
                  <ArrowRight className="h-4 w-4 -translate-x-2 text-muted-foreground opacity-0 transition-all group-hover:translate-x-0 group-hover:opacity-100" />
                </button>
              ))}
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
