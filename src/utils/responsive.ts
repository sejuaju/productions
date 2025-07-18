

export const BREAKPOINTS = {
  xs: 320,
  sm: 375,
  md: 768,
  lg: 1024,
  xl: 1440,
  '2xl': 1920
} as const;

export type BreakpointKey = keyof typeof BREAKPOINTS;
export type ScreenSize = 'mobile' | 'tablet' | 'desktop';


export const RESPONSIVE_SPACING = {
  mobile: {
    container: 'px-4',
    section: 'py-6',
    component: 'p-4',
    gap: 'gap-4'
  },
  tablet: {
    container: 'px-6',
    section: 'py-8', 
    component: 'p-6',
    gap: 'gap-6'
  },
  desktop: {
    container: 'px-8',
    section: 'py-12',
    component: 'p-8', 
    gap: 'gap-8'
  }
} as const;


export const RESPONSIVE_TYPOGRAPHY = {
  mobile: {
    h1: 'text-2xl',
    h2: 'text-xl',
    h3: 'text-lg',
    body: 'text-sm',
    small: 'text-xs'
  },
  tablet: {
    h1: 'text-3xl',
    h2: 'text-2xl', 
    h3: 'text-xl',
    body: 'text-base',
    small: 'text-sm'
  },
  desktop: {
    h1: 'text-4xl',
    h2: 'text-3xl',
    h3: 'text-2xl', 
    body: 'text-base',
    small: 'text-sm'
  }
} as const;


export const TOUCH_TARGETS = {
  minimum: 'min-h-[44px] min-w-[44px]',
  button: 'h-12 px-6',
  input: 'h-12 px-4',
  icon: 'w-6 h-6 p-1'
} as const;


export const getScreenSize = (width: number): ScreenSize => {
  if (width < BREAKPOINTS.md) return 'mobile';
  if (width < BREAKPOINTS.lg) return 'tablet';
  return 'desktop';
};


export const isMobile = (width: number): boolean => {
  return width < BREAKPOINTS.md;
};


export const isTablet = (width: number): boolean => {
  return width >= BREAKPOINTS.md && width < BREAKPOINTS.lg;
};


export const isDesktop = (width: number): boolean => {
  return width >= BREAKPOINTS.lg;
};