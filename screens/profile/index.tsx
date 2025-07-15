import { Linking, StyleSheet, View, I18nManager } from "react-native";
import Icon from "../../components/icon";
import BackButton from "../../components/back-button";
import Text from "../../components/controls/Text";
import { useContext, useEffect, useState } from "react";
import { StoreContext } from "../../stores";
import { observer } from "mobx-react";
import { ScrollView, TouchableOpacity } from "react-native-gesture-handler";
import { useNavigation } from "@react-navigation/native";
import { useTranslation } from "react-i18next";
import themeStyle from "../../styles/theme.style";
import Constants from "expo-constants";

const ProfileScreen = () => {
  const { t } = useTranslation();
  const version = Constants.nativeAppVersion;
  const { userDetailsStore, authStore, addressStore, shoofiAdminStore } =
    useContext(StoreContext);
  const navigation = useNavigation();

  // User info
  const userName = userDetailsStore?.userDetails?.name || "";
  const userAddress =
    addressStore.defaultAddress || "ארלוזורוב 135, תל אביב";

  // Profile option groups
  const profileGroups = [
    [
      {
        key: "details",
        label: t("general-details"),
        icon: "profile-green",
        color: themeStyle.SUCCESS_COLOR,
      },
      // {
      //   key: "address",
      //   label: t("address-list"),
      //   icon: "location",
      //   color: themeStyle.SUCCESS_COLOR,
      // },
      {
        key: "language",
        label: t("change-language"),
        icon: "language-green",
        color: themeStyle.SUCCESS_COLOR,
      },
    ],
   //  [
      // {
      //   key: "orders",
      //   label: t("orders-history"),
      //   icon: "orders-icon",
      //   color: themeStyle.SUCCESS_COLOR,
      // },
    //   {
    //     key: "favorites",
    //     label: t("מועדפים"),
    //     icon: "heart-outline",
    //     color: themeStyle.TEXT_PRIMARY_COLOR,
    //   },
    //   {
    //     key: "notifications",
    //     label: t("התראות"),
    //     icon: "bell",
    //     color: themeStyle.TEXT_PRIMARY_COLOR,
    //   },
    //   {
    //     key: "payments",
    //     label: t("אמצעי תשלום"),
    //     icon: "credit-card",
    //     color: themeStyle.TEXT_PRIMARY_COLOR,
    //   },
    // ],
    // [
    //   {
    //     key: "faq",
    //     label: t("שאלות ותשובות"),
    //     icon: "help-circle",
    //     color: themeStyle.TEXT_PRIMARY_COLOR,
    //   },
    //   {
    //     key: "user-reviews",
    //     label: t("תגובות משתמשים"),
    //     icon: "star",
    //     color: themeStyle.TEXT_PRIMARY_COLOR,
    //   },
    // ],
     [
      {
        key: "contact-us",
        label: t("contact-us"),
        icon: "whatapp",
        color: themeStyle.SUCCESS_COLOR,
      },
    
    ],
    [
      {
        key: "logout",
        label: t("signout"), 
        icon: "logout-red",
        color: themeStyle.ERROR_COLOR,
      },
      {
        key: "delete-account",
        label: t("delete-account"),
        icon: "trash",
        color: themeStyle.ERROR_COLOR,
      },
    ],
  ];

  const actionHandler = (key) => {
    switch (key) {
      case "details":
        // Go to details
        navigation.navigate("user-information");
        break;
      case "address":
        // Go to address
        break;
      case "language":
        navigation.navigate("language");
        break;
      case "orders":
        navigation.navigate("order-history");
        break;
      case "favorites":
        // Go to favorites
        break;
      case "notifications":
        // Go to notifications
        break;
      case "payments":
        // Go to payments
        break;
      case "faq":
        // Go to FAQ
        break;
      case "contact-us":
      navigation.navigate("contact-us");
      // Linking.openURL(`https://wa.me/${shoofiAdminStore?.storeData?.waSupportPhone}`)
        break;
      case "logout":
        authStore.logOut();
        userDetailsStore.resetUser();
        navigation.navigate("homeScreen");
        break;
      case "delete-account":
        // Go to delete account
        authStore.deleteAccount();
        navigation.navigate("homeScreen");
        break;
    }
  };
  return (
    <View style={{ height: "100%" , backgroundColor: themeStyle.WHITE_COLOR,  }}>
      <ScrollView contentContainerStyle={{ paddingBottom: 100 }}>
        {/* Top user info section */}
        <View style={styles.topSection}>
          <View style={styles.avatarCircle}>
            <Icon icon="profile-1" size={48} style={{ color: "#fff" }} />
          </View>
          <View style={{ flexDirection: "column", alignItems: "flex-start", marginLeft: 16 }}>
            <Text style={styles.userName}>{userName}</Text>
            <Text style={styles.userAddress}>{`${userAddress?.street}, ${userAddress?.streetNumber}, ${userAddress?.city}`}</Text>
          </View>
        </View>
        {/* Profile option groups */}
        <View style={{ paddingHorizontal: 16 }}>
          {profileGroups.map((group, idx) => (
            <View key={idx} style={styles.cardGroup}>
              {group.map((item, i) => (
                <TouchableOpacity
                  key={item.key}
                  style={[
                    styles.optionRow,
                    i < group.length - 1 && styles.optionRowBorder,
                  ]}
                  onPress={() => actionHandler(item.key)}
                  activeOpacity={0.7}
                >
                  <View style={styles.rowRight}>
                    <Text style={styles.optionLabel}>{item.label}</Text>
                    <View
                      style={[
                        styles.iconCircle,
                        {
                          backgroundColor:themeStyle.WHITE_COLOR,
                        },
                      ]}
                    >
                      <Icon
                        icon={item.icon}
                        size={22}
                        style={{ color: item.color }}
                      />
                    </View>
                  </View>
                  <Icon
                    icon="chevron"
                    size={22}
                    style={{ color: "#BDBDBD" }}
                  />
                </TouchableOpacity>
              ))}
            </View>
          ))}
        </View>
        {/* App version and terms */}
        {/* <View style={styles.bottomSection}>
          <Text style={styles.versionText}>גרסה {version}</Text>
        </View> */}
        <View style={{flexDirection: "row", justifyContent: "space-between", paddingHorizontal: 16, paddingVertical: 16, alignItems: "center", alignSelf: "center"}}>
          <TouchableOpacity onPress={() => navigation.navigate("terms-and-conditions")}>
            <Text style={styles.versionText}>{t("terms-of-use")}</Text>
            <View style={{borderBottomColor: themeStyle.SUCCESS_COLOR, borderBottomWidth: 1, paddingBottom: 2}}>
            </View>
          </TouchableOpacity>
          {/* <TouchableOpacity onPress={() => navigation.navigate("privacy-policy")}>
            <Text style={styles.versionText}>{t("privacy-policy")}</Text>
            <View style={{borderBottomColor: themeStyle.SUCCESS_COLOR, borderBottomWidth: 1, paddingBottom: 2}}>
            </View>
          </TouchableOpacity> */}

        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  topSection: {
    alignItems: "center",
    marginTop: 32,
    marginBottom: 24,
    flexDirection: "row",
    marginLeft:12
  },
  avatarCircle: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: themeStyle.SECONDARY_COLOR,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 12,
  },
  userName: {
    fontSize: 20,
    fontWeight: "bold",
    color: themeStyle.TEXT_PRIMARY_COLOR,
    marginBottom: 2,
    textAlign: "center",
  },
  userAddress: {
    fontSize: 15,
    color: themeStyle.GRAY_80,
    textAlign: "center",
    marginBottom: 8,
  },
  cardGroup: {
    backgroundColor: themeStyle.GRAY_10,
    borderRadius: 18,
    marginBottom: 18,
    paddingVertical: 2,
 
  },
  optionRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 16,
    paddingHorizontal: 18,
  },
  optionRowBorder: {
    borderBottomWidth: 1,
    borderBottomColor: "#F0F0F0",
  },
  rowRight: {
    flexDirection: I18nManager.isRTL ? "row-reverse" : "row",
    alignItems: "center",
  },
  iconCircle: {
    width: 38,
    height: 38,
    borderRadius: 19,
    alignItems: "center",
    justifyContent: "center",
    marginLeft: I18nManager.isRTL ? 0 : 10,
    marginRight: I18nManager.isRTL ? 10 : 0,
  },
  optionLabel: {
    fontSize: 16,
    color: themeStyle.TEXT_PRIMARY_COLOR,
    fontWeight: "500",
    textAlign: "right",
  },
  bottomSection: {
    alignItems: "center",
    marginTop: 10,
    marginBottom: 20,
  },
  versionText: {
    color: themeStyle.SUCCESS_COLOR,
    fontSize: themeStyle.FONT_SIZE_SM,

  },
});

export default observer(ProfileScreen);
