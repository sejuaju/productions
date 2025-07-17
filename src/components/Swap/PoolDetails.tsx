"use client"

import React from 'react';
import Image from 'next/image';
import { usePoolDetail } from '@/hooks/usePoolDetail';
import { formatDistanceToNow } from 'date-fns';
import { getExplorerTxUrl, getExplorerTokenUrl } from '../../utils/config';
import TokenLogo from '../UI/TokenLogo';
import { formatCurrency } from '@/utils/tokenFormatter';

interface PoolDetailsProps {
  poolId: string;
  onClose: () => void;
}

const formatNumber = (value: number | string | undefined): string => {
    const num = Number(value);
    if (isNaN(num)) return '0';
    if (num >= 1_000_000_000) return `${(num / 1_000_000_000).toFixed(2)}B`;
    if (num >= 1_000_000) return `${(num / 1_000_000).toFixed(2)}M`;
    if (num >= 1_000) return `${(num / 1_000).toFixed(2)}K`;
    if (num < 0.001 && num > 0) return num.toExponential(2);
    return num.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 4 });
};

const PoolDetails: React.FC<PoolDetailsProps> = ({ poolId, onClose }) => {
  const { poolDetail: pool, loading, error } = usePoolDetail(poolId);

  if (loading) {
    return (
      <div className="card p-6 max-w-4xl mx-auto shadow-lg dark:shadow-md dark:bg-[var(--bg-card)]">
        <div className="text-center py-20">
          <svg className="animate-spin h-10 w-10 text-[var(--primary)] mx-auto mb-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          <p className="text-[var(--text-secondary)] text-lg">Loading Pool Details...</p>
        </div>
      </div>
    );
  }

  if (error || !pool) {
    return (
      <div className="card p-8 max-w-4xl mx-auto shadow-lg dark:shadow-md dark:bg-[var(--bg-card)]">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-[var(--text-primary)]">Pool Not Found</h2>
          <button onClick={onClose} className="p-2 rounded-lg hover:bg-[var(--hover)] transition">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-[var(--text-secondary)]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        <div className="text-center py-10">
          <p className="text-[var(--text-secondary)] mb-5">
            {error ? `An error occurred: ${error}` : 'The requested pool could not be found.'}
          </p>
          <button onClick={onClose} className="bg-[var(--primary)] text-white py-2 px-5 rounded-lg hover:bg-[var(--primary-dark)] transition font-semibold">
            Back to Pools
          </button>
        </div>
      </div>
    );
  }

  const { token0, token1, stats } = pool;

  return (
    <div className="card p-4 sm:p-6 max-w-5xl mx-auto shadow-lg dark:shadow-2xl dark:bg-[var(--bg-card)] border border-[var(--card-border)] rounded-2xl">
      {/* Header */}
      <div className="flex justify-between items-center mb-6 px-2">
        <div className="flex items-center gap-3">
            <div className="relative flex items-center">
                <TokenLogo logoUrl={token0.logo_url} symbol={token0.symbol} size={40} className="border-2 border-[var(--card-border)] z-10" />
                <TokenLogo logoUrl={token1.logo_url} symbol={token1.symbol} size={40} className="border-2 border-[var(--card-border)] -ml-4" />
            </div>
          <div>
            <h2 className="text-xl font-bold text-[var(--text-primary)] mb-1">{pool.symbol} Pool</h2>
            <div className="flex items-center gap-2 text-sm text-[var(--text-secondary)]">
                <Image src={pool.chain.logo_url} alt={pool.chain.name} width={16} height={16} className="rounded-full"/>
                <span>{pool.chain.name}</span>
                <span className="px-2 py-0.5 text-xs rounded-full bg-cyan-100 dark:bg-cyan-500/20 text-cyan-700 dark:text-cyan-400 font-medium">{pool.dex.type}</span>
            </div>
          </div>
        </div>
        <button onClick={onClose} className="p-2 rounded-full hover:bg-[var(--hover)] transition">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-[var(--text-secondary)]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>
      
      {/* Main Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <StatCard title="Total Value Locked" value={formatCurrency(pool.total_value_locked_usd)} />
        <StatCard title="Volume (24h)" value={formatCurrency(stats.volume_24h)} />
        <StatCard title="Fees (24h)" value={formatCurrency(stats.volume_24h * pool.fee)} />
        <StatCard title="APR (annualized)" value={`${pool.apr.toFixed(2)}%`} isPositive={true} />
      </div>

      {/* Token Info */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        <TokenCard token={token0} />
        <TokenCard token={token1} />
      </div>

      {/* Pool Analytics */}
      <div className="mb-6">
        <AnalyticsCard stats={stats} />
      </div>

      {/* Transactions */}
      <div>
        <h3 className="text-xl font-bold text-[var(--text-primary)] mb-4">Recent Transactions</h3>
        <div className="overflow-x-auto rounded-lg border border-[var(--card-border)] bg-[var(--hover)]/30">
          <table className="min-w-full">
            <thead className="bg-[var(--hover)]">
              <tr>
                <th className="py-3 px-4 text-left text-xs font-semibold text-[var(--text-secondary)] uppercase tracking-wider">Action</th>
                <th className="py-3 px-4 text-left text-xs font-semibold text-[var(--text-secondary)] uppercase tracking-wider">Total Value</th>
                <th className="py-3 px-4 text-left text-xs font-semibold text-[var(--text-secondary)] uppercase tracking-wider hidden sm:table-cell">{token0.symbol} Amount</th>
                <th className="py-3 px-4 text-left text-xs font-semibold text-[var(--text-secondary)] uppercase tracking-wider hidden sm:table-cell">{token1.symbol} Amount</th>
                <th className="py-3 px-4 text-right text-xs font-semibold text-[var(--text-secondary)] uppercase tracking-wider">Time</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--card-border)]">
              {pool.liquidity_events.slice(0, 10).map((tx, idx) => (
                <tr key={tx.tx_hash + idx} className="hover:bg-[var(--primary)]/10">
                  <td className="py-3 px-4">
                    <a href={getExplorerTxUrl(tx.tx_hash, 'exatech')} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2">
                      <span className={`capitalize px-2 py-1 text-xs rounded-full font-medium ${tx.action === 'add' ? 'bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-300' : 'bg-red-100 text-red-800 dark:bg-red-900/50 dark:text-red-300'}`}>
                        {tx.action}
                      </span>
                    </a>
                  </td>
                  <td className="py-3 px-4 font-medium text-[var(--text-primary)]">{formatCurrency(tx.liquidity_usd)}</td>
                  <td className="py-3 px-4 text-[var(--text-secondary)] hidden sm:table-cell">{formatNumber(tx.amount0)}</td>
                  <td className="py-3 px-4 text-[var(--text-secondary)] hidden sm:table-cell">{formatNumber(tx.amount1)}</td>
                  <td className="py-3 px-4 text-right text-xs text-[var(--text-tertiary)]">{formatDistanceToNow(new Date(tx.timestamp), { addSuffix: true })}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

// Helper components for cards
const StatCard = ({ title, value, isPositive }: { title: string, value: string, isPositive?: boolean }) => (
    <div className="bg-[var(--hover)] dark:bg-[var(--bg-primary)] rounded-xl p-4 shadow-sm border border-[var(--card-border)]">
        <h4 className="text-sm font-medium text-[var(--text-secondary)] mb-1">{title}</h4>
        <p className={`text-xl sm:text-2xl font-bold ${isPositive ? 'text-green-500' : 'text-[var(--text-primary)]'}`}>{value}</p>
    </div>
);

const TokenCard = ({ token }: { token: any }) => {
    
    return (
        <div className="bg-[var(--hover)] dark:bg-[var(--bg-primary)] rounded-xl p-5 shadow-sm border border-[var(--card-border)]">
            <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                    <TokenLogo logoUrl={token.logo_url} symbol={token.symbol} size={32} />
                    <div>
                        <h4 className="text-lg font-bold text-[var(--text-primary)]">{token.name}</h4>
                        <p className="text-sm text-[var(--text-secondary)]">{token.symbol}</p>
                    </div>
                </div>
                <a href={getExplorerTokenUrl(token.token_address, 'exatech')} target="_blank" rel="noopener noreferrer" className="text-xs text-blue-500 hover:underline">
                    View on Explorer
                </a>
            </div>
            <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                    <span className="text-[var(--text-secondary)]">Price</span>
                    <span className="font-medium text-[var(--text-primary)]">{formatCurrency(token.price_usd, 6)}</span>
                </div>
                 <div className="flex justify-between">
                    <span className="text-[var(--text-secondary)]">Volume (24h)</span>
                    <span className="font-medium text-[var(--text-primary)]">{formatCurrency(token.volume_24h)}</span>
                </div>
                <div className="flex justify-between">
                    <span className="text-[var(--text-secondary)]">Total Supply</span>
                    <span className="font-medium text-[var(--text-primary)]">{formatNumber(token.total_supply)}</span>
                </div>
            </div>
        </div>
    );
};

const AnalyticsCard = ({ stats }: { stats: any }) => (
    <div className="bg-[var(--hover)] dark:bg-[var(--bg-primary)] rounded-xl p-5 shadow-sm border border-[var(--card-border)]">
        <h4 className="text-lg font-bold text-[var(--text-primary)] mb-4">Pool Analytics</h4>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-x-4 gap-y-4 text-sm">
            <AnalyticsItem label="Current Price" value={formatCurrency(stats.current_price, 6)} />
            <AnalyticsItem 
                label="24h Price Change" 
                value={`${stats.price_change_percent_24h.toFixed(2)}%`} 
                valueClassName={stats.price_change_percent_24h >= 0 ? 'text-green-500' : 'text-red-500'} 
            />
            <AnalyticsItem label="24h High" value={formatCurrency(stats.high_24h, 6)} />
            <AnalyticsItem label="24h Low" value={formatCurrency(stats.low_24h, 6)} />
            <AnalyticsItem label="24h Trades" value={formatNumber(stats.trades_24h)} />
            <AnalyticsItem label="Total Trades" value={formatNumber(stats.total_trades)} />
            <AnalyticsItem label="Total Volume" value={formatCurrency(stats.total_volume_usd)} />
            <AnalyticsItem label="Last Trade" value={formatDistanceToNow(new Date(stats.last_trade_time), { addSuffix: true })} />
        </div>
    </div>
);

const AnalyticsItem = ({ label, value, valueClassName = 'text-[var(--text-primary)]' }: { label: string, value: string, valueClassName?: string }) => (
    <div>
        <div className="text-[var(--text-secondary)]">{label}</div>
        <div className={`font-medium ${valueClassName}`}>{value}</div>
    </div>
);


export default PoolDetails; 