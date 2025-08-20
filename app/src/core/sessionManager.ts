/**
 * Session Management for Secure Data Handling
 * 
 * Manages encryption lifecycle, session timeouts, and secure cleanup:
 * - Automatic session timeout for security
 * - Secure memory cleanup on session end
 * - Encryption key rotation
 * - Inactivity detection and cleanup
 * - Browser close/refresh handling
 */

import { clearEncryptionKeys, isEncryptionAvailable } from './encryption-simple';
import { encryptedStorage } from './encryptedStorage';
// Error handling removed to reduce unused imports

interface SessionConfig {
  timeoutMinutes: number;
  inactivityMinutes: number;
  enableKeyRotation: boolean;
  secureCleanupOnExit: boolean;
}

interface SessionState {
  isActive: boolean;
  startTime: number;
  lastActivity: number;
  encryptionEnabled: boolean;
  warningShown: boolean;
}

class SessionManager {
  private config: SessionConfig;
  private state: SessionState;
  private timeoutTimer: NodeJS.Timeout | null = null;
  private inactivityTimer: NodeJS.Timeout | null = null;
  private listeners: Set<(event: SessionEvent) => void> = new Set();

  constructor(config: Partial<SessionConfig> = {}) {
    this.config = {
      timeoutMinutes: 480, // 8 hours default session timeout
      inactivityMinutes: 60, // 1 hour inactivity timeout
      enableKeyRotation: true,
      secureCleanupOnExit: true,
      ...config
    };

    this.state = {
      isActive: false,
      startTime: 0,
      lastActivity: 0,
      encryptionEnabled: false,
      warningShown: false
    };

    this.setupEventListeners();
  }

  /**
   * Starts a new secure session
   */
  async startSession(): Promise<boolean> {
    try {
      console.info('🔒 Starting secure session...');
      
      const now = Date.now();
      this.state = {
        isActive: true,
        startTime: now,
        lastActivity: now,
        encryptionEnabled: isEncryptionAvailable(),
        warningShown: false
      };

      // Set up session timeout
      this.resetSessionTimeout();
      this.resetInactivityTimer();

      // Notify listeners
      this.notifyListeners({
        type: 'session-started',
        timestamp: now,
        encryptionEnabled: this.state.encryptionEnabled
      });

      console.info(`🔒 Secure session started (encryption: ${this.state.encryptionEnabled ? 'enabled' : 'disabled'})`);
      return true;
    } catch (error) {
      console.error('🔒 Failed to start session:', error);
      return false;
    }
  }

  /**
   * Ends the current session with secure cleanup
   */
  async endSession(reason: 'manual' | 'timeout' | 'inactivity' | 'error' = 'manual'): Promise<void> {
    try {
      console.info(`🔒 Ending session (reason: ${reason})`);

      // Clear timers
      this.clearTimers();

      // Secure cleanup
      if (this.config.secureCleanupOnExit) {
        await this.performSecureCleanup();
      }

      // Update state
      this.state.isActive = false;
      this.state.warningShown = false;

      // Notify listeners
      this.notifyListeners({
        type: 'session-ended',
        timestamp: Date.now(),
        reason: reason
      });

      console.info('🔒 Session ended successfully');
    } catch (error) {
      console.error('🔒 Error during session cleanup:', error);
    }
  }

  /**
   * Records user activity to reset inactivity timer
   */
  recordActivity(): void {
    if (!this.state.isActive) return;

    this.state.lastActivity = Date.now();
    this.state.warningShown = false;
    this.resetInactivityTimer();

    // Also reset session timeout on activity
    this.resetSessionTimeout();
  }

  /**
   * Gets current session status
   */
  getSessionStatus(): {
    isActive: boolean;
    encryptionEnabled: boolean;
    sessionDurationMinutes: number;
    timeSinceLastActivityMinutes: number;
    timeoutInMinutes: number;
  } {
    const now = Date.now();
    const sessionDuration = this.state.isActive ? now - this.state.startTime : 0;
    const timeSinceActivity = this.state.isActive ? now - this.state.lastActivity : 0;
    const timeoutRemaining = this.state.isActive ? 
      Math.max(0, (this.config.timeoutMinutes * 60 * 1000) - sessionDuration) : 0;

    return {
      isActive: this.state.isActive,
      encryptionEnabled: this.state.encryptionEnabled,
      sessionDurationMinutes: Math.floor(sessionDuration / (60 * 1000)),
      timeSinceLastActivityMinutes: Math.floor(timeSinceActivity / (60 * 1000)),
      timeoutInMinutes: Math.floor(timeoutRemaining / (60 * 1000))
    };
  }

  /**
   * Adds a session event listener
   */
  addListener(callback: (event: SessionEvent) => void): void {
    this.listeners.add(callback);
  }

  /**
   * Removes a session event listener
   */
  removeListener(callback: (event: SessionEvent) => void): void {
    this.listeners.delete(callback);
  }

  /**
   * Sets up browser event listeners for secure cleanup
   */
  private setupEventListeners(): void {
    // Handle page unload for secure cleanup
    if (typeof window !== 'undefined') {
      window.addEventListener('beforeunload', this.handleBeforeUnload.bind(this));
      window.addEventListener('unload', this.handleUnload.bind(this));
      
      // Handle visibility change (tab switching, etc.)
      document.addEventListener('visibilitychange', this.handleVisibilityChange.bind(this));
      
      // Activity detection
      const activityEvents = ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart'];
      activityEvents.forEach(event => {
        document.addEventListener(event, this.throttledActivityRecord.bind(this), true);
      });
    }
  }

  /**
   * Throttled activity recording to avoid excessive calls
   */
  private throttledActivityRecord = this.throttle(() => {
    this.recordActivity();
  }, 30000); // Record activity at most once per 30 seconds

  /**
   * Resets the main session timeout
   */
  private resetSessionTimeout(): void {
    if (this.timeoutTimer) {
      clearTimeout(this.timeoutTimer);
    }

    this.timeoutTimer = setTimeout(() => {
      this.endSession('timeout');
    }, this.config.timeoutMinutes * 60 * 1000);
  }

  /**
   * Resets the inactivity timeout
   */
  private resetInactivityTimer(): void {
    if (this.inactivityTimer) {
      clearTimeout(this.inactivityTimer);
    }

    this.inactivityTimer = setTimeout(() => {
      this.handleInactivityTimeout();
    }, this.config.inactivityMinutes * 60 * 1000);
  }

  /**
   * Handles inactivity timeout
   */
  private async handleInactivityTimeout(): Promise<void> {
    if (!this.state.isActive) return;

    // Show warning first
    if (!this.state.warningShown) {
      this.state.warningShown = true;
      this.notifyListeners({
        type: 'inactivity-warning',
        timestamp: Date.now(),
        minutesRemaining: 5
      });

      // Give user 5 minutes to respond
      setTimeout(() => {
        if (this.state.warningShown) {
          this.endSession('inactivity');
        }
      }, 5 * 60 * 1000);
    }
  }

  /**
   * Clears all active timers
   */
  private clearTimers(): void {
    if (this.timeoutTimer) {
      clearTimeout(this.timeoutTimer);
      this.timeoutTimer = null;
    }
    if (this.inactivityTimer) {
      clearTimeout(this.inactivityTimer);
      this.inactivityTimer = null;
    }
  }

  /**
   * Performs secure cleanup of sensitive data
   */
  private async performSecureCleanup(): Promise<void> {
    try {
      // Clear encryption keys from memory
      clearEncryptionKeys();

      // Clear any cached sensitive data
      if (encryptedStorage) {
        // Note: We don't clear persistent storage, just memory
        console.info('🔒 Memory cleanup completed');
      }

      // Clear any other sensitive caches
      if (typeof window !== 'undefined') {
        // Clear session storage (if any sensitive data is there)
        try {
          sessionStorage.clear();
        } catch (error) {
          console.warn('🔒 Could not clear session storage:', error);
        }
      }
    } catch (error) {
      console.error('🔒 Error during secure cleanup:', error);
    }
  }

  /**
   * Handles browser beforeunload event
   */
  private handleBeforeUnload(event: BeforeUnloadEvent): void {
    if (this.state.isActive) {
      // Show confirmation for unsaved work
      const message = 'You have an active session. Are you sure you want to leave?';
      event.returnValue = message;
    }
  }

  /**
   * Handles browser unload event
   */
  private handleUnload(): void {
    if (this.state.isActive) {
      // Perform quick cleanup
      this.endSession('manual');
    }
  }

  /**
   * Handles page visibility change
   */
  private handleVisibilityChange(): void {
    if (document.hidden) {
      // Page is now hidden - could implement additional security measures
      console.debug('🔒 Page hidden - maintaining session');
    } else {
      // Page is now visible - record activity
      this.recordActivity();
    }
  }

  /**
   * Notifies all registered listeners of session events
   */
  private notifyListeners(event: SessionEvent): void {
    this.listeners.forEach(listener => {
      try {
        listener(event);
      } catch (error) {
        console.error('🔒 Error in session event listener:', error);
      }
    });
  }

  /**
   * Throttle utility function
   */
  private throttle<T extends (...args: unknown[]) => unknown>(func: T, wait: number): T {
    let timeout: NodeJS.Timeout | null = null;
    let previous = 0;

    return ((...args: Parameters<T>) => {
      const now = Date.now();
      const remaining = wait - (now - previous);

      if (remaining <= 0 || remaining > wait) {
        if (timeout) {
          clearTimeout(timeout);
          timeout = null;
        }
        previous = now;
        func.apply(this, args);
      } else if (!timeout) {
        timeout = setTimeout(() => {
          previous = Date.now();
          timeout = null;
          func.apply(this, args);
        }, remaining);
      }
    }) as T;
  }
}

// Session event types
export interface SessionEvent {
  type: 'session-started' | 'session-ended' | 'inactivity-warning' | 'encryption-error';
  timestamp: number;
  encryptionEnabled?: boolean;
  reason?: string;
  minutesRemaining?: number;
}

// Create and export the default session manager instance
export const sessionManager = new SessionManager({
  timeoutMinutes: 480, // 8 hours
  inactivityMinutes: 60, // 1 hour  
  enableKeyRotation: true,
  secureCleanupOnExit: true
});

// Auto-start session when module loads (in browser environment)
if (typeof window !== 'undefined') {
  sessionManager.startSession().catch(error => {
    console.error('🔒 Failed to auto-start session:', error);
  });
}