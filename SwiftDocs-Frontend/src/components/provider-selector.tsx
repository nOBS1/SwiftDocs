'use client';

import * as React from 'react';
import { Provider, PROVIDER_NAMES } from '@/types';

interface ProviderSelectorProps {
  value: Provider;
  onValueChange: (value: Provider) => void;
  disabled?: boolean;
}

export function ProviderSelector({
  value,
  onValueChange,
  disabled = false,
}: ProviderSelectorProps) {
  // 创建提供商选项列表
  const providers = Object.entries(PROVIDER_NAMES).map(([value, label]) => ({
    value: value as Provider,
    label,
  }));

  const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newValue = e.target.value as Provider;
    console.log('选择了新的翻译服务:', newValue);
    onValueChange(newValue);
  };

  return (
    <select
      className="w-full p-2 border rounded-md bg-background"
      value={value}
      onChange={handleChange}
      disabled={disabled}
    >
      {providers.map((provider) => (
        <option key={provider.value} value={provider.value}>
          {provider.label}
        </option>
      ))}
    </select>
  );
} 