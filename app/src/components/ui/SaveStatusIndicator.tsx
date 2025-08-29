/**
 * Save Status Indicator Component
 * 
 * Displays the current save status with visual feedback:
 * - Saved: Green checkmark with "Saved" text
 * - Saving: Spinning loader with "Saving..." text  
 * - Unsaved: Orange dot with "Unsaved changes" text
 * - Error: Red warning with error message
 * - Disabled: Gray text when auto-save is disabled
 */

import React from 'react';
import { Check, AlertCircle, Loader2, Clock } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { SaveInfo } from '@/hooks/useAutoSave';
import { formatLastSaved } from '@/hooks/useAutoSave';

interface SaveStatusIndicatorProps {
  saveInfo: SaveInfo;
  className?: string;
  showLastSaved?: boolean;
  compact?: boolean;
}

export function SaveStatusIndicator({ 
  saveInfo, 
  className,
  showLastSaved = true,
  compact = false
}: SaveStatusIndicatorProps) {
  const getStatusIcon = () => {
    switch (saveInfo.status) {
      case 'saved':
        return <Check className="h-4 w-4 text-green-600" />;
      case 'saving':
        return <Loader2 className="h-4 w-4 text-blue-600 animate-spin" />;
      case 'unsaved':
        return <Clock className="h-4 w-4 text-amber-600" />;
      case 'error':
        return <AlertCircle className="h-4 w-4 text-red-600" />;
      case 'disabled':
      default:
        return <Clock className="h-4 w-4 text-gray-400" />;
    }
  };

  const getStatusText = () => {
    switch (saveInfo.status) {
      case 'saved':
        return 'Saved';
      case 'saving':
        return 'Saving...';
      case 'unsaved':
        return 'Unsaved changes';
      case 'error':
        return saveInfo.error || 'Save failed';
      case 'disabled':
      default:
        return 'Auto-save disabled';
    }
  };

  const getStatusColor = () => {
    switch (saveInfo.status) {
      case 'saved':
        return 'text-green-600';
      case 'saving':
        return 'text-blue-600';
      case 'unsaved':
        return 'text-amber-600';
      case 'error':
        return 'text-red-600';
      case 'disabled':
      default:
        return 'text-gray-400';
    }
  };

  if (compact) {
    return (
      <div className={cn("flex items-center gap-1", className)}>
        {getStatusIcon()}
        <span className={cn("text-xs font-medium", getStatusColor())}>
          {getStatusText()}
        </span>
      </div>
    );
  }

  return (
    <div className={cn("flex items-center gap-2 text-sm", className)}>
      {getStatusIcon()}
      <div className="flex flex-col">
        <span className={cn("font-medium", getStatusColor())}>
          {getStatusText()}
        </span>
        {showLastSaved && saveInfo.lastSaved && saveInfo.status === 'saved' && (
          <span className="text-xs text-muted-foreground">
            {formatLastSaved(saveInfo.lastSaved)}
          </span>
        )}
      </div>
    </div>
  );
}