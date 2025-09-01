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
import Counter from "../../../../components/controls/counter";
import StoreChangeConfirmationDialog from "../../../../components/dialogs/store-change-confirmation";

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

  const [isStoreChangeDialogOpen, setIsStoreChangeDialogOpen] = useState(false);
  const [pendingProduct, setPendingProduct] = useState(null);
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

  // Make these reactive to cart store changes
  const isInCart = useMemo(() => cartStore.getProductByProductId(item._id), [cartStore.cartItems, item._id]);
  const productCountInCart = useMemo(() => cartStore.getProductCountInCart(item._id), [cartStore.cartItems, item._id]);

  // Debug logging to help identify the issue
  useEffect(() => {
    if (item && !item._id) {
      console.warn('BigStoreProductItem: item missing _id:', item);
    }
  }, [item]);

  const handleAddToCart = useCallback(
    async (product) => {
      if (ordersStore.orderType == ORDER_TYPE.now && !product.isInStore) {
        // Handle out of stock case if needed
        return;
      }

      const isDifferentStore = await cartStore.isDifferentStore();

      if (isDifferentStore) {
        let tmpProduct: any = {};
        tmpProduct.others = { qty: 1, note: "" };
        tmpProduct.data = { ...product };
        
        // Ensure the product has a valid _id
        if (!tmpProduct.data._id) {
          console.warn('Product missing _id:', product);
          return;
        }
        
        setPendingProduct(tmpProduct);
        setIsStoreChangeDialogOpen(true);
        return;
      }
      
      addProductToCart(product);
    },
    [cartStore, ordersStore.orderType]
  );

  const addProductToCart = useCallback(
    (product) => {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      let tmpProduct: any = {};
      tmpProduct.others = { qty: 1, note: "" };
      tmpProduct.data = { ...product };
      
      // Ensure the product has a valid _id
      if (!tmpProduct.data._id) {
        console.warn('Product missing _id:', product);
        return;
      }
      
      cartStore.addProductToCart(tmpProduct);
    },
    [cartStore]
  );

  const handleStoreChangeApprove = useCallback(async () => {
    await cartStore.resetCartForNewStore();
    // pendingProduct is already a complete product object, so add it directly
    cartStore.addProductToCart(pendingProduct);
    setIsStoreChangeDialogOpen(false);
    setPendingProduct(null);
  }, [cartStore, pendingProduct]);

  const handleStoreChangeCancel = useCallback(() => {
    setIsStoreChangeDialogOpen(false);
    setPendingProduct(null);
  }, []);

  const onUpdateProductCount = useCallback(
    (productId, newCount) => {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      if (newCount === 0) {
        // Remove product from cart when count reaches 0
        const cartItem = cartStore.getProductByProductId(productId);
        if (cartItem) {
          const index = cartStore.cartItems.findIndex(item => item.data._id === productId);
          if (index !== -1) {
            // Use the cart store's removeProduct method with the correct ID format
            const productIdWithIndex = `${productId}${index}`;
            cartStore.removeProduct(productIdWithIndex);
          }
        }
      } else {
        // Update product count in cart
        const cartItem = cartStore.getProductByProductId(productId);
        if (cartItem) {
          const index = cartStore.cartItems.findIndex(item => item.data._id === productId);
          if (index !== -1) {
            // Use the cart store's updateProductCount method with the correct ID format
            const productIdWithIndex = `${productId}${index}`;
            cartStore.updateProductCount(productIdWithIndex, newCount);
          }
        }
      }
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
    <View>
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

        {/* Add button or Counter */}
        {isInStore ? (
          isInCart ? (
            <View style={styles.counterContainer}>
              <Counter
                value={productCountInCart}
                minValue={0}
                onCounterChange={(value) => onUpdateProductCount(item._id, value)}
                isBGGlass={true}
              />
            </View>
          ) : (
            <TouchableOpacity
              onPress={() => handleAddToCart(item)}
              style={styles.addButton}
              activeOpacity={0.8}
            >
              <GlassBG style={styles.addButtonInner}>
                <Icon icon="plus" size={10} color={themeStyle.WHITE_COLOR} />
              </GlassBG>
            </TouchableOpacity>
          )
        ) : (
          <View style={styles.notInStore}>
            <Text style={styles.notInStoreText}>{t("not-in-store")}</Text>
          </View>
        )}
      </View>
      <View style={styles.rowTextContainer}>
        <Text style={styles.rowProductName} numberOfLines={1}>{productName}</Text>
        <Text style={styles.rowProductDesc} numberOfLines={1}>
          {productDescription}
        </Text>
        <Text style={styles.rowPriceText}>₪{price}</Text>
      </View>
    </TouchableOpacity>

    <StoreChangeConfirmationDialog
      isOpen={isStoreChangeDialogOpen}
      onApprove={handleStoreChangeApprove}
      onCancel={handleStoreChangeCancel}
    />
    </View>
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
    fontSize: themeStyle.FONT_SIZE_XS,
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
    right: 5,
    bottom: -12,
    width: 32,
    height: 32,
    borderRadius: 100,
    alignItems: "center",
    justifyContent: "center",
  },
  addButtonInner: {
    width: "100%",
    height: "100%",
    borderRadius: 100,
    alignItems: "center",
    justifyContent: "center",
  },
  counterContainer: {
    position: "absolute",
    right: 5,
    bottom: -12,
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
