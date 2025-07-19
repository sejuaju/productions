"use client"

import React, { useState, useEffect } from 'react';
import { Trade, useTradeHistory } from '@/hooks/useTradeHistory';
import { getExplorerAddressUrl, getExplorerTxUrl } from '../../utils/config';
import { formatCompactPrice } from '@/utils/tokenFormatter';
import { formatTimeAgo } from '@/utils/timeFormatter';
import TokenLogo from '@/components/UI/TokenLogo';
import { useTokenRegistry } from '@/hooks/useTokenRegistry';

interface TradeHistoryProps {
  className?: string;
  pairAddress: string;
  limit?: number;
  lastTrade: Trade | null;
  isWsConnected: boolean;
}

const TradeHistory: React.FC<TradeHistoryProps> = ({
  className = '',
  pairAddress,
  limit = 20,
  lastTrade,
  isWsConnected
}) => {
  const [activeFilter, setActiveFilter] = useState<'all' | 'buy' | 'sell'>('all');
  const [, setTick] = useState(0);

  const {
    trades,
    isLoading,
    error,
    pagination,
    nextPage,
    prevPage,
    refresh,
    addRealtimeTrade
  } = useTradeHistory({
    pairAddress,
    limit,
  });

  const { getTokenById } = useTokenRegistry();


  useEffect(() => {
    if (lastTrade) {
      addRealtimeTrade(lastTrade as unknown as Trade);
    }
  }, [lastTrade, addRealtimeTrade]);


  useEffect(() => {

    const timer = setInterval(() => {
      setTick(tick => tick + 1);
    }, 30000);

    return () => clearInterval(timer);
  }, []);


  const filteredTrades = trades.filter(trade => {
    if (activeFilter === 'all') return true;
    if (activeFilter === 'buy') return trade.type === 'BUY';
    if (activeFilter === 'sell') return trade.type === 'SELL';

    return trade.type !== 'add' && trade.type !== 'remove';
  });

  const formatWalletAddress = (address: string): string => {
    return `${address.substring(0, 6)}...${address.substring(address.length - 4)}`;
  };

  const getTokenData = (tokenAddress: string, tokenSymbol: string) => {
    const tokenData = getTokenById(tokenAddress) || getTokenById('text');
    return {
      logoUrl: tokenData?.logoUrl || null,
      symbol: tokenSymbol
    };
  };

  const ConnectionIndicator = () => {
    return (
      <div className="flex items-center space-x-2">
        <div className={`w-2 h-2 rounded-full ${isWsConnected ? 'bg-[var(--success)]' : 'bg-[var(--error)]'}`}></div>
        <span className="text-xs text-[var(--text-tertiary)]">
          {isWsConnected ? 'Live' : 'Offline'}
        </span>
      </div>
    );
  };

  return (
    <div className={`w-full bg-[var(--card-bg)] rounded-lg shadow-md ${className}`}>
      {/* Desktop Header */}
      <div className="hidden sm:flex justify-between items-center p-4 border-b border-[var(--card-border)]">
        <div className="flex items-center space-x-3">
          <h3 className="text-lg font-bold text-[var(--text-primary)]">
            Recent Transactions
          </h3>
          <ConnectionIndicator />
        </div>
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1 bg-[var(--hover)] rounded-lg p-1">
            <button
              onClick={() => setActiveFilter('all')}
              className={`px-3 py-1 rounded-md text-xs font-medium transition-colors ${activeFilter === 'all'
                ? 'bg-[var(--primary)] text-white'
                : 'text-[var(--text-secondary)] hover:bg-[var(--card-border)]'
                }`}
            >
              All
            </button>
            <button
              onClick={() => setActiveFilter('buy')}
              className={`px-3 py-1 rounded-md text-xs font-medium transition-colors ${activeFilter === 'buy'
                ? 'bg-[var(--success)] text-white'
                : 'text-[var(--text-secondary)] hover:bg-[var(--card-border)]'
                }`}
            >
              Buys
            </button>
            <button
              onClick={() => setActiveFilter('sell')}
              className={`px-3 py-1 rounded-md text-xs font-medium transition-colors ${activeFilter === 'sell'
                ? 'bg-[var(--error)] text-white'
                : 'text-[var(--text-secondary)] hover:bg-[var(--card-border)]'
                }`}
            >
              Sells
            </button>
          </div>
          <button
            onClick={refresh}
            className="p-2 text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--hover)] rounded-md transition-colors"
            title="Refresh"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
          </button>
        </div>
      </div>

      {/* Mobile Header */}
      <div className="sm:hidden p-4 border-b border-[var(--card-border)]">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-lg font-bold text-[var(--text-primary)]">
            Recent Transactions
          </h3>
          <div className="flex items-center space-x-2">
            <ConnectionIndicator />
            <button
              onClick={refresh}
              className="p-2 text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--hover)] rounded-md transition-colors"
              title="Refresh"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
            </button>
          </div>
        </div>
        <div className="grid grid-cols-4 gap-2 bg-[var(--hover)] rounded-lg p-1">
          <button
            onClick={() => setActiveFilter('all')}
            className={`px-2 py-2 rounded-md text-xs font-medium transition-colors ${activeFilter === 'all'
              ? 'bg-[var(--primary)] text-white'
              : 'text-[var(--text-secondary)] hover:bg-[var(--card-border)]'
              }`}
          >
            All
          </button>
          <button
            onClick={() => setActiveFilter('buy')}
            className={`px-2 py-2 rounded-md text-xs font-medium transition-colors ${activeFilter === 'buy'
              ? 'bg-[var(--success)] text-white'
              : 'text-[var(--text-secondary)] hover:bg-[var(--card-border)]'
              }`}
          >
            Buys
          </button>
          <button
            onClick={() => setActiveFilter('sell')}
            className={`px-2 py-2 rounded-md text-xs font-medium transition-colors ${activeFilter === 'sell'
              ? 'bg-[var(--error)] text-white'
              : 'text-[var(--text-secondary)] hover:bg-[var(--card-border)]'
              }`}
          >
            Sells
          </button>
          <button
            className="px-2 py-2 rounded-md text-xs font-medium text-[var(--text-secondary)] cursor-default"
            disabled
          >
            Live
          </button>
        </div>
      </div>



      {isLoading && trades.length === 0 ? (
        <div className="p-6 flex justify-center">
          <div className="flex flex-col items-center">
            <svg className="animate-spin h-8 w-8 text-[var(--primary)]" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            <span className="mt-3 text-sm text-[var(--text-secondary)]">Loading transactions...</span>
          </div>
        </div>
      ) : error ? (
        <div className="p-6 flex justify-center">
          <div className="flex flex-col items-center">
            <div className="w-12 h-12 bg-[var(--error)]/20 rounded-full flex items-center justify-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-[var(--error)]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
            <h4 className="mt-3 text-[var(--text-primary)] font-medium">Error Loading Transactions</h4>
            <p className="mt-1 text-sm text-[var(--text-secondary)]">{error}</p>
            <button
              onClick={refresh}
              className="mt-4 px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors"
            >
              Try Again
            </button>
          </div>
        </div>
      ) : filteredTrades.length === 0 ? (
        <div className="p-6 flex justify-center">
          <div className="flex flex-col items-center">
            <div className="w-12 h-12 bg-[var(--hover)] rounded-full flex items-center justify-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-[var(--text-tertiary)]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
            </div>
            <h4 className="mt-3 text-[var(--text-primary)] font-medium">No transactions found</h4>
            <p className="mt-1 text-sm text-[var(--text-secondary)]">
              {activeFilter !== 'all'
                ? `No ${activeFilter} transactions available`
                : 'No transactions for this pair'}
            </p>
          </div>
        </div>
      ) : (
        <>
          <div className="overflow-x-auto">
            <table className="w-full min-w-full table-fixed">
              <thead>
                <tr className="bg-[var(--hover)] text-xs text-[var(--text-tertiary)]">
                  <th className="w-24 px-3 py-3 text-left font-medium">Time</th>
                  <th className="w-20 px-3 py-3 text-left font-medium">Type</th>
                  <th className="w-40 px-3 py-3 text-left font-medium">Token</th>
                  <th className="w-28 px-3 py-3 text-left font-medium">Price (USD)</th>
                  <th className="w-32 px-3 py-3 text-left font-medium">Price (Native)</th>
                  <th className="w-40 px-3 py-3 text-center font-medium whitespace-nowrap">
                    {trades.length > 0 ? `${trades[0].token0Symbol} Amount` : 'Token Amount'}
                  </th>
                  <th className="w-40 px-3 py-3 text-center font-medium whitespace-nowrap">
                    {trades.length > 0 ? `${trades[0].token1Symbol} Amount` : 'Token Amount'}
                  </th>
                  <th className="w-32 px-3 py-3 text-left font-medium">Total (USD)</th>
                  <th className="w-36 px-3 py-3 text-left font-medium">Wallet</th>
                  <th className="w-16 px-3 py-3 text-left font-medium">Tx</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--card-border)]">
                {filteredTrades.map((trade) => (
                  <tr key={trade.id} className="hover:bg-[var(--hover)] transition-colors">
                    <td className="px-3 py-3 text-xs text-left text-[var(--text-secondary)]">
                      {formatTimeAgo(trade.timestamp)}
                    </td>
                    <td className="px-3 py-3 text-left">
                      <div className="flex items-center">
                        {trade.type === 'BUY' ? (
                          <div className="flex items-center text-green-400 font-medium text-xs">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 10l7-7m0 0l7 7m-7-7v18" />
                            </svg>
                            Buy
                          </div>
                        ) : trade.type === 'SELL' ? (
                          <div className="flex items-center text-red-400 font-medium text-xs">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
                            </svg>
                            Sell
                          </div>
                        ) : trade.type === 'add' ? (
                          <div className="flex items-center text-blue-400 font-medium text-xs">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" /></svg>
                            Add
                          </div>
                        ) : (
                          <div className="flex items-center text-yellow-500 font-medium text-xs">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M18 12H6" /></svg>
                            Remove
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="px-3 py-3 text-left">
                      <div className="flex items-center">
                        <div className="relative flex-shrink-0 mr-2">
                          <TokenLogo
                            logoUrl={getTokenData(trade.token0Address, trade.token0Symbol).logoUrl}
                            symbol={trade.token0Symbol}
                            size={24}
                          />
                          <div className="absolute -right-1 -bottom-1 border-2 border-[var(--card-bg)] rounded-full">
                            <TokenLogo
                              logoUrl={getTokenData(trade.token1Address, trade.token1Symbol).logoUrl}
                              symbol={trade.token1Symbol}
                              size={16}
                            />
                          </div>
                        </div>
                        <span className="text-xs font-medium text-[var(--text-primary)]">{trade.pair}</span>
                      </div>
                    </td>
                    <td className="px-3 py-3 text-sm text-left text-[var(--text-primary)]">
                      <div
                        dangerouslySetInnerHTML={{ __html: formatCompactPrice(trade.price) }}
                      ></div>
                    </td>
                    <td className="px-3 py-3 text-sm text-left text-[var(--text-primary)]">
                      {parseFloat(trade.priceNative).toLocaleString('en-US', { maximumFractionDigits: 6 })}
                    </td>
                    <td className="px-3 py-3 text-sm text-center text-[var(--text-primary)] font-medium">
                      {trade.amount0 ? parseFloat(trade.amount0.toString().split(' ')[0]).toLocaleString('en-US', { maximumFractionDigits: 4 }) : '0'}
                    </td>
                    <td className="px-3 py-3 text-sm text-center text-[var(--text-primary)] font-medium">
                      {trade.amount1 ? parseFloat(trade.amount1.toString().split(' ')[0]).toLocaleString('en-US', { maximumFractionDigits: 4 }) : '0'}
                    </td>
                    <td className="px-3 py-3 text-sm text-left text-[var(--text-primary)] font-medium">
                      <span dangerouslySetInnerHTML={{ __html: formatCompactPrice(trade.value) }}></span>
                    </td>
                    <td className="px-3 py-3 text-sm text-left">
                      <a
                        href={getExplorerAddressUrl(trade.wallet, 'exatech')}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm text-[var(--text-secondary)] hover:text-blue-400"
                      >
                        {formatWalletAddress(trade.wallet)}
                      </a>
                    </td>
                    <td className="px-3 py-3 text-left">
                      <a
                        href={getExplorerTxUrl(trade.txHash, 'exatech')}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-block p-1.5 bg-blue-500/10 hover:bg-blue-500/20 rounded-md text-blue-400 transition-colors"
                        title="View Transaction"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                        </svg>
                      </a>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>


          {pagination.totalPages > 1 && (
            <div className="flex items-center justify-between px-4 py-3 border-t border-[var(--card-border)]">
              <div className="hidden sm:flex sm:items-center text-[var(--text-secondary)] text-sm">
                Showing page {pagination.currentPage} of {pagination.totalPages}
              </div>
              <div className="flex items-center space-x-2">
                <button
                  onClick={prevPage}
                  disabled={!pagination.hasPrev}
                  className={`px-3 py-1 rounded text-sm ${!pagination.hasPrev
                    ? 'bg-[var(--hover)] text-[var(--text-tertiary)] cursor-not-allowed'
                    : 'bg-[var(--hover)] text-[var(--text-secondary)] hover:bg-blue-600 hover:text-white'
                    }`}
                >
                  Previous
                </button>
                <button
                  onClick={nextPage}
                  disabled={!pagination.hasNext}
                  className={`px-3 py-1 rounded text-sm ${!pagination.hasNext
                    ? 'bg-[var(--hover)] text-[var(--text-tertiary)] cursor-not-allowed'
                    : 'bg-[var(--hover)] text-[var(--text-secondary)] hover:bg-blue-600 hover:text-white'
                    }`}
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </>
      )}

      <div className="p-3 border-t border-[var(--card-border)] text-center">
        <a
          href="/transactions"
          className="text-xs text-blue-400 hover:underline"
        >
          View all transactions →
        </a>
      </div>
    </div>
  );
};

export default TradeHistory;