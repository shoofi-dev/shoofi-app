import { View, StyleSheet } from "react-native";

/* styles */
import theme from "../../styles/theme.style";
import { useState, useContext } from "react";
import Button from "../../components/controls/button/button";
import themeStyle from "../../styles/theme.style";
import { useNavigation } from "@react-navigation/native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { StoreContext } from "../../stores";
import TremsDialog from "../../components/dialogs/terms";
import { useTranslation } from "react-i18next";
import Text from "../../components/controls/Text";
import { temrsText } from "./texts";
import { ScrollView } from "react-native-gesture-handler";
import { LinearGradient } from "expo-linear-gradient";

export default function TermsAndConditionsScreen() {
  const { t } = useTranslation();

  let { userDetailsStore } = useContext(StoreContext);

  const [visible, setVisible] = useState(false);
  const navigation = useNavigation();

  const showDialog = () => setVisible(true);

  const hideDialog = () => setVisible(false);

  const acceptTerms = async () => {
    await AsyncStorage.setItem("@storage_terms_accepted", JSON.stringify(true));
    userDetailsStore.setIsAcceptedTerms(true);
    navigation.navigate("language", {isFromTerms: true});
  };

  return (
    <View>
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
        <View style={{ alignItems: "center", marginTop: 20, paddingBottom: 8 }}>
          <Text style={{ fontSize: 20, fontWeight: "bold" }}>
            אבו סאלח
          </Text>
          <Text style={{ fontSize: 20, fontWeight: "bold" }}>
            תנאי שימוש / מדיניות פרטיות
          </Text>
        </View>
        <ScrollView
          style={{
            flexDirection: "column",
          }}
        >
          {temrsText.map((section) => (
            <View
              style={{
                marginHorizontal: 20,
                shadowColor: "#C19A6B",
                shadowOffset: {
                  width: 0,
                  height: 2,
                },
                shadowOpacity: 0.3,
                shadowRadius: 6,
                elevation: 0,
                borderWidth:0,
                backgroundColor:'transparent'
              }}
            >
              <Text style={styles.sectionTitle}>{section.title}</Text>
              <View>
                {section?.rows?.map((row) => (
                  <Text style={styles.sectionRow}>{row}</Text>
                ))}
              </View>
            </View>
          ))}
          <View
            style={{
              alignItems: "center",
              justifyContent: "center",
              marginTop: 10,
            }}
          >
            <Text
              style={{
                fontFamily: "ar-American-bold",
                color: themeStyle.TEXT_PRIMARY_COLOR,
              }}
            >
              Ⓒ Sari Qashuw
            </Text>
          </View>
        </ScrollView>
        <View
          style={{
            width: "100%",
            paddingHorizontal: 15,
            marginTop: 10,
            padding: 10,
            flexDirection: "row",
            justifyContent: "space-between",
          }}
        >
          <View style={{ width: 160 }}>
            <Button onClickFn={acceptTerms} text={t("מאשר")} fontSize={20} />
          </View>
          <View style={{ width: 160 }}>
            <Button
              onClickFn={showDialog}
              text={t("לא מאשר")}
              bgColor={themeStyle.WHITE_COLOR}
              textColor={themeStyle.TEXT_PRIMARY_COLOR}
              fontSize={20}
            />
          </View>
        </View>
      </View>
      <TremsDialog handleAnswer={acceptTerms} isOpen={visible} />
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
    bottom: "0%",
    borderRadius: 0,
  },
});
