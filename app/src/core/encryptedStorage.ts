/**
 * Encrypted Storage Adapter for Zustand Persist
 * 
 * Provides transparent encryption/decryption for local storage:
 * - Integrates with Zustand persist middleware
 * - Automatic encryption of sensitive data fields
 * - Graceful fallback for encryption failures
 * - Migration support for existing unencrypted data
 * - Selective field encryption based on sensitivity
 */

import { 
  initializeEncryption, 
  encryptData, 
  decryptData, 
  isEncryptionAvailable,
  clearEncryptionKeys,
  validateEncryption 
} from './encryption-simple';
import { createSecurityError } from './errorHandling';
// Types are referenced in comments but not used in runtime code

// Define which data types should be encrypted
const SENSITIVE_DATA_TYPES = {
  PATIENT_DATA: 'patientData',
  REGION_SELECTIONS: 'regionSelections', 
  TBSA_RESULT: 'tbsaResult',
  FLUID_RESULT: 'fluidResult'
} as const;

// Fields within patient data that are considered sensitive
// Keeping for future reference, currently unused
// const SENSITIVE_PATIENT_FIELDS = [
//   'ageMonths',
//   'weightKg', 
//   'mechanism',
//   'hoursSinceInjury',
//   'specialSites'
// ] as const;

interface EncryptedStorageOptions {
  encryptionEnabled: boolean;
  storageKey: string;
  version: number;
}

interface StorageMetadata {
  version: number;
  encrypted: boolean;
  timestamp: number;
  fields: string[];
}

/**
 * Encrypted Storage implementation that wraps localStorage
 */
export class EncryptedStorage {
  private options: EncryptedStorageOptions;
  private initialized: boolean = false;

  constructor(options: EncryptedStorageOptions) {
    this.options = options;
  }

  /**
   * Initializes the encrypted storage system
   */
  async initialize(): Promise<boolean> {
    try {
      if (this.options.encryptionEnabled) {
        const encryptionReady = await initializeEncryption();
        if (!encryptionReady) {
          console.warn('🔒 Encryption initialization failed, falling back to unencrypted storage');
          this.options.encryptionEnabled = false;
        } else {
          // Validate encryption works
          const isValid = await validateEncryption();
          if (!isValid) {
            console.error('🔒 Encryption validation failed, disabling encryption');
            this.options.encryptionEnabled = false;
            return false;
          }
        }
      }
      
      this.initialized = true;
      console.info(`🔒 Storage initialized (encryption: ${this.options.encryptionEnabled ? 'enabled' : 'disabled'})`);
      return true;
    } catch (error) {
      console.error('🔒 Storage initialization failed:', error);
      this.options.encryptionEnabled = false;
      this.initialized = true;
      return false;
    }
  }

  /**
   * Determines if a data field should be encrypted based on sensitivity
   */
  private shouldEncryptField(fieldName: string, data: Record<string, unknown>): boolean {
    if (!this.options.encryptionEnabled) return false;
    
    // Always encrypt these top-level fields
    if (Object.values(SENSITIVE_DATA_TYPES).includes(fieldName as typeof SENSITIVE_DATA_TYPES[keyof typeof SENSITIVE_DATA_TYPES])) {
      return true;
    }
    
    // For patient data, encrypt specific sensitive fields
    if (fieldName === 'patientData' && data) {
      return true; // Encrypt entire patient data object
    }
    
    return false;
  }

  /**
   * Encrypts sensitive fields in the data object
   */
  private async encryptSensitiveData(data: Record<string, unknown>): Promise<Record<string, unknown>> {
    if (!this.options.encryptionEnabled || !isEncryptionAvailable()) {
      return data;
    }

    const result = { ...data };
    
    try {
      // Encrypt patient data if present
      if (result.patientData) {
        result.patientData = await encryptData(result.patientData as Record<string, unknown>);
      }
      
      // Encrypt region selections if present
      if (result.regionSelections && Array.isArray(result.regionSelections)) {
        result.regionSelections = await encryptData({ selections: result.regionSelections });
      }
      
      // Encrypt calculation results if present (may contain derived patient info)
      if (result.tbsaResult) {
        result.tbsaResult = await encryptData(result.tbsaResult as Record<string, unknown>);
      }
      
      if (result.fluidResult) {
        result.fluidResult = await encryptData(result.fluidResult as Record<string, unknown>);
      }

      return result;
    } catch (error) {
      console.error('🔒 Encryption failed, storing unencrypted:', error);
      return data; // Fallback to unencrypted storage
    }
  }

  /**
   * Decrypts sensitive fields in the data object
   */
  private async decryptSensitiveData(data: Record<string, unknown>): Promise<Record<string, unknown>> {
    if (!data || typeof data !== 'object') {
      return data;
    }

    const result = { ...data };
    
    try {
      // Decrypt patient data if present and appears encrypted
      if (result.patientData && typeof result.patientData === 'string') {
        const decrypted = await decryptData(result.patientData);
        if (decrypted) {
          result.patientData = decrypted;
        }
      }
      
      // Decrypt region selections
      if (result.regionSelections && typeof result.regionSelections === 'string') {
        const decrypted = await decryptData(result.regionSelections);
        if (decrypted && typeof decrypted === 'object' && 'selections' in decrypted) {
          result.regionSelections = (decrypted as { selections: unknown }).selections;
        } else if (decrypted) {
          result.regionSelections = decrypted;
        }
      }
      
      // Decrypt calculation results
      if (result.tbsaResult && typeof result.tbsaResult === 'string') {
        const decrypted = await decryptData(result.tbsaResult);
        if (decrypted) {
          result.tbsaResult = decrypted;
        }
      }
      
      if (result.fluidResult && typeof result.fluidResult === 'string') {
        const decrypted = await decryptData(result.fluidResult);
        if (decrypted) {
          result.fluidResult = decrypted;
        }
      }

      return result;
    } catch (error) {
      console.error('🔒 Decryption failed, using data as-is:', error);
      return data; // Return data as-is if decryption fails
    }
  }

  /**
   * Creates storage metadata for tracking encryption status
   */
  private createMetadata(data: Record<string, unknown>): StorageMetadata {
    return {
      version: this.options.version,
      encrypted: this.options.encryptionEnabled,
      timestamp: Date.now(),
      fields: Object.keys(data || {})
    };
  }

  /**
   * Stores data with optional encryption
   */
  async setItem(key: string, data: Record<string, unknown>): Promise<void> {
    try {
      if (!this.initialized) {
        await this.initialize();
      }

      // Create metadata
      const metadata = this.createMetadata(data);
      
      // Encrypt sensitive data
      const processedData = await this.encryptSensitiveData(data);
      
      // Create storage object
      const storageObject = {
        metadata,
        data: processedData
      };
      
      // Store in localStorage
      localStorage.setItem(key, JSON.stringify(storageObject));
      
      if (this.options.encryptionEnabled) {
        console.debug('🔒 Data stored with encryption');
      }
    } catch (error) {
      console.error('🔒 Storage failed:', error);
      // Fallback: store without encryption
      try {
        localStorage.setItem(key, JSON.stringify(data));
      } catch (fallbackError) {
        console.error('🔒 Fallback storage also failed:', fallbackError);
        throw createSecurityError('Storage completely failed');
      }
    }
  }

  /**
   * Retrieves data with automatic decryption
   */
  async getItem(key: string): Promise<Record<string, unknown> | null> {
    try {
      if (!this.initialized) {
        await this.initialize();
      }

      const stored = localStorage.getItem(key);
      if (!stored) {
        return null;
      }

      let parsedData;
      try {
        parsedData = JSON.parse(stored);
      } catch {
        console.warn('🔒 Invalid JSON in storage, clearing corrupted data');
        localStorage.removeItem(key);
        return null;
      }

      // Check if this is a new format with metadata
      if (parsedData && typeof parsedData === 'object' && 'metadata' in parsedData) {
        const { metadata, data } = parsedData;
        
        // Version check
        if (metadata.version !== this.options.version) {
          console.info(`🔒 Storage version mismatch (stored: ${metadata.version}, current: ${this.options.version})`);
          // Could implement migration logic here
        }
        
        // Decrypt if needed
        if (metadata.encrypted) {
          return await this.decryptSensitiveData(data);
        } else {
          return data;
        }
      } else {
        // Legacy format - try to use as-is or decrypt if it looks encrypted
        return await this.decryptSensitiveData(parsedData);
      }
    } catch (error) {
      console.error('🔒 Data retrieval failed:', error);
      return null;
    }
  }

  /**
   * Removes data from storage
   */
  removeItem(key: string): void {
    try {
      localStorage.removeItem(key);
    } catch (error) {
      console.error('🔒 Failed to remove item from storage:', error);
    }
  }

  /**
   * Clears all storage and encryption keys
   */
  clear(): void {
    try {
      localStorage.clear();
      clearEncryptionKeys();
      console.info('🔒 Storage and encryption keys cleared');
    } catch (error) {
      console.error('🔒 Failed to clear storage:', error);
    }
  }

  /**
   * Gets current encryption status
   */
  getEncryptionStatus(): { enabled: boolean; available: boolean; initialized: boolean } {
    return {
      enabled: this.options.encryptionEnabled,
      available: isEncryptionAvailable(),
      initialized: this.initialized
    };
  }
}

/**
 * Creates a Zustand-compatible storage adapter with encryption
 */
export function createEncryptedStorageAdapter(options: Partial<EncryptedStorageOptions> = {}) {
  const defaultOptions: EncryptedStorageOptions = {
    encryptionEnabled: true,
    storageKey: 'burn-wizard-store',
    version: 1,
    ...options
  };

  const storage = new EncryptedStorage(defaultOptions);

  return {
    getItem: async (name: string) => {
      try {
        return await storage.getItem(name);
      } catch (error) {
        console.error('🔒 Storage adapter getItem failed:', error);
        return null;
      }
    },
    setItem: async (name: string, value: Record<string, unknown>) => {
      try {
        await storage.setItem(name, value);
      } catch (error) {
        console.error('🔒 Storage adapter setItem failed:', error);
        // Don't throw - let the app continue with in-memory state
      }
    },
    removeItem: (name: string) => {
      storage.removeItem(name);
    }
  };
}

/**
 * Default encrypted storage instance for the application
 */
export const encryptedStorage = new EncryptedStorage({
  encryptionEnabled: true,
  storageKey: 'burn-wizard-encrypted',
  version: 1
});

// Initialize on module load
encryptedStorage.initialize().catch(error => {
  console.error('🔒 Failed to initialize encrypted storage:', error);
});