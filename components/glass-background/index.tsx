import React from 'react';
import {
  View,
  Platform,
  StyleSheet,
  StyleProp,
  ViewStyle,
} from 'react-native';
import { BlurView } from '@react-native-community/blur';

type GlassBGProps = {
  children: React.ReactNode;
  style?: StyleProp<ViewStyle>;
  blurAmount?: number;
  borderRadius?: number;
  intensity?: 'light' | 'medium' | 'heavy';
  tint?: 'white' | 'black' | 'none';
};

const GlassBG: React.FC<GlassBGProps> = ({
  children,
  style,
  blurAmount = 0,
  borderRadius = 30,
  intensity = 'medium',
  tint = 'white',
}) => {
  const isAndroid = Platform.OS === 'android';
  const isBlurSupported = !isAndroid || Number(Platform.Version) >= 31;

  // Intensity configurations
  const intensityConfigs = {
    light: {
      backgroundColor: 'rgba(255, 255, 255, 0.08)',
      borderColor: 'rgba(255, 255, 255, 0.12)',
      shadowOpacity: 0.06,
      elevation: 4,
    },
    medium: {
      backgroundColor: 'rgba(0, 0, 0, 0.2)',
      borderColor: 'rgb(141, 141, 141)',
      shadowOpacity: 0.1,
      elevation: 8,
    },
    heavy: {
      backgroundColor: 'rgba(255, 255, 255, 0.18)',
      borderColor: 'rgba(255, 255, 255, 0.25)',
      shadowOpacity: 0.15,
      elevation: 12,
    },
  };

  // Tint configurations
  const tintConfigs = {
    white: {
      backgroundColor: intensityConfigs[intensity].backgroundColor,
      borderColor: intensityConfigs[intensity].borderColor,
    },
    black: {
      backgroundColor: 'rgba(0, 0, 0, 0.12)',
      borderColor: 'rgba(242, 32, 32, 0.08)',
    },
    none: {
      backgroundColor: 'rgba(255, 255, 255, 0.08)',
      borderColor: 'rgba(255, 255, 255, 0.12)',
    },
  };

  const config = tintConfigs[tint];

  return (
    <View style={[styles.container, { borderRadius, overflow: 'hidden' }, style]}>
      {/* Blur effect layer */}
      {isBlurSupported && (
        <BlurView
          style={StyleSheet.absoluteFill}
          blurType={tint === 'black' ? 'dark' : 'light'}
          blurAmount={blurAmount}
          reducedTransparencyFallbackColor="rgba(255, 255, 255, 0.1)"
        />
      )}

      {/* Primary glass layer */}
      <View
        style={[
          StyleSheet.absoluteFill,
          {
            backgroundColor: config.backgroundColor,
            borderWidth: 1,
            borderColor: config.borderColor,
            borderRadius,
          },
        ]}
      />

      {/* Inner highlight layer for liquid effect */}
  

      {/* Outer shadow layer for depth */}


      {/* Content */}
        {children}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'relative',
    backgroundColor: 'transparent',
  },
  innerHighlight: {
    position: 'absolute',
    top: 1,
    left: 1,
    right: 1,
    bottom: 1,
    zIndex: 1,
  },
  outerShadow: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowRadius: 24,
    zIndex: -1,
  },
  contentContainer: {
    zIndex: 2,
    width: '100%',
  },
});

export default GlassBG;
