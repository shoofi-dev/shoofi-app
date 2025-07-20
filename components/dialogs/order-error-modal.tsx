import React from "react";
import { View, Text, StyleSheet, Dimensions } from "react-native";
import Modal from "react-native-modal";
import Button from "../controls/button/button";
import themeStyle from "../../styles/theme.style";
import { useTranslation } from "react-i18next";
import Icon from "../icon";
import { ExclamationMarkLottie } from "../lottie/exclamation-mark-animation";
import BackButton from "../back-button";

const screenHeight = Dimensions.get('window').height;

interface OrderErrorModalProps {
  visible: boolean;
  title?: string;
  message?: string;
  onClose: () => void;
}

const OrderErrorModal = ({ visible, title, message, onClose }: OrderErrorModalProps) => {
  const { t } = useTranslation();

  return (
    <Modal
      isVisible={visible}
      onBackButtonPress={onClose}
      style={styles.modal}
      animationIn="slideInUp"
      animationOut="slideOutDown"
      backdropOpacity={0.5}
      onBackdropPress={() => {}} // Prevent closing on backdrop press
    >
      <View style={styles.container}>
      <View style={styles.closeButton}>   
      <BackButton isDisableGoBack={true} color={themeStyle.WHITE_COLOR} onClick={onClose}/>
        </View>       
        <View style={styles.content}>
          {/* Error Icon */}
          <View style={styles.iconContainer}>
           <ExclamationMarkLottie />  
          </View>
          
          {/* Title */}
          <Text style={styles.title}>
            {title || t("order-error-modal-title")}
          </Text>
          
          {/* Message */}
          <Text style={styles.message}>
            {message || t("order-error-modal-message")}
          </Text>
          
          {/* Close Button */}
          <View style={styles.buttonContainer}>
            <Button
              text={t("order-error-modal-button-text")}
              fontSize={16}
              onClickFn={onClose}
              textColor={themeStyle.TEXT_PRIMARY_COLOR}
            />
          </View>
        </View>
      </View>
    </Modal>
  );
};

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
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: themeStyle.BLACK_COLOR,
    textAlign: 'center',
    marginBottom: 15,
    lineHeight: 28,
  },
  message: {
    fontSize: 16,
    color: themeStyle.GRAY_COLOR,
    textAlign: 'center',
    marginBottom: 25,
    lineHeight: 22,
  },
  buttonContainer: {
    width: '100%',
  },
  button: {
    borderRadius: 25,
    paddingVertical: 12,
    paddingHorizontal: 30,
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

export default OrderErrorModal; 