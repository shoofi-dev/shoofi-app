import React from "react";
import { View, Text, StyleSheet, Dimensions } from "react-native";
import Modal from "react-native-modal";
import themeStyle from "../../styles/theme.style";
import { useTranslation } from "react-i18next";
import LottieView from "lottie-react-native";
import lottiePayment from "../../assets/lottie/lottie-payment.json";

const screenHeight = Dimensions.get('window').height;

interface OrderProcessingModalProps {
  visible: boolean;
}

const OrderProcessingModal = ({ visible }: OrderProcessingModalProps) => {
  const { t } = useTranslation();

  return (
    <Modal
      isVisible={visible}
      onBackdropPress={() => {}} // Prevent closing on backdrop press
      onBackButtonPress={() => {}} // Prevent closing on back button press
      style={{ margin: 0, justifyContent: "flex-end" }}
      animationIn="slideInUp"
      animationOut="slideOutDown"
      backdropOpacity={0.7}
      useNativeDriver
      hideModalContentWhileAnimating
    >
      <View style={styles.modalContainer}>
        {/* Drag indicator */}
        <View style={styles.dragIndicator} />
        
        {/* Content */}
        <View style={styles.content}>
          <View style={styles.animationContainer}>
            <LottieView
              source={lottiePayment}
              autoPlay
              style={styles.animation}
              loop={true}
            />
          </View>
          
          <View style={styles.textContainer}>
            <Text style={styles.titleText}>
              {t("processing-order")}
            </Text>
            <Text style={styles.messageText}>
              {t("please-wait-while-we-process-your-order")}
            </Text>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalContainer: {
    backgroundColor: themeStyle.WHITE_COLOR,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingTop: 10,
    paddingBottom: 40,
    minHeight: screenHeight * 0.6,
    maxHeight: screenHeight * 0.6,
  },
  dragIndicator: {
    width: 40,
    height: 4,
    backgroundColor: themeStyle.GRAY_40,
    borderRadius: 2,
    alignSelf: "center",
    marginBottom: 20,
  },
  content: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 30,
  },
  animationContainer: {
    marginBottom: 30,
  },
  animation: {
    width: 300,
    height: 300,
  },
  textContainer: {
    alignItems: "center",
  },
  titleText: {
    fontSize: themeStyle.FONT_SIZE_XL,
    fontWeight: "bold",
    color: themeStyle.BLACK_COLOR,
    textAlign: "center",
    marginBottom: 10,
  },
  messageText: {
    fontSize: themeStyle.FONT_SIZE_MD,
    color: themeStyle.TEXT_PRIMARY_COLOR,
    textAlign: "center",
    lineHeight: 22,
  },
});

export default OrderProcessingModal; 