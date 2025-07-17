import { useState, useEffect, useRef } from 'react';
import { CandlestickData, UTCTimestamp } from 'lightweight-charts';

// Define the data structures for trades and candles
export interface RealtimeTrade {
  id: string;
  type: 'BUY' | 'SELL';
  time: string;
  value: string; // value in USD
  value_native: string; // value in native token
  amount: string;
  price: string;
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

// Define the structure of messages coming from the WebSocket
interface WebSocketMessage {
  type: 'trade' | 'candle_update';
  channel: string;
  data: RealtimeTrade | { candle: RealtimeCandle };
}

import { WEBSOCKET_CONFIG } from '../utils/config';

const WEBSOCKET_URL = WEBSOCKET_CONFIG.URL;

const processWebSocketMessage = (
  eventData: string,
  setLastTrade: (trade: RealtimeTrade) => void,
  setLastCandle: (candle: CandlestickData) => void,
  denom: 'usd' | 'native'
) => {
  // Split concatenated JSON messages
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

      // Handle messages with a 'data' wrapper (like trade updates)
      if (message.data) {
        if (message.type === 'trade' && 'txHash' in message.data) {
          setLastTrade(message.data as RealtimeTrade);
        }
      } 
      // Handle candle updates, which are NOT wrapped in 'data'
      else if (message.type === 'candle_update' && message.candle) {
        const candleData = message.candle;

        // Create a valid CandlestickData object for the chart
        // Use the correct fields based on the selected denomination
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

/**
 * A centralized WebSocket hook to manage real-time updates for trades and candles.
 * This hook establishes a single connection and subscribes to multiple channels.
 *
 * @param pairAddress The blockchain address of the trading pair.
 * @param timeframe The timeframe for candle updates (e.g., '1m', '1h').
 * @returns An object containing the latest trade, the latest candle, and connection status.
 */
export const useWebSocket = (pairAddress: string, timeframe: string, denom: 'usd' | 'native') => {
  const [lastTrade, setLastTrade] = useState<RealtimeTrade | null>(null);
  const [lastCandle, setLastCandle] = useState<CandlestickData | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const ws = useRef<WebSocket | null>(null);
  const subscribedTimeframe = useRef<string | null>(null);
  const denomRef = useRef(denom);

  // Keep the ref updated with the latest denom value
  useEffect(() => {
    denomRef.current = denom;
  }, [denom]);

  // Effect for establishing and managing the connection
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
        console.log(`WebSocket connected to general endpoint: ${WEBSOCKET_URL}`);
        setIsConnected(true);

        const tradeChannel = `trade_updates:${pairAddress.toLowerCase()}`;
        ws.current?.send(JSON.stringify({ type: 'subscribe', channel: tradeChannel }));
        console.log(`Subscribed to ${tradeChannel}`);
      };

      ws.current.onmessage = (event) => {
        processWebSocketMessage(event.data, setLastTrade, setLastCandle, denomRef.current);
      };

      ws.current.onerror = (error) => {
        console.error('General WebSocket error:', error);
        setIsConnected(false);
      };

      ws.current.onclose = () => {
        console.log('General WebSocket disconnected');
        setIsConnected(false);
      };
    }

    // Cleanup function
    return () => {
      if (ws.current && ws.current.readyState === WebSocket.OPEN) {
          ws.current.close();
      }
    };
  }, [pairAddress]); // Only reconnect if the pairAddress changes

  // Effect for handling timeframe subscription changes
  useEffect(() => {
    if (ws.current && ws.current.readyState === WebSocket.OPEN && timeframe) {
        // Unsubscribe from the old timeframe channel if it exists
        if (subscribedTimeframe.current) {
            const oldChannel = `candle_updates:${pairAddress.toLowerCase()}:${subscribedTimeframe.current}`;
            ws.current.send(JSON.stringify({ type: 'unsubscribe', channel: oldChannel }));
            console.log(`Unsubscribed from ${oldChannel}`);
        }

        // Subscribe to the new timeframe channel
        const newChannel = `candle_updates:${pairAddress.toLowerCase()}:${timeframe}`;
        ws.current.send(JSON.stringify({ type: 'subscribe', channel: newChannel }));
        console.log(`Subscribed to ${newChannel}`);
        subscribedTimeframe.current = timeframe;
    }
  }, [pairAddress, timeframe, isConnected]); // Re-subscribe if timeframe changes

  return { lastTrade, lastCandle, isConnected };
}; 