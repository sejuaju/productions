"use client"

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

interface WalletContextType {
  isConnected: boolean;
  walletAddress: string | null;
  isConnecting: boolean;
  isInitializing: boolean;
  chainId: string | null;
  balance: string;
  connectWallet: (walletType?: string) => Promise<void>;
  disconnectWallet: () => void;
  switchNetwork: (chainId: string) => Promise<void>;
}

const WalletContext = createContext<WalletContextType | undefined>(undefined);

interface WalletProviderProps {
  children: ReactNode;
}

declare global {
  interface Window {
    ethereum?: any;
  }
}

export const WalletProvider: React.FC<WalletProviderProps> = ({ children }) => {
  const [isConnected, setIsConnected] = useState(false);
  const [walletAddress, setWalletAddress] = useState<string | null>(null);
  const [isConnecting, setIsConnecting] = useState(false);
  const [isInitializing, setIsInitializing] = useState(true);
  const [chainId, setChainId] = useState<string | null>(null);
  const [balance, setBalance] = useState('0.0');

  useEffect(() => {
    const checkConnection = async () => {
      if (typeof window !== 'undefined' && window.ethereum) {
        try {
          const accounts = await window.ethereum.request({ method: 'eth_accounts' });
          if (accounts.length > 0) {
            setWalletAddress(accounts[0]);
            setIsConnected(true);
            
            const currentChainId = await window.ethereum.request({ method: 'eth_chainId' });
            setChainId(currentChainId);
            
            await updateBalance(accounts[0]);
          }
        } catch (error) {
          console.error('Error checking wallet connection:', error);
        }
      }
      // Set initialization complete after check
      setIsInitializing(false);
    };

    checkConnection();
  }, []);

  useEffect(() => {
    if (typeof window !== 'undefined' && window.ethereum) {
      const handleAccountsChanged = (accounts: string[]) => {
        if (accounts.length === 0) {
          disconnectWallet();
        } else {
          setWalletAddress(accounts[0]);
          updateBalance(accounts[0]);
        }
      };

      const handleChainChanged = (newChainId: string) => {
        setChainId(newChainId);
        window.location.reload();
      };

      window.ethereum.on('accountsChanged', handleAccountsChanged);
      window.ethereum.on('chainChanged', handleChainChanged);

      return () => {
        if (window.ethereum.removeListener) {
          window.ethereum.removeListener('accountsChanged', handleAccountsChanged);
          window.ethereum.removeListener('chainChanged', handleChainChanged);
        }
      };
    }
  }, []);

  const updateBalance = async (address: string) => {
    if (typeof window !== 'undefined' && window.ethereum) {
      try {
        const balanceWei = await window.ethereum.request({
          method: 'eth_getBalance',
          params: [address, 'latest']
        });
        
        const balanceEth = parseInt(balanceWei, 16) / Math.pow(10, 18);
        setBalance(balanceEth.toFixed(4));
      } catch (error) {
        console.error('Error getting balance:', error);
        setBalance('0.0');
      }
    }
  };

  const connectWallet = async (walletType: string = 'metamask') => {
    if (typeof window === 'undefined') {
      throw new Error('Window is not defined');
    }

    setIsConnecting(true);
    try {
      let provider;

      switch (walletType) {
        case 'metamask':
          if (!window.ethereum?.isMetaMask) {
            throw new Error('MetaMask is not installed');
          }
          provider = window.ethereum;
          break;
        
        case 'coinbase':
          if (!window.ethereum?.isCoinbaseWallet) {
            throw new Error('Coinbase Wallet is not installed');
          }
          provider = window.ethereum;
          break;
        
        default:
          if (!window.ethereum) {
            throw new Error('No wallet found');
          }
          provider = window.ethereum;
      }

      const accounts = await provider.request({ 
        method: 'eth_requestAccounts' 
      });

      if (accounts.length === 0) {
        throw new Error('No accounts found');
      }

      const account = accounts[0];
      setWalletAddress(account);
      setIsConnected(true);

      const currentChainId = await provider.request({ method: 'eth_chainId' });
      setChainId(currentChainId);

      await updateBalance(account);

      console.log('Wallet connected:', account);
      
    } catch (error) {
      console.error('Failed to connect wallet:', error);
      throw error;
    } finally {
      setIsConnecting(false);
    }
  };

  const switchNetwork = async (targetChainId: string) => {
    if (typeof window === 'undefined' || !window.ethereum) {
      throw new Error('No wallet found');
    }

    try {
      await window.ethereum.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: targetChainId }],
      });
    } catch (switchError: any) {
      if (switchError.code === 4902) {
        throw new Error('Network not added to wallet');
      }
      throw switchError;
    }
  };

  const disconnectWallet = () => {
    setWalletAddress(null);
    setIsConnected(false);
    setChainId(null);
    setBalance('0.0');
  };

  const value = {
    isConnected,
    walletAddress,
    isConnecting,
    isInitializing,
    chainId,
    balance,
    connectWallet,
    disconnectWallet,
    switchNetwork,
  };

  return (
    <WalletContext.Provider value={value}>
      {children}
    </WalletContext.Provider>
  );
};

export const useWallet = () => {
  const context = useContext(WalletContext);
  if (context === undefined) {
    throw new Error('useWallet must be used within a WalletProvider');
  }
  return context;
}; 