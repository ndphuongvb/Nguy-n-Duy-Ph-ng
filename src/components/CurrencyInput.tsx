/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect, ChangeEvent } from 'react';
import { formatNumberDots, parseVND } from '../utils';

interface CurrencyInputProps {
  id?: string;
  value: number;
  onChange: (val: number) => void;
  className?: string;
  placeholder?: string;
  required?: boolean;
}

export function CurrencyInput({
  id,
  value,
  onChange,
  className = '',
  placeholder = '0',
  required = false
}: CurrencyInputProps) {
  const [displayValue, setDisplayValue] = useState<string>('');

  useEffect(() => {
    // Sync external value updates to screen text formatted with dots
    if (value === 0 && !displayValue) {
      setDisplayValue('');
    } else {
      const formatted = formatNumberDots(value);
      if (parseVND(displayValue) !== value) {
        setDisplayValue(value > 0 ? formatted : '');
      }
    }
  }, [value]);

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    const rawInput = e.target.value;
    // Allow empty string for deletion
    if (rawInput === '') {
      setDisplayValue('');
      onChange(0);
      return;
    }

    // Keep only numbers
    const cleanNumbers = rawInput.replace(/[^0-9]/g, '');
    if (!cleanNumbers) {
      setDisplayValue('');
      onChange(0);
      return;
    }

    const numValue = parseInt(cleanNumbers, 10);
    setDisplayValue(formatNumberDots(numValue));
    onChange(numValue);
  };

  return (
    <div className="relative flex items-center w-full">
      <input
        id={id}
        type="text"
        inputMode="numeric"
        value={displayValue}
        onChange={handleChange}
        placeholder={placeholder}
        required={required}
        className={`w-full text-right font-medium pr-10 focus:outline-none ${className}`}
      />
      <span className="absolute right-3 text-xs font-semibold text-gray-400 dark:text-gray-500 pointer-events-none select-none">
        đ
      </span>
    </div>
  );
}
