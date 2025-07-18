"use client"

"use client"

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useWallet } from '@/context/WalletContext';
import { useDexPairs, DexPair } from '@/hooks/useDexPairs';
import { usePools, Pool } from '@/hooks/usePools';
import { PoolListSkeleton } from '@/components/UI/SkeletonLoader';
import TokenLogo from '../UI/TokenLogo';
import { formatCurrency } from '@/utils/tokenFormatter';

interface PoolListProps {
  onAddLiquidityClick: () => void;
}

const PoolList: React.FC<PoolListProps> = ({ onAddLiquidityClick }) => {
  const [filter, setFilter] = useState('all');
  const { isConnected, connectWallet, isConnecting, walletAddress } = useWallet();
  const { pairs, loading: pairsLoading, error: pairsError } = useDexPairs();
  const { 
    pools: userPools, 
    poolStats, 
    isLoading: userPoolsLoading, 
    error: userPoolsError,
    refreshPools 
  } = usePools();
  

  const adaptUserPoolsToDexPairs = (pools: Pool[]): DexPair[] => {
    return pools.map(pool => ({
      pair_address: pool.pair_address,
      token0_address: pool.token0_address,
      token1_address: pool.token1_address,
      token0_symbol: pool.token0_symbol,
      token1_symbol: pool.token1_symbol,
      pair_symbol: pool.symbol,
      total_liquidity_usd: String(pool.liquidity_usd),
      volume_24h: String(pool.volume_24h_usd),
      apr: String(pool.apr),
      fee_percent: String(pool.fee),
      last_price_native: String(pool.last_price_native),
      last_price_usd: String(pool.last_price_usd),
      last_swap_time: pool.last_swap_time,
      swap_count_24h: pool.swap_count_24h,
      dex_type: pool.dex.type,
      chain_name: pool.chain.name,
      chain_logo_url: pool.chain.logo_url,
      token0_logo_url: pool.token0_logo_url,
      token1_logo_url: pool.token1_logo_url,
    }));
  };
  

  useEffect(() => {
    if (filter === 'my' && isConnected) {
      refreshPools();
    }
  }, [filter, isConnected]);
  
  const router = useRouter();



  const handleAddClick = () => {
    if (!isConnected) {
      connectWallet();
    } else {
      onAddLiquidityClick();
    }
  };

  const getFilteredPools = (): DexPair[] => {

    if (filter === 'my' && !isConnected) {
      return [];
    }
    

    if (filter === 'my' && isConnected) {
      return adaptUserPoolsToDexPairs(userPools);
    }
    

    return pairs;
  };


  const formatFeeTier = (fee: string | number): string => {
    const feeNum = (typeof fee === 'string' ? parseFloat(fee) : fee) * 100;
    if (isNaN(feeNum)) return '0%';
    return `${feeNum.toFixed(2)}%`;
  };

  const isLoading = (filter === 'all' && pairsLoading) || (filter === 'my' && userPoolsLoading);
  const error = filter === 'all' ? pairsError : userPoolsError;

  if (isLoading && ((filter === 'all' && pairs.length === 0) || (filter === 'my' && userPools.length === 0))) {
    return <PoolListSkeleton />;
  }

  if (error) {
    return (
      <div className="card p-6 shadow-md dark:shadow-lg">
        <div className="text-center py-12">
          <div className="text-red-500 mb-4">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h3 className="text-lg font-medium text-[var(--text-primary)] mb-2">Error Loading Pools</h3>
          <p className="text-[var(--text-secondary)] mb-4">{error}</p>
          <button 
            onClick={() => window.location.reload()}
            className="bg-[var(--primary)] text-white py-2 px-4 rounded-lg hover:bg-[var(--primary-dark)] transition"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }
  
  return (
    <div className="card p-6 shadow-md dark:shadow-lg">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
        <div className="flex items-center gap-3">
        <h2 className="text-xl font-bold text-[var(--text-primary)]">
          {filter === 'my' ? 'Your Liquidity Positions' : 'Available Pools'}
        </h2>
          {isLoading && (
            <svg className="animate-spin h-5 w-5 text-[var(--primary)]" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
          )}
        </div>
        
        <div className="flex gap-2">
          <div className="inline-flex rounded-lg bg-[var(--hover)] dark:bg-[var(--bg-primary)] p-1">
            <button 
              className={`px-4 py-2 rounded-md text-sm transition cursor-pointer ${
                filter === 'all' 
                  ? 'bg-[var(--primary)] text-white font-medium' 
                  : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
              }`}
              onClick={() => setFilter('all')}
            >
              All Pools
            </button>
            <button 
              className={`px-4 py-2 rounded-md text-sm transition cursor-pointer ${
                filter === 'my' 
                  ? 'bg-[var(--primary)] text-white font-medium' 
                  : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
              }`}
              onClick={() => setFilter('my')}
            >
              My Pools
              </button>
          </div>
          
          <button 
            onClick={() => filter === 'my' ? refreshPools() : window.location.reload()}
            className="p-2 rounded-lg bg-[var(--hover)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--card-border)] transition cursor-pointer"
            title="Refresh pools"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
          </button>
        </div>
      </div>
      
      <div className="overflow-x-auto rounded-lg min-h-[400px]">
        <table className="min-w-full border-collapse">
          <thead className="bg-[var(--hover)] text-[var(--text-primary)]">
            <tr>
              <th className="py-4 px-5 text-left text-sm font-semibold" style={{width: '25%'}}>Pool</th>
              <th className="py-4 px-5 text-right text-sm font-semibold" style={{width: '15%'}}>TVL</th>
              <th className="py-4 px-5 text-right text-sm font-semibold" style={{width: '10%'}}>APR</th>
              <th className="py-4 px-5 text-center text-sm font-semibold hidden md:table-cell" style={{width: '10%'}}>Type</th>
              <th className="py-4 px-5 text-right text-sm font-semibold hidden md:table-cell" style={{width: '15%'}}>Volume (24h)</th>
              <th className="py-4 px-5 text-right text-sm font-semibold hidden sm:table-cell" style={{width: '10%'}}>Fee Tier</th>
              <th className="py-4 px-5 text-right text-sm font-semibold" style={{width: '15%'}}>Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[var(--card-border)]">
            {isLoading ? (
              <tr>
                <td colSpan={7} className="py-32 text-center">
                  <div className="flex flex-col items-center">
                    <svg className="animate-spin h-8 w-8 text-[var(--primary)] mb-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    <p className="text-[var(--text-secondary)]">Loading pools...</p>
                  </div>
                </td>
              </tr>
            ) : getFilteredPools().length > 0 ? (
              getFilteredPools().map((pool: DexPair, index: number) => (
                <tr 
                  key={pool.pair_address} 

                  className={`${
                    index % 2 === 0 
                      ? 'bg-transparent' 
                      : 'bg-[var(--hover)]/50'
                  } hover:bg-[var(--primary)]/10 transition-colors duration-200 align-middle cursor-pointer`}
                >
                  <td className="py-4 px-5">
                    <div className="flex items-center gap-3">
                      <div className="relative flex items-center w-10 h-10">
                        <TokenLogo 
                            logoUrl={pool.token0_logo_url} 
                            symbol={pool.token0_symbol} 
                            size={28}
                            className="border-2 border-[var(--card-border)] absolute left-0 z-10"
                        />
                        <TokenLogo 
                            logoUrl={pool.token1_logo_url} 
                            symbol={pool.token1_symbol} 
                            size={28}
                            className="border-2 border-[var(--card-border)] absolute left-4"
                        />
                      </div>
                      <div>
                        <div className="font-semibold text-md text-[var(--text-primary)] flex items-center gap-2">
                          {pool.pair_symbol}
                        </div>
                        <div className="text-xs text-[var(--text-secondary)] flex items-center gap-1">
                          {pool.chain_logo_url && pool.chain_name ? (
                            <>
                              <Image src={pool.chain_logo_url} alt={pool.chain_name} width={20} height={20} className="rounded-full" />
                              {pool.chain_name}
                            </>
                          ) : (
                            <span>{pool.token0_symbol}/{pool.token1_symbol}</span>
                          )}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="py-4 px-5 text-right">
                    <span className="font-medium text-[var(--text-primary)]">{formatCurrency(pool.total_liquidity_usd)}</span>
                  </td>
                  <td className="py-4 px-5 text-right">
                    <div className="font-semibold text-green-500">
                      {`${parseFloat(pool.apr).toFixed(2)}%`}
                    </div>
                  </td>
                  <td className="py-4 px-5 text-center hidden md:table-cell">
                    {pool.dex_type ? (
                      <span className="px-2 py-1 text-xs rounded-full bg-cyan-100 dark:bg-cyan-500/20 text-cyan-700 dark:text-cyan-400 font-medium">
                        {pool.dex_type}
                      </span>
                    ) : (
                      <span className="text-[var(--text-secondary)]">-</span>
                    )}
                  </td>
                  <td className="py-4 px-5 text-right hidden md:table-cell">
                    <span className="text-[var(--text-secondary)]">{formatCurrency(pool.volume_24h)}</span>
                  </td>
                  <td className="py-4 px-5 text-right hidden sm:table-cell">
                    <span className="px-2 py-1 text-xs rounded-full bg-[var(--primary)]/10 text-[var(--primary)] font-medium">
                      {formatFeeTier(pool.fee_percent)}
                    </span>
                  </td>
                  <td className="py-4 px-5 text-right">
                    <div className="flex justify-end items-center gap-2">
                      <Link
                        href={`/liquidity/pools/${pool.pair_address}`}
                        className="bg-transparent border border-[var(--card-border)] text-[var(--text-secondary)] py-1.5 px-3 rounded-lg text-sm hover:border-[var(--primary)] hover:text-[var(--primary)] transition cursor-pointer"
                      >
                        Details
                      </Link>
                      <button 
                        onClick={(e) => { e.stopPropagation(); handleAddClick(); }}
                        className="bg-[var(--primary)] text-white py-1.5 px-3 rounded-lg text-sm hover:bg-[var(--primary-dark)] transition shadow-sm cursor-pointer"
                      >
                        + Add
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr className="bg-[var(--card-bg)]">
                <td colSpan={7} className="py-32 text-center">
                  {filter === 'my' && !isConnected ? (
                    <div className="text-center">
                      <p className="text-[var(--text-secondary)] mb-4">Connect your wallet to view your pools</p>
                      <button 
                        onClick={() => connectWallet()}
                        disabled={isConnecting}
                        className="bg-blue-500 hover:bg-blue-600 text-white py-2 px-6 rounded-md font-medium transition shadow-sm cursor-pointer"
                      >
                        {isConnecting ? 'Connecting...' : 'Connect Wallet'}
                      </button>
                    </div>
                  ) : (
                    <div className="text-center">
                      <p className="text-[var(--text-secondary)]">
                        {filter === 'my' ? 'You have no active liquidity positions' : 'No pools found'}
                      </p>
                      {filter === 'my' && (
                        <button 
                          onClick={() => setFilter('all')}
                          className="mt-4 bg-blue-500 hover:bg-blue-600 text-white py-2 px-6 rounded-md font-medium transition shadow-sm cursor-pointer"
                        >
                          Browse All Pools
                        </button>
                      )}
                    </div>
                  )}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
      
      {filter === 'my' && isConnected && poolStats.userPoolCount > 0 && (
        <div className="mt-6 p-6 bg-[var(--card-bg)] border border-[var(--card-border)] rounded-xl shadow-sm">
          <h3 className="font-semibold text-[var(--text-primary)] mb-3 text-lg">Your Liquidity Summary</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="p-4 bg-[var(--hover)] border border-[var(--card-border)] rounded-lg">
              <p className="text-[var(--text-tertiary)] text-sm mb-1">Total Value:</p>
              <p className="font-semibold text-xl text-[var(--text-primary)]">
                {formatCurrency(poolStats.userTotalLiquidity)}
              </p>
            </div>
            <div className="p-4 bg-[var(--hover)] border border-[var(--card-border)] rounded-lg">
              <p className="text-[var(--text-tertiary)] text-sm mb-1">Number of Pools:</p>
              <p className="font-semibold text-xl text-[var(--text-primary)]">{poolStats.userPoolCount}</p>
            </div>
            <div className="p-4 bg-[var(--hover)] border border-[var(--card-border)] rounded-lg">
              <p className="text-[var(--text-tertiary)] text-sm mb-1">Volume (24h):</p>
              <p className="font-semibold text-xl text-[var(--text-primary)]">{formatCurrency(poolStats.totalVolume24h)}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PoolList; 