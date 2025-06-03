import React, { useContext } from "react";
import { View, TouchableOpacity, StyleSheet, I18nManager, Text } from "react-native";
import Icon from "react-native-vector-icons/MaterialCommunityIcons";
import themeStyle from "../../styles/theme.style";
import { observer } from "mobx-react";
import { StoreContext } from "../../stores";
import { useNavigation } from "@react-navigation/native";
import AddressSelector from "../address/AddressSelector";

const TopBar: React.FC = observer(() => {
  const { cartStore, authStore, userDetailsStore, addressStore } = useContext(StoreContext);
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

      {/* Address Selector */}
      <AddressSelector

      />
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
    top: -8,
    left: -5,
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
    color: "#3B3B3B",
    fontSize: 12,
    fontWeight: "bold",
  },
});

export default TopBar; 