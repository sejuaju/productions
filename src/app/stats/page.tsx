"use client"

import React from 'react';
import MainLayout from '@/components/Layout/MainLayout';
import Stats from '@/components/UI/Stats';
import VolumeTrendsCard from '@/components/UI/VolumeTrendsCard';
import TVLBreakdownCard from '@/components/UI/TVLBreakdownCard';

export default function StatsPage() {
  return (
    <MainLayout>
      <div className="py-6">
        <div className="max-w-4xl mx-auto text-center mb-12">
          <h1 className="text-4xl font-bold mb-4 text-[var(--text-primary)] bg-clip-text text-transparent bg-gradient-to-r from-[var(--primary)] to-[var(--accent)]">
            Platform Statistics
          </h1>
          <p className="text-[var(--text-secondary)] max-w-2xl mx-auto">
            Track ExtSwap's performance metrics, trading volume, and most active trading pairs.
          </p>
        </div>
        
        <Stats />
        
        <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-6">
          <VolumeTrendsCard />
          <TVLBreakdownCard />
        </div>
        
        <div className="mt-8 card p-6 shadow-md">
          <h3 className="text-xl font-bold mb-4 text-[var(--text-primary)]">Recent Transactions</h3>
          <div className="text-center py-12">
            <div className="max-w-md mx-auto">
              <svg className="w-16 h-16 mx-auto text-[var(--text-tertiary)] mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
              <h4 className="text-lg font-medium text-[var(--text-primary)] mb-2">
                No Transaction History Yet
              </h4>
              <p className="text-[var(--text-secondary)] mb-6">
                Transaction history will appear here after users start trading on ExtSwap.
                Be the first to make a swap and see your transaction listed!
              </p>
              <a href="/swap" className="inline-block px-6 py-3 bg-[var(--primary)] hover:bg-[var(--primary-dark)] text-white rounded-lg transition-colors">
                Go to Swap
              </a>
          </div>
          </div>
        </div>
      </div>
    </MainLayout>
  );
} 