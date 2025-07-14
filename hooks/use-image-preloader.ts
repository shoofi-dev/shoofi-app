import { useState, useEffect, useCallback } from 'react';
import { Image } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { cdnUrl } from '../consts/shared';

interface ImageToPreload {
  uri: string;
  key: string;
}

interface PreloadResult {
  key: string;
  success: boolean;
  error?: string;
}

export const useImagePreloader = () => {
  const [isPreloading, setIsPreloading] = useState(false);
  const [preloadProgress, setPreloadProgress] = useState(0);
  const [preloadResults, setPreloadResults] = useState<PreloadResult[]>([]);
  const [isComplete, setIsComplete] = useState(false);

  const preloadImage = useCallback((uri: string): Promise<PreloadResult> => {
    return new Promise((resolve) => {
      if (!uri) {
        resolve({ key: uri, success: false, error: 'No URI provided' });
        return;
      }

      const fullUri = uri.startsWith('http') ? uri : `${cdnUrl}${uri}`;
      
      // Add timeout to prevent hanging
      const timeout = setTimeout(() => {
        resolve({ key: uri, success: false, error: 'Timeout' });
      }, 5000); // Reduced from 10s to 5s for faster timeout
      
      Image.prefetch(fullUri)
        .then(() => {
          clearTimeout(timeout);
          resolve({ key: uri, success: true });
        })
        .catch((error) => {
          clearTimeout(timeout);
          console.warn(`Failed to preload image: ${fullUri}`, error);
          resolve({ key: uri, success: false, error: error.message });
        });
    });
  }, []);

  const preloadImages = useCallback(async (images: ImageToPreload[]) => {
    if (images.length === 0) {
      setIsComplete(true);
      return;
    }

    setIsPreloading(true);
    setPreloadProgress(0);
    setPreloadResults([]);

    try {
      // Load images in parallel batches for faster loading
      const batchSize = 8; // Increased from 5 to 8 for faster loading
      const results: PreloadResult[] = [];
      
      for (let i = 0; i < images.length; i += batchSize) {
        const batch = images.slice(i, i + batchSize);
        
        // Load batch in parallel
        const batchPromises = batch.map(image => preloadImage(image.uri));
        const batchResults = await Promise.allSettled(batchPromises);
        
        // Process batch results
        batchResults.forEach((result, index) => {
          if (result.status === 'fulfilled') {
            results.push(result.value);
          } else {
            results.push({ key: batch[index].uri, success: false, error: 'Promise rejected' });
          }
        });
        
        // Update progress
        const progress = Math.min(((i + batch.length) / images.length) * 100, 100);
        setPreloadProgress(progress);
        setPreloadResults([...results]);
        
        // Minimal delay between batches to show progress
        if (i + batchSize < images.length) {
          await new Promise(resolve => setTimeout(resolve, 5)); // Reduced from 10ms to 5ms
        }
      }

      setIsPreloading(false);
      setIsComplete(true);
      
      // Log results
      const successCount = results.filter(r => r.success).length;
      console.log(`Image preloading complete: ${successCount}/${images.length} images loaded successfully`);
      
    } catch (error) {
      console.error('Error during image preloading:', error);
      setIsPreloading(false);
      setIsComplete(true);
    }
  }, [preloadImage]);

  const reset = useCallback(() => {
    setIsPreloading(false);
    setPreloadProgress(0);
    setPreloadResults([]);
    setIsComplete(false);
  }, []);

  // Function to toggle image preloading setting
  const toggleImagePreloading = useCallback(async (enabled: boolean) => {
    try {
      await AsyncStorage.setItem('@skip_image_preloading', (!enabled).toString());
      console.log(`Image preloading ${enabled ? 'enabled' : 'disabled'}`);
    } catch (error) {
      console.error('Error toggling image preloading setting:', error);
    }
  }, []);

  // Function to get current image preloading setting
  const getImagePreloadingSetting = useCallback(async (): Promise<boolean> => {
    try {
      const skipImagePreloading = await AsyncStorage.getItem('@skip_image_preloading');
      return skipImagePreloading !== 'true';
    } catch (error) {
      console.error('Error getting image preloading setting:', error);
      return true; // Default to enabled
    }
  }, []);

  return {
    isPreloading,
    preloadProgress,
    preloadResults,
    isComplete,
    preloadImages,
    reset,
    toggleImagePreloading,
    getImagePreloadingSetting
  };
};

// Helper function to get critical images that should be preloaded
export const getCriticalImages = (storeData: any, categories: any[], ads: any[]) => {
  const images: ImageToPreload[] = [];

  // Store logo and cover images (limit to first 2 for speed)
  if (storeData?.storeLogo?.uri) {
    images.push({ uri: storeData.storeLogo.uri, key: 'store-logo' });
  }
  
  if (storeData?.cover_sliders) {
    storeData.cover_sliders.slice(0, 2).forEach((slider: any, index: number) => {
      if (slider?.uri) {
        images.push({ uri: slider.uri, key: `store-cover-${index}` });
      }
    });
  }

  // Category images (limit to first 3 for speed)
  if (categories) {
    categories.slice(0, 3).forEach((category: any) => {
      if (category?.img?.[0]?.uri) {
        images.push({ uri: category.img[0].uri, key: `category-${category._id}` });
      }
    });
  }

  // Ad images (limit to first 2 for speed)
  if (ads) {
    ads.slice(0, 2).forEach((ad: any) => {
      if (ad?.image?.uri) {
        images.push({ uri: ad.image.uri, key: `ad-${ad._id}` });
      }
    });
  }

  return images;
}; 