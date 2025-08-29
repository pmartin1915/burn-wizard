/**
 * Skip Links Component
 * 
 * Provides keyboard navigation skip links for accessibility.
 * Skip links help keyboard and screen reader users navigate quickly
 * to main content areas without tabbing through all navigation elements.
 */

import React from 'react';

interface SkipLink {
  href: string;
  text: string;
}

interface SkipLinksProps {
  className?: string;
}

const skipLinks: SkipLink[] = [
  { href: '#main-content', text: 'Skip to main content' },
  { href: '#patient-info', text: 'Skip to patient information' },
  { href: '#body-map', text: 'Skip to body map assessment' },
  { href: '#results', text: 'Skip to calculation results' },
  { href: '#navigation', text: 'Skip to navigation' }
];

export function SkipLinks({ className = '' }: SkipLinksProps) {
  const handleSkipClick = (event: React.MouseEvent<HTMLAnchorElement>, targetId: string) => {
    event.preventDefault();
    
    const target = document.querySelector(targetId) as HTMLElement;
    if (target) {
      // Set focus and scroll to the target
      target.focus();
      target.scrollIntoView({ 
        behavior: 'smooth', 
        block: 'start' 
      });
      
      // Ensure the target is focusable
      if (!target.hasAttribute('tabindex')) {
        target.setAttribute('tabindex', '-1');
        // Remove tabindex after focus to maintain normal tab flow
        target.addEventListener('blur', () => {
          target.removeAttribute('tabindex');
        }, { once: true });
      }
    }
  };

  return (
    <nav 
      className={`skip-links ${className}`}
      aria-label="Skip navigation links"
      role="navigation"
    >
      {skipLinks.map((link, index) => (
        <a
          key={index}
          href={link.href}
          onClick={(e) => handleSkipClick(e, link.href)}
          className="
            sr-only 
            focus:not-sr-only 
            focus:absolute 
            focus:top-4 
            focus:left-4 
            focus:z-[10000] 
            focus:px-4 
            focus:py-2 
            focus:bg-primary 
            focus:text-primary-foreground 
            focus:rounded 
            focus:shadow-lg
            focus:ring-2 
            focus:ring-ring 
            focus:ring-offset-2
            transition-all
            duration-200
            font-medium
            text-sm
          "
        >
          {link.text}
        </a>
      ))}
    </nav>
  );
}

/**
 * Hook for managing focus order in complex workflows
 */
export function useFocusOrder() {
  const setFocusOrder = (elements: (HTMLElement | string)[]) => {
    elements.forEach((element, index) => {
      const el = typeof element === 'string' 
        ? document.querySelector(element) as HTMLElement
        : element;
        
      if (el) {
        // Set tab order - start from 1 for positive tabindex
        el.setAttribute('tabindex', (index + 1).toString());
      }
    });
  };

  const resetFocusOrder = (elements: (HTMLElement | string)[]) => {
    elements.forEach(element => {
      const el = typeof element === 'string' 
        ? document.querySelector(element) as HTMLElement
        : element;
        
      if (el) {
        // Remove custom tabindex to restore natural order
        el.removeAttribute('tabindex');
      }
    });
  };

  const createFocusGroup = (groupName: string, elements: (HTMLElement | string)[]) => {
    const group = {
      name: groupName,
      elements: elements.map(el => 
        typeof el === 'string' ? document.querySelector(el) as HTMLElement : el
      ).filter(Boolean),
      activate: () => setFocusOrder(elements),
      deactivate: () => resetFocusOrder(elements)
    };

    return group;
  };

  return {
    setFocusOrder,
    resetFocusOrder,
    createFocusGroup
  };
}