import React, { useContext, useEffect, useState, useRef } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  I18nManager,
} from "react-native";
import { observer } from "mobx-react-lite";
import { StoreContext } from "../../../stores";
import GlassBG from "../../glass-background";
import themeStyle from "../../../styles/theme.style";
import Icon from "../../icon";
import { useTranslation } from "react-i18next";
import AsyncStorage from "@react-native-async-storage/async-storage";

const tabs = [
  {
    key: "homeScreen",
    label: "main",
    icon: "main",
  },
  {
    key: "Search",
    label: "search",
    icon: "search_full",
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

const BottomTabBar = observer(({ state, navigation }) => {
  const { t } = useTranslation();
  const { authStore, ordersStore, userDetailsStore } = useContext(StoreContext);
  const [ordersList, setOrdersList] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const intervalRef = useRef(null);
  const handleTabPress = (route) => {
    if (route.key === "Profile") {
      if (authStore.isLoggedIn()) {
        navigation.navigate(route.key);
      } else {
        navigation.navigate("login");
      }
    } else if (route.key === "Search") {
      navigation.navigate("Search");
    } else {
      navigation.navigate(route.key);
    }
  };
  const handleActiveOrdersPress = () => {
    navigation.navigate("active-orders");
  };
  const getOrders = async () => {
    const token = await AsyncStorage.getItem("@storage_userToken");
    if(token){
    ordersStore.getCustomerActiveOrders().then((res) => {
      setOrdersList(res || []);
      setIsLoading(false);
    });
  }else{
    setOrdersList([]);
  }
  };
  useEffect(() => {
    const getToken = async () => {
      const token = await AsyncStorage.getItem("@storage_userToken");
      return token;
    }
    const token = getToken();
    // Clear any existing interval first
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    console.log("XXXXXXXXAASSXXX", token)
    if(token){
      setIsLoading(true);
      getOrders();
      setTimeout(() => {
        getOrders();
      }, 15 * 1000);
      intervalRef.current = setInterval(() => {
        getOrders();
      }, 30 * 1000);
    } else {
      // Clear orders when user logs out
      setOrdersList([]);
    }

    // Cleanup function
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [userDetailsStore.userDetails?.customerId, authStore.userToken]);

  return (
    <View style={[styles.wrapperContainer, {width: ordersList.length > 0 ?  "95%" : "100%"}]}>
      {ordersList.length > 0 && (
        <GlassBG style={styles.activeOrdersContainer} borderRadius={35}>
          {tabs2.map((tab, idx) => {
            // For RTL, reverse the order
            const index = I18nManager.isRTL ? tabs2.length - 1 - idx : idx;
            const route = tabs2[index];
            const isActive = state.index === 3;
            return (
              <TouchableOpacity
                key={route.key}
                style={[
                  styles.activeOrdersTab,
                  {
                    backgroundColor: "transparent",
                  },
                ]}
                onPress={() => handleActiveOrdersPress()}
                activeOpacity={0.7}
              >
                <Icon
                  icon={tab.icon}
                  size={28}
                  color={isActive ? themeStyle.GRAY_80 : themeStyle.WHITE_COLOR}
                  style={{ marginBottom: 2 }}
                />
                {/* <Text
                  style={[
                    styles.label,
                    {
                      color: isActive
                      ? themeStyle.GRAY_80
                      : themeStyle.WHITE_COLOR,                    },
                  ]}
                >
                  {t(tab.label)}
                </Text> */}
              </TouchableOpacity>
            );
          })}
        </GlassBG>
      )}
      <View style={[styles.wrapper, {width: ordersList.length > 0 ?  "75%" : "85%"}]}>
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
                      ? 'rgba(255, 255, 255, 0.44)'
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
                  style={{ marginVertical: 10 }}
                />
                {/* <Text
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
                </Text> */}
              </TouchableOpacity>
            );
          })}
        </GlassBG>
      </View>
    </View>
  );
});

const styles = StyleSheet.create({
  wrapperContainer: {
    alignItems: "center",
    position: "absolute",
    bottom: 10,
    flexDirection: "row",
    
    justifyContent: "space-around",
    alignSelf: "center",
  },
  wrapper: {
    alignSelf: "center",
  },
  activeOrdersContainer: {
    justifyContent: "center",
    alignItems: "center",
    width: 70,
    height: 70,
    borderRadius: 50,
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

export default BottomTabBar;
