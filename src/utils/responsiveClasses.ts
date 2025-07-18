

import { RESPONSIVE_SPACING, RESPONSIVE_TYPOGRAPHY, TOUCH_TARGETS } from './responsive';


export const getContainerClasses = (fullWidth = false) => {
  if (fullWidth) {
    return 'w-full px-4 sm:px-6 lg:px-8';
  }
  return 'max-w-7xl mx-auto px-4 sm:px-6 lg:px-8';
};


export const getGridClasses = (columns: {
  mobile?: number;
  tablet?: number;
  desktop?: number;
}) => {
  const { mobile = 1, tablet = 2, desktop = 3 } = columns;
  return `grid grid-cols-${mobile} md:grid-cols-${tablet} lg:grid-cols-${desktop}`;
};


export const getSpacingClasses = (type: 'section' | 'component' | 'gap') => {
  switch (type) {
    case 'section':
      return 'py-6 md:py-8 lg:py-12';
    case 'component':
      return 'p-4 md:p-6 lg:p-8';
    case 'gap':
      return 'gap-4 md:gap-6 lg:gap-8';
    default:
      return '';
  }
};


export const getTypographyClasses = (variant: 'h1' | 'h2' | 'h3' | 'body' | 'small') => {
  switch (variant) {
    case 'h1':
      return 'text-2xl md:text-3xl lg:text-4xl font-bold';
    case 'h2':
      return 'text-xl md:text-2xl lg:text-3xl font-semibold';
    case 'h3':
      return 'text-lg md:text-xl lg:text-2xl font-medium';
    case 'body':
      return 'text-sm md:text-base';
    case 'small':
      return 'text-xs md:text-sm';
    default:
      return 'text-base';
  }
};


export const getButtonClasses = (variant: 'primary' | 'secondary' | 'icon' = 'primary') => {
  const baseClasses = 'transition-all duration-200 rounded-lg font-medium focus:outline-none focus:ring-2';
  
  switch (variant) {
    case 'primary':
      return `${baseClasses} ${TOUCH_TARGETS.button} bg-primary hover:bg-primary/90 text-white`;
    case 'secondary':
      return `${baseClasses} ${TOUCH_TARGETS.button} border border-gray-300 hover:bg-gray-50 text-gray-700`;
    case 'icon':
      return `${baseClasses} ${TOUCH_TARGETS.minimum} flex items-center justify-center`;
    default:
      return baseClasses;
  }
};


export const getInputClasses = () => {
  return `${TOUCH_TARGETS.input} w-full rounded-lg border border-gray-300 focus:border-primary focus:ring-1 focus:ring-primary`;
};


export const getCardClasses = () => {
  return 'bg-white rounded-lg shadow-sm border border-gray-200 p-4 md:p-6';
};