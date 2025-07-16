import React, { useEffect, useRef, useState, useMemo } from "react";
import { Alert, Image, View, ActivityIndicator, Animated, Easing, Platform } from "react-native";
import * as FileSystem from "expo-file-system";

export function getImgXtension(uri) {
  var basename = uri.split(/[\\/]/).pop();
  return /[.]/.exec(basename) ? /[^.]+$/.exec(basename) : undefined;
}

export async function findImageInCache(uri) {
  try {
    let info = await FileSystem.getInfoAsync(uri);
    return { ...info, err: false };
  } catch (error) {
    return {
      exists: false,
      err: true,
      msg: error,
    };
  }
}

export async function cacheImage(uri, cacheUri, callback) {
  try {
    const downloadImage = FileSystem.createDownloadResumable(
      uri,
      cacheUri,
      {},
      callback
    );

    const downloaded = await downloadImage.downloadAsync();

    return {
      cached: true,
      err: false,
      path: downloaded.uri,
    };
  } catch (error) {

    return {
      cached: false,
      err: true,
      msg: error,
    };
  }
}

// Helper to get width/height from style prop
function getDimensionsFromStyle(style) {
  if (!style) return {};
  if (Array.isArray(style)) {
    // Merge all style objects
    style = Object.assign({}, ...style);
  }
  const width = typeof style.width === 'number' ? style.width : undefined;
  const height = typeof style.height === 'number' ? style.height : undefined;
  return { width, height };
}

// Optimized imgix URL generation for mobile networks
function getImgixUrl(uri, style, isLogo=false, isThumbnail=false) {
  // Only rewrite if not already an imgix url
  if (!uri) return uri;
  if (uri.startsWith('https://shoofi.imgix.net/')) return uri;
  
  // Remove any leading slashes
  let cleanUri = uri.replace(/^https?:\/\//, '').replace(/^shoofi.imgix.net\//, '');
  // Remove DigitalOcean Spaces domain if present
  cleanUri = cleanUri.replace(/^shoofi-spaces\.fra1\.cdn\.digitaloceanspaces\.com\//, '');
  
  let url = `https://shoofi.imgix.net/${cleanUri}`;
  const { width, height } = getDimensionsFromStyle(style);
  
  // Optimize dimensions for mobile networks
  let optimizedWidth, optimizedHeight;
  
  if (isLogo) {
    // Logos: very small, high quality
    optimizedWidth = Math.min(300, 150);
    optimizedHeight = Math.min(300, 150);
  } else if (isThumbnail) {
    // Thumbnails: small, medium quality
    optimizedWidth = Math.min(width || 200, 200);
    optimizedHeight = Math.min(height || 200, 200);
  } else {
    // Regular images: moderate size, optimized quality
    optimizedWidth = Math.min(width || 600, 600);
    optimizedHeight = Math.min(height || 400, 400);
  }
  
  // Build optimized query parameters for mobile networks
  const params = [
    `w=${Math.round(optimizedWidth)}`,
    `h=${Math.round(optimizedHeight)}`,
    'auto=format', // Automatic format selection (WebP for supported browsers)
    'fit=max', // Maintain aspect ratio
    'q=60', // Reduced quality for faster loading (was 75)
    'fm=webp', // Force WebP format for smaller file sizes
    'dpr=1', // Device pixel ratio - use 1 for mobile optimization
  ];
  
  return `${url}?${params.join('&')}`;
}

// Generate thumbnail URL for progressive loading
function getThumbnailUrl(uri, style, isLogo=false) {
  if (!uri) return uri;
  if (uri.startsWith('https://shoofi.imgix.net/')) {
    // If already imgix URL, add thumbnail parameters
    const separator = uri.includes('?') ? '&' : '?';
    return `${uri}${separator}w=50&h=50&blur=20&q=30&fm=webp`;
  }
  
  // For non-imgix URLs, create thumbnail version
  let cleanUri = uri.replace(/^https?:\/\//, '').replace(/^shoofi.imgix.net\//, '');
  cleanUri = cleanUri.replace(/^shoofi-spaces\.fra1\.cdn\.digitaloceanspaces\.com\//, '');
  
  return `https://shoofi.imgix.net/${cleanUri}?w=50&h=50&blur=20&q=30&fm=webp`;
}

const CustomFastImage = (props) => {
  const {
    source: { uri },
    cacheKey,
    style,
    resizeMode,
    description,
    isLogo=false,
    onLoadStart,
    onLoadEnd,
    onError
  } = props;
  const isMounted = useRef(true);
  const [imgUri, setUri] = useState("");
  const [thumbnailUri, setThumbnailUri] = useState("");
  const [loaded, setLoaded] = useState(false);
  const [showThumbnail, setShowThumbnail] = useState(true);

  // Determine if this is a thumbnail based on size
  const isThumbnail = useMemo(() => {
    const { width, height } = getDimensionsFromStyle(style);
    return (width && width <= 100) || (height && height <= 100);
  }, [style]);

  useEffect(() => {
    setLoaded(false);
    setShowThumbnail(true);
  }, [imgUri]);

  useEffect(() => {
    async function loadImg() {
      let imgXt = getImgXtension(uri);
      if (!imgXt || !imgXt.length) {
        return;
      }
      
      // Generate optimized URLs
      const optimizedUrl = getImgixUrl(uri, style, isLogo, isThumbnail);
      const thumbUrl = getThumbnailUrl(uri, style, isLogo);
      
      setUri(optimizedUrl);
      setThumbnailUri(thumbUrl);
    }
    loadImg();
    return () => { isMounted.current = false; };
  }, [uri, style, isLogo, isThumbnail]);

  const handleMainImageLoad = () => {
    setLoaded(true);
    setShowThumbnail(false);
    onLoadEnd?.();
  };

  const handleMainImageError = () => {
    setLoaded(true);
    setShowThumbnail(false);
    onError?.();
  };

  return (
    <View style={{ position: 'relative', ...style }}>
      {/* Blurred thumbnail for progressive loading */}
      {thumbnailUri && showThumbnail && (
        <Image
          source={{ uri: thumbnailUri }}
          style={[style, { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, zIndex: 1 }]}
          resizeMode={resizeMode}
          blurRadius={Platform.OS === 'ios' ? 8 : 3}
          accessibilityLabel={description}
        />
      )}
      
      {/* Main optimized image */}
      {imgUri ? (
        <Image
          source={{ uri: imgUri }}
          style={[style, { zIndex: 3 }]}
          resizeMode={resizeMode}
          onLoadStart={onLoadStart}
          onLoad={handleMainImageLoad}
          onError={handleMainImageError}
          accessibilityLabel={description}
        />
      ) : null}
    </View>
  );
};
export default CustomFastImage;