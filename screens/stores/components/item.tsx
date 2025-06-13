import {
  StyleSheet,
  View,
  Image,
  TouchableOpacity,
  I18nManager,
} from "react-native";
import { useContext } from "react";
import { observer } from "mobx-react";
import { useTranslation } from "react-i18next";
import Text from "../../../components/controls/Text";
import themeStyle from "../../../styles/theme.style";
import CustomFastImage from "../../../components/custom-fast-image";
import { StoreContext } from "../../../stores";
import { useNavigation } from "@react-navigation/native";
import Icon from "react-native-vector-icons/MaterialCommunityIcons";
import { cdnUrl } from "../../../consts/shared";

export type TProps = {
  storeItem: any;
};

const StoreItem = ({ storeItem }: TProps) => {
  const { t } = useTranslation();
  const navigation = useNavigation();
  let { menuStore, storeDataStore, shoofiAdminStore } =
    useContext(StoreContext);
  const onStoreSelect = async (store: any) => {
    await shoofiAdminStore.setStoreDBName(store.appName);
    await menuStore.getMenu();
    await storeDataStore.getStoreData();
    (navigation as any).navigate("menuScreen");
  };
  // Placeholder values for demo
  const isNew = storeItem.store.isNew || false;
  const rating = storeItem.store.rating || 4.1;
  const distance = storeItem.store.distance || 1.6;
  const deliveryTime = storeItem.store.deliveryTime || 27;
  const location = storeItem.store.location || "כפר קאסם";
  const deliveryPrice = storeItem.deliveryPrice || 10;
  const isOpen = storeItem.store.isOpen !== false; // true by default
  const logoUri = storeItem.store.storeLogo?.uri;
  const imageUri =
    (storeItem.store?.cover_sliders &&
      storeItem.store.cover_sliders.length > 0 &&
      storeItem.store?.cover_sliders[0]?.uri) ||
    logoUri;
  const storeName = storeItem.store.name_he || storeItem.store.name_ar;
  if (
    storeItem.store.cover_sliders &&
    storeItem.store.cover_sliders.length > 0
  ) {
    console.log("storeItem", storeItem.store.cover_sliders[0]);
  }
  return (
    <TouchableOpacity
      onPress={() => onStoreSelect(storeItem.store)}
      style={styles.card}
      activeOpacity={0.9}
    >
      {/* Store Image */}
      <View style={styles.imageWrapper}>
        <CustomFastImage
          style={styles.image}
          source={{ uri: `${cdnUrl}${imageUri}` }}
          cacheKey={`${cdnUrl}${imageUri?.split(/[\\/]/).pop()}1`}
          resizeMode="cover"
        />
        {/* Logo overlay */}

        {/* Favorite icon */}
        <View style={styles.favoriteIcon}>
          <Icon
            name="heart-outline"
            size={24}
            color={"#3B3B3B"}
          />
        </View>
      </View>
      {logoUri && (
        <View style={styles.logoOverlay}>
          <CustomFastImage
            style={styles.logo}
            source={{ uri: `${cdnUrl}${logoUri}` }}
            cacheKey={`${cdnUrl}${logoUri?.split(/[\\/]/).pop()}1`}
            resizeMode="cover"
          />
        </View>
      )}
      {/* Card Content */}
      <View style={styles.content}>
        <View style={styles.row}>
          <Text style={styles.storeName}>{storeName}</Text>
        </View>
        <View style={styles.infoRow}>
          <View>
            <Text style={styles.infoText}>{rating} ★</Text>
          </View>
          <View>
            <Text style={styles.infoText}>· {distance} ק"מ · </Text>
          </View>
          <View>
            <Text style={styles.openStatus}>
              {isOpen ? t("פתוח") : t("סגור")}
            </Text>
          </View>
        </View>
        <View style={styles.infoRow}>
          <Text style={styles.infoText}>
             · ₪{deliveryPrice}
          </Text>
        </View>
        <Text style={styles.descText} >
          שורה המסעדה שמופיע על כרטיס
        </Text>
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
  },
  imageWrapper: {
    width: "100%",
    height: 160,
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    overflow: "hidden",
    position: "relative",
    backgroundColor: "#eee",
  },
  image: {
    width: "100%",
    height: "100%",
    resizeMode: "cover",
  },
  logoOverlay: {
    position: "absolute",
    top: 120,
    right: 8,
    backgroundColor: "#fff",
    borderRadius: 10,
    padding: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  logo: {
    width: 64,
    height: 64,
    borderRadius: 8,
    resizeMode: "cover",
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
    fontSize: 17,
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
  },
  descText: {
    fontSize: 13,
    color: themeStyle.GRAY_700,
    opacity: 0.7,
    marginTop: 4,
    textAlign: "left",
  },
});
