import React from 'react';

interface ProgressBarProps {
  value: number;
  max?: number;
  label?: string;
  showPercent?: boolean;
  color?: string;
  size?: 'sm' | 'md' | 'lg';
}

export function ProgressBar({ 
  value, 
  max = 100, 
  label, 
  showPercent = true,
  color = '#1a365d',
  size = 'md' 
}: ProgressBarProps) {
  const percent = Math.min((value / max) * 100, 100);
  
  const heights = {
    sm: 'h-2',
    md: 'h-3',
    lg: 'h-4'
  };

  return (
    <div className="w-full">
      {(label || showPercent) && (
        <div className="flex items-center justify-between mb-1.5">
          {label && <span className="text-sm text-gray-600">{label}</span>}
          {showPercent && (
            <span className="text-sm font-semibold text-gray-900">
              {percent.toFixed(0)}%
            </span>
          )}
        </div>
      )}
      <div className={`w-full bg-gray-200 rounded-full overflow-hidden ${heights[size]}`}>
        <div
          className="h-full rounded-full transition-all duration-500 ease-out"
          style={{ 
            width: `${percent}%`, 
            backgroundColor: percent >= 100 ? '#38a169' : color 
          }}
        />
      </div>
    </div>
  );
}
