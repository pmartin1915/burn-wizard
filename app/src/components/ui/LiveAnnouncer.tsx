/**
 * Live Announcer Component
 * 
 * Provides screen reader announcements for dynamic content changes
 * using ARIA live regions. Supports different politeness levels.
 */

import React, { useRef, useEffect } from 'react';

interface LiveAnnouncerProps {
  message: string;
  priority: 'polite' | 'assertive';
  clearOnAnnounce?: boolean;
}

interface AnnouncerContextType {
  announce: (message: string, priority?: 'polite' | 'assertive') => void;
}

const LiveAnnouncerContext = React.createContext<AnnouncerContextType | null>(null);

export function LiveAnnouncerProvider({ children }: { children: React.ReactNode }) {
  const politeRef = useRef<HTMLDivElement>(null);
  const assertiveRef = useRef<HTMLDivElement>(null);

  const announce = (message: string, priority: 'polite' | 'assertive' = 'polite') => {
    const targetRef = priority === 'assertive' ? assertiveRef : politeRef;
    if (targetRef.current) {
      // Clear first to ensure the message is announced even if it's the same
      targetRef.current.textContent = '';
      // Use setTimeout to ensure the clearing happens first
      setTimeout(() => {
        if (targetRef.current) {
          targetRef.current.textContent = message;
        }
      }, 10);
      
      // Clear after announcement
      setTimeout(() => {
        if (targetRef.current) {
          targetRef.current.textContent = '';
        }
      }, 1000);
    }
  };

  return (
    <LiveAnnouncerContext.Provider value={{ announce }}>
      {children}
      {/* Screen reader only live regions */}
      <div
        ref={politeRef}
        className="sr-only"
        aria-live="polite"
        aria-atomic="true"
        role="status"
      />
      <div
        ref={assertiveRef}
        className="sr-only"
        aria-live="assertive"
        aria-atomic="true"
        role="alert"
      />
    </LiveAnnouncerContext.Provider>
  );
}

export function useLiveAnnouncer() {
  const context = React.useContext(LiveAnnouncerContext);
  if (!context) {
    // Fallback for when provider is not available
    return {
      announce: (message: string, priority?: 'polite' | 'assertive') => {
        console.log(`[Live Announcement ${priority}]: ${message}`);
      }
    };
  }
  return context;
}

/**
 * Hook for announcing TBSA calculation changes
 */
export function useTbsaAnnouncer() {
  const { announce } = useLiveAnnouncer();
  const lastTbsa = useRef<number>(-1);

  const announceTbsaChange = (newTbsa: number, regionName?: string) => {
    if (newTbsa !== lastTbsa.current) {
      lastTbsa.current = newTbsa;
      
      let message = '';
      if (newTbsa === 0) {
        message = 'All burn selections cleared. Total Body Surface Area is now 0 percent.';
      } else if (regionName) {
        message = `${regionName} updated. Total Body Surface Area is now ${newTbsa} percent.`;
      } else {
        message = `Total Body Surface Area updated to ${newTbsa} percent.`;
      }
      
      // Add severity context
      if (newTbsa > 0) {
        if (newTbsa < 10) {
          message += ' This is classified as a minor burn.';
        } else if (newTbsa < 20) {
          message += ' This is classified as a moderate burn.';
        } else {
          message += ' This is classified as a major burn requiring immediate medical attention.';
        }
      }
      
      announce(message, 'polite');
    }
  };

  return { announceTbsaChange };
}

/**
 * Hook for announcing validation errors
 */
export function useValidationAnnouncer() {
  const { announce } = useLiveAnnouncer();

  const announceError = (fieldName: string, errorMessage: string) => {
    announce(`Validation error in ${fieldName}: ${errorMessage}`, 'assertive');
  };

  const announceSuccess = (action: string) => {
    announce(`${action} completed successfully.`, 'polite');
  };

  return { announceError, announceSuccess };
}