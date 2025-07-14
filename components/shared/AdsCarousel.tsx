import React, { useState, useMemo } from 'react';
import { View, Image, ImageBackground, StyleSheet, Dimensions } from 'react-native';
import Carousel from 'react-native-reanimated-carousel';
import { cdnUrl } from '../../consts/shared';
import CustomFastImage from '../custom-fast-image';
import { LinearGradient } from 'expo-linear-gradient';
import Text from '../controls/Text';
import themeStyle from '../../styles/theme.style';
const { width } = Dimensions.get('window');
const CARD_HEIGHT = 185;
const CARD_RADIUS = 16;

export type Ad = {
  id: string;
  background: string; // background image uri
  products: string[]; // array of product image uris
  title: string;
  subtitle: string;
};

type AdsCarouselProps = {
  ads: Ad[];
};

// Memoized ad item component
const AdItem = React.memo(({ item }: { item: Ad }) => {
  const backgroundUrl = useMemo(() => cdnUrl + item.background, [item.background]);
  
  return (
    <ImageBackground
      source={{ uri: backgroundUrl }}
      style={styles.card}
      imageStyle={{ borderRadius: CARD_RADIUS }}
      resizeMode="cover"
    >
      {/* Floating product images */}
      <View style={styles.productsRow}>
        {item.products.map((img, idx) => (
          <CustomFastImage
            key={img + idx}
            source={{ uri: cdnUrl + img }}
            style={styles.productImg}
            resizeMode="cover"
            cacheKey={img.split(/[\\/]/).pop()}
          />
        ))}
      </View>
      {/* Text overlay with gradient */}
      <LinearGradient
        colors={["#00000000", "#232323"]}
        start={{ x: 0.5, y: 0 }}
        end={{ x: 0.5, y: 1 }}
        style={styles.gradientOverlay}
      >
        <View style={styles.textOverlay}>
          <Text style={styles.title}>{item.title}</Text>
          <Text style={styles.subtitle}>{item.subtitle}</Text>
        </View>
      </LinearGradient>
    </ImageBackground>
  );
});

// Memoized pagination dots component
const PaginationDots = React.memo(({ ads, activeIndex }: { ads: Ad[]; activeIndex: number }) => (
  <View style={styles.dotsRow}>
    {ads.map((_, idx) => (
      <View
        key={idx}
        style={[
          styles.dot,
          activeIndex === idx && styles.dotActive,
        ]}
      />
    ))}
  </View>
));

const AdsCarousel: React.FC<AdsCarouselProps> = React.memo(({ ads }) => {
  const [activeIndex, setActiveIndex] = useState(0);

  // Memoized carousel width
  const carouselWidth = useMemo(() => width - 32, []);

  // Memoized render item function
  const renderItem = useMemo(() => ({ item }: { item: Ad }) => (
    <AdItem item={item} />
  ), []);

  // Memoized onSnapToItem handler
  const handleSnapToItem = useMemo(() => (index: number) => {
    setActiveIndex(index);
  }, []);

  if (!ads || ads.length === 0) {
    return null;
  }

  return (
    <View style={styles.carouselContainer}>
      <Carousel
        width={carouselWidth}
        height={CARD_HEIGHT}
        data={ads}
        autoPlay={true}
        scrollAnimationDuration={1000}
        autoPlayInterval={3000}
        onSnapToItem={handleSnapToItem}
        style={{ borderRadius: CARD_RADIUS }}
        renderItem={renderItem}
      />
      <PaginationDots ads={ads} activeIndex={activeIndex} />
    </View>
  );
});

const styles = StyleSheet.create({
  carouselContainer: {
    width: width,
    alignItems: 'center',
    marginTop: 8,
    marginBottom: 16,
  },
  card: {
    width: width - 32,
    height: CARD_HEIGHT,
    borderRadius: CARD_RADIUS,
    overflow: 'hidden',
    justifyContent: 'flex-end',
    padding: 16,
  },
  productsRow: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: CARD_HEIGHT - 40,
    flexDirection: 'row',
    justifyContent: 'space-evenly',
    alignItems: 'flex-start',
    zIndex: 2,
  },
  productImg: {
    width: 40,
    height: 40,
    marginHorizontal: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    backgroundColor: 'transparent',
  },
  gradientOverlay: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    height: 70,
    borderBottomLeftRadius: CARD_RADIUS,
    borderBottomRightRadius: CARD_RADIUS,
    justifyContent: 'flex-end',
    paddingHorizontal: 16,
    paddingBottom: 12,
    zIndex: 2,
  },
  textOverlay: {
    zIndex: 3,
  },
  title: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 22,
    marginBottom: 4,
    textShadowColor: 'rgba(0,0,0,0.4)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
  },
  subtitle: {
    color: 'white',
    fontSize: 16,
    textShadowColor: 'rgba(0,0,0,0.3)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  dotsRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 8,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: 'rgba(217, 217, 217, 1)',
    marginHorizontal: 3,
  },
  dotActive: {
    backgroundColor: themeStyle.SECONDARY_COLOR,
    width: 10,
    height: 10,
  },
});

export default AdsCarousel; 