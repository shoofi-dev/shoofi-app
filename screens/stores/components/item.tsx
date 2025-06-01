import { StyleSheet, View, Image, TouchableOpacity, I18nManager } from "react-native";
import { useContext } from "react";
import { observer } from "mobx-react";
import { useTranslation } from "react-i18next";
import Text from "../../../components/controls/Text";
import themeStyle from "../../../styles/theme.style";
import CustomFastImage from "../../../components/custom-fast-image";
import { StoreContext } from "../../../stores";
import { useNavigation } from "@react-navigation/native";
import Icon from "react-native-vector-icons/MaterialCommunityIcons";

export type TProps = {
    storeItem: any;
}

const StoreItem = ({storeItem}: TProps) => {
  const { t } = useTranslation();
  const navigation = useNavigation();
  let {
    menuStore,
    storeDataStore,
    shoofiAdminStore,
  } = useContext(StoreContext);
  const onStoreSelect = async (store: any) => {
    await shoofiAdminStore.setStoreDBName(store.appName);
    await menuStore.getMenu();
    await storeDataStore.getStoreData();
    (navigation as any).navigate("menuScreen");
  };
  // Placeholder values for demo
  const isNew = storeItem.isNew || false;
  const rating = storeItem.rating || 4.1;
  const distance = storeItem.distance || 1.6;
  const deliveryTime = storeItem.deliveryTime || 27;
  const location = storeItem.location || "כפר קאסם";
  const deliveryPrice = storeItem.deliveryPrice || 10;

  // Log all values to debug object rendering
  console.log('storeName', storeItem.storeName);


  // Defensive: ensure only strings/numbers are rendered
  const safeStoreName = typeof storeItem.storeName === 'string' || typeof storeItem.storeName === 'number' ? storeItem.storeName : '';
  const safeLocation = typeof location === 'string' || typeof location === 'number' ? location : (location && location.name ? location.name : '');
  const safeNew = typeof t("חדש") === 'string' || typeof t("חדש") === 'number' ? t("חדש") : '';
  const safeRating = typeof rating === 'string' || typeof rating === 'number' ? rating : '';
  const safeDistance = typeof distance === 'string' || typeof distance === 'number' ? distance : '';
  const safeDeliveryTime = typeof deliveryTime === 'string' || typeof deliveryTime === 'number' ? deliveryTime : '';
  const safeDeliveryPrice = typeof deliveryPrice === 'string' || typeof deliveryPrice === 'number' ? deliveryPrice : '';

  return (
    <TouchableOpacity
      onPress={() => onStoreSelect(storeItem)}
      style={styles.card}
      activeOpacity={0.9}
    >
      {/* Store Image */}
      <View style={styles.imageWrapper}>
        <CustomFastImage
          style={styles.image}
          source={{ uri: `${storeItem.storeLogo}` }}
          cacheKey={`${storeItem.storeLogo?.split(/[\\/]/).pop()}1`}
        />
        {/* New badge */}
        {isNew && (
          <View style={styles.newBadge}>
            <Text style={styles.newBadgeText}>{safeNew}</Text>
          </View>
        )}
      </View>
      {/* Card Content */}
      <View style={styles.content}>
        <View style={styles.row}>
          {/* Heart icon */}
          <Icon name="heart-outline" size={20} color={themeStyle.GRAY_700} style={styles.heartIcon} />
          {/* Store name */}
          <Text style={styles.storeName} numberOfLines={1} ellipsizeMode="tail">{safeStoreName}</Text>
        </View>
        <View style={styles.infoRow}>
          <Text style={styles.infoText}>★ {safeRating}{" "}·{" "} {safeDistance}{" "} ק"מ {" "}·{" "} {safeDeliveryTime} דקות</Text>
        </View>
        <View style={styles.infoRow}>
          <Text style={styles.infoText}>{safeLocation} ₪{safeDeliveryPrice} {" "}·{" "} כפר קאסם</Text>
        </View>
      </View>
    </TouchableOpacity>
  );
};
export default observer(StoreItem);

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#fff',
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.22,
    shadowRadius: 1,
    elevation: 12,
    marginBottom: 16,
    marginTop: 8,
    marginHorizontal: 8,
    width: 180,
    overflow: 'visible',
    alignSelf: 'flex-start',
  },
  imageWrapper: {
    width: '100%',
    height: 100,
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    overflow: 'hidden',
    position: 'relative',
  },
  image: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  newBadge: {
    position: 'absolute',
    top: 8,
    [I18nManager.isRTL ? 'right' : 'left']: 8,
    backgroundColor: '#fff',
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  newBadgeText: {
    color: themeStyle.SECONDARY_COLOR,
    fontWeight: 'bold',
    fontSize: 14,
    textAlign: 'right',
  },
  content: {
    padding: 12,
    paddingBottom: 10,
  },
  row: {
    flexDirection: I18nManager.isRTL ? 'row-reverse' : 'row',
    alignItems: 'center',
    marginBottom: 4,
    justifyContent:'space-between',
  },
  heartIcon: {
  
  },
  storeName: {
    fontSize: 16,
    fontWeight: '700',
    color: themeStyle.GRAY_700,
    textAlign: 'right',
    flexShrink: 1,
    flex: 0,
  },
  infoRow: {
    flexDirection: I18nManager.isRTL ? 'row-reverse' : 'row',
    alignItems: 'center',
    marginTop: 2,
    justifyContent: 'flex-end',
  },
  infoText: {
    fontSize: 13,
    color: themeStyle.GRAY_700,
    opacity: 0.8,
    textAlign: 'right',
    width: '100%',
    flexDirection:'row',
  },
});
