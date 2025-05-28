import React from "react";
import { View, Text, Image, TouchableOpacity, StyleSheet, I18nManager } from "react-native";
import Icon from "../../../components/icon";
import themeStyle from "../../../styles/theme.style";

interface StoreHeaderCardProps {
  store: any;
  onBack?: () => void;
  onFavorite?: () => void;
}

const StoreHeaderCard: React.FC<StoreHeaderCardProps> = ({ store, onBack, onFavorite }) => {
  // Use store fields with fallbacks
  const storeImage = store?.coverImage || "https://images.unsplash.com/photo-1504674900247-0877df9cc836";
  const storeLogo = store?.storeLogo || "https://cdn-icons-png.flaticon.com/512/3075/3075977.png";
  const storeName = store?.storeName || "הקרים";
  const rating = store?.rating || 4.7;
  const deliveryTime = store?.deliveryTime || 20;
  const deliveryPrice = store?.deliveryPrice || 10;
  const minOrder = store?.minOrder || 120;
  const closingHour = store?.closingHour || "23:00";

  return (
    <View style={styles.cardWrapper}>
      {/* Store Image with overlay icons */}
      <View style={styles.imageContainer}>
        <Image source={{ uri: storeImage }} style={styles.image} />
        {/* Back Button */}
        <TouchableOpacity style={[styles.iconButton, styles.backButton]} onPress={onBack}>
          <View style={styles.circle}>
            <Icon name={I18nManager.isRTL ? "chevron-right" : "chevron-left"} size={28} color="#222" />
          </View>
        </TouchableOpacity>
        {/* Heart Icon */}
        <TouchableOpacity style={[styles.iconButton, styles.heartButton]} onPress={onFavorite}>
          <View style={styles.circle}>
            <Icon name="heart" size={22} color={themeStyle.SECONDARY_COLOR} />
          </View>
        </TouchableOpacity>
        {/* Store Logo Overlapping Bottom Right */}
        <View style={styles.logoWrapperOverlap}>
          <Image source={{ uri: storeLogo }} style={styles.logoOverlap} />
        </View>
      </View>
      {/* Store Name Centered */}
      <Text style={styles.storeNameCentered}>{storeName}</Text>
      {/* Info Row Centered */}
      <View style={styles.infoRowCentered}>
        <Text style={styles.infoTextCentered}>{rating} <Icon name="star" size={16} color="#FFC107" /></Text>
        <Text style={styles.infoTextCentered}>{deliveryTime} min <Icon name="clock-outline" size={16} color="#888" /></Text>
        <Text style={styles.infoTextCentered}>₪{deliveryPrice} <Icon name="bike" size={16} color="#888" /></Text>
      </View>
      {/* Min order and hours Centered */}
      <Text style={styles.subInfoTextCentered}>פתוח עד {closingHour} · הזמנה מינימאלית ₪{minOrder}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  cardWrapper: {
    backgroundColor: '#fff',
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
    paddingBottom: 16,
    alignItems: 'center',
    marginBottom: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.10,
    shadowRadius: 8,
    elevation: 4,
  },
  imageContainer: {
    width: '100%',
    height: 210,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    overflow: 'hidden',
    position: 'relative',
    backgroundColor: '#eee',
    marginBottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
  },
  image: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  iconButton: {
    position: 'absolute',
    top: 18,
    zIndex: 2,
  },
  backButton: {
    left: I18nManager.isRTL ? undefined : 18,
    right: I18nManager.isRTL ? 18 : undefined,
  },
  heartButton: {
    right: I18nManager.isRTL ? undefined : 18,
    left: I18nManager.isRTL ? 18 : undefined,
  },
  circle: {
    backgroundColor: '#fff',
    borderRadius: 22,
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.10,
    shadowRadius: 4,
    elevation: 2,
  },
  logoWrapperOverlap: {
    position: 'absolute',
    bottom: -32,
    right: I18nManager.isRTL ? undefined : 24,
    left: I18nManager.isRTL ? 24 : undefined,
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.10,
    shadowRadius: 4,
    elevation: 2,
    zIndex: 3,
  },
  logoOverlap: {
    width: 64,
    height: 64,
    borderRadius: 14,
    backgroundColor: '#fff',
  },
  storeNameCentered: {
    marginTop: 40,
    fontSize: 22,
    fontWeight: 'bold',
    color: themeStyle.GRAY_900,
    textAlign: 'center',
  },
  infoRowCentered: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 8,
    gap: 18,
  },
  infoTextCentered: {
    fontSize: 15,
    color: themeStyle.GRAY_700,
    marginHorizontal: 8,
    flexDirection: 'row',
    alignItems: 'center',
    textAlign: 'center',
  },
  subInfoTextCentered: {
    marginTop: 8,
    fontSize: 15,
    color: themeStyle.GRAY_500,
    textAlign: 'center',
  },
});

export default StoreHeaderCard; 