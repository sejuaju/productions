"use client"

import React from 'react';
import { useDexStats } from '@/hooks/useDexStats';
import { formatDisplayPrice } from '@/utils/tokenFormatter';
import { StatCardSkeleton } from './SkeletonLoader';

const Stats: React.FC = () => {
  const { tvl, volume24h, volume7d, activePools, fees24h, fees7d, loading } = useDexStats();

  const statCards = [
    {
      title: "Total Value Locked",
      value: tvl,
      description: "Real-time data from liquidity pools",
      gradient: "from-blue-500/10 to-indigo-500/10 dark:from-blue-500/5 dark:to-indigo-500/10",
      textColor: "text-[var(--primary)]",
      isCurrency: true
    },
    {
      title: "24h Trading Volume",
      value: volume24h,
      description: "Based on actual swaps",
      gradient: "from-purple-500/10 to-violet-500/10 dark:from-purple-500/5 dark:to-violet-500/10",
      textColor: "text-[var(--accent)]",
      isCurrency: true
    },
    {
      title: "Active Pools",
      value: activePools,
      description: "Pools with liquidity",
      gradient: "from-emerald-500/10 to-green-500/10 dark:from-emerald-500/5 dark:to-green-500/10",
      textColor: "text-[var(--success)]",
      isCurrency: false
    },
    {
      title: "7d Trading Volume",
      value: volume7d,
      description: "Last 7 days of trading activity",
      gradient: "from-amber-500/10 to-orange-500/10 dark:from-amber-500/5 dark:to-orange-500/10",
      textColor: "text-amber-500 dark:text-amber-400",
      isCurrency: true
    },
    {
      title: "24h Fees Generated",
      value: fees24h,
      description: "Fees earned by liquidity providers",
      gradient: "from-pink-500/10 to-red-500/10 dark:from-pink-500/5 dark:to-red-500/10",
      textColor: "text-pink-500 dark:text-pink-400",
      isCurrency: true
    },
    {
      title: "7d Fees Generated",
      value: fees7d,
      description: "Last 7 days of fee generation",
      gradient: "from-teal-500/10 to-cyan-500/10 dark:from-teal-500/5 dark:to-cyan-500/10",
      textColor: "text-teal-500 dark:text-teal-400",
      isCurrency: true
    }
  ];

  return (
    <div className="card p-6 my-6 shadow-lg dark:shadow-md dark:bg-[var(--bg-card)]">
      <h3 className="text-xl font-bold mb-6 text-[var(--text-primary)]">Platform Stats</h3>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {loading ? (
          Array.from({ length: 6 }).map((_, index) => <StatCardSkeleton key={index} />)
        ) : (
          statCards.map((card, index) => (
            <div key={index} className={`bg-gradient-to-br ${card.gradient} rounded-lg p-5 shadow-sm dark:bg-[var(--bg-primary)]`}>
              <div className={`${card.textColor} text-sm font-medium mb-2`}>{card.title}</div>
              <div className="text-2xl font-bold text-[var(--text-primary)]">
                {card.isCurrency ? formatDisplayPrice(card.value) : card.value}
              </div>
              <div className="text-[var(--text-secondary)] text-sm mt-2">
                {card.description}
              </div>
            </div>
          ))
        )}
      </div>
      
      <div className="mt-8 pt-6 border-t border-[var(--card-border)]">
        <h4 className="font-medium mb-4 text-[var(--text-primary)]">Trading Status</h4>
        <div className="flex items-start text-sm text-[var(--text-secondary)]">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-3 text-[var(--primary)] flex-shrink-0 mt-0.5" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-11a1 1 0 10-2 0v4a1 1 0 102 0V7z" clipRule="evenodd" />
          </svg>
          <p>
            {loading 
              ? "Loading status..."
              : activePools > 0 
                ? (parseFloat(volume24h) > 0 
                  ? `Trading is active across ${activePools} pools with ${formatDisplayPrice(volume24h)} in 24h volume.` 
                  : `${activePools} pools are ready for trading. Be the first to make a swap!`)
                : "Add liquidity to create the first trading pool and start swapping tokens."}
          </p>
        </div>
      </div>
    </div>
  );
};

export default Stats; 