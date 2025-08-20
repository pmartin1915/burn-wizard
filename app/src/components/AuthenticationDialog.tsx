import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogHeader, 
  DialogTitle 
} from '@/components/ui/dialog';
import { 
  Shield, 
  Lock, 
  Fingerprint, 
  Eye, 
  EyeOff,
  AlertTriangle,
  CheckCircle,
  Clock
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { 
  security, 
  type AuthResult,
  type SecurityState 
} from '@/core/security-simple';

interface AuthenticationDialogProps {
  isOpen: boolean;
  onAuthSuccess: (sessionToken: string) => void;
  onCancel?: () => void;
  mode: 'setup' | 'authenticate';
  title?: string;
  description?: string;
}

interface PinInputProps {
  value: string;
  onChange: (value: string) => void;
  maxLength: number;
  disabled?: boolean;
  error?: boolean;
}

/**
 * Secure PIN input component with masked display
 */
const PinInput: React.FC<PinInputProps> = ({ 
  value, 
  onChange, 
  maxLength, 
  disabled, 
  error 
}) => {
  const [showPin, setShowPin] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value.replace(/\D/g, '').slice(0, maxLength);
    onChange(newValue);
  };

  return (
    <div className="relative">
      <Input
        type={showPin ? 'text' : 'password'}
        value={value}
        onChange={handleChange}
        placeholder={`Enter ${maxLength}-digit PIN`}
        className={cn(
          'text-center text-lg tracking-widest pr-12',
          error && 'border-red-500 focus:border-red-500'
        )}
        disabled={disabled}
        maxLength={maxLength}
        autoComplete="off"
      />
      <Button
        type="button"
        variant="ghost"
        size="sm"
        className="absolute right-1 top-1/2 -translate-y-1/2 h-8 w-8 p-0"
        onClick={() => setShowPin(!showPin)}
        disabled={disabled}
      >
        {showPin ? (
          <EyeOff className="h-4 w-4" />
        ) : (
          <Eye className="h-4 w-4" />
        )}
      </Button>
    </div>
  );
};

/**
 * PIN strength indicator
 */
const PinStrengthIndicator: React.FC<{ pin: string }> = ({ pin }) => {
  const getStrength = (pin: string): { level: number; label: string; color: string } => {
    if (pin.length < 4) return { level: 0, label: 'Too Short', color: 'text-red-500' };
    
    const hasRepeating = /(.)\1{2,}/.test(pin);
    const isSequential = /(?:0123|1234|2345|3456|4567|5678|6789)/.test(pin);
    const isCommon = ['0000', '1111', '1234', '0123', '9999'].includes(pin);
    
    if (isCommon || hasRepeating || isSequential) {
      return { level: 1, label: 'Weak', color: 'text-orange-500' };
    }
    
    if (pin.length >= 6) {
      return { level: 3, label: 'Strong', color: 'text-green-500' };
    }
    
    return { level: 2, label: 'Good', color: 'text-blue-500' };
  };

  const strength = getStrength(pin);
  
  return (
    <div className="mt-2">
      <div className="flex items-center gap-1 mb-1">
        {[1, 2, 3].map((level) => (
          <div
            key={level}
            className={cn(
              'h-1 flex-1 rounded',
              level <= strength.level 
                ? strength.color.replace('text-', 'bg-') 
                : 'bg-gray-200'
            )}
          />
        ))}
      </div>
      <p className={cn('text-xs', strength.color)}>
        PIN Strength: {strength.label}
      </p>
    </div>
  );
};

/**
 * Main authentication dialog component
 */
export const AuthenticationDialog: React.FC<AuthenticationDialogProps> = ({
  isOpen,
  onAuthSuccess,
  onCancel,
  mode,
  title,
  description
}) => {
  const [pin, setPin] = useState('');
  const [confirmPin, setConfirmPin] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [authResult, setAuthResult] = useState<AuthResult | null>(null);
  const [securityState, setSecurityState] = useState<SecurityState | null>(null);
  const [biometricAvailable, setBiometricAvailable] = useState(false);

  // Load security state on mount
  useEffect(() => {
    const loadSecurityState = async () => {
      const state = security.getSecurityStatus();
      setSecurityState(state);
      
      const biometric = await security.isBiometricAvailable();
      setBiometricAvailable(biometric);
    };
    
    loadSecurityState();
  }, [isOpen]);

  // Reset form when dialog opens/closes
  useEffect(() => {
    if (isOpen) {
      setPin('');
      setConfirmPin('');
      setError('');
      setAuthResult(null);
    }
  }, [isOpen]);

  /**
   * Handle PIN setup (for new users)
   */
  const handlePinSetup = async () => {
    setError('');
    
    // Validation
    if (pin.length < 4) {
      setError('PIN must be at least 4 digits');
      return;
    }
    
    if (pin !== confirmPin) {
      setError('PINs do not match');
      return;
    }
    
    setIsLoading(true);
    
    try {
      const success = await security.setupPin(pin);
      
      if (success) {
        // Automatically authenticate after setup
        const result = await security.authenticateWithPin(pin);
        
        if (result.success && result.sessionToken) {
          onAuthSuccess(result.sessionToken);
        } else {
          setError('Setup successful but authentication failed');
        }
      } else {
        setError('Failed to set up PIN authentication');
      }
    } catch (error) {
      setError('An error occurred during PIN setup');
      console.error('PIN setup error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Handle PIN authentication (for returning users)
   */
  const handlePinAuth = async () => {
    setError('');
    
    if (pin.length < 4) {
      setError('Please enter your PIN');
      return;
    }
    
    setIsLoading(true);
    
    try {
      const result = await security.authenticateWithPin(pin);
      setAuthResult(result);
      
      if (result.success && result.sessionToken) {
        onAuthSuccess(result.sessionToken);
      } else {
        setError(result.error || 'Authentication failed');
        setPin(''); // Clear PIN on failure
      }
    } catch (error) {
      setError('An error occurred during authentication');
      console.error('PIN auth error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Handle biometric authentication (future enhancement)
   */
  const handleBiometricAuth = async () => {
    setError('');
    setIsLoading(true);
    
    try {
      // Placeholder for biometric authentication
      // Would integrate with WebAuthn API in production
      setError('Biometric authentication not yet implemented');
    } catch (error) {
      setError('Biometric authentication failed');
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Render lockout message
   */
  const renderLockout = () => {
    if (!securityState?.lockoutUntil || Date.now() >= securityState.lockoutUntil) {
      return null;
    }
    
    const remainingTime = Math.ceil((securityState.lockoutUntil - Date.now()) / 1000);
    const minutes = Math.floor(remainingTime / 60);
    const seconds = remainingTime % 60;
    
    return (
      <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-lg">
        <AlertTriangle className="h-5 w-5 text-red-600" />
        <div className="text-sm text-red-800">
          <p className="font-medium">Account Temporarily Locked</p>
          <p>Too many failed attempts. Try again in {minutes}:{seconds.toString().padStart(2, '0')}</p>
        </div>
      </div>
    );
  };

  /**
   * Get dialog title and description
   */
  const getDialogContent = () => {
    if (mode === 'setup') {
      return {
        title: title || 'Set Up Security',
        description: description || 'Create a PIN to protect your data with AES-256 encryption',
        icon: <Shield className="h-6 w-6" />
      };
    } else {
      return {
        title: title || 'Authentication Required',
        description: description || 'Enter your PIN to access the application',
        icon: <Lock className="h-6 w-6" />
      };
    }
  };

  const dialogContent = getDialogContent();
  const isLocked = securityState?.lockoutUntil && Date.now() < securityState.lockoutUntil;

  return (
    <Dialog open={isOpen} onOpenChange={onCancel}>
      <DialogContent className="sm:max-w-md" onPointerDownOutside={(e) => e.preventDefault()}>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            {dialogContent.icon}
            {dialogContent.title}
          </DialogTitle>
          <DialogDescription>
            {dialogContent.description}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Lockout Warning */}
          {isLocked && renderLockout()}
          
          {/* PIN Setup Form */}
          {mode === 'setup' && !isLocked && (
            <div className="space-y-4">
              <div>
                <Label htmlFor="pin">Create PIN (4-8 digits)</Label>
                <PinInput
                  value={pin}
                  onChange={setPin}
                  maxLength={8}
                  disabled={isLoading}
                  error={!!error}
                />
                <PinStrengthIndicator pin={pin} />
              </div>
              
              <div>
                <Label htmlFor="confirmPin">Confirm PIN</Label>
                <PinInput
                  value={confirmPin}
                  onChange={setConfirmPin}
                  maxLength={8}
                  disabled={isLoading}
                  error={!!error}
                />
              </div>
            </div>
          )}

          {/* PIN Authentication Form */}
          {mode === 'authenticate' && !isLocked && (
            <div className="space-y-4">
              <div>
                <Label htmlFor="pin">Enter PIN</Label>
                <PinInput
                  value={pin}
                  onChange={setPin}
                  maxLength={8}
                  disabled={isLoading}
                  error={!!error}
                />
              </div>
              
              {/* Remaining attempts warning */}
              {authResult && !authResult.success && authResult.remainingAttempts !== undefined && (
                <div className="flex items-center gap-2 p-2 bg-orange-50 border border-orange-200 rounded">
                  <AlertTriangle className="h-4 w-4 text-orange-600" />
                  <p className="text-sm text-orange-800">
                    {authResult.remainingAttempts} attempts remaining
                  </p>
                </div>
              )}
            </div>
          )}

          {/* Error Display */}
          {error && (
            <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-lg">
              <AlertTriangle className="h-4 w-4 text-red-600" />
              <p className="text-sm text-red-800">{error}</p>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex flex-col gap-2">
            {!isLocked && (
              <Button
                onClick={mode === 'setup' ? handlePinSetup : handlePinAuth}
                disabled={isLoading || (mode === 'setup' ? pin.length < 4 || confirmPin.length < 4 : pin.length < 4)}
                className="w-full"
              >
                {isLoading ? (
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    {mode === 'setup' ? 'Setting up...' : 'Authenticating...'}
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <Lock className="h-4 w-4" />
                    {mode === 'setup' ? 'Set Up PIN' : 'Authenticate'}
                  </div>
                )}
              </Button>
            )}

            {/* Biometric Option (future) */}
            {mode === 'authenticate' && biometricAvailable && !isLocked && (
              <Button
                variant="outline"
                onClick={handleBiometricAuth}
                disabled={isLoading}
                className="w-full"
              >
                <Fingerprint className="h-4 w-4 mr-2" />
                Use Biometric Authentication
              </Button>
            )}

            {/* Cancel Button */}
            {onCancel && (
              <Button
                variant="outline"
                onClick={onCancel}
                disabled={isLoading}
              >
                Cancel
              </Button>
            )}
          </div>

          {/* Security Information */}
          <div className="text-xs text-gray-600 space-y-1">
            <div className="flex items-center gap-1">
              <CheckCircle className="h-3 w-3 text-green-600" />
              <span>AES-256 encryption enabled</span>
            </div>
            <div className="flex items-center gap-1">
              <CheckCircle className="h-3 w-3 text-green-600" />
              <span>Data stored locally only</span>
            </div>
            <div className="flex items-center gap-1">
              <Clock className="h-3 w-3 text-blue-600" />
              <span>Session timeout: 30 minutes</span>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default AuthenticationDialog;