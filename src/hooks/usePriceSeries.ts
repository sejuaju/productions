

import { useState, useEffect, useCallback } from 'react';
import { getApiUrl } from '../utils/config';
import { CandlestickData, LineData, UTCTimestamp } from 'lightweight-charts';

 
interface ApiCandle {
  time: number;
  open: string;
  high: string;
  low: string;
  close: string;
  volume_usd: string;
}


export interface PairStats {
  volume_24h: number;
  volume_24h_native: number;
  liquidity_usd: number;
  current_price: number;
  current_price_native: number;
  price_change_percent_24h: number;
  price_24h_ago: number;
  price_24h_ago_native: number;
}


interface UsePriceSeriesProps {
  pairAddress: string;
  timeframe: string;
  denom?: 'usd' | 'native';
}


interface UsePriceSeriesReturn {
  priceSeries: CandlestickData[];
  lineSeries: LineData[];
  pairStats: PairStats | null;
  symbol: string | null;
  isLoading: boolean;
  error: string | null;
}




const mapApiDataToCandlestickData = (apiData: ApiCandle[]): CandlestickData[] => {
  return apiData.map(item => ({
    time: (item.time / 1000) as UTCTimestamp,
    open: parseFloat(item.open),
    high: parseFloat(item.high),
    low: parseFloat(item.low),
    close: parseFloat(item.close),
  }));
};


const mapApiDataToLineData = (apiData: ApiCandle[]): LineData[] => {
  return apiData.map(item => ({
    time: (item.time / 1000) as UTCTimestamp,
    value: parseFloat(item.close), 
    color: parseFloat(item.close) >= parseFloat(item.open) ? '#26a69a' : '#ef5350',
  }));
};


export const usePriceSeries = ({
  pairAddress,
  timeframe,
  denom = 'usd',
}: UsePriceSeriesProps): UsePriceSeriesReturn => {
  const [priceSeries, setPriceSeries] = useState<CandlestickData[]>([]);
  const [lineSeries, setLineSeries] = useState<LineData[]>([]);
  const [pairStats, setPairStats] = useState<PairStats | null>(null);
  const [symbol, setSymbol] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const fetchPriceSeries = useCallback(async () => {

    if (!pairAddress) {
      setPriceSeries([]);
      setLineSeries([]);
      setPairStats(null);
      setSymbol(null);
      setIsLoading(false);
      setError(null);
      return;
    }


    setIsLoading(true);
    setError(null);

    try {
      const normalizedAddress = pairAddress.toLowerCase();
      

      const ohlcUrl = getApiUrl(`/pairs/${normalizedAddress}/ohlc?timeframe=${timeframe}&denom=${denom}`);
      const statsUrl = getApiUrl(`/pairs/${normalizedAddress}/stats`);

      const [ohlcResponse, statsResponse] = await Promise.all([
        fetch(ohlcUrl),
        fetch(statsUrl)
      ]);

      if (!ohlcResponse.ok) {
        throw new Error(`Failed to fetch OHLC data: ${ohlcResponse.statusText} (${ohlcResponse.status})`);
      }
      if (!statsResponse.ok) {
        throw new Error(`Failed to fetch Stats data: ${statsResponse.statusText} (${statsResponse.status})`);
      }

      const ohlcApiResponse = await ohlcResponse.json();
      const statsApiResponse = await statsResponse.json();

      if (!ohlcApiResponse.success || !ohlcApiResponse.data || !Array.isArray(ohlcApiResponse.data.candles)) {
        throw new Error('Invalid OHLC API response structure');
      }
      if (!statsApiResponse.success || !statsApiResponse.data) {
        throw new Error('Invalid Stats API response structure');
      }

      const candlestickData = mapApiDataToCandlestickData(ohlcApiResponse.data.candles);
      const lineData = mapApiDataToLineData(ohlcApiResponse.data.candles);
      
      setPriceSeries(candlestickData);
      setLineSeries(lineData);
      setSymbol(ohlcApiResponse.data.symbol);
      setPairStats({
        volume_24h: statsApiResponse.data.volume_24h || 0,
        volume_24h_native: statsApiResponse.data.volume_24h_native || 0,
        liquidity_usd: statsApiResponse.data.liquidity_usd || 0,
        current_price: statsApiResponse.data.current_price || 0,
        current_price_native: statsApiResponse.data.current_price_native || 0,
        price_change_percent_24h: statsApiResponse.data.price_change_percent_24h || 0,
        price_24h_ago: statsApiResponse.data.price_24h_ago || 0,
        price_24h_ago_native: statsApiResponse.data.price_24h_ago_native || 0,
      });

    } catch (e: any) {
      setError(e.message || 'An unknown error occurred while fetching data.');
      setPriceSeries([]);
      setLineSeries([]);
      setPairStats(null);
    } finally {
      setIsLoading(false);
    }
  }, [pairAddress, timeframe, denom]);

  useEffect(() => {
    fetchPriceSeries();
  }, [fetchPriceSeries]);

  return { priceSeries, lineSeries, pairStats, symbol, isLoading, error };
};
