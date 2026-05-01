// src/components/settings/APISettings.tsx
import { logger } from '@/lib/logger';
import { useState } from 'react';
import { Key, Plus, Trash2, Eye, EyeOff, Copy, Check, Loader2 } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { useAPIKeys, useWebhooks } from '@/hooks/useSettings';
import { useAuth } from '@/hooks/useAuth';
import { Loader } from '@/components/common/Loader';
import { EmptyState } from '@/components/common/EmptyState';
import { StatusBadge } from '@/components/common/StatusBadge';
import { formatDate } from '@/lib/formatters';
import { useCopyToClipboard } from '@/hooks/useCopyToClipboard';
import { toast } from 'sonner';

export function APISettings() {
  const { organization } = useAuth();
  const { apiKeys, generateAPIKey, revokeAPIKey, deleteAPIKey, isLoading, isGenerating } = useAPIKeys();
  const { webhooks, createWebhook, updateWebhook, deleteWebhook, isLoading: webhooksLoading } = useWebhooks();
  const [showNewKeyDialog, setShowNewKeyDialog] = useState(false);
  const [newKeyName, setNewKeyName] = useState('');
  const [newKeyPermissions, setNewKeyPermissions] = useState<string[]>([]);
  const [generatedKey, setGeneratedKey] = useState<string | null>(null);
  const [showNewWebhookDialog, setShowNewWebhookDialog] = useState(false);
  const [newWebhookName, setNewWebhookName] = useState('');
  const [newWebhookUrl, setNewWebhookUrl] = useState('');
  const [newWebhookEvents, setNewWebhookEvents] = useState<string[]>([]);
  const { copyToClipboard, isCopied } = useCopyToClipboard();

  const availablePermissions = [
    'invoices:read',
    'invoices:write',
    'customers:read',
    'customers:write',
    'products:read',
    'products:write',
    'transactions:read',
    'transactions:write',
  ];

  const webhookEvents = [
    'invoice.created',
    'invoice.updated',
    'invoice.paid',
    'customer.created',
    'customer.updated',
    'payment.received',
  ];

  const handleGenerateKey = async () => {
    if (!newKeyName.trim() || newKeyPermissions.length === 0) {
      toast.error('Please provide a name and select at least one permission');
      return;
    }

    try {
      if (!organization?.id) {
        toast.error('Organization ID is required');
        return;
      }
      const result = await generateAPIKey({ name: newKeyName, permissions: newKeyPermissions });
      if (result.data?.key) {
        setGeneratedKey(result.data.key);
        setNewKeyName('');
        setNewKeyPermissions([]);
      }
    } catch (error) {

      logger.error('Error generating API key:', error instanceof Error ? error.message : String(error));
    }
  };

  const handleCreateWebhook = async () => {
    if (!newWebhookName.trim() || !newWebhookUrl.trim() || newWebhookEvents.length === 0) {
      toast.error('Please provide a name, URL and select at least one event');
      return;
    }

    try {
      const secret = crypto.randomUUID();
      await createWebhook({
        name: newWebhookName,
        url: newWebhookUrl,
        events: newWebhookEvents,
        secret,
      });
      setShowNewWebhookDialog(false);
      setNewWebhookName('');
      setNewWebhookUrl('');
      setNewWebhookEvents([]);
    } catch (error) {

      logger.error('Error creating webhook:', error instanceof Error ? error.message : String(error));
    }
  };

  const handleCopyKey = (key: string) => {
    copyToClipboard(key);
    toast.success('API key copied to clipboard');
  };

  if (isLoading || webhooksLoading) {
    return <Loader message="Loading API settings..." />;
  }

  return (
    <div className="space-y-6">
      {/* API Keys */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Key className="h-5 w-5" />
                API Keys
              </CardTitle>
              <CardDescription>Manage API keys for programmatic access</CardDescription>
            </div>
            <Button onClick={() => setShowNewKeyDialog(true)}>
              <Plus className="mr-2 h-4 w-4" />
              Generate Key
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {apiKeys.length === 0 ? (
            <EmptyState
              icon={Key}
              title="No API keys"
              description="Generate an API key to get started with programmatic access."
              action={
                <Button onClick={() => setShowNewKeyDialog(true)}>
                  <Plus className="mr-2 h-4 w-4" />
                  Generate Key
                </Button>
              }
            />
          ) : (
            <div className="space-y-4">
              {apiKeys.map((key) => (
                <div
                  key={key.id}
                  className="flex items-center justify-between p-4 border rounded-lg"
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <h4 className="font-medium">{key.name}</h4>
                      <StatusBadge
                        status={key.is_active ? 'active' : 'inactive'}
                        type="custom"
                        label={key.is_active ? 'Active' : 'Revoked'}
                      />
                    </div>
                    <div className="text-sm text-muted-foreground space-y-1">
                      <p>Permissions: {key.permissions?.join(', ') ?? 'None'}</p>
                      <p>Created: {formatDate(key.created_at)}</p>
                      {key.last_used_at && <p>Last used: {formatDate(key.last_used_at)}</p>}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {key.is_active ? (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => revokeAPIKey(key.id)}
                      >
                        Revoke
                      </Button>
                    ) : (
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => deleteAPIKey(key.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Webhooks */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Webhooks</CardTitle>
              <CardDescription>Configure webhooks to receive real-time events</CardDescription>
            </div>
            <Button onClick={() => setShowNewWebhookDialog(true)}>
              <Plus className="mr-2 h-4 w-4" />
              Add Webhook
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {webhooks.length === 0 ? (
            <EmptyState
              icon={Key}
              title="No webhooks"
              description="Configure webhooks to receive real-time events."
              action={
                <Button onClick={() => setShowNewWebhookDialog(true)}>
                  <Plus className="mr-2 h-4 w-4" />
                  Add Webhook
                </Button>
              }
            />
          ) : (
            <div className="space-y-4">
              {webhooks.map((webhook) => (
                <div key={webhook.id} className="p-4 border rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <h4 className="font-medium">{webhook.url}</h4>
                      <StatusBadge
                        status={webhook.is_active ? 'active' : 'inactive'}
                        type="custom"
                        label={webhook.is_active ? 'Active' : 'Inactive'}
                      />
                    </div>
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => deleteWebhook(webhook.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                  <div className="text-sm text-muted-foreground">
                    <p>Name: {webhook.name}</p>
                    <p>Events: {webhook.events.join(', ')}</p>
                    <p>Created: {formatDate(webhook.created_at)}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Generate API Key Dialog */}
      <Dialog open={showNewKeyDialog} onOpenChange={setShowNewKeyDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Generate New API Key</DialogTitle>
            <DialogDescription>
              Create a new API key with specific permissions. You'll only see the key once.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="key-name">Key Name</Label>
              <Input
                id="key-name"
                value={newKeyName}
                onChange={(e) => setNewKeyName(e.target.value)}
                placeholder="e.g., Production Key"
              />
            </div>
            <div className="space-y-2">
              <Label>Permissions</Label>
              <div className="space-y-2">
                {availablePermissions.map((permission) => (
                  <div key={permission} className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id={permission}
                      checked={newKeyPermissions.includes(permission)}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setNewKeyPermissions([...newKeyPermissions, permission]);
                        } else {
                          setNewKeyPermissions(newKeyPermissions.filter((p) => p !== permission));
                        }
                      }}
                      className="rounded"
                    />
                    <Label htmlFor={permission} className="font-normal cursor-pointer">
                      {permission}
                    </Label>
                  </div>
                ))}
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowNewKeyDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleGenerateKey} disabled={isGenerating}>
              {isGenerating ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Generating...
                </>
              ) : (
                'Generate Key'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Generated Key Display */}
      {generatedKey && (
        <Dialog open={!!generatedKey} onOpenChange={() => setGeneratedKey(null)}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>API Key Generated</DialogTitle>
              <DialogDescription>
                Copy this key now. You won't be able to see it again.
              </DialogDescription>
            </DialogHeader>
            <Alert>
              <AlertTitle>Important</AlertTitle>
              <AlertDescription>
                Store this key securely. It will not be shown again.
              </AlertDescription>
            </Alert>
            <div className="flex items-center gap-2 p-3 bg-muted rounded-lg">
              <code className="flex-1 text-sm">{generatedKey}</code>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleCopyKey(generatedKey)}
              >
                {isCopied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
              </Button>
            </div>
            <DialogFooter>
              <Button onClick={() => setGeneratedKey(null)}>Done</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}

      {/* Create Webhook Dialog */}
      <Dialog open={showNewWebhookDialog} onOpenChange={setShowNewWebhookDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Webhook</DialogTitle>
            <DialogDescription>Configure a webhook endpoint to receive events</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="webhook-name">Webhook Name</Label>
              <Input
                id="webhook-name"
                value={newWebhookName}
                onChange={(e) => setNewWebhookName(e.target.value)}
                placeholder="e.g., Zapier Integration"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="webhook-url">Webhook URL</Label>
              <Input
                id="webhook-url"
                type="url"
                value={newWebhookUrl}
                onChange={(e) => setNewWebhookUrl(e.target.value)}
                placeholder="https://example.com/webhook"
              />
            </div>
            <div className="space-y-2">
              <Label>Events</Label>
              <div className="space-y-2 max-h-48 overflow-y-auto">
                {webhookEvents.map((event) => (
                  <div key={event} className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id={event}
                      checked={newWebhookEvents.includes(event)}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setNewWebhookEvents([...newWebhookEvents, event]);
                        } else {
                          setNewWebhookEvents(newWebhookEvents.filter((ev) => ev !== event));
                        }
                      }}
                      className="rounded"
                    />
                    <Label htmlFor={event} className="font-normal cursor-pointer">
                      {event}
                    </Label>
                  </div>
                ))}
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowNewWebhookDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleCreateWebhook}>Create Webhook</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

