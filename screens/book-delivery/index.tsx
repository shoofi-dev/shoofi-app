import { View, StyleSheet, Keyboard } from "react-native";

/* styles */
import theme from "../../styles/theme.style";
import { useState, useContext } from "react";
import Button from "../../components/controls/button/button";
import themeStyle from "../../styles/theme.style";
import { useNavigation } from "@react-navigation/native";
import { StoreContext } from "../../stores";
import { useTranslation } from "react-i18next";
import Text from "../../components/controls/Text";
import { LinearGradient } from "expo-linear-gradient";
import { getCurrentLang } from "../../translations/i18n";
import InputText from "../../components/controls/input";
import DropDown from "../../components/controls/dropdown";
import { arabicNumbers, deliveryTime, reg_arNumbers } from "../../consts/shared";

export default function BookDeliveryScreen() {
  const { t } = useTranslation();
  let { ordersStore } = useContext(StoreContext);

  const navigation = useNavigation();

  const [deliveryData, setDeliveryData] = useState({});


  const bookDelivery = async () => {
    let convertedPhoneValue =  deliveryData["phone"];
    for (var i = 0; i <  deliveryData["phone"].length; i++) {
      convertedPhoneValue = convertedPhoneValue.replace(arabicNumbers[i], i);
    }
    let convertedPriceValue =  convertFromArabicIndic(deliveryData["price"]);
    await ordersStore.bookCustomDelivery({...deliveryData, phone: convertedPhoneValue, price: convertedPriceValue });
    navigation.navigate("admin-orders");
  };

  const cancelBook = async () => {
    navigation.navigate("admin-orders");
  };

  const handleInputChange = (value: any, name: string) => {
    setDeliveryData({ ...deliveryData, [name]: value });
  };

  const isValidName = () => {
    return deliveryData["fullName"]?.length >= 2;
  };

  const isValidNumber = () => {
    return (
      deliveryData["phone"]?.match(/\d/g)?.length === 10 ||
      reg_arNumbers.test(deliveryData["phone"])
    );
  };

  const isValidPrice = () => {
    let convertedValue =  convertFromArabicIndic(deliveryData["price"]);
    return (
     convertedValue > 0
    );
  }

  function convertFromArabicIndic(numStr) {
    const arabicIndicToArabic = {
        '٠': '0', '١': '1', '٢': '2', '٣': '3', '٤': '4',
        '٥': '5', '٦': '6', '٧': '7', '٨': '8', '٩': '9'
    };

    // Check if the string contains any Arabic-Indic numerals
    const containsArabicIndic = /[٠-٩]/.test(numStr);
    
    if (containsArabicIndic) {
        return numStr.split('').map(char => arabicIndicToArabic[char] || char).join('');
    } else {
        return numStr; // Return the original string if no Arabic-Indic numerals are found
    }
}

  const isFormValid = () => {
    if(deliveryData["phone"] && deliveryData["price"] && deliveryData["time"]){
      if(isValidNumber() && isValidPrice()){
        return true;
      }else{
        return false;
      }
    }else{
      return false;
    }
  }

  return (
    <View style={{ height: "100%" }}>
      <LinearGradient
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
      />
      <View style={{ width: "100%", marginTop: 15 }}>
        <View
          style={{
            alignItems: "center",
            marginTop: 10,
          }}
        >
          <Text
            style={{
              fontSize: 30,
              fontFamily: `${getCurrentLang()}-SemiBold`,
              color: themeStyle.WHITE_COLOR,
            }}
          >
            {"ارسالية جديدة"}
          </Text>
        </View>
      </View>
      <View style={{ alignItems: "center" }}>
        <View
          style={{
            width: "90%",
            paddingHorizontal: 50,
            marginTop: 50,
            alignItems: "flex-start",
          }}
        >
          <InputText onChange={(e) => handleInputChange(e, "fullName")} label={t("name")} />
        </View>
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
            onChange={(e) => handleInputChange(e, "phone")}
            label={t("phone")}
          />
        </View>
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
            onChange={(e) => handleInputChange(e, "price")}
            label={t("price")}
          />
        </View>
        <View
          style={{
            width: "90%",
            paddingHorizontal: 50,
            marginTop: 50,
            alignItems: "flex-start",
          }}
        >
          <DropDown
            itemsList={deliveryTime}
            defaultValue={null}
            onChangeFn={(e) => handleInputChange(e, "time")}
            placeholder={"ستكون جاهزة خلال"}
          />
        </View>
        <View
          style={{
            maxWidth: "70%",
            alignSelf: "center",
            marginTop: 60,
          }}
        >
          <Button
            text={t("approve")}
            fontSize={20}
            onClickFn={bookDelivery}
            textColor={themeStyle.WHITE_COLOR}
            fontFamily={`${getCurrentLang()}-Bold`}
            borderRadious={19}
            bgColor={themeStyle.SUCCESS_COLOR}
            disabled={!isFormValid()}
          />
        </View>
        <View
          style={{
            maxWidth: "70%",
            alignSelf: "center",
            marginTop: 50,
          }}
        >
          <Button
            text={t("cancel")}
            fontSize={20}
            onClickFn={cancelBook}
            textColor={themeStyle.WHITE_COLOR}
            fontFamily={`${getCurrentLang()}-Bold`}
            borderRadious={19}
          />
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  button: {
    backgroundColor: theme.PRIMARY_COLOR,
    borderRadius: 5,
    display: "flex",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 20 / -2,
  },
  bottomView: {
    width: "90%",
    height: 50,
    justifyContent: "center",
    alignItems: "center",
    position: "absolute", //Here is the trick
    bottom: 0, //Here is the trick
    marginBottom: 40,
  },
  buttonText: {
    fontSize: 20,
    color: "black",
    // paddingRight: 15,
    // paddingTop: 5
    marginHorizontal: 40 / 2,
  },
  image: {
    height: "100%",
    borderWidth: 4,
  },
  sectionTitle: {
    textAlign: "left",
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 10,
    fontFamily: "he-Light",
  },
  sectionRow: {
    fontSize: 14,
    marginBottom: 10,
    textAlign: "left",
    fontFamily: "he-Light",
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
