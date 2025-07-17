"use client"

import React, { useEffect } from 'react';

interface TransactionSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  slippage: string;
  onSlippageChange: (value: string) => void;
  deadline: string;
  onDeadlineChange: (value: string) => void;
}

const TransactionSettingsModal: React.FC<TransactionSettingsModalProps> = ({
  isOpen,
  onClose,
  slippage,
  onSlippageChange,
  deadline,
  onDeadlineChange,
}) => {
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const presetSlippages = ['0.1', '0.5', '1.0'];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center animate-in fade-in duration-200">
      <div 
        className="absolute inset-0 bg-black/60 backdrop-blur-md cursor-pointer"
        onClick={onClose}
      ></div>
      
      <div className="relative w-full max-w-sm mx-4 card p-0 shadow-2xl max-h-[80vh] flex flex-col animate-in slide-in-from-bottom-4 duration-300">
        <div className="flex items-center justify-between p-4 border-b border-[var(--card-border)] bg-gradient-to-r from-[var(--primary)]/5 to-[var(--secondary)]/5">
          <h3 className="text-lg font-bold text-[var(--text-primary)]">Transaction Settings</h3>
          <button
            onClick={onClose}
            className="p-1.5 hover:bg-[var(--hover)] rounded-lg transition-colors duration-200 cursor-pointer"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-[var(--text-secondary)]" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
            </svg>
          </button>
        </div>

        <div className="p-6 space-y-6">
          <div>
            <div className="flex items-center gap-2 mb-3">
              <label className="text-sm font-medium text-[var(--text-primary)]">Slippage Tolerance</label>
              <div className="group relative">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-[var(--text-secondary)] cursor-help" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-2 bg-[var(--card-bg)] border border-[var(--card-border)] rounded-lg shadow-lg text-xs text-[var(--text-secondary)] w-48 opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none">
                  Your transaction will revert if the price changes unfavorably by more than this percentage.
                </div>
              </div>
            </div>
            
            <div className="flex gap-2 mb-3">
              {presetSlippages.map((preset) => (
                <button
                  key={preset}
                  onClick={() => onSlippageChange(preset)}
                  className={`px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 cursor-pointer ${
                    slippage === preset
                      ? 'bg-[var(--primary)] text-white shadow-md'
                      : 'bg-[var(--hover)] hover:bg-[var(--card-border)] text-[var(--text-primary)] border border-[var(--card-border)]'
                  }`}
                >
                  {preset}%
                </button>
              ))}
            </div>
            
            <div className="relative">
              <input
                type="text"
                value={slippage}
                onChange={(e) => onSlippageChange(e.target.value)}
                placeholder="Custom"
                className="w-full pl-3 pr-8 py-2.5 border border-[var(--card-border)] bg-[var(--card-bg)] rounded-xl focus:outline-none focus:ring-2 focus:ring-[var(--primary)] focus:border-[var(--primary)] text-[var(--text-primary)] placeholder-[var(--text-secondary)] transition-all duration-200"
              />
              <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-[var(--text-secondary)] text-sm">%</span>
            </div>
            
            {parseFloat(slippage) > 5 && (
              <div className="mt-2 p-2 bg-orange-500/10 border border-orange-500/20 rounded-lg">
                <div className="flex items-center gap-2 text-orange-600 dark:text-orange-400 text-xs">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
                  </svg>
                  High slippage tolerance may result in unfavorable rates
                </div>
              </div>
            )}
          </div>

          <div>
            <div className="flex items-center gap-2 mb-3">
              <label className="text-sm font-medium text-[var(--text-primary)]">Transaction Deadline</label>
              <div className="group relative">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-[var(--text-secondary)] cursor-help" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-2 bg-[var(--card-bg)] border border-[var(--card-border)] rounded-lg shadow-lg text-xs text-[var(--text-secondary)] w-48 opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none">
                  Your transaction will revert if it is pending for more than this long.
                </div>
              </div>
            </div>
            
            <div className="relative">
              <input
                type="text"
                value={deadline}
                onChange={(e) => onDeadlineChange(e.target.value)}
                placeholder="20"
                className="w-full pl-3 pr-16 py-2.5 border border-[var(--card-border)] bg-[var(--card-bg)] rounded-xl focus:outline-none focus:ring-2 focus:ring-[var(--primary)] focus:border-[var(--primary)] text-[var(--text-primary)] placeholder-[var(--text-secondary)] transition-all duration-200"
              />
              <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-[var(--text-secondary)] text-sm">minutes</span>
            </div>
          </div>
        </div>

        <div className="p-4 border-t border-[var(--card-border)] bg-[var(--hover)]/30">
          <div className="flex items-center justify-between text-xs text-[var(--text-secondary)]">
            <span>Gas optimization enabled</span>
            <div className="flex items-center gap-1">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              <span>Network: Optimized</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TransactionSettingsModal; 