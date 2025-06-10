import React, { useContext, useEffect, useState } from "react";
import { View, Text, ScrollView, TouchableOpacity, ActivityIndicator, I18nManager } from "react-native";
import { observer } from "mobx-react";
import { StoreContext } from "../stores";
import { useTranslation } from "react-i18next";
import themeStyle from "../styles/theme.style";
import StoreItem from "./stores/components/item";
import { cdnUrl } from "../consts/shared";
import CustomFastImage from "../components/custom-fast-image";
import { axiosInstance } from "../utils/http-interceptor";
import { useFocusEffect, useNavigation } from '@react-navigation/native';

const CATEGORY_BG = "#f5f5f5";

const ExploreScreen = () => {
  const { t } = useTranslation();
  const { shoofiAdminStore, languageStore } = useContext(StoreContext);
  const navigation = useNavigation() as any;
  const [loading, setLoading] = useState(true);
  const [selectedGeneralCategory, setSelectedGeneralCategory] = useState(null);
  const [generalCategories, setGeneralCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState(null);

  useFocusEffect(
    React.useCallback(() => {
      shoofiAdminStore.setSelectedCategory(null);
      // Optionally, return a cleanup function if needed
      return () => {};
    }, [])
  );
  
  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch general categories
        const generalCategoriesRes: any = await axiosInstance.get("/category/general/all");
        console.log("generalCategoriesRes", generalCategoriesRes);
        setGeneralCategories(generalCategoriesRes);

        // Set default selected general category
        if (generalCategoriesRes?.length && !selectedGeneralCategory) {
          setSelectedGeneralCategory(generalCategoriesRes[0]);
        }

        if (!shoofiAdminStore.categoryList) {
          await shoofiAdminStore.getCategoryListData();
        }
        if (!shoofiAdminStore.storesList) {
          await shoofiAdminStore.getStoresListData({});
        }
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [shoofiAdminStore]);

  const allCategories = shoofiAdminStore.categoryList || [];
  const stores = shoofiAdminStore.storesList || [];

  // Group categories by general category
  const categoriesByGeneral = allCategories.reduce((acc, cat) => {
    if (cat.supportedGeneralCategoryIds && cat.supportedGeneralCategoryIds.length > 0) {
      cat.supportedGeneralCategoryIds.forEach((id) => {
        const generalId = id.$oid || id;
        if (!acc[generalId]) acc[generalId] = [];
        acc[generalId].push(cat);
      });
    }
    return acc;
  }, {});

  // Helper to get general category name by id
  const getGeneralCategoryName = (id) => {
    const general = generalCategories.find((g) => g._id === id);
    return general ? general.nameHE : '';
  };

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator size="large" color={themeStyle.PRIMARY_COLOR} />
      </View>
    );
  }

  return (
    <View style={{ backgroundColor: "#fff", }}>
      {/* General Categories Horizontal Scroller (original design) */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={{ paddingVertical: 16, paddingHorizontal: 8, marginBottom: 10, }}
        contentContainerStyle={{ flexDirection: I18nManager.isRTL ? "row" : "row" }}
      >
        {generalCategories?.map((cat) => (
          <TouchableOpacity
            key={cat._id}
            style={{
              alignItems: "center",
              marginHorizontal: 8,
              opacity: selectedGeneralCategory && selectedGeneralCategory._id === cat._id ? 1 : 0.5,
            }}
            onPress={() => setSelectedGeneralCategory(cat)}
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
                borderWidth: selectedGeneralCategory && selectedGeneralCategory._id === cat._id ? 2 : 0,
                borderColor: themeStyle.PRIMARY_COLOR,
              }}
            >
              {cat.img && cat.img[0] ? (
                <CustomFastImage
                  style={{
                    width: "100%",
                    height: "100%",
                    borderRadius: 20,
                  }}
                  source={{ uri: `${cdnUrl}${cat.img[0].uri}` }}
                  cacheKey={`${cat.img[0].uri.split(/[\\/]/).pop()}`}
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
              {cat.nameHE}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Extra: All categories grouped by general category */}
      {Object.keys(categoriesByGeneral).map((generalId) => (
        <View key={generalId} style={{ marginBottom: 24 }}>
          <Text style={{ fontSize: 20, fontWeight: 'bold', marginHorizontal: 16, marginBottom: 8, textAlign: "left" }}>
            {getGeneralCategoryName(generalId)}
          </Text>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={{ paddingVertical: 8, paddingHorizontal: 8 }}
            contentContainerStyle={{ flexDirection: I18nManager.isRTL ? "row" : "row" }}
          >
            {categoriesByGeneral[generalId].map((cat) => (
              <TouchableOpacity
                key={cat.categoryId}
                style={{
                  alignItems: "center",
                  marginHorizontal: 8,
                }}
                onPress={() => {
                  shoofiAdminStore.setSelectedCategory(cat);
                  navigation.navigate('stores-list', { category: cat });
                }}
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
                  {languageStore.selectedLang === "ar" ? cat.nameAR : cat.nameHE}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
      ))}
    </View>
  );
};

export default observer(ExploreScreen);