"use client"

import React from 'react';
import MainLayout from '@/components/Layout/MainLayout';
import FarmList from '@/components/Swap/FarmList';

export default function FarmPage() {
  return (
    <MainLayout>
      <div className="py-6">
        <div className="max-w-4xl mx-auto text-center mb-12">
          <h1 className="text-4xl font-bold mb-4 text-[var(--text-primary)] bg-clip-text text-transparent bg-gradient-to-r from-[var(--primary)] to-[var(--accent)]">
            Yield Farming
          </h1>
          <p className="text-[var(--text-secondary)] max-w-2xl mx-auto">
            Stake your LP tokens to earn EXT rewards. Higher APR pools distribute more rewards but may have higher impermanent loss risk.
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-gradient-to-br from-emerald-500/10 to-green-500/10 dark:from-emerald-500/20 dark:to-green-500/20 rounded-xl p-6 shadow-md card">
            <h3 className="text-lg font-bold text-[var(--text-primary)] mb-2">Total Staked Value</h3>
            <p className="text-3xl font-bold text-[var(--text-primary)]">--</p>
            <p className="text-[var(--text-secondary)] text-sm mt-2">Coming Soon</p>
          </div>
          
          <div className="bg-gradient-to-br from-blue-500/10 to-indigo-500/10 dark:from-blue-500/20 dark:to-indigo-500/20 rounded-xl p-6 shadow-md card">
            <h3 className="text-lg font-bold text-[var(--text-primary)] mb-2">Your Total Staked</h3>
            <p className="text-3xl font-bold text-[var(--text-primary)]">--</p>
            <p className="text-[var(--text-secondary)] text-sm mt-2">Coming Soon</p>
          </div>
          
          <div className="bg-gradient-to-br from-purple-500/10 to-violet-500/10 dark:from-purple-500/20 dark:to-violet-500/20 rounded-xl p-6 shadow-md card">
            <h3 className="text-lg font-bold text-[var(--text-primary)] mb-2">Your Claimable Rewards</h3>
            <p className="text-3xl font-bold text-[var(--text-primary)]">--</p>
            <p className="text-[var(--text-secondary)] text-sm mt-2">Coming Soon</p>
          </div>
        </div>
        
        <FarmList />
        
        <div className="mt-8 bg-gradient-to-br from-blue-500/5 to-indigo-500/5 dark:from-blue-500/10 dark:to-indigo-500/10 rounded-xl p-6 md:p-8 shadow-md card">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6">
            <h3 className="text-xl font-bold text-[var(--text-primary)] flex items-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-[var(--primary)]" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd" />
              </svg>
              Farming Rewards Schedule
            </h3>
            <span className="text-sm font-medium px-3 py-1 bg-[var(--primary)]/10 text-[var(--primary)] rounded-full mt-2 sm:mt-0">
              Active Emission
            </span>
          </div>
          
          <div className="overflow-x-auto rounded-lg border border-[var(--card-border)]">
            <table className="min-w-full">
              <thead className="bg-[var(--hover)] dark:bg-[var(--bg-primary)]">
                <tr>
                  <th className="py-3 px-4 text-left text-sm font-medium text-[var(--text-secondary)]">Period</th>
                  <th className="py-3 px-4 text-left text-sm font-medium text-[var(--text-secondary)]">Daily EXT Emission</th>
                  <th className="py-3 px-4 text-left text-sm font-medium text-[var(--text-secondary)]">Value at Current Prices</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-b border-[var(--card-border)]/50 bg-[var(--primary)]/5">
                  <td className="py-4 px-4 font-medium text-[var(--text-primary)] flex items-center">
                    <span className="h-2 w-2 rounded-full bg-yellow-400 mr-2"></span>
                    Coming Soon
                  </td>
                  <td className="py-4 px-4 font-medium text-[var(--text-primary)]">--</td>
                  <td className="py-4 px-4 text-[var(--text-primary)]">--</td>
                </tr>
                <tr className="border-b border-[var(--card-border)]/50 hover:bg-[var(--hover)] transition-colors">
                  <td className="py-4 px-4 font-medium text-[var(--text-primary)]">--</td>
                  <td className="py-4 px-4 text-[var(--text-secondary)]">--</td>
                  <td className="py-4 px-4 text-[var(--text-secondary)]">--</td>
                </tr>
                <tr className="border-b border-[var(--card-border)]/50 hover:bg-[var(--hover)] transition-colors">
                  <td className="py-4 px-4 font-medium text-[var(--text-primary)]">--</td>
                  <td className="py-4 px-4 text-[var(--text-secondary)]">--</td>
                  <td className="py-4 px-4 text-[var(--text-secondary)]">--</td>
                </tr>
                <tr className="hover:bg-[var(--hover)] transition-colors">
                  <td className="py-4 px-4 font-medium text-[var(--text-primary)]">--</td>
                  <td className="py-4 px-4 text-[var(--text-secondary)]">--</td>
                  <td className="py-4 px-4 text-[var(--text-secondary)]">--</td>
                </tr>
              </tbody>
            </table>
          </div>
          
          <div className="mt-4 text-sm text-[var(--text-secondary)] flex items-start">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-[var(--text-tertiary)] flex-shrink-0 mt-0.5" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
            </svg>
            <span>
              Reward schedule is subject to governance votes and may change. EXT value is calculated based on current market price.
            </span>
          </div>
        </div>
      </div>
    </MainLayout>
  );
}