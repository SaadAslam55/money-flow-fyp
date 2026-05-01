// src/components/settings/PreferenceSettings.tsx
/**
 * Preference Settings Component
 * App preferences like theme, language, display format, and accessibility
 */

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  Settings,
  Loader2,
  Sun,
  Moon,
  Monitor,
  Globe,
  Calendar,
  Clock,
  Type,
  Eye,
  Accessibility,
  Palette,
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { useThemeStore, type Theme } from '@/stores/themeStore';
import { useUserPreferences } from '@/hooks/useUser';
import { Loader } from '@/components/common/Loader';

// Schema for preferences
const preferencesSchema = z.object({
  theme: z.enum(['light', 'dark', 'system']),
  language: z.string(),
  dateFormat: z.enum(['DD/MM/YYYY', 'MM/DD/YYYY', 'YYYY-MM-DD']),
  timeFormat: z.enum(['12h', '24h']),
  currencyDisplay: z.enum(['symbol', 'code', 'name']),
  numberFormat: z.enum(['1,234.56', '1.234,56', '1 234,56']),
  fontSize: z.number().min(12).max(20),
  compactMode: z.boolean(),
  animations: z.boolean(),
  highContrast: z.boolean(),
  reducedMotion: z.boolean(),
});

type PreferencesFormData = z.infer<typeof preferencesSchema>;

const LANGUAGES = [
  { value: 'en', label: 'English' },
  { value: 'ur', label: 'اردو (Urdu)' },
  { value: 'ar', label: 'العربية (Arabic)' },
  { value: 'hi', label: 'हिन्दी (Hindi)' },
];

const DATE_FORMATS = [
  { value: 'DD/MM/YYYY', label: 'DD/MM/YYYY (31/12/2024)' },
  { value: 'MM/DD/YYYY', label: 'MM/DD/YYYY (12/31/2024)' },
  { value: 'YYYY-MM-DD', label: 'YYYY-MM-DD (2024-12-31)' },
];

const TIME_FORMATS = [
  { value: '12h', label: '12-hour (2:30 PM)' },
  { value: '24h', label: '24-hour (14:30)' },
];

const NUMBER_FORMATS = [
  { value: '1,234.56', label: '1,234.56 (US/UK)' },
  { value: '1.234,56', label: '1.234,56 (Europe)' },
  { value: '1 234,56', label: '1 234,56 (France)' },
];

export function PreferenceSettings() {
  const { preferences: backendPrefs, updatePreferences, isUpdating, isLoading } = useUserPreferences();
  const { theme: currentTheme, setTheme } = useThemeStore();
  const [formInitialized, setFormInitialized] = useState(false);

  const defaultValues: PreferencesFormData = {
    theme: currentTheme,
    language: 'en',
    dateFormat: 'DD/MM/YYYY',
    timeFormat: '12h',
    currencyDisplay: 'symbol',
    numberFormat: '1,234.56',
    fontSize: 14,
    compactMode: false,
    animations: true,
    highContrast: false,
    reducedMotion: false,
  };

  const {
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { isDirty },
  } = useForm<PreferencesFormData>({
    resolver: zodResolver(preferencesSchema),
    defaultValues,
  });

  // Sync backend preferences to form
  useEffect(() => {
    if (backendPrefs && !formInitialized) {
      reset({
        theme: (backendPrefs.theme as Theme) || currentTheme,
        language: backendPrefs.language || 'en',
        dateFormat: backendPrefs.dateFormat || 'DD/MM/YYYY',
        timeFormat: backendPrefs.timeFormat || '12h',
        currencyDisplay: backendPrefs.currencyDisplay || 'symbol',
        numberFormat: backendPrefs.numberFormat || '1,234.56',
        fontSize: backendPrefs.fontSize || 14,
        compactMode: backendPrefs.compactMode ?? false,
        animations: backendPrefs.animations ?? true,
        highContrast: backendPrefs.highContrast ?? false,
        reducedMotion: backendPrefs.reducedMotion ?? false,
      });
      setFormInitialized(true);
    }
  }, [backendPrefs, formInitialized, reset, currentTheme]);

  const theme = watch('theme');
  const language = watch('language');
  const dateFormat = watch('dateFormat');
  const timeFormat = watch('timeFormat');
  const numberFormat = watch('numberFormat');
  const fontSize = watch('fontSize');
  const compactMode = watch('compactMode');
  const animations = watch('animations');
  const highContrast = watch('highContrast');
  const reducedMotion = watch('reducedMotion');

  // Apply theme changes using the store
  useEffect(() => {
    if (theme !== currentTheme) {
      setTheme(theme as Theme);
    }
  }, [theme, currentTheme, setTheme]);

  // Apply font size
  useEffect(() => {
    document.documentElement.style.fontSize = `${fontSize}px`;
  }, [fontSize]);

  const handleFormSubmit = async (data: PreferencesFormData) => {
    try {
      // Save to backend
      await updatePreferences({
        theme: data.theme,
        language: data.language,
        dateFormat: data.dateFormat,
        timeFormat: data.timeFormat,
        currencyDisplay: data.currencyDisplay,
        numberFormat: data.numberFormat,
        fontSize: data.fontSize,
        compactMode: data.compactMode,
        animations: data.animations,
        highContrast: data.highContrast,
        reducedMotion: data.reducedMotion,
      });
    } catch {
      // Error handled by hook
    }
  };

  if (isLoading) {
    return <Loader message="Loading preferences..." />;
  }

  return (
    <div className="space-y-6">
      {/* Appearance */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Palette className="h-5 w-5" />
            Appearance
          </CardTitle>
          <CardDescription>Customize how the app looks</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Theme Selection */}
          <div className="space-y-3">
            <Label>Theme</Label>
            <RadioGroup
              value={theme}
              onValueChange={(value) =>
                setValue('theme', value as 'light' | 'dark' | 'system', { shouldDirty: true })
              }
              className="grid grid-cols-3 gap-4"
            >
              <Label
                htmlFor="theme-light"
                className={`flex cursor-pointer flex-col items-center gap-2 rounded-lg border-2 p-4 transition-all hover:bg-accent ${
                  theme === 'light' ? 'border-primary bg-primary/5' : 'border-muted'
                }`}
              >
                <RadioGroupItem value="light" id="theme-light" className="sr-only" />
                <Sun className="h-6 w-6" />
                <span className="text-sm font-medium">Light</span>
              </Label>
              <Label
                htmlFor="theme-dark"
                className={`flex cursor-pointer flex-col items-center gap-2 rounded-lg border-2 p-4 transition-all hover:bg-accent ${
                  theme === 'dark' ? 'border-primary bg-primary/5' : 'border-muted'
                }`}
              >
                <RadioGroupItem value="dark" id="theme-dark" className="sr-only" />
                <Moon className="h-6 w-6" />
                <span className="text-sm font-medium">Dark</span>
              </Label>
              <Label
                htmlFor="theme-system"
                className={`flex cursor-pointer flex-col items-center gap-2 rounded-lg border-2 p-4 transition-all hover:bg-accent ${
                  theme === 'system' ? 'border-primary bg-primary/5' : 'border-muted'
                }`}
              >
                <RadioGroupItem value="system" id="theme-system" className="sr-only" />
                <Monitor className="h-6 w-6" />
                <span className="text-sm font-medium">System</span>
              </Label>
            </RadioGroup>
          </div>

          {/* Font Size */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label className="flex items-center gap-2">
                <Type className="h-4 w-4" />
                Font Size
              </Label>
              <span className="text-sm text-muted-foreground">{fontSize}px</span>
            </div>
            <input
              type="range"
              min={12}
              max={20}
              step={1}
              value={fontSize}
              onChange={(e) =>
                setValue('fontSize', parseInt(e.target.value, 10), { shouldDirty: true })
              }
              className="h-2 w-full cursor-pointer appearance-none rounded-lg bg-muted accent-primary"
            />
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>Small</span>
              <span>Large</span>
            </div>
          </div>

          {/* Compact Mode */}
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="compact-mode" className="flex items-center gap-2">
                <Eye className="h-4 w-4" />
                Compact Mode
              </Label>
              <p className="text-sm text-muted-foreground">
                Reduce spacing for more content on screen
              </p>
            </div>
            <Switch
              id="compact-mode"
              checked={compactMode}
              onCheckedChange={(checked) => setValue('compactMode', checked, { shouldDirty: true })}
            />
          </div>
        </CardContent>
      </Card>

      {/* Language & Region */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Globe className="h-5 w-5" />
            Language & Region
          </CardTitle>
          <CardDescription>Set your language and regional preferences</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Language */}
          <div className="space-y-2">
            <Label>Language</Label>
            <Select
              value={language}
              onValueChange={(value) => setValue('language', value, { shouldDirty: true })}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {LANGUAGES.map((lang) => (
                  <SelectItem key={lang.value} value={lang.value}>
                    {lang.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Date Format */}
          <div className="space-y-2">
            <Label className="flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              Date Format
            </Label>
            <Select
              value={dateFormat}
              onValueChange={(value) =>
                setValue('dateFormat', value as PreferencesFormData['dateFormat'], {
                  shouldDirty: true,
                })
              }
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {DATE_FORMATS.map((format) => (
                  <SelectItem key={format.value} value={format.value}>
                    {format.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Time Format */}
          <div className="space-y-2">
            <Label className="flex items-center gap-2">
              <Clock className="h-4 w-4" />
              Time Format
            </Label>
            <Select
              value={timeFormat}
              onValueChange={(value) =>
                setValue('timeFormat', value as '12h' | '24h', { shouldDirty: true })
              }
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {TIME_FORMATS.map((format) => (
                  <SelectItem key={format.value} value={format.value}>
                    {format.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Number Format */}
          <div className="space-y-2">
            <Label>Number Format</Label>
            <Select
              value={numberFormat}
              onValueChange={(value) =>
                setValue('numberFormat', value as PreferencesFormData['numberFormat'], {
                  shouldDirty: true,
                })
              }
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {NUMBER_FORMATS.map((format) => (
                  <SelectItem key={format.value} value={format.value}>
                    {format.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Accessibility */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Accessibility className="h-5 w-5" />
            Accessibility
          </CardTitle>
          <CardDescription>Make the app easier to use</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="animations">Enable Animations</Label>
              <p className="text-sm text-muted-foreground">
                Show smooth transitions and animations
              </p>
            </div>
            <Switch
              id="animations"
              checked={animations}
              onCheckedChange={(checked) => setValue('animations', checked, { shouldDirty: true })}
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="high-contrast">High Contrast</Label>
              <p className="text-sm text-muted-foreground">
                Increase contrast for better visibility
              </p>
            </div>
            <Switch
              id="high-contrast"
              checked={highContrast}
              onCheckedChange={(checked) =>
                setValue('highContrast', checked, { shouldDirty: true })
              }
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="reduced-motion">Reduce Motion</Label>
              <p className="text-sm text-muted-foreground">
                Minimize animations for motion sensitivity
              </p>
            </div>
            <Switch
              id="reduced-motion"
              checked={reducedMotion}
              onCheckedChange={(checked) =>
                setValue('reducedMotion', checked, { shouldDirty: true })
              }
            />
          </div>
        </CardContent>
      </Card>

      {/* Save Button */}
      <div className="flex justify-end">
        <Button onClick={handleSubmit(handleFormSubmit)} disabled={isUpdating || !isDirty}>
          {isUpdating ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Saving...
            </>
          ) : (
            <>
              <Settings className="mr-2 h-4 w-4" />
              Save Preferences
            </>
          )}
        </Button>
      </div>
    </div>
  );
}
