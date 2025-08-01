import { View, StyleSheet, ActivityIndicator, Dimensions, Platform } from "react-native";

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
import { WebView } from "react-native-webview";
import BackButton from "../../components/back-button";

export default function TermsAndConditionsScreen() {
  const { t } = useTranslation();
  const { userDetailsStore } = useContext(StoreContext);
  const pdfUrl = 'https://shoofi-spaces.fra1.cdn.digitaloceanspaces.com/terms-and-conditions/terms-and-conditions.pdf';

  const viewerUrl =
    Platform.OS === 'android'
      ? `https://drive.google.com/viewerng/viewer?embedded=true&url=${encodeURIComponent(pdfUrl)}`
      : pdfUrl; // iOS WebView can open PDFs directly


  const [visible, setVisible] = useState(false);
  const navigation = useNavigation();

  const showDialog = () => setVisible(true);

  const hideDialog = () => setVisible(false);

  const acceptTerms = async () => {
    await AsyncStorage.setItem("@storage_terms_accepted", JSON.stringify(true));
    userDetailsStore.setIsAcceptedTerms(true);
    navigation.goBack();
  };

  return (
    <View>
            <View style={{ padding: 16, flexDirection: "row", alignItems: "center" }}>
        <BackButton />
        <View style={{ marginLeft: 10 }}>
          <Text style={{ fontSize: themeStyle.FONT_SIZE_LG }}>
            {t("terms-and-conditions")}
          </Text>
        </View>
      </View>
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

        <View style={styles.container}>
      <WebView
        source={{ uri: viewerUrl }}
        style={styles.webview}
        startInLoadingState
        allowsBackForwardNavigationGestures
      />
    </View>
        <View
          style={{
            position: "absolute",
            bottom: 0,
            left: 0,
            right: 0,
            paddingHorizontal: 15,
            marginTop: 10,
            padding: 10,
         
          }}
        >
          <View style={{ }}>
            <Button onClickFn={acceptTerms} text={t("מאשר")} fontSize={20} />
          </View>

        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    height: "100%",

  },
  webview: {
    height: "100%",
    paddingBottom: 100,
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
