import React, { useState } from 'react';
import { View, ActivityIndicator, StyleSheet } from 'react-native';
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
      <CustomFastImage
        source={source}
        style={[styles.image, style]}
        resizeMode={resizeMode}
        description={description}
        isLogo={isLogo}
        onLoadStart={handleLoadStart}
        onLoadEnd={handleLoadEnd}
        onError={handleError}
      />
      
      {showLoadingIndicator && isLoading && !hasError && (
        <View style={[styles.loadingContainer, { backgroundColor: 'rgba(255, 255, 255, 0.8)' }]}>
          <ActivityIndicator size="small" color={loadingColor} />
        </View>
      )}
      
      {hasError && (
        <View style={[styles.errorContainer, { backgroundColor: '#f5f5f5' }]}>
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
  loadingContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 10,
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