import { useState, useEffect, useCallback } from 'react';
import { generateOptimizedImageUrls } from '../utils/image-optimizer';

interface UseImagePreloaderOptions {
  isLogo?: boolean;
  isThumbnail?: boolean;
  maxWidth?: number;
  maxHeight?: number;
  quality?: number;
}

export const useImagePreloader = (options: UseImagePreloaderOptions = {}) => {
  const [preloadedImages, setPreloadedImages] = useState<Map<string, string>>(new Map());
  const [loadingImages, setLoadingImages] = useState<Set<string>>(new Set());

  const preloadImage = useCallback(async (originalUri: string) => {
    if (!originalUri || preloadedImages.has(originalUri) || loadingImages.has(originalUri)) {
      return;
    }

    try {
      setLoadingImages(prev => new Set(prev).add(originalUri));
      
      const urls = await generateOptimizedImageUrls(originalUri, options);
      
      // Preload the main image
      await new Promise<void>((resolve, reject) => {
        const img = new Image();
        img.onload = () => {
          setPreloadedImages(prev => new Map(prev).set(originalUri, urls.main));
          resolve();
        };
        img.onerror = () => {
          // Don't fail on error, just resolve
          resolve();
        };
        img.src = urls.main;
      });

    } catch (error) {
      console.warn('Failed to preload image:', originalUri, error);
    } finally {
      setLoadingImages(prev => {
        const newSet = new Set(prev);
        newSet.delete(originalUri);
        return newSet;
      });
    }
  }, [options, preloadedImages, loadingImages]);

  const preloadMultipleImages = useCallback(async (uris: string[]) => {
    const uniqueUris = uris.filter(uri => 
      uri && !preloadedImages.has(uri) && !loadingImages.has(uri)
    );

    if (uniqueUris.length === 0) return;

    // Preload images in parallel, but limit concurrency to avoid overwhelming the network
    const batchSize = 3; // Limit concurrent requests
    for (let i = 0; i < uniqueUris.length; i += batchSize) {
      const batch = uniqueUris.slice(i, i + batchSize);
      await Promise.all(batch.map(uri => preloadImage(uri)));
    }
  }, [preloadImage, preloadedImages, loadingImages]);

  const getOptimizedUrl = useCallback((originalUri: string) => {
    return preloadedImages.get(originalUri) || originalUri;
  }, [preloadedImages]);

  const isImagePreloaded = useCallback((originalUri: string) => {
    return preloadedImages.has(originalUri);
  }, [preloadedImages]);

  const isImageLoading = useCallback((originalUri: string) => {
    return loadingImages.has(originalUri);
  }, [loadingImages]);

  return {
    preloadImage,
    preloadMultipleImages,
    getOptimizedUrl,
    isImagePreloaded,
    isImageLoading,
    preloadedImages: preloadedImages.size,
    loadingImages: loadingImages.size,
  };
}; 