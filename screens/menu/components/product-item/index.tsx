import {
  StyleSheet,
  View,
  TouchableOpacity,
  Image,
  ImageBackground,
  I18nManager,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import { useState, useRef, useEffect } from "react";
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
export type TProps = {
  item: any;
  onItemSelect: (item: any) => void;
  onDeleteProduct: (item: any) => void;
  onEditProduct: (item: any) => void;
};
const ProductItem = ({
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

  const isDisabled = (item) => {
    return !userDetailsStore.isAdmin() && item.count == 0;
  };
  const isInStore = (item) => {
    if (ordersStore.orderType == ORDER_TYPE.now && !item.isInStore) {
      return false;
    }
    return true;
  };

  const getOutOfStockMessage = (item) => {
    if (item.notInStoreDescriptionAR || item.notInStoreDescriptionHE) {
      return languageStore.selectedLang === "ar"
        ? item.notInStoreDescriptionAR
        : item.notInStoreDescriptionHE;
    }
    return t("call-store-to-order");
  };

  const isInCart = cartStore.getProductByProductId(item._id);
  const productCountInCart = cartStore.getProductCountInCart(item._id);
  const onAddToCart = (prodcut) => {
    // DeviceEventEmitter.emit(`add-to-cart-animate`, {
    //   imgUrl: meal.data.img,
    // });
    // cartStore.resetCart();
    let tmpProduct: any = {};
    tmpProduct.others = { count: 1, note: "" };
    tmpProduct.data = prodcut;
    cartStore.addProductToCart(tmpProduct);
  };

  const productName =
    languageStore.selectedLang === "ar" ? item.nameAR : item.nameHE;
  const price = item.price;
  const imageUrl = `${cdnUrl}${item?.img?.[0]?.uri}`;
  return (
    <TouchableOpacity style={styles.rowCard} onPress={() => onItemSelect(item)}>
      {/* Product Image on the right */}
      <View style={styles.rowImageWrapper}>
        <CustomFastImage source={{ uri: imageUrl }} style={styles.rowImage} />
      </View>
      {/* Text and price on the left */}
      <View style={styles.rowTextContainer}>
        <Text style={styles.rowProductName}>{productName}</Text>
        <Text style={styles.rowProductDesc}>
          {languageStore.selectedLang === "ar" ? item.descriptionAR : item.descriptionHE}
        </Text>
        <Text style={styles.rowPriceText}>₪{price}</Text>
      </View>
      {/* Add button */}
      <GlassBG style={styles.addButton}>
          <Icon icon="plus" size={10} color={themeStyle.WHITE_COLOR} />
      </GlassBG>
      {isInCart && (
        <View style={styles.countContainerWrapper}>
          <View style={styles.countContainer}>
            <Text style={styles.countText}>{productCountInCart}</Text>
          </View>
        </View>
      )}
    </TouchableOpacity>
  );
};

export default observer(ProductItem);

const styles = StyleSheet.create({
  rowCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    borderRadius: 16,
    marginHorizontal: 8,
    borderBottomWidth: 1,
    borderColor: themeStyle.GRAY_20,
    paddingVertical: 20,

  },
  rowImageWrapper: {
    width: 96,
    height: 96,
    borderRadius: 12,
    overflow: "hidden",
    marginLeft: 8,
    backgroundColor: "#f3f3f3",
  },
  rowImage: {
    width: "100%",
    height: "100%",
    borderRadius: 12,
    resizeMode: "cover",
  },
  rowTextContainer: {
    flex: 1,
    marginHorizontal: 12,
    justifyContent: "center",
  },
  rowProductName: {
    fontSize: themeStyle.FONT_SIZE_MD,
    color: themeStyle.GRAY_900,
    marginBottom: 2,
    textAlign: "right",
  },
  rowProductDesc: {
    fontSize: themeStyle.FONT_SIZE_SM,
    color: themeStyle.GRAY_60,
    marginBottom: 4,
    textAlign: "right",
  },
  rowPriceText: {
    color: "#232323",
    fontSize: 15,
    fontWeight: "bold",
    textAlign: "right",
  },
  addButton: {
    position: "absolute",
    left: 12,
    bottom: 25,
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
});
