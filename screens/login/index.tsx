import { StyleSheet, View, Image, ImageBackground, TouchableOpacity, TouchableWithoutFeedback, Keyboard, KeyboardAvoidingView, DeviceEventEmitter } from "react-native";
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
import { toBase64 } from "../../helpers/convert-base64";
import Text from "../../components/controls/Text";
import { LinearGradient } from "expo-linear-gradient";
import { arabicNumbers, reg_arNumbers, ROLES } from "../../consts/shared";
import { ScrollView } from "react-native-gesture-handler";
import ConfirmActiondDialog from "../../components/dialogs/confirm-action";



const LoginScreen = () => {
  const { t } = useTranslation();
  const { userDetailsStore, authStore, adminCustomerStore, languageStore } = useContext(StoreContext);
  const [isOpenConfirmActiondDialog, setIsOpenConfirmActiondDialog] =
    useState(false);
  const navigation = useNavigation();
  const [isLoading, setIsLoading] = useState(false);
  const [phoneNumber, setPhoneNumber] = useState();
  const [isValid, setIsValid] = useState(true);
  const onChange = (value) => {
    setIsValid(true);
    if(value.length === 10){
      Keyboard.dismiss();
    }
    setPhoneNumber(value);
  };

  const isValidNunber = () => {
    return (
      phoneNumber?.match(/\d/g)?.length === 10 ||
      reg_arNumbers.test(phoneNumber)
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
  const authinticate = async () => {
    if (isValidNunber()) {
      setIsLoading(true);
      const isBlocked = await ifUserBlocked();
      if (isBlocked) {
        setTimeout(() => {
          navigation.navigate("homeScreen");
        }, 5000);
      }

      let convertedValue = phoneNumber;
      for (var i = 0; i < phoneNumber.length; i++) {
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
          `${CUSTOMER_API.CONTROLLER}/${userDetailsStore.isAdmin() ? CUSTOMER_API.ADMIN_CUSTOMER_CREATE_API :  CUSTOMER_API.CUSTOMER_CREATE_API}`,
          body,
          { headers: { "Content-Type": "application/json" } }
        )
        .then(async function (response: any) {
          setIsLoading(false);
          if (response.isBlocked ) {
              setIsLoading(false);
              await AsyncStorage.setItem("@storage_user_b", JSON.stringify(true));
              return;
          }
          if(userDetailsStore.isAdmin()){
            adminCustomerStore.setCustomer(response);
            if(response.isExist){
              setIsOpenConfirmActiondDialog(true);
            }else{
              navigation.navigate("insert-customer-name");
            }
          }else{
            authStore.setVerifyCodeToken(response.phone);
            navigation.navigate("verify-code", {
              convertedValue: response.phone,
            });
          }
        })
        .catch(function (error) {
          console.log(error);
          DeviceEventEmitter.emit(`OPEN_GENERAL_SERVER_ERROR_DIALOG`, {
            show: true,
            isSignOut: false,
          });
        });
    } else {
      setIsValid(false);
    }
  };

  const handleLogoPress = () =>{
    navigation.navigate("homeScreen");
  }


  const handleConfirmActionAnswer = (answer: string) => {
    setIsOpenConfirmActiondDialog(false);

    if(answer){
      navigation.navigate("menuScreen");
    }else{
      adminCustomerStore.setCustomer(null);
      navigation.navigate("homeScreen");

    }

  };

  return (
    <View style={styles.container}>
        {/* <LinearGradient
          colors={[
            "rgba(207, 207, 207, 0.4)",
            "rgba(246,246,247, 0.8)",
            "rgba(246,246,247, 0.8)",
            "rgba(246,246,247, 0.8)",
            "rgba(246,246,247, 0.8)",
            "rgba(246,246,247, 0.8)",
            "rgba(207, 207, 207, 0.4)",
          ]}
          start={{ x: 1, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={[styles.background]}
        /> */}
            {/* <ImageBackground
          source={require("../../assets/bg/login-bg.jpg")}
          resizeMode="cover"
          style={{ height: "100%",width:"100%"}}
              > */}
      <TouchableOpacity onPress={handleLogoPress}  style={{ marginTop: 10, width:"100%",  height:'30%' }}>
        <Image
          style={{  alignSelf: "center", width:"40%", height:"100%"}}
          source={require("../../assets/icon4.png")}
        />
      </TouchableOpacity>
      <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false} style={{ backgroundColor:'red', zIndex:10, height:"100%", width:"100%"}}>

      <ScrollView style={{ width: "100%" }}>
      <KeyboardAvoidingView
        keyboardVerticalOffset={100}
        behavior="position"
        style={{ flex: 1 }}
      >


        <View style={styles.inputsContainer}>
          <Text style={{ fontSize: 26,fontWeight: 'bold',  }}>
            {userDetailsStore.isAdmin() ? t("insert-phone-number-admin") : t("insert-phone-number")}
          </Text>
          <Text
            style={{ marginTop: 20, fontSize: 20 }}
          >
             {!userDetailsStore.isAdmin() && t("will-send-sms-with-code")}
          </Text>

          <View
            style={{
              width: "90%",
              paddingHorizontal: 50,
              marginTop: 50,
              alignItems: "flex-start",
            }}
          >
            <InputText
              keyboardType="numeric"
              onChange={onChange}
              label={t("phone")}
              isPreviewMode={isLoading}
            />
            {!isValid && (
              <Text style={{ color: themeStyle.ERROR_COLOR, paddingLeft: 15 }}>
                {t("invalid-phone")}
              </Text>
            )}
          </View>

          <View style={{ width: "90%", paddingHorizontal: 50, marginTop: 70 }}>
            <Button
              text={t("approve")}
              fontSize={20}
              onClickFn={authinticate}
              isLoading={isLoading}
              disabled={isLoading}
            />
          </View>
        </View>
              </KeyboardAvoidingView>
      </ScrollView>
      </TouchableWithoutFeedback>

      {/* </ImageBackground> */}
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
    alignItems: "center",
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
  background: {
    position: "absolute",
    left: 0,
    right: 0,
    top: 0,
    bottom: "0%",
    borderRadius: 0,
  },
});
