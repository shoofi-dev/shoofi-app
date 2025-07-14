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
import { APP_NAME } from "../../consts/shared";

const UserInformation = () => {
  const { t } = useTranslation();
  const { shoofiAdminStore, userDetailsStore } = useContext(StoreContext);
  const navigation = useNavigation();
  const [customerName, setCustomerName] = useState(userDetailsStore?.userDetails?.name);
  const [customerPhone, setCustomerPhone] = useState(userDetailsStore?.userDetails?.phone);
  const [isValid, setIsValid] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const onChange = (value) => {
    setIsValid(true);
    setCustomerName(value);
  };

  const isValidName = () => {
    return customerName?.length >= 2;
  };


  const updateCutsomerName = () => {
    if (isValidName()) {
      setIsLoading(true);
      const body = {
        fullName: customerName,
        customerId: null,
      };

      axiosInstance
        .post(
          `${CUSTOMER_API.CONTROLLER}/${CUSTOMER_API.UPDATE_CUSTOMER_NAME_API}`,
          body,
          {
            headers: { "Content-Type": "application/json", "app-name": APP_NAME }
          }
        )
        .then(function (response) {
          userDetailsStore.getUserDetails().then((res) => {
            setIsLoading(false);
            navigation.navigate("Profile");
            
          });
        })
        .catch(function (error) {});
    } else {
      setIsValid(false);
    }
  };

  return (
    <View style={styles.container}>
      
      <View style={{ padding: 16, flexDirection: "row", alignItems: "center" }}>
        <BackButton />
        <View style={{ marginLeft: 10 }}>
          <Text style={{ fontSize: themeStyle.FONT_SIZE_LG }}>
            {t("user-information")}
          </Text>
        </View>
      </View>
      <View style={{  padding: 16 }}>
      <View
          style={{
            width: "100%",
          }}
        >
          <View style={{marginBottom: 10}}>
            <Text style={{ fontSize: themeStyle.FONT_SIZE_MD }}>{t("name")}</Text>
          </View>
          <InputText isFlex={true} onChange={onChange} label={t("name")} value={customerName} />
          {!isValid && (
            <Text style={{ color: themeStyle.ERROR_COLOR, paddingLeft: 15 }}>
              {t("invalid-name")}
            </Text>
          )}
        </View>
        <View
          style={{
            width: "100%",
            marginTop: 20,
          }}
        >
          <View style={{marginBottom: 10}}>
            <Text style={{ fontSize: themeStyle.FONT_SIZE_MD }}>{t("phone")}</Text>
          </View>
          <InputText isFlex={true} color={themeStyle.GRAY_40} onChange={onChange} label={t("phone")} value={customerPhone} isEditable={false} />
    
        </View>

      </View>

      { customerName && <View style={{  position: "absolute", bottom: 50, left: 15, right: 15, }}>
        <Button
            text={t("approve")}
            fontSize={20}
            onClickFn={updateCutsomerName}
            isLoading={isLoading}
            disabled={isLoading}
          />
        </View>}
    </View>
  );
};
export default observer(UserInformation);

const styles = StyleSheet.create({
  container: {
    width: "100%",
    height: "100%",
  },
  inputsContainer: {
    width: "100%",
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
