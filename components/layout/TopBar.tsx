import React, { useContext } from "react";
import { View, Text, TouchableOpacity, StyleSheet, I18nManager } from "react-native";
import Icon from "react-native-vector-icons/MaterialCommunityIcons";
import themeStyle from "../../styles/theme.style";
import { observer } from "mobx-react";
import { StoreContext } from "../../stores";
import { useNavigation } from "@react-navigation/native";

interface TopBarProps {
  address: string;
  onAddressPress?: () => void;
  onHomePress?: () => void;
}

const TopBar: React.FC<TopBarProps> = observer(({ address, onAddressPress, onHomePress }) => {
  const { cartStore, authStore } = useContext(StoreContext);
  const navigation = useNavigation();
  const cartCount = cartStore.getProductsCount();

  const handleCartPress = () => {
    if (authStore.isLoggedIn()) {
      if (cartCount > 0) {
        (navigation as any).navigate("cart");
      }
    } else {
      (navigation as any).navigate("login");
    }
  };

  return (
    <View
      style={[
        styles.container,
        { flexDirection: I18nManager.isRTL ? "row-reverse" : "row" },
      ]}
    >
      {/* Cart Icon with Badge (always at start) */}
      <TouchableOpacity onPress={handleCartPress} style={styles.iconContainer}>
        <Icon name="cart-outline" size={28} color="#222" />
        {cartCount > 0 && (
          <View style={styles.badge}>
            <Text style={styles.badgeText}>{cartCount}</Text>
          </View>
        )}
      </TouchableOpacity>

      {/* Home Icon and Address (grouped together at end) */}
      <View style={styles.rightGroup}>
        <TouchableOpacity onPress={onHomePress} style={styles.iconContainer}>
          <Icon name="home-outline" size={26} color="#222" />
        </TouchableOpacity>
        <TouchableOpacity onPress={onAddressPress} style={styles.addressContainer} activeOpacity={0.7}>
          <Text style={styles.addressText} numberOfLines={1} ellipsizeMode="tail">{address}</Text>
          <Icon name="chevron-down" size={20} color="#888" style={{ marginLeft: 2, marginRight: 2 }} />
        </TouchableOpacity>
      </View>
    </View>
  );
});

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 10,
    paddingTop: 8,
    paddingBottom: 4,
    backgroundColor: "#fff",
    minHeight: 48,
  },
  iconContainer: {

    justifyContent: "center",
    alignItems: "center",
  },
  badge: {
    position: "absolute",
    top: -4,
    right: -4,
    backgroundColor: themeStyle.PRIMARY_COLOR,
    borderRadius: 10,
    minWidth: 18,
    height: 18,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 4,
    zIndex: 2,
  },
  badgeText: {
    color: "#fff",
    fontSize: 12,
    fontWeight: "bold",
  },
  rightGroup: {
    flexDirection: 'row',
  },
  addressContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    minWidth: 0,
    marginLeft: 4,
  },
  addressText: {
    fontSize: 15,
    color: "#222",
    fontWeight: "400",
    maxWidth: 180,
    textAlign: "center",
  },
});

export default TopBar; 