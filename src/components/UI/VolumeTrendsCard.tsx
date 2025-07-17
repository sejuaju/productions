"use client"

import React, { useState, useMemo } from 'react';
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Tooltip,
  Filler,
  TimeScale,
  Legend,
} from 'chart.js';
import 'chartjs-adapter-date-fns';
import { useVolumeTrend } from '@/hooks/useVolumeTrend';
import { useTheme } from '@/context/ThemeContext';

// Register chart components once
ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Tooltip, Filler, TimeScale, Legend);

const ranges = [
  { key: '7d', label: 'Last 7 days' },
  { key: '30d', label: 'Last 30 days' },
  { key: '90d', label: 'Last 90 days' },
  { key: 'all', label: 'All time' },
] as const;

type RangeKey = typeof ranges[number]['key'];

// Helper to read CSS variable values at runtime
const getCssVar = (name: string, fallback: string): string => {
  if (typeof window === 'undefined') return fallback;
  const val = getComputedStyle(document.documentElement).getPropertyValue(name).trim();
  return val || fallback;
};

// Convert HEX color (e.g., #1e40af) into rgba string with the provided alpha
const hexToRGBA = (hex: string, alpha: number): string => {
  let h = hex.replace('#', '');
  if (h.length === 3) {
    h = h.split('').map((c) => c + c).join('');
  }
  const bigint = parseInt(h, 16);
  const r = (bigint >> 16) & 255;
  const g = (bigint >> 8) & 255;
  const b = bigint & 255;
  return `rgba(${r},${g},${b},${alpha})`;
};

// Helper function to format very small values
const formatSmallValue = (value: number): string => {
  if (value >= 1_000_000) return `$${(value / 1_000_000).toFixed(1)}M`;
  if (value >= 1_000) return `$${(value / 1_000).toFixed(1)}K`;
  if (value === 0) return '$0';
  
  // For very small values, show scientific notation
  if (value < 0.00001) {
    return `$${value.toExponential(6)}`;
  }
  
  // For small but not tiny values
  if (value < 0.01) {
    return `$${value.toFixed(8)}`;
  }
  
  return `$${value.toFixed(4)}`;
};

const VolumeTrendsCard: React.FC = () => {
  const { theme } = useTheme();
  const [range, setRange] = useState<RangeKey>('7d');
  
  // Theme dependent colors
  const primaryColor = useMemo(() => getCssVar('--primary', '#4f46e5'), [theme]);
  const textSecondary = useMemo(() => getCssVar('--text-secondary', theme === 'dark' ? '#94a3b8' : '#64748b'), [theme]);
  const gridBase = useMemo(() => getCssVar('--card-border', theme === 'dark' ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)'), [theme]);
  const gridLight = useMemo(() => theme === 'dark' ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)', [theme]);
  const { data, loading, error } = useVolumeTrend(range);

  const chartData = useMemo(() => {
    const labels = data.map((d) => d.date);
    const volumes = data.map((d) => parseFloat(d.volume_usd));

    return {
      labels,
      datasets: [
        {
          label: 'Daily Volume (USD)',
          data: volumes,
          borderColor: primaryColor,
          backgroundColor: hexToRGBA(primaryColor, 0.15),
          borderWidth: 2,
          fill: true,
          tension: 0.4,
          pointRadius: 3,
          pointHoverRadius: 5,
          pointBackgroundColor: primaryColor,
          pointHoverBackgroundColor: primaryColor,
          pointBorderColor: 'white',
          pointHoverBorderColor: 'white',
          pointBorderWidth: 1.5,
          pointHitRadius: 10,
        },
      ],
    };
  }, [data, primaryColor]);

  const options = useMemo(() => ({
    responsive: true,
    maintainAspectRatio: false,
    interaction: {
      mode: 'index' as const,
      intersect: false,
    },
    scales: {
      x: {
        type: 'time' as const,
        time: {
          unit: 'day' as const,
          tooltipFormat: 'PPP', // More readable date format
        },
        grid: {
          color: gridLight,
          display: true,
        },
        ticks: {
          color: textSecondary,
          maxRotation: 0,
        },
        border: {
          color: gridBase,
        },
      },
      y: {
        beginAtZero: true,
        // Use logarithmic scale for very small values
        type: range === '7d' ? 'linear' : 'linear',
        grid: {
          color: gridLight,
          display: true,
        },
        ticks: {
          color: textSecondary,
          // Format y-axis labels for very small values
          callback: (v: number | string) => {
            const n = typeof v === 'string' ? parseFloat(v) : v;
            if (n >= 1_000_000) return `$${(n / 1_000_000).toFixed(1)}M`;
            if (n >= 1_000) return `$${(n / 1_000).toFixed(1)}K`;
            if (n === 0) return '$0';
            
            // For very small values, show scientific notation
            if (n < 0.00001) {
              // Show in scientific notation
              const e = n.toExponential(2);
              return `$${e}`;
            }
            
            // For small but not tiny values
            if (n < 0.01) {
              return `$${n.toFixed(6)}`;
            }
            
            return `$${n.toFixed(4)}`;
          },
          // Ensure we show enough ticks for small values
          count: 5,
        },
        border: {
          color: gridBase,
        },
      },
    },
    plugins: {
      tooltip: {
        backgroundColor: theme === 'dark' ? 'rgba(0,0,0,0.8)' : 'rgba(255,255,255,0.9)',
        padding: 10,
        cornerRadius: 6,
        titleFont: {
          size: 14,
        },
        bodyFont: {
          size: 13,
        },
        titleColor: theme === 'dark' ? '#ffffff' : '#000000',
        bodyColor: theme === 'dark' ? '#ffffff' : '#000000',
        callbacks: {
          label: (ctx: any) => {
            const val = ctx.parsed.y;
            return ` Volume: ${formatSmallValue(val)}`;
          },
        },
      },
      legend: { 
        display: false,
      },
    },
  }), [range, data, theme, textSecondary, gridBase, gridLight]);

  return (
    <div className="card p-6 shadow-md">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-xl font-bold text-[var(--text-primary)]">Volume Trends</h3>
        <div className="flex rounded-lg bg-[var(--hover)] p-1">
          {ranges.map((r) => (
            <button
              key={r.key}
              onClick={() => setRange(r.key)}
              className={`px-3 py-1 text-xs rounded-md transition-colors ${
                range === r.key 
                  ? 'bg-[var(--primary)] text-white font-medium' 
                  : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
              }`}
            >
              {r.label}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="h-64 flex items-center justify-center">
          <div className="flex flex-col items-center">
            <svg className="animate-spin h-8 w-8 text-[var(--primary)] mb-2" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            <span className="text-[var(--text-secondary)]">Loading chart data...</span>
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
            <p className="text-red-500 font-medium mb-1">Failed to load chart data</p>
            <p className="text-[var(--text-secondary)] text-sm">{error}</p>
          </div>
        </div>
      ) : data.length === 0 ? (
        <div className="h-64 flex items-center justify-center">
          <div className="flex flex-col items-center text-center">
            <div className="w-12 h-12 bg-[var(--hover)] rounded-full flex items-center justify-center mb-2">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-[var(--text-tertiary)]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            </div>
            <p className="text-[var(--text-primary)] font-medium mb-1">No volume data available</p>
            <p className="text-[var(--text-secondary)] text-sm">
              No trading activity recorded for this period
            </p>
          </div>
        </div>
      ) : (
        <div className="h-64 relative">
          <Line data={chartData} options={options} />
        </div>
      )}
      
      <div className="mt-4 pt-4 border-t border-[var(--card-border)] text-center">
        <p className="text-xs text-[var(--text-tertiary)]">
          {data.length > 0 && `Showing volume data from ${data[0].date} to ${data[data.length-1].date}`}
        </p>
      </div>
    </div>
  );
};

export default VolumeTrendsCard; 