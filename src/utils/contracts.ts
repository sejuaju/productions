import { ethers, formatUnits, parseUnits, Contract } from 'ethers';

export const EXTSWAP_CONTRACTS = {
  ROUTER: "0x8d841B6d95D223197623F62f92bfDD5f5A9fDBB3",
  FACTORY: "0x1c373ad2F5611F4E1A69f2FDDCf2F1F585af5547", 
  WTEXT: "0xdfb8D1fDfAd0CF924C20fd602Dfefea39364ced2"
};

export const TEST_TOKEN_ADDRESS = "0x5190871EB48CB208D9D14eb8BF06Ba632230E083";

export const EXTSWAP_ROUTER_ABI = [
  "function addLiquidityTEXT(address token, uint amountTokenDesired, uint amountTokenMin, uint amountTEXTMin, address to, uint deadline) external payable returns (uint amountToken, uint amountTEXT, uint liquidity)",  
  "function removeLiquidityTEXT(address token, uint liquidity, uint amountTokenMin, uint amountTEXTMin, address to, uint deadline) external returns (uint amountToken, uint amountTEXT)",
  "function swapExactTokensForTEXT(uint amountIn, uint amountOutMin, address[] calldata path, address to, uint deadline) external returns (uint[] memory amounts)",
  "function swapExactTEXTForTokens(uint amountOutMin, address[] calldata path, address to, uint deadline) external payable returns (uint[] memory amounts)",
  "function getAmountsOut(uint amountIn, address[] memory path) external view returns (uint[] memory amounts)",
  "function quote(uint amountA, uint reserveA, uint reserveB) external pure returns (uint amountB)",
  "function getWTEXT() external view returns (address)",
  "function factory() external view returns (address)"
];

export const EXTSWAP_FACTORY_ABI = [
  "function getPair(address tokenA, address tokenB) external view returns (address pair)",
  "function createPair(address tokenA, address tokenB) external returns (address pair)",
  "function allPairs(uint256) external view returns (address pair)",
  "function allPairsLength() external view returns (uint256)"
];


export const EXTSWAP_PAIR_ABI = [
  "function getReserves() external view returns (uint112 reserve0, uint112 reserve1, uint32 blockTimestampLast)",
  "function token0() external view returns (address)",
  "function token1() external view returns (address)",
  "function totalSupply() external view returns (uint256)",
  "function balanceOf(address account) external view returns (uint256)",
  "function allowance(address owner, address spender) external view returns (uint256)",
  "function name() external view returns (string)",
  "function symbol() external view returns (string)",
  "function decimals() external view returns (uint8)",
  "function approve(address spender, uint256 amount) external returns (bool)",
  "function transfer(address to, uint256 amount) external returns (bool)"
];


export const ERC20_ABI = [
  "function name() external view returns (string)",
  "function symbol() external view returns (string)", 
  "function decimals() external view returns (uint8)",
  "function totalSupply() external view returns (uint256)",
  "function balanceOf(address account) external view returns (uint256)",
  "function transfer(address to, uint256 amount) external returns (bool)",
  "function allowance(address owner, address spender) external view returns (uint256)",
  "function approve(address spender, uint256 amount) external returns (bool)",
  "function transferFrom(address from, address to, uint256 amount) external returns (bool)"
];


export const getRouterContract = (provider: ethers.BrowserProvider) => {
  return new ethers.Contract(EXTSWAP_CONTRACTS.ROUTER, EXTSWAP_ROUTER_ABI, provider);
};

export const getFactoryContract = (provider: ethers.Provider) => {
  return new ethers.Contract(EXTSWAP_CONTRACTS.FACTORY, EXTSWAP_FACTORY_ABI, provider);
};

export const getPairContract = (pairAddress: string, provider: ethers.Provider) => {
  return new ethers.Contract(pairAddress, EXTSWAP_PAIR_ABI, provider);
};

export const getERC20Contract = (tokenAddress: string, provider: ethers.Provider) => {
  return new ethers.Contract(tokenAddress, ERC20_ABI, provider);
};

export const isExatechL2 = (chainId: string | null): boolean => {
  return chainId === '0x4c6'; 
};

export const parseTokenAmount = (amount: string, decimals: number = 18): bigint => {
  if (!amount || amount === '') return BigInt(0);
  return ethers.parseUnits(amount, decimals);
};

export const formatTokenAmount = (amount: bigint, decimals: number = 18): string => {
  return ethers.formatUnits(amount, decimals);
};

export { formatUnits }; 
