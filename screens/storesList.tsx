import React, { useContext, useEffect, useState } from "react";
import { View, Text, ScrollView, ActivityIndicator } from "react-native";
import { observer } from "mobx-react";
import { StoreContext } from "../stores";
import themeStyle from "../styles/theme.style";
import StoreItem from "./stores/components/item";
import { useRoute } from '@react-navigation/native';

const StoresListScreen = () => {
  const { shoofiAdminStore, languageStore } = useContext(StoreContext);
  const route = useRoute();
  const { category } = route.params;
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        if (!shoofiAdminStore.storesList) {
          await shoofiAdminStore.getStoresListData({});
        }
      } catch (error) {
        console.error("Error fetching stores:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [shoofiAdminStore]);

  const stores = shoofiAdminStore.storesList || [];
  const storesInCategory = category
    ? stores.filter((data:any) =>
        data.store.categoryIds &&
        data.store.categoryIds.some(
          (categoryId) =>
            categoryId.$oid === category._id || categoryId === category._id
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
      <ScrollView>
        {storesInCategory.map((data:any) => (
          <View key={data.store._id} style={{ marginBottom: 20 }}>
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
  );
};

export default observer(StoresListScreen); 