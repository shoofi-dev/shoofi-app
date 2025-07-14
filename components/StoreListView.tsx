import React, { useContext, useState } from "react";
import { View, Text, ScrollView, TouchableOpacity } from "react-native";
import StoreItem from "../screens/stores/components/item";
import { useTranslation } from "react-i18next";
import { useNavigation } from "@react-navigation/native";
import { StoreContext } from "../stores";
import { SHIPPING_METHODS } from "../consts/shared";

const TAG_STYLE = {
  backgroundColor: '#f0f0f0',
  borderRadius: 16,
  paddingHorizontal: 12,
  paddingVertical: 6,
  marginRight: 8,
  marginBottom: 8,
  fontSize: 14,
  color: '#333',
};

const StoreListView = ({ stores }) => {
  const { t } = useTranslation();
  const navigation = useNavigation();
  let { menuStore, cartStore, shoofiAdminStore, languageStore } = useContext(StoreContext);
  const [expandedStores, setExpandedStores] = useState({});


  const toggleExpand = (storeId) => {
    setExpandedStores((prev) => ({
      ...prev,
      [storeId]: !prev[storeId],
    }));
  };

  return (
    <View style={{ backgroundColor: "#fff", flex: 1 }}>
      <ScrollView>
        {stores.map((data) => {
          const products = data.products || [];
          const isExpanded = expandedStores[data.store._id];
          const productsToShow = isExpanded ? products : products.slice(0, 5);
          return (
            <View key={data.store._id} style={{ marginBottom: 0 }}>
              <StoreItem storeItem={data} searchProducts={data.products} />
   
            </View>
          );
        })}
        {stores.length === 0 && (
          <Text style={{ textAlign: "center", marginTop: 40, color: "#888" }}>
            {t("no_stores_found")}
          </Text>
        )}
      </ScrollView>
    </View>
  );
};

export default StoreListView;