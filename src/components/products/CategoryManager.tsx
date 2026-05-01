// src/components/products/CategoryManager.tsx
import { logger } from '@/lib/logger';
import { useState } from 'react';
import { Plus, Tag, X, Edit2, Trash2, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader } from '@/components/common/Loader';
import { EmptyState } from '@/components/common/EmptyState';
import { useProductCategories, useProducts } from '@/hooks/useProducts';
import { toast } from 'sonner';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

interface CategoryManagerProps {
  onCategorySelect?: (category: string) => void;
}

export function CategoryManager({ onCategorySelect }: CategoryManagerProps) {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [newCategory, setNewCategory] = useState('');
  const [isCreating, setIsCreating] = useState(false);
  const { categories, isLoading } = useProductCategories();
  const { products } = useProducts();

  // Count products per category
  const categoryCounts = (categories ?? []).reduce((acc, category) => {
    const count = products.filter((p) => p.category === category).length;
    acc[category] = count;
    return acc;
  }, {} as Record<string, number>);

  const handleCreateCategory = async () => {
    if (!newCategory.trim()) {
      toast.error('Category name is required');
      return;
    }

    if (categories.includes(newCategory)) {
      toast.error('Category already exists');
      return;
    }

    setIsCreating(true);
    try {
      // Note: This is a simplified implementation
      // In a real app, you'd have a dedicated API endpoint for managing categories
      // For now, categories are managed through products
      toast.success('Category will be created when you assign it to a product');
      setNewCategory('');
      setIsDialogOpen(false);
    } catch (error) {
      toast.error('Failed to create category');

      logger.error(
        'CategoryManager error:',
        error instanceof Error ? error.message : String(error),
      );
    } finally {
      setIsCreating(false);
    }
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Tag className="h-5 w-5" />
            Categories
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Loader size="md" message="Loading categories..." />
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Tag className="h-5 w-5" />
              Product Categories
            </CardTitle>
            <Button size="sm" onClick={() => setIsDialogOpen(true)}>
              <Plus className="mr-2 h-4 w-4" />
              Add Category
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {!categories || categories.length === 0 ? (
            <EmptyState
              icon={Tag}
              title="No categories yet"
              description="Create your first category to organize products"
              action={{
                label: 'Create First Category',
                onClick: () => setIsDialogOpen(true),
              }}
            />
          ) : (
            <div className="rounded-lg border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Category Name</TableHead>
                    <TableHead>Products</TableHead>
                    <TableHead className="w-24"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {(categories ?? []).map((category) => {
                    const count = categoryCounts[category] || 0;
                    return (
                      <TableRow key={category}>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Tag className="text-muted-foreground h-4 w-4" />
                            <span className="font-medium">{category}</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant="secondary">{count} product{count !== 1 ? 's' : ''}</Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            {onCategorySelect && (
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => onCategorySelect(category)}
                              >
                                Select
                              </Button>
                            )}
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create New Category</DialogTitle>
            <DialogDescription>
              Add a new category to organize your products
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="category-name">Category Name</Label>
              <Input
                id="category-name"
                placeholder="e.g., Electronics, Clothing, Services"
                value={newCategory}
                onChange={(e) => setNewCategory(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    handleCreateCategory();
                  }
                }}
                disabled={isCreating}
              />
              <p className="text-muted-foreground text-xs">
                Categories help organize your product catalog
              </p>
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setIsDialogOpen(false);
                setNewCategory('');
              }}
              disabled={isCreating}
            >
              Cancel
            </Button>
            <Button onClick={handleCreateCategory} disabled={isCreating || !newCategory.trim()}>
              {isCreating ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Creating...
                </>
              ) : (
                <>
                  <Plus className="mr-2 h-4 w-4" />
                  Create Category
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}

