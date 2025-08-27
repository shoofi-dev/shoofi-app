import React from "react";
import {
  StyleSheet,
  View,
  TouchableOpacity,
  Image,
  ImageBackground,
  I18nManager,
  Platform,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import { useState, useRef, useEffect, useMemo, useCallback } from "react";
import { observer } from "mobx-react";
import { useContext } from "react";
import { StoreContext } from "../../../../stores";
import { ScrollView } from "react-native-gesture-handler";
import Text from "../../../../components/controls/Text";
import themeStyle from "../../../../styles/theme.style";
import { getCurrentLang } from "../../../../translations/i18n";
import * as Haptics from "expo-haptics";
import Button from "../../../../components/controls/button/button";
import {
  cdnUrl,
  ORDER_TYPE,
  devicesType,
  APP_NAME,
} from "../../../../consts/shared";
import { LinearGradient } from "expo-linear-gradient";
import { useTranslation } from "react-i18next";
import _useDeviceType from "../../../../hooks/use-device-type";
import CustomFastImage from "../../../../components/custom-fast-image";
import GlassBG from "../../../../components/glass-background";
import Icon from "../../../../components/icon";
import DashedLine from "react-native-dashed-line";

export type TProps = {
  item: any;
  onItemSelect: (item: any) => void;
  onDeleteProduct: (item: any) => void;
  onEditProduct: (item: any) => void;
};

const BigStoreProductItem = ({
  item,
  onItemSelect,
  onDeleteProduct,
  onEditProduct,
}: TProps) => {
  const { t } = useTranslation();

  const {
    userDetailsStore,
    languageStore,
    cartStore,
    ordersStore,
    storeDataStore,
  } = useContext(StoreContext);
  const { deviceType } = _useDeviceType();
  // Memoize expensive calculations
  const isDisabled = useMemo(() => {
    return !userDetailsStore.isAdmin() && item.count == 0;
  }, [userDetailsStore.isAdmin(), item.count]);

  const isInStore = useMemo(() => {
    if (!item.isInStore) {
      return false;
    }
    return true;
  }, [ordersStore.orderType, item.isInStore]);

  const getOutOfStockMessage = useCallback(
    (item) => {
      if (item.notInStoreDescriptionAR || item.notInStoreDescriptionHE) {
        return languageStore.selectedLang === "ar"
          ? item.notInStoreDescriptionAR
          : item.notInStoreDescriptionHE;
      }
      return t("call-store-to-order");
    },
    [languageStore.selectedLang, t]
  );

  const isInCart = cartStore.getProductByProductId(item._id);
  const productCountInCart = cartStore.getProductCountInCart(item._id);

  const onAddToCart = useCallback(
    (product) => {
      let tmpProduct: any = {};
      tmpProduct.others = { count: 1, note: "" };
      tmpProduct.data = product;
      cartStore.addProductToCart(tmpProduct);
    },
    [cartStore]
  );

  // Memoize computed values
  const productName = useMemo(() => {
    return languageStore.selectedLang === "ar" ? item.nameAR : item.nameHE;
  }, [languageStore.selectedLang, item.nameAR, item.nameHE]);

  const productDescription = useMemo(() => {
    return languageStore.selectedLang === "ar"
      ? item.descriptionAR
      : item.descriptionHE;
  }, [languageStore.selectedLang, item.descriptionAR, item.descriptionHE]);

  const price = useMemo(() => item.price, [item.price]);

  const imageUrl = useMemo(() => {
    return `${cdnUrl}${item?.img?.[0]?.uri}`;
  }, [item?.img?.[0]?.uri]);

  const handleItemPress = useCallback(() => {
    if (!isInStore) {
      return;
    }
    onItemSelect(item);
  }, [onItemSelect, item]);

  return (
    <TouchableOpacity
      style={{
        shadowColor: themeStyle.BLACK_COLOR,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: Platform.OS === "ios" ? 0.1 : 0.9, 
        shadowRadius: 5,
        elevation: 5,
        backgroundColor: "#fff",
        borderRadius: 10,
        height: 200,
        
      }}
      onPress={handleItemPress}
    >
      <View style={styles.rowCard}>
        {/* Product Image on the right */}
        <View style={styles.rowImageWrapper}>
          <CustomFastImage source={{ uri: imageUrl }} style={styles.rowImage} resizeMode="stretch" />
        </View>
        {/* Text and price on the left */}

        {/* Add button */}
        {isInStore ? (
          <GlassBG style={styles.addButton}>
            <Icon icon="plus" size={10} color={themeStyle.WHITE_COLOR} />
          </GlassBG>
        ) : (
          <View style={styles.notInStore}>
            <Text style={styles.notInStoreText}>{t("not-in-store")}</Text>
          </View>
        )}
        {isInCart && (
          <View style={styles.countContainerWrapper}>
            <View style={styles.countContainer}>
              <Text style={styles.countText}>{productCountInCart}</Text>
            </View>
          </View>
        )}
      </View>
      <View style={styles.rowTextContainer}>
        <Text style={styles.rowProductName} numberOfLines={2}>{productName}</Text>
        <Text style={styles.rowProductDesc} numberOfLines={2}>
          {productDescription}
        </Text>
        <Text style={styles.rowPriceText}>₪{price}</Text>
      </View>
    </TouchableOpacity>
  );
};

export default observer(BigStoreProductItem);

const styles = StyleSheet.create({
  rowCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    borderTopLeftRadius: 10,
    borderTopRightRadius: 10,
  },
  rowImageWrapper: {
    width: "100%",
    height: 96,
    overflow: "hidden",
    backgroundColor: "#f3f3f3",
    borderTopLeftRadius: 10,
    borderTopRightRadius: 10,
  },
  rowImage: {
    width: "100%",
    height: "100%",
    resizeMode: "cover",
    borderTopLeftRadius: 10,
    borderTopRightRadius: 10,
  },
  rowTextContainer: {
    height: "100%",
    marginHorizontal: 12,
    justifyContent: "center",
    alignItems: "flex-start",
    flex: 1,
  },
  rowProductName: {
    fontSize: themeStyle.FONT_SIZE_SM,
    color: themeStyle.GRAY_900,
    marginBottom: 2,
    textAlign: "right",
  },
  rowProductDesc: {
    fontSize: themeStyle.FONT_SIZE_SM,
    color: themeStyle.GRAY_60,
    marginBottom: 4,
  },
  rowPriceText: {
    color: "#232323",
    fontSize: 15,
    fontWeight: "bold",
    textAlign: "right",
  },
  addButton: {
    position: "absolute",
    left: 10,
    bottom: 10,
    width: 36,
    height: 36,
    borderRadius: 100,
    alignItems: "center",
    justifyContent: "center",
  },
  addButtonText: {
    fontSize: 22,
    color: themeStyle.GRAY_300,
    fontWeight: "bold",
    textAlign: "center",
  },
  countContainerWrapper: {
    borderRadius: 100,
    width: 32,
    height: 32,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: themeStyle.PRIMARY_COLOR,
  },
  countContainer: {
    backgroundColor: themeStyle.PRIMARY_COLOR,
    borderRadius: 100,
    width: 24,
    height: 24,
    alignItems: "center",
    justifyContent: "center",
  },
  countText: {
    fontSize: themeStyle.FONT_SIZE_SM,
    color: themeStyle.SECONDARY_COLOR,
    fontWeight: "bold",
    textAlign: "center",
  },
  notInStore: {
    backgroundColor: themeStyle.GRAY_40,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 100,
    position: "absolute",
    left: 12,
    bottom: 25,
  },
  notInStoreText: {
    fontSize: themeStyle.FONT_SIZE_XS,
    fontWeight: "bold",
    textAlign: "center",
  },
});
