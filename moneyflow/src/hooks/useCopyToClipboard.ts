// src/hooks/useCopyToClipboard.ts
/**
 * Copy to Clipboard Hook
 * Provides clipboard functionality with feedback
 */

import { logger } from '@/lib/logger';
import { useState, useCallback } from 'react';
import { toast } from 'sonner';

/**
 * Hook to copy text to clipboard
 * 
 * @param resetDelay - Delay in milliseconds before resetting isCopied state (default: 2000)
 * @returns Copy function and copied state
 * 
 * @example
 * ```tsx
 * let { copyToClipboard, isCopied } = useCopyToClipboard();
 * 
 * <button onClick={() => copyToClipboard('Text to copy')}>
 *   {isCopied ? 'Copied!' : 'Copy'}
 * </button>
 * ```
 */
export function useCopyToClipboard(resetDelay = 2000) {
  const [isCopied, setIsCopied] = useState(false);

  const copyToClipboard = useCallback(
    async (text: string, showToast = true) => {
      try {
        // Check if clipboard API is available
        if (!navigator.clipboard) {
          // Fallback for older browsers
          const textArea = document.createElement('textarea');
          textArea.value = text;
          textArea.style.position = 'fixed';
          textArea.style.left = '-999999px';
          document.body.appendChild(textArea);
          textArea.select();
          document.execCommand('copy');
          document.body.removeChild(textArea);
        } else {
          await navigator.clipboard.writeText(text);
        }

        setIsCopied(true);

        if (showToast) {
          toast.success('Copied to clipboard');
        }

        setTimeout(() => {
          setIsCopied(false);
        }, resetDelay);
      } catch (error) {

        logger.error('Failed to copy to clipboard:', error instanceof Error ? error.message : String(error));
        toast.error('Failed to copy to clipboard');
      }
    },
    [resetDelay]
  );

  return { copyToClipboard, isCopied };
}

