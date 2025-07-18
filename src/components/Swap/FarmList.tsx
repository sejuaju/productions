"use client"

import React, { useState } from 'react';
import { useWallet } from '@/context/WalletContext';

const farms = [
  { 
    id: 'eth-usdc-farm', 
    pair: 'ETH/USDC', 
    apr: '--', 
    liquidity: '--', 
    reward: 'EXT',
    userStaked: '0',
    earned: '0',
    token0: { id: 'eth', name: 'Ethereum', symbol: 'ETH', color: 'bg-blue-500' },
    token1: { id: 'usdc', name: 'USD Coin', symbol: 'USDC', color: 'bg-blue-400' }
  },
  { 
    id: 'wbtc-eth-farm', 
    pair: 'WBTC/ETH', 
    apr: '--', 
    liquidity: '--', 
    reward: 'EXT',
    userStaked: '0',
    earned: '0',
    token0: { id: 'wbtc', name: 'Wrapped Bitcoin', symbol: 'WBTC', color: 'bg-orange-500' },
    token1: { id: 'eth', name: 'Ethereum', symbol: 'ETH', color: 'bg-blue-500' }
  },
  { 
    id: 'ext-eth-farm', 
    pair: 'EXT/ETH', 
    apr: '--', 
    liquidity: '--', 
    reward: 'EXT',
    userStaked: '0',
    earned: '0',
    token0: { id: 'ext', name: 'ExtSwap', symbol: 'EXT', color: 'bg-indigo-500' },
    token1: { id: 'eth', name: 'Ethereum', symbol: 'ETH', color: 'bg-blue-500' }
  },
];

const FarmList: React.FC = () => {
  const [filter, setFilter] = useState('all');
  const { isConnected, connectWallet, isConnecting } = useWallet();

  const handleStakeClick = () => {

  };

  const handleHarvestClick = () => {

  };
  
  return (
    <div className="card p-6 shadow-md dark:shadow-lg">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
        <h2 className="text-xl font-bold text-[var(--text-primary)]">Available Farms</h2>
        
        <div className="inline-flex rounded-lg bg-[var(--hover)] dark:bg-[var(--bg-primary)] p-1">
          <button 
            className={`px-4 py-2 rounded-md text-sm transition ${
              filter === 'all' 
                ? 'bg-[var(--primary)] text-white font-medium' 
                : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
            }`}
            onClick={() => setFilter('all')}
          >
            All Farms
          </button>
          <button 
            className={`px-4 py-2 rounded-md text-sm transition ${
              filter === 'staked' 
                ? 'bg-[var(--primary)] text-white font-medium' 
                : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
            }`}
            onClick={() => setFilter('staked')}
          >
            Staked Only
          </button>
        </div>
      </div>
      
      <div className="overflow-x-auto rounded-lg">
        <table className="min-w-full">
          <thead className="bg-[var(--hover)] dark:bg-[var(--bg-primary)]">
            <tr>
              <th className="py-3 px-4 text-left text-sm font-medium text-[var(--text-secondary)]">Farm</th>
              <th className="py-3 px-4 text-right text-sm font-medium text-[var(--text-secondary)]">APR</th>
              <th className="py-3 px-4 text-right text-sm font-medium text-[var(--text-secondary)]">Liquidity</th>
              <th className="py-3 px-4 text-right text-sm font-medium text-[var(--text-secondary)]">Staked</th>
              <th className="py-3 px-4 text-right text-sm font-medium text-[var(--text-secondary)]">Earned</th>
              <th className="py-3 px-4 text-right text-sm font-medium text-[var(--text-secondary)]">Actions</th>
            </tr>
          </thead>
          <tbody>
            {farms.map((farm) => (
              <tr key={farm.id} className="border-b border-[var(--card-border)] hover:bg-[var(--hover)] dark:hover:bg-[var(--bg-primary)] transition">
                <td className="py-4 px-4">
                  <div className="flex items-center">
                    <div className="relative w-10 h-10 flex items-center justify-center">
                      <div className={`w-6 h-6 ${farm.token0.color} rounded-full absolute left-0 shadow-sm`}></div>
                      <div className={`w-6 h-6 ${farm.token1.color} rounded-full absolute right-0 shadow-sm`}></div>
                    </div>
                    <div className="ml-2">
                      <div className="font-medium text-[var(--text-primary)]">{farm.pair}</div>
                      <div className="text-xs text-[var(--text-tertiary)]">
                        Earn {farm.reward}
                      </div>
                    </div>
                    <span className="ml-4 px-2 py-1 text-xs font-semibold text-yellow-800 bg-yellow-200 rounded-full">
                      Coming Soon
                    </span>
                  </div>
                </td>
                <td className="py-4 px-4 text-right font-medium text-[var(--text-secondary)]">{farm.apr}</td>
                <td className="py-4 px-4 text-right text-[var(--text-secondary)]">{farm.liquidity}</td>
                <td className="py-4 px-4 text-right">
                  <div>
                    <div className="font-medium text-[var(--text-primary)]">--</div>
                    <div className="text-xs text-[var(--text-tertiary)]">LP Tokens</div>
                  </div>
                </td>
                <td className="py-4 px-4 text-right">
                  <div>
                    <div className="font-medium text-[var(--text-primary)]">--</div>
                    <div className="text-xs text-[var(--text-tertiary)]">{farm.reward}</div>
                  </div>
                </td>
                <td className="py-4 px-4 text-right">
                  <div className="flex justify-end gap-2">
                    <button 
                      onClick={handleStakeClick}
                      disabled={true}
                      className="bg-[var(--primary)] text-white py-1.5 px-3 rounded-lg text-sm hover:bg-[var(--primary-dark)] transition shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Stake
                    </button>
                    <button 
                      onClick={handleHarvestClick}
                      disabled={true}
                      className="bg-[var(--hover)] dark:bg-[var(--bg-primary)] text-[var(--text-primary)] py-1.5 px-3 rounded-lg text-sm hover:bg-[var(--card-border)] transition border border-[var(--card-border)] disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Harvest
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      
      {!isConnected && (
        <div className="mt-6 bg-[var(--hover)] dark:bg-[var(--bg-primary)] rounded-lg p-4 text-center">
          <p className="text-[var(--text-secondary)] text-sm mb-3">
            Connect your wallet to start farming and earn rewards
          </p>
          <button 
            onClick={() => connectWallet()}
            disabled={isConnecting}
            className="bg-[var(--primary)] text-white py-2 px-4 rounded-lg hover:bg-[var(--primary-dark)] transition shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isConnecting ? (
              <div className="flex items-center justify-center">
                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Connecting...
              </div>
            ) : (
              'Connect Wallet'
            )}
          </button>
        </div>
      )}
    </div>
  );
};

export default FarmList; 