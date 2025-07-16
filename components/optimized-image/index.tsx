import React, { useState, useEffect, useRef } from 'react';
import { View, Image, ActivityIndicator, StyleSheet, Platform } from 'react-native';
import NetInfo from '@react-native-community/netinfo';
import themeStyle from '../../styles/theme.style';

interface OptimizedImageProps {
  source: { uri: string };
  style: any;
  resizeMode?: any;
  isLogo?: boolean;
  isThumbnail?: boolean;
  onLoadStart?: () => void;
  onLoadEnd?: () => void;
  onError?: () => void;
  description?: string;
}

const OptimizedImage: React.FC<OptimizedImageProps> = ({
  source,
  style,
  resizeMode = 'cover',
  isLogo = false,
  isThumbnail = false,
  onLoadStart,
  onLoadEnd,
  onError,
  description
}) => {
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);
  const [networkType, setNetworkType] = useState<'wifi' | 'cellular' | 'unknown'>('unknown');
  const [optimizedUri, setOptimizedUri] = useState('');
  const [thumbnailUri, setThumbnailUri] = useState('');
  const [showThumbnail, setShowThumbnail] = useState(true);
  const isMounted = useRef(true);

  // Get network information for adaptive quality
  useEffect(() => {
    const unsubscribe = NetInfo.addEventListener(state => {
      if (state.type === 'wifi') {
        setNetworkType('wifi');
      } else if (state.type === 'cellular') {
        setNetworkType('cellular');
      } else {
        setNetworkType('unknown');
      }
    });

    return () => unsubscribe();
  }, []);

  // Generate optimized URLs based on network type and image type
  const generateOptimizedUrls = (uri: string) => {
    if (!uri) return { main: '', thumbnail: '' };

    // Base imgix URL
    let cleanUri = uri.replace(/^https?:\/\//, '').replace(/^shoofi.imgix.net\//, '');
    cleanUri = cleanUri.replace(/^shoofi-spaces\.fra1\.cdn\.digitaloceanspaces\.com\//, '');
    const baseUrl = `https://shoofi.imgix.net/${cleanUri}`;

    // Determine quality based on network type and image type
    let quality = 75;
    let maxWidth = 400;
    let maxHeight = 400;

    if (networkType === 'cellular') {
      quality = 50; // Lower quality for cellular
      maxWidth = 300;
      maxHeight = 300;
    } else if (networkType === 'wifi') {
      quality = 75; // Higher quality for WiFi
      maxWidth = 500;
      maxHeight = 500;
    }

    if (isLogo) {
      maxWidth = 150;
      maxHeight = 150;
      quality = 80; // Higher quality for logos
    } else if (isThumbnail) {
      maxWidth = 200;
      maxHeight = 200;
      quality = 60;
    }

    // Get dimensions from style
    const { width, height } = getDimensionsFromStyle(style);
    const finalWidth = Math.min(width || maxWidth, maxWidth);
    const finalHeight = Math.min(height || maxHeight, maxHeight);

    // Main image parameters
    const mainParams = [
      `w=${Math.round(finalWidth)}`,
      `h=${Math.round(finalHeight)}`,
      'auto=format',
      'fit=max',
      `q=${quality}`,
      'fm=webp',
      'dpr=1'
    ];

    // Thumbnail parameters (very small, low quality for fast loading)
    const thumbnailParams = [
      'w=50',
      'h=50',
      'blur=20',
      'q=30',
      'fm=webp',
      'dpr=1'
    ];

    return {
      main: `${baseUrl}?${mainParams.join('&')}`,
      thumbnail: `${baseUrl}?${thumbnailParams.join('&')}`
    };
  };

  const getDimensionsFromStyle = (style: any) => {
    if (!style) return {};
    if (Array.isArray(style)) {
      style = Object.assign({}, ...style);
    }
    const width = typeof style.width === 'number' ? style.width : undefined;
    const height = typeof style.height === 'number' ? style.height : undefined;
    return { width, height };
  };

  useEffect(() => {
    const urls = generateOptimizedUrls(source.uri);
    setOptimizedUri(urls.main);
    setThumbnailUri(urls.thumbnail);
    setIsLoading(true);
    setHasError(false);
    setShowThumbnail(true);
  }, [source.uri, networkType, isLogo, isThumbnail, style]);

  useEffect(() => {
    return () => {
      isMounted.current = false;
    };
  }, []);

  const handleLoadStart = () => {
    setIsLoading(true);
    onLoadStart?.();
  };

  const handleLoadEnd = () => {
    if (isMounted.current) {
      setIsLoading(false);
      setShowThumbnail(false);
      onLoadEnd?.();
    }
  };

  const handleError = () => {
    if (isMounted.current) {
      setIsLoading(false);
      setHasError(true);
      setShowThumbnail(false);
      onError?.();
    }
  };

  return (
    <View style={[styles.container, style]}>
      {/* Blurred background for loading state */}
      {isLoading && thumbnailUri && (
        <View style={styles.blurredBackground}>
          <Image
            source={{ uri: thumbnailUri }}
            style={[styles.image, style]}
            resizeMode={resizeMode}
            blurRadius={Platform.OS === 'ios' ? 10 : 5}
            accessibilityLabel={description}
          />
        </View>
      )}

      {/* Main optimized image */}
      {optimizedUri && (
        <Image
          source={{ uri: optimizedUri }}
          style={[styles.image, style, { zIndex: 3 }]}
          resizeMode={resizeMode}
          onLoadStart={handleLoadStart}
          onLoad={handleLoadEnd}
          onError={handleError}
          accessibilityLabel={description}
        />
      )}

      {/* Error placeholder */}
      {hasError && (
        <View style={styles.errorContainer}>
          <View style={styles.errorPlaceholder} />
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'relative',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  thumbnail: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 1,
  },
  blurredBackground: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 1,
    backgroundColor: '#f5f5f5',
  },
  errorContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
    zIndex: 4,
  },
  errorPlaceholder: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#e0e0e0',
  },
});

export default OptimizedImage; 