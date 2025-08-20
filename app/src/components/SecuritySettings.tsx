import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
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
  Key, 
  Download, 
  Trash2, 
  AlertTriangle, 
  CheckCircle,
  Eye,
  Clock,
  Smartphone,
  HardDrive
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { 
  security, 
  type SecurityState,
  type SecurityAuditEvent
} from '@/core/security-simple';
import AuthenticationDialog from './AuthenticationDialog';

interface SecuritySettingsProps {
  className?: string;
}

/**
 * Security status indicator component
 */
const SecurityStatusIndicator: React.FC<{ 
  enabled: boolean; 
  label: string; 
  description: string;
}> = ({ enabled, label, description }) => (
  <div className="flex items-start gap-3 p-3 rounded-lg border">
    <div className={cn(
      'mt-0.5 h-2 w-2 rounded-full',
      enabled ? 'bg-green-500' : 'bg-gray-300'
    )} />
    <div className="flex-1">
      <p className="font-medium text-sm">{label}</p>
      <p className="text-xs text-gray-600">{description}</p>
    </div>
    {enabled && <CheckCircle className="h-4 w-4 text-green-600 mt-0.5" />}
  </div>
);

/**
 * Audit log viewer component
 */
const AuditLogViewer: React.FC<{ events: SecurityAuditEvent[] }> = ({ events }) => {
  const [showDetails, setShowDetails] = useState<string | null>(null);

  const formatTimestamp = (timestamp: number) => {
    return new Date(timestamp).toLocaleString();
  };

  const formatEvent = (event: string) => {
    return event.split('_').map(word => 
      word.charAt(0).toUpperCase() + word.slice(1)
    ).join(' ');
  };

  return (
    <div className="space-y-2 max-h-64 overflow-y-auto">
      {events.length === 0 ? (
        <p className="text-sm text-gray-500 text-center py-4">
          No security events recorded
        </p>
      ) : (
        events.slice(-20).reverse().map((event, index) => (
          <div
            key={`${event.timestamp}-${index}`}
            className="flex items-center justify-between p-2 rounded border hover:bg-gray-50 cursor-pointer"
            onClick={() => setShowDetails(
              showDetails === `${event.timestamp}-${index}` 
                ? null 
                : `${event.timestamp}-${index}`
            )}
          >
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <div className={cn(
                  'h-2 w-2 rounded-full',
                  event.success ? 'bg-green-500' : 'bg-red-500'
                )} />
                <span className="text-sm font-medium">
                  {formatEvent(event.event)}
                </span>
                <span className="text-xs text-gray-500">
                  {formatTimestamp(event.timestamp)}
                </span>
              </div>
              {showDetails === `${event.timestamp}-${index}` && event.details && (
                <div className="mt-2 p-2 bg-gray-50 rounded text-xs">
                  <pre className="whitespace-pre-wrap">
                    {JSON.stringify(event.details, null, 2)}
                  </pre>
                </div>
              )}
            </div>
            <Eye className="h-4 w-4 text-gray-400" />
          </div>
        ))
      )}
    </div>
  );
};

/**
 * Data wipe confirmation dialog
 */
const DataWipeDialog: React.FC<{ 
  onConfirm: () => void;
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
}> = ({ onConfirm, isOpen, onOpenChange }) => {
  const [confirmText, setConfirmText] = useState('');
  const [isWiping, setIsWiping] = useState(false);

  const handleWipe = async () => {
    setIsWiping(true);
    await onConfirm();
    setIsWiping(false);
    onOpenChange(false);
    setConfirmText('');
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-red-600">
            <AlertTriangle className="h-5 w-5" />
            Permanently Delete All Data
          </DialogTitle>
          <DialogDescription className="space-y-2">
            <p>This action will permanently delete:</p>
            <ul className="list-disc pl-5 space-y-1 text-sm">
              <li>All patient sessions and calculations</li>
              <li>Security settings and authentication data</li>
              <li>Audit logs and application preferences</li>
              <li>All encrypted local storage</li>
            </ul>
            <p className="font-medium text-red-600">
              This action cannot be undone.
            </p>
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div>
            <Label htmlFor="confirm">
              Type "DELETE ALL DATA" to confirm:
            </Label>
            <input
              id="confirm"
              type="text"
              value={confirmText}
              onChange={(e) => setConfirmText(e.target.value)}
              className="w-full mt-1 px-3 py-2 border rounded-md"
              placeholder="DELETE ALL DATA"
              disabled={isWiping}
            />
          </div>

          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isWiping}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleWipe}
              disabled={confirmText !== 'DELETE ALL DATA' || isWiping}
              className="flex-1"
            >
              {isWiping ? (
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Wiping...
                </div>
              ) : (
                <>
                  <Trash2 className="h-4 w-4 mr-2" />
                  Delete All Data
                </>
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

/**
 * Main security settings component
 */
export const SecuritySettings: React.FC<SecuritySettingsProps> = ({ className }) => {
  const [securityState, setSecurityState] = useState<SecurityState | null>(null);
  const [auditLog, setAuditLog] = useState<SecurityAuditEvent[]>([]);
  const [showAuthDialog, setShowAuthDialog] = useState(false);
  const [showWipeDialog, setShowWipeDialog] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [biometricAvailable, setBiometricAvailable] = useState(false);

  // Load security state and audit log
  const loadSecurityData = async () => {
    const state = security.getSecurityStatus();
    setSecurityState(state);
    
    const log = security.getAuditLog();
    setAuditLog(log);

    const biometric = await security.isBiometricAvailable();
    setBiometricAvailable(biometric);
  };

  useEffect(() => {
    loadSecurityData();
  }, []);

  /**
   * Handle PIN setup
   */
  const handleSetupPin = () => {
    setShowAuthDialog(true);
  };

  /**
   * Handle authentication success
   */
  const handleAuthSuccess = (_sessionToken: string) => {
    setShowAuthDialog(false);
    loadSecurityData(); // Refresh data
  };

  /**
   * Export audit log
   */
  const handleExportAuditLog = () => {
    try {
      const csvData = security.exportAuditLog();
      const blob = new Blob([csvData], { type: 'text/csv' });
      const url = URL.createObjectURL(blob);
      
      const link = document.createElement('a');
      link.href = url;
      link.download = `burn-wizard-audit-log-${new Date().toISOString().split('T')[0]}.csv`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Failed to export audit log:', error);
    }
  };

  /**
   * Handle data wipe
   */
  const handleDataWipe = async () => {
    setIsLoading(true);
    try {
      await security.wipeAllData();
      await loadSecurityData();
    } catch (error) {
      console.error('Data wipe failed:', error);
    } finally {
      setIsLoading(false);
    }
  };

  if (!securityState) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className={cn('space-y-6', className)}>
      {/* Security Overview */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Security Overview
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <SecurityStatusIndicator
            enabled={securityState.encryptionEnabled}
            label="Data Encryption"
            description="AES-256 encryption protects all local data"
          />
          
          <SecurityStatusIndicator
            enabled={!!securityState.authMethod}
            label="Authentication"
            description={
              securityState.authMethod 
                ? `${securityState.authMethod.toUpperCase()} authentication enabled`
                : "No authentication configured"
            }
          />
          
          <SecurityStatusIndicator
            enabled={securityState.isAuthenticated}
            label="Current Session"
            description={
              securityState.isAuthenticated
                ? "Authenticated and active"
                : "Not authenticated"
            }
          />
        </CardContent>
      </Card>

      {/* Authentication Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Lock className="h-5 w-5" />
            Authentication Settings
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <p className="font-medium">PIN Authentication</p>
              <p className="text-sm text-gray-600">
                Protect access with a secure PIN
              </p>
            </div>
            <Button
              onClick={handleSetupPin}
              variant={securityState.encryptionEnabled ? "outline" : "default"}
              size="sm"
            >
              <Key className="h-4 w-4 mr-2" />
              {securityState.encryptionEnabled ? 'Change PIN' : 'Set Up PIN'}
            </Button>
          </div>

          {/* Biometric Authentication (Future) */}
          <div className="flex items-center justify-between opacity-50">
            <div className="space-y-1">
              <p className="font-medium">Biometric Authentication</p>
              <p className="text-sm text-gray-600">
                {biometricAvailable 
                  ? "Use fingerprint or face recognition" 
                  : "Not supported on this device"
                }
              </p>
            </div>
            <Switch disabled />
          </div>

          {/* Session Management */}
          {securityState.isAuthenticated && (
            <div className="flex items-center justify-between p-3 bg-green-50 border border-green-200 rounded">
              <div className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-green-600" />
                <div>
                  <p className="text-sm font-medium text-green-800">
                    Session Active
                  </p>
                  <p className="text-xs text-green-600">
                    Expires: {securityState.sessionExpiry 
                      ? new Date(securityState.sessionExpiry).toLocaleTimeString()
                      : 'Unknown'
                    }
                  </p>
                </div>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  security.signOut();
                  loadSecurityData();
                }}
              >
                Sign Out
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Data Management */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <HardDrive className="h-5 w-5" />
            Data Management
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Button
              variant="outline"
              onClick={handleExportAuditLog}
              className="justify-start"
            >
              <Download className="h-4 w-4 mr-2" />
              Export Audit Log
            </Button>

            <Button
              variant="destructive"
              onClick={() => setShowWipeDialog(true)}
              className="justify-start"
              disabled={isLoading}
            >
              <Trash2 className="h-4 w-4 mr-2" />
              Wipe All Data
            </Button>
          </div>

          {/* Storage Information */}
          <div className="text-xs text-gray-600 space-y-1 mt-4 p-3 bg-gray-50 rounded">
            <div className="flex items-center gap-1">
              <Clock className="h-3 w-3" />
              <span>Audit events: {auditLog.length}</span>
            </div>
            <div className="flex items-center gap-1">
              <Smartphone className="h-3 w-3" />
              <span>Device ID: {security.getSecurityStatus().sessionToken?.slice(0, 8) || 'Not available'}...</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Audit Log */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Eye className="h-5 w-5" />
            Security Audit Log
            <span className="text-sm font-normal text-gray-500">
              (Last 20 events)
            </span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <AuditLogViewer events={auditLog} />
        </CardContent>
      </Card>

      {/* Authentication Dialog */}
      <AuthenticationDialog
        isOpen={showAuthDialog}
        mode={securityState.encryptionEnabled ? 'authenticate' : 'setup'}
        onAuthSuccess={handleAuthSuccess}
        onCancel={() => setShowAuthDialog(false)}
        title={securityState.encryptionEnabled ? 'Change PIN' : 'Set Up Security'}
        description={
          securityState.encryptionEnabled 
            ? 'Enter your current PIN to change security settings'
            : 'Create a PIN to enable AES-256 encryption for your data'
        }
      />

      {/* Data Wipe Dialog */}
      <DataWipeDialog
        isOpen={showWipeDialog}
        onOpenChange={setShowWipeDialog}
        onConfirm={handleDataWipe}
      />
    </div>
  );
};

export default SecuritySettings;