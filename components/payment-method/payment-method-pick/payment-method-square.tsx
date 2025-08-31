import React from "react";
import LottieView from "lottie-react-native";
import {
  View,
  Image,
  StyleSheet,
  DeviceEventEmitter,
  TouchableOpacity,
  ActivityIndicator,
} from "react-native";
import { ToggleButton } from "react-native-paper";
import Text from "../../controls/Text";
import { useTranslation } from "react-i18next";
import { LinearGradient } from "expo-linear-gradient";
import { PAYMENT_METHODS, SHIPPING_METHODS } from "../../../consts/shared";
import { useEffect, useState } from "react";
import theme from "../../../styles/theme.style";
import themeStyle from "../../../styles/theme.style";
import Icon from "../../icon";
import isStoreSupportAction from "../../../helpers/is-store-support-action";
import { DIALOG_EVENTS } from "../../../consts/events";
import { getCurrentLang } from "../../../translations/i18n";
import {
  PaymentRequest,
  GooglePayButton,
  GooglePayButtonConstants,
} from '@google/react-native-make-payment';

const icons = {
  bagOff: require("../../../assets/pngs/buy-off.png"),
  bagOn: require("../../../assets/pngs/buy-on.png"),
  deliveryOff: require("../../../assets/pngs/delivery-off.png"),
  deliveryOn: require("../../../assets/pngs/delivery-on.png"),
};

export type TProps = {
  onChange: any;
  paymentMethodValue: any;
  isLoadingCreditCards?: boolean;
};
export const PaymentMethodPickSquare = ({
  onChange,
  paymentMethodValue,
  isLoadingCreditCards = false,
}: TProps) => {
  const { t } = useTranslation();
  const [paymentMthod, setPaymentMthod] = useState<any>(paymentMethodValue);
  const paymentDetails = {
    total: {
      amount: {
        currency: 'USD',
        value: '14.95',
      },
    },
  };

  const googlePayRequest = {
    apiVersion: 2,
    apiVersionMinor: 0,
    allowedPaymentMethods: [
      {
        type: 'CARD',
        parameters: {
          allowedAuthMethods: ['PAN_ONLY', 'CRYPTOGRAM_3DS'],
          allowedCardNetworks: [
            'AMEX',
            'DISCOVER',
            'INTERAC',
            'JCB',
            'MASTERCARD',
            'VISA',
          ],
        },
        tokenizationSpecification: {
          type: 'PAYMENT_GATEWAY',
          parameters: {
            gateway: 'adyen',
            gatewayMerchantId: '<PSP merchant ID>',
          },
        },
      },
    ],
    merchantInfo: {
      merchantId: '01234567890123456789',
      merchantName: 'Example Merchant',
    },
    transactionInfo: {
      totalPriceStatus: 'FINAL',
      totalPrice: paymentDetails.total.amount.value,
      currencyCode: paymentDetails.total.amount.currency,
      countryCode: 'US',
    },
  };

  const paymentMethods = [
    {
      supportedMethods: 'google_pay',
      data: googlePayRequest,
    },
  ];

  const paymentRequest = new PaymentRequest(paymentMethods, paymentDetails);

  useEffect(() => {
    setPaymentMthod(paymentMethodValue);
  }, [paymentMethodValue]);

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
  function handleResponse(response) {
    console.log(response);
  }
  function checkCanMakePayment() {
    paymentRequest
        .canMakePayment()
        .then((canMakePayment) => {
          if (canMakePayment) {
            showPaymentForm();
          } else {
            handleResponse('Google Pay unavailable');
          }
        })
        .catch((error) => {
          handleResponse(`paymentRequest.canMakePayment() error: ${error}`);
        });
  }

  function showPaymentForm() {
    paymentRequest
        .show()
        .then((response) => {
          if (response === null) {
            handleResponse('Payment sheet cancelled');
          } else {
            handleResponse(JSON.stringify(response, null, 2));
          }
        })
        .catch((error) => {
          handleResponse(`paymentRequest.show() error: ${error}`);
        });
  }

  return (
    <View >
      {/* Cash Option */}
      <View style={{ marginBottom: 5 }}>
          <Text style={{ fontSize: themeStyle.FONT_SIZE_MD, color: themeStyle.TEXT_PRIMARY_COLOR,  fontFamily: `${getCurrentLang()}-Bold`}}>
            {t("choose-payment-method")}
          </Text>
        </View>
        <View style={styles.optionsContainer}>
      <TouchableOpacity
        style={[
          styles.optionBox,
          paymentMthod === PAYMENT_METHODS.cash && styles.optionBoxSelected,
        ]}
        activeOpacity={0.8}
        onPress={() => handlePaymentMethodChange(PAYMENT_METHODS.cash)}
      >
        <Icon 
          icon="shekel" 
          size={24} 
          color={themeStyle.TEXT_PRIMARY_COLOR} 
          style={{ marginBottom: 5 }}
        />
        <Text
          style={[
            styles.optionText,
            paymentMthod === PAYMENT_METHODS.cash ? styles.optionTextSelected : {},
          ]}
        >
          {t("cash")}
        </Text>
      </TouchableOpacity>
      {/* Credit Card Option */}
      <TouchableOpacity
        style={[
          styles.optionBox,
          paymentMthod === PAYMENT_METHODS.creditCard && styles.optionBoxSelected,
        ]}
        activeOpacity={0.8}
        onPress={() => handlePaymentMethodChange(PAYMENT_METHODS.creditCard)}
        disabled={isLoadingCreditCards}
      >
        {isLoadingCreditCards ? (
          <ActivityIndicator 
            size="small" 
            color={themeStyle.GRAY_300}
            style={{ marginBottom: 5 }}
          />
        ) : (
          <Icon
            icon="credit-card-1"
            size={24}
            color={themeStyle.TEXT_PRIMARY_COLOR}
            style={{ marginBottom: 5 }}
          />
        )}
        <Text
          style={[
            styles.optionText,
            paymentMthod === PAYMENT_METHODS.creditCard ? styles.optionTextSelected : {},
          ]}
        >
          {t("credit-card")}
        </Text>
      </TouchableOpacity>

          <GooglePayButton
              style={styles.optionBox}
              onPress={checkCanMakePayment}
              allowedPaymentMethods={googlePayRequest.allowedPaymentMethods}
              theme={GooglePayButtonConstants.Themes.Dark}
              type={GooglePayButtonConstants.Types.Buy}
              radius={4}
          />


          <TouchableOpacity
              style={[
                styles.optionBox,
                paymentMthod === PAYMENT_METHODS.cash && styles.optionBoxSelected,
              ]}
              activeOpacity={0.8}
              onPress={() => handlePaymentMethodChange(PAYMENT_METHODS.cash)}
          >
            <Icon
                icon="shekel"
                size={24}
                color={themeStyle.TEXT_PRIMARY_COLOR}
                style={{ marginBottom: 5 }}
            />
            <Text
                style={[
                  styles.optionText,
                  paymentMthod === PAYMENT_METHODS.googlePay ? styles.optionTextSelected : {},
                ]}
            >
              {t("google-pay")}
            </Text>
          </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  optionsContainer: {
    flexDirection: "row",
    width: "100%",
    alignSelf: "center",
    marginVertical: 8,
    gap: 16,
    justifyContent: "space-between",
  },
  optionBox: {
    backgroundColor: themeStyle.WHITE_COLOR,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: themeStyle.GRAY_40,
    padding: 18,
    marginBottom: 0,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
    width: "45%",
    height: 80
  },
  optionBoxSelected: {
    borderColor: themeStyle.PRIMARY_COLOR,
    backgroundColor: themeStyle.GRAY_10,
  },
  optionText: {
    fontSize: themeStyle.FONT_SIZE_MD,
    textAlign: "center",
    color: themeStyle.TEXT_PRIMARY_COLOR,
  },
  optionTextSelected: {
    color: themeStyle.TEXT_PRIMARY_COLOR,
    fontWeight: "bold",
  },
});
