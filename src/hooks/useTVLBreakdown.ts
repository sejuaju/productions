import { useState, useEffect } from 'react';
import { getApiUrl } from '../utils/config';

// Interface untuk data yang diharapkan oleh komponen UI
export interface TVLCategory {
  key: string;
  label: string;
  tvl: string;        // numeric string in quote currency
  percentage: number; // 0-100
  logoUrl?: string;   // URL logo, properti baru
}

export interface TVLResponse {
  total_tvl: string;
  breakdown: TVLCategory[];
}

// Interface untuk data mentah yang datang dari API baru
interface ApiTVLItem {
  name: string;
  token1_logo_url: string;
  tvl_usd: number;
  percentage: number;
  pair_address: string;
}

interface ApiResponse {
  data: ApiTVLItem[];
  success: boolean;
  total_tvl: number;
}

export function useTVLBreakdown() {
  const [data, setData] = useState<TVLResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchBreakdown() {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch(getApiUrl('/market/tvl-breakdown'));
        if (!res.ok) {
            throw new Error(`API request failed with status ${res.status}`);
        }
        const json: ApiResponse = await res.json();
        if (!json.success) throw new Error('API response indicates failure');

        // Transformasi data dari format API ke format yang dibutuhkan UI
        const transformedData: TVLResponse = {
          total_tvl: json.total_tvl.toString(),
          breakdown: json.data.map(item => ({
            key: item.pair_address,
            label: item.name,
            tvl: item.tvl_usd.toString(),
            percentage: item.percentage,
            logoUrl: item.token1_logo_url
          }))
        };
        
        setData(transformedData);
      } catch (err: any) {
        setError(err.message || 'Unknown error');
      }
      setLoading(false);
    }

    fetchBreakdown();
  }, []);

  return { data, loading, error };
}
