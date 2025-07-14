import React, {
  useContext,
  useEffect,
  useState,
  useMemo,
  useCallback,
} from "react";
import {
  View,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  I18nManager,
} from "react-native";
import { observer } from "mobx-react";
import { StoreContext } from "../stores";
import { useTranslation } from "react-i18next";
import themeStyle from "../styles/theme.style";
import StoreItem from "./stores/components/item";
import { cdnUrl } from "../consts/shared";
import CustomFastImage from "../components/custom-fast-image";
import ImageWithLoading from "../components/image-with-loading";
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
            <ImageWithLoading
              style={{
                width: "100%",
                height: "100%",
                borderRadius: 20,
              }}
              source={{ uri: `${cdnUrl}${cat.img[0].uri}` }}
              showLoadingIndicator={false}
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
          {cat?.image?.uri ? (
            <ImageWithLoading
              style={{
                width: "100%",
                height: "100%",
                borderRadius: 20,
              }}
              source={{ uri: `${cdnUrl}${cat.image?.uri}` }}
              showLoadingIndicator={false}
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

// Memoized store section component
const StoreSection = React.memo<StoreSectionProps>(
  ({ category, storesInCategory, languageStore }) => {
    const categoryName = useMemo(
      () =>
        languageStore.selectedLang === "ar" ? category.nameAR : category.nameHE,
      [languageStore.selectedLang, category.nameAR, category.nameHE]
    );

    return (
      <View style={{ marginBottom: 0 }}>
        <Text
          style={{
            fontSize: themeStyle.FONT_SIZE_LG,
            fontWeight: "bold",
            marginHorizontal: 16,
            marginBottom: 12,
            marginTop: 0,
          }}
        >
          {categoryName}
        </Text>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={{ paddingHorizontal: 8 }}
          contentContainerStyle={{
            paddingRight: 16,
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
                shadowColor: "#000",
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.1,
                shadowRadius: 4,
                elevation: 3,
                overflow: "hidden",
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
    userDetailsStore,
    addressStore,
    websocket,
  } = useContext(StoreContext);
  const navigation = useNavigation() as any;
  const [selectedGeneralCategory, setSelectedGeneralCategory] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [defaultCategory, setDefaultCategory] = useState(null);
  const [userLocation, setUserLocation] = useState(null);
  const [hideSplash, setHideSplash] = useState(false);

  useEffect(() => {
    if (websocket?.lastMessage) {
      console.log("websocket?.lastMessage", websocket?.lastMessage);
      if (websocket?.lastMessage?.type === "store_refresh") {
        setHideSplash(true);
        refetch();
      }
    }
  }, [websocket?.lastMessage]);

  // Get user location for filtering
  useEffect(() => {
    console.log("Location effect triggered:", {
      hasDefaultAddress: !!addressStore.defaultAddress,
      hasLocation: !!addressStore.defaultAddress?.location,
      location: addressStore.defaultAddress?.location,
    });

    if (addressStore.defaultAddress?.location) {
      setUserLocation(addressStore.defaultAddress.location);
    } else {
      setUserLocation(null);
    }
  }, [addressStore.defaultAddress?.location]);

  // Build API URLs with location parameter - use stable object
  const apiUrls = useMemo((): ApiUrls => {
    console.log("Building API URLs with userLocation:", userLocation);

    const baseUrls: ApiUrls = {
      generalCategories: "/category/general/all",
      ads: "/ads/list",
      categoriesWithStores: userLocation
        ? `/shoofiAdmin/explore/categories-with-stores?location=${JSON.stringify(
            userLocation
          )}`
        : "/shoofiAdmin/explore/categories-with-stores",
    };

    console.log("API URLs built:", baseUrls);
    return baseUrls;
  }, [userLocation]);

  // Use optimized parallel fetch for better performance - only when location is available
  const {
    data: fetchData,
    loading,
    error,
    refetch,
  } = useParallelFetch<ExploreData>(
    userLocation
      ? apiUrls
      : {
          generalCategories: "/category/general/all",
          ads: "/ads/list",
          categoriesWithStores: "/shoofiAdmin/explore/categories-with-stores",
        },
    {
      ttl: 5 * 60 * 1000, // 5 minutes cache (shorter due to store status changes)
      enabled: !!userLocation, // Only fetch when userLocation is defined
      dependencies: [userLocation], // Refetch when location changes
    }
  );

  console.log("useParallelFetch called with:", {
    userLocation,
    enabled: !!userLocation,
    apiUrls: userLocation ? apiUrls : "default",
    loading,
    hasData: !!fetchData,
  });

  const generalCategories = (fetchData.generalCategories || []) as any[];
  const adsData = (fetchData.ads || []) as any[];
  const categoriesWithStores = (fetchData.categoriesWithStores || []) as any[];

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
      console.log("Store status changed, refreshing explore data...");
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

  if (loading && !hideSplash) {
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
          }}
          contentContainerStyle={{
            flexDirection: I18nManager.isRTL ? "row" : "row",
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
      {defaultCategory &&
        categoriesWithStores?.map((categoryData) => {
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
        })}
    </ScrollView>
  );
};

export default observer(ExploreScreen);
