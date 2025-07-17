"use client";

import React, { useEffect, useRef, useState, useCallback } from 'react';
import { createChart, IChartApi, ISeriesApi, CandlestickData, UTCTimestamp, CandlestickSeries, LineSeries, AreaSeries, ColorType, LineData } from 'lightweight-charts';
import classNames from 'classnames';
import { usePriceSeries, PairStats } from '@/hooks/usePriceSeries';
import { RealtimeTrade } from '@/hooks/useWebSocket';

type Timeframe = '1m' | '5m' | '15m' | '30m' | '1h' | '4h' | '1d' | '1w' | '1month';
type Denomination = 'usd' | 'native';
type ChartType = 'Candle' | 'Line' | 'Area';

interface PriceChartProps {
  pairAddress: string;
  className?: string;
  height?: number;
  lastCandle: CandlestickData | null;
  lastTrade: RealtimeTrade | null;
  isWsConnected: boolean;
  timeframe: Timeframe;
  setTimeframe: (timeframe: Timeframe) => void;
  denom: Denomination;
  setDenom: (denom: Denomination) => void;
}

const toSubscript = (str: string) => str.split('').map(char => String.fromCharCode(char.charCodeAt(0) + 8272)).join('');

const PriceChart: React.FC<PriceChartProps> = ({ 
  pairAddress, 
  className, 
  height = 400,
  lastCandle,
  lastTrade,
  isWsConnected,
  timeframe,
  setTimeframe,
  denom,
  setDenom
}) => {
  const chartContainerRef = useRef<HTMLDivElement>(null);
  const chartRef = useRef<IChartApi | null>(null);
  const seriesRef = useRef<ISeriesApi<'Candlestick' | 'Line' | 'Area'> | null>(null);
  const lastCandleTimestampRef = useRef<UTCTimestamp | null>(null);
  const processedTradeIds = useRef(new Set<string>());
  
  const [chartType, setChartType] = useState<ChartType>('Candle');
  const [displayedCandle, setDisplayedCandle] = useState<CandlestickData | null>(null);
  const { priceSeries, lineSeries, pairStats, isLoading, error, symbol } = usePriceSeries({ pairAddress, timeframe, denom });
  
  const [displayedStats, setDisplayedStats] = useState<PairStats | null>(null);

  // Main effect for chart instance lifecycle (creation and destruction)
  useEffect(() => {
    if (!chartContainerRef.current) return;

    const chart = createChart(chartContainerRef.current, {
      width: chartContainerRef.current.clientWidth,
      height,
      layout: { background: { type: ColorType.Solid, color: 'transparent' }, textColor: '#ffffff' },
      grid: { vertLines: { color: 'rgba(255, 255, 255, 0.1)' }, horzLines: { color: 'rgba(255, 255, 255, 0.1)' } },
      timeScale: {
        borderColor: 'rgba(255, 255, 255, 0.2)',
        timeVisible: true,
        secondsVisible: false,
      }
    });
    chartRef.current = chart;

    const handleResize = () => {
      if (chartContainerRef.current) {
        chart.resize(chartContainerRef.current.clientWidth, height);
      }
    };
    window.addEventListener('resize', handleResize);

    // Cleanup function runs on component unmount
    return () => {
      window.removeEventListener('resize', handleResize);
      if (chartRef.current) {
        chartRef.current.remove();
        chartRef.current = null;
      }
      seriesRef.current = null;
    };
  }, [height]); // Only re-run if height changes

  useEffect(() => {
    if (pairStats) {
      setDisplayedStats(pairStats);
    }
  }, [pairStats]);

  useEffect(() => {
    if (!lastCandle || !displayedStats) return;

    setDisplayedStats(prevStats => {
      if (!prevStats) return null;

      const newPrice = lastCandle.close;
      // The price from the websocket candle is already in the correct denomination
      const price24hAgo = denom === 'native' ? prevStats.price_24h_ago_native : prevStats.price_24h_ago;
      let newPriceChangePercent = prevStats.price_change_percent_24h;

      if (price24hAgo > 0) {
        newPriceChangePercent = ((newPrice - price24hAgo) / price24hAgo) * 100;
      }
      
      const update = {
        ...prevStats,
        price_change_percent_24h: newPriceChangePercent,
      };

      if (denom === 'native') {
        update.current_price_native = newPrice;
      } else {
        update.current_price = newPrice;
      }

      return update;
    });
  }, [lastCandle, denom]); // Keep denom dependency to recalculate on change

  // This effect ensures the UI updates instantly when the denomination is switched by the user.
  useEffect(() => {
    if (!displayedStats) return;

    setDisplayedStats(prevStats => {
      if (!prevStats) return null;

      const currentPrice = denom === 'native' ? prevStats.current_price_native : prevStats.current_price;
      const price24hAgo = denom === 'native' ? prevStats.price_24h_ago_native : prevStats.price_24h_ago;
      let newPriceChangePercent = prevStats.price_change_percent_24h;

      if (price24hAgo > 0) {
        newPriceChangePercent = ((currentPrice - price24hAgo) / price24hAgo) * 100;
      }

      return {
        ...prevStats,
        price_change_percent_24h: newPriceChangePercent,
      };
    });
  }, [denom]);

  useEffect(() => {
    if (!lastTrade || !displayedStats || processedTradeIds.current.has(lastTrade.id)) return;

    if (lastTrade.type === 'BUY' || lastTrade.type === 'SELL') {
      const tradeValue = denom === 'native' ? parseFloat(lastTrade.value_native) : parseFloat(lastTrade.value);
      if (!isNaN(tradeValue)) {
        setDisplayedStats(prevStats => {
          if (!prevStats) return null;
          
          const newVolume = denom === 'native' 
            ? prevStats.volume_24h_native + tradeValue 
            : prevStats.volume_24h + tradeValue;

          return {
            ...prevStats,
            volume_24h: denom === 'usd' ? newVolume : prevStats.volume_24h,
            volume_24h_native: denom === 'native' ? newVolume : prevStats.volume_24h_native,
          };
        });
        processedTradeIds.current.add(lastTrade.id);
      }
    }
  }, [lastTrade, displayedStats, denom]);

  // This useEffect handles data loading and switching between series types
  useEffect(() => {
    const chart = chartRef.current;
      if (!chart || !priceSeries || !lineSeries) return;

    if (seriesRef.current) {
      chart.removeSeries(seriesRef.current);
      seriesRef.current = null;
    }

      // Reset timestamps and candles when data reloads
      lastCandleTimestampRef.current = null;
      setDisplayedCandle(null);
      processedTradeIds.current.clear();


      const priceFormat = { type: 'price' as const, precision: 10, minMove: 0.0000000001 };

    if (chartType === 'Candle') {
          const candlestickSeries = chart.addSeries(CandlestickSeries, { upColor: '#26a69a', downColor: '#ef5350', borderVisible: false, priceFormat });
          candlestickSeries.setData(priceSeries);
          seriesRef.current = candlestickSeries;
          if (priceSeries.length > 0) {
            const lastCandleFromHistory = priceSeries[priceSeries.length - 1];
            setDisplayedCandle(lastCandleFromHistory);
            lastCandleTimestampRef.current = lastCandleFromHistory.time as UTCTimestamp;
          }
    } else if (chartType === 'Line') {
          const lineSeriesObj = chart.addSeries(LineSeries, { lineWidth: 2, priceFormat });
          lineSeriesObj.setData(lineSeries as LineData[]);
          seriesRef.current = lineSeriesObj;
          if (lineSeries.length > 0) {
            const lastPointFromHistory = lineSeries[lineSeries.length - 1];
            lastCandleTimestampRef.current = lastPointFromHistory.time as UTCTimestamp;
          }
    } else if (chartType === 'Area') {
          const areaSeriesObj = chart.addSeries(AreaSeries, { lineColor: '#2962FF', topColor: 'rgba(41, 98, 255, 0.4)', bottomColor: 'rgba(41, 98, 255, 0)', priceFormat });
          areaSeriesObj.setData(lineSeries as LineData[]);
          seriesRef.current = areaSeriesObj;
          if (lineSeries.length > 0) {
            const lastPointFromHistory = lineSeries[lineSeries.length - 1];
            lastCandleTimestampRef.current = lastPointFromHistory.time as UTCTimestamp;
          }
      }
      chart.timeScale().fitContent();

  }, [chartType, priceSeries, lineSeries]); // This now correctly handles data changes on the existing chart

  
  // This useEffect is dedicated to real-time updates
  useEffect(() => {
    const series = seriesRef.current;
    if (!lastCandle || !series || !lastCandleTimestampRef.current) {
      return;
    }

    const newTimestamp = lastCandle.time as UTCTimestamp;
    const isNewer = newTimestamp > lastCandleTimestampRef.current;
    const isSameTime = newTimestamp === lastCandleTimestampRef.current;

    if (isNewer || isSameTime) {
      let updateData;

      setDisplayedCandle(lastCandle); // Update displayed OHLC with the latest candle

      switch(chartType) {
        case 'Line':
          updateData = {
            time: lastCandle.time,
            value: lastCandle.close,
            color: lastCandle.close >= lastCandle.open ? '#26a69a' : '#ef5350',
          } as LineData;
          break;
        case 'Area':
           updateData = {
            time: lastCandle.time,
            value: lastCandle.close,
          } as LineData;
          break;
        case 'Candle':
        default:
          updateData = lastCandle;
          break;
      }
      
      series.update(updateData);
      // setLastPrice(lastCandle.close); // This line was removed as per the new_code

      if (isNewer) {
        lastCandleTimestampRef.current = newTimestamp;
      }
    }
  }, [lastCandle, chartType]);

  useEffect(() => {
    if (!chartRef.current) return;
    
    chartRef.current.applyOptions({
      localization: {
        priceFormatter: (price: number) => {
          const prefix = denom === 'usd' ? '$' : '';
          
          const scientificStr = price.toExponential().toLowerCase();
          const [mantissa, exponentStr] = scientificStr.split('e-');

          if (exponentStr) {
            const exponent = parseInt(exponentStr, 10);
            if (exponent > 4) {
              const leadingZeros = exponent - 1;
              const significantDigits = mantissa.replace('.', '').substring(0, 4);
              return `${prefix}0.0${toSubscript(String(leadingZeros))}${significantDigits}`;
            }
          }
          // For standard numbers, format to 4 decimal places for a cleaner look, as requested.
          return `${prefix}${price.toFixed(4)}`;
        },
      },
    });
  }, [denom]);

  const timeframeOptions: Timeframe[] = ['1m', '5m', '15m', '30m', '1h', '4h', '1d', '1w', '1month'];
  
  const chartTypeOptions: { type: ChartType; icon: React.ReactNode; label: string }[] = [
    { 
      type: 'Candle', 
      label: 'Candlestick',
      icon: (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <line x1="6" y1="2" x2="6" y2="6"></line>
          <line x1="6" y1="18" x2="6" y2="22"></line>
          <rect x="4" y="6" width="4" height="12" rx="1"></rect>
          <line x1="12" y1="2" x2="12" y2="4"></line>
          <line x1="12" y1="20" x2="12" y2="22"></line>
          <rect x="10" y="4" width="4" height="16" rx="1"></rect>
          <line x1="18" y1="2" x2="18" y2="8"></line>
          <line x1="18" y1="16" x2="18" y2="22"></line>
          <rect x="16" y="8" width="4" height="8" rx="1"></rect>
      </svg>
      )
    },
    { 
      type: 'Line', 
      label: 'Line Chart',
      icon: (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <polyline points="3,17 6,11 10,16 16,6 21,10"></polyline>
          <circle cx="3" cy="17" r="1.5" fill="currentColor"></circle>
          <circle cx="6" cy="11" r="1.5" fill="currentColor"></circle>
          <circle cx="10" cy="16" r="1.5" fill="currentColor"></circle>
          <circle cx="16" cy="6" r="1.5" fill="currentColor"></circle>
          <circle cx="21" cy="10" r="1.5" fill="currentColor"></circle>
      </svg>
      )
    },
    { 
      type: 'Area', 
      label: 'Area Chart',
      icon: (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <path d="M3,17 L6,11 L10,16 L16,6 L21,10 L21,21 L3,21 Z" fill="currentColor" fillOpacity="0.2" stroke="currentColor"></path>
          <polyline points="3,17 6,11 10,16 16,6 21,10" strokeWidth="2.5"></polyline>
      </svg>
      )
    },
  ];

  const formatTimeframeLabel = (timeframe: Timeframe): string => {
    const formatMap: Record<Timeframe, string> = {
      '1m': '1m',
      '5m': '5m', 
      '15m': '15m',
      '30m': '30m',
      '1h': '1H',
      '4h': '4H',
      '1d': '1D',
      '1w': '1W',
      '1month': '1M'
    };
    return formatMap[timeframe] || timeframe;
  };

  return (
    <div className={classNames('bg-[#0D1117] border border-gray-800 rounded-xl shadow-lg overflow-hidden', className)}>
      {/* Enhanced Header with improved controls */}
      <div className="flex items-center justify-between p-3 bg-gradient-to-r from-gray-900/50 to-gray-800/30 border-b border-gray-800/50">
        <div className="flex items-center space-x-4">
          {/* Timeframe Selection */}
        <div className="flex items-center">
            <span className="text-xs font-medium text-gray-400 mr-3 hidden sm:block">Timeframe</span>
            <div className="flex items-center bg-gray-900/60 rounded-lg p-1 border border-gray-700/50">
            {timeframeOptions.map((t) => (
              <button
                key={t}
                onClick={() => setTimeframe(t)}
                  className={classNames(
                    'px-2.5 py-1.5 text-xs font-semibold rounded-md transition-all duration-200 min-w-[32px]',
                    {
                      'bg-blue-600 text-white shadow-sm': timeframe === t,
                      'text-gray-400 hover:bg-gray-700/50 hover:text-gray-200': timeframe !== t,
                    }
                  )}
              >
                  {formatTimeframeLabel(t)}
              </button>
            ))}
            </div>
          </div>

          {/* Separator */}
          <div className="h-8 w-px bg-gray-700/50"></div>

          {/* Chart Type Selection */}
          <div className="flex items-center">
            <span className="text-xs font-medium text-gray-400 mr-3 hidden sm:block">Chart</span>
            <div className="flex items-center bg-gray-900/60 rounded-lg p-1 border border-gray-700/50">
              {chartTypeOptions.map(({ type, icon, label }) => (
              <button
                key={type}
                onClick={() => setChartType(type)}
                  className={classNames(
                    'p-2 rounded-md transition-all duration-200 group relative',
                    {
                      'bg-blue-600 text-white shadow-sm': chartType === type,
                      'text-gray-400 hover:bg-gray-700/50 hover:text-gray-200': chartType !== type,
                    }
                  )}
                  title={label}
              >
                {icon}
                  {/* Tooltip */}
                  <div className="absolute -bottom-8 left-1/2 transform -translate-x-1/2 bg-gray-900 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap z-50">
                    {label}
                  </div>
              </button>
            ))}
            </div>
          </div>
        </div>

        {/* Right side stats and controls */}
        <div className="flex items-center space-x-4">
          {displayedStats && (
            <div className="flex items-baseline space-x-3 bg-gray-900/50 border border-gray-700/50 rounded-lg px-4 py-2">
              <p className="text-xl font-semibold text-white">
                {denom === 'native' 
                  ? `${parseFloat((displayedStats.current_price_native || 0).toFixed(8))}`
                  : `$${parseFloat((displayedStats.current_price || 0).toFixed(8))}`
                }
              </p>
              <p className={classNames('text-sm font-medium', {
                'text-green-400': (displayedStats.price_change_percent_24h || 0) >= 0,
                'text-red-400': (displayedStats.price_change_percent_24h || 0) < 0,
              })}>
                {(displayedStats.price_change_percent_24h || 0) >= 0 ? '↗ +' : '↘ '}
                {Math.abs(displayedStats.price_change_percent_24h || 0).toFixed(2)}%
                <span className="text-xs text-gray-500 ml-1.5">24h</span>
              </p>
            </div>
          )}
          
          {/* Connection status */}
          <div className="flex items-center space-x-2">
            <div className={classNames('w-2 h-2 rounded-full', {
              'bg-green-500 shadow-sm shadow-green-500/50': isWsConnected,
              'bg-red-500 shadow-sm shadow-red-500/50': !isWsConnected
            })} title={isWsConnected ? 'Real-time connection active' : 'Disconnected'}></div>
            <span className="text-xs text-gray-500 hidden lg:block">
              {isWsConnected ? 'Live' : 'Offline'}
            </span>
          </div>

          {/* Symbol and denomination toggle */}
          {symbol && (
            <div className="flex items-center bg-gray-900/60 border border-gray-700/50 rounded-lg px-3 py-1.5">
              <span className="text-sm font-medium text-gray-300">{symbol.split('/')[0]}</span>
              <span className="text-sm font-normal text-gray-600 mx-1">/</span>
              <button
                onClick={() => setDenom(denom === 'usd' ? 'native' : 'usd')}
                className="text-sm font-medium text-blue-400 hover:text-blue-300 transition-colors focus:outline-none cursor-pointer"
                title="Click to switch denomination"
              >
                {symbol.split('/')[1] || denom.toUpperCase()}
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Chart container */}
      <div 
        className="relative"
        style={{ height: `${height}px` }} 
      >
        {/* Watermark background */}
        <div
          className="absolute inset-0 z-0"
          style={{
            backgroundImage: `url('/images/logo.svg')`,
            backgroundRepeat: 'no-repeat',
            backgroundPosition: 'center',
            backgroundSize: '50%',
            opacity: 0.07,
          }}
        />

        {/* Chart and overlays container */}
        <div ref={chartContainerRef} className="absolute inset-0 z-10">
          <div className="absolute top-3 left-3 z-10 p-3">
            <div className="flex items-center space-x-4">
              <p className="text-sm font-bold text-white">{symbol || 'Price Chart'}</p>
              {displayedCandle && (
                <div className="flex space-x-3 text-xs font-mono">
                  <span><span className="text-gray-400">O:</span> <span className="text-white">{parseFloat(displayedCandle.open.toFixed(8))}</span></span>
                  <span><span className="text-gray-400">H:</span> <span className="text-green-400">{parseFloat(displayedCandle.high.toFixed(8))}</span></span>
                  <span><span className="text-gray-400">L:</span> <span className="text-red-400">{parseFloat(displayedCandle.low.toFixed(8))}</span></span>
                  <span><span className="text-gray-400">C:</span> <span className="text-white">{parseFloat(displayedCandle.close.toFixed(8))}</span></span>
                </div>
              )}
            </div>
            {displayedStats && (
              <div className="text-xs text-gray-400 mt-2 flex items-center">
                <span className="font-medium">Vol 24h:</span>
                <span className="font-mono ml-2 text-white">
                  {denom === 'usd'
                    ? `$${(displayedStats.volume_24h || 0).toLocaleString('en-US', { notation: 'compact', compactDisplay: 'short' })}`
                    : `${(displayedStats.volume_24h_native || 0).toLocaleString('en-US', { notation: 'compact', compactDisplay: 'short' })} ${symbol?.split('/')[1] || ''}`
                  }
                </span>
          </div>
        )}
          </div>
          {isLoading && <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-75 z-10"><span className="text-white">Loading...</span></div>}
          {error && !isLoading && <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-75 z-10"><span className="text-red-500 text-center p-4">Error: {error}</span></div>}
        {!isLoading && !error && priceSeries.length === 0 && (
          <div className="absolute inset-0 flex flex-col items-center justify-center text-gray-600 z-10 select-none opacity-50">
            <span className="font-medium text-gray-500">
              {!pairAddress ? 'Select a pair to view chart' : 'No chart data available'}
            </span>
          </div>
        )}
        </div>
      </div>
    </div>
  );
};

export default PriceChart; 