import React, { useContext, useEffect, useState } from "react";
import { View, Text, ScrollView, TouchableOpacity, Image, Dimensions, ActivityIndicator } from "react-native";
import { observer } from "mobx-react";
import { StoreContext } from "../stores";
import { useTranslation } from "react-i18next";
import themeStyle from "../styles/theme.style";
import StoresCategoryItem from "./home/categories/item";
import StoreItem from "./stores/components/item";

const ExploreScreen = () => {
  const { t } = useTranslation();
  const { shoofiAdminStore } = useContext(StoreContext);
  const [loading, setLoading] = useState(true);

  const resetStoreDBName = async () => {
    await shoofiAdminStore.setStoreDBName(storeData.appName);
  }
  useEffect(() => {
    resetStoreDBName();
  }, [])
  useEffect(() => {
    const fetchData = async () => {
      if (!shoofiAdminStore.categoryList) {
        await shoofiAdminStore.getCategoryListData();
      }
      if (!shoofiAdminStore.storesList) {
        await shoofiAdminStore.getStoresListData();
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
    <View style={{ flex: 1, backgroundColor: "#fff" }}>
      {/* Categories Horizontal Scroller */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ paddingVertical: 10, paddingLeft: 10 }}>
        {categories.map((cat) => (
          <View key={cat.categoryId} style={{ marginRight: 15, width: 80 }}>
            <StoresCategoryItem categoryItem={cat} />
          </View>
        ))}
      </ScrollView>

      {/* Main Content: Each Category Section */}
      <ScrollView>
        {categories.map((cat) => {
          const storesInCategory = stores.filter((store) => store.categoryId === cat.categoryId);
          if (storesInCategory.length === 0) return null;
          return (
            <View key={cat.categoryId} style={{ marginBottom: 30, borderWidth:1 }}>
                <View style={{flexDirection:'row', paddingLeft:20,  marginBottom: 10,}}>
                <Text style={{ fontSize: 22, fontWeight: "bold", color: themeStyle.SECONDARY_COLOR,  }}>{cat.name}</Text>

                </View>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ paddingLeft: 15 }}>
                {storesInCategory.map((store) => (
                  <View key={store._id} style={{ marginRight: 15, width: 140, borderWidth:1 }}>
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