import {
  TouchableOpacity,
  View,
  StyleSheet,
  DeviceEventEmitter,
} from "react-native";
import { Dialog, Portal, Provider } from "react-native-paper";
import Text from "../controls/Text";
import { LinearGradient } from "expo-linear-gradient";

/* styles */
import theme from "../../styles/theme.style";
import { useState, useEffect } from "react";
import CreditCard from "../credit-card";
import { useTranslation } from "react-i18next";
import { ScrollView } from "react-native-gesture-handler";
import DialogBG from "./dialog-bg";
import { DIALOG_EVENTS } from "../../consts/events";

export default function NewPaymentMethodBasedEventDialog() {
  const { t } = useTranslation();
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const subscription =DeviceEventEmitter.addListener(
      DIALOG_EVENTS.OPEN_NEW_CREDIT_CARD_BASED_EVENT_DIALOG,
      openDialog
    );
    return () => {
      subscription.remove();
    };
  }, []);

  const openDialog = (data) => {
    setVisible(true);
  };

  const hideDialog = (value: any) => {
    DeviceEventEmitter.emit(
      `${DIALOG_EVENTS.OPEN_NEW_CREDIT_CARD_BASED_EVENT_DIALOG}_HIDE`,
      {
        value,
      }
    );
    setVisible(false);
  };

  return (
    <Provider>
      <Portal>
        <Dialog
          theme={{
            colors: {},
          }}
          style={{
            width: "95%",
            top: -30,
            position: "absolute",
            alignSelf: "center",
          }}
          visible={visible}
          dismissable={false}
        >
          <DialogBG>
            <Dialog.Content
              style={{
                paddingLeft: 0,
                paddingRight: 0,
                paddingTop: 0,
                marginTop: -30,
                // paddingBottom: 30,
                alignSelf: "center",
              }}
            >
              <View
                style={{
                  flexDirection: "row",
                  justifyContent: "space-between",
                  zIndex: 1,
                  paddingBottom: 5,
                  padding: 20,
                }}
              >
                <View style={{ alignItems: "flex-end" }}>
                  <Text style={{ fontSize: 18 }}>
                    {t("inser-credit-card-details")}
                  </Text>
                </View>
                <View>
                  <TouchableOpacity onPress={() => hideDialog("close")}>
                    <Text
                      style={{
                        fontSize: 25,
                      }}
                    >
                      X
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>

              <ScrollView keyboardShouldPersistTaps="handled">
                <View style={{ paddingHorizontal: 20, alignItems: "center" }}>
                  <CreditCard onSaveCard={hideDialog} />
                </View>
              </ScrollView>
            </Dialog.Content>
          </DialogBG>
        </Dialog>
      </Portal>
    </Provider>
  );
}
const styles = StyleSheet.create({
  background: {
    position: "absolute",
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
  },
});
