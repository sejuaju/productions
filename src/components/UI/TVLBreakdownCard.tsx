"use client"

import React, { useMemo } from 'react';
import { Doughnut } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend as ChartLegend,
} from 'chart.js';
import { useTVLBreakdown } from '@/hooks/useTVLBreakdown';
import { useTheme } from '@/context/ThemeContext';
import { formatDisplayPrice, formatPercentage } from '@/utils/tokenFormatter';
import TokenLogo from './TokenLogo';

ChartJS.register(ArcElement, Tooltip, ChartLegend);

// Helper to read CSS variable values at runtime
const getCssVar = (name: string, fallback: string): string => {
  if (typeof window === 'undefined') return fallback;
  const v = getComputedStyle(document.documentElement).getPropertyValue(name).trim();
  return v || fallback;
};

// Enhanced color palette with opacity variants
const generatePalette = (theme: string) => {
  const baseColors = [
    { name: '--primary', fallback: '#4f46e5' },
    { name: '--secondary', fallback: '#06b6d4' },
    { name: '--accent', fallback: '#f97316' },
    { name: '--success', fallback: '#10b981' },
    { name: '--warning', fallback: '#f59e0b' },
    { name: '--info', fallback: '#3b82f6' },
    { name: '--purple', fallback: '#8b5cf6' },
  ];

  return baseColors.map(({ name, fallback }) => {
    const color = getCssVar(name, fallback);
    return color;
  });
};

// Format currency values
const formatCurrency = (value: string, symbol = '$') => {
  const num = parseFloat(value);
  if (num === 0) return `${symbol}0`;
  // For small amounts (<1) return exact without scientific notation
  if (num < 1) return `${symbol}${value}`;
  if (num < 1000) return `${symbol}${num.toFixed(2)}`;
  if (num < 1000000) return `${symbol}${(num / 1000).toFixed(1)}K`;
  return `${symbol}${(num / 1000000).toFixed(2)}M`;
};

export default function TVLBreakdownCard() {
  const { theme } = useTheme();
  const { data, loading, error } = useTVLBreakdown();
  
  // Generate color palette based on theme
  const colorPalette = useMemo(() => generatePalette(theme), [theme]);

  const chartData = useMemo(() => {
    if (!data) return null;
    return {
      labels: data.breakdown.map((b) => b.label),
      datasets: [
        {
          data: data.breakdown.map((b) => b.percentage),
          backgroundColor: data.breakdown.map((_, i) => colorPalette[i % colorPalette.length]),
          borderColor: theme === 'dark' ? 'rgba(0,0,0,0.2)' : 'rgba(255,255,255,0.8)',
          borderWidth: 1,
          hoverOffset: 10,
          hoverBorderColor: getCssVar('--primary', '#4f46e5'),
          hoverBorderWidth: 2,
        },
      ],
    } as const;
  }, [data, colorPalette, theme]);

  const chartOptions = useMemo(() => ({
    responsive: true,
    maintainAspectRatio: false,
    cutout: '65%', // Thinner doughnut
    layout: {
      padding: 10,
    },
    plugins: {
      legend: {
        display: false, // Hide default legend, we'll create our own
      },
      tooltip: {
        backgroundColor: theme === 'dark' ? 'rgba(0,0,0,0.85)' : 'rgba(255,255,255,0.95)',
        titleColor: theme === 'dark' ? '#fff' : '#000',
        bodyColor: theme === 'dark' ? '#fff' : '#000',
        titleFont: {
          size: 14,
          weight: 'bold',
        },
        bodyFont: {
          size: 13,
        },
        padding: 12,
        cornerRadius: 8,
        displayColors: true,
        boxWidth: 8,
        boxHeight: 8,
        boxPadding: 4,
        callbacks: {
          label: (ctx: any) => {
            const label = ctx.label || '';
            const value = ctx.parsed;
            const tvl = data?.breakdown[ctx.dataIndex]?.tvl || '0';
            return [
              `${label}: ${value.toFixed(2)}%`,
              `TVL: ${formatCurrency(tvl)}`
            ];
          },
        },
      },
    },
  }), [theme, data]);

  return (
    <div className="card p-6 shadow-md">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-xl font-bold text-[var(--text-primary)]">TVL Breakdown</h3>
        {data && (
          <div className="text-right">
            <p className="text-sm text-[var(--text-secondary)]">Total TVL</p>
            <p className="text-lg font-bold text-[var(--text-primary)]">
              {formatDisplayPrice(data.total_tvl)}
            </p>
          </div>
        )}
      </div>

      {loading ? (
        <div className="h-64 flex items-center justify-center">
          <div className="flex flex-col items-center">
            <svg className="animate-spin h-8 w-8 text-[var(--primary)] mb-2" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
            </svg>
            <span className="text-[var(--text-secondary)]">Loading TVL data...</span>
          </div>
        </div>
      ) : error ? (
        <div className="h-64 flex items-center justify-center">
          <div className="flex flex-col items-center text-center">
            <div className="w-12 h-12 bg-red-500/20 rounded-full flex items-center justify-center mb-2">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
            <p className="text-red-500 font-medium mb-1">Failed to load TVL data</p>
            <p className="text-[var(--text-secondary)] text-sm">{error}</p>
          </div>
        </div>
      ) : !data ? (
        <div className="h-64 flex items-center justify-center">
          <div className="flex flex-col items-center text-center">
            <div className="w-12 h-12 bg-[var(--hover)] rounded-full flex items-center justify-center mb-2">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-[var(--text-tertiary)]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            </div>
            <p className="text-[var(--text-primary)] font-medium mb-1">No TVL data available</p>
            <p className="text-[var(--text-secondary)] text-sm">
              No liquidity pools found
            </p>
          </div>
        </div>
      ) : (
        <div className="h-64 relative">
          <Doughnut data={chartData!} options={chartOptions} />
          {/* Center text overlay */}
          <div className="absolute inset-0 flex items-center justify-center flex-col pointer-events-none">
            <p className="text-sm text-[var(--text-secondary)]">Total</p>
            <p className="text-xl font-bold text-[var(--text-primary)]">
              {formatDisplayPrice(data.total_tvl)}
            </p>
          </div>
        </div>
      )}

      {data && data.breakdown.length > 0 && (
        <div className="mt-6 pt-4 border-t border-[var(--card-border)]">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {data.breakdown.map((b, idx) => (
              <div key={b.key} className="flex items-center justify-between p-2 rounded-lg bg-[var(--hover)]/50 hover:bg-[var(--hover)] transition-colors">
                <div className="flex items-center">
                  <TokenLogo logoUrl={b.logoUrl} symbol={b.label} size={20} className="mr-2" />
                  <span className="text-sm text-[var(--text-primary)]">{b.label}</span>
                </div>
                <div className="flex flex-col items-end">
                  <span className="text-sm font-medium text-[var(--text-primary)]">{formatDisplayPrice(b.tvl)}</span>
                  <span className="text-xs text-[var(--text-secondary)]">{formatPercentage(b.percentage)}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
} 