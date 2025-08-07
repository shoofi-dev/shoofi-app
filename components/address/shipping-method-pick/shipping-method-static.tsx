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
  isDeliverySupport?: boolean;
  isTakeAwaySupport?: boolean;
  deliveryDistanceText?: string;
  deliveryEtaText?: string;
  pickupEtaText?: string;
  takeAwayReadyTime?: {
    min: number;
    max: number;
  };
  deliveryTime?: {
    min: number;
    max: number;
  };
  distanceKm?: number;
  driversLoading?: boolean;
  shippingMethod?: any;
};

export const ShippingMethodPickStatic = ({
  onChange,
  shippingMethodValue,
  isDeliverySupport,
  isTakeAwaySupport,
  deliveryDistanceText,
  deliveryEtaText,
  pickupEtaText,
  takeAwayReadyTime,
  deliveryTime,
  distanceKm,
  driversLoading,
  shippingMethod,
}: TProps) => {
  const { t } = useTranslation();
  const { ordersStore } = useContext(StoreContext);

  const [shippingMethodLocal, setShippingMethodLocal] = useState(null);

  useEffect(() => {
    setShippingMethodLocal(null);
  }, [shippingMethod]);

  useEffect(() => {
    if (ordersStore.editOrderData) {
      setShippingMethodLocal(ordersStore.editOrderData.order.receipt_method);
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

    // let isDeliverySupported = false;
    // if (value === SHIPPING_METHODS.shipping) {
    //   isDeliverySupported = isDeliverySupport;
    // }
    if (!isDeliverySupport) {
      // toggleDialog({
      //   text: "shipping-not-supported",
      //   icon: "shipping_icon",
      // });
      setShippingMethodLocal(SHIPPING_METHODS.takAway);
      onChange(SHIPPING_METHODS.takAway);

      return;
    }

    // let isTakeAwaySupported = false;
    // if (value === SHIPPING_METHODS.takAway) {
    //   isTakeAwaySupported = isTakeAwaySupport;
    // }
    if (!isTakeAwaySupport) {
      setShippingMethodLocal(SHIPPING_METHODS.shipping);
      onChange(SHIPPING_METHODS.shipping);
      return;
    }
    setShippingMethodLocal(value);
    onChange(value);
  };

  return (
    <View style={styles.pillContainer}>
      {/* Delivery Option */}
      <View style={{ flexDirection: "row", alignItems: "center", }}>
        <Icon icon="bicycle1" size={16}  style={{marginRight:5}} />

        {isDeliverySupport && !driversLoading ? (
          deliveryTime?.min &&
          deliveryTime?.max && (
            <Text style={styles.pillOptionSubtext}>
              {/* {distanceKm ? distanceKm + " km · " : ""} */}
              {deliveryTime?.min} - {deliveryTime?.max} {t("minutes")}
            </Text>
          )
        ) : driversLoading ? (
          <ActivityIndicator
            size="small"
            color={themeStyle.GRAY_300}
            style={{}}
          />
        ) : (
          <Text style={styles.pillOptionSubtext}>
            {t("delivery-not-supported")}
          </Text>
        )}
      </View>
      {/* Pickup Option */}
      <View
        style={{ marginLeft: 10, flexDirection: "row", alignItems: "center" }}
      >
        <Icon icon="cart" size={16}  style={{marginRight:4}}/>
        {takeAwayReadyTime?.min && takeAwayReadyTime?.max && (
          <Text style={styles.pillOptionSubtext}>
            {isTakeAwaySupport
              ? `${takeAwayReadyTime?.min} - ${takeAwayReadyTime?.max} ${t(
                  "minutes"
                )}`
              : t("takeaway-not-supported")}
          </Text>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  pillContainer: {
    flexDirection: "row",
    overflow: "hidden",
    alignSelf: "center",
  },
  pillOption: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    height: "100%",
    borderWidth: 0,
  },
  pillOptionSelected: {
    backgroundColor: themeStyle.WHITE_COLOR,
  },
  pillOptionUnselected: {
    backgroundColor: themeStyle.GRAY_20,
  },
  pillOptionText: {
    fontSize: themeStyle.FONT_SIZE_MD,
    textAlign: "center",
  },
  pillOptionTextSelected: {},
  pillOptionContent: {
    alignItems: "center",
    justifyContent: "center",
  },
  pillOptionSubtext: {
    fontSize: themeStyle.FONT_SIZE_XS,
    textAlign: "center",
  },
});
