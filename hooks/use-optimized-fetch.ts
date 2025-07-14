import { useState, useEffect, useCallback, useRef } from 'react';
import { axiosInstance } from '../utils/http-interceptor';

interface CacheEntry<T> {
  data: T;
  timestamp: number;
  ttl: number;
}

interface UseOptimizedFetchOptions {
  ttl?: number; // Time to live in milliseconds (default: 5 minutes)
  enabled?: boolean; // Whether to fetch immediately
  dependencies?: any[]; // Dependencies that trigger refetch
}

interface UseOptimizedFetchReturn<T> {
  data: T | null;
  loading: boolean;
  error: Error | null;
  refetch: () => Promise<void>;
  clearCache: () => void;
}

// In-memory cache for storing API responses
const cache = new Map<string, CacheEntry<any>>();

// Cache cleanup interval (every 10 minutes)
const CACHE_CLEANUP_INTERVAL = 10 * 60 * 1000;

// Clean up expired cache entries
const cleanupCache = () => {
  const now = Date.now();
  for (const [key, entry] of cache.entries()) {
    if (now - entry.timestamp > entry.ttl) {
      cache.delete(key);
    }
  }
};

// Set up periodic cache cleanup
if (typeof window !== 'undefined') {
  setInterval(cleanupCache, CACHE_CLEANUP_INTERVAL);
}

export function useOptimizedFetch<T>(
  url: string,
  options: UseOptimizedFetchOptions = {}
): UseOptimizedFetchReturn<T> {
  const { ttl = 5 * 60 * 1000, enabled = true, dependencies = [] } = options;
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  const fetchData = useCallback(async () => {
    // Check cache first
    const cachedEntry = cache.get(url);
    if (cachedEntry && Date.now() - cachedEntry.timestamp < cachedEntry.ttl) {
      setData(cachedEntry.data);
      return;
    }

    setLoading(true);
    setError(null);

    // Cancel previous request if it exists
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    // Create new abort controller
    abortControllerRef.current = new AbortController();

    try {
      const response = await axiosInstance.get(url, {
        signal: abortControllerRef.current.signal,
      });

      const responseData = response.data || response;
      
      // Cache the response
      cache.set(url, {
        data: responseData,
        timestamp: Date.now(),
        ttl,
      });

      setData(responseData);
    } catch (err: any) {
      if (err.name !== 'AbortError') {
        setError(err);
        console.error(`Error fetching ${url}:`, err);
      }
    } finally {
      setLoading(false);
      abortControllerRef.current = null;
    }
  }, [url, ttl]);

  const refetch = useCallback(async () => {
    // Clear cache for this URL before refetching
    cache.delete(url);
    await fetchData();
  }, [url, fetchData]);

  const clearCache = useCallback(() => {
    cache.delete(url);
  }, [url]);

  useEffect(() => {
    if (enabled) {
      fetchData();
    }

    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, [enabled, fetchData, ...dependencies]);

  return {
    data,
    loading,
    error,
    refetch,
    clearCache,
  };
}

// Hook for parallel data fetching
export function useParallelFetch<T extends Record<string, any>>(
  requests: Record<keyof T, string>,
  options: UseOptimizedFetchOptions = {}
): {
  data: Partial<T>;
  loading: boolean;
  error: Error | null;
  refetch: () => Promise<void>;
} {
  const [data, setData] = useState<Partial<T>>({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const { ttl = 5 * 60 * 1000, enabled = true, dependencies = [] } = options;

  const fetchAll = useCallback(async () => {
    console.log('fetchAll called with requests:', requests);
    setLoading(true);
    setError(null);

    try {
      // Create cache keys for all requests
      const cacheKeys = Object.keys(requests);
      const cacheKey = cacheKeys.join('|');
      
      console.log('Cache key:', cacheKey);
      
      // Check if all data is cached
      const cachedEntry = cache.get(cacheKey);
      if (cachedEntry && Date.now() - cachedEntry.timestamp < cachedEntry.ttl) {
        console.log('Using cached data for:', cacheKey);
        setData(cachedEntry.data);
        setLoading(false);
        return;
      }

      console.log('Making API calls for:', cacheKey);
      // Fetch all requests in parallel
      const promises = Object.entries(requests).map(async ([key, url]) => {
        console.log(`Fetching ${key}:`, url);
        const response = await axiosInstance.get(url);
        return [key, response.data || response] as [keyof T, any];
      });

      const results = await Promise.all(promises);
      const resultData = Object.fromEntries(results) as T;

      // Cache the combined result
      cache.set(cacheKey, {
        data: resultData,
        timestamp: Date.now(),
        ttl,
      });

      console.log('API calls completed, data cached');
      setData(resultData);
    } catch (err: any) {
      setError(err);
      console.error('Error in parallel fetch:', err);
    } finally {
      setLoading(false);
    }
  }, [requests, ttl]);

  const refetch = useCallback(async () => {
    // Clear cache for all requests
    const cacheKey = Object.keys(requests).join('|');
    cache.delete(cacheKey);
    await fetchAll();
  }, [requests, fetchAll]);

  useEffect(() => {
    console.log('useParallelFetch useEffect triggered:', {
      enabled,
      dependencies,
      requests
    });
    
    if (enabled) {
      fetchAll();
    }
  }, [enabled, fetchAll, ...dependencies]);

  return {
    data,
    loading,
    error,
    refetch,
  };
}

// Utility function to clear all cache
export const clearAllCache = () => {
  cache.clear();
};

// Utility function to get cache statistics
export const getCacheStats = () => {
  return {
    size: cache.size,
    entries: Array.from(cache.entries()).map(([key, entry]) => ({
      key,
      age: Date.now() - entry.timestamp,
      ttl: entry.ttl,
    })),
  };
}; 