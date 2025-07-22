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
  FlatList,
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
import { useParallelFetch, useOptimizedFetch } from "../hooks/use-optimized-fetch";
import SplashScreen from "../components/SplashScreen";
import { wsDebugger } from "../utils/debug-websocket";
import WebSocketDebugPanel from "../components/debug/WebSocketDebugPanel";
import Animated, {
  FadeIn,
} from "react-native-reanimated";
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
}

interface LocationData {
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
          overflow: "hidden",

        }}
        onPress={onPress}
        activeOpacity={0.8}
        
      >
        <View
          style={{
            width: normalizeWidth(68),
            height: normalizeHeight(68),
            backgroundColor: CATEGORY_BG,
            justifyContent: "center",
            alignItems: "center",
            borderRadius: 20,
            overflow: "hidden",
          }}
        >
          {cat.img && cat.img[0] ? (
            <OptimizedImage
              style={{
                width: "100%",
                height: "100%",

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

// Store section component - memoized for better performance
const StoreSection = ({ category, storesInCategory, languageStore }) => {
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
        style={{ height: 224 }}
      >
        <View style={{ flexDirection: 'row' }}>
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
              <MemoizedStoreItem 
                storeItem={storeData} 
                isExploreScreen={true} 
              />
            </View>
          ))}
        </View>
      </ScrollView>
    </View>
  );
};

const ExploreScreen = () => {
  const { t } = useTranslation();
  const {
    shoofiAdminStore,
    languageStore,
    addressStore,
    websocket,
    couponsStore,
    storeDataStore,
  } = useContext(StoreContext);
  const navigation = useNavigation() as any;
  const [selectedGeneralCategory, setSelectedGeneralCategory] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [defaultCategory, setDefaultCategory] = useState(null);
  const [userLocation, setUserLocation] = useState(null);
  const [debouncedLocation, setDebouncedLocation] = useState(null);
  const [hideSplash, setHideSplash] = useState(false);
  const [showDebugPanel, setShowDebugPanel] = useState(__DEV__);
  const lastFetchedLocation = useRef(null);
  const lastProcessedEvent = useRef(null);
  const refetchTimeoutRef = useRef(null);
  const processedEvents = useRef(new Set());
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



  // Track if we've already fetched data for the current location
  const lastFetchedLocationRef = useRef<string | null>(null);
  
  // Create a stable location key for comparison
  const locationKey = useMemo(() => {
    if (!debouncedLocation) return null;
    return `${debouncedLocation.lat}_${debouncedLocation.lng}`;
  }, [debouncedLocation]);

  // Use optimized parallel fetch for better performance - only fetch basic data initially
  const {
    data: fetchData,
    loading,
    error,
    refetch,
  } = useParallelFetch<ExploreData>(
    {
      generalCategories: "/category/general/all",
      ads: "/ads/valid", // Use valid ads endpoint for customers
    },
    {
      ttl: 5 * 60 * 1000, // 5 minutes cache (shorter due to store status changes)
      enabled: true, // Always fetch basic data
    }
  );

  // Separate fetch for location-based data to have more control
  const {
    data: locationData,
    loading: locationLoading,
    error: locationError,
    refetch: refetchLocation,
  } = useOptimizedFetch<any[]>(
    debouncedLocation 
      ? `/shoofiAdmin/explore/categories-with-stores?location=${JSON.stringify(debouncedLocation)}`
      : null,
    {
      ttl: 5 * 60 * 1000,
      enabled: !!debouncedLocation,
    }
  );

  // Only refetch location data when location actually changes
  useEffect(() => {
    if (locationKey && locationKey !== lastFetchedLocationRef.current) {
      console.log('Location changed, refetching location data');
      lastFetchedLocationRef.current = locationKey;
      // Clear any existing data before refetching
      refetchLocation();
    }
  }, [locationKey, refetchLocation]);

  // Separate fetch hook for ads only to enable individual refetch
  const {
    data: adsDataFromHook,
    refetch: refetchAds,
  } = useOptimizedFetch<any[]>("/ads/valid", {
    ttl: 5 * 60 * 1000,
    enabled: true,
  });


  useEffect(() => {
    const getAutoCoupon = async () => {
      await couponsStore?.getAndApplyAutoCoupons(null,null,25);
    }
    getAutoCoupon();
  }, []);


  const generalCategories = (fetchData.generalCategories || []) as any[];
  const adsData = adsDataFromHook || (fetchData.ads || []) as any[];
  const categoriesWithStores = useMemo(() => {
    return (locationData || []) as any[];
  }, [locationData]);

  // Memoize filtered data for better performance
  const filteredCategoriesWithStores = useMemo(() => {
    return categoriesWithStores.filter(categoryData => 
      categoryData.stores && categoryData.stores.length > 0
    );
  }, [categoriesWithStores]);
  
  // Show loading indicator for location-based updates
  const isLocationLoading = locationLoading && debouncedLocation;

  // Websocket listeners for real-time updates
  useEffect(() => {
    if (websocket?.lastMessage) {

      // Log all WebSocket events for debugging
      wsDebugger.logEvent(websocket.lastMessage.type, websocket.lastMessage.data, 'explore-screen');
      
      if (websocket?.lastMessage?.type === "store_refresh") {
        console.log("XXXXXX")

        // Check for infinite loop
        if (wsDebugger.detectInfiniteLoop('store_refresh')) {
          console.warn('Potential infinite loop detected for store_refresh events');
          return;
        }
        
        // Prevent duplicate processing of the same event
        const eventId = `${websocket.lastMessage.type}_${websocket.lastMessage.data?.appName}_${websocket.lastMessage.data?.timestamp}`;
        
        // Check if we've already processed this event recently
        if (processedEvents.current.has(eventId)) {
          console.log('Duplicate store refresh event, skipping');
          return;
        }
        
        // Check if the event is for a different app (if we're in a specific store context)
        const currentAppName = storeDataStore.storeData?.appName;
        if (currentAppName && websocket.lastMessage.data?.appName && 
            websocket.lastMessage.data.appName !== currentAppName) {
          console.log('Store refresh event for different app, skipping');
          return;
        }
        
        // Only refetch if we have location data (categoriesWithStores is being used)
        if (!debouncedLocation) {
          console.log('No location available, skipping store refresh refetch');
          return;
        }
        
        console.log('Store refresh received, scheduling refetch');
        processedEvents.current.add(eventId);
        
        // Clear any existing timeout
        if (refetchTimeoutRef.current) {
          clearTimeout(refetchTimeoutRef.current);
        }
        
        // Debounce the refetch to prevent rapid successive calls
        refetchTimeoutRef.current = setTimeout(() => {
          setHideSplash(true);
          refetchLocation();
          console.log('Explore data refetched due to store refresh');
        }, 500); // 500ms debounce

      }
      
      if (websocket?.lastMessage?.type === "ads_updated") {
        refetchAds();
      }
    }
  }, [websocket?.lastMessage, refetchLocation, refetchAds, storeDataStore.storeData?.appName, debouncedLocation]);
  useFocusEffect(
    React.useCallback(() => {
      shoofiAdminStore.setSelectedCategory(null);
      shoofiAdminStore.setSelectedGeneralCategory(null);
      return () => {};
    }, [])
  );

  // Listen for store status changes and refresh data
  // Removed automatic refetch on focus to prevent unnecessary API calls
  // Data will only be refetched when location changes or on WebSocket events

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (refetchTimeoutRef.current) {
        clearTimeout(refetchTimeoutRef.current);
      }
    };
  }, []);

  // Cleanup processed events periodically to prevent memory leaks
  useEffect(() => {
    const cleanupInterval = setInterval(() => {
      if (processedEvents.current.size > 100) {
        processedEvents.current.clear();
        console.log('Cleared processed events cache');
      }
    }, 60000); // Clean up every minute

    return () => clearInterval(cleanupInterval);
  }, []);

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

  // Memoized render functions for FlatList
  const renderGeneralCategory = useCallback(({ item: cat }) => (
    <CategoryItem
      cat={cat}
      onPress={() => handleCategoryPress(cat)}
      languageStore={languageStore}
    />
  ), [handleCategoryPress, languageStore]);

  const renderSubCategory = useCallback(({ item: categoryData }) => (
    <SubCategoryItem
      cat={categoryData.category}
      onPress={() => handleSubCategoryPress(categoryData.category)}
      languageStore={languageStore}
    />
  ), [handleSubCategoryPress, languageStore]);

  const renderStoreSection = useCallback(({ item: categoryData }) => (
    <StoreSection
      category={categoryData.category}
      storesInCategory={categoryData.stores}
      languageStore={languageStore}
    />
  ), [languageStore]);

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
        appName: ad.appName || undefined, // Include store appName for navigation
      })),
    [adsData, languageStore.selectedLang]
  );

  // Set default category
  useEffect(() => {
    if (generalCategories.length > 0) {
      setDefaultCategory(generalCategories[0]);
    }
  }, [generalCategories]);
  
  // Show splash only on initial load when no data is available
  if ((loading && !hideSplash && !fetchData.generalCategories) || !categoriesWithStores?.length) {
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
    <Animated.View entering={FadeIn.duration(500)} style={{ flex: 1, backgroundColor: "#fff" }}>
      <FlatList
        style={{ marginTop: 10 }}
        data={[
          { type: 'general-categories', data: generalCategories },
          { type: 'ads', data: mappedAds },
          ...(defaultCategory && debouncedLocation && categoriesWithStores?.length > 0 ? [
            { type: 'subcategories', data: categoriesWithStores },
            { type: 'store-sections', data: filteredCategoriesWithStores }
          ] : [])
        ]}
        keyExtractor={(item, index) => `${item.type}-${index}`}
        renderItem={({ item }) => {
          switch (item.type) {
            case 'general-categories':
              return (
                <ScrollView
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  style={{ paddingVertical: 16, paddingHorizontal: 8, marginBottom: 10 }}
                >
                  <View style={{ flexDirection: 'row' }}>
                    {item.data.map((cat) => (
                      <CategoryItem
                        key={cat._id}
                        cat={cat}
                        onPress={() => handleCategoryPress(cat)}
                        languageStore={languageStore}
                      />
                    ))}
                  </View>
                </ScrollView>
              );
            
            case 'ads':
              return item.data.length > 0 ? <AdsCarousel ads={item.data} /> : null;
            
            case 'subcategories':
              return (
                <ScrollView
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  style={{
                    height: 190,
                    paddingVertical: 0,
                    paddingHorizontal: 8,
                    marginTop: 20,
                  }}
                  contentContainerStyle={{
                    paddingBottom: 1,
                  }}
                >
                  <View style={{ flexDirection: 'row' }}>
                    {item.data.map((cat) => (
                      <SubCategoryItem
                        key={cat.category._id}
                        cat={cat.category}
                        onPress={() => handleSubCategoryPress(cat.category)}
                        languageStore={languageStore}
                      />
                    ))}
                  </View>
                </ScrollView>
              );
            
            case 'store-sections':
              return (
                <ScrollView
                  showsVerticalScrollIndicator={false}
                  style={{}}
                >
                  <View>
                    {item.data.map((section) => (
                      <StoreSection
                        key={section.category._id}
                        category={section.category}
                        storesInCategory={section.stores}
                        languageStore={languageStore}
                      />
                    ))}
                  </View>
                </ScrollView>
              );
            
            default:
              return null;
          }
        }}
        showsVerticalScrollIndicator={false}
      />
      
      {/* Debug Panel - Only in development */}
      {/* {__DEV__ && (
        <WebSocketDebugPanel
          isVisible={showDebugPanel}
          onClose={() => setShowDebugPanel(false)}
        />
      )} */}
    </Animated.View>
  );
};

export default observer(ExploreScreen);
