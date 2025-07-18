"use client"

import { useState, useEffect } from 'react';
import { getScreenSize, isMobile, isTablet, isDesktop, type ScreenSize } from '@/utils/responsive';

interface ResponsiveState {
  screenSize: ScreenSize;
  width: number;
  height: number;
  isMobile: boolean;
  isTablet: boolean;
  isDesktop: boolean;
}

export const useResponsive = (): ResponsiveState => {
  const [state, setState] = useState<ResponsiveState>({
    screenSize: 'desktop',
    width: 1024,
    height: 768,
    isMobile: false,
    isTablet: false,
    isDesktop: true,
  });

  useEffect(() => {
    const updateSize = () => {
      const width = window.innerWidth;
      const height = window.innerHeight;
      const screenSize = getScreenSize(width);

      setState({
        screenSize,
        width,
        height,
        isMobile: isMobile(width),
        isTablet: isTablet(width),
        isDesktop: isDesktop(width),
      });
    };


    updateSize();


    window.addEventListener('resize', updateSize);


    return () => window.removeEventListener('resize', updateSize);
  }, []);

  return state;
};


export const useResponsiveClasses = () => {
  const { screenSize } = useResponsive();

  const getResponsiveClass = (classes: {
    mobile?: string;
    tablet?: string;
    desktop?: string;
  }): string => {
    switch (screenSize) {
      case 'mobile':
        return classes.mobile || classes.tablet || classes.desktop || '';
      case 'tablet':
        return classes.tablet || classes.desktop || classes.mobile || '';
      case 'desktop':
        return classes.desktop || classes.tablet || classes.mobile || '';
      default:
        return '';
    }
  };

  return { getResponsiveClass, screenSize };
};