"use client"

import React, { useState, useRef } from 'react';
import MainLayout from '@/components/Layout/MainLayout';
import PoolList from '@/components/Swap/PoolList';
import AddLiquidityForm from '@/components/Swap/AddLiquidityForm';

import LiquidityPositions, { LiquidityPositionsRef } from '@/components/Swap/LiquidityPositions';

import { useDexStats } from '@/hooks/useDexStats';
import { usePools } from '@/hooks/usePools';
import { useWallet } from '@/context/WalletContext';

import { formatCurrency } from '@/utils/tokenFormatter';



export default function PoolPage() {
  const [activeTab, setActiveTab] = useState('pools');

  const [selectedTokenAddress, setSelectedTokenAddress] = useState<string>('');
  const liquidityPositionsRef = useRef<LiquidityPositionsRef>(null);
  const { tvl, volume24h, loading: statsLoading } = useDexStats();
  const { isConnected } = useWallet();
  const { poolStats, isLoading: poolsLoading } = usePools();

  const handleLiquidityAdded = () => {
    if (liquidityPositionsRef.current) {
      liquidityPositionsRef.current.refreshPositions();
    }
  };

  const handleTokenSelectionChange = (tokenAddress: string) => {
    setSelectedTokenAddress(tokenAddress);
  };

  return (
    <MainLayout fullWidth>
      <div className="py-6">
        <div className="max-w-4xl mx-auto text-center mb-8">
          <h1 className="text-4xl font-bold mb-4 text-[var(--text-primary)] bg-clip-text text-transparent bg-gradient-to-r from-[var(--primary)] to-[var(--accent)]">
            Liquidity Pools
          </h1>
          <p className="text-[var(--text-secondary)] max-w-2xl mx-auto">
            Provide liquidity to earn trading fees and participate in yield farming to earn EXT tokens.
          </p>
        </div>
        
        {
          <>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <div className="bg-gradient-to-br from-blue-500/10 to-indigo-500/10 dark:from-blue-500/20 dark:to-indigo-500/20 rounded-xl p-6 shadow-md hover:shadow-lg transition-shadow">
                <h3 className="text-sm font-semibold text-[var(--text-secondary)] uppercase tracking-wider mb-2">Total Value Locked</h3>
                <div className="flex items-baseline">
                  {statsLoading ? (
                    <div className="flex items-center">
                      <svg className="animate-spin h-6 w-6 text-[var(--primary)] mr-2" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      <span className="text-lg">Loading...</span>
                    </div>
                  ) : (
                    <p className="text-3xl font-bold text-[var(--text-primary)]">
                      {formatCurrency(tvl)}
                    </p>
                  )}
                </div>
                <p className="text-[var(--success)] text-sm font-medium flex items-center mt-2">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M12 7a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0V8.414l-4.293 4.293a1 1 0 01-1.414 0L8 10.414l-4.293 4.293a1 1 0 01-1.414-1.414l5-5a1 1 0 011.414 0L11 10.586 14.586 7H12z" clipRule="evenodd" />
                  </svg>
                  Real-time data
                </p>
              </div>
              
              <div className="bg-gradient-to-br from-purple-500/10 to-violet-500/10 dark:from-purple-500/20 dark:to-violet-500/20 rounded-xl p-6 shadow-md hover:shadow-lg transition-shadow">
                <h3 className="text-sm font-semibold text-[var(--text-secondary)] uppercase tracking-wider mb-2">Your Total Liquidity</h3>
                <div className="flex items-baseline">
                  {!isConnected ? (
                    <p className="text-3xl font-bold text-[var(--text-primary)]">-</p>
                  ) : poolsLoading ? (
                    <div className="flex items-center">
                      <svg className="animate-spin h-6 w-6 text-[var(--primary)] mr-2" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      <span className="text-lg">Loading...</span>
                    </div>
                  ) : (
                    <p className="text-3xl font-bold text-[var(--text-primary)]">
                      {formatCurrency(poolStats.userTotalLiquidity)}
                    </p>
                  )}
                </div>
                <p className="text-[var(--text-secondary)] text-sm font-medium mt-2">
                  {!isConnected ? (
                    "Connect wallet to view"
                  ) : (
                    `Across ${poolStats.userPoolCount} pools`
                  )}
                </p>
              </div>
              
              <div className="bg-gradient-to-br from-emerald-500/10 to-green-500/10 dark:from-emerald-500/20 dark:to-green-500/20 rounded-xl p-6 shadow-md hover:shadow-lg transition-shadow">
                <h3 className="text-sm font-semibold text-[var(--text-secondary)] uppercase tracking-wider mb-2">24h Volume</h3>
                <div className="flex items-baseline">
                  {statsLoading ? (
                    <div className="flex items-center">
                      <svg className="animate-spin h-6 w-6 text-[var(--primary)] mr-2" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      <span className="text-lg">Loading...</span>
                    </div>
                  ) : (
                    <p className="text-3xl font-bold text-[var(--text-primary)]">
                      {formatCurrency(volume24h)}
                    </p>
                  )}
                </div>
                <p className="text-[var(--text-secondary)] text-sm font-medium mt-2">
                  Trading volume across all pools
                </p>
              </div>
            </div>
            
            <div className="flex justify-center mb-6">
              <div className="inline-flex rounded-lg p-1 bg-[var(--hover)] dark:bg-[var(--bg-secondary)]">
                <button
                  className={`px-6 py-2 rounded-md transition cursor-pointer ${
                    activeTab === 'pools'
                      ? 'bg-[var(--primary-dark)] dark:bg-[var(--primary)] text-white font-medium shadow-sm' 
                      : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
                  }`}
                  onClick={() => setActiveTab('pools')}
                >
                  Browse Pools
                </button>
                <button
                  className={`px-6 py-2 rounded-md transition cursor-pointer ${
                    activeTab === 'add'
                      ? 'bg-[var(--primary-dark)] dark:bg-[var(--primary)] text-white font-medium shadow-sm'
                      : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
                  }`}
                  onClick={() => setActiveTab('add')}
                >
                  Add Liquidity
                </button>
              </div>
            </div>
            
            {activeTab === 'pools' ? (
              <div>
                <PoolList onAddLiquidityClick={() => setActiveTab('add')} />
              </div>
            ) : (
              <div className="grid grid-cols-1 xl:grid-cols-2 gap-8 max-w-7xl mx-auto">
                <div className="flex justify-center">
                  <AddLiquidityForm 
                    onLiquidityAdded={handleLiquidityAdded}  
                    liquidityPositionsRef={liquidityPositionsRef}
                    onTokenSelectionChange={handleTokenSelectionChange}
                  />
                </div>

                <div className="flex justify-center">
                  <div className="w-full max-w-lg">
                    <LiquidityPositions 
                      ref={liquidityPositionsRef} 
                      selectedTokenAddress={selectedTokenAddress}
                    />
                  </div>
                </div>
              </div>
            )}
            
            <div className="mt-8 bg-[var(--background)] border border-[var(--card-border)] rounded-xl p-8 shadow-md">
              <h3 className="text-xl font-bold mb-6 text-[var(--text-primary)]">How Liquidity Provision Works</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="p-5 rounded-lg bg-[var(--card-bg)] border border-[var(--card-border)]">
                  <div className="h-8 w-8 rounded-full bg-[var(--primary)] flex items-center justify-center text-white font-bold mb-4 shadow-sm">1</div>
                  <h4 className="font-bold mb-2 text-[var(--text-primary)]">Deposit Tokens</h4>
                  <p className="text-[var(--text-secondary)]">
                    Select a pool and deposit an equal value of both tokens to provide liquidity.
                  </p>
                </div>
                
                <div className="p-5 rounded-lg bg-[var(--card-bg)] border border-[var(--card-border)]">
                  <div className="h-8 w-8 rounded-full bg-[var(--primary)] flex items-center justify-center text-white font-bold mb-4 shadow-sm">2</div>
                  <h4 className="font-bold mb-2 text-[var(--text-primary)]">Earn Trading Fees</h4>
                  <p className="text-[var(--text-secondary)]">
                    Earn a share of the 0.3% trading fees proportional to your pool share.
                  </p>
                </div>
                
                <div className="p-5 rounded-lg bg-[var(--card-bg)] border border-[var(--card-border)]">
                  <div className="h-8 w-8 rounded-full bg-[var(--primary)] flex items-center justify-center text-white font-bold mb-4 shadow-sm">3</div>
                  <h4 className="font-bold mb-2 text-[var(--text-primary)]">Farm EXT Rewards</h4>
                  <p className="text-[var(--text-secondary)]">
                    Stake your LP tokens in farms to earn additional EXT token rewards.
                  </p>
                </div>
              </div>
            </div>
          </>
        }
      </div>
    </MainLayout>
  );
}
