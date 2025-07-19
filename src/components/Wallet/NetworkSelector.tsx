"use client"

import React, { useState } from 'react';
import Image from 'next/image';
import { useWallet } from '@/context/WalletContext';
import { networks, type Network } from '@/utils/networks';
import { RPC_CONFIG, EXPLORER_CONFIG } from '../../utils/config';

interface NetworkSelectorProps {
  size?: 'sm' | 'md';
  showTestnets?: boolean;
  mobileCompact?: boolean;
}

interface NetworkIconProps {
  src: string;
  alt: string;
  size: number;
  className?: string;
}

const NetworkIcon: React.FC<NetworkIconProps> = ({ src, alt, size, className = '' }) => {
  const [imageError, setImageError] = useState(false);

  const sizeClasses = {
    16: 'w-4 h-4',
    20: 'w-5 h-5',
    24: 'w-6 h-6',
    32: 'w-8 h-8'
  };

  const sizeClass = sizeClasses[size as keyof typeof sizeClasses] || 'w-6 h-6';

  if (imageError) {
    return (
      <div className={`${sizeClass} rounded-full bg-gradient-to-br from-[var(--primary)]/20 to-[var(--secondary)]/20 flex items-center justify-center text-xs font-bold text-[var(--primary)] ${className}`}>
        {alt.charAt(0)}
      </div>
    );
  }

  return (
    <Image
      src={src}
      alt={alt}
      width={size}
      height={size}
      className={`rounded-full ${className}`}
      onError={() => setImageError(true)}
    />
  );
};

const NetworkSelector: React.FC<NetworkSelectorProps> = ({
  size = 'md',
  showTestnets = true,
  mobileCompact = false
}) => {
  const [selectedNetwork, setSelectedNetwork] = useState(networks.find(n => n.id === '0x4c6') || networks[0]);
  const [isOpen, setIsOpen] = useState(false);
  const [switching, setSwitching] = useState(false);
  const [showTestnetToggle, setShowTestnetToggle] = useState(showTestnets);

  const { switchNetwork, chainId, isConnected } = useWallet();

  const filteredNetworks = showTestnetToggle
    ? networks.filter(network => network.testnet)
    : networks.filter(network => !network.testnet);

  const handleNetworkSwitch = async (network: Network) => {
    setIsOpen(false);
    setSelectedNetwork(network);
    if (isConnected) {
      setSwitching(true);
      try {
        if (network.id === '0x4c6') {
          await addExatechL2Network();
        }
        await switchNetwork(network.id);

      } catch (error: unknown) {
        console.error('Failed to switch network:', error);
        if (error instanceof Error && error.message?.includes('Network not added')) {
          try {
            await addNetworkToWallet(network);
            await switchNetwork(network.id);
          } catch (addError) {
            console.error('Failed to add network:', addError);
          }
        }
      } finally {
        setSwitching(false);
      }
    }
  };

  const addExatechL2Network = async () => {
    if (typeof window === 'undefined' || !window.ethereum) {
      throw new Error('No wallet found');
    }

    try {
      await window.ethereum.request({
        method: 'wallet_addEthereumChain',
        params: [{
          chainId: '0x4c6',
          chainName: 'ExatechL2 Testnet',
          nativeCurrency: {
            name: 'ExaTech Ether',
            symbol: 'ETH',
            decimals: 18
          },
          rpcUrls: [RPC_CONFIG.EXATECH],
          blockExplorerUrls: [EXPLORER_CONFIG.EXATECH],
          iconUrls: ['https://exatech.tech/favicon.ico']
        }]
      });
    } catch (error) {
      console.error('Failed to add ExatechL2 network:', error);
      throw error;
    }
  };

  const addNetworkToWallet = async (network: Network) => {
    if (typeof window === 'undefined' || !window.ethereum) {
      throw new Error('No wallet found');
    }

    try {
      await window.ethereum.request({
        method: 'wallet_addEthereumChain',
        params: [{
          chainId: network.id,
          chainName: network.name,
          nativeCurrency: network.nativeCurrency,
          rpcUrls: [network.rpcUrl],
          blockExplorerUrls: [network.blockExplorer]
        }]
      });
    } catch (error) {
      console.error(`Failed to add ${network.name}:`, error);
      throw error;
    }
  };

  React.useEffect(() => {
    if (chainId) {
      const currentNetwork = networks.find(n => n.id === chainId);
      if (currentNetwork) {
        setSelectedNetwork(currentNetwork);
      }
    }
  }, [chainId]);

  const sizeClasses = {
    sm: mobileCompact ? 'px-1.5 py-1 text-xs' : 'px-2 py-1 text-xs',
    md: 'px-3 py-2 text-sm'
  };

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        disabled={switching}
        className={`
          ${sizeClasses[size]}
          flex items-center gap-2 bg-[var(--hover)] hover:bg-[var(--card-border)] 
          text-[var(--text-primary)] border border-[var(--card-border)] 
          rounded-lg transition-all duration-200
          disabled:opacity-50 disabled:cursor-not-allowed
        `}
      >
        {switching ? (
          <>
            <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            <span>Switching...</span>
          </>
        ) : mobileCompact ? (
          <>
            <NetworkIcon
              src={selectedNetwork.icon}
              alt={selectedNetwork.name}
              size={20}
              className="rounded-full"
            />
            <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
            </svg>
          </>
        ) : (
          <>
            <NetworkIcon
              src={selectedNetwork.icon}
              alt={selectedNetwork.name}
              size={24}
              className="rounded-full"
            />
            <span className="font-medium">{selectedNetwork.shortName}</span>
            {selectedNetwork.testnet && (
              <span className="text-xs px-1 py-0.5 bg-orange-100 dark:bg-orange-500/20 text-orange-600 dark:text-orange-400 rounded">
                Test
              </span>
            )}
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
            </svg>
          </>
        )}
      </button>

      {isOpen && (
        <>
          <div
            className="fixed inset-0 z-10 bg-transparent"
            onClick={() => setIsOpen(false)}
          ></div>

          <div className={`absolute mt-2 border border-[var(--card-border)] rounded-xl shadow-lg z-20 overflow-hidden animate-in slide-in-from-top-2 duration-200 backdrop-blur-sm ${mobileCompact
            ? 'left-0 right-0 mx-auto w-[calc(100vw-4rem)] max-w-xs'
            : 'right-0 w-80'
            }`} style={mobileCompact ? {
              transform: 'translateX(-50%)',
              left: '50%',
              right: 'auto',
              backgroundColor: 'var(--card-bg)'
            } : { backgroundColor: 'var(--card-bg)' }}>
            <div className={`border-b border-[var(--card-border)] bg-gradient-to-r from-[var(--primary)]/5 to-[var(--secondary)]/5 ${mobileCompact ? 'p-3' : 'p-4'
              }`}>
              <div className={`${mobileCompact ? 'flex flex-col gap-2' : 'flex items-center justify-between'}`}>
                <div>
                  <h3 className={`font-semibold text-[var(--text-primary)] ${mobileCompact ? 'text-sm' : ''}`}>Select Network</h3>
                  {!mobileCompact && (
                    <p className="text-xs text-[var(--text-secondary)] mt-1">
                      Choose a network to connect to
                    </p>
                  )}
                </div>
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => setShowTestnetToggle(!showTestnetToggle)}
                    className={`px-2 py-1 text-xs rounded-md transition-colors ${showTestnetToggle
                      ? 'bg-[var(--primary)] text-white'
                      : 'bg-[var(--hover)] text-[var(--text-secondary)]'
                      }`}
                  >
                    Testnet
                  </button>
                  <button
                    onClick={() => setShowTestnetToggle(!showTestnetToggle)}
                    className={`px-2 py-1 text-xs rounded-md transition-colors ${!showTestnetToggle
                      ? 'bg-[var(--primary)] text-white'
                      : 'bg-[var(--hover)] text-[var(--text-secondary)]'
                      }`}
                  >
                    Mainnet
                  </button>
                </div>
              </div>
            </div>

            <div className={`overflow-y-auto ${mobileCompact ? 'max-h-60' : 'max-h-80'}`}>
              {filteredNetworks.map((network) => (
                <button
                  key={network.id}
                  onClick={() => handleNetworkSwitch(network)}
                  disabled={switching}
                  className={`
                    w-full flex items-center justify-between text-left 
                    hover:bg-[var(--hover)] transition-colors
                    ${selectedNetwork.id === network.id ? 'bg-[var(--primary)]/5 border-r-2 border-[var(--primary)]' : ''}
                    disabled:opacity-50 disabled:cursor-not-allowed
                    ${mobileCompact ? 'p-3' : 'p-4'}
                  `}
                >
                  <div className={`flex items-center ${mobileCompact ? 'gap-2' : 'gap-3'}`}>
                    <NetworkIcon
                      src={network.icon}
                      alt={network.name}
                      size={mobileCompact ? 20 : 24}
                      className="rounded-full"
                    />
                    <div>
                      <div className={`font-medium text-[var(--text-primary)] flex items-center gap-2 ${mobileCompact ? 'text-sm' : ''}`}>
                        {mobileCompact ? network.shortName : network.name}
                        {network.testnet && !mobileCompact && (
                          <span className="px-1.5 py-0.5 bg-orange-100 dark:bg-orange-500/20 text-orange-700 dark:text-orange-400 rounded text-xs">
                            Testnet
                          </span>
                        )}
                      </div>
                      {!mobileCompact && (
                        <div className="text-xs text-[var(--text-secondary)]">
                          {network.nativeCurrency.symbol}
                        </div>
                      )}
                    </div>
                  </div>

                  {selectedNetwork.id === network.id && (
                    <div className="w-2 h-2 bg-[var(--primary)] rounded-full"></div>
                  )}
                </button>
              ))}
            </div>

            <div className={`border-t border-[var(--card-border)] bg-[var(--hover)]/30 ${mobileCompact ? 'p-2' : 'p-3'}`}>
              <p className={`text-[var(--text-secondary)] text-center ${mobileCompact ? 'text-xs' : 'text-xs'}`}>
                🚀 <span className="font-medium">ExatechL2</span> {mobileCompact ? 'recommended' : 'is our recommended testnet for development'}
              </p>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default NetworkSelector; 