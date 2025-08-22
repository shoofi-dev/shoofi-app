import React, {useEffect, useState, useContext} from "react";
import {DeviceEventEmitter, Image, StyleSheet, TouchableOpacity, View, Platform,} from "react-native";
import Text from "../../controls/Text";
import {useTranslation} from "react-i18next";
import {PAYMENT_METHODS} from "../../../consts/shared";
import themeStyle from "../../../styles/theme.style";
import Icon from "../../icon";
import isStoreSupportAction from "../../../helpers/is-store-support-action";
import {DIALOG_EVENTS} from "../../../consts/events";
import {getCurrentLang} from "../../../translations/i18n";
import Modal from "react-native-modal";
import PaymentMethodModal from "../../PaymentMethodModal";
import { getPaymentMethodById, getPaymentMethodByValue, getSupportedPaymentMethods, PaymentMethodOption } from "../../../helpers/get-supported-payment-methods";
import { StoreContext } from "../../../stores";

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
  const { ordersStore, authStore } = useContext(StoreContext);
  const [paymentMthod, setPaymentMthod] = useState<any>(paymentMethodValue);
  const [isPaymentMethodModalOpen, setIsPaymentMethodModalOpen] = useState(false);
  const [selectedPaymentMethodId, setSelectedPaymentMethodId] = useState<string>("");
  const [supportedPaymentMethods, setSupportedPaymentMethods] = useState<PaymentMethodOption[]>([]);
  const [isLoadingPaymentMethods, setIsLoadingPaymentMethods] = useState(true);

  useEffect(() => {
    console.log('PaymentMethodPickSquare - paymentMethodValue changed:', paymentMethodValue);
    setPaymentMthod(paymentMethodValue);
  }, [paymentMethodValue]);

  useEffect(() => {
    console.log('PaymentMethodPickSquare - selectedPaymentMethodId changed:', selectedPaymentMethodId);
  }, [selectedPaymentMethodId]);

  // Preload supported payment methods when component mounts
  useEffect(() => {
    const loadSupportedPaymentMethods = async () => {
      try {
        setIsLoadingPaymentMethods(true);
        const methods = await getSupportedPaymentMethods();
        setSupportedPaymentMethods(methods);
        console.log('Preloaded supported payment methods:', methods);
      } catch (error) {
        console.error('Error loading supported payment methods:', error);
        setSupportedPaymentMethods([]);
      } finally {
        setIsLoadingPaymentMethods(false);
      }
    };

    loadSupportedPaymentMethods();
  }, []);

  // Get last user order and set payment method based on it
  useEffect(() => {
    const setPaymentMethodFromLastOrder = async () => {
      try {
        // Check if user is logged in
        if (!authStore.isLoggedIn()) {
          console.log('User not logged in - no payment method selection');
          return;
        }

        // Get customer order history
        const orderHistory = await ordersStore.getCustomerOrdersHistory();
        
        // If no orders, don't select any payment method
        if (!orderHistory || orderHistory.length === 0) {
          console.log('No order history - no payment method selection');
          return;
        }

        // Get the last order (first in array, should be sorted by date desc)
        const lastOrder = orderHistory[0];
        console.log('Last order:', lastOrder);

        
        // Get payment method from last order
        const lastPaymentMethod = lastOrder.order.paymentMethod || lastOrder.order.payment_method;
        console.log('Last payment method:', lastPaymentMethod);


        // If payment method was cash, don't select any payment method
        if (lastPaymentMethod === 'CASH' || lastPaymentMethod === PAYMENT_METHODS.cash) {
          console.log('Last payment was cash - no payment method selection');
          return;
        }

        // Map the payment method to our system
        let paymentMethodId = '';
        let paymentMethodValue = '';
        
        switch (lastPaymentMethod) {
          case 'CREDITCARD':
          case PAYMENT_METHODS.creditCard:
            paymentMethodId = 'credit_card';
            paymentMethodValue = PAYMENT_METHODS.creditCard;
            break;
          case 'APPLEPAY':
          case PAYMENT_METHODS.applePay:
            paymentMethodId = 'apple_pay';
            paymentMethodValue = PAYMENT_METHODS.applePay;
            break;
          case 'GOOGLEPAY':  
          case PAYMENT_METHODS.googlePay:
            paymentMethodId = 'google_pay';
            paymentMethodValue = PAYMENT_METHODS.googlePay;
            break;
          case 'BIT':
          case PAYMENT_METHODS.bit:
            paymentMethodId = 'bit';
            paymentMethodValue = PAYMENT_METHODS.bit;
            break;
          default:
            console.log('Unknown payment method from last order:', lastPaymentMethod);
            return;
        }

        // Check if OS supports this payment method
        const paymentMethodConfig = getPaymentMethodById(paymentMethodId);
        if (paymentMethodConfig?.supportOnlyOS && Platform.OS !== paymentMethodConfig.supportOnlyOS) {
          console.log(`Payment method ${paymentMethodId} not supported on ${Platform.OS}`);
          return;
        }

        // Check if store supports this payment method
        const isSupported = await isStoreSupportAction(paymentMethodConfig.supportKey);
        if (!isSupported) {
          console.log(`Payment method ${paymentMethodId} not supported by store`);
          return;
        }

        // Set the payment method from last order
        console.log(`Setting payment method from last order: ${paymentMethodId}`);
        setSelectedPaymentMethodId(paymentMethodId);
        setPaymentMthod(paymentMethodValue);
        onChange(paymentMethodValue);

      } catch (error) {
        console.error('Error getting last order payment method:', error);
      }
    };

    // Only run this after supported payment methods are loaded
    if (!isLoadingPaymentMethods) {
      setPaymentMethodFromLastOrder();
    }
  }, [authStore, ordersStore, onChange, isLoadingPaymentMethods]);

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
    
    // Get the payment method configuration
    const paymentMethodConfig = getPaymentMethodByValue(value);
    if (!paymentMethodConfig) {
      console.warn('Unknown payment method:', value);
      return;
    }

    // Check if payment method is supported
    const isSupported = await isStoreSupportAction(paymentMethodConfig.supportKey);
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
    
    // Get the payment method configuration
    const paymentMethodConfig = getPaymentMethodById(selectedMethod);
    if (!paymentMethodConfig) {
      console.warn('Unknown payment method:', selectedMethod);
      return;
    }
    
    console.log('Mapped method:', paymentMethodConfig.paymentMethodValue);
    console.log('Setting selectedPaymentMethodId to:', selectedMethod);
    
    // Store the selected payment method ID for display purposes
    setSelectedPaymentMethodId(selectedMethod);
    
    // Update the payment method state
    setPaymentMthod(paymentMethodConfig.paymentMethodValue);
    onChange(paymentMethodConfig.paymentMethodValue);
    
    // Close the modal
    setIsPaymentMethodModalOpen(false);

    // Call ZCredit session creation for digital payment methods
    if ((selectedMethod === 'apple_pay' || selectedMethod === 'google_pay' || selectedMethod === 'bit') && onDigitalPaymentSelect) {
      onDigitalPaymentSelect();
    }
  };

  const getPaymentMethodDisplayName = () => {
    console.log('getPaymentMethodDisplayName - selectedPaymentMethodId:', selectedPaymentMethodId);
    console.log('getPaymentMethodDisplayName - paymentMthod:', paymentMthod);
    
    // If we have a selected payment method ID, use it to get the translation
    if (selectedPaymentMethodId) {
      const paymentMethodConfig = getPaymentMethodById(selectedPaymentMethodId);
      if (paymentMethodConfig) {
        return t(paymentMethodConfig.translationKey);
      }
    }
    
    // Fallback to payment method constant
    const paymentMethodConfig = getPaymentMethodByValue(paymentMthod);
    if (paymentMethodConfig) {
      return t(paymentMethodConfig.translationKey);
    }
    
    // Final fallback
    return t("choose-payment-method");
  };

  const getPaymentMethodIcon = () => {
    // If we have a selected payment method ID, use it to get the icon
    if (selectedPaymentMethodId) {
      const paymentMethodConfig = getPaymentMethodById(selectedPaymentMethodId);
      if (paymentMethodConfig) {
        if (paymentMethodConfig.iconSource) {
          return <Image source={paymentMethodConfig.iconSource} style={styles.iconImage} />;
        } else if (paymentMethodConfig.iconName) {
          return <Icon icon={paymentMethodConfig.iconName} size={32} color={themeStyle.TEXT_PRIMARY_COLOR} />;
        }
      }
    }
    
    // Fallback to payment method constant
    const paymentMethodConfig = getPaymentMethodByValue(paymentMthod);
    if (paymentMethodConfig) {
      if (paymentMethodConfig.iconSource) {
        return <Image source={paymentMethodConfig.iconSource} style={styles.iconImage} />;
      } else if (paymentMethodConfig.iconName) {
        return <Icon icon={paymentMethodConfig.iconName} size={32} color={themeStyle.TEXT_PRIMARY_COLOR} />;
      }
    }
    
    // Default icon
    return <Icon icon="creditcard" size={32} color={themeStyle.TEXT_PRIMARY_COLOR} />;
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
          supportedMethods={supportedPaymentMethods}
          isLoading={isLoadingPaymentMethods}
          currentSelectedMethodId={selectedPaymentMethodId}
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
