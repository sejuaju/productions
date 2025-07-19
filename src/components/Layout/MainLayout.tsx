"use client"

import React from 'react';
import Header from './Header';
import Footer from './Footer';
import BetaBanner from '@/components/UI/BetaBanner';
import { getContainerClasses, getSpacingClasses } from '@/utils/responsiveClasses';

interface MainLayoutProps {
  children: React.ReactNode;
  fullWidth?: boolean;
}

const MainLayout: React.FC<MainLayoutProps> = ({ children, fullWidth = false }) => {
  const containerClasses = getContainerClasses(fullWidth);
  const sectionSpacing = getSpacingClasses('section');

  return (
    <div className="flex flex-col min-h-screen bg-[var(--background)]">
      <BetaBanner variant="top-banner" dismissible />
      <Header />
      <main className={`flex-grow ${sectionSpacing} dark:bg-gradient-to-b dark:from-[var(--bg-secondary)] dark:to-[var(--bg-primary)]`}>
        <div className={containerClasses}>
          {children}
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default MainLayout; 