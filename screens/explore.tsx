import React, { useContext, useEffect, useState } from "react";
import { View, Text, ScrollView, TouchableOpacity, Image, Dimensions, ActivityIndicator, I18nManager } from "react-native";
import { observer } from "mobx-react";
import { StoreContext } from "../stores";
import { useTranslation } from "react-i18next";
import themeStyle from "../styles/theme.style";
import StoresCategoryItem from "./home/categories/item";
import StoreItem from "./stores/components/item";

const CATEGORY_BG = "#f5f5f5";

const ExploreScreen = () => {
  const { t } = useTranslation();
  const { shoofiAdminStore } = useContext(StoreContext);
  const [loading, setLoading] = useState(true);

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

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator size="large" color={themeStyle.PRIMARY_COLOR} />
      </View>
    );
  }

  return (
    <View style={{  backgroundColor: "#fff",  }}>
      {/* Categories Horizontal Scroller */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={{ paddingVertical: 16, paddingHorizontal: 8,marginBottom:10 }}
        contentContainerStyle={{ flexDirection: I18nManager.isRTL ? "row-reverse" : "row" }}
      >
        {categories.map((cat) => (
          <View key={cat.categoryId} style={{ alignItems: "center", marginHorizontal: 8 }}>
            <TouchableOpacity
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
              }}
              activeOpacity={0.8}
            >
              {cat.image ? (
                <Image
                  source={{ uri: cat.image }}
                  style={{ width: "100%", height: "100%", borderRadius: 15, resizeMode: "cover" }}
                />
              ) : (
                <View style={{ width: 50, height: 50, borderRadius: 15, backgroundColor: "#fff" }} />
              )}
            </TouchableOpacity>
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
          </View>
        ))}
      </ScrollView>

      {/* Main Content: Each Category Section */}
      <ScrollView>
        {categories.map((cat) => {
          const storesInCategory = stores.filter((store) => store.categoryId === cat.categoryId);
          if (storesInCategory.length === 0) return null;
          return (
            <View key={cat.categoryId} style={{ marginBottom: 30,}}>
                <View style={{flexDirection:'row', paddingLeft:20,  marginBottom: 10,}}>
                <Text style={{ fontSize: 22, fontWeight: "bold", color: themeStyle.SECONDARY_COLOR,  }}>{cat.name}</Text>

                </View>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ paddingLeft: 15 }}>
                {storesInCategory.map((store) => (
                  <View key={store._id} style={{ marginRight: 15, width: 180 }}>
                    <StoreItem storeItem={store} />
                  </View>
                ))}
              </ScrollView>
            </View>
          );
        })}
      </ScrollView>
    </View>
  );
};

export default observer(ExploreScreen); 