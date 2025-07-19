"use client"

import React, { useState } from 'react';
import { useParams } from 'next/navigation';
import MainLayout from '@/components/Layout/MainLayout';
import SwapForm from '@/components/Swap/SwapForm';
import TradeHistory from '@/components/Swap/TradeHistory';
import PriceChart from '@/components/Charts/PriceChart';
import { useWebSocket } from '@/hooks/useWebSocket';
import { useResponsive } from '@/hooks/useResponsive';

export default function SwapPage() {
  const params = useParams();
  const tokens = params.tokens as string[];
  const initialTokenIn = tokens && tokens.length > 0 ? tokens[0] : 'text';
  const initialTokenOut = tokens && tokens.length > 1 ? tokens[1] : '';

  const [currentPairAddress, setCurrentPairAddress] = useState<string>('');
  const [timeframe, setTimeframe] = useState<'1m' | '5m' | '15m' | '30m' | '1h' | '4h' | '1d' | '1w' | '1month'>('15m');
  const [denom, setDenom] = useState<'usd' | 'native'>('usd');
  const { isMobile } = useResponsive();

  const { lastCandle, lastTrade: realtimeLastTrade, isConnected: isWsConnected } = useWebSocket(currentPairAddress, timeframe, denom);


  const lastTradeForHistory = realtimeLastTrade ? {
    id: realtimeLastTrade.id,
    pair: realtimeLastTrade.pair,
    token0Symbol: realtimeLastTrade.token0Symbol,
    token1Symbol: realtimeLastTrade.token1Symbol,
    token0Address: realtimeLastTrade.token0Address,
    token1Address: realtimeLastTrade.token1Address,
    type: realtimeLastTrade.type,
    price: realtimeLastTrade.price,
    priceNative: realtimeLastTrade.priceNative,
    priceChange: '0',
    amount0: realtimeLastTrade.amount0,
    amount1: realtimeLastTrade.amount1,
    value: realtimeLastTrade.value,
    time: realtimeLastTrade.timestamp,
    timestamp: realtimeLastTrade.timestamp,
    txHash: realtimeLastTrade.txHash,
    wallet: realtimeLastTrade.wallet,
    status: 'confirmed'
  } : null;

  const handlePairAddressChange = (pairAddress: string) => {
    setCurrentPairAddress(pairAddress);
  };

  return (
    <MainLayout fullWidth>
      <div className="py-2 md:py-6 lg:py-8">
        <div className="max-w-4xl mx-auto text-center mb-4 md:mb-8">
          <h1 className="text-4xl font-bold mb-4 text-[var(--text-primary)] bg-clip-text text-transparent bg-gradient-to-r from-[var(--primary)] to-[var(--accent)]">
            Swap Tokens
          </h1>
          <p className="text-[var(--text-secondary)] max-w-2xl mx-auto">
            Trade tokens instantly with the best exchange rates and minimal slippage.
          </p>
        </div>


        <div className="grid grid-cols-1 lg:grid-cols-3 gap-2 max-w-9xl mx-auto">

          <div className="lg:col-span-2">
            <PriceChart
              pairAddress={currentPairAddress}
              className="w-full"
              height={isMobile ? 350 : 500}
              lastCandle={lastCandle}
              lastTrade={realtimeLastTrade}
              isWsConnected={isWsConnected}
              timeframe={timeframe}
              setTimeframe={setTimeframe}
              denom={denom}
              setDenom={setDenom}
            />
          </div>


          <div className="flex justify-center lg:justify-start">
            <SwapForm
              onPairAddressChange={handlePairAddressChange}
              initialTokenIn={initialTokenIn}
              initialTokenOut={initialTokenOut}
            />
          </div>
        </div>


        <div className="mt-12 w-full">
          {currentPairAddress ? (
            <TradeHistory
              className="shadow-md w-full"
              pairAddress={currentPairAddress}
              lastTrade={lastTradeForHistory}
              isWsConnected={isWsConnected}
            />
          ) : (
            <div className="w-full bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-md">
              <div className="flex justify-between items-center p-4 border-b border-gray-200 dark:border-gray-700">
                <div className="flex items-center space-x-3">
                  <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                    Recent Transactions
                  </h3>
                </div>
              </div>
              <div className="p-6 flex justify-center">
                <div className="flex flex-col items-center">
                  <div className="w-12 h-12 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-gray-400 dark:text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                    </svg>
                  </div>
                  <h4 className="mt-3 text-gray-900 dark:text-white font-medium">Select tokens to view trade history</h4>
                  <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">Choose a trading pair to see recent transactions</p>
                </div>
              </div>
            </div>
          )}
        </div>


        <div className="mt-12">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-xl font-bold mb-4 text-[var(--text-primary)]">
              Fast and Secure Trading on ExtSwap
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6">
              <div className="bg-[var(--bg-card)] p-6 rounded-lg border border-[var(--border)]">
                <div className="w-12 h-12 bg-[var(--primary-light)] rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-[var(--primary)]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                </div>
                <h3 className="text-lg font-semibold mb-2 text-[var(--text-primary)]">Lightning Fast</h3>
                <p className="text-[var(--text-secondary)] text-sm">
                  Trade tokens with minimal transaction fees and quick confirmations on ExatechL2.
                </p>
              </div>
              <div className="bg-[var(--bg-card)] p-6 rounded-lg border border-[var(--border)]">
                <div className="w-12 h-12 bg-[var(--primary-light)] rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-[var(--primary)]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                </div>
                <h3 className="text-lg font-semibold mb-2 text-[var(--text-primary)]">Secure Trading</h3>
                <p className="text-[var(--text-secondary)] text-sm">
                  ExtSwap is built with security as a priority, with audited smart contracts and robust security measures.
                </p>
              </div>
              <div className="bg-[var(--bg-card)] p-6 rounded-lg border border-[var(--border)]">
                <div className="w-12 h-12 bg-[var(--primary-light)] rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-[var(--primary)]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2z" />
                  </svg>
                </div>
                <h3 className="text-lg font-semibold mb-2 text-[var(--text-primary)]">Low Fees</h3>
                <p className="text-[var(--text-secondary)] text-sm">
                  Enjoy lower transaction costs compared to other networks without sacrificing speed or security.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </MainLayout>
  );
}
