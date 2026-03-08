'use client';

import { useState, useRef, useEffect } from 'react';

interface GradientSliderProps {
  value: number;
  onChange: (value: number) => void;
  label: string;
  min?: number;
  max?: number;
  gradientStart?: string;
  gradientEnd?: string;
  unit?: string;
}

export function GradientSlider({
  value,
  onChange,
  label,
  min = 0,
  max = 10,
  gradientStart = '#1e40af',
  gradientEnd = '#3b82f6',
  unit = '',
}: GradientSliderProps) {
  const sliderRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);

  const percentage = ((value - min) / (max - min)) * 100;

  return (
    <div className="space-y-2">
      <div className="flex justify-between items-center">
        <label className="text-sm font-medium text-foreground">{label}</label>
        <span className="text-lg font-bold text-primary">
          {(value ?? 0).toFixed(1)}{unit}
        </span>
      </div>

      <div className="relative group">
        <input
          ref={sliderRef}
          type="range"
          min={min}
          max={max}
          step={0.1}
          value={value}
          onChange={(e) => onChange(parseFloat(e.target.value))}
          onMouseDown={() => setIsDragging(true)}
          onMouseUp={() => setIsDragging(false)}
          onTouchStart={() => setIsDragging(true)}
          onTouchEnd={() => setIsDragging(false)}
          className="w-full h-2 appearance-none bg-transparent rounded-lg cursor-pointer focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-0"
          style={{
            background: `linear-gradient(to right, ${gradientStart}, ${gradientEnd})`,
            WebkitAppearance: 'none',
          } as React.CSSProperties}
        />
        <style jsx>{`
          input[type='range']::-webkit-slider-thumb {
            appearance: none;
            width: 18px;
            height: 18px;
            border-radius: 50%;
            background: #f5f7fb;
            border: 2px solid #3b82f6;
            cursor: pointer;
            transition: all 0.2s ease;
            box-shadow: 0 0 16px rgba(59, 130, 246, 0.4);
          }

          input[type='range']::-webkit-slider-thumb:hover {
            transform: scale(1.15);
            box-shadow: 0 0 24px rgba(59, 130, 246, 0.6);
          }

          input[type='range']::-moz-range-thumb {
            width: 18px;
            height: 18px;
            border-radius: 50%;
            background: #f5f7fb;
            border: 2px solid #3b82f6;
            cursor: pointer;
            transition: all 0.2s ease;
            box-shadow: 0 0 16px rgba(59, 130, 246, 0.4);
          }

          input[type='range']::-moz-range-thumb:hover {
            transform: scale(1.15);
            box-shadow: 0 0 24px rgba(59, 130, 246, 0.6);
          }

          input[type='range']::-moz-range-track {
            background: transparent;
            border: none;
          }

          input[type='range']::-webkit-slider-runnable-track {
            background: linear-gradient(to right, ${gradientStart}, ${gradientEnd});
            height: 8px;
            border-radius: 4px;
          }
        `}</style>
      </div>

      <div className="h-1 bg-gradient-to-r rounded-full opacity-50 group-hover:opacity-100 transition-opacity"
        style={{
          background: `linear-gradient(to right, ${gradientStart}, ${gradientEnd})`,
          width: `${percentage}%`,
        }}
      />
    </div>
  );
}
