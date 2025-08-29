/**
 * Auto-Save Hook for Burn Wizard
 * 
 * Provides intelligent auto-save functionality with:
 * - Debounced saving to prevent excessive writes
 * - Multiple save triggers (immediate, debounced, periodic)
 * - Save status tracking with visual indicators
 * - Session recovery capabilities
 * - Browser unload protection
 * - Performance optimizations
 */

import { useEffect, useRef, useState, useCallback } from 'react';
import { useWizardStore } from '@/store/useWizardStore';

export type SaveStatus = 'saved' | 'saving' | 'unsaved' | 'error' | 'disabled';

export interface SaveInfo {
  status: SaveStatus;
  lastSaved: Date | null;
  pendingChanges: boolean;
  error?: string;
}

interface UseAutoSaveOptions {
  enabled?: boolean;
  debounceDelay?: number;
  periodicInterval?: number;
  immediateFields?: string[];
  onSave?: (success: boolean) => void;
  onError?: (error: Error) => void;
}

const DEFAULT_OPTIONS: UseAutoSaveOptions = {
  enabled: true,
  debounceDelay: 2000, // 2 seconds
  periodicInterval: 30000, // 30 seconds
  immediateFields: ['patientData.age', 'patientData.weight'], // Critical fields
};

export function useAutoSave(options: UseAutoSaveOptions = {}) {
  const opts = { ...DEFAULT_OPTIONS, ...options };
  
  // Get store methods and state
  const store = useWizardStore();
  const { patientData, regionSelections, settings } = store;
  
  // Auto-save state
  const [saveInfo, setSaveInfo] = useState<SaveInfo>({
    status: 'saved',
    lastSaved: null,
    pendingChanges: false,
  });
  
  // Refs for debouncing and intervals
  const debounceTimerRef = useRef<NodeJS.Timeout>();
  const periodicTimerRef = useRef<NodeJS.Timeout>();
  const lastStateRef = useRef<string>('');
  const saveInProgressRef = useRef<boolean>(false);
  
  // Generate a hash of the current saveable state
  const getCurrentStateHash = useCallback(() => {
    const saveableState = {
      patientData,
      regionSelections,
      settings: {
        darkMode: settings.darkMode,
        // Only include user preferences, not system state
      },
    };
    return JSON.stringify(saveableState);
  }, [patientData, regionSelections, settings.darkMode]);
  
  // Check if state has actually changed
  const hasStateChanged = useCallback(() => {
    const currentHash = getCurrentStateHash();
    const hasChanged = currentHash !== lastStateRef.current;
    return hasChanged;
  }, [getCurrentStateHash]);
  
  // Core save function
  const performSave = useCallback(async (forced: boolean = false): Promise<boolean> => {
    if (!opts.enabled) return true;
    if (saveInProgressRef.current && !forced) return false;
    
    try {
      saveInProgressRef.current = true;
      setSaveInfo(prev => ({ ...prev, status: 'saving' }));
      
      // The Zustand persist middleware automatically saves when store changes
      // We just need to trigger a small state update to force persistence
      const currentTime = new Date().toISOString();
      
      // Add a timestamp to force Zustand to persist
      // This is a minimal change that won't affect app functionality
      if (typeof store.setMetadata === 'function') {
        store.setMetadata({ lastAutoSave: currentTime });
      }
      
      // Update our tracking
      const newStateHash = getCurrentStateHash();
      lastStateRef.current = newStateHash;
      
      const newSaveInfo: SaveInfo = {
        status: 'saved',
        lastSaved: new Date(),
        pendingChanges: false,
      };
      
      setSaveInfo(newSaveInfo);
      
      if (opts.onSave) {
        opts.onSave(true);
      }
      
      if (process.env.NODE_ENV === 'development') {
        console.info('💾 Auto-save completed', { timestamp: currentTime });
      }
      
      return true;
    } catch (error) {
      console.error('💾 Auto-save failed:', error);
      
      setSaveInfo(prev => ({
        ...prev,
        status: 'error',
        error: error instanceof Error ? error.message : 'Save failed',
      }));
      
      if (opts.onError) {
        opts.onError(error instanceof Error ? error : new Error('Save failed'));
      }
      
      return false;
    } finally {
      saveInProgressRef.current = false;
    }
  }, [opts, store, getCurrentStateHash]);
  
  // Debounced save function
  const debouncedSave = useCallback(() => {
    if (!opts.enabled || !hasStateChanged()) return;
    
    // Clear existing debounce timer
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }
    
    // Set status to unsaved
    setSaveInfo(prev => ({ ...prev, status: 'unsaved', pendingChanges: true }));
    
    // Schedule debounced save
    debounceTimerRef.current = setTimeout(() => {
      performSave();
    }, opts.debounceDelay);
  }, [opts.enabled, opts.debounceDelay, hasStateChanged, performSave]);
  
  // Immediate save function (for critical changes)
  const immediateSave = useCallback(() => {
    if (!opts.enabled) return;
    
    // Clear any pending debounced save
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }
    
    performSave(true);
  }, [opts.enabled, performSave]);
  
  // Manual save function
  const manualSave = useCallback(() => {
    return performSave(true);
  }, [performSave]);
  
  // Watch for state changes and trigger appropriate save
  useEffect(() => {
    if (!hasStateChanged()) return;
    
    // Check if this is a critical field change that needs immediate saving
    const currentState = getCurrentStateHash();
    const parsedState = JSON.parse(currentState);
    
    // For now, trigger debounced save for all changes
    // Future enhancement: implement immediate save logic for critical fields
    debouncedSave();
    
  }, [patientData, regionSelections, settings.darkMode, debouncedSave, hasStateChanged, getCurrentStateHash]);
  
  // Set up periodic save
  useEffect(() => {
    if (!opts.enabled || !opts.periodicInterval) return;
    
    periodicTimerRef.current = setInterval(() => {
      if (hasStateChanged()) {
        if (process.env.NODE_ENV === 'development') {
          console.info('💾 Periodic auto-save triggered');
        }
        performSave();
      }
    }, opts.periodicInterval);
    
    return () => {
      if (periodicTimerRef.current) {
        clearInterval(periodicTimerRef.current);
      }
    };
  }, [opts.enabled, opts.periodicInterval, hasStateChanged, performSave]);
  
  // Browser unload protection
  useEffect(() => {
    if (!opts.enabled) return;
    
    const handleBeforeUnload = (event: BeforeUnloadEvent) => {
      if (saveInfo.pendingChanges || saveInfo.status === 'unsaved') {
        // Attempt emergency save
        performSave(true);
        
        // Show browser warning
        const message = 'You have unsaved changes. Are you sure you want to leave?';
        event.preventDefault();
        event.returnValue = message;
        return message;
      }
    };
    
    const handleUnload = () => {
      // Last chance save attempt
      if (hasStateChanged()) {
        performSave(true);
      }
    };
    
    window.addEventListener('beforeunload', handleBeforeUnload);
    window.addEventListener('unload', handleUnload);
    
    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
      window.removeEventListener('unload', handleUnload);
    };
  }, [opts.enabled, saveInfo.pendingChanges, saveInfo.status, hasStateChanged, performSave]);
  
  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
      if (periodicTimerRef.current) {
        clearInterval(periodicTimerRef.current);
      }
    };
  }, []);
  
  // Initialize state hash
  useEffect(() => {
    lastStateRef.current = getCurrentStateHash();
  }, [getCurrentStateHash]);
  
  return {
    saveInfo,
    manualSave,
    immediateSave,
    isEnabled: opts.enabled,
    hasUnsavedChanges: saveInfo.status === 'unsaved' || saveInfo.pendingChanges,
  };
}

/**
 * Format the last saved time for display
 */
export function formatLastSaved(date: Date | null): string {
  if (!date) return 'Never';
  
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffSeconds = Math.floor(diffMs / 1000);
  const diffMinutes = Math.floor(diffSeconds / 60);
  const diffHours = Math.floor(diffMinutes / 60);
  
  if (diffSeconds < 30) return 'Just now';
  if (diffSeconds < 60) return `${diffSeconds}s ago`;
  if (diffMinutes < 60) return `${diffMinutes}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  
  return date.toLocaleDateString();
}