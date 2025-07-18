import { useState, useCallback, useEffect } from 'react';
import { getPriceApiUrl } from '../utils/config';

interface PriceData {
  name: string;
  symbol: string;
  price_usd: string;
  price_change_24h: string;
  price_change_percentage_24h: string;
  last_updated: string;
}

interface PriceResponse {
  success: boolean;
  data?: PriceData;
  error?: {
    code: string;
    message: string;
  };
}

export const useTokenPrice = (symbol: string = 'tEXT') => {
  const [priceData, setPriceData] = useState<PriceData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const API_URL = getPriceApiUrl('/price');

  const fetchPrice = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await fetch(API_URL, {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data: PriceResponse = await response.json();
      
      if (data.success && data.data) {
        setPriceData(data.data);
      } else {
        setError(data.error?.message || 'Failed to fetch price data');
      }
    } catch (err) {
      console.error('Error fetching token price:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch price');
    } finally {
      setLoading(false);
    }
  }, []);


  useEffect(() => {
    fetchPrice();
  }, [fetchPrice]);


  useEffect(() => {
    const interval = setInterval(fetchPrice, 60000);
    return () => clearInterval(interval);
  }, [fetchPrice]);


  const calculateUSDValue = useCallback((balance: string | number): string => {
    if (!priceData?.price_usd || !balance) return '0.00';
    
    const balanceNum = typeof balance === 'string' ? parseFloat(balance) : balance;
    const priceNum = parseFloat(priceData.price_usd);
    const usdValue = balanceNum * priceNum;
    
    return usdValue.toFixed(6);
  }, [priceData]);


  const formatUSDDisplay = useCallback((usdValue: string): string => {
    const num = parseFloat(usdValue);
    
    if (num === 0) return '$0.00';
    if (num < 0.01) return `$${num.toFixed(6)}`;
    if (num < 1) return `$${num.toFixed(4)}`;
    if (num < 1000) return `$${num.toFixed(2)}`;
    if (num < 1000000) return `$${(num / 1000).toFixed(2)}K`;
    
    return `$${(num / 1000000).toFixed(2)}M`;
  }, []);


  const getPriceChangeIndicator = useCallback(() => {
    if (!priceData?.price_change_percentage_24h) return null;
    
    const change = parseFloat(priceData.price_change_percentage_24h);
    
    if (change > 0) {
      return {
        icon: '↗️',
        color: 'text-green-500',
        sign: '+',
        value: change.toFixed(2)
      };
    } else if (change < 0) {
      return {
        icon: '↘️', 
        color: 'text-red-500',
        sign: '',
        value: change.toFixed(2)
      };
    } else {
      return {
        icon: '↔️',
        color: 'text-gray-500',
        sign: '',
        value: '0.00'
      };
    }
  }, [priceData]);

  return {

    priceData,
    price: priceData?.price_usd || '0',
    priceChange24h: priceData?.price_change_24h || '0',
    priceChangePercentage24h: priceData?.price_change_percentage_24h || '0',
    lastUpdated: priceData?.last_updated,
    

    calculateUSDValue,
    formatUSDDisplay,
    getPriceChangeIndicator,
    

    loading,
    error,
    refresh: fetchPrice,
    

    isUp: priceData ? parseFloat(priceData.price_change_percentage_24h) > 0 : false,
    isDown: priceData ? parseFloat(priceData.price_change_percentage_24h) < 0 : false,
  };
}; 