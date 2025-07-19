"use client"

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useTheme } from 'next-themes';
import { usePathname } from 'next/navigation';
import WalletButton from '../Wallet/WalletButton';
import NetworkSelector from '../Wallet/NetworkSelector';


const Header: React.FC = () => {
  const [mounted, setMounted] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { theme, setTheme } = useTheme();
  const pathname = usePathname();

  useEffect(() => {
    setMounted(true);
  }, []);

  const toggleTheme = () => {
    if (mounted) {
      setTheme(theme === 'light' ? 'dark' : 'light');
    }
  };

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const closeMobileMenu = () => {
    setIsMobileMenuOpen(false);
  };

  const navItems = [
    { href: '/home', label: 'Home' },
    { href: '/swap', label: 'Swap' },
    { href: '/liquidity/pools', label: 'Pools' },
    { href: '/farm', label: 'Farm' },
    { href: '/stats', label: 'Stats' },
    { href: '/faucet', label: 'Faucet' },
  ];

  const isActiveLink = (href: string) => {
    if (href === '/swap') {
      return pathname === '/swap' || pathname === '/';
    }
    return pathname.startsWith(href);
  };

  return (
    <>
      <header className="sticky top-0 z-50 bg-[var(--header-bg)] shadow-md border-b border-[var(--border-color)]">
        <div className="w-full px-3 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-20 sm:h-20">

            <div className="flex items-center">
              <Link href="/home" className="flex items-center gap-2" onClick={closeMobileMenu}>
                <Image
                  src="/images/logo.svg"
                  alt="ExtSwap Logo"
                  width={120}
                  height={50}
                  className="h-15 w-auto"
                  priority
                />
                <div className="hidden sm:flex items-center">
                  <span className="px-2 py-1 text-xs font-bold bg-gradient-to-r from-orange-400 to-red-500 text-white rounded-full shadow-lg animate-pulse">
                    BETA
                  </span>
                </div>
              </Link>
            </div>


            <nav className="hidden md:flex items-center space-x-6">
              {navItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`px-3 py-2 rounded-md text-sm font-medium transition-colors duration-200 ${isActiveLink(item.href)
                      ? 'text-[var(--primary)] bg-[var(--primary)]/10'
                      : 'text-[var(--text-primary)] hover:text-[var(--primary)] hover:bg-[var(--hover)]'
                    }`}
                >
                  {item.label}
                </Link>
              ))}
            </nav>


            <div className="hidden md:flex items-center space-x-3">
              <NetworkSelector size="sm" />

              <button
                onClick={toggleTheme}
                className="p-2 rounded-lg transition-all duration-200 hover:bg-[var(--hover)] text-[var(--text-primary)] hover:text-[var(--primary)] focus:outline-none focus:ring-0"
                aria-label="Toggle theme"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 dark:hidden" viewBox="0 0 20 20" fill="currentColor">
                  <path d="M17.293 13.293A8 8 0 016.707 2.707a8.001 8.001 0 1010.586 10.586z" />
                </svg>
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 hidden dark:block" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 2a1 1 0 011 1v1a1 1 0 11-2 0V3a1 1 0 011-1zm4 8a4 4 0 11-8 0 4 4 0 018 0zm-.464 4.95l.707.707a1 1 0 001.414-1.414l-.707-.707a1 1 0 00-1.414 1.414zm2.12-10.607a1 1 0 010 1.414l-.706.707a1 1 0 11-1.414-1.414l.707-.707a1 1 0 011.414 0zM17 11a1 1 0 100-2h-1a1 1 0 100 2h1zm-7 4a1 1 0 011 1v1a1 1 0 11-2 0v-1a1 1 0 011-1zM5.05 6.464A1 1 0 106.465 5.05l-.708-.707a1 1 0 00-1.414 1.414l.707.707zm1.414 8.486l-.707.707a1 1 0 01-1.414-1.414l.707-.707a1 1 0 011.414 1.414zM4 11a1 1 0 100-2H3a1 1 0 000 2h1z" clipRule="evenodd" />
                </svg>
              </button>

              <WalletButton />
            </div>


            <div className="md:hidden flex items-center space-x-1">

              <NetworkSelector size="sm" mobileCompact />


              <WalletButton size="sm" mobileCompact />

              <button
                onClick={toggleTheme}
                className="p-2 rounded-lg transition-all duration-200 hover:bg-[var(--hover)] text-[var(--text-primary)] hover:text-[var(--primary)] focus:outline-none focus:ring-0"
                aria-label="Toggle theme"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 dark:hidden" viewBox="0 0 20 20" fill="currentColor">
                  <path d="M17.293 13.293A8 8 0 016.707 2.707a8.001 8.001 0 1010.586 10.586z" />
                </svg>
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 hidden dark:block" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 2a1 1 0 011 1v1a1 1 0 11-2 0V3a1 1 0 011-1zm4 8a4 4 0 11-8 0 4 4 0 018 0zm-.464 4.95l.707.707a1 1 0 001.414-1.414l-.707-.707a1 1 0 00-1.414 1.414zm2.12-10.607a1 1 0 010 1.414l-.706.707a1 1 0 11-1.414-1.414l.707-.707a1 1 0 011.414 0zM17 11a1 1 0 100-2h-1a1 1 0 100 2h1zm-7 4a1 1 0 011 1v1a1 1 0 11-2 0v-1a1 1 0 011-1zM5.05 6.464A1 1 0 106.465 5.05l-.708-.707a1 1 0 00-1.414 1.414l.707.707zm1.414 8.486l-.707.707a1 1 0 01-1.414-1.414l.707-.707a1 1 0 011.414 1.414zM4 11a1 1 0 100-2H3a1 1 0 000 2h1z" clipRule="evenodd" />
                </svg>
              </button>


              <button
                onClick={toggleMobileMenu}
                className="p-2 rounded-lg transition-all duration-200 hover:bg-[var(--hover)] text-[var(--text-primary)] hover:text-[var(--primary)] focus:outline-none focus:ring-0"
                aria-label="Toggle mobile menu"
              >
                <svg
                  className={`h-5 w-5 transition-transform duration-200 ${isMobileMenuOpen ? 'rotate-90' : ''}`}
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  {isMobileMenuOpen ? (
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  ) : (
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                  )}
                </svg>
              </button>
            </div>
          </div>
        </div>


        <div className={`md:hidden transition-all duration-300 ease-in-out ${isMobileMenuOpen
            ? 'max-h-screen opacity-100 border-t border-[var(--border-color)]'
            : 'max-h-0 opacity-0 overflow-hidden'
          }`}>
          <div className="px-4 pt-2 pb-4 space-y-2 bg-[var(--header-bg)]">
            {/* Beta Badge for Mobile */}
            <div className="flex justify-center py-2">
              <span className="px-3 py-1 text-xs font-bold bg-gradient-to-r from-orange-400 to-red-500 text-white rounded-full shadow-lg animate-pulse">
                🚧 BETA VERSION - Use at your own risk
              </span>
            </div>

            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                onClick={closeMobileMenu}
                className={`block px-3 py-2 rounded-md text-base font-medium transition-colors duration-200 ${isActiveLink(item.href)
                    ? 'text-[var(--primary)] bg-[var(--primary)]/10'
                    : 'text-[var(--text-primary)] hover:text-[var(--primary)] hover:bg-[var(--hover)]'
                  }`}
              >
                {item.label}
              </Link>
            ))}
          </div>
        </div>
      </header>


      {isMobileMenuOpen && (
        <div
          className="fixed inset-0 z-40 md:hidden bg-black/20 backdrop-blur-sm"
          onClick={closeMobileMenu}
          aria-hidden="true"
        />
      )}
    </>
  );
};

export default Header; 