import { useState, useEffect, useCallback, useRef } from 'react';
import { getLatestData, initializeMobius, getAEI } from '../services/mobius';
import type { SensorDataContent } from '../types';

interface UseMobiusOptions {
  pollingInterval?: number; // ms
  autoInitialize?: boolean;
}

export const useMobius = (
  containerName: string | null,
  options: UseMobiusOptions = {}
) => {
  const { pollingInterval = 5000, autoInitialize = true } = options;
  
  const [data, setData] = useState<SensorDataContent | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [isInitialized, setIsInitialized] = useState(false);
  
  const initializingRef = useRef(false);
  const intervalRef = useRef<number | null>(null);

  // Initialize Mobius on mount
  useEffect(() => {
    if (!autoInitialize || initializingRef.current) return;
    
    const init = async () => {
      initializingRef.current = true;
      try {
        const success = await initializeMobius();
        setIsInitialized(success);
        if (!success) {
          setError(new Error('Mobius 초기화 실패'));
          initializingRef.current = false;  // 재시도 가능하게
        }
      } catch (err) {
        setError(err as Error);
        initializingRef.current = false;  // 재시도 가능하게
      }
    };
    
    init();
  }, [autoInitialize]);



  // Fetch data function
  const fetchData = useCallback(async () => {
    if (!containerName ||!isInitialized|| !getAEI()) return;
    
    setLoading(true);
    try {
      const result = await getLatestData(containerName);
      setData(result);
      setError(null);
    } catch (err) {
      setError(err as Error);
    } finally {
      setLoading(false);
    }
  }, [containerName,isInitialized]);

  // Polling effect
  useEffect(() => {
    if (!containerName || !isInitialized) return;
    
    // Initial fetch
    fetchData();
    
    // Set up polling
    intervalRef.current = window.setInterval(fetchData, pollingInterval);
    
    return () => {
      if (intervalRef.current) {
        window.clearInterval(intervalRef.current);
      }
    };
  }, [containerName, isInitialized, fetchData, pollingInterval]);

  return { 
    data, 
    loading, 
    error, 
    isInitialized,
    refetch: fetchData 
  };
};
