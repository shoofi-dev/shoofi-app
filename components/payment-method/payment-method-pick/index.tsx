import LottieView from "lottie-react-native";
import { View, Image, StyleSheet, DeviceEventEmitter } from "react-native";
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

const icons = {
  bagOff: require("../../../assets/pngs/buy-off.png"),
  bagOn: require("../../../assets/pngs/buy-on.png"),
  deliveryOff: require("../../../assets/pngs/delivery-off.png"),
  deliveryOn: require("../../../assets/pngs/delivery-on.png"),
};

export type TProps = {
  onChange: any;
  paymentMethodValue: any;
};
export const PaymentMethodMethodPick = ({
  onChange,
  paymentMethodValue,
}: TProps) => {
  const { t } = useTranslation();
  const [paymentMthod, setPaymentMthod] = useState<any>(paymentMethodValue);

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

  return (
    <View
      style={{
        flexDirection: "row",
        width:"100%"
      }}
    >
      <View
        style={{
          flexDirection: "row",
          justifyContent: "space-between",
        }}
      >
        <ToggleButton.Row
          onValueChange={(value) => handlePaymentMethodChange(value)}
          value={paymentMthod}
          style={styles.togglleContainer}
        >
          <ToggleButton
          style={{
                    ...styles.togglleCItem,
                    backgroundColor:
                      paymentMthod === PAYMENT_METHODS.cash
                        ? theme.SECONDARY_COLOR
                        : "transparent",
                    borderTopRightRadius: 50,
                    borderBottomRightRadius: 50,
                  }}
            icon={() => (
              
              <View style={styles.togglleItemContentContainer}>
              <Icon
                icon="shekel"
                size={20}
                style={{
                  color:
                    paymentMthod === PAYMENT_METHODS.cash
                      ? themeStyle.TEXT_PRIMARY_COLOR
                      : theme.WHITE_COLOR,
                }}
              />
              <Text
                style={{
                  fontSize: 18,
                  fontWeight: "bold",
                  color:
                    paymentMthod === PAYMENT_METHODS.cash
                      ? themeStyle.TEXT_PRIMARY_COLOR
                      : themeStyle.WHITE_COLOR,
                }}
              >
                {" "}
                {t("cash")}
              </Text>
            </View>
            )}
            value={PAYMENT_METHODS.cash}
          />
          <ToggleButton
       style={{
                    ...styles.togglleCItem,
                    backgroundColor:
                      paymentMthod === PAYMENT_METHODS.creditCard
                        ? theme.SECONDARY_COLOR
                        : "transparent",
                    borderTopLeftRadius: 50,
                    borderBottomLeftRadius: 50,
                  }}
            icon={() => (
              <View style={styles.togglleItemContentContainer}>
                <Icon
                  icon="credit-card-1"
                  size={25}
                  style={{
                    color:
                      paymentMthod === PAYMENT_METHODS.creditCard
                        ? theme.TEXT_PRIMARY_COLOR
                        : themeStyle.WHITE_COLOR,
                  }}
                />
                <Text
                  style={{
                    fontSize: 18,
                    fontWeight: "bold",
                    color:
                      paymentMthod === PAYMENT_METHODS.creditCard
                        ? themeStyle.TEXT_PRIMARY_COLOR
                        : themeStyle.WHITE_COLOR,
                  }}
                >
                  {t("credit-card")}
                </Text>
              </View>
            )}
            value={PAYMENT_METHODS.creditCard}
          />
        </ToggleButton.Row>
      </View>
    </View>
  );
};
const styles = StyleSheet.create({
  togglleContainer: {
    borderRadius: 50,
    borderWidth: 2,
    overflow: "hidden",
    borderColor: theme.PRIMARY_COLOR,
    flexDirection: "row",
    width: "100%",
    shadowColor: "black",
    shadowOffset: {
      width: 2,
      height: 2,
    },
    shadowOpacity: 1,
    shadowRadius: 20,
  },
  togglleCItem: {
    borderWidth: 0,

    borderRadius: 50,
    flex: 1,
    alignItems: "flex-start",
  },
  togglleItemContent: {},
  togglleItemContentContainer: {
    width: "100%",
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    height: "100%",
  },

  background: {
    position: "absolute",
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
    height: "100%",
  },
});
