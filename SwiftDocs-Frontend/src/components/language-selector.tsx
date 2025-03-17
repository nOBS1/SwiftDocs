'use client';

import * as React from 'react';
import { TargetLanguage, TARGET_LANGUAGE_NAMES } from '@/types';

interface LanguageSelectorProps {
  value: TargetLanguage;
  onValueChange: (value: TargetLanguage) => void;
  disabled?: boolean;
}

export function LanguageSelector({
  value,
  onValueChange,
  disabled = false,
}: LanguageSelectorProps) {
  // 创建语言选项列表
  const languages = Object.entries(TARGET_LANGUAGE_NAMES).map(([value, label]) => ({
    value: value as TargetLanguage,
    label,
  }));

  const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newValue = e.target.value as TargetLanguage;
    console.log('选择了新的目标语言:', newValue);
    onValueChange(newValue);
  };

  return (
    <select
      className="w-full p-2 border rounded-md bg-background"
      value={value}
      onChange={handleChange}
      disabled={disabled}
    >
      {languages.map((language) => (
        <option key={language.value} value={language.value}>
          {language.label}
        </option>
      ))}
    </select>
  );
}
