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

export const ShippingMethodPickSquare = ({
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

  // No default selection on first load
  const [shippingMethodLocal, setShippingMethodLocal] = useState(
    shippingMethod ?? shippingMethodValue ?? null
  );

  useEffect(() => {
    setShippingMethodLocal(shippingMethod ?? shippingMethodValue ?? null);
  }, [shippingMethod, shippingMethodValue]);

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
    if (value === SHIPPING_METHODS.shipping && !isDeliverySupport) {
      setShippingMethodLocal(null);
      onChange(null);
      return;
    }
    if (value === SHIPPING_METHODS.takAway && !isTakeAwaySupport) {
      setShippingMethodLocal(null);
      onChange(null);
      return;
    }
    setShippingMethodLocal(value);
    onChange(value);
  };

  return (
    <View style={styles.optionsContainer}>
      {/* Delivery Option */}
      <TouchableOpacity
        style={[
          styles.optionBox,
          shippingMethodLocal === SHIPPING_METHODS.shipping && styles.optionBoxSelected,
          !isDeliverySupport && styles.optionBoxDisabled,
        ]}
        onPress={() => handleDeliverySelect(SHIPPING_METHODS.shipping)}
        activeOpacity={isDeliverySupport ? 0.8 : 1}
        disabled={!isDeliverySupport}
      >
        <Icon icon="delivery" size={24} color={themeStyle.TEXT_PRIMARY_COLOR} style={{ marginBottom: 5 }}/>
        <Text
          style={[
            styles.optionText,
            shippingMethodLocal === SHIPPING_METHODS.shipping && styles.optionTextSelected,
            !isDeliverySupport && styles.optionTextDisabled,
          ]}
        >
          {t("delivery")}
        </Text>
        {isDeliverySupport && !driversLoading ? (
          deliveryTime?.min &&
          deliveryTime?.max && (
            <Text style={styles.optionSubtext}>
              {deliveryTime?.min} - {deliveryTime?.max} {t("minutes")}
            </Text>
          )
        ) : driversLoading ? (
          <ActivityIndicator
            size="small"
            color={themeStyle.GRAY_300}
            style={{ marginTop: 2 }}
          />
        ) : (
          <Text style={styles.optionSubtext}>{t("delivery-not-supported")}</Text>
        )}
      </TouchableOpacity>
      {/* Pickup Option */}
      <TouchableOpacity
        style={[
          styles.optionBox,
          shippingMethodLocal === SHIPPING_METHODS.takAway && styles.optionBoxSelected,
          !isTakeAwaySupport && styles.optionBoxDisabled,
        ]}
        onPress={() => handleDeliverySelect(SHIPPING_METHODS.takAway)}
        activeOpacity={isTakeAwaySupport ? 0.8 : 1}
        disabled={!isTakeAwaySupport}
      >
        <Icon icon="cart" size={24} color={themeStyle.TEXT_PRIMARY_COLOR} style={{ marginBottom: 5 }}/>
        <Text
          style={[
            styles.optionText,
            shippingMethodLocal === SHIPPING_METHODS.takAway && styles.optionTextSelected,
            !isTakeAwaySupport && styles.optionTextDisabled,
          ]}
        >
          {t("take-away")}
        </Text>
        {takeAwayReadyTime?.min && takeAwayReadyTime?.max && (
          <Text style={styles.optionSubtext}>
            {isTakeAwaySupport
              ? `${takeAwayReadyTime?.min} - ${takeAwayReadyTime?.max} ${t("minutes")}`
              : t("takeaway-not-supported")}
          </Text>
        )}
      </TouchableOpacity>
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
    justifyContent: "space-around",
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
  },
  optionBoxSelected: {
    borderColor: themeStyle.TEXT_PRIMARY_COLOR,
    backgroundColor: themeStyle.GRAY_10,
  },
  optionBoxDisabled: {
    opacity: 0.5,
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
  optionTextDisabled: {
    color: themeStyle.GRAY_60,
  },
  optionSubtext: {
    fontSize: themeStyle.FONT_SIZE_XS,
    color: themeStyle.GRAY_60,
    marginTop: 4,
    textAlign: "center",
  },
});
