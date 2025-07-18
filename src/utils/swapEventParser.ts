import { formatUnits } from '@/utils/contracts';

export interface SwapEventData {
  amount0In: bigint;
  amount1In: bigint;
  amount0Out: bigint;
  amount1Out: bigint;
}

export interface PoolToken {
  address: string;
  symbol: string;
  name: string;
  decimals: number;
}


export function parseSwapEventData(event: any): SwapEventData | null {
  try {
    const data = event.data;
    if (!data || data === '0x' || data.length < 258) { 
      return null;
    }
    

    const cleanData = data.slice(2);
    

    const amount0In = BigInt('0x' + cleanData.slice(0, 64));
    const amount1In = BigInt('0x' + cleanData.slice(64, 128));
    const amount0Out = BigInt('0x' + cleanData.slice(128, 192));
    const amount1Out = BigInt('0x' + cleanData.slice(192, 256));
    
    return {
      amount0In,
      amount1In,
      amount0Out,
      amount1Out
    };
  } catch (err) {
    return null;
  }
}


export function calculateEventVolumeUSD(
  event: any,
  token0: PoolToken,
  token1: PoolToken,
  tEXTPrice: number
): number {
  try {
    const swapData = parseSwapEventData(event);
    if (!swapData) return 0;
    
    const { amount0In, amount1In, amount0Out, amount1Out } = swapData;
    

    let volumeToken0 = 0;
    let volumeToken1 = 0;
    
    if (amount0In > BigInt(0)) {

      volumeToken0 = parseFloat(formatUnits(amount0In, token0.decimals));
    } else if (amount0Out > BigInt(0)) {

      volumeToken0 = parseFloat(formatUnits(amount0Out, token0.decimals));
    }
    
    if (amount1In > BigInt(0)) {

      volumeToken1 = parseFloat(formatUnits(amount1In, token1.decimals));
    } else if (amount1Out > BigInt(0)) {

      volumeToken1 = parseFloat(formatUnits(amount1Out, token1.decimals));
    }
    

    let volumeUSD = 0;
    
    if (token0.symbol === 'tEXT' && volumeToken0 > 0) {
      volumeUSD = volumeToken0 * tEXTPrice;
    } else if (token1.symbol === 'tEXT' && volumeToken1 > 0) {
      volumeUSD = volumeToken1 * tEXTPrice;
    }
    
    return volumeUSD;
  } catch (err) {
    return 0;
  }
}


export function filterLast24Hours(events: any[]): any[] {
  const now = Math.floor(Date.now() / 1000);
  const last24h = now - (24 * 60 * 60);
  
  return events.filter((event: any) => {
    const eventTimestamp = parseInt(event.timestamp);
    return eventTimestamp >= last24h;
  });
}


export function isSwapEvent(event: any): boolean {
  const SWAP_EVENT_SIGNATURE = '0xd78ad95fa46c994b6551d0da85fc275fe613ce37657fb8d5e3d130840159d822';
  
  return event?.topics?.[0]?.toLowerCase() === SWAP_EVENT_SIGNATURE.toLowerCase();
} 