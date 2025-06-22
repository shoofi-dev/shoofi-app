import React, { useContext } from "react";
import { View, Text, TouchableOpacity, StyleSheet, I18nManager } from "react-native";
import { StoreContext } from "../../../stores";
import GlassBG from "../../glass-background";
import themeStyle from "../../../styles/theme.style";
import Icon from "../../icon";
import { useTranslation } from "react-i18next";

const tabs = [
  {
    key: "homeScreen",
    label: "main",
    icon: "main",
  },
  {
    key: "Orders",
    label: "search",
    icon: "search",
  },
  {
    key: "Profile",
    label: "profile",
    icon: "profile",
  },
];



export default function BottomTabBar({ state, navigation }) {
  const { t } = useTranslation();
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
    <View style={styles.wrapper}>
      <GlassBG style={styles.container} borderRadius={35}> 
        {tabs.map((tab, idx) => {
          // For RTL, reverse the order
          const index = I18nManager.isRTL ? tabs.length - 1 - idx : idx;
          const route = tabs[index];
          const isActive = state.index === index;
          return (
            <TouchableOpacity
              key={route.key}
              style={[styles.tab, { backgroundColor: isActive ? themeStyle.GRAY_10 : 'transparent' }]}
              onPress={() => handleTabPress(route)}
              activeOpacity={0.7}
            >
              <Icon
                icon={route.icon}
                size={28}
                color={isActive ? themeStyle.GRAY_80 : themeStyle.WHITE_COLOR}
                style={{ marginBottom: 2 }}
              />
              <Text style={[styles.label, { color: isActive ? themeStyle.GRAY_80 : themeStyle.WHITE_COLOR }]}> 
                {t(route.label)}
              </Text>
            </TouchableOpacity>
          );
        })}
      </GlassBG>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    position: 'absolute',
    bottom: 10,
    width: "80%",
    alignSelf: "center",
  },
  container: {
    flexDirection: "row-reverse",
    justifyContent: "space-around",
    alignItems: "center",
    height: 70,
    borderRadius: 50,
  },
  tab: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 5,
    borderRadius: 50,
    width: "29%"
  },
  label: {

  },
}); 