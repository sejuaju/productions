import { useState, useEffect } from 'react';
import { getApiUrl } from '../utils/config';

export interface VolumePoint {
  date: string;        
  volume_usd: string;  
}

interface ApiVolumeItem {
    date: string;
    volume_usd: number;
    fees_usd: number;
    transactions: number;
}

interface ApiResponse {
    data: ApiVolumeItem[];
    success: boolean;
}


export function useVolumeTrend(range: '7d' | '30d' | '90d' | 'all') {
  const [data, setData] = useState<VolumePoint[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchTrend() {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch(getApiUrl(`/market/historical-stats?period=${range}`));
        if (!res.ok) {
            throw new Error(`API request failed with status ${res.status}`);
        }
        const json: ApiResponse = await res.json();
        if (!json.success) throw new Error('API response indicates failure');

        const transformedData: VolumePoint[] = json.data.map(item => ({
            date: item.date,
            volume_usd: item.volume_usd.toString(),
        }));

        setData(transformedData);
      } catch (e: any) {
        setError(e.message || 'Unknown error');
      }
      setLoading(false);
    }
    fetchTrend();
  }, [range]);

  return { data, loading, error };
} 