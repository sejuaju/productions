"use client"

import { useState, useEffect } from 'react';
import { useWallet } from '@/context/WalletContext';
import { ethers } from 'ethers';
import { toast } from 'react-hot-toast';
import HCaptcha from '@hcaptcha/react-hcaptcha';

const Faucet: React.FC = () => {
  const { walletAddress, isConnected, chainId } = useWallet();
  const [targetAddress, setTargetAddress] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [hCaptchaToken, setHCaptchaToken] = useState<string | null>(null);
  const [txHash, setTxHash] = useState<string | null>(null);

  const isAddressValid = ethers.isAddress(targetAddress);
  const isValidNetwork = chainId === '0x4c6';

  useEffect(() => {
    if (isConnected && walletAddress) {
      setTargetAddress(walletAddress);
    } else {
      setTargetAddress('');
    }
  }, [isConnected, walletAddress]);

  const handleCaptchaVerify = (token: string) => {
    setHCaptchaToken(token);
  };

  const handleClaim = async () => {
    if (!isAddressValid) {
      toast.error('Please enter a valid wallet address.');
      return;
    }
    if (!hCaptchaToken) {
      toast.error('Please complete the captcha.');
      return;
    }
    if (isConnected && !isValidNetwork) {
      toast.error('Please switch to the ExatechL2 Testnet to claim tokens.');
      return;
    }

    setIsLoading(true);
    setTxHash(null);
    try {
      const response = await fetch('/api/faucet/claim', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          address: targetAddress,
          hCaptchaToken: hCaptchaToken,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        toast.error(data.message || 'An error occurred.');
      } else {
        toast.success(data.message);
        if (data.txHash) {
          setTxHash(data.txHash);
        }
      }
    } catch (error) {
      console.error('Claiming error:', error);
      toast.error('An unexpected error occurred. Please try again later.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="card max-w-2xl mx-auto p-4 sm:p-6 md:p-8 shadow-2xl bg-gradient-to-br from-[var(--card-bg)] to-[var(--hover)]/50 dark:from-[var(--bg-card)] dark:to-[var(--bg-primary)] border-t border-[var(--primary)]/20">
      <div className="text-center mb-6">
        <h2 className="text-2xl sm:text-3xl font-bold text-[var(--text-primary)] mb-2">
          Testnet Faucet
        </h2>
        <p className="text-sm sm:text-base text-[var(--text-secondary)]">
          Get test tokens for the ExatechL2 Testnet.
        </p>
      </div>

      <div className="space-y-6">
        <div>
          <label htmlFor="wallet-address" className="block text-sm font-medium text-[var(--text-secondary)] mb-2">
            Recipient Address
          </label>
          <input
            id="wallet-address"
            type="text"
            value={targetAddress}
            onChange={(e) => setTargetAddress(e.target.value)}
            readOnly={isConnected}
            placeholder="Enter your 0x address here..."
            className={`w-full p-3 font-mono bg-[var(--hover)] rounded-xl border transition-colors ${
              !targetAddress || isAddressValid
                ? 'border-[var(--card-border)] focus:border-[var(--primary)]'
                : 'border-red-500/50 focus:border-red-500'
            } focus:ring-2 focus:ring-[var(--primary)]/50 focus:outline-none text-[var(--text-primary)] read-only:bg-[var(--card-border)]/50 read-only:cursor-not-allowed`}
          />
        </div>

        <div className="flex justify-center">
           <div className="w-full max-w-[303px] h-[78px]">
             <HCaptcha
               sitekey={process.env.NEXT_PUBLIC_HCAPTCHA_SITEKEY!}
               onVerify={handleCaptchaVerify}
               theme="dark"
             />
           </div>
        </div>

        <button
          onClick={handleClaim}
          disabled={isLoading || !isAddressValid || !hCaptchaToken || (isConnected && !isValidNetwork)}
          className="w-full btn-primary py-3 text-base font-semibold cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isLoading ? (
            <div className="flex items-center justify-center">
              <svg className="animate-spin -ml-1 mr-3 h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Requesting Tokens...
            </div>
          ) : 'Request 0.1 tEXT'}
        </button>

        {txHash && (
          <div className="text-center mt-4 p-3 bg-[var(--hover)] rounded-lg">
            <p className="text-sm text-[var(--text-secondary)]">
              Transaction sent!{' '}
              <a
                href={`https://explorer-l2.exatech.ai/tx/${txHash}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-[var(--primary)] hover:underline"
              >
                View on Explorer
              </a>
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Faucet; 