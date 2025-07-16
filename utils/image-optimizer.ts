import NetInfo from '@react-native-community/netinfo';

export interface ImageOptimizationConfig {
  isLogo?: boolean;
  isThumbnail?: boolean;
  maxWidth?: number;
  maxHeight?: number;
  quality?: number;
}

export interface OptimizedImageUrls {
  main: string;
  thumbnail: string;
  placeholder: string;
}

// Network-aware quality settings
const NETWORK_QUALITY = {
  wifi: { quality: 75, maxWidth: 500, maxHeight: 500 },
  cellular: { quality: 50, maxWidth: 300, maxHeight: 300 },
  unknown: { quality: 60, maxWidth: 400, maxHeight: 400 }
};

// Image type specific settings
const IMAGE_TYPE_SETTINGS = {
  logo: { quality: 80, maxWidth: 150, maxHeight: 150 },
  thumbnail: { quality: 60, maxWidth: 200, maxHeight: 200 },
  regular: { quality: 70, maxWidth: 400, maxHeight: 400 }
};

/**
 * Generate optimized image URLs based on network type and image configuration
 */
export async function generateOptimizedImageUrls(
  originalUri: string,
  config: ImageOptimizationConfig = {}
): Promise<OptimizedImageUrls> {
  if (!originalUri) {
    return { main: '', thumbnail: '', placeholder: '' };
  }

  // Get current network type
  const netInfo = await NetInfo.fetch();
  const networkType = netInfo.type === 'wifi' ? 'wifi' : 
                     netInfo.type === 'cellular' ? 'cellular' : 'unknown';

  // Get base imgix URL
  const baseUrl = getImgixBaseUrl(originalUri);
  
  // Determine optimal settings based on network and image type
  const networkSettings = NETWORK_QUALITY[networkType];
  const typeSettings = config.isLogo ? IMAGE_TYPE_SETTINGS.logo :
                      config.isThumbnail ? IMAGE_TYPE_SETTINGS.thumbnail :
                      IMAGE_TYPE_SETTINGS.regular;

  // Merge settings with config overrides
  const finalSettings = {
    quality: config.quality ?? Math.min(networkSettings.quality, typeSettings.quality),
    maxWidth: config.maxWidth ?? Math.min(networkSettings.maxWidth, typeSettings.maxWidth),
    maxHeight: config.maxHeight ?? Math.min(networkSettings.maxHeight, typeSettings.maxHeight)
  };

  // Generate main image URL
  const mainParams = [
    `w=${finalSettings.maxWidth}`,
    `h=${finalSettings.maxHeight}`,
    'auto=format',
    'fit=max',
    `q=${finalSettings.quality}`,
    'fm=webp',
    'dpr=1'
  ];

  // Generate thumbnail URL (very small, low quality for fast loading)
  const thumbnailParams = [
    'w=50',
    'h=50',
    'blur=20',
    'q=30',
    'fm=webp',
    'dpr=1'
  ];

  // Generate placeholder URL (tiny, very low quality)
  const placeholderParams = [
    'w=20',
    'h=20',
    'blur=50',
    'q=10',
    'fm=webp',
    'dpr=1'
  ];

  return {
    main: `${baseUrl}?${mainParams.join('&')}`,
    thumbnail: `${baseUrl}?${thumbnailParams.join('&')}`,
    placeholder: `${baseUrl}?${placeholderParams.join('&')}`
  };
}

/**
 * Get imgix base URL from original URI
 */
function getImgixBaseUrl(uri: string): string {
  // If already imgix URL, return as is
  if (uri.startsWith('https://shoofi.imgix.net/')) {
    return uri.split('?')[0]; // Remove existing query params
  }

  // Clean URI and create imgix URL
  let cleanUri = uri.replace(/^https?:\/\//, '').replace(/^shoofi.imgix.net\//, '');
  cleanUri = cleanUri.replace(/^shoofi-spaces\.fra1\.cdn\.digitaloceanspaces\.com\//, '');
  
  return `https://shoofi.imgix.net/${cleanUri}`;
}

/**
 * Preload images for better performance
 */
export async function preloadImages(urls: string[]): Promise<void> {
  const preloadPromises = urls.map(url => {
    return new Promise<void>((resolve) => {
      const img = new Image();
      img.onload = () => resolve();
      img.onerror = () => resolve(); // Don't fail on error
      img.src = url;
    });
  });

  await Promise.all(preloadPromises);
}

/**
 * Get optimal image dimensions based on container size and network
 */
export async function getOptimalDimensions(
  containerWidth: number,
  containerHeight: number,
  config: ImageOptimizationConfig = {}
): Promise<{ width: number; height: number }> {
  const netInfo = await NetInfo.fetch();
  const networkType = netInfo.type === 'wifi' ? 'wifi' : 
                     netInfo.type === 'cellular' ? 'cellular' : 'unknown';

  const networkSettings = NETWORK_QUALITY[networkType];
  const typeSettings = config.isLogo ? IMAGE_TYPE_SETTINGS.logo :
                      config.isThumbnail ? IMAGE_TYPE_SETTINGS.thumbnail :
                      IMAGE_TYPE_SETTINGS.regular;

  const maxWidth = Math.min(networkSettings.maxWidth, typeSettings.maxWidth);
  const maxHeight = Math.min(networkSettings.maxHeight, typeSettings.maxHeight);

  // Calculate optimal dimensions maintaining aspect ratio
  const aspectRatio = containerWidth / containerHeight;
  
  let optimalWidth = Math.min(containerWidth, maxWidth);
  let optimalHeight = optimalWidth / aspectRatio;

  if (optimalHeight > maxHeight) {
    optimalHeight = maxHeight;
    optimalWidth = optimalHeight * aspectRatio;
  }

  return {
    width: Math.round(optimalWidth),
    height: Math.round(optimalHeight)
  };
}

/**
 * Check if image should be cached based on network type
 */
export async function shouldCacheImage(): Promise<boolean> {
  const netInfo = await NetInfo.fetch();
  // Cache more aggressively on cellular networks
  return netInfo.type === 'cellular';
} 