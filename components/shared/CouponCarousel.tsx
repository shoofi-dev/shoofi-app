import React, { useState, useMemo, useContext, useCallback } from "react";
import {
  View,
  Image,
  ImageBackground,
  StyleSheet,
  Dimensions,
  TouchableOpacity,
  Alert,
  ScrollView,
} from "react-native";
import { cdnUrl } from "../../consts/shared";
import CustomFastImage from "../custom-fast-image";
import { LinearGradient } from "expo-linear-gradient";
import Text from "../controls/Text";
import themeStyle from "../../styles/theme.style";
import { StoreContext } from "../../stores";
import { useNavigation } from "@react-navigation/native";
import { SHIPPING_METHODS } from "../../consts/shared";
import { Coupon } from "../../types/coupon";

const { width } = Dimensions.get("window");
const CARD_HEIGHT = 80;
const CARD_RADIUS = 10;

type CouponCarouselProps = {
  coupons: Coupon[];
};

// Memoized coupon item component
const CouponItem = React.memo(
  ({
    item,
    onCouponPress,
    copunsLength,
  }: {
    item: Coupon;
    onCouponPress: (coupon: Coupon) => void;
    copunsLength: number;
  }) => {
    const backgroundUrl =  cdnUrl + item?.image?.uri;
    let cleanUri = backgroundUrl.replace(/^https?:\/\//, '').replace(/^shoofi.imgix.net\//, '');
    cleanUri = cleanUri.replace(/^shoofi-spaces\.fra1\.cdn\.digitaloceanspaces\.com\//, '');
    const baseUrl = `https://shoofi.imgix.net/${cleanUri}`;
    // Carousel images: moderate quality, larger size for better visual appeal
    const mainParams = [
      'w=800',
      'h=400',
      'auto=format',
      'fit=cover',
      'q=70',
      'fm=webp',
      'dpr=1'
    ];
    // Get display name (use Hebrew name for now)
    const displayName = item.nameForStore;

    return (
      <View style={[styles.cardContainer, {width: copunsLength > 1 ? width - width / 6 : width - 20,}]}>
        
        {/* Background color fallback */}
        <View style={styles.backgroundFallback} />
        <CustomFastImage
              source={{ uri: baseUrl }}
              resizeMode="cover"
              style={{
                width: "100%",
                height: "100%",
                borderRadius: CARD_RADIUS,
              }}
            />
        {/* Text overlay with gradient */}
        <LinearGradient
          colors={["#00000000", "#232323"]}
          start={{ x: 0.5, y: 0 }}
          end={{ x: 0.5, y: 1 }}
          style={styles.gradientOverlay}
        >
          <View style={styles.textOverlay}>
            <Text style={[styles.title, {color: item.color}]}>{displayName}</Text>
            <Text style={[styles.subtitle, {color: item.color}]}>{item.subNameForStore}</Text>
          </View>
        </LinearGradient>
      </View>
    );
  }
);

// Memoized pagination dots component
const PaginationDots = React.memo(
  ({ coupons, activeIndex }: { coupons: Coupon[]; activeIndex: number }) => (
    <View style={styles.dotsRow}>
      {coupons.map((_, idx) => (
        <View
          key={idx}
          style={[styles.dot, activeIndex === idx && styles.dotActive]}
        />
      ))}
    </View>
  )
);

const CouponCarousel: React.FC<CouponCarouselProps> = React.memo(
  ({ coupons }) => {
    const [activeIndex, setActiveIndex] = useState(0);
    const navigation = useNavigation();
    const { cartStore, menuStore, shoofiAdminStore } = useContext(StoreContext);
    // Memoized carousel width - make it smaller to show partial next item
    const carouselWidth = useMemo(() => width - 80, []); // Reduced from 32 to 80 to show partial next item

    // Handle coupon press - show coupon details or apply coupon
    const handleCouponPress = useCallback(async (coupon: Coupon) => {
      // For now, just show an alert with coupon details
      Alert.alert(
        "Coupon Details",
        `Code: ${coupon.code}\nName: ${coupon.nameHE}\nType: ${
          coupon.type
        }\nValue: ${coupon.value}${coupon.type === "percentage" ? "%" : "₪"}`
      );
    }, []);

    // Handle scroll to track active index
    const handleScroll = useCallback((event: any) => {
      const scrollPosition = event.nativeEvent.contentOffset.x;
      const cardWidth = width - 32;
      const newIndex = Math.round(scrollPosition / cardWidth);
      setActiveIndex(newIndex);
    }, []);

    if (!coupons || coupons.length === 0) {
      return null;
    }
    console.log("coupons", coupons);
    return (
      <View style={styles.carouselContainer}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          pagingEnabled={false}
          snapToInterval={width}
          decelerationRate="fast"
          onScroll={handleScroll}
          scrollEventThrottle={16}
          contentContainerStyle={styles.scrollViewContent}
          style={{ height: 90, width: width }}
        >
          {coupons.map((coupon, index) => (
            <View key={index} style={styles.couponItemWrapper}>
              <View style={{flexDirection: "row", alignItems: "center"}}>
              { <View style={{width: 10, height: 10,}} />}

              <CouponItem item={coupon} onCouponPress={handleCouponPress} copunsLength={coupons.length} />  
              { index !== 0 && <View style={{width: 10, height: 10,}} />}
              </View>
              
            </View>
          ))}
        </ScrollView>
        {/* <PaginationDots coupons={coupons} activeIndex={activeIndex} /> */}
      </View>
    );
  }
);

const styles = StyleSheet.create({
  carouselContainer: {
    width: width,
    alignItems: "center",
    marginTop: 8,
    marginBottom: 16,
    height: 90,
  },
  scrollViewContent: {
    // paddingHorizontal: 8, // Add some padding between items
  },
  couponItemWrapper: {
    position: "relative",
    //marginHorizontal: 4, // Space between coupon items
  },
  cardContainer: {
    
    height: CARD_HEIGHT,
    borderRadius: CARD_RADIUS,
  },
  card: {
    width: width,
    height: CARD_HEIGHT,
    borderRadius: CARD_RADIUS,
    overflow: "hidden",
    justifyContent: "flex-end",
    padding: 16,
  },
  productsRow: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    height: CARD_HEIGHT - 40,
    flexDirection: "row",
    justifyContent: "space-evenly",
    alignItems: "flex-start",
    zIndex: 2,
  },
  productImg: {
    width: "100%",
    height: "100%",
    marginHorizontal: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    backgroundColor: "transparent",
    borderRadius: CARD_RADIUS,
  },
  backgroundFallback: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: themeStyle.SECONDARY_COLOR, // Warm beige color like in the image
    borderRadius: CARD_RADIUS,
  },
  gradientOverlay: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    height: "100%",
    borderBottomLeftRadius: CARD_RADIUS,
    borderBottomRightRadius: CARD_RADIUS,
    justifyContent: "center",
    paddingHorizontal: 16,
    zIndex: 2,
 
  },
  textOverlay: {
    zIndex: 3,
    alignItems: "flex-start",
 
  },
  title: {
    color: "white",
    fontWeight: "bold",
    fontSize: themeStyle.FONT_SIZE_LG,
    marginBottom: 4,
    textShadowColor: "rgba(0,0,0,0.4)",
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
    textAlign: "left",
  },
  subtitle: {
    color: "white",
    fontSize: themeStyle.FONT_SIZE_MD,
    textShadowColor: "rgba(0,0,0,0.3)",
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
    textAlign: "left",
  },
  storeIndicator: {
    color: "#FFD700",
    fontSize: 12,
    fontWeight: "bold",
    textShadowColor: "rgba(0,0,0,0.5)",
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
    textAlign: "left",
    marginTop: 2,
  },
  dotsRow: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginTop: 8,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "rgba(217, 217, 217, 1)",
    marginHorizontal: 3,
  },
  dotActive: {
    backgroundColor: themeStyle.SECONDARY_COLOR,
    width: 10,
    height: 10,
  },
});

export default CouponCarousel;
