

export interface TokenFormatOptions {
  decimals?: number;
  showSymbol?: boolean;
  compact?: boolean;
  showFullPrecision?: boolean;
}


export const formatTokenBalance = (
  balance: string | number,
  symbol?: string,
  options: TokenFormatOptions = {}
): string => {
  const {
    decimals = 4,
    showSymbol = true,
    compact = false,
    showFullPrecision = false
  } = options;

  const numBalance = typeof balance === 'string' ? parseFloat(balance) : balance;
  
  if (isNaN(numBalance) || !isFinite(numBalance)) {
    return showSymbol && symbol ? `0 ${symbol}` : '0';
  }

  if (numBalance === 0) {
    return showSymbol && symbol ? `0 ${symbol}` : '0';
  }

  let formatted: string;

  if (showFullPrecision) {
    formatted = numBalance.toString();
  } else if (compact && numBalance >= 1000000) {
    formatted = formatCompactNumber(numBalance);
  } else if (numBalance >= 1) {
    formatted = numBalance.toFixed(Math.min(decimals, 6));
    formatted = formatted.replace(/\.?0+$/, '');
  } else if (numBalance >= 0.0001) {
    formatted = numBalance.toFixed(6);
    formatted = formatted.replace(/\.?0+$/, '');
  } else {
    if (numBalance > 0) {
      formatted = '< 0.0001';
    } else {
      formatted = numBalance.toExponential(2);
    }
  }

  return showSymbol && symbol ? `${formatted} ${symbol}` : formatted;
};


const formatCompactNumber = (num: number): string => {
  const units = [
    { value: 1e9, suffix: 'B' },
    { value: 1e6, suffix: 'M' },
    { value: 1e3, suffix: 'K' }
  ];

  for (const unit of units) {
    if (num >= unit.value) {
      const formatted = (num / unit.value).toFixed(1);
      return `${formatted.replace(/\.0$/, '')}${unit.suffix}`;
    }
  }

  return num.toFixed(2);
};


export const formatTokenInput = (balance: string | number): string => {
  return formatTokenBalance(balance, undefined, {
    showSymbol: false,
    showFullPrecision: false,
    decimals: 6
  });
};


export const formatTokenDisplay = (
  balance: string | number,
  symbol: string,
  compact: boolean = false
): string => {
  return formatTokenBalance(balance, symbol, {
    showSymbol: true,
    compact,
    decimals: 4
  });
};


export const formatUSDValue = (
  amount: string | number,
  tokenPrice: string | number
): string => {
  const numAmount = typeof amount === 'string' ? parseFloat(amount) : amount;
  const numPrice = typeof tokenPrice === 'string' ? parseFloat(tokenPrice) : tokenPrice;
  
  if (isNaN(numAmount) || isNaN(numPrice) || numAmount === 0 || numPrice === 0) {
    return '$0.00';
  }

  const usdValue = numAmount * numPrice;
  
  if (usdValue >= 1000000) {
    return `$${formatCompactNumber(usdValue)}`;
  } else if (usdValue >= 1) {
    return `$${usdValue.toFixed(2)}`;
  } else if (usdValue >= 0.01) {
    return `$${usdValue.toFixed(4)}`;
  } else {
    return '< $0.01';
  }
};


export const formatPercentage = (
  value: string | number,
  decimals: number = 2
): string => {
  const numValue = typeof value === 'string' ? parseFloat(value) : value;
  
  if (isNaN(numValue)) {
    return '0%';
  }

  return `${numValue.toFixed(decimals)}%`;
};


export const formatPoolShare = (
  userLiquidity: string | number,
  totalLiquidity: string | number
): string => {
  const userNum = typeof userLiquidity === 'string' ? parseFloat(userLiquidity) : userLiquidity;
  const totalNum = typeof totalLiquidity === 'string' ? parseFloat(totalLiquidity) : totalLiquidity;
  
  if (isNaN(userNum) || isNaN(totalNum) || totalNum === 0) {
    return '0%';
  }

  const percentage = (userNum / totalNum) * 100;
  
  if (percentage < 0.01) {
    return '< 0.01%';
  } else if (percentage < 1) {
    return `${percentage.toFixed(2)}%`;
  } else {
    return `${percentage.toFixed(1)}%`;
  }
};


export const formatExchangeRate = (
  rate: string | number,
  fromSymbol: string,
  toSymbol: string
): string => {
  const numRate = typeof rate === 'string' ? parseFloat(rate) : rate;
  
  if (isNaN(numRate) || numRate === 0) {
    return `1 ${fromSymbol} = 0 ${toSymbol}`;
  }

  const formattedRate = formatTokenBalance(numRate, undefined, {
    showSymbol: false,
    decimals: 6
  });

  return `1 ${fromSymbol} = ${formattedRate} ${toSymbol}`;
};


export const formatDisplayPrice = (value: string | number): string => {
  if (value === null || value === undefined || value === '') return '$0.00';
  
  const num = typeof value === 'number' ? value : parseFloat(String(value).replace(/[$,]/g, ''));
  
  if (isNaN(num)) return '$0.00';
  if (num === 0) return '$0.00';

  const trimZeros = (str: string): string => {
      if (!str.includes('.')) return str;
      let newStr = str.replace(/0+$/, '');
      if (newStr.endsWith('.')) {
          newStr = newStr.slice(0, -1);
      }
      return newStr;
  };

  if (num < 0.000001) {
    return '$' + trimZeros(num.toFixed(8));
  }
  if (num < 1) {
    return '$' + trimZeros(num.toFixed(6));
  }
  
  return `$${trimZeros(num.toFixed(2))}`;
};


export const formatAmountForDisplay = (value: string | number, symbol?: string): string => {
  const num = typeof value === 'string' ? parseFloat(value) : value;

  if (isNaN(num)) {
    return `0${symbol ? ' ' + symbol : ''}`;
  }

  let formatted: string;

  if (num >= 1_000_000) {
    formatted = `${(num / 1_000_000).toFixed(2)}M`;
  } else if (num >= 1_000) {
    formatted = num.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  } else if (num < 1 && num > 0) {

    formatted = num.toPrecision(4).replace(/0+$/, '');
  } else {
    formatted = num.toLocaleString('en-US', { maximumFractionDigits: 4 });
  }

  return `${formatted}${symbol ? ' ' + symbol : ''}`;
};



export const shortenAddress = (address: string, chars: number = 4): string => {
  if (!address || address.length <= chars * 2 + 2) {
    return address;
  }
  
  return `${address.slice(0, chars + 2)}...${address.slice(-chars)}`;
};


export const formatTxHash = (hash: string): string => {
  return shortenAddress(hash, 6);
};


export const formatNumberWithCommas = (num: number | string): string => {
  const numValue = typeof num === 'string' ? parseFloat(num) : num;
  
  if (isNaN(numValue)) {
    return '0';
  }

  return numValue.toLocaleString('en-US', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2
  });
};


export const formatCompactPrice = (value: string | number): string => {
  if (value === null || value === undefined || value === '') return '$0.00';
  

  const valueStr = typeof value === 'number' ? value.toString() : value;
  

  const cleanValue = valueStr.replace(/[$,]/g, '');
  

  if (isNaN(parseFloat(cleanValue))) return '$0.00';
  
  const num = parseFloat(cleanValue);
  

  if (num === 0) return '$0.00';
  

  if (num >= 0.01) {
    return `$${num.toFixed(2)}`;
  }
  

  const scientificStr = num.toExponential().toLowerCase();
  const parts = scientificStr.split('e-');
  
  if (parts.length === 2) {
    const significand = parts[0];
    const exponent = parseInt(parts[1], 10);
    

    if (exponent > 1) {
      const leadingZeros = exponent - 1;
      const significantDigits = significand.replace('.', '');
      
      return `$0.0<sub class="number-value">${leadingZeros}</sub>${significantDigits}`;
    }
  }
  

  const decimalStr = num.toString();
  const match = decimalStr.match(/^0\.0+/);
  
  if (match) {

    const leadingZeros = match[0].length - 2;
    

    const significantPart = decimalStr.substring(match[0].length);
    

    return `$0.0<sub class="number-value">${leadingZeros}</sub>${significantPart}`;
  }
  

  return `$${num.toFixed(6)}`;
}; 


export const normalizeAddress = (address: string): string => {
  return address.toLowerCase();
};

export const formatCurrency = (value: number | string | undefined, digits: number = 2): string => {
    const num = Number(value);
    if (isNaN(num) || num === 0) return '$0.00';
  
    if (num < 0.01 && num > 0) {

      return `$${num.toFixed(8)}`;
    }
    
    if (num >= 1_000_000) return `$${(num / 1_000_000).toFixed(2)}M`;
    if (num >= 1_000) return `$${(num / 1_000).toFixed(2)}K`;
    
    return `$${num.toFixed(digits)}`;
};


export const formatAddressForDisplay = (
  address: string, 
  startChars: number = 6, 
  endChars: number = 4
): string => {
  if (!address || address.length <= startChars + endChars) {
    return address;
  }
  
  return `${address.substring(0, startChars)}...${address.substring(address.length - endChars)}`;
}; 