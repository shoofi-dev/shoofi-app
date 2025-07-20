import React, { useState, useEffect } from "react";
import { View, StyleSheet, Dimensions } from "react-native";
import Modal from "react-native-modal";
import Button from "../controls/button/button";
import themeStyle from "../../styles/theme.style";
import { useTranslation } from "react-i18next";
import { ExclamationMarkLottie } from "../lottie/exclamation-mark-animation";
import BackButton from "../back-button";
import i18n from "../../translations/i18n";
import Text from "../controls/Text";

const screenHeight = Dimensions.get('window').height;

type TProps = {
  isOpen: boolean;
  handleAnswer?: any;
  errorMessage?: string;
};

export default function UpdateVersionDialog({
  isOpen,
  handleAnswer,
  errorMessage,
}: TProps) {
  const [visible, setVisible] = useState(isOpen);

  useEffect(() => {
    setVisible(isOpen);
  }, [isOpen]);

  const hideDialog = (value: boolean) => {
    handleAnswer && handleAnswer(value);
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
          {/* Icon */}
          <View style={styles.iconContainer}>
            <ExclamationMarkLottie />  
          </View>
          
          {/* Title */}
          <Text style={styles.title}>
            {i18n.t("update-application")}
          </Text>
          
          {/* Update Button */}
          <View style={styles.buttonContainer}>
            <Button
              onClickFn={() => hideDialog(true)}
              text={i18n.t("update-app")}
              textColor={themeStyle.WHITE_COLOR}
              fontSize={16}
              bgColor={themeStyle.SUCCESS_COLOR}
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
    height: 180,
    width: 120,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: themeStyle.BLACK_COLOR,
    textAlign: 'center',
    marginBottom: 25,
    lineHeight: 28,
  },
  buttonContainer: {
    width: '100%',
  },
  closeButton: {
    position: 'absolute',
    top: 18,
    left: 18,
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(0,0,0,0.08)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 10,
  },
});