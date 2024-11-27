import React from 'react';
import { ComparisonPeriod } from '../types';

interface PeriodSelectorProps {
  value: ComparisonPeriod | 'global';
  onChange: (period: ComparisonPeriod | 'global') => void;
}

const periodLabels: Record<ComparisonPeriod | 'global', string> = {
  week: 'Semaine',
  month: 'Mois',
  year: 'Année',
  global: 'Global'
};

export function PeriodSelector({ value, onChange }: PeriodSelectorProps) {
  return (
    <div className="flex space-x-2 mb-6">
      {(['week', 'month', 'year', 'global'] as const).map((period) => (
        <button
          key={period}
          onClick={() => onChange(period)}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
            value === period
              ? 'bg-blue-900 text-white'
              : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
          }`}
        >
          {periodLabels[period]}
        </button>
      ))}
    </div>
  );
}