import React from "react";
import {
  View,
  Image,
  StyleSheet,
  DeviceEventEmitter,
  TouchableOpacity,
  ActivityIndicator,
} from "react-native";
import Text from "../../controls/Text";
import { useTranslation } from "react-i18next";
import { PAYMENT_METHODS } from "../../../consts/shared";
import { useEffect, useState } from "react";
import theme from "../../../styles/theme.style";
import themeStyle from "../../../styles/theme.style";
import Icon from "../../icon";
import isStoreSupportAction from "../../../helpers/is-store-support-action";
import { DIALOG_EVENTS } from "../../../consts/events";
import { getCurrentLang } from "../../../translations/i18n";
import Modal from "react-native-modal";
import PaymentMethodModal from "../../PaymentMethodModal";

const icons = {
  bagOff: require("../../../assets/pngs/buy-off.png"),
  bagOn: require("../../../assets/pngs/buy-on.png"),
  deliveryOff: require("../../../assets/pngs/delivery-off.png"),
  deliveryOn: require("../../../assets/pngs/delivery-on.png"),
};

export type TProps = {
  onChange: any;
  onDigitalPaymentSelect?: () => Promise<void>;
  paymentMethodValue: any;
  isLoadingCreditCards?: boolean;
};
export const PaymentMethodPickSquare = ({
  onChange,
  onDigitalPaymentSelect,
  paymentMethodValue,
  isLoadingCreditCards = false,
}: TProps) => {
  const { t } = useTranslation();
  const [paymentMthod, setPaymentMthod] = useState<any>(paymentMethodValue);
  const [isPaymentMethodModalOpen, setIsPaymentMethodModalOpen] = useState(false);
  const [selectedPaymentMethodId, setSelectedPaymentMethodId] = useState<string>("");

  useEffect(() => {
    console.log('PaymentMethodPickSquare - paymentMethodValue changed:', paymentMethodValue);
    setPaymentMthod(paymentMethodValue);
  }, [paymentMethodValue]);

  useEffect(() => {
    console.log('PaymentMethodPickSquare - selectedPaymentMethodId changed:', selectedPaymentMethodId);
  }, [selectedPaymentMethodId]);

  useEffect(() => {
    const subscription = DeviceEventEmitter.addListener(
      `${DIALOG_EVENTS.OPEN_RECIPT_METHOD_BASED_EVENT_DIALOG}_HIDE`,
      handleAnswer
    );
    return () => {
      subscription.remove();
    };
  }, []);

  const handleAnswer = (data) => {};

  const toggleDialog = (data) => {
    DeviceEventEmitter.emit(
      DIALOG_EVENTS.OPEN_RECIPT_METHOD_BASED_EVENT_DIALOG,
      {
        data,
      }
    );
  };

  const handlePaymentMethodChange = async (value) => {
    if (value == null) {
      return;
    }
    let selectedPM = "";
    switch (value) {
      case "CREDITCARD":
        selectedPM = "creditcard_support";
        break;
      case "CASH":
        selectedPM = "cash_support";
        break;
    }
    const isSupported = await isStoreSupportAction(selectedPM);
    if (!isSupported) {
      toggleDialog({
        text: "creditcard-not-supported",
        icon: "delivery-icon",
      });
      setPaymentMthod(PAYMENT_METHODS.cash);
      onChange(PAYMENT_METHODS.cash);
      return;
    }
    setPaymentMthod(value);
    onChange(value);
  };

  const openPaymentMethodModal = () => {
    setIsPaymentMethodModalOpen(true);
  };

  const handleClosePaymentMethodModal = () => {
    setIsPaymentMethodModalOpen(false);
  };

  const handlePaymentMethodSelect = (selectedMethod: string) => {
    console.log('handlePaymentMethodSelect called with:', selectedMethod);
    
    // Map the selected method from modal to our payment method constants
    let mappedMethod = PAYMENT_METHODS.cash; // Default
    
    switch (selectedMethod) {
      case 'credit_card':
        mappedMethod = PAYMENT_METHODS.creditCard;
        break;
      case 'cash':
        mappedMethod = PAYMENT_METHODS.cash;
        break;
      case 'apple_pay':
        mappedMethod = PAYMENT_METHODS.applePay;
        break;
      case 'google_pay':
        mappedMethod = PAYMENT_METHODS.googlePay;
        break;
      case 'bit':
        mappedMethod = PAYMENT_METHODS.bit;
        break;
      default:
        mappedMethod = PAYMENT_METHODS.cash;
    }
    
    console.log('Mapped method:', mappedMethod);
    console.log('Setting selectedPaymentMethodId to:', selectedMethod);
    
    // Store the selected payment method ID for display purposes
    setSelectedPaymentMethodId(selectedMethod);
    
    // Update the payment method state
    setPaymentMthod(mappedMethod);
    onChange(mappedMethod);
    
    // Close the modal
    setIsPaymentMethodModalOpen(false);

    // Call ZCredit session creation for digital payment methods
    if ((selectedMethod === 'apple_pay' || selectedMethod === 'google_pay' || selectedMethod === 'bit') && onDigitalPaymentSelect) {
      setTimeout(() => {
        onDigitalPaymentSelect();
      }, 500); // Small delay to ensure modal is closed and state is updated
    }
  };

  const getPaymentMethodDisplayName = () => {
    console.log('getPaymentMethodDisplayName - selectedPaymentMethodId:', selectedPaymentMethodId);
    console.log('getPaymentMethodDisplayName - paymentMthod:', paymentMthod);
    
    if (selectedPaymentMethodId) {
      switch (selectedPaymentMethodId) {
        case 'credit_card':
          return "بطاقة";
        case 'cash':
          return "نقداً";
        case 'apple_pay':
          return "Apple Pay";
        case 'google_pay':
          return "Google Pay";
        case 'bit':
          return "بيت";
        default:
          return "اختر وسيلة دفع";
      }
    }
    
    // Fallback to payment method constant
    switch (paymentMthod) {
      case PAYMENT_METHODS.creditCard:
        return "بطاقة";
      case PAYMENT_METHODS.cash:
        return "نقداً";
      case PAYMENT_METHODS.applePay:
        return "Apple Pay";
      case PAYMENT_METHODS.googlePay:
        return "Google Pay";
      case PAYMENT_METHODS.bit:
        return "بيت";
      default:
        return "اختر وسيلة دفع";
    }
  };

  const getPaymentMethodIcon = () => {
    if (selectedPaymentMethodId) {
      switch (selectedPaymentMethodId) {
        case 'apple_pay':
          return <Image source={require("../../../assets/icons/apple-pay.png")} style={styles.iconImage} />;
        case 'google_pay':
          return <Image source={require("../../../assets/icons/google-pay.png")} style={styles.iconImage} />;
        case 'bit':
          return <Image source={require("../../../assets/icons/bit.png")} style={styles.iconImage} />;
        case 'credit_card':
          return <Image source={require("../../../assets/icons/credit-card.png")} style={styles.iconImage} />;
        case 'cash':
          return <Icon icon="shekel1" size={32} color={themeStyle.TEXT_PRIMARY_COLOR} />;
        default:
          return <Icon icon="creditcard" size={32} color={themeStyle.TEXT_PRIMARY_COLOR} />;
      }
    }
    
    // Default icon based on current payment method
    switch (paymentMthod) {
      case PAYMENT_METHODS.creditCard:
        return <Icon icon="credit-card-1" size={32} color={themeStyle.TEXT_PRIMARY_COLOR} />;
      case PAYMENT_METHODS.cash:
        return <Icon icon="shekel1" size={32} color={themeStyle.TEXT_PRIMARY_COLOR} />;
      case PAYMENT_METHODS.applePay:
        return <Image source={require("../../../assets/icons/apple-pay.png")} style={styles.iconImage} />;
      case PAYMENT_METHODS.googlePay:
        return <Image source={require("../../../assets/icons/google-pay.png")} style={styles.iconImage} />;
      case PAYMENT_METHODS.bit:
        return <Image source={require("../../../assets/icons/bit.png")} style={styles.iconImage} />;
      default:
        return <Icon icon="creditcard" size={32} color={themeStyle.TEXT_PRIMARY_COLOR} />;
    }
  };

  return (
    <View>
      {/* Title */}
      <View style={{ marginBottom: 15 }}>
        <Text style={{ fontSize: themeStyle.FONT_SIZE_MD, color: themeStyle.TEXT_PRIMARY_COLOR, fontFamily: `${getCurrentLang()}-Bold`}}>
          {t("payment-method")}
        </Text>
      </View>

      {/* Payment Method Selector - CCDataCMP Style */}
      <TouchableOpacity 
        onPress={openPaymentMethodModal}
        style={styles.paymentMethodContainer}
      >
        <View style={styles.paymentMethodContent}>
          {/* Left Side - Icon and Text */}
          <View style={[
            styles.leftContent,
            !selectedPaymentMethodId && !paymentMthod && styles.leftContentNoIcon
          ]}>
            {/* Only show icon container when payment method is selected */}
            {(selectedPaymentMethodId || paymentMthod) && (
              <View style={styles.iconContainer}>
                {getPaymentMethodIcon()}
              </View>
            )}
            <Text style={[
              styles.paymentMethodText,
              !selectedPaymentMethodId && !paymentMthod && styles.paymentMethodTextNoIcon
            ]}>
              {getPaymentMethodDisplayName()}
            </Text>
          </View>

          {/* Right Side - Arrow */}
          <View style={styles.arrowContainer}>
            <Icon icon="chevron" size={20} color={themeStyle.GRAY_30} />
          </View>
        </View>
      </TouchableOpacity>

      {/* Payment Method Modal */}
      <Modal
        isVisible={isPaymentMethodModalOpen}
        onBackdropPress={() => setIsPaymentMethodModalOpen(false)}
        style={{ margin: 0, justifyContent: "flex-end" }}
        animationIn="slideInUp"
        animationOut="slideOutDown"
        backdropOpacity={0.5}
      >
        <PaymentMethodModal 
          onClose={handleClosePaymentMethodModal}
          onSelect={handlePaymentMethodSelect}
        />
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  paymentMethodContainer: {
    width: "100%",
    backgroundColor: "#F6F8FA",
    borderRadius: 4,
    padding: 5,
  },
  paymentMethodContent: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  leftContent: {
    flexDirection: "row",
    alignItems: "center",
  },
  leftContentNoIcon: {
    justifyContent: "flex-end",
    flex: 1,
  },
  iconContainer: {
    width: 40,
    height: 40,
    marginLeft: 10,
    marginRight: 10,
    alignItems: "center",
    justifyContent: "center",
  },
  iconImage: {
    width: 32,
    height: 32,
    resizeMode: "contain",
  },
  paymentMethodText: {
    fontSize: 17,
    color: themeStyle.TEXT_PRIMARY_COLOR,
    fontFamily: `${getCurrentLang()}-Medium`,
  },
  paymentMethodTextNoIcon: {
    textAlign: "right",
    flex: 1,
  },
  arrowContainer: {
    marginRight: 0,
    padding: 10,
  },
});
