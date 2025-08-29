/**
 * Dropdown Menu Components
 * 
 * Simple dropdown menu implementation using HTML details/summary
 * with accessibility and keyboard support.
 */

import React, { useRef, useEffect, useState } from 'react';
import { cn } from '@/lib/utils';

interface DropdownMenuProps {
  children: React.ReactNode;
}

interface DropdownMenuTriggerProps {
  children: React.ReactNode;
  asChild?: boolean;
}

interface DropdownMenuContentProps {
  children: React.ReactNode;
  align?: 'start' | 'center' | 'end';
  className?: string;
}

interface DropdownMenuItemProps {
  children: React.ReactNode;
  onClick?: () => void;
  className?: string;
  disabled?: boolean;
}

export function DropdownMenu({ children }: DropdownMenuProps) {
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  // Close on escape key
  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && isOpen) {
        setIsOpen(false);
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [isOpen]);

  return (
    <div ref={menuRef} className="relative">
      {React.Children.map(children, (child) => {
        if (React.isValidElement(child)) {
          if (child.type === DropdownMenuTrigger) {
            return React.cloneElement(child, {
              onClick: () => setIsOpen(!isOpen),
            } as any);
          }
          if (child.type === DropdownMenuContent) {
            return isOpen ? child : null;
          }
        }
        return child;
      })}
    </div>
  );
}

export function DropdownMenuTrigger({ children, asChild, ...props }: DropdownMenuTriggerProps & { onClick?: () => void }) {
  if (asChild && React.isValidElement(children)) {
    return React.cloneElement(children, {
      ...props,
      onClick: (e: React.MouseEvent) => {
        if (children.props.onClick) {
          children.props.onClick(e);
        }
        if (props.onClick) {
          props.onClick();
        }
      },
    } as any);
  }

  return (
    <button {...props} className="focus:outline-none">
      {children}
    </button>
  );
}

export function DropdownMenuContent({ 
  children, 
  align = 'end',
  className 
}: DropdownMenuContentProps) {
  const alignmentClasses = {
    start: 'left-0',
    center: 'left-1/2 transform -translate-x-1/2',
    end: 'right-0'
  };

  return (
    <div
      className={cn(
        'absolute top-full mt-1 z-50',
        'min-w-[160px] p-1',
        'bg-popover border border-border rounded-md shadow-lg',
        'animate-in fade-in-0 zoom-in-95 slide-in-from-top-2',
        alignmentClasses[align],
        className
      )}
    >
      {children}
    </div>
  );
}

export function DropdownMenuItem({ 
  children, 
  onClick, 
  className,
  disabled = false 
}: DropdownMenuItemProps) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={cn(
        'w-full px-2 py-1.5 text-sm text-left',
        'rounded-sm transition-colors',
        'hover:bg-accent hover:text-accent-foreground',
        'focus:bg-accent focus:text-accent-foreground',
        'focus:outline-none',
        'disabled:opacity-50 disabled:cursor-not-allowed',
        className
      )}
    >
      {children}
    </button>
  );
}