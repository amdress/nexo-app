import { useState, useCallback } from 'react';

interface UseLoaderReturn {
  isLoading: boolean;
  withLoader: <T>(fn: () => Promise<T>) => Promise<T>;
}

export function useLoader(): UseLoaderReturn {
  // Arreglado: Debe empezar en false
  const [isLoading, setIsLoading] = useState(false); 

  const withLoader = useCallback(async <T>(fn: () => Promise<T>): Promise<T> => {
    setIsLoading(true);
    try {
      return await fn();
    } finally {
      setIsLoading(false);
    }
  }, []);

  return { isLoading, withLoader };
}