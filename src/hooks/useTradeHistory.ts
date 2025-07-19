import { useState, useEffect, useCallback } from 'react';
import { getApiUrl } from '../utils/config';
import { normalizeAddress } from '@/utils/tokenFormatter';

export interface Trade {
  id: string;
  pair: string;
  token0Symbol: string;
  token1Symbol: string;
  token0Address: string;
  token1Address: string;
  type: 'BUY' | 'SELL' | 'add' | 'remove';
  price: string;
  priceNative: string;
  priceChange: string;
  amount0: string;
  amount1: string;
  value: string;
  time: string;
  timestamp: string;
  txHash: string;
  wallet: string;
  status: string;
}

interface TradeHistoryResponse {
  success: boolean;
  data: Trade[];
  count: number;
  pagination: {
    current_page: number;
    per_page: number;
    total_count: number;
    total_pages: number;
    has_next: boolean;
    has_prev: boolean;
    offset: number;
  };
}

interface UseTradeHistoryOptions {
  pairAddress: string;
  limit?: number;
}

export const useTradeHistory = ({
  pairAddress,
  limit = 50,
}: UseTradeHistoryOptions) => {
  const [trades, setTrades] = useState<Trade[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({
    totalItems: 0,
    totalPages: 0,
    hasNext: false,
    hasPrev: false,
  });



  const fetchTrades = useCallback(async (currentPage = 1) => {
    if (!pairAddress) {
      setTrades([]);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const offset = (currentPage - 1) * limit;
      const normalizedPairAddress = normalizeAddress(pairAddress);
      const url = getApiUrl(`/pairs/${normalizedPairAddress}/trades?limit=${limit}${offset > 0 ? `&offset=${offset}` : ''}`);

      const response = await fetch(url);

      if (!response.ok) {
        throw new Error(`Failed to fetch trade history: ${response.status}`);
      }

      const data: TradeHistoryResponse = await response.json();

      if (data.success) {
        setTrades(data.data);
        setPagination({
          totalItems: data.pagination.total_count,
          totalPages: data.pagination.total_pages,
          hasNext: data.pagination.has_next,
          hasPrev: data.pagination.has_prev,
        });
        setPage(data.pagination.current_page);
      } else {
        throw new Error('Failed to fetch trade history');
      }
    } catch (err) {
      console.error('Error fetching trade history:', err);
      setError(err instanceof Error ? err.message : 'Unknown error fetching trades');
      setTrades([]);
    } finally {
      setIsLoading(false);
    }
  }, [pairAddress, limit]);

  useEffect(() => {
    if (pairAddress) {
      fetchTrades(1);
    }
  }, [pairAddress, fetchTrades]);


  const addRealtimeTrade = (newTrade: Trade) => {
    setTrades(prevTrades => {

      const exists = prevTrades.some(t => t.id === newTrade.id || t.txHash === newTrade.txHash);
      if (exists) return prevTrades;

      const updated = [newTrade, ...prevTrades];

      if (updated.length > limit * 2) {
        updated.pop();
      }
      return updated;
    });
  };

  const goToPage = (newPage: number) => {
    if (newPage < 1 || newPage > pagination.totalPages) return;
    fetchTrades(newPage);
  };

  const nextPage = () => {
    if (pagination.hasNext) {
      fetchTrades(page + 1);
    }
  };

  const prevPage = () => {
    if (pagination.hasPrev) {
      fetchTrades(page - 1);
    }
  };

  const refresh = () => fetchTrades(page);

  return {
    trades,
    isLoading,
    error,
    pagination: {
      ...pagination,
      currentPage: page,
    },
    goToPage,
    nextPage,
    prevPage,
    refresh,
    addRealtimeTrade,
  };
};