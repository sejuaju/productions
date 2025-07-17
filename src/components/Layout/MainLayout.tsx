"use client"

import React from 'react';
import Header from './Header';
import Footer from './Footer';

interface MainLayoutProps {
  children: React.ReactNode;
  fullWidth?: boolean;
}

const MainLayout: React.FC<MainLayoutProps> = ({ children, fullWidth = false }) => {
  return (
    <div className="flex flex-col min-h-screen bg-[var(--background)]">
      <Header />
      <main className="flex-grow py-8 px-4 dark:bg-gradient-to-b dark:from-[var(--bg-secondary)] dark:to-[var(--bg-primary)]">
        <div className={fullWidth ? "w-full" : "max-w-7xl mx-auto"}>
          {children}
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default MainLayout; 