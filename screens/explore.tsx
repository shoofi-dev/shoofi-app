import React, { useContext, useEffect, useState } from "react";
import { View, Text, ScrollView, TouchableOpacity, ActivityIndicator, I18nManager } from "react-native";
import { observer } from "mobx-react";
import { StoreContext } from "../stores";
import { useTranslation } from "react-i18next";
import themeStyle from "../styles/theme.style";
import StoreItem from "./stores/components/item";
import { cdnUrl } from "../consts/shared";
import CustomFastImage from "../components/custom-fast-image";

const CATEGORY_BG = "#f5f5f5";

const ExploreScreen = () => {
  const { t } = useTranslation();
  const { shoofiAdminStore } = useContext(StoreContext);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      if (!shoofiAdminStore.categoryList) {
        await shoofiAdminStore.getCategoryListData();
      }
      if (!shoofiAdminStore.storesList) {
        await shoofiAdminStore.getStoresListData({});
      }
      setLoading(false);
    };
    fetchData();
  }, [shoofiAdminStore]);

  const categories = shoofiAdminStore.categoryList || [];
  const stores = shoofiAdminStore.storesList || [];

  // Set default selected category
  useEffect(() => {
    if (categories.length && !selectedCategory) {
      setSelectedCategory(categories[0]);
    }
  }, [categories]);

  // Filter stores by selected category
  const storesInCategory = selectedCategory
    ? stores.filter((data:any) =>
        data.store.categoryIds &&
        data.store.categoryIds.some(
          (categoryId) =>
            categoryId.$oid === selectedCategory._id || categoryId === selectedCategory._id
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
    <View style={{ backgroundColor: "#fff", flex: 1 }}>
      {/* Categories Horizontal Scroller */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={{ paddingVertical: 16, paddingHorizontal: 8, marginBottom: 10 }}
        contentContainerStyle={{ flexDirection: I18nManager.isRTL ? "row-reverse" : "row" }}
      >
        {categories.map((cat) => (
          <TouchableOpacity
            key={cat.categoryId}
            style={{
              alignItems: "center",
              marginHorizontal: 8,
              opacity: selectedCategory && selectedCategory._id === cat._id ? 1 : 0.5,
            }}
            onPress={() => setSelectedCategory(cat)}
            activeOpacity={0.8}
          >
            <View
              style={{
                width: 70,
                height: 70,
                borderRadius: 20,
                backgroundColor: CATEGORY_BG,
                justifyContent: "center",
                alignItems: "center",
                shadowColor: "#000",
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.08,
                shadowRadius: 4,
                elevation: 2,
                borderWidth: selectedCategory && selectedCategory._id === cat._id ? 2 : 0,
                borderColor: themeStyle.PRIMARY_COLOR,
              }}
            >
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
                <View style={{ width: 50, height: 50, borderRadius: 15, backgroundColor: "#fff" }} />
              )}
            </View>
            <Text
              style={{
                fontSize: 16,
                color: "#222",
                fontWeight: "500",
                marginTop: 6,
                textAlign: "center",
                maxWidth: 70,
              }}
              numberOfLines={1}
              ellipsizeMode="tail"
            >
              {cat.name}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Stores for Selected Category */}
      <ScrollView>
        {storesInCategory.map((data:any) => (
          <View key={data.store._id} style={{ marginBottom: 20 }}>
            <StoreItem storeItem={data} />
          </View>
        ))}
        {storesInCategory.length === 0 && (
          <Text style={{ textAlign: "center", marginTop: 40, color: "#888" }}>
            {t("No restaurants found for this category.")}
          </Text>
        )}
      </ScrollView>
    </View>
  );
};

export default observer(ExploreScreen);