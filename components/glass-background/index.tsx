import React from 'react';
import {
  View,
  Platform,
  StyleSheet,
  StyleProp,
  ViewStyle,
} from 'react-native';
import { BlurView } from '@react-native-community/blur';

type GGlassBGProps = {
  children: React.ReactNode;
  style?: StyleProp<ViewStyle>;
  blurAmount?: number;
  borderRadius?: number;
};

const GlassBG: React.FC<GGlassBGProps> = ({
  children,
  style,
  blurAmount = 0,
  borderRadius = 0,
}) => {
  const isAndroid = Platform.OS === 'android';
  const isBlurSupported = !isAndroid || Number(Platform.Version) >= 31;

  return (
    <View style={[styles.container, { borderRadius, overflow: 'hidden' }, style]}>
       {isBlurSupported && (
        <BlurView
          style={StyleSheet.absoluteFill}
          blurType="light"
          blurAmount={blurAmount}
          reducedTransparencyFallbackColor="rgba(0, 0, 0, 0.3)"
        />
      )} 
      
      {/* Glassmorphism: semi-transparent white overlay for glass effect */}
      <View
        style={[
          StyleSheet.absoluteFill,
          {
            backgroundColor: 'rgba(0, 0, 0, 0.20)', // lower opacity for better glass effect
            // backgroundColor: 'rgba(43, 41, 41, 0.18)', // lower opacity for better glass effect
            borderWidth: 1,
            borderColor: 'rgba(162, 162, 162, 0.18)',
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 4 },
            shadowOpacity: 0.08,
            shadowRadius: 16,
            elevation: 8,
          },
        ]}
      />

      {children}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'relative',
  },
});

export default GlassBG;
