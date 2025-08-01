import {
  StyleSheet,
  View,
  Image,
  ImageBackground,
  TouchableOpacity,
  TouchableWithoutFeedback,
  Keyboard,
  KeyboardAvoidingView,
  DeviceEventEmitter,
  Dimensions,
  Platform,
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
import {
  APP_NAME,
  arabicNumbers,
  reg_arNumbers,
  ROLES,
} from "../../consts/shared";
import { ScrollView } from "react-native-gesture-handler";
import ConfirmActiondDialog from "../../components/dialogs/confirm-action";
import BackButton from "../../components/back-button";
import { PixelRatio } from "react-native";

const { width: SCREEN_WIDTH } = Dimensions.get("window");
const scale = SCREEN_WIDTH / 375; // 375 is base iPhone width used in Figma

export const normalizeFontSize = (size: number) => {
  const newSize = size * scale;
  return Math.round(PixelRatio.roundToNearestPixel(newSize));
};
const LoginScreen = () => {
  const { t } = useTranslation();
  const { userDetailsStore, authStore, adminCustomerStore, languageStore } =
    useContext(StoreContext);
  const [isOpenConfirmActiondDialog, setIsOpenConfirmActiondDialog] =
    useState(false);
  const navigation = useNavigation();
  const [isLoading, setIsLoading] = useState(false);
  const [phoneNumber, setPhoneNumber] = useState();
  const [isValid, setIsValid] = useState(true);
  const onChange = (value) => {
    setIsValid(true);

    setPhoneNumber(value);
    if (value.length === 10) {
      Keyboard.dismiss();
      setTimeout(() => {
        authinticate(value);
      }, 0);
    }
  };

  const isValidNunber = (value: string) => {
    return (
      value?.match(/\d/g)?.length === 10 ||
      reg_arNumbers.test(value)
    );
  };
  const ifUserBlocked = async () => {
    const userB = await AsyncStorage.getItem("@storage_user_b");
    const userBJson = JSON.parse(userB);
    if (userBJson) {
      return true;
    }
    return false;
  };
  const authinticate = async (value: string) => {
    if (isValidNunber(value)) {
      setIsLoading(true);
      const isBlocked = await ifUserBlocked();
      if (isBlocked) {
        setTimeout(() => {
          navigation.navigate("homeScreen");
        }, 5000);
      }

      let convertedValue = value;
      for (var i = 0; i < value.length; i++) {
        convertedValue = convertedValue.replace(arabicNumbers[i], i);
      }

      const body = {
        phone: convertedValue,
        device_type: Device.osName || "IOS",
        language: languageStore.selectedLang === "ar" ? 0 : 1,
        datetime: new Date(),
      };
      axiosInstance
        .post(
          `${CUSTOMER_API.CONTROLLER}/${
            userDetailsStore.isAdmin()
              ? CUSTOMER_API.ADMIN_CUSTOMER_CREATE_API
              : CUSTOMER_API.CUSTOMER_CREATE_API
          }`,
          body
        )
        .then(async function (response: any) {
          setIsLoading(false);
          if (response.isBlocked) {
            setIsLoading(false);
            await AsyncStorage.setItem("@storage_user_b", JSON.stringify(true));
            return;
          }
            authStore.setVerifyCodeToken(response.phone);
            navigation.navigate("verify-code", {
              phoneNumber: response.phone,
            });
        })
        .catch(function (error) {
          DeviceEventEmitter.emit(`OPEN_GENERAL_SERVER_ERROR_DIALOG`, {
            show: true,
            isSignOut: false,
          });
        });
    } else {
      setIsValid(false);
    }
  };

  const handleLogoPress = () => {
    navigation.navigate("homeScreen");
  };

  const handleConfirmActionAnswer = (answer: string) => {
    setIsOpenConfirmActiondDialog(false);

    if (answer) {
      navigation.navigate("menuScreen");
    } else {
      adminCustomerStore.setCustomer(null);
      navigation.navigate("homeScreen");
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.backContainer}>
        <BackButton />
      </View>
      <TouchableOpacity
        onPress={handleLogoPress}
        style={{
          marginTop: 20,
          width: 167,
          height: 220,
          alignSelf: "center",
        }}
      >
        <Image
          style={{ alignSelf: "center" }}
          source={require("../../assets/shoofi/login-image.png")}
        />
      </TouchableOpacity>
      <TouchableWithoutFeedback
        onPress={Keyboard.dismiss}
        accessible={false}
        style={{
          backgroundColor: "red",
          zIndex: 10,
          height: "100%",
          width: "100%",
        }}
      >
        <View style={{ width: "90%", height: "50%", marginTop: 40, alignSelf: "center" }}>
          <KeyboardAvoidingView
            keyboardVerticalOffset={100}
            behavior={Platform.OS === "ios" ? "position" : "position"}
            style={{ flex: 1 }}
          >
            <View style={styles.inputsContainer}>
              <View style={{flexDirection:"row"}}>
              <Text
                style={{
                  fontSize: themeStyle.FONT_SIZE_SM,
                  fontWeight: "bold",
                  color: themeStyle.GRAY_80,
                }}
              >
                  {t("insert-phone-number")}
              </Text>
              </View>
          

              <View
                style={{
                  width: "100%",
                  marginTop: 8,
                  alignItems: "flex-start",
                }}
              >
                <InputText
                  keyboardType="numeric"
                  onChange={onChange}
                  label={t("phone")}
                  isPreviewMode={isLoading}
                  color={themeStyle.TEXT_PRIMARY_COLOR}
                />
                <Text
                  style={{
                    marginTop: 20,
                    fontSize: themeStyle.FONT_SIZE_SM,
                    color: themeStyle.GRAY_60,
                    alignSelf: "center",
                  }}
                >
                  {!userDetailsStore.isAdmin() && t("will-send-sms-with-code")}
                </Text>
                {!isValid && (
                  <Text
                    style={{ color: themeStyle.ERROR_COLOR, paddingLeft: 15 }}
                  >
                    {t("invalid-phone")}
                  </Text>
                )}
              </View>
            </View>
            {/* Move the Button here so it is inside KeyboardAvoidingView */}
            <View
              style={{
                width: "100%",
                paddingHorizontal: 10,
                marginTop: 70,
                // Remove absolute positioning
              }}
            >
              <Button
                text={t("approve")}
                fontSize={20}
                onClickFn={() => authinticate(phoneNumber)}
                isLoading={isLoading}
                disabled={isLoading}
              />
            </View>
          </KeyboardAvoidingView>
        </View>
      </TouchableWithoutFeedback>
      <ConfirmActiondDialog
        handleAnswer={handleConfirmActionAnswer}
        isOpen={isOpenConfirmActiondDialog}
        text={"client-exist"}
        positiveText="ok"
        negativeText="cancel"
      />
    </View>
  );
};
export default observer(LoginScreen);

const styles = StyleSheet.create({
  container: {
    width: "100%",
    height: "100%",
  },
  backContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 10,
    paddingHorizontal: 15,
  },
  inputsContainer: {
    width: "100%",
    paddingHorizontal: 10,
  },
  footerTabs: {
    backgroundColor: "blue",
    width: "100%",
    position: "absolute",
    bottom: 0,
  },
  background: {
    position: "absolute",
    left: 0,
    right: 0,
    top: 0,
    bottom: "0%",
    borderRadius: 0,
  },
});
