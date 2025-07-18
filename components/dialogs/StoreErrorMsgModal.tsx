import React from "react";
import { View, TouchableOpacity, Text, StyleSheet, Dimensions, Platform } from "react-native";
import GlassBG from "../glass-background";
import Button from "../controls/button/button";
import themeStyle from "../../styles/theme.style";
import { useTranslation } from "react-i18next";
import { ExclamationMarkLottie } from "../lottie/exclamation-mark-animation";
import Modal from "react-native-modal";

const screenHeight = Dimensions.get('window').height;

interface StoreErrorMsgModalProps {
  visible: boolean;
  textValue?: string;
  onClose: () => void;
}

const StoreErrorMsgModal = ({ visible, textValue, onClose }: StoreErrorMsgModalProps) => {
  const { t } = useTranslation();

  return (
    <Modal
      isVisible={visible}
      onBackdropPress={onClose}
      style={{ margin: 0, justifyContent: "flex-end" }}
      animationIn="slideInUp"
      animationOut="slideOutDown"
      backdropOpacity={0.5}
      useNativeDriver
    >
      <View style={styles.modalContainer}>
        {/* Drag indicator */}
        <View style={styles.dragIndicator} />
        {/* Close button */}
        <TouchableOpacity style={styles.closeButton} onPress={onClose} activeOpacity={0.7}>
          <View style={styles.closeButtonInner}>
            <Text style={styles.closeButtonText}>✕</Text>
          </View>
        </TouchableOpacity>
        {/* Content */}
        <View style={styles.content}>
          <View style={styles.titleContainer}>
            <ExclamationMarkLottie />
          </View>
          <View style={styles.textContainer}>
            <Text style={styles.messageText}>
              {textValue ? t(textValue) : t("store-error")}
            </Text>
          </View>
          <View style={styles.buttonContainer}>
            <Button
              onClickFn={onClose}
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
};

const styles = StyleSheet.create({
  modalContainer: {
    width: '100%',
    height: screenHeight * 0.6,
    backgroundColor: '#fff',
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    paddingTop: 18,
    paddingBottom: Platform.OS === 'ios' ? 32 : 18,
    paddingHorizontal: 24,
 
  },
  dragIndicator: {
    width: 48,
    height: 5,
    borderRadius: 3,
    backgroundColor: '#D1D5DB',
    alignSelf: 'center',
    marginBottom: 12,
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
  closeButtonInner: {
    width: 24,
    height: 24,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  closeButtonText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#444',
  },
  content: {
    height: '100%',
    width: '100%',
    alignItems: 'center',
    marginTop: 20,
    flex: 1,
  },
  titleContainer: {
    marginBottom: 30,
    height: 200,
    width: 140,
  },
  textContainer: {
    marginTop: 20,

  },
  messageText: {
    fontSize: 17,
    textAlign: 'center',
    fontWeight: 'bold',
    color: themeStyle.TEXT_PRIMARY_COLOR,
  },
  buttonContainer: {
    width: '100%',
    alignItems: 'center',
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
  },
});

export default StoreErrorMsgModal; 