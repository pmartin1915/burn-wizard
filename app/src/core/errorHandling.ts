/**
 * Enhanced Error Handling for Burn Wizard
 * 
 * Provides centralized error handling with security considerations:
 * - Sanitizes error messages to prevent information disclosure
 * - Logs security events for monitoring
 * - Provides user-friendly error messages
 * - Prevents stack trace exposure in production
 */

export enum ErrorCategory {
  VALIDATION = 'VALIDATION',
  CALCULATION = 'CALCULATION', 
  SECURITY = 'SECURITY',
  SYSTEM = 'SYSTEM',
  CLINICAL = 'CLINICAL'
}

export enum ErrorSeverity {
  LOW = 'LOW',
  MEDIUM = 'MEDIUM', 
  HIGH = 'HIGH',
  CRITICAL = 'CRITICAL'
}

export interface ValidationError {
  category: ErrorCategory;
  severity: ErrorSeverity;
  field?: string;
  message: string;
  userMessage: string;
  timestamp: Date;
  context?: Record<string, unknown>;
}

/**
 * Creates a standardized validation error
 */
export function createValidationError(
  field: string,
  message: string,
  severity: ErrorSeverity = ErrorSeverity.MEDIUM,
  context?: Record<string, unknown>
): ValidationError {
  return {
    category: ErrorCategory.VALIDATION,
    severity,
    field,
    message: sanitizeErrorMessage(message),
    userMessage: createUserFriendlyMessage(field, message),
    timestamp: new Date(),
    context: sanitizeContext(context)
  };
}

/**
 * Creates a calculation error
 */
export function createCalculationError(
  message: string,
  severity: ErrorSeverity = ErrorSeverity.HIGH,
  context?: Record<string, unknown>
): ValidationError {
  return {
    category: ErrorCategory.CALCULATION,
    severity,
    message: sanitizeErrorMessage(message),
    userMessage: 'A calculation error occurred. Please verify your inputs and try again.',
    timestamp: new Date(),
    context: sanitizeContext(context)
  };
}

/**
 * Creates a security-related error
 */
export function createSecurityError(
  message: string,
  context?: Record<string, unknown>
): ValidationError {
  // Log security events for monitoring
  logSecurityEvent(message, context);
  
  return {
    category: ErrorCategory.SECURITY,
    severity: ErrorSeverity.CRITICAL,
    message: sanitizeErrorMessage(message),
    userMessage: 'Invalid input detected. Please ensure all fields contain valid data.',
    timestamp: new Date(),
    context: sanitizeContext(context)
  };
}

/**
 * Sanitizes error messages to prevent information disclosure
 */
function sanitizeErrorMessage(message: string): string {
  // Remove potentially sensitive information
  return message
    .replace(/password/gi, '[REDACTED]')
    .replace(/token/gi, '[REDACTED]')
    .replace(/key/gi, '[REDACTED]')
    .replace(/secret/gi, '[REDACTED]')
    .replace(/api[_-]?key/gi, '[REDACTED]')
    .replace(/file:\/\/\//g, '[FILE_PATH]')
    .replace(/\b\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}\b/g, '[IP_ADDRESS]')
    .trim();
}

/**
 * Creates user-friendly error messages
 */
function createUserFriendlyMessage(field: string, message: string): string {
  const friendlyFieldNames: Record<string, string> = {
    'ageMonths': 'Age',
    'weightKg': 'Weight', 
    'tbsaPct': 'Burn Percentage',
    'hoursSinceInjury': 'Hours Since Injury',
    'heartRate': 'Heart Rate',
    'systolicBP': 'Blood Pressure',
    'diastolicBP': 'Blood Pressure',
    'oxygenSat': 'Oxygen Saturation'
  };
  
  const friendlyField = friendlyFieldNames[field] || field;
  
  // Common validation error patterns
  if (message.includes('required')) {
    return `${friendlyField} is required.`;
  }
  
  if (message.includes('minimum') || message.includes('must be at least')) {
    return `${friendlyField} value is too low.`;
  }
  
  if (message.includes('maximum') || message.includes('exceeds')) {
    return `${friendlyField} value is too high.`;
  }
  
  if (message.includes('invalid characters') || message.includes('not a valid number')) {
    return `${friendlyField} contains invalid characters. Please enter a valid number.`;
  }
  
  if (message.includes('finite number')) {
    return `${friendlyField} must be a valid number.`;
  }
  
  // Default friendly message
  return `Please check the ${friendlyField} field and try again.`;
}

/**
 * Sanitizes context data to prevent sensitive information exposure
 */
function sanitizeContext(context?: Record<string, unknown>): Record<string, unknown> | undefined {
  if (!context) return undefined;
  
  const sanitized: Record<string, unknown> = {};
  
  for (const [key, value] of Object.entries(context)) {
    // Skip potentially sensitive keys
    if (/password|token|key|secret|api/i.test(key)) {
      sanitized[key] = '[REDACTED]';
    } else if (typeof value === 'string' && value.length > 1000) {
      // Truncate very long strings
      sanitized[key] = value.substring(0, 1000) + '...[TRUNCATED]';
    } else {
      sanitized[key] = value;
    }
  }
  
  return sanitized;
}

/**
 * Logs security events for monitoring
 */
function logSecurityEvent(message: string, context?: Record<string, unknown>): void {
  const securityEvent = {
    timestamp: new Date().toISOString(),
    type: 'SECURITY_VALIDATION_FAILURE',
    message: sanitizeErrorMessage(message),
    context: sanitizeContext(context),
    userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : 'Unknown',
    url: typeof window !== 'undefined' ? window.location.href : 'Unknown'
  };
  
  // In development, log to console
  if (process.env.NODE_ENV === 'development') {
    console.warn('🔒 Security Event:', securityEvent);
  }
  
  // In production, you would send this to your security monitoring system
  // sendToSecurityMonitoring(securityEvent);
}

/**
 * Error handler that provides appropriate responses based on environment
 */
export function handleError(error: unknown): ValidationError {
  if (error instanceof Error) {
    // Check if it's a security-related error
    if (error.message.includes('malicious') || 
        error.message.includes('invalid characters') ||
        error.message.includes('injection')) {
      return createSecurityError(error.message);
    }
    
    // Check if it's a validation error
    if (error.message.includes('validation') || 
        error.message.includes('must be') ||
        error.message.includes('required')) {
      return createValidationError('unknown', error.message);
    }
    
    // Default to calculation error
    return createCalculationError(error.message);
  }
  
  // Handle unknown error types
  return createCalculationError('An unexpected error occurred');
}

/**
 * Validates that error handling is working properly (for testing)
 */
export function validateErrorHandling(): boolean {
  try {
    const testError = createValidationError('test', 'Test message');
    return testError.category === ErrorCategory.VALIDATION;
  } catch {
    return false;
  }
}

/**
 * Gets error statistics for monitoring
 */
export function getErrorStats(): {
  categories: Record<ErrorCategory, number>;
  severities: Record<ErrorSeverity, number>;
} {
  // This would be implemented with actual error tracking in production
  return {
    categories: {
      [ErrorCategory.VALIDATION]: 0,
      [ErrorCategory.CALCULATION]: 0,
      [ErrorCategory.SECURITY]: 0,
      [ErrorCategory.SYSTEM]: 0,
      [ErrorCategory.CLINICAL]: 0
    },
    severities: {
      [ErrorSeverity.LOW]: 0,
      [ErrorSeverity.MEDIUM]: 0,
      [ErrorSeverity.HIGH]: 0,
      [ErrorSeverity.CRITICAL]: 0
    }
  };
}