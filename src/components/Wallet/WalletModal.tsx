"use client"

import React, { useState } from 'react';
import { useWallet } from '@/context/WalletContext';
import { WALLET_CONFIG } from '../../utils/config';

interface WalletModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface WalletOption {
  id: string;
  name: string;
  icon: string;
  description: string;
  installed?: boolean;
  popular?: boolean;
}

const walletOptions: WalletOption[] = [
  {
    id: 'metamask',
    name: 'MetaMask',
    icon: '🦊',
    description: 'Connect using browser wallet',
    installed: typeof window !== 'undefined' && (window as any).ethereum?.isMetaMask,
    popular: true
  },
  {
    id: 'walletconnect',
    name: 'WalletConnect',
    icon: '🔗',
    description: 'Connect using QR code',
    popular: true
  },
  {
    id: 'coinbase',
    name: 'Coinbase Wallet',
    icon: '🔵',
    description: 'Connect using Coinbase Wallet',
    installed: typeof window !== 'undefined' && (window as any).ethereum?.isCoinbaseWallet
  },
  {
    id: 'trustwallet',
    name: 'Trust Wallet',
    icon: '🛡️',
    description: 'Connect using Trust Wallet'
  },
  {
    id: 'rabby',
    name: 'Rabby Wallet',
    icon: '🐰',
    description: 'Connect using Rabby Wallet'
  },
  {
    id: 'rainbow',
    name: 'Rainbow',
    icon: '🌈',
    description: 'Connect using Rainbow Wallet'
  }
];

const WalletModal: React.FC<WalletModalProps> = ({ isOpen, onClose }) => {
  const [selectedWallet, setSelectedWallet] = useState<string | null>(null);
  const [connecting, setConnecting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { connectWallet } = useWallet();

  const handleWalletSelect = async (walletId: string) => {
    setSelectedWallet(walletId);
    setConnecting(true);
    setError(null);

    try {
      switch (walletId) {
        case 'metamask':
          if (typeof window === 'undefined' || !window.ethereum?.isMetaMask) {
            throw new Error('MetaMask is not installed. Please install MetaMask to continue.');
          }
          break;
        case 'coinbase':
          if (typeof window === 'undefined' || !window.ethereum?.isCoinbaseWallet) {
            throw new Error('Coinbase Wallet is not installed. Please install Coinbase Wallet to continue.');
          }
          break;
        case 'walletconnect':
          break;
        default:
          if (typeof window === 'undefined' || !window.ethereum) {
            throw new Error('No wallet detected. Please install a compatible wallet.');
          }
          break;
      }

      await connectWallet(walletId);
      onClose();
    } catch (err) {
      console.error('Wallet connection error:', err);
      setError(err instanceof Error ? err.message : 'Failed to connect wallet. Please try again.');
    } finally {
      setConnecting(false);
      setSelectedWallet(null);
    }
  };

  const handleInstallWallet = (walletId: string) => {
    const installUrls: Record<string, string> = {
      metamask: WALLET_CONFIG.METAMASK,
      coinbase: WALLET_CONFIG.COINBASE,
      trustwallet: WALLET_CONFIG.TRUSTWALLET,
      rabby: WALLET_CONFIG.RABBY,
      rainbow: WALLET_CONFIG.RAINBOW
    };

    if (installUrls[walletId]) {
      window.open(installUrls[walletId], '_blank');
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center animate-in fade-in duration-200">
      <div 
        className="absolute inset-0 bg-black/60 backdrop-blur-md cursor-pointer"
        onClick={onClose}
      ></div>
      
      <div className="relative w-full max-w-md mx-4 card p-0 shadow-2xl max-h-[80vh] flex flex-col animate-in slide-in-from-bottom-4 duration-300">
        <div className="flex items-center justify-between p-6 border-b border-[var(--card-border)]">
          <div>
            <h3 className="text-xl font-bold text-[var(--text-primary)]">Connect Wallet</h3>
            <p className="text-sm text-[var(--text-secondary)] mt-1">
              Choose your preferred wallet to connect to ExtSwap
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-[var(--hover)] rounded-lg transition-colors duration-200 cursor-pointer"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-[var(--text-secondary)]" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
            </svg>
          </button>
        </div>

        {error && (
          <div className="mx-6 mt-4 p-3 bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/20 rounded-lg">
            <div className="flex items-center">
              <svg className="h-4 w-4 text-red-500 mr-2" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
              <span className="text-sm text-red-700 dark:text-red-400">{error}</span>
            </div>
          </div>
        )}

        <div className="flex-1 overflow-y-auto p-6">
          <div className="space-y-3">
            {walletOptions.map((wallet) => (
              <button
                key={wallet.id}
                onClick={() => wallet.installed !== false ? handleWalletSelect(wallet.id) : handleInstallWallet(wallet.id)}
                disabled={connecting}
                className={`w-full flex items-center justify-between p-4 rounded-xl border-2 transition-all duration-200 hover:scale-[1.02] ${
                  selectedWallet === wallet.id && connecting
                    ? 'border-[var(--primary)] bg-[var(--primary)]/5'
                    : 'border-[var(--card-border)] hover:border-[var(--primary)]/40 hover:bg-[var(--hover)]'
                } ${connecting && selectedWallet !== wallet.id ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
              >
                <div className="flex items-center">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[var(--primary)]/10 to-[var(--secondary)]/10 flex items-center justify-center text-2xl mr-4">
                    {wallet.icon}
                  </div>
                  <div className="text-left">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-[var(--text-primary)]">{wallet.name}</span>
                      {wallet.popular && (
                        <span className="px-2 py-0.5 text-xs font-medium bg-[var(--primary)]/10 text-[var(--primary)] rounded-full">
                          Popular
                        </span>
                      )}
                      {wallet.installed === false && (
                        <span className="px-2 py-0.5 text-xs font-medium bg-orange-100 dark:bg-orange-500/20 text-orange-700 dark:text-orange-400 rounded-full">
                          Install
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-[var(--text-secondary)] mt-0.5">{wallet.description}</p>
                  </div>
                </div>
                
                <div className="flex items-center">
                  {selectedWallet === wallet.id && connecting ? (
                    <svg className="animate-spin h-5 w-5 text-[var(--primary)]" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                  ) : (
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-[var(--text-secondary)]" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                    </svg>
                  )}
                </div>
              </button>
            ))}
          </div>
        </div>

        <div className="p-6 border-t border-[var(--card-border)] bg-[var(--hover)]/30">
          <div className="flex items-start space-x-3">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-[var(--text-secondary)] mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
              </svg>
            </div>
            <div>
              <p className="text-xs text-[var(--text-secondary)]">
                By connecting a wallet, you agree to ExtSwap's{' '}
                <a href="#" className="text-[var(--primary)] hover:underline">Terms of Service</a>
                {' '}and{' '}
                <a href="#" className="text-[var(--primary)] hover:underline">Privacy Policy</a>.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WalletModal; 