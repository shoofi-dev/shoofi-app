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
  const imageUrl = `${cdnUrl}${item.img[0].uri}`;
  return (
    <View>
    <TouchableOpacity style={styles.card} onPress={() => onItemSelect(item)}>
      {/* Product Image */}
      <View style={styles.imageWrapper}>
        <CustomFastImage
          source={{ uri: imageUrl }}
          style={styles.image}
          cacheKey={`${APP_NAME}_${imageUrl.split(/[\\/]/).pop()}`}
          resizeMode="contain"
        />
      </View>
    <View style={{marginTop:10}}>
    <Text style={styles.productName}>{productName}</Text>
    <Text style={styles.priceText}>₪{price}</Text>
    </View>

    </TouchableOpacity>




{userDetailsStore.isAdmin() && (
            <View
              style={{
                flexDirection: "row",
                flex: 1,
                width: "100%",
                justifyContent: "space-around",
              }}
            >
              <View style={{ flexBasis: "45%" }}>
                <Button
                  bgColor={themeStyle.ORANGE_COLOR}
                  text={"تعديل"}
                  fontSize={16}
                  onClickFn={() => onEditProduct(item)}
                  textPadding={0}
                  marginH={0}
                  textColor={themeStyle.WHITE_COLOR}
                  icon="cart_icon"
                  iconSize={15}
                  iconMargin={5}
                />
              </View>
              <View style={{ flexBasis: "45%" }}>
                <Button
                  bgColor={"red"}
                  text={t("delete")}
                  fontSize={16}
                  onClickFn={() => onDeleteProduct(item)}
                  textPadding={0}
                  marginH={0}
                  textColor={themeStyle.WHITE_COLOR}
                  icon="cart_icon"
                  iconSize={15}
                  iconMargin={5}
                />
              </View>
            </View>
          )}
    </View>

  );
};

export default observer(ProductItem);

const styles = StyleSheet.create({
  card: {
    backgroundColor: "#fff",
    borderRadius: 18,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.18,
    shadowRadius: 16,
    elevation: 8,
    marginBottom: 8,
    marginHorizontal: 0,
    width: "100%",

    overflow: "hidden",
    alignSelf: "flex-start",
    justifyContent: "flex-start",
    alignItems: "center",
    padding: 10,
  },
  imageWrapper: {
    width: "100%",
    height: 110,
    borderTopLeftRadius: 18,
    borderTopRightRadius: 18,
    overflow: "hidden",
    position: "relative",
  },
  image: {
    width: "100%",
    height: "100%",
    resizeMode: "cover",
    borderTopLeftRadius: 18,
    borderTopRightRadius: 18,
  },
  priceText: {
    color: "#B6D436",
    fontSize: themeStyle.FONT_SIZE_XL,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 4,
  },
  productName: {
    color: themeStyle.GRAY_900,
    fontSize: themeStyle.FONT_SIZE_LG,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 0,
  },
});
