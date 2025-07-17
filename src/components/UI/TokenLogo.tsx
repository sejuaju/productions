import React from 'react';
import Image from 'next/image';

interface TokenLogoProps {
  logoUrl?: string | null;
  symbol: string;
  size: number;
  className?: string;
}

const getTokenColor = (symbol: string): string => {
  const colors = [
    'bg-indigo-500', 'bg-blue-500', 'bg-emerald-500', 
    'bg-purple-500', 'bg-pink-500', 'bg-red-500', 
    'bg-amber-500', 'bg-lime-500', 'bg-cyan-500', 'bg-rose-500'
  ];
  const charCodeSum = symbol.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
  return colors[charCodeSum % colors.length];
};

const TokenLogo: React.FC<TokenLogoProps> = ({ logoUrl, symbol, size, className = '' }) => {
  if (logoUrl) {
    return (
      <Image
        src={logoUrl}
        alt={`${symbol} logo`}
        width={size}
        height={size}
        className={`rounded-full bg-white ${className}`}
        onError={(e) => {
          // Fallback to placeholder if the image fails to load
          (e.target as HTMLImageElement).style.display = 'none';
          const placeholder = document.createElement('div');
          placeholder.className = `w-full h-full ${getTokenColor(symbol)} rounded-full flex items-center justify-center text-white font-bold`;
          placeholder.style.fontSize = `${size * 0.5}px`;
          placeholder.innerText = symbol.charAt(0).toUpperCase();
          e.currentTarget.parentElement?.appendChild(placeholder);
        }}
      />
    );
  }

  // Fallback placeholder if no logoUrl is provided
  return (
    <div
      style={{ width: size, height: size, fontSize: `${size * 0.5}px` }}
      className={`${getTokenColor(symbol)} rounded-full flex items-center justify-center text-white font-bold ${className}`}
    >
      {symbol.charAt(0).toUpperCase()}
    </div>
  );
};

export default TokenLogo; 