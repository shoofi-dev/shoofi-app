import React, { useContext } from "react";
import { View, Text, TouchableOpacity, StyleSheet, I18nManager } from "react-native";
import Icon from "react-native-vector-icons/MaterialIcons";
import { StoreContext } from "../../../stores";

const tabs = [
  {
    key: "homeScreen",
    label: "ראשי",
    icon: "dashboard",
  },
  {
    key: "Orders",
    label: "הזמנות",
    icon: "receipt-long",
  },
  {
    key: "Profile",
    label: "פרופיל",
    icon: "person-outline",
  },
];



export default function BottomTabBar({ state, navigation }) {
  const {

    authStore,

  } = useContext(StoreContext);
  const handleTabPress = (route) => {
    if (route.key === "Profile") {
      if (authStore.isLoggedIn()) {
        navigation.navigate(route.key);
      } else {
        navigation.navigate("login");
      }
    } else {
      navigation.navigate(route.key);
    }
  
  };
  return (
    <View style={styles.container}>
      {tabs.map((tab, idx) => {
        // For RTL, reverse the order
        const index = I18nManager.isRTL ? tabs.length - 1 - idx : idx;
        const route = tabs[index];
        const isActive = state.index === index;
        return (
          <TouchableOpacity
            key={route.key}
            style={styles.tab}
            onPress={() => handleTabPress(route)}
            activeOpacity={0.7}
          >
            <Icon
              name={route.icon}
              size={28}
              color={isActive ? "#00C853" : "#BDBDBD"}
              style={{ marginBottom: 2 }}
            />
            <Text style={[styles.label, { color: isActive ? "black" : "black" }]}> 
              {route.label}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row-reverse",
    justifyContent: "space-around",
    alignItems: "center",
    height: 60,
    backgroundColor: "#fff",
    borderTopWidth: 1,
    borderTopColor: "#eee",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 8,
  },
  tab: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  label: {
    fontSize: 13,
    fontFamily: "he-Regular",
    marginTop: 2,
  },
}); 