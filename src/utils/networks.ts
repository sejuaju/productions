interface Network {
  id: string;
  name: string;
  shortName: string;
  icon: string;
  rpcUrl: string;
  blockExplorer: string;
  nativeCurrency: {
    name: string;
    symbol: string;
    decimals: number;
  };
  testnet?: boolean;
}

export const networks: Network[] = [
  {
    id: '0x4c6',
    name: 'ExatechL2 Testnet',
    shortName: 'ExatechL2',
    icon: 'https://exatech.tech/favicon.ico',
    rpcUrl: 'https://rpc-l2.exatech.ai',
    blockExplorer: 'https://exatech.tech',
    nativeCurrency: {
      name: 'ExaTech Ether',
      symbol: 'tEXT',
      decimals: 18
    },
    testnet: true
  },
  {
    id: '0x61',
    name: 'BSC Testnet',
    shortName: 'BSC Test',
    icon: 'https://assets.coingecko.com/coins/images/825/small/bnb-icon2_2x.png',
    rpcUrl: 'https://data-seed-prebsc-1-s1.binance.org:8545/',
    blockExplorer: 'https://testnet.bscscan.com',
    nativeCurrency: {
      name: 'BNB',
      symbol: 'tBNB',
      decimals: 18
    },
    testnet: true
  },
  {
    id: '0x38',
    name: 'BNB Smart Chain',
    shortName: 'BSC',
    icon: 'https://assets.coingecko.com/coins/images/825/small/bnb-icon2_2x.png',
    rpcUrl: 'https://bsc-dataseed1.binance.org/',
    blockExplorer: 'https://bscscan.com',
    nativeCurrency: {
      name: 'BNB',
      symbol: 'BNB',
      decimals: 18
    }
  }
];

export const getNetworkByChainId = (chainId: string | null): Network | null => {
  if (!chainId) return null;
  return networks.find(network => network.id === chainId) || null;
};

export const getNetworkCurrencySymbol = (chainId: string | null): string => {
  const network = getNetworkByChainId(chainId);
  return network?.nativeCurrency.symbol || 'ETH';
};

export const getNetworkName = (chainId: string | null): string => {
  const network = getNetworkByChainId(chainId);
  return network?.name || 'Unknown Network';
};

export type { Network }; 