import React, { useState, useEffect } from "react";
import {
  View,
  TouchableOpacity,
  StyleSheet,
  DeviceEventEmitter,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import Modal from "react-native-modal";
import CreditCard from "../credit-card";
import { useTranslation } from "react-i18next";
import { DIALOG_EVENTS } from "../../consts/events";
import theme from "../../styles/theme.style";
import ExpiryDate from "../expiry-date";
import AddressForm from "../address/AddressForm";
import BackButton from "../back-button";
import themeStyle from "../../styles/theme.style";
import Text from "../controls/Text";

export default function NewAddressBasedEventDialog() {
  const { t } = useTranslation();
  const [visible, setVisible] = useState(false);
  const [locationData, setLocationData] = useState(null);

  // Debug: Track visible state changes
  useEffect(() => {
    console.log('NewAddressModal: visible state changed to:', visible);
  }, [visible]);

  useEffect(() => {
    const subscription = DeviceEventEmitter.addListener(
      DIALOG_EVENTS.OPEN_NEW_ADDRESS_BASED_EVENT_DIALOG,
      handleLocationSelected
    );
    return () => {
      subscription.remove();
    };
  }, []);

  // // Listen for location selection from current location modal
  // useEffect(() => {
  //   const subscription = DeviceEventEmitter.addListener(
  //     `${DIALOG_EVENTS.OPEN_CURRENT_LOCATION_MODAL}_LOCATION_SELECTED`,
  //     handleLocationSelected
  //   );
  //   return () => {
  //     subscription.remove();
  //   };
  // }, []);

  const handleLocationSelected = (data: any) => {
    console.log('NewAddressModal: Location data received:', data);
    setLocationData(data);
    setVisible(true);

  };

  const openDialog = (data: any) => {
    console.log('NewAddressModal: openDialog called, setting visible to true');
    setVisible(true);
  };

  // Test function to manually open the modal
  const testOpenDialog = () => {
    console.log('NewAddressModal: testOpenDialog called');
    setVisible(true);
  };

  const hideDialog = () => {
    console.log('NewAddressModal: hideDialog called, setting visible to false');
    setVisible(false);
    setLocationData(null);
  };

  useEffect(() => {
    const subscription = DeviceEventEmitter.addListener(
      `${DIALOG_EVENTS.OPEN_NEW_ADDRESS_BASED_EVENT_DIALOG}_HIDE`,
      hideDialog
    );
    return () => {
      subscription.remove();
    };
  }, []);

  return (
    <Modal
      isVisible={visible}
      onBackdropPress={() => hideDialog()}
      onBackButtonPress={() => hideDialog()}
      style={styles.modal}
      backdropOpacity={0.4}
      animationIn="slideInUp"
      animationOut="slideOutDown"
      useNativeDriver
      hideModalContentWhileAnimating
      avoidKeyboard
    >

        <View style={styles.sheet}>
          {/* Header */}
          <View style={styles.headerRow}>
            <View
              style={{
                position: "absolute",
                left: 0,
                right: 0,
                top: 0,
                bottom: 0,
                justifyContent: "center",
                zIndex: 1000,
              }}
            >
              <BackButton onClick={hideDialog} isDisableGoBack={true}  color={themeStyle.WHITE_COLOR}/>
            </View>
            <View
              style={{
                alignItems: "center",
                justifyContent: "center",
                flex: 1,
              }}
            >
              <Text
                style={{
                  fontSize: themeStyle.FONT_SIZE_XL,
                  fontWeight: "bold",
                }}
              >
                {t("new-address")}
              </Text>
            </View>
          </View>
          {/* Credit Card Form */}
          <AddressForm locationData={locationData} onClose={hideDialog} />
          
          {/* Test button for debugging */}

        </View>
      <ExpiryDate />
    </Modal>
  );
}

const styles = StyleSheet.create({
  modal: {
    justifyContent: "flex-end",
    margin: 0,
    zIndex: 1000,
  },
  keyboardAvoiding: {
    width: "100%",
  },
  sheet: {
    backgroundColor: "#fff",
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingBottom: 0,
    flex: 1,
    width: "100%",
    alignSelf: "center",
    overflow: "hidden",
    paddingHorizontal: 15,
    marginTop: 100,
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    marginVertical: 15,
    marginBottom: 30,
  },
  closeBtn: {
    width: 32,
    height: 32,
    alignItems: "center",
    justifyContent: "center",
  },
  closeBtnText: {
    fontSize: 28,
    color: "#222",
    fontWeight: "400",
  },
  title: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#222",
    textAlign: "center",
    flex: 1,
  },
});
