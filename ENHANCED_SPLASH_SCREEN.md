# Enhanced Splash Screen with Image Preloading

## Overview

The enhanced splash screen system ensures that critical images are fully loaded before the app becomes interactive, providing a smoother user experience and preventing layout shifts.

## Features

### 1. Image Preloading Hook (`useImagePreloader`)

**Location**: `hooks/use-image-preloader.ts`

**Purpose**: Manages the preloading of critical images with progress tracking.

**Key Features**:
- Preloads images using `Image.prefetch()`
- Tracks loading progress (0-100%)
- Handles loading errors gracefully
- Provides detailed results for each image

**Usage**:
```typescript
const {
  isPreloading,
  preloadProgress,
  preloadResults,
  isComplete,
  preloadImages,
  reset
} = useImagePreloader();

// Preload critical images
await preloadImages([
  { uri: 'image1.jpg', key: 'image1' },
  { uri: 'image2.jpg', key: 'image2' }
]);
```

### 2. Critical Images Detection

**Function**: `getCriticalImages(storeData, categories, ads)`

**Purpose**: Automatically identifies images that should be preloaded.

**Images Included**:
- Store logo
- Store cover sliders (up to 10)
- Category images (first 10 categories)
- Ad images (first 5 ads)

### 3. Enhanced Splash Screen

**Location**: `App.tsx`

**Features**:
- Shows until all critical images are loaded
- Displays loading progress with percentage
- Progress bar with smooth animation
- Graceful fallback if image loading fails

**Visual Elements**:
- Lottie animation (existing)
- Progress indicator with percentage
- Progress bar with theme colors
- Semi-transparent background

### 4. Image Loading Component

**Location**: `components/image-with-loading/index.tsx`

**Purpose**: Provides loading states for individual images throughout the app.

**Features**:
- Loading spinner while image loads
- Error placeholder if image fails to load
- Smooth transitions
- Customizable loading colors

### 5. Image Preloading Toggle

**Location**: `components/image-preloading-toggle/index.tsx`

**Purpose**: Allows users to enable/disable image preloading for faster app startup.

**Features**:
- Toggle switch to enable/disable preloading
- Persistent setting stored in AsyncStorage
- Clear description of trade-offs
- Immediate effect on next app launch

**Usage**:
```typescript
import ImageWithLoading from '../components/image-with-loading';

<ImageWithLoading
  source={{ uri: imageUrl }}
  style={imageStyle}
  showLoadingIndicator={true}
  loadingColor={themeStyle.PRIMARY_COLOR}
/>
```

## Implementation Details

### App.tsx Changes

1. **Import the hook**:
```typescript
import { useImagePreloader, getCriticalImages } from "./hooks/use-image-preloader";
```

2. **Initialize the hook**:
```typescript
const {
  isPreloading,
  preloadProgress,
  preloadResults,
  isComplete: imagesComplete,
  preloadImages,
  reset: resetImagePreloader
} = useImagePreloader();
```

3. **Update splash screen condition**:
```typescript
const shouldShowSplash = !appIsReady || !imagesComplete || isPreloading;
```

4. **Add progress indicator**:
```typescript
{isPreloading && (
  <View style={progressContainerStyle}>
    <Text>Loading images... {Math.round(preloadProgress)}%</Text>
    <View style={progressBarStyle}>
      <View style={[progressFillStyle, { width: `${preloadProgress}%` }]} />
    </View>
  </View>
)}
```

### Image Preloading Process

1. **Data Loading**: App loads store data, categories, and other essential data
2. **Image Identification**: `getCriticalImages()` identifies images to preload
3. **Preloading**: `preloadImages()` loads each image with progress tracking
4. **Completion**: App becomes ready after all images are loaded

### Error Handling

- **Network Errors**: Images that fail to load are logged but don't prevent app startup
- **Missing Images**: App continues even if some images are missing
- **Timeout**: App has a fallback timeout to prevent infinite loading

## Configuration

### Customizing Critical Images

To modify which images are considered critical, update the `getCriticalImages` function:

```typescript
export const getCriticalImages = (storeData: any, categories: any[], ads: any[]) => {
  const images: ImageToPreload[] = [];
  
  // Add your custom logic here
  // Example: Add product images
  if (products) {
    products.slice(0, 5).forEach((product: any) => {
      if (product?.image?.uri) {
        images.push({ uri: product.image.uri, key: `product-${product._id}` });
      }
    });
  }
  
  return images;
};
```

### Adjusting Preload Settings

In `useImagePreloader.ts`:

```typescript
// Change delay between images (default: 50ms)
await new Promise(resolve => setTimeout(resolve, 50));

// Change progress calculation
const progress = ((i + 1) / images.length) * 100;
```

## Performance Considerations

### Memory Management

- Images are preloaded using `Image.prefetch()` which handles caching
- Progress tracking is cleaned up after completion
- Hook can be reset if needed

### Network Optimization

- **Parallel Loading**: Images are loaded in batches of 8 simultaneously for faster loading
- **Reduced Image Sizes**: Optimized image dimensions and quality (q=75) for faster download
- **Smart Timeouts**: 5-second timeout per image to prevent hanging
- **Minimal Delays**: Only 5ms delay between batches to show progress
- **Reduced Image Count**: Limited to essential images only (2-3 per category)

### Speed Optimizations

- **Batch Processing**: Load 8 images at once instead of sequentially
- **Reduced Image Quality**: 75% quality for faster loading while maintaining good appearance
- **Smaller Dimensions**: Reduced image sizes (300x300 for logos, 800x450 for others)
- **Skip Option**: Users can disable preloading for instant app startup
- **Faster Timeouts**: 5-second timeout instead of 10 seconds

### User Experience

- Splash screen shows meaningful progress
- App doesn't become interactive until images are ready
- Smooth transitions between loading and ready states

## Testing

### Manual Testing

1. **Slow Network**: Test with slow network to see progress indicator
2. **No Network**: Test offline to see error handling
3. **Many Images**: Test with many categories/ads to see loading time
4. **Image Failures**: Test with broken image URLs

### Debugging

Enable debug logging in `useImagePreloader.ts`:

```typescript
```

## Future Enhancements

### Potential Improvements

1. **Background Preloading**: Preload images in background after app is ready
2. **Smart Caching**: Implement more sophisticated caching strategies
3. **Progressive Loading**: Load low-res images first, then high-res
4. **User Preferences**: Allow users to skip image preloading
5. **Analytics**: Track image loading performance

### Integration Opportunities

1. **Offline Support**: Cache images for offline viewing
2. **Image Optimization**: Integrate with image optimization services
3. **CDN Integration**: Better integration with CDN for faster loading
4. **A/B Testing**: Test different preloading strategies

## Troubleshooting

### Common Issues

1. **Splash Screen Stuck**: Check if `imagesComplete` is being set correctly
2. **Progress Not Updating**: Verify `preloadProgress` state updates
3. **Images Not Loading**: Check network connectivity and image URLs
4. **Performance Issues**: Reduce number of critical images or increase delay

### Debug Commands

```typescript
// Check preload results

// Check critical images
const criticalImages = getCriticalImages(storeData, categories, ads);

// Reset preloader if needed
resetImagePreloader();
```

## Conclusion

The enhanced splash screen system provides a professional user experience by ensuring all critical images are loaded before the app becomes interactive. The system is robust, handles errors gracefully, and provides clear feedback to users during the loading process. 