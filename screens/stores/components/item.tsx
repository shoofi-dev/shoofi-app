import {
  StyleSheet,
  View,
  Image,
  TouchableOpacity,
  I18nManager,
  ActivityIndicator,
} from "react-native";
import { useContext, useState, useMemo, useCallback, useEffect } from "react";
import { observer } from "mobx-react";
import { useTranslation } from "react-i18next";
import Text from "../../../components/controls/Text";
import themeStyle from "../../../styles/theme.style";
import CustomFastImage from "../../../components/custom-fast-image";
import { StoreContext } from "../../../stores";
import { useNavigation } from "@react-navigation/native";
import { cdnUrl, SHIPPING_METHODS } from "../../../consts/shared";
import Icon from "../../../components/icon";

const TAG_STYLE = {
  backgroundColor: themeStyle.PRIMARY_COLOR,
  borderRadius: 16,
  paddingHorizontal: 12,
  paddingVertical: 6,
  marginRight: 8,
  marginBottom: 8,
  fontSize: 14,
  color: themeStyle.GRAY_700,
};

export type TProps = {
  storeItem: any; 
  searchProducts?: any;

  isExploreScreen?: boolean;  
  coupon?: any;
};

const StoreItem = ({ storeItem, searchProducts, isExploreScreen }: TProps) => {
  const { t } = useTranslation();
  const navigation = useNavigation();
  const [isLoading, setIsLoading] = useState(false);
  const [coupon, setCoupon] = useState(null);
  let { menuStore, cartStore, shoofiAdminStore, languageStore, couponsStore } =
    useContext(StoreContext);
    console.log("couponsStore",couponsStore.activeCoupons);

    useEffect(() => {
      console.log("couponsStore",couponsStore.activeCoupons);
      couponsStore.activeCoupons.forEach(coupon => {
        if(coupon.applicableTo.stores.includes(storeItem.store.appName)) {
          setCoupon(coupon);
        }
      });
    }, [couponsStore.activeCoupons]);

    console.log("coupon",coupon);

  // Memoized store selection handler
  const onStoreSelect = useCallback(async (store: any, product?: any) => {
    try {
      if(isCoomingSoon) {
        return;
      }
      await cartStore.setShippingMethod(SHIPPING_METHODS.takAway);
      menuStore.clearMenu();
      await shoofiAdminStore.setStoreDBName(store.appName);
      (navigation as any).navigate("menuScreen", { fromStoresList: Date.now(), productId: product?._id });
    } catch (error) {
      console.error("Error loading store:", error);
    }
  }, [cartStore, menuStore, shoofiAdminStore, navigation]);

  // Memoized computed values
  const isNew = useMemo(() => storeItem.store.isNew || false, [storeItem.store.isNew]);
  const rating = useMemo(() => storeItem.store.rating || 4.1, [storeItem.store.rating]);
  const distance = useMemo(() => storeItem.store.distance || 1.6, [storeItem.store.distance]);
  const deliveryTime = useMemo(() => storeItem.store.deliveryTime || 27, [storeItem.store.deliveryTime]);
  const location = useMemo(() => storeItem.store.location || "כפר קאסם", [storeItem.store.location]);
  const deliveryPrice = useMemo(() => storeItem.deliveryPrice || 10, [storeItem.deliveryPrice]);
  const isCoomingSoon = useMemo(() => storeItem.store.isCoomingSoon || false, [storeItem.store.isCoomingSoon]);
  const isOpen = useMemo(() => storeItem.store.isOpen !== false && !isCoomingSoon, [storeItem.store.isOpen, isCoomingSoon]);
  const isBusy = useMemo(() => storeItem.store.isBusy && isOpen || false, [storeItem.store.isBusy, isOpen]);

  const logoUri = useMemo(() => storeItem.store.storeLogo?.uri, [storeItem.store.storeLogo?.uri]);
  const isCouponAvailable = useMemo(() => isOpen && coupon && !isBusy, [coupon, isOpen, isBusy]);
  const imageUri = useMemo(() => 
    (storeItem.store?.cover_sliders &&
      storeItem.store.cover_sliders.length > 0 &&
      storeItem.store?.cover_sliders[0]?.uri) ||
    logoUri,
    [storeItem.store?.cover_sliders, logoUri]
  );
  const storeName = useMemo(() => 
    languageStore.selectedLang === "ar" ? storeItem.store.name_ar : storeItem.store.name_he,
    [languageStore.selectedLang, storeItem.store.name_ar, storeItem.store.name_he]
  );

  const storeDescription = useMemo(() => 
    languageStore.selectedLang === "ar" ? storeItem.store.descriptionAR : storeItem.store.descriptionHE,
    [languageStore.selectedLang, storeItem.store.descriptionAR, storeItem.store.descriptionHE]
  );
  // Memoized product selection handler
  const handleProductSelect = useCallback((product) => {
    onStoreSelect(storeItem.store, product);
  }, [onStoreSelect, storeItem.store]);

  const getCouponIcon = useMemo(() => {
    if(!coupon) {
      return null;
    }
    if(coupon.discountType === "delivery") {
      return "bicycle1";
    }
    return "present1";
  }, [coupon]);

  return (
    <TouchableOpacity
      onPress={() => onStoreSelect(storeItem.store)}
      style={styles.card}
      activeOpacity={0.9}
      disabled={isLoading}
    >
      {/* Store Image */}
      <View style={{    width: "100%",
    height: isExploreScreen ? 136 : 216, 
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    overflow: "hidden",
    position: "relative",
    backgroundColor: "#eee",}}>
        <CustomFastImage
          style={styles.image}
          source={{ uri: `${cdnUrl}${storeItem?.store?.cover_sliders?.[0]?.uri}` }}
          resizeMode="cover"
        />
      </View>
      {logoUri && (
        <View style={[styles.logoOverlay, isExploreScreen ? {top: 105} : {}]}>
          <CustomFastImage
            style={[styles.logo, isExploreScreen ? {width: 40, height: 40} : {}]}  
            source={{ uri: `${cdnUrl}${logoUri}` }}
            isLogo={true}
          />
        </View>
      )}
      {isCoomingSoon && <View style={{position: "absolute", top: isExploreScreen ? 100 : 170, left: 10, backgroundColor: themeStyle.SECONDARY_COLOR, paddingHorizontal: 10, paddingVertical: 2, borderRadius: 50, flexDirection:"row",alignItems:"center", justifyContent:"center"}}>
        <Text style={[styles.isComingSoonText, isExploreScreen ? {fontSize: themeStyle.FONT_SIZE_XS} : {}]}>{t("coming-soon")}</Text>
      </View>}
      {isBusy && <View style={{position: "absolute", top: isExploreScreen ? 100 : 170, left: 10, backgroundColor: themeStyle.GRAY_40, paddingHorizontal: 10, paddingVertical: 2, borderRadius: 50}}>
        <Text style={[styles.storeStatusText, isExploreScreen ? {fontSize: themeStyle.FONT_SIZE_XS} : {}]}>{t("store-busy")}</Text>
      </View>}
      {!isOpen && !isBusy && !isCoomingSoon && <View style={{position: "absolute", top: isExploreScreen ? 100 : 170, left: 10, backgroundColor: themeStyle.GRAY_40, paddingHorizontal: 10, paddingVertical: 2, borderRadius: 50}}>
        <Text style={[styles.storeStatusText, isExploreScreen ? {fontSize: themeStyle.FONT_SIZE_XS} : {}]}>{t("store-closed")}</Text>
      </View>}
      {isCouponAvailable && <View style={{position: "absolute", top: isExploreScreen ? 100 : 170, left: 10, backgroundColor: themeStyle.PRIMARY_COLOR, paddingHorizontal: 10, paddingVertical: 2, borderRadius: 50, flexDirection:"row",alignItems:"center", justifyContent:"center"}}>
        <Icon icon={getCouponIcon} size={16} color={themeStyle.SECONDARY_COLOR} style={{marginRight: 5}} />
        <Text style={[styles.freeDeliveryText, isExploreScreen ? {fontSize: themeStyle.FONT_SIZE_XS} : {}]}>{coupon.storeTagName}</Text>
      </View>}
      {/* Card Content */}
      <View style={styles.content}>
        <View style={styles.row}>
          <Text style={[styles.storeName, isExploreScreen ? {fontSize: themeStyle.FONT_SIZE_SM} : {}]} numberOfLines={1}>{storeName}</Text>
        </View>
        {/* <View style={styles.infoRow}>
          <View >
            <Text style={styles.infoText}>{distance} {t("km")}</Text>
          </View>
          <View style={{marginHorizontal: 5,}}>
            <Text>-</Text>
          </View>
          <View style={{}}>
            <Text style={[styles.openStatus, {color: isOpen ? themeStyle.SUCCESS_COLOR : themeStyle.ERROR_COLOR}]}>
              {isOpen ? t("open") : t("closed")}
            </Text>
          </View>
        </View> */}
    
        {storeItem.store.description && <Text style={styles.descText} >
         {storeDescription}
        </Text>}

        {searchProducts && searchProducts.length > 0 && (
            <View style={{ flexDirection: 'row', flexWrap: 'wrap',  alignItems: 'center', marginTop: 10,  }}>
            {searchProducts.map((product) => (
              <TouchableOpacity
                key={product._id}
                onPress={() => handleProductSelect(product)}
                style={TAG_STYLE}
              >
                <Text style={{ color: '#333', fontSize: 14 }}>
                  {product.nameAR || product.nameHE}
                </Text>
              </TouchableOpacity>
            ))}
           
          </View>
          )}
      </View>
    </TouchableOpacity>
  );
};
export default observer(StoreItem);

const styles = StyleSheet.create({
  card: {
    backgroundColor: "#fff",
    borderRadius: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 6,
    marginBottom: 16,
    marginTop: 8,
    marginHorizontal: 0,
    width: "95%",
    alignSelf: "center",
    borderWidth: 0,
  },
  imageWrapper: {

  },
  image: {
    width: "100%",
    height: "100%",
    resizeMode: "cover",
  },
  logoOverlay: {
    position: "absolute",
    top: 170,
    right: 8,
    backgroundColor: "#fff",
    borderRadius: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
    borderWidth: 1,
    borderColor: themeStyle.GRAY_30,
  },
  logo: {
    width: 64,  
    height: 64,
    borderRadius: 8,
 
  },
  favoriteIcon: {
    position: "absolute",
    top: 10,
    left: 10,
    backgroundColor: "rgba(255, 255, 255, 0.5)",
    borderRadius: 16,
    padding: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  content: {
    padding: 14,
    paddingBottom: 10,
  },
  row: {
    flexDirection: "row-reverse",
    alignItems: "center",
    marginBottom: 4,
    justifyContent: "flex-end",
  },
  storeName: {
    fontSize: themeStyle.FONT_SIZE_LG,
    fontWeight: "700",
    color: themeStyle.GRAY_700,
    textAlign: "right",
    flexShrink: 1,
    flex: 0,
  },
  infoRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 2,
  },
  infoText: {
    fontSize: 14,
    color: themeStyle.GRAY_700,
    opacity: 0.8,
    textAlign: "left",
  },
  openStatus: {
    color: "#2ecc40",
    fontWeight: "bold",
    marginLeft: 5,
  },
  descText: {
    fontSize: 13,
    color: themeStyle.GRAY_700,
    opacity: 0.7,
    marginTop: 4,
    textAlign: "left",
  },
  loadingOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(255, 255, 255, 0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    fontSize: 16,
    fontWeight: "bold",
    color: themeStyle.PRIMARY_COLOR,
  },
  storeStatus: {
    position: "absolute",
    bottom: 10,
    left: 10,
    backgroundColor: themeStyle.GRAY_40,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 10,
  },
  storeStatusText: {
    fontSize: themeStyle.FONT_SIZE_SM,
    color: themeStyle.GRAY_80,
  },
  freeDeliveryText: {
    fontSize: themeStyle.FONT_SIZE_SM,
    color: themeStyle.SECONDARY_COLOR,
    marginBottom: 2,
  },
  isComingSoonText: {
    fontSize: themeStyle.FONT_SIZE_SM,
    color: themeStyle.PRIMARY_COLOR,
    marginBottom: 2,
  },
});
