// src/lib/accessibility.ts
/**
 * Accessibility Utilities
 * Provides utilities for improving accessibility across the application
 */

/**
 * Announce message to screen readers
 */
export function announceToScreenReader(
  message: string,
  priority: 'polite' | 'assertive' = 'polite'
) {
  const announcement = document.createElement('div');
  announcement.setAttribute('role', 'status');
  announcement.setAttribute('aria-live', priority);
  announcement.setAttribute('aria-atomic', 'true');
  announcement.className = 'sr-only';
  announcement.textContent = message;

  document.body.appendChild(announcement);

  // Remove after announcement
  setTimeout(() => {
    document.body.removeChild(announcement);
  }, 1000);
}

/**
 * Focus trap for modals and dialogs
 */
export class FocusTrap {
  private element: HTMLElement;
  private previousFocus: HTMLElement | null = null;
  private isActive = false;

  constructor(element: HTMLElement) {
    this.element = element;
  }

  activate() {
    if (this.isActive) return;

    this.previousFocus = document.activeElement as HTMLElement;
    this.isActive = true;

    // Focus first focusable element
    const focusableElements = this.getFocusableElements();
    const firstElement = focusableElements[0];
    if (firstElement) {
      firstElement.focus();
    }

    // Listen for Tab key
    document.addEventListener('keydown', this.handleKeyDown);
  }

  deactivate() {
    if (!this.isActive) return;

    this.isActive = false;
    document.removeEventListener('keydown', this.handleKeyDown);

    // Restore focus
    if (this.previousFocus) {
      this.previousFocus.focus();
    }
  }

  private handleKeyDown = (event: KeyboardEvent) => {
    if (event.key !== 'Tab') return;

    const focusableElements = this.getFocusableElements();
    if (focusableElements.length === 0) return;

    const firstElement = focusableElements[0];
    const lastElement = focusableElements[focusableElements.length - 1];
    const { activeElement } = document;

    if (event.shiftKey) {
      // Shift + Tab
      if (activeElement === firstElement && lastElement) {
        event.preventDefault();
        lastElement.focus();
      }
    } else {
      // Tab
      if (activeElement === lastElement && firstElement) {
        event.preventDefault();
        firstElement.focus();
      }
    }
  };

  private getFocusableElements(): HTMLElement[] {
    const selector =
      'a[href], button:not([disabled]), textarea:not([disabled]), input:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])';
    return Array.from(this.element.querySelectorAll(selector));
  }
}

/**
 * Generate unique ID for accessibility attributes
 */
let idCounter = 0;
export function generateA11yId(prefix = 'a11y'): string {
  idCounter += 1;
  return `${prefix}-${idCounter}-${Date.now()}`;
}

/**
 * Skip to content link functionality
 */
export function setupSkipToContent() {
  const skipLink = document.createElement('a');
  skipLink.href = '#main-content';
  skipLink.textContent = 'Skip to main content';
  skipLink.className =
    'sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-50 focus:px-4 focus:py-2 focus:bg-primary focus:text-primary-foreground focus:rounded-md';

  document.body.insertBefore(skipLink, document.body.firstChild);

  skipLink.addEventListener('click', (e) => {
    e.preventDefault();
    const mainContent = document.getElementById('main-content');
    if (mainContent) {
      mainContent.focus();
      mainContent.scrollIntoView({ behavior: 'smooth' });
    }
  });
}

/**
 * Check if reduced motion is preferred
 */
export function prefersReducedMotion(): boolean {
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

/**
 * Check if high contrast is preferred
 */
export function prefersHighContrast(): boolean {
  return window.matchMedia('(prefers-contrast: high)').matches;
}

/**
 * Check if dark mode is preferred
 */
export function prefersDarkMode(): boolean {
  return window.matchMedia('(prefers-color-scheme: dark)').matches;
}

/**
 * Set ARIA busy state
 */
export function setAriaLoading(element: HTMLElement, loading: boolean) {
  element.setAttribute('aria-busy', String(loading));
  if (loading) {
    element.setAttribute('aria-live', 'polite');
  } else {
    element.removeAttribute('aria-live');
  }
}

/**
 * Manage focus for route changes
 */
export function handleRouteChange() {
  const mainContent = document.getElementById('main-content');
  if (mainContent) {
    mainContent.focus();
    announceToScreenReader('Page changed', 'polite');
  }
}

/**
 * ARIA label helpers
 */
export const ariaLabel = {
  loading: 'Loading content',
  error: 'Error loading content',
  empty: 'No items found',
  search: 'Search',
  filter: 'Filter results',
  sort: 'Sort results',
  pagination: 'Pagination',
  close: 'Close',
  menu: 'Menu',
  delete: 'Delete item',
  edit: 'Edit item',
  add: 'Add new item',
  save: 'Save changes',
  cancel: 'Cancel',
};
