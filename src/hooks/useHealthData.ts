import { useState, useEffect } from 'react';
import { useRealTime } from './useRealTime';

export interface HealthMetrics {
  heartRate?: number;
  steps?: number;
  hydration?: number;
  energy?: number;
  sleep?: {
    duration: number;
    quality: number;
  };
  timestamp: Date;
}

export const useHealthData = () => {
  const [healthData, setHealthData] = useState<HealthMetrics[]>([]);
  const [currentMetrics, setCurrentMetrics] = useState<HealthMetrics | null>(null);
  const [insights, setInsights] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const { emit, on, off } = useRealTime();

  useEffect(() => {
    // Listen for real-time health updates
    const unsubscribe = on('health_update', (data) => {
      setCurrentMetrics(data.metrics);
      setInsights(data.insights || []);
    });

    const unsubscribeProcessed = on('health_processed', (data) => {
      setHealthData(prev => [data.metrics, ...prev.slice(0, 99)]); // Keep last 100 entries
    });

    return () => {
      unsubscribe?.();
      unsubscribeProcessed?.();
    };
  }, [on, off]);

  const fetchHealthData = async (timeRange: string = '7d') => {
    setIsLoading(true);
    try {
      const token = localStorage.getItem('accessToken');
      const response = await fetch(`/api/health/metrics?range=${timeRange}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setHealthData(data.data);
        setInsights(data.analytics?.insights || []);
      }
    } catch (error) {
      console.error('Failed to fetch health data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const updateHealthMetrics = async (metrics: Partial<HealthMetrics>) => {
    try {
      const token = localStorage.getItem('accessToken');
      const response = await fetch('/api/health/metrics', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          ...metrics,
          timestamp: new Date(),
        }),
      });

      if (response.ok) {
        const data = await response.json();
        setCurrentMetrics(data.metrics);
        setInsights(data.insights);
        
        // Also emit via WebSocket for real-time updates
        emit('health_update', data.metrics);
      }
    } catch (error) {
      console.error('Failed to update health metrics:', error);
    }
  };

  const syncWithDevice = async (deviceType: string) => {
    try {
      const token = localStorage.getItem('accessToken');
      const response = await fetch('/api/health/sync-device', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ deviceType }),
      });

      if (response.ok) {
        const data = await response.json();
        return data;
      }
    } catch (error) {
      console.error('Device sync failed:', error);
    }
  };

  useEffect(() => {
    fetchHealthData();
  }, []);

  return {
    healthData,
    currentMetrics,
    insights,
    isLoading,
    fetchHealthData,
    updateHealthMetrics,
    syncWithDevice,
  };
};