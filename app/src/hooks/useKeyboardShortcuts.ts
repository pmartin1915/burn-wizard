/**
 * Keyboard Shortcuts Hook for Burn Wizard
 * 
 * Provides centralized keyboard shortcut management with:
 * - Global navigation shortcuts
 * - Context-aware shortcuts (tour, body map, etc.)
 * - Accessibility compliance (WCAG standards)
 * - Cross-browser compatibility
 * - Conflict prevention with form inputs
 */

import { useEffect, useRef, useCallback } from 'react';

export interface KeyboardShortcut {
  key: string;
  ctrlKey?: boolean;
  altKey?: boolean;
  shiftKey?: boolean;
  metaKey?: boolean;
  action: () => void;
  description: string;
  context?: 'global' | 'tour' | 'bodymap' | 'forms';
  disabled?: boolean;
}

interface UseKeyboardShortcutsOptions {
  enabled?: boolean;
  context?: 'global' | 'tour' | 'bodymap' | 'forms';
  preventDefaultOnMatch?: boolean;
}

const DEFAULT_OPTIONS: UseKeyboardShortcutsOptions = {
  enabled: true,
  context: 'global',
  preventDefaultOnMatch: true,
};

export function useKeyboardShortcuts(
  shortcuts: KeyboardShortcut[],
  options: UseKeyboardShortcutsOptions = {}
) {
  const opts = { ...DEFAULT_OPTIONS, ...options };
  const shortcutsRef = useRef<KeyboardShortcut[]>([]);
  
  // Update shortcuts ref when shortcuts change
  useEffect(() => {
    shortcutsRef.current = shortcuts;
  }, [shortcuts]);

  const shouldIgnoreEvent = useCallback((event: KeyboardEvent): boolean => {
    const target = event.target as HTMLElement;
    
    // Ignore if typing in inputs, textareas, or contenteditable elements
    if (
      target.tagName === 'INPUT' ||
      target.tagName === 'TEXTAREA' ||
      target.contentEditable === 'true' ||
      target.isContentEditable
    ) {
      return true;
    }
    
    // Ignore if disabled
    if (!opts.enabled) {
      return true;
    }
    
    return false;
  }, [opts.enabled]);

  const handleKeyDown = useCallback((event: KeyboardEvent) => {
    if (shouldIgnoreEvent(event)) {
      return;
    }

    const matchingShortcut = shortcutsRef.current.find(shortcut => {
      if (shortcut.disabled) return false;
      
      // Check context match
      if (shortcut.context && shortcut.context !== opts.context) {
        return false;
      }
      
      // Check key match (case insensitive)
      const keyMatch = event.key.toLowerCase() === shortcut.key.toLowerCase() ||
                      event.code.toLowerCase() === shortcut.key.toLowerCase();
      
      if (!keyMatch) return false;
      
      // Check modifier keys
      const ctrlMatch = !!shortcut.ctrlKey === (event.ctrlKey || event.metaKey);
      const altMatch = !!shortcut.altKey === event.altKey;
      const shiftMatch = !!shortcut.shiftKey === event.shiftKey;
      
      return ctrlMatch && altMatch && shiftMatch;
    });

    if (matchingShortcut) {
      if (opts.preventDefaultOnMatch) {
        event.preventDefault();
        event.stopPropagation();
      }
      
      // Execute the action
      try {
        matchingShortcut.action();
      } catch (error) {
        console.error('Error executing keyboard shortcut:', error);
      }
    }
  }, [shouldIgnoreEvent, opts.context, opts.preventDefaultOnMatch]);

  useEffect(() => {
    if (!opts.enabled) return;
    
    document.addEventListener('keydown', handleKeyDown);
    
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [handleKeyDown, opts.enabled]);

  // Return utility functions
  return {
    isEnabled: opts.enabled,
    context: opts.context,
    addShortcut: useCallback((shortcut: KeyboardShortcut) => {
      shortcutsRef.current = [...shortcutsRef.current, shortcut];
    }, []),
    removeShortcut: useCallback((key: string) => {
      shortcutsRef.current = shortcutsRef.current.filter(s => s.key !== key);
    }, []),
    getShortcuts: useCallback(() => shortcutsRef.current, []),
  };
}

/**
 * Format keyboard shortcut for display
 * Handles cross-platform differences (Cmd on Mac, Ctrl on Windows/Linux)
 */
export function formatShortcut(shortcut: KeyboardShortcut): string {
  const isMac = typeof navigator !== 'undefined' && navigator.platform.toUpperCase().indexOf('MAC') >= 0;
  
  const parts: string[] = [];
  
  if (shortcut.ctrlKey) {
    parts.push(isMac ? '⌘' : 'Ctrl');
  }
  if (shortcut.altKey) {
    parts.push(isMac ? '⌥' : 'Alt');
  }
  if (shortcut.shiftKey) {
    parts.push('⇧');
  }
  
  // Format special keys
  let keyDisplay = shortcut.key;
  switch (shortcut.key.toLowerCase()) {
    case ' ':
    case 'space':
      keyDisplay = 'Space';
      break;
    case 'escape':
      keyDisplay = 'Esc';
      break;
    case 'enter':
      keyDisplay = 'Enter';
      break;
    case 'tab':
      keyDisplay = 'Tab';
      break;
    case 'arrowup':
      keyDisplay = '↑';
      break;
    case 'arrowdown':
      keyDisplay = '↓';
      break;
    case 'arrowleft':
      keyDisplay = '←';
      break;
    case 'arrowright':
      keyDisplay = '→';
      break;
    case '?':
      keyDisplay = '?';
      break;
    default:
      keyDisplay = shortcut.key.toUpperCase();
  }
  
  parts.push(keyDisplay);
  return parts.join(isMac ? '' : '+');
}

/**
 * Predefined shortcut configurations
 */
export const SHORTCUTS = {
  // Navigation shortcuts
  NAVIGATE_TBSA: { key: '1', altKey: true, description: 'Navigate to TBSA Assessment' },
  NAVIGATE_SCENARIOS: { key: '2', altKey: true, description: 'Navigate to Scenarios' },
  NAVIGATE_TUTORIALS: { key: '3', altKey: true, description: 'Navigate to Tutorials' },
  NAVIGATE_PROCEDURE: { key: '4', altKey: true, description: 'Navigate to Procedure' },
  NAVIGATE_DISCHARGE: { key: '5', altKey: true, description: 'Navigate to Discharge' },
  NAVIGATE_HISTORY: { key: '6', altKey: true, description: 'Navigate to History' },
  NAVIGATE_SETTINGS: { key: '7', altKey: true, description: 'Navigate to Settings' },
  
  // Tour shortcuts
  TOUR_NEXT: { key: 'Space', description: 'Next tutorial step', context: 'tour' as const },
  TOUR_PREVIOUS: { key: 'Space', shiftKey: true, description: 'Previous tutorial step', context: 'tour' as const },
  TOUR_CLOSE: { key: 'Escape', description: 'Close tutorial', context: 'tour' as const },
  TOUR_RESTART: { key: 'r', description: 'Restart tutorial', context: 'tour' as const },
  
  // General shortcuts
  SHOW_HELP: { key: '?', description: 'Show keyboard shortcuts help' },
  SHOW_HELP_F1: { key: 'F1', description: 'Show keyboard shortcuts help' },
  SAVE: { key: 's', ctrlKey: true, description: 'Save current assessment' },
  
  // Body map shortcuts
  CLEAR_SELECTIONS: { key: 'c', description: 'Clear all body region selections', context: 'bodymap' as const },
  INCREASE_BURN: { key: '=', description: 'Increase burn percentage', context: 'bodymap' as const },
  DECREASE_BURN: { key: '-', description: 'Decrease burn percentage', context: 'bodymap' as const },
} as const;