import React, { useContext, useEffect, useState, useRef } from "react";
import {
  View,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  I18nManager,
} from "react-native";
import { observer } from "mobx-react";
import { StoreContext } from "../stores";
import { useRoute, useNavigation } from "@react-navigation/native";
import themeStyle from "../styles/theme.style";
import StoreItem from "./stores/components/item";
import CustomFastImage from "../components/custom-fast-image";
import { cdnUrl } from "../consts/shared";
import Text from "../components/controls/Text";
const CATEGORY_BG = "#f5f5f5";

const GeneralCategoryScreen = () => {
  const { shoofiAdminStore, languageStore } = useContext(StoreContext);
  const route = useRoute();
  const navigation = useNavigation();
  const { generalCategory } = route.params;
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [loading, setLoading] = useState(true);
  const storesScrollViewRef = useRef(null);

  useEffect(() => {
    if (shoofiAdminStore.categoryList && generalCategory) {
      const cats = shoofiAdminStore.categoryList.filter((cat) =>
        cat.supportedGeneralCategoryIds?.some(
          (id) => id.$oid === generalCategory._id || id === generalCategory._id
        )
      );
      if (cats.length > 0) setSelectedCategory(cats[0]);
    }
  }, [shoofiAdminStore.categoryList, generalCategory]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        if (!shoofiAdminStore.storesList) {
          //await shoofiAdminStore.getStoresListData({});
        }
      } catch (error) {
        console.error("Error fetching stores:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [shoofiAdminStore]);

  // Reset scroll position when category changes
  useEffect(() => {
    if (storesScrollViewRef.current) {
      storesScrollViewRef.current.scrollTo({ x: 0, y: 0, animated: false });
    }
  }, [selectedCategory]);

  if (!generalCategory) return null;

  const stores = shoofiAdminStore.storesList || [];

  const categories = shoofiAdminStore.categoryList
    ? shoofiAdminStore.categoryList.filter((cat) => {
        // First filter by supported general category
        const isSupported = cat.supportedGeneralCategoryIds?.some(
          (id) => id.$oid === generalCategory._id || id === generalCategory._id
        );
        
        if (!isSupported) return false;
        
        // Then check if this category has any stores
        const storesInThisCategory = stores.filter(
          (data: any) =>
            data.store.categoryIds &&
            data.store.categoryIds.some(
              (categoryId) =>
                categoryId.$oid === cat._id ||
                categoryId === cat._id
            )
        );
        
        return storesInThisCategory.length > 0;
      })
    : [];
  const storesInCategory = selectedCategory
    ? stores.filter(
        (data: any) =>
          data.store.categoryIds &&
          data.store.categoryIds.some(
            (categoryId) =>
              categoryId.$oid === selectedCategory._id ||
              categoryId === selectedCategory._id
          )
      )
    : [];

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator size="large" color={themeStyle.PRIMARY_COLOR} />
      </View>
    );
  }

  return (
    <View style={{ marginTop: 15 }}>
      {/* Horizontal scroller of categories */}
      <View>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={{
            marginBottom: 20,
            paddingBottom: 5,
          }}
          contentContainerStyle={{
            flexDirection: I18nManager.isRTL ? "row" : "row",
          }}
        >
          {categories.map((cat) => (
            <TouchableOpacity
              key={cat.categoryId}
              style={{
                alignItems: "center",
                marginHorizontal: 8,

                height: 155, // Fixed height for all cards
              }}
              onPress={() => setSelectedCategory(cat)}
              activeOpacity={0.8}
            >
              <View
                style={{
                  justifyContent: "center",
                  alignItems: "center",
                  opacity:
                    selectedCategory && selectedCategory._id === cat._id
                      ? 1
                      : 0.8,
                  shadowColor: themeStyle.BLACK_COLOR,
                  shadowOffset: { width: 0, height: 2 },
                  shadowOpacity: 0.1,
                  shadowRadius: 5,
                  elevation: 4,
                  backgroundColor: themeStyle.WHITE_COLOR,
                  borderRadius: 20,
                  borderWidth: 0,
                  height: "100%",
                  // borderWidth: selectedCategory && selectedCategory._id === cat._id ? 2 : 0,
                }}
              >
                <View style={{ width: 98, height: 98 }}>
                  {cat.image ? (
                    <CustomFastImage
                      style={{
                        width: "100%",
                        height: "100%",
                        borderRadius: 20,
                      }}
                      source={{ uri: `${cdnUrl}${cat.image.uri}` }}
                      cacheKey={`${cat.image.uri.split(/[\\/]/).pop()}`}
                    />
                  ) : (
                    <View
                      style={{
                        width: "100%",
                        height: "100%",
                        borderRadius: 15,
                      }}
                    />
                  )}
                </View>
                <View
                  style={{
                    position: "relative",
                    flex: 1,
                    justifyContent: "center",
                  }}
                >
                  <Text
                    style={{
                      fontSize: 16,
                      textAlign: "center",
                      maxWidth: 90,
                    }}
                    numberOfLines={2}
                  >
                    {languageStore.selectedLang === "ar"
                      ? cat.nameAR
                      : cat.nameHE}
                  </Text>
                </View>
              </View>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>
      {/* Stores for selected category */}
      <View style={{paddingBottom: 350}}>
        <ScrollView ref={storesScrollViewRef}>
          {storesInCategory.map((data: any) => (
            <View key={data.store._id} style={{}}>
              <StoreItem storeItem={data} />
            </View>
          ))}
          {storesInCategory.length === 0 && (
            <Text style={{ textAlign: "center", marginTop: 40, color: "#888" }}>
              לא נמצאו מסעדות בקטגוריה זו.
            </Text>
          )}
        </ScrollView>
      </View>
    </View>
  );
};

export default observer(GeneralCategoryScreen);
