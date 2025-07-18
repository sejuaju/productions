"use client"

import React, { useState } from 'react';
import { useParams } from 'next/navigation';
import MainLayout from '@/components/Layout/MainLayout';
import SwapForm from '@/components/Swap/SwapForm';
import TradeHistory from '@/components/Swap/TradeHistory';
import PriceChart from '@/components/Charts/PriceChart';
import { useWebSocket } from '@/hooks/useWebSocket';

export default function SwapPage() {
  const params = useParams();
  const tokens = params.tokens as string[];
  const initialTokenIn = tokens && tokens.length > 0 ? tokens[0] : 'text';
  const initialTokenOut = tokens && tokens.length > 1 ? tokens[1] : '';

  const [currentPairAddress, setCurrentPairAddress] = useState<string>('');
  const [timeframe, setTimeframe] = useState<any>('15m'); 
  const [denom, setDenom] = useState<'usd' | 'native'>('usd');

  const { lastCandle, lastTrade, isConnected: isWsConnected } = useWebSocket(currentPairAddress, timeframe, denom);
  
  const handlePairAddressChange = (pairAddress: string) => {
    setCurrentPairAddress(pairAddress);
  };
  
  return (
    <MainLayout fullWidth>
      <div className="py-6 px-4">
        <div className="max-w-4xl mx-auto text-center mb-8">
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
              height={500} 
              lastCandle={lastCandle}
              lastTrade={lastTrade}
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
              lastTrade={lastTrade}
              isWsConnected={isWsConnected}
            />
          ) : (
            <div className="text-center py-8 bg-[#1e293b] rounded-lg shadow-md">
              <p className="text-gray-400">Select tokens to view trade history</p>
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
