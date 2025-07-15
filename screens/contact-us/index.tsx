import {
  StyleSheet,
  View,
  Image,
  ImageBackground,
  TouchableOpacity,
  TouchableWithoutFeedback,
  Keyboard,
  KeyboardAvoidingView,
  Linking,
} from "react-native";
import InputText from "../../components/controls/input";
import Button from "../../components/controls/button/button";
import themeStyle from "../../styles/theme.style";
import { AUTH_API, CUSTOMER_API } from "../../consts/api";
import { useState } from "react";
import * as Device from "expo-device";
import { useContext } from "react";
import { StoreContext } from "../../stores";
import base64 from "react-native-base64";
import { observer } from "mobx-react";
import { useNavigation } from "@react-navigation/native";
import { axiosInstance } from "../../utils/http-interceptor";
import { useTranslation } from "react-i18next";
import AsyncStorage from "@react-native-async-storage/async-storage";
import Text from "../../components/controls/Text";
import { LinearGradient } from "expo-linear-gradient";
import { ROLES } from "../../consts/shared";
import { ScrollView } from "react-native-gesture-handler";
import ConfirmActiondDialog from "../../components/dialogs/confirm-action";
import BackButton from "../../components/back-button";
import DashedLine from "react-native-dashed-line";
import Icon from "../../components/icon";

const ContactUs = () => {
  const { t } = useTranslation();
  const { shoofiAdminStore } = useContext(StoreContext);
  return (
    <View style={styles.container}>
      <View style={{ padding: 16, flexDirection: "row", alignItems: "center" }}>
        <BackButton />
        <View style={{ marginLeft: 10 }}>
          <Text style={{ fontSize: themeStyle.FONT_SIZE_LG }}>
            {t("contact-us")}
          </Text>
        </View>
      </View>
      <View style={{ marginTop: 10, }}>
        <DashedLine
          dashThickness={1}
          dashGap={0}
          dashColor={themeStyle.GRAY_20}
          style={{  width: "100%" }}
        />
        <TouchableOpacity onPress={() => Linking.openURL(`https://wa.me/${shoofiAdminStore?.storeData?.shoofiSupportPhone}`)} style={{padding: 16, flexDirection: "row", alignItems: "center"}}>
          <Icon icon="whatapp" size={24} color={themeStyle.SUCCESS_COLOR} style={{marginRight: 10}} />
          <Text style={{ fontSize: themeStyle.FONT_SIZE_MD, marginLeft: 10 }}>{t("whatsapp")}: {shoofiAdminStore?.storeData?.shoofiSupportPhone}</Text>
        </TouchableOpacity>
        <DashedLine
          dashThickness={1}
          dashGap={0}
          dashColor={themeStyle.GRAY_20}
          style={{  width: "100%" }}
        />
        <View style={{padding: 16, flexDirection: "row", alignItems: "center"}}>
          <Icon icon="send" size={24} color={themeStyle.SUCCESS_COLOR} style={{marginRight: 10}} />
          <Text style={{ fontSize: themeStyle.FONT_SIZE_MD, marginLeft: 10 }}>{t("whatsapp")}: {shoofiAdminStore?.storeData?.shoofiSupportPhone}</Text>
        </View>
        <DashedLine
          dashThickness={1}
          dashGap={0}
          dashColor={themeStyle.GRAY_20}
          style={{  width: "100%" }}
        />
        <View style={{padding: 16,}}>
          <View style={{flexDirection:"row"}}>
          <Text style={{ fontSize: themeStyle.FONT_SIZE_SM, color: themeStyle.GRAY_60 }}>{t("shoofi-company-number")}</Text>

          </View>
          <View style={{flexDirection:"row"}}>
          <Text style={{ fontSize: themeStyle.FONT_SIZE_SM, color: themeStyle.GRAY_60 }}>{t("shoofi-address")}</Text>

          </View>
        </View>
      </View>
    </View>
  );
};
export default observer(ContactUs);

const styles = StyleSheet.create({
  container: {
    width: "100%",
    height: "100%",
  },
  inputsContainer: {
    width: "100%",
    alignItems: "center",
  },
  footerTabs: {
    backgroundColor: "blue",
    width: "100%",
    position: "absolute",
    bottom: 0,
  },
  background: {
    position: "absolute",
    left: "5%",
    right: "5%",
    top: 50,
    bottom: "5%",
    borderRadius: 50,
  },
});
