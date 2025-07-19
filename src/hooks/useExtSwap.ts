import { useState } from 'react';
import { ethers } from 'ethers';
import { useWallet } from '@/context/WalletContext';
import { 
  getRouterContract, 
  getFactoryContract, 
  getPairContract, 
  getERC20Contract,
  EXTSWAP_CONTRACTS,
  isExatechL2,
  parseTokenAmount,
  formatTokenAmount,
  formatUnits
} from '@/utils/contracts';
import { formatTokenInput } from '@/utils/tokenFormatter';

interface TokenInfo {
  address: string;
  name: string;
  symbol: string;
  decimals: number;
  balance: string;
}

interface PairInfo {
  address: string;
  token0?: string;
  token1?: string;
  reserve0?: string;
  reserve1?: string;
  lpBalance?: string;
  totalSupply?: string;
  exists: boolean;
}

interface AddLiquidityParams {
  tokenAddress: string;
  tokenAmount: string;
  textAmount: string;
  slippage: number;
}

interface RemoveLiquidityParams {
  tokenAddress: string;
  liquidity: string;
  slippage: number;
}

interface SwapParams {
  tokenIn: string;
  tokenOut: string;
  amountIn: string;
  slippage: number;
  isExactIn: boolean;
  
}

interface SwapQuote {
  amountIn: string;
  amountOut: string;
  priceImpact: string;
  route: string[];
  isValid: boolean;
}

export const useExtSwap = () => {
  const { isConnected, walletAddress, chainId } = useWallet();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const isValidNetwork = isExatechL2(chainId);

  const getProvider = async () => {
    if (!window.ethereum) throw new Error('No wallet found');
    return new ethers.BrowserProvider(window.ethereum);
  };

  const getSigner = async () => {
    const provider = await getProvider();
    return await provider.getSigner();
  };

  const getTokenInfo = async (tokenAddress: string): Promise<TokenInfo> => {
    try {
      const provider = await getProvider();
      const tokenContract = getERC20Contract(tokenAddress, provider);
      
      const [name, symbol, decimals, balance] = await Promise.all([
        tokenContract.name(),
        tokenContract.symbol(),
        tokenContract.decimals(),
        isConnected && walletAddress 
          ? tokenContract.balanceOf(walletAddress)
          : BigInt(0)
      ]);

      return {
        address: tokenAddress,
        name,
        symbol,
        decimals: Number(decimals),
        balance: formatTokenInput(formatTokenAmount(balance, Number(decimals)))
      };
    } catch (err) {
      console.error('Error getting token info:', err);
      throw new Error('Failed to fetch token information');
    }
  };

  const getTEXTBalance = async (): Promise<string> => {
    try {
      if (!isConnected || !walletAddress) return '0';
      
      const provider = await getProvider();
      const balance = await provider.getBalance(walletAddress);
      return formatTokenInput(formatTokenAmount(balance));
    } catch (err) {
      console.error('Error getting tEXT balance:', err);
      return '0';
    }
  };

  const getPairInfo = async (tokenAddress: string): Promise<PairInfo> => {
    try {
      const provider = await getProvider();
      const factory = getFactoryContract(provider);
      const pairAddress = await factory.getFunction('getPair')(EXTSWAP_CONTRACTS.WTEXT, tokenAddress);
      
      if (pairAddress === '0x0000000000000000000000000000000000000000') {
        return { 
          exists: false, 
          address: '0x0000000000000000000000000000000000000000' 
        };
      }

      const pairContract = getPairContract(pairAddress, provider);
      
      const [reserves, totalSupply] = await Promise.all([
        pairContract.getFunction('getReserves')(),
        pairContract.getFunction('totalSupply')()
      ]);

      let lpBalance = '0';
      if (isConnected && walletAddress) {
        try {
          const balance = await pairContract.getFunction('balanceOf')(walletAddress);
          lpBalance = formatUnits(balance, 18);
        } catch (err) {
          console.warn('Failed to get LP balance:', err);
        }
      }

      return {
        exists: true,
        address: pairAddress,
        reserve0: formatUnits(reserves.reserve0, 18),
        reserve1: formatUnits(reserves.reserve1, 18),
        totalSupply: formatUnits(totalSupply, 18),
        lpBalance: lpBalance,
        token0: tokenAddress,
        token1: EXTSWAP_CONTRACTS.WTEXT
      };
    } catch (error) {
      console.error('Error getting pair info:', error);
      return {
        exists: false,
        address: '0x0000000000000000000000000000000000000000'
      };
    }
  };

  const calculateLiquidityAmounts = async (
    tokenAddress: string,
    tokenAmount: string,
    textAmount: string
  ) => {
    try {
      const provider = await getProvider();
      const router = getRouterContract(provider);
      
      const pairInfo = await getPairInfo(tokenAddress);
      
      if (!pairInfo.exists || !pairInfo.reserve0 || !pairInfo.reserve1 || 
          (parseFloat(pairInfo.reserve0) === 0 && parseFloat(pairInfo.reserve1) === 0)) {
        return {
          tokenAmount: tokenAmount,
          textAmount: textAmount,
          isNewPair: true
        };
      }

      const tokenAmountParsed = parseTokenAmount(tokenAmount);
      const textAmountParsed = parseTokenAmount(textAmount);

      const reserve0 = parseTokenAmount(pairInfo.reserve0);
      const reserve1 = parseTokenAmount(pairInfo.reserve1);

      const quotedTextAmount = await router.quote(tokenAmountParsed, reserve0, reserve1);
      const quotedTokenAmount = await router.quote(textAmountParsed, reserve1, reserve0);

      if (quotedTextAmount <= textAmountParsed) {
        return {
          tokenAmount: tokenAmount,
          textAmount: formatTokenAmount(quotedTextAmount),
          isNewPair: false
        };
      } else {
        return {
          tokenAmount: formatTokenAmount(quotedTokenAmount),
          textAmount: textAmount,
          isNewPair: false
        };
      }
    } catch (err) {
      console.error('Error calculating liquidity amounts:', err);
      throw new Error('Failed to calculate optimal liquidity amounts');
    }
  };

  const addLiquidity = async (params: AddLiquidityParams) => {
    try {
      setIsLoading(true);
      setError(null);

      if (!isValidNetwork) {
        throw new Error('Please switch to ExatechL2 network');
      }

      if (!isConnected || !walletAddress) {
        throw new Error('Please connect your wallet');
      }

      const signer = await getSigner();
      const router = getRouterContract(await getProvider()).connect(signer);
      const tokenContract = getERC20Contract(params.tokenAddress, await getProvider()).connect(signer);

      const tokenAmountParsed = parseTokenAmount(params.tokenAmount);
      const textAmountParsed = parseTokenAmount(params.textAmount);

      const minTokenAmount = tokenAmountParsed * BigInt(10000 - params.slippage * 100) / BigInt(10000);
      const minTextAmount = textAmountParsed * BigInt(10000 - params.slippage * 100) / BigInt(10000);

      const allowance = await tokenContract.getFunction('allowance')(walletAddress, EXTSWAP_CONTRACTS.ROUTER) as bigint;
      
      if (allowance < tokenAmountParsed) {
        const approveTx = await tokenContract.getFunction('approve')(EXTSWAP_CONTRACTS.ROUTER, tokenAmountParsed);
        await approveTx.wait();
      }

      const deadline = Math.floor(Date.now() / 1000) + 60 * 20;

      const tx = await router.getFunction('addLiquidityTEXT')(
        params.tokenAddress,
        tokenAmountParsed,
        minTokenAmount,
        minTextAmount,
        walletAddress,
        deadline,
        { value: textAmountParsed }
      );

      const receipt = await tx.wait();

      return {
        hash: tx.hash,
        receipt
      };

    } catch (err: unknown) {
      console.error('Add liquidity error:', err);
      setError(err instanceof Error ? err.message : 'Failed to add liquidity');
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const removeLiquidity = async (params: RemoveLiquidityParams) => {
    try {
      setIsLoading(true);
      setError(null);

      if (!isValidNetwork) {
        throw new Error('Please switch to ExatechL2 network');
      }

      if (!isConnected || !walletAddress) {
        throw new Error('Please connect your wallet');
      }

      const signer = await getSigner();
      const router = getRouterContract(await getProvider()).connect(signer);

      const pairInfo = await getPairInfo(params.tokenAddress);
      if (!pairInfo.exists) {
        throw new Error('Liquidity pair does not exist');
      }

      const pairContract = getPairContract(pairInfo.address, await getProvider()).connect(signer);
      const liquidityParsed = parseTokenAmount(params.liquidity);

      const allowance = await pairContract.getFunction('allowance')(walletAddress, EXTSWAP_CONTRACTS.ROUTER);
      
      if (allowance < liquidityParsed) {
        const approveTx = await pairContract.getFunction('approve')(EXTSWAP_CONTRACTS.ROUTER, liquidityParsed);
        await approveTx.wait();
      }

      if (!pairInfo.reserve0 || !pairInfo.reserve1 || !pairInfo.totalSupply) {
        throw new Error('Unable to fetch pair reserves');
      }

      const totalSupply = parseTokenAmount(pairInfo.totalSupply);
      const reserve0 = parseTokenAmount(pairInfo.reserve0);
      const reserve1 = parseTokenAmount(pairInfo.reserve1);

      const expectedTokenAmount = liquidityParsed * reserve0 / totalSupply;
      const expectedTextAmount = liquidityParsed * reserve1 / totalSupply;

      const minTokenAmount = expectedTokenAmount * BigInt(10000 - params.slippage * 100) / BigInt(10000);
      const minTextAmount = expectedTextAmount * BigInt(10000 - params.slippage * 100) / BigInt(10000);

      const deadline = Math.floor(Date.now() / 1000) + 60 * 20;

      const tx = await router.getFunction('removeLiquidityTEXT')(
        params.tokenAddress,
        liquidityParsed,
        minTokenAmount,
        minTextAmount,
        walletAddress,
        deadline
      );

      const receipt = await tx.wait();

      return {
        hash: tx.hash,
        receipt,
        expectedTokenAmount: formatTokenAmount(expectedTokenAmount),
        expectedTextAmount: formatTokenAmount(expectedTextAmount)
      };

    } catch (err: unknown) {
      console.error('Remove liquidity error:', err);
      setError(err instanceof Error ? err.message : 'Failed to remove liquidity');
      throw err;
    } finally {
      setIsLoading(false);
    }
  };


  const getSwapQuote = async (
    tokenIn: string,
    tokenOut: string,
    amountIn: string
  ): Promise<SwapQuote> => {
    try {
      if (!amountIn || parseFloat(amountIn) <= 0) {
        return {
          amountIn: '0',
          amountOut: '0',
          priceImpact: '0',
          route: [],
          isValid: false
        };
      }

      const provider = await getProvider();
      const router = getRouterContract(provider);
      
      if (tokenIn === 'tEXT' && tokenOut !== 'tEXT') {
        const path = [EXTSWAP_CONTRACTS.WTEXT, tokenOut];
        const amountInParsed = parseTokenAmount(amountIn);
        
        const amounts = await router.getFunction('getAmountsOut')(amountInParsed, path);
        const amountOut = formatTokenAmount(amounts[1]);
        
        const pairInfo = await getPairInfo(tokenOut);
        let priceImpact = '0';
        if (pairInfo.exists && pairInfo.reserve0 && pairInfo.reserve1) {
          const reserveIn = parseFloat(pairInfo.reserve1);
          const reserveOut = parseFloat(pairInfo.reserve0);
          const currentPrice = reserveOut / reserveIn;
          const newPrice = (reserveOut - parseFloat(amountOut)) / (reserveIn + parseFloat(amountIn));
          priceImpact = (((currentPrice - newPrice) / currentPrice) * 100).toFixed(2);
        }

        return {
          amountIn,
          amountOut,
          priceImpact,
          route: ['tEXT', 'TOKEN'],
          isValid: true
        };
      }
      
      if (tokenIn !== 'tEXT' && tokenOut === 'tEXT') {
        const path = [tokenIn, EXTSWAP_CONTRACTS.WTEXT];
        const amountInParsed = parseTokenAmount(amountIn);
        
        const amounts = await router.getFunction('getAmountsOut')(amountInParsed, path);
        const amountOut = formatTokenAmount(amounts[1]);
        
        const pairInfo = await getPairInfo(tokenIn);
        let priceImpact = '0';
        if (pairInfo.exists && pairInfo.reserve0 && pairInfo.reserve1) {
          const reserveIn = parseFloat(pairInfo.reserve0);
          const reserveOut = parseFloat(pairInfo.reserve1);
          const currentPrice = reserveOut / reserveIn;
          const newPrice = (reserveOut - parseFloat(amountOut)) / (reserveIn + parseFloat(amountIn));
          priceImpact = (((currentPrice - newPrice) / currentPrice) * 100).toFixed(2);
        }

        return {
          amountIn,
          amountOut,
          priceImpact,
          route: ['TOKEN', 'tEXT'],
          isValid: true
        };
      }

      if (tokenIn !== 'tEXT' && tokenOut !== 'tEXT' && tokenIn !== tokenOut) {
        return {
          amountIn: '0',
          amountOut: '0',
          priceImpact: '0',
          route: [],
          isValid: false
        };
      }

      return {
        amountIn: '0',
        amountOut: '0',
        priceImpact: '0',
        route: [],
        isValid: false
      };
      
    } catch (err) {
      console.error('Error getting swap quote:', err);
      return {
        amountIn: '0',
        amountOut: '0',
        priceImpact: '0',
        route: [],
        isValid: false
      };
    }
  };

  const executeSwap = async (params: SwapParams) => {
    try {
      setIsLoading(true);
      setError(null);

      if (!isValidNetwork) {
        throw new Error('Please switch to ExatechL2 network');
      }

      if (!isConnected || !walletAddress) {
        throw new Error('Please connect your wallet');
      }

      const signer = await getSigner();
      const router = getRouterContract(await getProvider()).connect(signer);
      const deadline = Math.floor(Date.now() / 1000) + 60 * 20;

      const amountInParsed = parseTokenAmount(params.amountIn);
      
      if (params.tokenIn === 'tEXT' && params.tokenOut !== 'tEXT') {
        const path = [EXTSWAP_CONTRACTS.WTEXT, params.tokenOut];
        
        const amounts = await router.getFunction('getAmountsOut')(amountInParsed, path);
        const amountOutMin = amounts[1] * BigInt(10000 - params.slippage * 100) / BigInt(10000);

        const tx = await router.getFunction('swapExactTEXTForTokens')(
          amountOutMin,
          path,
          walletAddress,
          deadline,
          { value: amountInParsed }
        );

        const receipt = await tx.wait();

        return {
          hash: tx.hash,
          receipt,
          amountIn: params.amountIn,
          amountOut: formatTokenAmount(amounts[1])
        };
      }
      
      if (params.tokenIn !== 'tEXT' && params.tokenOut === 'tEXT') {
        const tokenContract = getERC20Contract(params.tokenIn, await getProvider()).connect(signer);
        
        const allowance = await tokenContract.getFunction('allowance')(walletAddress, EXTSWAP_CONTRACTS.ROUTER);
        
        if (allowance < amountInParsed) {
          const approveTx = await tokenContract.getFunction('approve')(EXTSWAP_CONTRACTS.ROUTER, amountInParsed);
          await approveTx.wait();
        }

        const path = [params.tokenIn, EXTSWAP_CONTRACTS.WTEXT];
        
        const amounts = await router.getFunction('getAmountsOut')(amountInParsed, path);
        const amountOutMin = amounts[1] * BigInt(10000 - params.slippage * 100) / BigInt(10000);

        const tx = await router.getFunction('swapExactTokensForTEXT')(
          amountInParsed,
          amountOutMin,
          path,
          walletAddress,
          deadline
        );

        const receipt = await tx.wait();

        return {
          hash: tx.hash,
          receipt,
          amountIn: params.amountIn,
          amountOut: formatTokenAmount(amounts[1])
        };
      }

      throw new Error('Unsupported swap pair');

    } catch (err: unknown) {
      console.error('Swap error:', err);
      setError(err instanceof Error ? err.message : 'Failed to execute swap');
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  return {
    isLoading,
    error,
    isValidNetwork,
    
    getTokenInfo,
    getTEXTBalance,
    getPairInfo,
    calculateLiquidityAmounts,
    addLiquidity,
    removeLiquidity,
    getSwapQuote,
    executeSwap,
    
    clearError: () => setError(null)
  };
}; 