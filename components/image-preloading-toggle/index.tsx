import React, { useState, useEffect } from 'react';
import { View, Text, Switch, StyleSheet } from 'react-native';
import { useImagePreloader } from '../../hooks/use-image-preloader';
import themeStyle from '../../styles/theme.style';

interface ImagePreloadingToggleProps {
  style?: any;
}

const ImagePreloadingToggle: React.FC<ImagePreloadingToggleProps> = ({ style }) => {
  const [isEnabled, setIsEnabled] = useState(true);
  const { toggleImagePreloading, getImagePreloadingSetting } = useImagePreloader();

  useEffect(() => {
    // Load current setting on component mount
    const loadSetting = async () => {
      const setting = await getImagePreloadingSetting();
      setIsEnabled(setting);
    };
    loadSetting();
  }, [getImagePreloadingSetting]);

  const handleToggle = async (value: boolean) => {
    setIsEnabled(value);
    await toggleImagePreloading(value);
  };

  return (
    <View style={[styles.container, style]}>
      <View style={styles.textContainer}>
        <Text style={styles.title}>Preload Images</Text>
        <Text style={styles.description}>
          {isEnabled 
            ? 'Images will load before app starts (slower startup, smoother experience)'
            : 'Images will load as needed (faster startup, may show loading states)'
          }
        </Text>
      </View>
      <Switch
        value={isEnabled}
        onValueChange={handleToggle}
        trackColor={{ false: '#767577', true: themeStyle.PRIMARY_COLOR }}
        thumbColor={isEnabled ? '#fff' : '#f4f3f4'}
        ios_backgroundColor="#767577"
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  textContainer: {
    flex: 1,
    marginRight: 16,
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  description: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
  },
});

export default ImagePreloadingToggle; 