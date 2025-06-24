import React, { useContext } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  I18nManager,
} from "react-native";
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

const tabs2 = [
  {
    key: "activeOrders",
    label: "active-orders",
    icon: "orders_active",
  },
];

export default function BottomTabBar({ state, navigation }) {
  const { t } = useTranslation();
  const { authStore } = useContext(StoreContext);
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
  const handleActiveOrdersPress = () => {
    navigation.navigate("active-orders");
  }
  return (
    <View style={styles.wrapperContainer}>
            <GlassBG style={styles.activeOrdersContainer} borderRadius={35}>
        {tabs2.map((tab, idx) => {
          // For RTL, reverse the order
          const index = I18nManager.isRTL ? tabs.length - 1 - idx : idx;
          const route = tabs[index];
          const isActive = state.index === index;
          return (
            <TouchableOpacity
              key={route.key}
              style={[
                styles.activeOrdersTab,
                {
                  backgroundColor:  "transparent",
                },
              ]}
              onPress={() => handleActiveOrdersPress()}
              activeOpacity={0.7}
            >
              <Icon
                icon={tab.icon}
                size={28}
                color={ themeStyle.GRAY_80}
                style={{ marginBottom: 2, }}
              />
              <Text
                style={[
                  styles.label,
                  {
                    color: themeStyle.GRAY_80
                   
                  },
                ]}
              >
                {t(tab.label)}
              </Text>
            </TouchableOpacity>
          );
        })}
      </GlassBG>
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
              style={[
                styles.tab,
                {
                  backgroundColor: isActive
                    ? themeStyle.GRAY_10
                    : "transparent",
                },
              ]}
              onPress={() => handleTabPress(route)}
              activeOpacity={0.7}
            >
              <Icon
                icon={route.icon}
                size={28}
                color={isActive ? themeStyle.GRAY_80 : themeStyle.WHITE_COLOR}
                style={{ marginBottom: 2 }}
              />
              <Text
                style={[
                  styles.label,
                  {
                    color: isActive
                      ? themeStyle.GRAY_80
                      : themeStyle.WHITE_COLOR,
                  },
                ]}
              >
                {t(route.label)}
              </Text>
            </TouchableOpacity>
          );
        })}
      </GlassBG>
    </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapperContainer: {
    alignItems: "center",
    position: "absolute",
    bottom: 10,
    flexDirection: "row",
    width: "90%",
    justifyContent: "space-between",
    
  },
  wrapper: {

    width: "80%",
    alignSelf: "center",

  },
  activeOrdersContainer: {
    justifyContent: "center",
    alignItems: "center",
    width: 70,
    height: 70,
    borderRadius: 50,
    marginHorizontal: 10,

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
    width: "29%",
  },
  activeOrdersIcon: {
    width: 28,
    height: 28,
  },
  activeOrdersTab: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 5,
    borderRadius: 50,
  },
  label: {},
});
