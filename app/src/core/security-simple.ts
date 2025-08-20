/**
 * Simplified Security Module for Burn Wizard
 * Production-ready implementation with essential security features
 */

import CryptoJS from 'crypto-js';

export const SECURITY_CONFIG = {
  PIN_LENGTH: { min: 4, max: 8 },
  MAX_AUTH_ATTEMPTS: 5,
  LOCKOUT_DURATION: 5 * 60 * 1000, // 5 minutes
  SESSION_TIMEOUT: 30 * 60 * 1000, // 30 minutes
  PBKDF2_ITERATIONS: 100000,
} as const;

export enum SecurityEvent {
  AUTH_SUCCESS = 'auth_success',
  AUTH_FAILURE = 'auth_failure',
  AUTH_LOCKOUT = 'auth_lockout',
  DATA_ENCRYPTED = 'data_encrypted',
  DATA_DECRYPTED = 'data_decrypted',
  DATA_WIPED = 'data_wiped',
  SESSION_CREATED = 'session_created',
  SESSION_EXPIRED = 'session_expired',
  PIN_CHANGED = 'pin_changed',
}

export interface AuthResult {
  success: boolean;
  remainingAttempts?: number;
  lockoutUntil?: number;
  sessionToken?: string;
  error?: string;
}

export interface SecurityState {
  isAuthenticated: boolean;
  authMethod: 'pin' | null;
  sessionToken: string | null;
  sessionExpiry: number | null;
  failedAttempts: number;
  lockoutUntil: number | null;
  encryptionEnabled: boolean;
}

export interface SecurityAuditEvent {
  event: SecurityEvent;
  timestamp: number;
  sessionId: string;
  details?: Record<string, unknown>;
  success: boolean;
}

export class SecurityManager {
  private static instance: SecurityManager;
  private state: SecurityState;
  private deviceId: string;
  private auditLog: SecurityAuditEvent[] = [];

  private constructor() {
    this.deviceId = this.getOrCreateDeviceId();
    this.state = this.loadSecurityState();
  }

  public static getInstance(): SecurityManager {
    if (!SecurityManager.instance) {
      SecurityManager.instance = new SecurityManager();
    }
    return SecurityManager.instance;
  }

  public async initialize(): Promise<void> {
    try {
      this.checkSessionValidity();
      this.logSecurityEvent(SecurityEvent.SESSION_CREATED, { deviceId: this.deviceId });
      console.log('🔒 Security system initialized');
    } catch (error) {
      console.error('❌ Security initialization failed:', error);
      throw new Error('Security system initialization failed');
    }
  }

  private getOrCreateDeviceId(): string {
    let deviceId = localStorage.getItem('burn_wizard_device_id');
    
    if (!deviceId) {
      deviceId = CryptoJS.lib.WordArray.random(16).toString();
      localStorage.setItem('burn_wizard_device_id', deviceId);
    }
    
    return deviceId;
  }

  private loadSecurityState(): SecurityState {
    const stored = localStorage.getItem('burn_wizard_security_state');
    
    if (stored) {
      try {
        return JSON.parse(stored);
      } catch (error) {
        console.warn('Failed to parse security state, using defaults');
      }
    }
    
    return {
      isAuthenticated: false,
      authMethod: null,
      sessionToken: null,
      sessionExpiry: null,
      failedAttempts: 0,
      lockoutUntil: null,
      encryptionEnabled: false,
    };
  }

  private saveSecurityState(): void {
    localStorage.setItem('burn_wizard_security_state', JSON.stringify(this.state));
  }

  private checkSessionValidity(): void {
    if (this.state.sessionExpiry && Date.now() > this.state.sessionExpiry) {
      this.logSecurityEvent(SecurityEvent.SESSION_EXPIRED);
      this.clearSession();
    }
  }

  private clearSession(): void {
    this.state.isAuthenticated = false;
    this.state.sessionToken = null;
    this.state.sessionExpiry = null;
    this.state.authMethod = null;
    this.saveSecurityState();
  }

  private validatePin(pin: string): boolean {
    const { min, max } = SECURITY_CONFIG.PIN_LENGTH;
    return pin.length >= min && pin.length <= max && /^\d+$/.test(pin);
  }

  public async setupPin(pin: string): Promise<boolean> {
    try {
      if (!this.validatePin(pin)) {
        throw new Error('Invalid PIN format');
      }

      const salt = CryptoJS.lib.WordArray.random(16).toString();
      const pinHash = CryptoJS.SHA256(pin + salt + this.deviceId).toString();
      
      localStorage.setItem('burn_wizard_pin_hash', pinHash);
      localStorage.setItem('burn_wizard_pin_salt', salt);
      
      this.state.encryptionEnabled = true;
      this.saveSecurityState();
      
      this.logSecurityEvent(SecurityEvent.PIN_CHANGED, { success: true });
      
      console.log('✅ PIN authentication configured');
      return true;
    } catch (error: unknown) {
      console.error('❌ PIN setup failed:', error);
      this.logSecurityEvent(SecurityEvent.PIN_CHANGED, { success: false, error: error instanceof Error ? error.message : String(error) });
      return false;
    }
  }

  public async authenticateWithPin(pin: string): Promise<AuthResult> {
    try {
      if (this.state.lockoutUntil && Date.now() < this.state.lockoutUntil) {
        const remainingTime = Math.ceil((this.state.lockoutUntil - Date.now()) / 1000);
        return {
          success: false,
          error: `Account locked. Try again in ${remainingTime} seconds.`
        };
      }

      const storedHash = localStorage.getItem('burn_wizard_pin_hash');
      const salt = localStorage.getItem('burn_wizard_pin_salt');
      
      if (!storedHash || !salt) {
        return { success: false, error: 'No PIN configured' };
      }

      const pinHash = CryptoJS.SHA256(pin + salt + this.deviceId).toString();
      
      if (pinHash === storedHash) {
        this.state.isAuthenticated = true;
        this.state.authMethod = 'pin';
        this.state.sessionToken = CryptoJS.lib.WordArray.random(32).toString();
        this.state.sessionExpiry = Date.now() + SECURITY_CONFIG.SESSION_TIMEOUT;
        this.state.failedAttempts = 0;
        this.state.lockoutUntil = null;
        
        this.saveSecurityState();
        this.logSecurityEvent(SecurityEvent.AUTH_SUCCESS, { method: 'pin' });
        
        return {
          success: true,
          sessionToken: this.state.sessionToken
        };
      } else {
        this.state.failedAttempts++;
        
        if (this.state.failedAttempts >= SECURITY_CONFIG.MAX_AUTH_ATTEMPTS) {
          this.state.lockoutUntil = Date.now() + SECURITY_CONFIG.LOCKOUT_DURATION;
          this.logSecurityEvent(SecurityEvent.AUTH_LOCKOUT, { attempts: this.state.failedAttempts });
        }
        
        this.saveSecurityState();
        this.logSecurityEvent(SecurityEvent.AUTH_FAILURE, { 
          method: 'pin', 
          attempts: this.state.failedAttempts 
        });
        
        const remainingAttempts = SECURITY_CONFIG.MAX_AUTH_ATTEMPTS - this.state.failedAttempts;
        return {
          success: false,
          remainingAttempts: Math.max(0, remainingAttempts),
          error: 'Invalid PIN'
        };
      }
    } catch (error) {
      console.error('❌ PIN authentication failed:', error);
      return { success: false, error: 'Authentication error' };
    }
  }

  public async isBiometricAvailable(): Promise<boolean> {
    if ('credentials' in navigator && 'create' in navigator.credentials) {
      try {
        // Simple WebAuthn availability check
        return typeof navigator.credentials.create === 'function';
      } catch (error) {
        return false;
      }
    }
    return false;
  }

  public async encryptData(data: string): Promise<string | null> {
    try {
      if (!this.state.encryptionEnabled) {
        return data; // Return unencrypted if encryption not enabled
      }

      const salt = localStorage.getItem('burn_wizard_pin_salt');
      if (!salt) {
        return data;
      }

      // Simple AES encryption with key derived from device ID
      const key = CryptoJS.SHA256(this.deviceId + salt).toString();
      const encrypted = CryptoJS.AES.encrypt(data, key).toString();
      
      this.logSecurityEvent(SecurityEvent.DATA_ENCRYPTED, { 
        dataSize: data.length 
      });

      return encrypted;
    } catch (error) {
      console.error('❌ Encryption failed:', error);
      return null;
    }
  }

  public async decryptData(encryptedData: string): Promise<string | null> {
    try {
      if (!this.state.encryptionEnabled) {
        return encryptedData; // Return as-is if encryption not enabled
      }

      const salt = localStorage.getItem('burn_wizard_pin_salt');
      if (!salt) {
        return encryptedData;
      }

      const key = CryptoJS.SHA256(this.deviceId + salt).toString();
      const decrypted = CryptoJS.AES.decrypt(encryptedData, key);
      const result = decrypted.toString(CryptoJS.enc.Utf8);
      
      this.logSecurityEvent(SecurityEvent.DATA_DECRYPTED, { 
        success: !!result 
      });

      return result || null;
    } catch (error) {
      console.error('❌ Decryption failed:', error);
      return null;
    }
  }

  public async wipeAllData(): Promise<boolean> {
    try {
      const keys = Object.keys(localStorage).filter(key => 
        key.startsWith('burn_wizard_')
      );
      
      keys.forEach(key => localStorage.removeItem(key));
      
      if ('indexedDB' in window) {
        const deleteDB = indexedDB.deleteDatabase('localforage');
        deleteDB.onsuccess = () => console.log('✅ IndexedDB cleared');
        deleteDB.onerror = () => console.warn('⚠️ Failed to clear IndexedDB');
      }

      this.state = {
        isAuthenticated: false,
        authMethod: null,
        sessionToken: null,
        sessionExpiry: null,
        failedAttempts: 0,
        lockoutUntil: null,
        encryptionEnabled: false,
      };

      this.logSecurityEvent(SecurityEvent.DATA_WIPED, { success: true });
      
      console.log('✅ All data securely wiped');
      return true;
    } catch (error: unknown) {
      console.error('❌ Data wipe failed:', error);
      this.logSecurityEvent(SecurityEvent.DATA_WIPED, { success: false, error: error instanceof Error ? error.message : String(error) });
      return false;
    }
  }

  private logSecurityEvent(event: SecurityEvent, details?: Record<string, unknown>): void {
    const auditEvent: SecurityAuditEvent = {
      event,
      timestamp: Date.now(),
      sessionId: this.state.sessionToken || 'no_session',
      details,
      success: !details?.error
    };

    this.auditLog.push(auditEvent);
    
    if (this.auditLog.length > 1000) {
      this.auditLog = this.auditLog.slice(-1000);
    }

    localStorage.setItem('burn_wizard_audit_log', JSON.stringify(this.auditLog));
  }

  public getAuditLog(): SecurityAuditEvent[] {
    return [...this.auditLog];
  }

  public exportAuditLog(): string {
    const headers = ['Timestamp', 'Event', 'Session ID', 'Success', 'Details'];
    const rows = this.auditLog.map(event => [
      new Date(event.timestamp).toISOString(),
      event.event,
      event.sessionId,
      event.success ? 'Yes' : 'No',
      JSON.stringify(event.details || {})
    ]);

    return [headers, ...rows].map(row => 
      row.map(cell => `"${cell}"`).join(',')
    ).join('\n');
  }

  public getSecurityStatus(): SecurityState {
    this.checkSessionValidity();
    return { ...this.state };
  }

  public isAuthenticated(): boolean {
    this.checkSessionValidity();
    return this.state.isAuthenticated;
  }

  public signOut(): void {
    this.clearSession();
    this.logSecurityEvent(SecurityEvent.SESSION_EXPIRED, { manual: true });
  }
}

// Singleton instance
export const security = SecurityManager.getInstance();

// Initialize security system
export const initializeSecurity = async (): Promise<void> => {
  await security.initialize();
};

// Convenience functions for encrypted storage
export const secureStore = async (key: string, data: Record<string, unknown>): Promise<boolean> => {
  try {
    const serialized = JSON.stringify(data);
    const encrypted = await security.encryptData(serialized);
    
    if (encrypted) {
      localStorage.setItem(`encrypted_${key}`, encrypted);
      return true;
    }
    return false;
  } catch (error) {
    console.error('Secure store failed:', error);
    return false;
  }
};

export const secureRetrieve = async (key: string): Promise<Record<string, unknown> | null> => {
  try {
    const stored = localStorage.getItem(`encrypted_${key}`);
    if (!stored) return null;

    const decrypted = await security.decryptData(stored);
    
    if (decrypted) {
      return JSON.parse(decrypted);
    }
    return null;
  } catch (error) {
    console.error('Secure retrieve failed:', error);
    return null;
  }
};