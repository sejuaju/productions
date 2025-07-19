
export const API_CONFIG = {
  BASE_URL: process.env.NEXT_PUBLIC_API_BASE_URL || 'http://34.83.148.21:8080/api/v1',
  FALLBACK_URL: process.env.NEXT_PUBLIC_API_FALLBACK_URL || 'http://34.83.148.21:8080/api/v1',
  PRICE_API_URL: process.env.NEXT_PUBLIC_PRICE_API_URL || 'http://38.54.95.227:3001/api',
  EXPLORER_API_URL: process.env.NEXT_PUBLIC_EXPLORER_API_URL || 'http://38.54.95.227:3002/api',
} as const;


export const WEBSOCKET_CONFIG = {
  URL: process.env.NEXT_PUBLIC_WEBSOCKET_URL || 'ws://34.83.148.21:8081/ws',
} as const;


export const RPC_CONFIG = {
  EXATECH: process.env.NEXT_PUBLIC_EXATECH_RPC_URL || 'https://rpc-l2.exatech.ai',
  BSC_TESTNET: process.env.NEXT_PUBLIC_BSC_TESTNET_RPC_URL || 'https://data-seed-prebsc-1-s1.binance.org:8545/',
  BSC_MAINNET: process.env.NEXT_PUBLIC_BSC_MAINNET_RPC_URL || 'https://bsc-dataseed1.binance.org/',
  BSC_HOLDING_CHECK: process.env.NEXT_PUBLIC_BSC_HOLDING_CHECK_RPC_URL || 'https://bsc-dataseed.binance.org/',
} as const;


export const EXPLORER_CONFIG = {
  EXATECH: process.env.NEXT_PUBLIC_EXATECH_EXPLORER_URL || 'https://exatech.tech',
  EXATECH_L2: process.env.NEXT_PUBLIC_EXATECH_EXPLORER_L2_URL || 'https://explorer-l2.exatech.ai',
  EXATECH_IO: process.env.NEXT_PUBLIC_EXATECH_EXPLORER_IO_URL || 'https://explorer.exatech.io',
  BSC_TESTNET: process.env.NEXT_PUBLIC_BSC_TESTNET_EXPLORER_URL || 'https://testnet.bscscan.com',
  BSC_MAINNET: process.env.NEXT_PUBLIC_BSC_MAINNET_EXPLORER_URL || 'https://bscscan.com',
} as const;


export const CAPTCHA_CONFIG = {
  SITE_KEY: process.env.NEXT_PUBLIC_HCAPTCHA_SITEKEY || '',
  SECRET_KEY: process.env.HCAPTCHA_SECRET_KEY || '',
  VERIFY_URL: process.env.HCAPTCHA_VERIFY_URL || 'https://api.hcaptcha.com/siteverify',
} as const;


export const FAUCET_CONFIG = {
  PRIVATE_KEY: process.env.FAUCET_PRIVATE_KEY || '',
} as const;


export const REDIS_CONFIG = {
  URL: process.env.UPSTASH_REDIS_REST_URL || '',
  TOKEN: process.env.UPSTASH_REDIS_REST_TOKEN || '',
} as const;


export const ASSET_CONFIG = {
  COINGECKO_BASE: process.env.NEXT_PUBLIC_COINGECKO_ASSETS_URL || 'https://assets.coingecko.com/coins/images',
} as const;


export const WALLET_CONFIG = {
  METAMASK: process.env.NEXT_PUBLIC_METAMASK_DOWNLOAD_URL || 'https://metamask.io/download/',
  COINBASE: process.env.NEXT_PUBLIC_COINBASE_DOWNLOAD_URL || 'https://www.coinbase.com/wallet',
  TRUSTWALLET: process.env.NEXT_PUBLIC_TRUSTWALLET_DOWNLOAD_URL || 'https://trustwallet.com/',
  RABBY: process.env.NEXT_PUBLIC_RABBY_DOWNLOAD_URL || 'https://rabby.io/',
  RAINBOW: process.env.NEXT_PUBLIC_RAINBOW_DOWNLOAD_URL || 'https://rainbow.me/',
} as const;


export const getApiUrl = (endpoint: string, useFallback = false): string => {
  const baseUrl = useFallback ? API_CONFIG.FALLBACK_URL : API_CONFIG.BASE_URL;
  return `${baseUrl}${endpoint.startsWith('/') ? endpoint : `/${endpoint}`}`;
};

export const getPriceApiUrl = (endpoint: string): string => {
  return `${API_CONFIG.PRICE_API_URL}${endpoint.startsWith('/') ? endpoint : `/${endpoint}`}`;
};

export const getExplorerApiUrl = (endpoint: string): string => {
  return `${API_CONFIG.EXPLORER_API_URL}${endpoint.startsWith('/') ? endpoint : `/${endpoint}`}`;
};


export const getExplorerTxUrl = (txHash: string, network: 'exatech' | 'bsc-testnet' | 'bsc-mainnet' = 'exatech'): string => {
  const baseUrl = {
    'exatech': EXPLORER_CONFIG.EXATECH,
    'bsc-testnet': EXPLORER_CONFIG.BSC_TESTNET,
    'bsc-mainnet': EXPLORER_CONFIG.BSC_MAINNET,
  }[network];

  return `${baseUrl}/tx/${txHash}`;
};

export const getExplorerAddressUrl = (address: string, network: 'exatech' | 'bsc-testnet' | 'bsc-mainnet' = 'exatech'): string => {
  const baseUrl = {
    'exatech': EXPLORER_CONFIG.EXATECH,
    'bsc-testnet': EXPLORER_CONFIG.BSC_TESTNET,
    'bsc-mainnet': EXPLORER_CONFIG.BSC_MAINNET,
  }[network];

  return `${baseUrl}/address/${address}`;
};

export const getExplorerTokenUrl = (tokenAddress: string, network: 'exatech' | 'bsc-testnet' | 'bsc-mainnet' = 'exatech'): string => {
  const baseUrl = {
    'exatech': EXPLORER_CONFIG.EXATECH_IO,
    'bsc-testnet': EXPLORER_CONFIG.BSC_TESTNET,
    'bsc-mainnet': EXPLORER_CONFIG.BSC_MAINNET,
  }[network];

  return `${baseUrl}/token/${tokenAddress}`;
};


export const validateConfig = (): { isValid: boolean; missingVars: string[] } => {
  const requiredVars = [
    'NEXT_PUBLIC_HCAPTCHA_SITEKEY',
    'HCAPTCHA_SECRET_KEY',
    'FAUCET_PRIVATE_KEY',
    'UPSTASH_REDIS_REST_URL',
    'UPSTASH_REDIS_REST_TOKEN',
  ];

  const missingVars = requiredVars.filter(varName => {
    const value = process.env[varName];
    return !value || value.trim() === '';
  });

  return {
    isValid: missingVars.length === 0,
    missingVars,
  };
};


const config = {
  API: API_CONFIG,
  WEBSOCKET: WEBSOCKET_CONFIG,
  RPC: RPC_CONFIG,
  EXPLORER: EXPLORER_CONFIG,
  CAPTCHA: CAPTCHA_CONFIG,
  FAUCET: FAUCET_CONFIG,
  REDIS: REDIS_CONFIG,
  ASSET: ASSET_CONFIG,
  WALLET: WALLET_CONFIG,
  getApiUrl,
  getPriceApiUrl,
  getExplorerApiUrl,
  getExplorerTxUrl,
  getExplorerAddressUrl,
  getExplorerTokenUrl,
  validateConfig,
};

export default config;
