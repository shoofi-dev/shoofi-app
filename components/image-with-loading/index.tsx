import React, { useState } from 'react';
import { View, Image, StyleSheet, Platform } from 'react-native';
import CustomFastImage from '../custom-fast-image';
import themeStyle from '../../styles/theme.style';

interface ImageWithLoadingProps {
  source: { uri: string };
  style: any;
  resizeMode?: any;
  description?: string;
  isLogo?: boolean;
  showLoadingIndicator?: boolean;
  loadingColor?: string;
}

const ImageWithLoading: React.FC<ImageWithLoadingProps> = ({
  source,
  style,
  resizeMode = 'cover',
  description,
  isLogo = false,
  showLoadingIndicator = true,
  loadingColor = themeStyle.PRIMARY_COLOR
}) => {
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);

  const handleLoadStart = () => {
    setIsLoading(true);
    setHasError(false);
  };

  const handleLoadEnd = () => {
    setIsLoading(false);
  };

  const handleError = () => {
    setIsLoading(false);
    setHasError(true);
  };

  return (
    <View style={[styles.container, style]}>
      {/* Blurred background for loading state */}
      {isLoading && (
        <View style={styles.blurredBackground}>
          <Image
            source={source}
            style={[styles.image, style]}
            resizeMode={resizeMode}
            blurRadius={Platform.OS === 'ios' ? 10 : 5}
            accessibilityLabel={description}
          />
        </View>
      )}
      
      <CustomFastImage
        source={source}
        style={[styles.image, style, { zIndex: 3 }]}
        resizeMode={resizeMode}
        description={description}
        isLogo={isLogo}
        onLoadStart={handleLoadStart}
        onLoadEnd={handleLoadEnd}
        onError={handleError}
      />
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
    zIndex: 10,
  },
  errorPlaceholder: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#e0e0e0',
  },
});

export default ImageWithLoading; 