/**
 * Feature Flag Admin Panel
 * Controls feature rollout for super admins
 */

import { useFeatureFlags } from '@/lib/api/feature-flags';
import { AlertTriangle, Zap, Database, Globe, BarChart3, RefreshCw } from 'lucide-react';

// ============================================
// Feature Flag Panel Component
// ============================================

interface FeatureFlagPanelProps {
  userRole?: string;
}

export function FeatureFlagPanel({ userRole }: FeatureFlagPanelProps) {
  const flags = useFeatureFlags();

  // Only super admins can view/modify feature flags
  if (userRole !== 'super_admin' && userRole !== 'admin') {
    return null;
  }

  const handleReset = () => {
    if (confirm('Reset all feature flags to defaults?')) {
      flags.reset();
    }
  };

  return (
    <div className="rounded-lg border border-yellow-500/50 bg-yellow-500/5 p-6">
      {/* Header */}
      <div className="mb-6 flex items-center gap-2">
        <AlertTriangle className="h-5 w-5 text-yellow-500" />
        <h2 className="text-lg font-semibold">Feature Flags</h2>
        <span className="ml-auto rounded-full bg-yellow-500/20 px-2 py-0.5 text-xs font-medium text-yellow-600">
          Admin Only
        </span>
      </div>

      <p className="mb-6 text-sm text-muted-foreground">
        Control feature rollout. Changes take effect immediately for all users.
      </p>

      <div className="space-y-6">
        {/* New API Toggle */}
        <FlagToggle
          icon={<Zap className="h-4 w-4" />}
          label="Use New API (NestJS)"
          description="Route requests through NestJS backend instead of Supabase"
          enabled={flags.useNewApi}
          onChange={(checked) => flags.setFlag('useNewApi', checked)}
        />

        {/* API Rollout Percentage */}
        {flags.useNewApi && (
          <div className="ml-8 space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium">Rollout Percentage</label>
              <span className="text-sm font-bold">{flags.newApiRollout}%</span>
            </div>
            <input
              type="range"
              min="0"
              max="100"
              step="5"
              value={flags.newApiRollout}
              onChange={(e) => flags.setFlag('newApiRollout', parseInt(e.target.value, 10))}
              className="w-full accent-primary"
            />
            <p className="text-xs text-muted-foreground">
              Percentage of users that will use the new API
            </p>
          </div>
        )}

        {/* TiDB Toggle */}
        <FlagToggle
          icon={<Database className="h-4 w-4" />}
          label="Use TiDB Database"
          description="Query data from TiDB instead of Supabase PostgreSQL"
          enabled={flags.useTiDB}
          onChange={(checked) => flags.setFlag('useTiDB', checked)}
          disabled={!flags.useNewApi}
        />

        {/* TiDB Rollout */}
        {flags.useTiDB && (
          <div className="ml-8 space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium">TiDB Rollout</label>
              <span className="text-sm font-bold">{flags.tidbRollout}%</span>
            </div>
            <input
              type="range"
              min="0"
              max="100"
              step="5"
              value={flags.tidbRollout}
              onChange={(e) => flags.setFlag('tidbRollout', parseInt(e.target.value, 10))}
              className="w-full accent-primary"
            />
          </div>
        )}

        {/* Edge API Toggle */}
        <FlagToggle
          icon={<Globe className="h-4 w-4" />}
          label="Edge Caching"
          description="Use Cloudflare Workers for edge caching and rate limiting"
          enabled={flags.useEdgeApi}
          onChange={(checked) => flags.setFlag('useEdgeApi', checked)}
        />

        {/* Analytics Toggle */}
        <FlagToggle
          icon={<BarChart3 className="h-4 w-4" />}
          label="Enhanced Analytics"
          description="Enable TiDB-powered analytics and reporting features"
          enabled={flags.enableAnalytics}
          onChange={(checked) => flags.setFlag('enableAnalytics', checked)}
          disabled={!flags.useTiDB}
        />

        {/* Dual Write Toggle */}
        <FlagToggle
          icon={<RefreshCw className="h-4 w-4" />}
          label="Dual Write Mode"
          description="Write to both Supabase and TiDB simultaneously (for migration)"
          enabled={flags.enableDualWrite}
          onChange={(checked) => flags.setFlag('enableDualWrite', checked)}
        />
      </div>

      {/* Reset Button */}
      <div className="mt-6 border-t pt-4">
        <button
          onClick={handleReset}
          className="text-sm text-muted-foreground transition-colors hover:text-foreground"
        >
          Reset to defaults
        </button>
      </div>

      {/* Current Status */}
      <div className="mt-4 rounded-md bg-muted/50 p-3">
        <p className="text-xs font-medium text-muted-foreground">Current Configuration</p>
        <div className="mt-2 flex flex-wrap gap-2">
          <StatusBadge
            label="API"
            value={flags.useNewApi ? 'NestJS' : 'Supabase'}
            active={flags.useNewApi}
          />
          <StatusBadge
            label="DB"
            value={flags.useTiDB ? 'TiDB' : 'PostgreSQL'}
            active={flags.useTiDB}
          />
          <StatusBadge
            label="Edge"
            value={flags.useEdgeApi ? 'ON' : 'OFF'}
            active={flags.useEdgeApi}
          />
          <StatusBadge
            label="Analytics"
            value={flags.enableAnalytics ? 'ON' : 'OFF'}
            active={flags.enableAnalytics}
          />
        </div>
      </div>
    </div>
  );
}

// ============================================
// Sub-components
// ============================================

interface FlagToggleProps {
  icon: React.ReactNode;
  label: string;
  description: string;
  enabled: boolean;
  onChange: (checked: boolean) => void;
  disabled?: boolean;
}

function FlagToggle({ icon, label, description, enabled, onChange, disabled }: FlagToggleProps) {
  return (
    <div className={`flex items-start justify-between ${disabled ? 'opacity-50' : ''}`}>
      <div className="flex items-start gap-3">
        <div className="mt-0.5 text-muted-foreground">{icon}</div>
        <div>
          <label className="text-sm font-medium">{label}</label>
          <p className="text-xs text-muted-foreground">{description}</p>
        </div>
      </div>
      <button
        onClick={() => !disabled && onChange(!enabled)}
        disabled={disabled}
        className={`
          relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent 
          transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2
          ${enabled ? 'bg-primary' : 'bg-muted'}
          ${disabled ? 'cursor-not-allowed' : ''}
        `}
        role="switch"
        aria-checked={enabled}
      >
        <span
          className={`
            pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 
            transition duration-200 ease-in-out
            ${enabled ? 'translate-x-5' : 'translate-x-0'}
          `}
        />
      </button>
    </div>
  );
}

interface StatusBadgeProps {
  label: string;
  value: string;
  active: boolean;
}

function StatusBadge({ label, value, active }: StatusBadgeProps) {
  return (
    <span
      className={`
        inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium
        ${active ? 'bg-green-500/20 text-green-600' : 'bg-muted text-muted-foreground'}
      `}
    >
      <span className="font-normal">{label}:</span>
      {value}
    </span>
  );
}

export default FeatureFlagPanel;
