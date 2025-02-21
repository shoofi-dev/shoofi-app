import LottieView from "lottie-react-native";
import { View, Image, StyleSheet, DeviceEventEmitter } from "react-native";
import { ToggleButton } from "react-native-paper";
import Text from "../../controls/Text";
import { useTranslation } from "react-i18next";
import { LinearGradient } from "expo-linear-gradient";
import { SHIPPING_METHODS } from "../../../consts/shared";
import { useContext, useEffect, useState } from "react";
import theme from "../../../styles/theme.style";
import themeStyle from "../../../styles/theme.style";
import isStoreSupportAction from "../../../helpers/is-store-support-action";
import { DIALOG_EVENTS } from "../../../consts/events";
import { StoreContext } from "../../../stores";
import Icon from "../../icon";

const icons = {
  bagOff: require("../../../assets/pngs/buy-off.png"),
  bagOn: require("../../../assets/pngs/buy-on.png"),
  deliveryOff: require("../../../assets/pngs/delivery-off.png"),
  deliveryOn: require("../../../assets/pngs/delivery-on.png"),
};

export type TProps = {
  onChange: any;
  shippingMethodValue?: any;
};
export const ShippingMethodPick = ({ onChange, shippingMethodValue }: TProps) => {
  const { t } = useTranslation();
  const { ordersStore } = useContext(StoreContext);

  const [shippingMethod, setShippingMethod] = useState(
    SHIPPING_METHODS.takAway
  );

  useEffect(() => {
    if (ordersStore.editOrderData) {
      setShippingMethod(ordersStore.editOrderData.order.receipt_method);
      onChange(ordersStore.editOrderData.order.receipt_method);

    }
  }, [ordersStore.editOrderData]);



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

  const handleDeliverySelect = async (value) => {
    if (value == null) {
      return;
    }

    let isDeliverySupported = true;
    if (value === SHIPPING_METHODS.shipping) {
      isDeliverySupported = await isStoreSupportAction("delivery_support");
    }
    if (!isDeliverySupported) {
      toggleDialog({
        text: "shipping-not-supported",
        icon: "shipping_icon",
      });
      setShippingMethod(SHIPPING_METHODS.takAway);
      return;
    }
    setShippingMethod(value);
    onChange(value);
  };

  return (
    <View
      style={{
        width:"100%",
      }}
    >
      <ToggleButton.Row
        onValueChange={(value) => handleDeliverySelect(value)}
        value={shippingMethod}
        style={styles.togglleContainer}
      >
        <ToggleButton
              style={{
                    ...styles.togglleCItem,
                    backgroundColor:
                      shippingMethod === SHIPPING_METHODS.shipping
                        ? theme.SECONDARY_COLOR
                        : "transparent",
                    borderTopRightRadius: 50,
                    borderBottomRightRadius: 50,
                  }}
          icon={() => (
            <View style={styles.togglleItemContentContainer}>
            <Icon
              icon="delivery-active"
              size={25}
              style={{
                color:
                  shippingMethod === SHIPPING_METHODS.shipping
                    ? theme.TEXT_PRIMARY_COLOR
                    : theme.WHITE_COLOR,
              }}
            />

            <Text
              style={{
                fontSize: 18,
                fontWeight: "bold",
                color:
                  shippingMethod === SHIPPING_METHODS.shipping
                    ? themeStyle.TEXT_PRIMARY_COLOR
                    : themeStyle.WHITE_COLOR,
                left: 3,
              }}
            >
              {t("delivery")}
            </Text>
          </View>
          )}
          value={SHIPPING_METHODS.shipping}
        />
        <ToggleButton
            style={{
                    ...styles.togglleCItem,
                    backgroundColor:
                      shippingMethod === SHIPPING_METHODS.takAway
                        ? theme.SECONDARY_COLOR
                        : "transparent",
                    borderTopLeftRadius: 50,
                    borderBottomLeftRadius: 50,
                  }}
          icon={() => (
            <View style={styles.togglleItemContentContainer}>
            <Icon
              icon="shopping-bag-1"
              size={25}
              style={{
                color:
                  shippingMethod === SHIPPING_METHODS.takAway
                    ? theme.TEXT_PRIMARY_COLOR
                    : themeStyle.WHITE_COLOR,
              }}
            />

            <Text
              style={{
                fontSize: 18,
                fontWeight: "bold",
                color:
                  shippingMethod === SHIPPING_METHODS.takAway
                    ? themeStyle.TEXT_PRIMARY_COLOR
                    : themeStyle.WHITE_COLOR,
              }}
            >
              {t("take-away")}
            </Text>
          </View>
          )}
          value={SHIPPING_METHODS.takAway}
        />
      </ToggleButton.Row>
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
    backgroundColor:'rgba(36, 33, 30, 0.8)'
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
