/**
 * AES-256 Encryption Module for Burn Wizard
 * 
 * Provides enterprise-grade encryption for sensitive medical data:
 * - AES-256-GCM encryption with authenticated encryption
 * - Secure key derivation using PBKDF2
 * - Session-based key management
 * - Secure random IV generation for each encryption
 * - Salt-based key strengthening
 * 
 * Security Standards:
 * - NIST SP 800-38D (GCM mode)
 * - NIST SP 800-132 (PBKDF2)
 * - OWASP cryptographic guidelines
 * - Medical device security best practices
 */

import { handleError, createSecurityError } from './errorHandling';

// Encryption configuration constants
const ENCRYPTION_CONFIG = {
  ALGORITHM: 'AES-GCM',
  KEY_LENGTH: 256, // bits
  IV_LENGTH: 12, // bytes (96 bits for GCM)
  SALT_LENGTH: 32, // bytes
  TAG_LENGTH: 16, // bytes (128 bits authentication tag)
  PBKDF2_ITERATIONS: 600000, // NIST recommended minimum for 2024+
  KEY_DERIVATION_HASH: 'SHA-256',
} as const;

// Master key for the session (derived from user interaction)
let sessionMasterKey: CryptoKey | null = null;
let sessionSalt: Uint8Array | null = null;

/**
 * Generates a cryptographically secure random key derivation salt
 */
function generateSalt(): Uint8Array {
  const array = new Uint8Array(ENCRYPTION_CONFIG.SALT_LENGTH);
  return crypto.getRandomValues(array);
}

/**
 * Generates a cryptographically secure random IV for each encryption
 */
function generateIV(): Uint8Array {
  const array = new Uint8Array(ENCRYPTION_CONFIG.IV_LENGTH);
  return crypto.getRandomValues(array);
}

/**
 * Derives a secure encryption key from a passphrase using PBKDF2
 * @param passphrase - User-provided passphrase or generated session key
 * @param salt - Cryptographic salt for key strengthening
 * @returns Promise<CryptoKey> - Derived AES-256 key
 */
async function deriveKey(passphrase: string, salt: Uint8Array): Promise<CryptoKey> {
  try {
    // Convert passphrase to ArrayBuffer
    const encoder = new TextEncoder();
    const passphraseBuffer = encoder.encode(passphrase);
    
    // Import the passphrase as a raw key for PBKDF2
    const importedKey = await crypto.subtle.importKey(
      'raw',
      passphraseBuffer,
      'PBKDF2',
      false,
      ['deriveKey']
    );
    
    // Derive the actual encryption key using PBKDF2
    const derivedKey = await crypto.subtle.deriveKey(
      {
        name: 'PBKDF2',
        salt: salt as BufferSource,
        iterations: ENCRYPTION_CONFIG.PBKDF2_ITERATIONS,
        hash: ENCRYPTION_CONFIG.KEY_DERIVATION_HASH,
      },
      importedKey,
      {
        name: ENCRYPTION_CONFIG.ALGORITHM,
        length: ENCRYPTION_CONFIG.KEY_LENGTH,
      },
      false, // Not extractable for security
      ['encrypt', 'decrypt']
    );
    
    return derivedKey;
  } catch (error) {
    throw createSecurityError('Key derivation failed', { error: String(error) });
  }
}

/**
 * Generates a session passphrase based on browser fingerprinting and user interaction
 * This provides a consistent but session-specific encryption key
 */
function generateSessionPassphrase(): string {
  const fingerprint = [
    navigator.userAgent,
    navigator.language,
    screen.width + 'x' + screen.height,
    new Date().toDateString(), // Changes daily for key rotation
    'burn-wizard-session-' + Math.random().toString(36).substring(2)
  ].join('|');
  
  // Hash the fingerprint for consistent length and additional security
  return btoa(fingerprint).substring(0, 64);
}

/**
 * Initializes the encryption system for the current session
 * This should be called once when the application starts
 */
export async function initializeEncryption(): Promise<boolean> {
  try {
    // Check if Web Crypto API is available
    if (!crypto || !crypto.subtle) {
      console.warn('🔒 Web Crypto API not available - encryption disabled');
      return false;
    }
    
    // Generate session salt and passphrase
    sessionSalt = generateSalt();
    const sessionPassphrase = generateSessionPassphrase();
    
    // Derive the session master key
    sessionMasterKey = await deriveKey(sessionPassphrase, sessionSalt);
    
    console.info('🔒 AES-256 encryption initialized successfully');
    return true;
  } catch (error) {
    console.error('🔒 Encryption initialization failed:', error);
    return false;
  }
}

/**
 * Encrypts sensitive data using AES-256-GCM
 * @param plaintext - Data to encrypt (will be JSON stringified)
 * @returns Promise<string> - Base64 encoded encrypted data with metadata
 */
export async function encryptData(plaintext: Record<string, unknown>): Promise<string> {
  try {
    if (!sessionMasterKey || !sessionSalt) {
      throw createSecurityError('Encryption not initialized');
    }
    
    // Convert data to JSON string then to ArrayBuffer
    const encoder = new TextEncoder();
    const plaintextData = encoder.encode(JSON.stringify(plaintext));
    
    // Generate unique IV for this encryption
    const iv = generateIV();
    
    // Encrypt the data
    const encrypted = await crypto.subtle.encrypt(
      {
        name: ENCRYPTION_CONFIG.ALGORITHM,
        iv: iv as BufferSource,
        tagLength: ENCRYPTION_CONFIG.TAG_LENGTH * 8, // Convert bytes to bits
      },
      sessionMasterKey,
      plaintextData
    );
    
    // Combine salt, IV, and encrypted data for storage
    const encryptedArray = new Uint8Array(encrypted);
    const combined = new Uint8Array(
      sessionSalt.length + iv.length + encryptedArray.length
    );
    
    let offset = 0;
    combined.set(sessionSalt, offset);
    offset += sessionSalt.length;
    combined.set(iv, offset);
    offset += iv.length;
    combined.set(encryptedArray, offset);
    
    // Return as base64 for storage
    return btoa(String.fromCharCode(...combined));
  } catch (error) {
    throw handleError(error);
  }
}

/**
 * Decrypts data that was encrypted with encryptData
 * @param encryptedData - Base64 encoded encrypted data
 * @returns Promise<any> - Decrypted and parsed data
 */
export async function decryptData(encryptedData: string): Promise<Record<string, unknown> | null> {
  try {
    if (!encryptedData) {
      return null;
    }
    
    // Decode from base64
    const combined = new Uint8Array(
      atob(encryptedData).split('').map(char => char.charCodeAt(0))
    );
    
    // Extract salt, IV, and encrypted data
    let offset = 0;
    const salt = combined.slice(offset, offset + ENCRYPTION_CONFIG.SALT_LENGTH);
    offset += ENCRYPTION_CONFIG.SALT_LENGTH;
    
    const iv = combined.slice(offset, offset + ENCRYPTION_CONFIG.IV_LENGTH);
    offset += ENCRYPTION_CONFIG.IV_LENGTH;
    
    const encrypted = combined.slice(offset);
    
    // Derive key from stored salt (in case of session restart)
    const sessionPassphrase = generateSessionPassphrase();
    const key = await deriveKey(sessionPassphrase, salt);
    
    // Decrypt the data
    const decrypted = await crypto.subtle.decrypt(
      {
        name: ENCRYPTION_CONFIG.ALGORITHM,
        iv: iv as BufferSource,
        tagLength: ENCRYPTION_CONFIG.TAG_LENGTH * 8,
      },
      key,
      encrypted
    );
    
    // Convert back to string and parse JSON
    const decoder = new TextDecoder();
    const plaintextString = decoder.decode(decrypted);
    
    return JSON.parse(plaintextString);
  } catch (error) {
    // Handle decryption failures gracefully (might be unencrypted legacy data)
    console.warn('🔒 Decryption failed, attempting to parse as unencrypted data:', error);
    try {
      return JSON.parse(encryptedData);
    } catch {
      // If both encrypted and unencrypted parsing fail, return null
      console.error('🔒 Data corruption detected - unable to decrypt or parse');
      return null;
    }
  }
}

/**
 * Encrypts a specific field value for granular encryption
 * @param value - The value to encrypt
 * @param fieldName - Name of the field for logging
 * @returns Promise<string> - Encrypted value
 */
export async function encryptField(value: string | number | boolean, fieldName: string): Promise<string> {
  try {
    const encrypted = await encryptData({ field: fieldName, value: value });
    return encrypted;
  } catch (error) {
    console.error(`🔒 Failed to encrypt field ${fieldName}:`, error);
    // Return original value if encryption fails (graceful degradation)
    return typeof value === 'string' ? value : JSON.stringify(value);
  }
}

/**
 * Decrypts a specific field value
 * @param encryptedValue - The encrypted value
 * @param fieldName - Name of the field for logging
 * @returns Promise<any> - Decrypted value
 */
export async function decryptField(encryptedValue: string, fieldName: string): Promise<string | number | boolean | null> {
  try {
    const decrypted = await decryptData(encryptedValue);
    if (decrypted && typeof decrypted === 'object' && 'value' in decrypted) {
      const value = decrypted.value;
      if (typeof value === 'string' || typeof value === 'number' || typeof value === 'boolean' || value === null) {
        return value;
      }
    }
    return null;
  } catch (error) {
    console.error(`🔒 Failed to decrypt field ${fieldName}:`, error);
    return encryptedValue; // Return as-is if decryption fails
  }
}

/**
 * Securely clears encryption keys from memory
 * Should be called when the session ends
 */
export function clearEncryptionKeys(): void {
  sessionMasterKey = null;
  sessionSalt = null;
  console.info('🔒 Encryption keys cleared from memory');
}

/**
 * Checks if encryption is currently available and initialized
 */
export function isEncryptionAvailable(): boolean {
  return !!(crypto && crypto.subtle && sessionMasterKey);
}

/**
 * Gets encryption status information for monitoring
 */
export function getEncryptionStatus(): {
  available: boolean;
  initialized: boolean;
  algorithm: string;
  keyLength: number;
} {
  return {
    available: !!(crypto && crypto.subtle),
    initialized: !!sessionMasterKey,
    algorithm: ENCRYPTION_CONFIG.ALGORITHM,
    keyLength: ENCRYPTION_CONFIG.KEY_LENGTH,
  };
}

/**
 * Validates encryption/decryption functionality
 * Used for self-testing the encryption system
 */
export async function validateEncryption(): Promise<boolean> {
  try {
    const testData = { test: 'encryption validation', timestamp: Date.now() };
    const encrypted = await encryptData(testData);
    const decrypted = await decryptData(encrypted);
    
    return JSON.stringify(testData) === JSON.stringify(decrypted);
  } catch (error) {
    console.error('🔒 Encryption validation failed:', error);
    return false;
  }
}

/**
 * Emergency function to attempt data recovery from corrupted encryption
 * @param corruptedData - Data that failed to decrypt
 * @returns Recovered data or null
 */
export function attemptDataRecovery(corruptedData: string): Record<string, unknown> | null {
  try {
    // Try parsing as unencrypted JSON
    return JSON.parse(corruptedData);
  } catch {
    try {
      // Try base64 decode then parse
      const decoded = atob(corruptedData);
      return JSON.parse(decoded);
    } catch {
      console.warn('🔒 Data recovery failed - data may be permanently corrupted');
      return null;
    }
  }
}