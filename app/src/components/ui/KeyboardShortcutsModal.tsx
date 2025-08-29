import React from 'react';
import { X } from 'lucide-react';
import { useFocusTrap } from '@/hooks/useFocusManagement';
import { useLiveAnnouncer } from './LiveAnnouncer';
import { SHORTCUTS } from '@/hooks/useKeyboardShortcuts';
import { Button } from './button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from './dialog';

// Helper function to format shortcuts for display (without requiring action property)
const formatShortcutForDisplay = (shortcut: {
  key: string;
  ctrlKey?: boolean;
  altKey?: boolean;
  shiftKey?: boolean;
  metaKey?: boolean;
  description: string;
  context?: string;
}): string => {
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
};

interface KeyboardShortcutsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

// Group shortcuts by context for better organization
const shortcutGroups = [
  {
    title: 'Navigation',
    shortcuts: [
      SHORTCUTS.NAVIGATE_TBSA,
      SHORTCUTS.NAVIGATE_SCENARIOS,
      SHORTCUTS.NAVIGATE_TUTORIALS,
      SHORTCUTS.NAVIGATE_PROCEDURE,
      SHORTCUTS.NAVIGATE_DISCHARGE,
      SHORTCUTS.NAVIGATE_HISTORY,
      SHORTCUTS.NAVIGATE_SETTINGS,
    ],
  },
  {
    title: 'General',
    shortcuts: [
      SHORTCUTS.SHOW_HELP,
      SHORTCUTS.SHOW_HELP_F1,
      SHORTCUTS.SAVE,
    ],
  },
  {
    title: 'Guided Tour',
    shortcuts: [
      SHORTCUTS.TOUR_NEXT,
      SHORTCUTS.TOUR_PREVIOUS,
      SHORTCUTS.TOUR_CLOSE,
      SHORTCUTS.TOUR_RESTART,
    ],
  },
  {
    title: 'Body Map',
    shortcuts: [
      SHORTCUTS.CLEAR_SELECTIONS,
      SHORTCUTS.INCREASE_BURN,
      SHORTCUTS.DECREASE_BURN,
    ],
  },
];

export const KeyboardShortcutsModal = ({ isOpen, onClose }: KeyboardShortcutsModalProps) => {
  const modalRef = React.useRef<HTMLDivElement>(null);
  const closeButtonRef = React.useRef<HTMLButtonElement>(null);
  const { announce } = useLiveAnnouncer();

  // Focus trap for accessibility
  useFocusTrap(modalRef, {
    isActive: isOpen,
    initialFocusRef: closeButtonRef,
    onEscape: onClose,
  });

  React.useEffect(() => {
    if (isOpen) {
      announce('Keyboard shortcuts help dialog opened. Use Tab to navigate through shortcuts list.', 'polite');
    }
  }, [isOpen, announce]);

  if (!isOpen) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent
        ref={modalRef}
        className="max-w-2xl max-h-[80vh] overflow-y-auto"
        role="dialog"
        aria-labelledby="keyboard-shortcuts-title"
        aria-describedby="keyboard-shortcuts-description"
        aria-modal="true"
      >
        <DialogHeader>
          <DialogTitle id="keyboard-shortcuts-title" className="text-2xl font-bold">
            Keyboard Shortcuts
          </DialogTitle>
          <Button
            ref={closeButtonRef}
            variant="ghost"
            size="icon"
            onClick={onClose}
            className="absolute right-4 top-4"
            aria-label="Close keyboard shortcuts dialog"
          >
            <X className="h-4 w-4" />
          </Button>
        </DialogHeader>

        <div className="space-y-6 py-4">
          <p id="keyboard-shortcuts-description" className="text-muted-foreground">
            Use these keyboard shortcuts to navigate Burn Wizard quickly. Shortcuts are context-aware and won't interfere with text input.
          </p>

          {shortcutGroups.map((group) => (
            <section key={group.title} className="space-y-3">
              <h3 className="text-lg font-semibold text-foreground border-b pb-2">
                {group.title}
              </h3>
              <div className="grid gap-2">
                {group.shortcuts.map((shortcut, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between py-2 px-3 rounded-lg bg-muted/50 hover:bg-muted transition-colors"
                  >
                    <span className="text-sm font-medium text-foreground">
                      {shortcut.description}
                    </span>
                    <kbd className="px-2 py-1 text-xs font-mono bg-background border rounded-md shadow-sm text-foreground">
                      {formatShortcutForDisplay(shortcut)}
                    </kbd>
                  </div>
                ))}
              </div>
            </section>
          ))}

          <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg border border-blue-200 dark:border-blue-700">
            <h4 className="text-sm font-semibold text-blue-900 dark:text-blue-100 mb-2">
              💡 Tips
            </h4>
            <ul className="text-sm text-blue-800 dark:text-blue-200 space-y-1">
              <li>• Shortcuts are disabled when typing in text fields</li>
              <li>• Press <kbd className="px-1 py-0.5 text-xs bg-blue-200 dark:bg-blue-800 rounded">Esc</kbd> to close dialogs</li>
              <li>• Use <kbd className="px-1 py-0.5 text-xs bg-blue-200 dark:bg-blue-800 rounded">Tab</kbd> to navigate between interactive elements</li>
            </ul>
          </div>
        </div>

        <div className="flex justify-end pt-4 border-t">
          <Button onClick={onClose} variant="default">
            Close
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
