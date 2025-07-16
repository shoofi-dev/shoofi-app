import React, {
  useContext,
  useEffect,
  useState,
  useMemo,
  useCallback,
  useRef,
} from "react";
import {
  View,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  I18nManager,
  Platform,
} from "react-native";
import { observer } from "mobx-react";
import { StoreContext } from "../stores";
import { useTranslation } from "react-i18next";
import themeStyle from "../styles/theme.style";
import StoreItem from "./stores/components/item";
import { cdnUrl } from "../consts/shared";
import CustomFastImage from "../components/custom-fast-image";
import ImageWithLoading from "../components/image-with-loading";
import OptimizedImage from "../components/optimized-image";
import { axiosInstance } from "../utils/http-interceptor";
import { useFocusEffect, useNavigation } from "@react-navigation/native";
import AdsCarousel, { Ad } from "../components/shared/AdsCarousel";
import {
  normalizeWidth,
  normalizeHeight,
} from "../helpers/responsive-normalize";
import Text from "../components/controls/Text";
import { useParallelFetch } from "../hooks/use-optimized-fetch";
import SplashScreen from "../components/SplashScreen";

const CATEGORY_BG = "#f5f5f5";

// Type definitions
interface CategoryItemProps {
  cat: any;
  onPress: () => void;
  languageStore: any;
}

interface StoreSectionProps {
  category: any;
  storesInCategory: any[];
  languageStore: any;
}

interface ExploreData {
  generalCategories: any[];
  ads: any[];
  categoriesWithStores: any[];
}

interface ApiUrls {
  generalCategories: string;
  ads: string;
  categoriesWithStores: string;
}

// Memoized StoreItem component for better performance
const MemoizedStoreItem = React.memo(StoreItem);

// Memoized category item component
const CategoryItem = React.memo<CategoryItemProps>(
  ({ cat, onPress, languageStore }) => {
    const categoryName = useMemo(
      () => (languageStore.selectedLang === "ar" ? cat.nameAR : cat.nameHE),
      [languageStore.selectedLang, cat.nameAR, cat.nameHE]
    );

    return (
      <TouchableOpacity
        style={{
          alignItems: "center",
          marginHorizontal: 8,
        }}
        onPress={onPress}
        activeOpacity={0.8}
      >
        <View
          style={{
            width: normalizeWidth(68),
            height: normalizeHeight(68),
            borderRadius: 30,
            backgroundColor: CATEGORY_BG,
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          {cat.img && cat.img[0] ? (
            <OptimizedImage
              style={{
                width: "100%",
                height: "100%",
                borderRadius: 20,
              }}
              source={{ uri: `${cdnUrl}${cat.img[0].uri}` }}
              isLogo={true}
            />
          ) : (
            <View
              style={{
                width: 50,
                height: 50,
                borderRadius: 15,
                backgroundColor: "#fff",
              }}
            />
          )}
        </View>
        <Text
          style={{
            fontSize: themeStyle.FONT_SIZE_SM,
            color: "#222",
            fontWeight: "500",
            marginTop: 6,
            textAlign: "center",
            maxWidth: 70,
          }}
        >
          {categoryName}
        </Text>
      </TouchableOpacity>
    );
  }
);

const SubCategoryItem = React.memo<CategoryItemProps>(
  ({ cat, onPress, languageStore }) => {
    const categoryName = useMemo(
      () => (languageStore.selectedLang === "ar" ? cat.nameAR : cat.nameHE),
      [languageStore.selectedLang, cat.nameAR, cat.nameHE]
    );

    return (
      <TouchableOpacity
        style={{
          alignItems: "center",
          marginHorizontal: 8,
          shadowColor: themeStyle.BLACK_COLOR,
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: Platform.OS === "ios" ? 0.1 : 0.9, 
          shadowRadius: 5,
          elevation: 5,
          backgroundColor: "#fff",
          borderRadius: 20,
          borderWidth: 0,
          height: normalizeHeight(150),
          
        }}
        onPress={onPress}
        activeOpacity={0.8}
        
      >
        <View
          style={{
            width: normalizeWidth(98),
            height: normalizeHeight(98),
            justifyContent: "center",
            alignItems: "center",
            overflow: "hidden",
            borderTopEndRadius: 10,
            borderTopStartRadius: 10,
            
          }}
        >
          {cat?.image?.uri ? (
            <OptimizedImage
              style={{
                width: "100%",
                height: "100%",
            
              }}
              source={{ uri: `${cdnUrl}${cat.image?.uri}` }}
              isThumbnail={true}
            />
          ) : (
            <View
              style={{
                width: 50,
                height: 50,
                borderRadius: 15,
                backgroundColor: "#fff",
              }}
            />
          )}
        </View>
        <View style={{ flex:1, justifyContent:"center", alignItems:"center"}}>
        <Text
          style={{
            fontSize: themeStyle.FONT_SIZE_SM,
            color: "#222",
            fontWeight: "500",
            textAlign: "center",
            maxWidth: 70,
          }}
        >
          {categoryName}
        </Text>
        </View>
     
      </TouchableOpacity>
    );
  }
);

// Memoized store section component
const StoreSection = React.memo<StoreSectionProps>(
  ({ category, storesInCategory, languageStore }) => {
    const categoryName = useMemo(
      () =>
        languageStore.selectedLang === "ar" ? category.nameAR : category.nameHE,
      [languageStore.selectedLang, category.nameAR, category.nameHE]
    );

    return (
      <View style={{ marginBottom: 0, alignItems: "flex-start" }}>
        <Text
          style={{
            fontSize: themeStyle.FONT_SIZE_LG,
            fontWeight: "bold",
            marginHorizontal: 16,
            marginBottom: 12,
            marginTop: 0,
            textAlign: "left",
          }}
        >
          {categoryName}
        </Text>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{
 
          }}
        >
          {storesInCategory.map((storeData) => (
            <View
              key={storeData.store._id}
              style={{
                width: 240,
                height: 224,
                marginHorizontal: 8,
                backgroundColor: "#fff",
                borderRadius: 16,
              }}
            >
              <MemoizedStoreItem storeItem={storeData} isExploreScreen={true} />
            </View>
          ))}
        </ScrollView>
      </View>
    );
  }
);

const ExploreScreen = () => {
  const { t } = useTranslation();
  const {
    shoofiAdminStore,
    languageStore,
    addressStore,
    websocket,
    couponsStore,
  } = useContext(StoreContext);
  const navigation = useNavigation() as any;
  const [selectedGeneralCategory, setSelectedGeneralCategory] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [defaultCategory, setDefaultCategory] = useState(null);
  const [userLocation, setUserLocation] = useState(null);
  const [debouncedLocation, setDebouncedLocation] = useState(null);
  const [hideSplash, setHideSplash] = useState(false);
  const lastFetchedLocation = useRef(null);
  useEffect(() => {
    if (websocket?.lastMessage) {
      if (websocket?.lastMessage?.type === "store_refresh") {
        setHideSplash(true);
        refetch();
      }
    }
  }, [websocket?.lastMessage]);

  // Get user location for filtering with debouncing
  useEffect(() => {
    if (addressStore.defaultAddress?.location) {
      setUserLocation(addressStore.defaultAddress.location);
      
      // Debounce location changes to prevent rapid API calls
      const timeoutId = setTimeout(() => {
        const newLocation = addressStore.defaultAddress.location;
        // Only update if location has actually changed
        if (JSON.stringify(lastFetchedLocation.current) !== JSON.stringify(newLocation)) {
          setDebouncedLocation(newLocation);
          lastFetchedLocation.current = newLocation;
        }
      }, 300); // 300ms debounce - faster response
      
      return () => clearTimeout(timeoutId);
    } else {
      setUserLocation(null);
      setDebouncedLocation(null);
      lastFetchedLocation.current = null;
    }
  }, [addressStore.defaultAddress?.location]);



  // Use optimized parallel fetch for better performance - always fetch basic data, location-based data when available
  const {
    data: fetchData,
    loading,
    error,
    refetch,
  } = useParallelFetch<ExploreData>(
    {
      generalCategories: "/category/general/all",
      ads: "/ads/list",
      categoriesWithStores: debouncedLocation
        ? `/shoofiAdmin/explore/categories-with-stores?location=${JSON.stringify(debouncedLocation)}`
        : "/shoofiAdmin/explore/categories-with-stores",
    },
    {
      ttl: 5 * 60 * 1000, // 5 minutes cache (shorter due to store status changes)
      enabled: true, // Always fetch basic data
      dependencies: [debouncedLocation], // Refetch location-based data when location changes
    }
  );


  useEffect(() => {
    const getAutoCoupon = async () => {
      await couponsStore?.getAndApplyAutoCoupons(null,null,25);
    }
    getAutoCoupon();
  }, []);


  const generalCategories = (fetchData.generalCategories || []) as any[];
  const adsData = (fetchData.ads || []) as any[];
  const categoriesWithStores = (fetchData.categoriesWithStores || []) as any[];
  
  // Show loading indicator for location-based updates
  const isLocationLoading = loading && fetchData.generalCategories && debouncedLocation;
  useFocusEffect(
    React.useCallback(() => {
      shoofiAdminStore.setSelectedCategory(null);
      shoofiAdminStore.setSelectedGeneralCategory(null);
      return () => {};
    }, [])
  );

  // Listen for store status changes and refresh data
  useEffect(() => {
    const handleStoreStatusChange = () => {
      refetch();
    };

    // You can add WebSocket listener here for real-time updates
    // For now, we'll refresh on focus
    return () => {
      // Cleanup WebSocket listeners if needed
    };
  }, [refetch]);

  // Memoized category press handler
  const handleCategoryPress = useCallback(
    (cat) => {
      shoofiAdminStore.setSelectedGeneralCategory(cat);
      navigation.navigate("general-category", { generalCategory: cat });
    },
    [shoofiAdminStore, navigation]
  );

  const handleSubCategoryPress = useCallback(
    (cat) => {
      shoofiAdminStore.setSelectedCategory(cat);
      navigation.navigate("stores-list", { category: cat });
    },
    [shoofiAdminStore, navigation]
  );

  // Memoized ads mapping
  const mappedAds = useMemo(
    () =>
      adsData.map((ad) => ({
        id: ad._id || ad.id,
        background: ad.image?.uri || "",
        products: [],
        title:
          languageStore.selectedLang === "ar" ? ad.titleAR : ad.titleHE || "",
        subtitle:
          languageStore.selectedLang === "ar"
            ? ad.descriptionAR
            : ad.descriptionHE || "",
      })),
    [adsData, languageStore.selectedLang]
  );

  // Set default category
  useEffect(() => {
    if (generalCategories.length > 0) {
      setDefaultCategory(generalCategories[0]);
    }
  }, [generalCategories]);
  
  // Show splash only on initial load, not on location-based refetches
  if (loading && !hideSplash && !fetchData.generalCategories) {
    return <SplashScreen />;
  }

  if (error) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <Text style={{ color: themeStyle.ERROR_COLOR }}>
          {t("error_loading_data")}
        </Text>
      </View>
    );
  }
  return (
    <ScrollView style={{ backgroundColor: "#fff", marginTop: 10 }}>
      {/* Location-based loading indicator */}
      {isLocationLoading && (
        <View style={{ 
          paddingHorizontal: 16, 
          paddingVertical: 8, 
          backgroundColor: "#f0f8ff",
          alignItems: "center"
        }}>
          <ActivityIndicator size="small" color={themeStyle.PRIMARY_COLOR} />
          <Text style={{ 
            fontSize: themeStyle.FONT_SIZE_SM, 
            color: themeStyle.PRIMARY_COLOR, 
            marginTop: 4 
          }}>
            {t("updating_stores")}
          </Text>
        </View>
      )}
      
      {/* General Categories Horizontal Scroller */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={{ paddingVertical: 16, paddingHorizontal: 8, marginBottom: 10 }}
        contentContainerStyle={{
          flexDirection: I18nManager.isRTL ? "row" : "row",
        }}
      >
        {generalCategories?.map((cat) => (
          <CategoryItem
            key={cat._id}
            cat={cat}
            onPress={() => handleCategoryPress(cat)}
            languageStore={languageStore}
          />
        ))}
      </ScrollView>

      {/* Ads Carousel */}
      {mappedAds.length > 0 && <AdsCarousel ads={mappedAds} />}

      {defaultCategory && (
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={{
            paddingVertical: 0,
            paddingHorizontal: 8,
            marginTop: 20,
            paddingBottom: 30,
          }}
          contentContainerStyle={{
            flexDirection: I18nManager.isRTL ? "row" : "row",
            paddingBottom: 10,
          }}
        >
          {categoriesWithStores?.map((categoryData) => (
            <SubCategoryItem
              key={categoryData.category._id}
              cat={categoryData.category}
              onPress={() => handleSubCategoryPress(categoryData.category)}
              languageStore={languageStore}
            />
          ))}
        </ScrollView>
      )}

      {/* Stores grouped by subcategories - now using server-side filtered data */}
      {defaultCategory && categoriesWithStores?.length > 0 ? (
        categoriesWithStores.map((categoryData) => {
          // Only show category if it has stores
          if (!categoryData.stores || categoryData.stores.length === 0)
            return null;

          return (
            <StoreSection
              key={categoryData.category._id}
              category={categoryData.category}
              storesInCategory={categoryData.stores}
              languageStore={languageStore}
            />
          );
        })
      ) : (
        // Show message when no stores are available
        <View style={{ 
          padding: 20, 
          alignItems: "center",
          justifyContent: "center",
          minHeight: 200
        }}>
          <Text style={{ 
            fontSize: themeStyle.FONT_SIZE_MD, 
            color: "#666",
            textAlign: "center"
          }}>
            {debouncedLocation ? t("no_stores_in_area") : t("loading_stores")}
          </Text>
        </View>
      )}
    </ScrollView>
  );
};

export default observer(ExploreScreen);
