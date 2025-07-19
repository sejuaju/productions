import { useState, useEffect, useRef } from 'react';
import { CandlestickData, UTCTimestamp } from 'lightweight-charts';


export interface RealtimeTrade {
  id: string;
  type: 'BUY' | 'SELL';
  time: string;
  value: string; 
  value_native: string; 
  amount: string;
  price: string;
  priceNative: string;
  pair: string;
  token0Symbol: string;
  token1Symbol: string;
  token0Address: string;
  token1Address: string;
  amount0: string;
  amount1: string;
  txHash: string;
  wallet: string;
  timestamp: string;
}

export interface RealtimeCandle {
  pair_address: string;
  timeframe: string;
  timestamp: string;
  open: number;
  open_usd: number;
  high: number;
  high_usd: number;
  low: number;
  low_usd: number;
  close: number;
  close_usd: number;
  volume_native: number;
  volume_usd: number;
  trade_count: number;
  liquidity_start: number;
  liquidity_end: number;
}




import { WEBSOCKET_CONFIG } from '../utils/config';

const WEBSOCKET_URL = WEBSOCKET_CONFIG.URL;

const processWebSocketMessage = (
  eventData: string,
  setLastTrade: (trade: RealtimeTrade) => void,
  setLastCandle: (candle: CandlestickData) => void,
  denom: 'usd' | 'native'
) => {

  const messages = eventData.split('}{').map((s, i, arr) => {
    if (arr.length > 1) {
      if (i === 0) return s + '}';
      if (i === arr.length - 1) return '{' + s;
      return '{' + s + '}';
    }
    return s;
  });

  messages.forEach(messageStr => {
    try {
      const message = JSON.parse(messageStr);
      if (!message) return;


      if (message.data) {
        if (message.type === 'trade' && 'txHash' in message.data) {
          setLastTrade(message.data as RealtimeTrade);
        }
      } 

      else if (message.type === 'candle_update' && message.candle) {
        const candleData = message.candle;


        const formattedCandle: CandlestickData = {
          time: (new Date(candleData.timestamp).getTime() / 1000) as UTCTimestamp,
          open: denom === 'usd' ? parseFloat(candleData.open_usd) : parseFloat(candleData.open),
          high: denom === 'usd' ? parseFloat(candleData.high_usd) : parseFloat(candleData.high),
          low: denom === 'usd' ? parseFloat(candleData.low_usd) : parseFloat(candleData.low),
          close: denom === 'usd' ? parseFloat(candleData.close_usd) : parseFloat(candleData.close),
        };

        setLastCandle(formattedCandle);
      }
    } catch (error) {
      console.error('Failed to parse WebSocket message:', error, 'Raw data:', messageStr);
    }
  });
};


export const useWebSocket = (pairAddress: string, timeframe: string, denom: 'usd' | 'native') => {
  const [lastTrade, setLastTrade] = useState<RealtimeTrade | null>(null);
  const [lastCandle, setLastCandle] = useState<CandlestickData | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const ws = useRef<WebSocket | null>(null);
  const subscribedTimeframe = useRef<string | null>(null);
  const denomRef = useRef(denom);


  useEffect(() => {
    denomRef.current = denom;
  }, [denom]);


  useEffect(() => {
    if (!pairAddress) {
        if (ws.current) {
            ws.current.close();
            ws.current = null;
        }
        return;
    };

    if (!ws.current || ws.current.readyState === WebSocket.CLOSED) {
      ws.current = new WebSocket(WEBSOCKET_URL);

      ws.current.onopen = () => {

        setIsConnected(true);

        const tradeChannel = `trade_updates:${pairAddress.toLowerCase()}`;
        ws.current?.send(JSON.stringify({ type: 'subscribe', channel: tradeChannel }));

      };

      ws.current.onmessage = (event) => {
        processWebSocketMessage(event.data, setLastTrade, setLastCandle, denomRef.current);
      };

      ws.current.onerror = (error) => {
        console.error('General WebSocket error:', error);
        setIsConnected(false);
      };

      ws.current.onclose = () => {
        setIsConnected(false);
      };
    }


    return () => {
      if (ws.current && ws.current.readyState === WebSocket.OPEN) {
          ws.current.close();
      }
    };
  }, [pairAddress]);


  useEffect(() => {
    if (ws.current && ws.current.readyState === WebSocket.OPEN && timeframe) {

        if (subscribedTimeframe.current) {
            const oldChannel = `candle_updates:${pairAddress.toLowerCase()}:${subscribedTimeframe.current}`;
            ws.current.send(JSON.stringify({ type: 'unsubscribe', channel: oldChannel }));

        }


        const newChannel = `candle_updates:${pairAddress.toLowerCase()}:${timeframe}`;
        ws.current.send(JSON.stringify({ type: 'subscribe', channel: newChannel }));

        subscribedTimeframe.current = timeframe;
    }
  }, [pairAddress, timeframe, isConnected]);

  return { lastTrade, lastCandle, isConnected };
}; 