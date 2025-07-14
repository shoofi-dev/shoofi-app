import React, { useContext, useEffect, useState } from "react";
import { View } from "react-native";
import { observer } from "mobx-react";
import { StoreContext } from "../stores";
import { useRoute } from '@react-navigation/native';
import { useTranslation } from "react-i18next";
import StoreListView from "../components/StoreListView";

const StoresListScreen = () => {
  const { shoofiAdminStore } = useContext(StoreContext);
  const { t } = useTranslation();
  const route = useRoute();
  const { category, searchResult } = (route.params || {}) as any;
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        if (!shoofiAdminStore.storesList && !searchResult) {
          // await shoofiAdminStore.getStoresListData({});
        }
      } catch (error) {
        console.error("Error fetching stores:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [shoofiAdminStore, searchResult]);

  let storesToShow = [];
  if (searchResult && Array.isArray(searchResult)) {
    storesToShow = searchResult;
  } else {
    const stores = shoofiAdminStore.storesList || [];
    storesToShow = category
      ? stores.filter((data) =>
          data.store.categoryIds &&
          data.store.categoryIds.some(
            (categoryId) =>
              categoryId.$oid === category._id || categoryId === category._id
          )
        )
      : [];
  }

  if (loading) {
    return <View></View>;
  }

  return <StoreListView stores={storesToShow} />;
};

export default observer(StoresListScreen); 