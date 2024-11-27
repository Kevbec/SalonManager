import React, { useState } from 'react';
import { ArrowUp, ArrowDown, ChevronDown } from 'lucide-react';
import { ComparisonPeriod } from '../types';

interface KPICardProps {
  icon: React.ElementType;
  title: string;
  kpi: {
    current: number;
    previous: number;
    percentageChange: number;
    comparisonPeriod: ComparisonPeriod | 'global';
  };
  format: (value: number) => string;
  comparisonPeriod: ComparisonPeriod | 'global';
  onComparisonChange: (period: ComparisonPeriod | 'global') => void;
}

const periodLabels: Record<ComparisonPeriod | 'global', string> = {
  week: 'la semaine dernière',
  month: 'le mois dernier',
  year: "l'année dernière",
  global: 'toutes les données'
};

export function KPICard({
  icon: Icon,
  title,
  kpi,
  format,
  comparisonPeriod,
  onComparisonChange
}: KPICardProps) {
  const [showPeriodDropdown, setShowPeriodDropdown] = useState(false);

  const getPercentageColor = (percentage: number) => {
    if (percentage > 0) return 'text-green-500';
    if (percentage < 0) return 'text-red-500';
    return 'text-gray-500';
  };

  const getPercentageBgColor = (percentage: number) => {
    if (percentage > 0) return 'bg-green-50';
    if (percentage < 0) return 'bg-red-50';
    return 'bg-gray-50';
  };

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-4">
          <div className="bg-blue-100 p-3 rounded-lg">
            <Icon className="w-6 h-6 text-blue-900" />
          </div>
          <div>
            <h3 className="text-sm font-medium text-gray-500">{title}</h3>
            <p className="text-2xl font-semibold text-gray-900">{format(kpi.current)}</p>
          </div>
        </div>
      </div>

      <div className="flex items-center justify-between">
        <div className="relative">
          <button
            onClick={() => setShowPeriodDropdown(!showPeriodDropdown)}
            className="flex items-center text-sm text-gray-500 hover:text-gray-700"
          >
            <span>vs. {format(kpi.previous)} {periodLabels[comparisonPeriod]}</span>
            <ChevronDown className="w-4 h-4 ml-1" />
          </button>
          
          {showPeriodDropdown && (
            <div className="absolute top-full left-0 mt-1 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-10">
              {(['week', 'month', 'year', 'global'] as const).map((period) => (
                <button
                  key={period}
                  onClick={() => {
                    onComparisonChange(period);
                    setShowPeriodDropdown(false);
                  }}
                  className={`w-full px-4 py-2 text-left text-sm ${
                    comparisonPeriod === period
                      ? 'bg-blue-50 text-blue-900'
                      : 'text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  {periodLabels[period]}
                </button>
              ))}
            </div>
          )}
        </div>

        {comparisonPeriod !== 'global' && kpi.percentageChange !== 0 && (
          <div className={`px-3 py-1 rounded-full ${getPercentageBgColor(kpi.percentageChange)}`}>
            <div className="flex items-center">
              {kpi.percentageChange > 0 ? (
                <ArrowUp className={`w-4 h-4 ${getPercentageColor(kpi.percentageChange)}`} />
              ) : (
                <ArrowDown className={`w-4 h-4 ${getPercentageColor(kpi.percentageChange)}`} />
              )}
              <span className={`ml-1 text-sm font-medium ${getPercentageColor(kpi.percentageChange)}`}>
                {Math.abs(kpi.percentageChange).toFixed(1)}%
              </span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}