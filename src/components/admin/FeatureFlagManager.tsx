// src/components/admin/FeatureFlagManager.tsx
import { useState } from 'react';
import { Flag, Plus, Trash2 } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { toast } from 'sonner';

interface FeatureFlag {
  id: string;
  name: string;
  description: string;
  enabled: boolean;
  rolloutPercentage: number;
  createdAt: string;
}

// Mock data - in production this would come from API
const MOCK_FLAGS: FeatureFlag[] = [
  {
    id: '1',
    name: 'advanced_reports',
    description: 'Enable advanced reporting features',
    enabled: true,
    rolloutPercentage: 100,
    createdAt: '2024-01-15',
  },
  {
    id: '2',
    name: 'api_access',
    description: 'Allow organizations to use API',
    enabled: false,
    rolloutPercentage: 0,
    createdAt: '2024-02-01',
  },
  {
    id: '3',
    name: 'multi_currency',
    description: 'Support for multiple currencies',
    enabled: true,
    rolloutPercentage: 50,
    createdAt: '2024-03-10',
  },
  {
    id: '4',
    name: 'ai_insights',
    description: 'AI-powered business insights',
    enabled: true,
    rolloutPercentage: 25,
    createdAt: '2024-04-01',
  },
];

export function FeatureFlagManager() {
  const [flags, setFlags] = useState<FeatureFlag[]>(MOCK_FLAGS);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [newFlag, setNewFlag] = useState({
    name: '',
    description: '',
    enabled: false,
    rolloutPercentage: 0,
  });

  const toggleFlag = (id: string) => {
    setFlags((prev) =>
      prev.map((flag) => (flag.id === id ? { ...flag, enabled: !flag.enabled } : flag))
    );
    toast.success('Feature flag updated');
  };

  const updateRollout = (id: string, percentage: number) => {
    setFlags((prev) =>
      prev.map((flag) => (flag.id === id ? { ...flag, rolloutPercentage: percentage } : flag))
    );
  };

  const handleAddFlag = () => {
    if (!newFlag.name.trim()) {
      toast.error('Flag name is required');
      return;
    }

    const flag: FeatureFlag = {
      id: Date.now().toString(),
      name: newFlag.name.toLowerCase().replace(/\s+/g, '_'),
      description: newFlag.description,
      enabled: newFlag.enabled,
      rolloutPercentage: newFlag.rolloutPercentage,
      createdAt: new Date().toISOString().split('T')[0] ?? '',
    };

    setFlags((prev) => [...prev, flag]);
    setNewFlag({ name: '', description: '', enabled: false, rolloutPercentage: 0 });
    setIsDialogOpen(false);
    toast.success('Feature flag created');
  };

  const deleteFlag = (id: string) => {
    setFlags((prev) => prev.filter((flag) => flag.id !== id));
    toast.success('Feature flag deleted');
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Flag className="h-5 w-5" />
              Feature Flags
            </CardTitle>
            <CardDescription>
              Manage feature flags and rollout percentages across the platform.
            </CardDescription>
          </div>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                Add Flag
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Create Feature Flag</DialogTitle>
                <DialogDescription>
                  Add a new feature flag to control feature rollout.
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="flag-name">Name</Label>
                  <Input
                    id="flag-name"
                    placeholder="e.g., new_dashboard"
                    value={newFlag.name}
                    onChange={(e) => setNewFlag({ ...newFlag, name: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="flag-description">Description</Label>
                  <Input
                    id="flag-description"
                    placeholder="What does this flag control?"
                    value={newFlag.description}
                    onChange={(e) => setNewFlag({ ...newFlag, description: e.target.value })}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <Label htmlFor="flag-enabled">Enabled by default</Label>
                  <Switch
                    id="flag-enabled"
                    checked={newFlag.enabled}
                    onCheckedChange={(checked) => setNewFlag({ ...newFlag, enabled: checked })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Rollout Percentage: {newFlag.rolloutPercentage}%</Label>
                  <Input
                    type="range"
                    min={0}
                    max={100}
                    step={5}
                    value={newFlag.rolloutPercentage}
                    onChange={(e) =>
                      setNewFlag({ ...newFlag, rolloutPercentage: Number(e.target.value) })
                    }
                    className="w-full"
                  />
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={handleAddFlag}>Create Flag</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </CardHeader>
      <CardContent>
        <div className="rounded-lg border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Feature</TableHead>
                <TableHead>Description</TableHead>
                <TableHead className="text-center">Status</TableHead>
                <TableHead className="text-center">Rollout</TableHead>
                <TableHead className="w-24">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {flags.map((flag) => (
                <TableRow key={flag.id}>
                  <TableCell className="font-mono text-sm font-medium">{flag.name}</TableCell>
                  <TableCell className="text-muted-foreground">{flag.description}</TableCell>
                  <TableCell className="text-center">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => toggleFlag(flag.id)}
                      className="p-0"
                    >
                      {flag.enabled ? (
                        <Badge variant="default" className="bg-green-600 hover:bg-green-700">
                          Enabled
                        </Badge>
                      ) : (
                        <Badge variant="secondary">Disabled</Badge>
                      )}
                    </Button>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Input
                        type="range"
                        min={0}
                        max={100}
                        step={5}
                        value={flag.rolloutPercentage}
                        onChange={(e) => updateRollout(flag.id, Number(e.target.value))}
                        className="w-24"
                        disabled={!flag.enabled}
                      />
                      <span className="w-12 text-right text-sm">{flag.rolloutPercentage}%</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => deleteFlag(flag.id)}
                      className="text-destructive hover:text-destructive"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
}
