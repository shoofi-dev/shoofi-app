import { View, DeviceEventEmitter, StyleSheet, Dimensions } from "react-native";
import Modal from "react-native-modal";
import Text from "../controls/Text";

/* styles */
import theme from "../../styles/theme.style";
import Icon from "../../components/icon";
import { useState, useEffect } from "react";
import Button from "../../components/controls/button/button";
import themeStyle from "../../styles/theme.style";
import { useTranslation } from "react-i18next";
import { ExclamationMarkLottie } from "../lottie/exclamation-mark-animation";
import i18n from "../../translations/i18n";
import { DIALOG_EVENTS } from "../../consts/events";

const screenHeight = Dimensions.get('window').height;

type TProps = {
  isOpen?: boolean;
  handleAnswer?: any;
};

export default function InterntConnectionDialog({
  isOpen,
  handleAnswer,
}: TProps) {
  const [visible, setVisible] = useState(isOpen || false);

  useEffect(() => {
    const subscription = DeviceEventEmitter.addListener(
      DIALOG_EVENTS.OPEN_INTERNET_CONNECTION_DIALOG,
      openDialog
    );
    return () => {
      subscription.remove();
    };
  }, []);

  useEffect(() => {
    if (isOpen !== undefined) {
      setVisible(isOpen);
    }
  }, [isOpen]);

  const openDialog = (data: any) => {
    setVisible(data?.show || true);
  };

  const hideDialog = (value: boolean) => {
    handleAnswer && handleAnswer(value);
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
          {/* Icon */}
          <View style={styles.iconContainer}>
            <ExclamationMarkLottie />
          </View>
          
          {/* Title */}
          <Text style={styles.title}>
           حدث خطأ في الاتصال 
          </Text>
          
          {/* OK Button */}
          <View style={styles.buttonContainer}>
            <Button
              onClickFn={() => hideDialog(true)}
              text="حسنا"
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
});
