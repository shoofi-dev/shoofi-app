import {
  StyleSheet,
  View,
  DeviceEventEmitter,
  TouchableOpacity,
  Image,
  ImageBackground,
  ScrollView,
  Keyboard,
} from "react-native";
import Button from "../../components/controls/button/button";
import themeStyle from "../../styles/theme.style";
import { CUSTOMER_API } from "../../consts/api";
import { useState, useEffect } from "react";
import { useContext } from "react";
import { StoreContext } from "../../stores";
import { observer } from "mobx-react";
import { useNavigation } from "@react-navigation/native";
import { axiosInstance } from "../../utils/http-interceptor";
import { useTranslation } from "react-i18next";
import AsyncStorage from "@react-native-async-storage/async-storage";
import moment from "moment";
import Text from "../../components/controls/Text";

import {
  CodeField,
  Cursor,
  useBlurOnFulfill,
  useClearByFocusCell,
} from "react-native-confirmation-code-field";
import React from "react";
import AnimatedExample from "../../components/verify-code";
import { LinearGradient } from "expo-linear-gradient";
import { APP_NAME } from "../../consts/shared";
import BackButton from "../../components/back-button";
const CELL_COUNT = 4;
const reg_arNumbers = /^[\u0660-\u0669]{4}$/;
const arabicNumbers = [
  /٠/g,
  /١/g,
  /٢/g,
  /٣/g,
  /٤/g,
  /٥/g,
  /٦/g,
  /٧/g,
  /٨/g,
  /٩/g,
];

const VerifyCodeScreen = ({ route }) => {
  const { t } = useTranslation();
  const { authStore, cartStore, userDetailsStore, shoofiAdminStore } = useContext(StoreContext);
  const { phoneNumber } = route.params;
  const navigation = useNavigation();
  const [isLoading, setIsLoading] = useState(false);
  const [isValid, setIsValid] = useState(true);
  const [isInvalidCodeRes, setIsInvalidCodeRes] = useState(false);
  const [timer, _setTimer] = useState(0);
  const timerRef = React.useRef(timer);
  const setTimer = (data) => {
    timerRef.current = data;
    _setTimer(data);
  };

  const [verifyCode, setVerifyCode] = useState("");
  const ref = useBlurOnFulfill({ value: verifyCode, cellCount: CELL_COUNT });
  const [props, getCellOnLayoutHandler] = useClearByFocusCell({
    value: verifyCode,
    setValue: setVerifyCode,
  });

  const setTimertInterVal = async () => {
    let timerIntreval;
    clearInterval(timerIntreval);
    const verifyDataFinal = await AsyncStorage.getItem("@storage_verifyCode");
    if (verifyDataFinal) {
      const verifyDataValueFinal = JSON.parse(verifyDataFinal);

      let interval = 1000;
      let seconds = 30 * verifyDataValueFinal?.count;
      timerIntreval = setInterval(function () {
        seconds = seconds - 1;
        if (seconds === 0) {
          clearInterval(timerIntreval);
        }
        setTimer(seconds);
      }, interval);
    }
  };
  useEffect(() => {
    setTimertInterVal();
  }, []);

  const resendMeTheCode = async () => {
    setIsInvalidCodeRes(false);
    let timerIntreval;
    const verifyData = await AsyncStorage.getItem("@storage_verifyCode");
    const verifyDataValue = JSON.parse(verifyData);
    if (!verifyDataValue) {
      const data = {
        date: new Date(),
        count: 1,
      };
      await AsyncStorage.setItem("@storage_verifyCode", JSON.stringify(data));
    } else {
      var end = moment(new Date());
      var now = moment(verifyDataValue.date);
      var duration = moment.duration(end.diff(now));
      let newCount = verifyDataValue.count * 2;

      if (duration.asMinutes() > 10) {
        newCount = 1;
      }
      const data = {
        date: new Date(),
        count: newCount,
      };
      await AsyncStorage.setItem("@storage_verifyCode", JSON.stringify(data));
    }

    setTimertInterVal();
    (navigation as any).navigate("login");
  };

  const isValidNunber = (verifyCode: string) => {
    if (verifyCode === "****") {
      return false;
    }
    return (
      verifyCode?.match(/\d/g)?.length === 4 || reg_arNumbers.test(verifyCode)
    );
  };

  const onVerifyCode = (verifyCode: string) => {
    setIsInvalidCodeRes(false);
    if (isValidNunber(verifyCode)) {
      setIsLoading(true);
      let convertedValue: any = verifyCode.toString();
      for (var i = 0; i < convertedValue.length + 1; i++) {
        convertedValue = convertedValue.replace(arabicNumbers[i], i);
      }
      const body = {
        phone: authStore.verifyCodeToken,
        authCode: convertedValue,
      };
      axiosInstance
        .post(`${CUSTOMER_API.CONTROLLER}/${CUSTOMER_API.VERIFY_API}`, body, {
          headers: { "Content-Type": "application/json", "app-name": APP_NAME },
        })
        .then(async function (response: any) {
          await AsyncStorage.removeItem("@storage_verifyCode");
          // const res = JSON.parse(base64.decode(response.data));
          if (response.err_code === -3) {
            setIsLoading(false);
            setIsInvalidCodeRes(true);
            return;
          }
          await authStore.updateUserToken(response.data.token);
          await AsyncStorage.removeItem("@storage_verifyCode");
          if (response.data.fullName) {
            //DeviceEventEmitter.emit(`PREPARE_APP`);
  
            userDetailsStore
              .getUserDetails({
                isDriver: authStore.verifyCodeToken.startsWith("11"),
              })
              .then(async (res) => {
                setIsLoading(false);
                await shoofiAdminStore.getStoreZCrData();

                if (cartStore.getProductsCount() > 0) {
                  const routes = navigation.getState()?.routes;
                  const currentRoute = routes[routes.length - 1]?.name;

                  console.log("currentRoute", currentRoute);
                  if (currentRoute === "cart") {
                    (navigation as any).navigate("checkout-screen");
                  } else {
                    (navigation as any).navigate("cart");
                  }
                } else {
                  (navigation as any).navigate("homeScreen");
                }
              });
          } else {
            (navigation as any).navigate("insert-customer-name");
          }
        })
        .catch(function (error) {
        });
    } else {
      setIsValid(false);
    }
  };

  const handleCodeChange = (code) => {
    setVerifyCode(code);
    if (code.length === 4) {
      setTimeout(() => {
        onVerifyCode(code);
      }, 0);
    }
  };

  const handleLogoPress = () => {
    (navigation as any).navigate("homeScreen");
  };

  return (
    <View style={styles.container}>
      <View style={{ padding: 16, flexDirection: "row", alignItems: "center" }}>
        <BackButton />
      </View>
      <View style={{ width: "100%" }}>
        <View style={styles.inputsContainer}>
          <Text
            style={{
              marginTop: 0,
              fontSize: themeStyle.FONT_SIZE_MD,
              color: themeStyle.TEXT_PRIMARY_COLOR,
            }}
          >
            {t("inser-code")}
          </Text>

          {isInvalidCodeRes && (
            <View style={{ marginTop: 10 }}>
              <Text style={{ fontSize: 20, color: themeStyle.ERROR_COLOR }}>
                {t("invalid-code-res")}
              </Text>
            </View>
          )}
          <View>
            <AnimatedExample onChange={handleCodeChange} />
          </View>
          <View>
            <Text
              style={{
                fontSize: themeStyle.FONT_SIZE_SM,
                color: themeStyle.GRAY_40,
                marginTop: 15,
              }}
            >
              {t("code-sent-to")} {phoneNumber}
            </Text>
          </View>

          <View
            style={{
              width: "100%",
              paddingHorizontal: 50,
              alignItems: "center",
            }}
          >
            {!isValid && (
              <Text
                style={{
                  color: themeStyle.ERROR_COLOR,
                  paddingLeft: 15,
                  marginTop: 20,
                }}
              >
                {t("invalid-code")}
              </Text>
            )}
          </View>
          <View style={{ marginTop: 20 }}>
            {timer > 0 && (
              <Text style={{ fontSize: themeStyle.FONT_SIZE_MD }}>
                {t("can-send-again")} {timer}
              </Text>
            )}
            {timer == 0 && (
              <Text
                style={{
                  fontSize: themeStyle.FONT_SIZE_MD,
                  color: themeStyle.GRAY_60,
                  // fontFamily: `${getCurrentLang()}-SemiBold`,
                }}
              >
                {t("didnt-recive-sms")} ?
              </Text>
            )}
          </View>

          <View style={{ marginTop: 10 }}>
            <TouchableOpacity disabled={timer > 0} onPress={resendMeTheCode}>
              <Text
                style={{
                  fontSize: themeStyle.FONT_SIZE_MD,
                  // fontFamily: `${getCurrentLang()}-SemiBold`,
                  // color:
                  //   timer > 0 ? themeStyle.GRAY_300 : themeStyle.SUCCESS_COLOR,
                  color: themeStyle.SUCCESS_COLOR,
                }}
              >
                {t("resend-sms")}
              </Text>
            </TouchableOpacity>
          </View>

 
        </View>
        
      </View>
      {/* </ImageBackground> */}
      <View
            style={{
              width: "100%",
              paddingHorizontal: 10,
              position: "absolute",
              bottom: "10%",
              left: 0,
              right: 0,
            }}
          >
            <Button
              text={t("approve")}
              fontSize={20}
              onClickFn={onVerifyCode}
              isLoading={isLoading}
              disabled={isLoading}
            />
          </View>
    </View>
  );
};
export default observer(VerifyCodeScreen);

const styles = StyleSheet.create({
  container: {
    width: "100%",
    height: "100%",
  },
  inputsContainer: {
    width: "100%",
    alignItems: "center",
    paddingVertical: 20,
  },
  footerTabs: {
    backgroundColor: "blue",
    width: "100%",
    position: "absolute",
    bottom: 0,
  },
  root: { flex: 1, padding: 20 },
  title: { textAlign: "center", fontSize: 30 },
  codeFieldRoot: { marginTop: 20, flexDirection: "row-reverse" },
  cell: {
    width: 66,
    height: 66,
    lineHeight: 65,
    fontSize: 30,
    textAlign: "center",
    color: themeStyle.GRAY_700,
  },
  focusCell: {
    borderColor: "#000",
  },
  background: {
    position: "absolute",
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
    borderRadius: 0,
  },
});
