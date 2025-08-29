/**
 * Focus Management Hook
 * 
 * Provides focus management utilities for accessibility, including:
 * - Focus trapping for modal dialogs
 * - Focus restoration after modal close
 * - Programmatic focus management
 * - Skip link functionality
 */

import { useEffect, useRef, useCallback } from 'react';

interface UseFocusTrapOptions {
  isActive: boolean;
  initialFocusRef?: React.RefObject<HTMLElement>;
  restoreFocusRef?: React.RefObject<HTMLElement>;
  onEscape?: () => void;
}

/**
 * Hook for trapping focus within a container (e.g., modal dialogs)
 */
export function useFocusTrap(containerRef: React.RefObject<HTMLElement>, options: UseFocusTrapOptions) {
  const { isActive, initialFocusRef, restoreFocusRef, onEscape } = options;
  const previousActiveElement = useRef<HTMLElement | null>(null);

  const getFocusableElements = useCallback((container: HTMLElement): HTMLElement[] => {
    const focusableSelectors = [
      'a[href]',
      'button:not([disabled])',
      'input:not([disabled])',
      'select:not([disabled])',
      'textarea:not([disabled])',
      '[tabindex]:not([tabindex="-1"])',
      '[contenteditable="true"]'
    ].join(', ');

    return Array.from(container.querySelectorAll(focusableSelectors))
      .filter(el => {
        // Check if element is actually visible and not disabled
        const element = el as HTMLElement;
        return element.offsetParent !== null && !element.hasAttribute('disabled');
      }) as HTMLElement[];
  }, []);

  const handleKeyDown = useCallback((event: KeyboardEvent) => {
    if (!isActive || !containerRef.current) return;

    if (event.key === 'Escape' && onEscape) {
      onEscape();
      return;
    }

    if (event.key === 'Tab') {
      const focusableElements = getFocusableElements(containerRef.current);
      if (focusableElements.length === 0) {
        event.preventDefault();
        return;
      }

      const firstElement = focusableElements[0];
      const lastElement = focusableElements[focusableElements.length - 1];
      const activeElement = document.activeElement as HTMLElement;

      if (event.shiftKey) {
        // Shift + Tab: moving backward
        if (activeElement === firstElement) {
          event.preventDefault();
          lastElement.focus();
        }
      } else {
        // Tab: moving forward
        if (activeElement === lastElement) {
          event.preventDefault();
          firstElement.focus();
        }
      }
    }
  }, [isActive, containerRef, getFocusableElements, onEscape]);

  useEffect(() => {
    if (isActive && containerRef.current) {
      // Store the previously focused element
      previousActiveElement.current = document.activeElement as HTMLElement;

      // Focus the initial element or first focusable element
      const initialFocus = initialFocusRef?.current || getFocusableElements(containerRef.current)[0];
      if (initialFocus) {
        // Use setTimeout to ensure the element is rendered and focusable
        setTimeout(() => initialFocus.focus(), 0);
      }

      // Add event listener for keyboard navigation
      document.addEventListener('keydown', handleKeyDown);

      return () => {
        document.removeEventListener('keydown', handleKeyDown);
      };
    } else if (!isActive && previousActiveElement.current) {
      // Restore focus when deactivating
      const elementToFocus = restoreFocusRef?.current || previousActiveElement.current;
      if (elementToFocus && elementToFocus.isConnected) {
        elementToFocus.focus();
      }
      previousActiveElement.current = null;
    }
  }, [isActive, containerRef, initialFocusRef, restoreFocusRef, handleKeyDown, getFocusableElements]);
}

/**
 * Hook for managing focus restoration
 */
export function useFocusRestore() {
  const previousFocusRef = useRef<HTMLElement | null>(null);

  const saveFocus = useCallback(() => {
    previousFocusRef.current = document.activeElement as HTMLElement;
  }, []);

  const restoreFocus = useCallback(() => {
    if (previousFocusRef.current && previousFocusRef.current.isConnected) {
      previousFocusRef.current.focus();
      previousFocusRef.current = null;
    }
  }, []);

  return { saveFocus, restoreFocus };
}

/**
 * Hook for programmatic focus management
 */
export function useFocusManagement() {
  const focusElement = useCallback((selector: string | HTMLElement, options?: { preventScroll?: boolean }) => {
    const element = typeof selector === 'string' ? document.querySelector(selector) as HTMLElement : selector;
    if (element && element.focus) {
      element.focus(options);
    }
  }, []);

  const focusFirstError = useCallback(() => {
    const firstErrorElement = document.querySelector('[aria-invalid="true"], .error input, .border-red-500') as HTMLElement;
    if (firstErrorElement) {
      firstErrorElement.focus({ preventScroll: false });
      return true;
    }
    return false;
  }, []);

  const focusById = useCallback((id: string, options?: { preventScroll?: boolean }) => {
    const element = document.getElementById(id);
    if (element) {
      element.focus(options);
      return true;
    }
    return false;
  }, []);

  const announceToScreenReader = useCallback((message: string, priority: 'polite' | 'assertive' = 'polite') => {
    const announcement = document.createElement('div');
    announcement.setAttribute('aria-live', priority);
    announcement.setAttribute('aria-atomic', 'true');
    announcement.className = 'sr-only';
    announcement.textContent = message;
    
    document.body.appendChild(announcement);
    
    // Remove after announcement
    setTimeout(() => {
      document.body.removeChild(announcement);
    }, 1000);
  }, []);

  return {
    focusElement,
    focusFirstError,
    focusById,
    announceToScreenReader
  };
}

/**
 * Hook for skip link functionality
 */
export function useSkipLinks() {
  const createSkipLink = useCallback((targetId: string, text: string): HTMLElement => {
    const skipLink = document.createElement('a');
    skipLink.href = `#${targetId}`;
    skipLink.textContent = text;
    skipLink.className = 'sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-50 focus:px-4 focus:py-2 focus:bg-primary focus:text-primary-foreground focus:rounded';
    skipLink.addEventListener('click', (e) => {
      e.preventDefault();
      const target = document.getElementById(targetId);
      if (target) {
        target.focus();
        target.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    });
    return skipLink;
  }, []);

  const addSkipLinks = useCallback((links: Array<{ targetId: string; text: string }>) => {
    const container = document.createElement('div');
    container.setAttribute('role', 'navigation');
    container.setAttribute('aria-label', 'Skip links');
    
    links.forEach(({ targetId, text }) => {
      const skipLink = createSkipLink(targetId, text);
      container.appendChild(skipLink);
    });
    
    document.body.insertBefore(container, document.body.firstChild);
    return container;
  }, [createSkipLink]);

  return { createSkipLink, addSkipLinks };
}