import React, { useState, useEffect } from "react";
import { View, StyleSheet, Dimensions, Text } from "react-native";
import Modal from "react-native-modal";
import { DeviceEventEmitter } from "react-native";
import Button from "../../controls/button/button";
import themeStyle from "../../../styles/theme.style";
import { useTranslation } from "react-i18next";
import { ExclamationMarkLottie } from "../../lottie/exclamation-mark-animation";
import { DIALOG_EVENTS } from "../../../consts/events";

const screenHeight = Dimensions.get('window').height;

export default function RecipetNotSupportedBasedEventDialog() {
  const { t } = useTranslation();
  const [visible, setVisible] = useState(false);
  const [data, setData] = useState<any>();

  useEffect(() => {
    const subscription = DeviceEventEmitter.addListener(
      DIALOG_EVENTS.OPEN_RECIPT_METHOD_BASED_EVENT_DIALOG,
      openDialog
    );
    return () => {
      subscription.remove();
    };
  }, []);

  const openDialog = (data) => {
    setVisible(true);
    setData(data?.data);
  };

  const hideDialog = (value: boolean) => {
    DeviceEventEmitter.emit(`${DIALOG_EVENTS.OPEN_RECIPT_METHOD_BASED_EVENT_DIALOG}_HIDE`, {
      value
    });
    setVisible(false);
  };

  return (
    <Modal
      isVisible={visible}
      onBackButtonPress={() => hideDialog(true)}
      style={styles.modal}
      animationIn="slideInUp"
      animationOut="slideOutDown"
      backdropOpacity={0.5}
      onBackdropPress={() => {}} // Prevent closing on backdrop press
    >
      <View style={styles.container}>
        <View style={styles.content}>
          {/* Error Icon */}
          <View style={styles.iconContainer}>
            <ExclamationMarkLottie />
          </View>
          {/* Message */}
          <View style={styles.textContainer}>
            <Text style={styles.message}>
              {t(data?.text)}
            </Text>
          </View>
          {/* OK Button */}
          <View style={styles.buttonContainer}>
            <Button
              onClickFn={() => hideDialog(true)}
              text={t("ok")}
              textColor={themeStyle.WHITE_COLOR}
              fontSize={16}
              bgColor={themeStyle.PRIMARY_COLOR}
              borderRadious={10}
            />
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modal: {
    margin: 0,
    justifyContent: 'flex-end',
  },
  container: {
    backgroundColor: 'transparent',
    width: '100%',
  },
  content: {
    backgroundColor: themeStyle.WHITE_COLOR,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 30,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: -2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
    minHeight: 200,
  },
  iconContainer: {
    marginBottom: 20,
    alignItems: 'center',
    height: 200,
    width: 140,
  },
  textContainer: {
    marginBottom: 25,
    width: '100%',
  },
  message: {
    fontSize: 16,
    color: themeStyle.GRAY_COLOR,
    textAlign: 'center',
    fontWeight: 'bold',
    lineHeight: 22,
  },
  buttonContainer: {
    width: '100%',
  },
});
