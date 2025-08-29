import React from 'react';
import { cn } from '@/lib/utils';

interface CircularProgressProps {
  value: number;
  max?: number;
  size?: number;
  strokeWidth?: number;
  className?: string;
  showValue?: boolean;
  valueClassName?: string;
  label?: string;
  labelClassName?: string;
  color?: 'primary' | 'warning' | 'danger' | 'success';
  animate?: boolean;
}

export function CircularProgress({
  value,
  max = 100,
  size = 120,
  strokeWidth = 8,
  className,
  showValue = true,
  valueClassName,
  label,
  labelClassName,
  color = 'primary',
  animate = true
}: CircularProgressProps) {
  const normalizedValue = Math.min(Math.max(value, 0), max);
  const percentage = (normalizedValue / max) * 100;
  
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const strokeDasharray = circumference;
  const strokeDashoffset = circumference - (percentage / 100) * circumference;

  const colorClasses = {
    primary: 'stroke-primary',
    warning: 'stroke-amber-500',
    danger: 'stroke-red-500',
    success: 'stroke-green-500'
  };

  return (
    <div className={cn("relative inline-flex items-center justify-center", className)}>
      <svg
        width={size}
        height={size}
        className={cn("transform -rotate-90 transition-all duration-1000", animate && "animate-scale-in")}
        style={{ filter: 'drop-shadow(0 0 8px rgba(0,0,0,0.1))' }}
      >
        {/* Background circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="transparent"
          stroke="hsl(var(--muted))"
          strokeWidth={strokeWidth}
          className="opacity-20"
        />
        
        {/* Progress circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="transparent"
          strokeWidth={strokeWidth}
          strokeDasharray={strokeDasharray}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
          className={cn(
            colorClasses[color],
            "transition-all duration-1000 ease-out",
            animate && "animate-fade-in-up animate-stagger-1"
          )}
          style={{
            filter: percentage > 0 ? 'drop-shadow(0 0 6px currentColor)' : 'none'
          }}
        />
      </svg>
      
      {/* Content overlay */}
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        {showValue && (
          <span className={cn(
            "data-metric-medium font-bold transition-all duration-500",
            animate && "animate-scale-in animate-stagger-2",
            valueClassName
          )}>
            {Math.round(normalizedValue)}{max === 100 ? '%' : ''}
          </span>
        )}
        {label && (
          <span className={cn(
            "burn-wizard-body-sm text-center mt-1 transition-all duration-500",
            animate && "animate-fade-in-up animate-stagger-3",
            labelClassName
          )}>
            {label}
          </span>
        )}
      </div>
    </div>
  );
}