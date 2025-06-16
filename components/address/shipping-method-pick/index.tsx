import LottieView from "lottie-react-native";
import { View, Image, StyleSheet, DeviceEventEmitter, TouchableOpacity, ActivityIndicator } from "react-native";
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

export const ShippingMethodPick = ({ onChange, shippingMethodValue, isDeliverySupport, deliveryDistanceText, deliveryEtaText, pickupEtaText, takeAwayReadyTime, deliveryTime, distanceKm, driversLoading, shippingMethod }: TProps) => {
  const { t } = useTranslation(); 
  const { ordersStore } = useContext(StoreContext);

  const [shippingMethodLocal, setShippingMethodLocal] = useState(
    shippingMethod || SHIPPING_METHODS.takAway
  );

  useEffect(() => {
    setShippingMethodLocal(shippingMethod || SHIPPING_METHODS.takAway);
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

    let isDeliverySupported = false;
    if (value === SHIPPING_METHODS.shipping) {
      isDeliverySupported = isDeliverySupport;
    }
    if (!isDeliverySupported) {
      // toggleDialog({
      //   text: "shipping-not-supported",
      //   icon: "shipping_icon",
      // });
      setShippingMethodLocal(SHIPPING_METHODS.takAway);
      onChange(SHIPPING_METHODS.takAway);

      return;
    }
    setShippingMethodLocal(value);
    onChange(value);
  };

  return (
    <View style={styles.pillContainer}>
      {/* Delivery Option */}
      <TouchableOpacity
        style={[
          styles.pillOption,
          shippingMethodLocal === SHIPPING_METHODS.shipping
            ? styles.pillOptionSelected
            : styles.pillOptionUnselected,
            { borderRadius: 50 },
          ]}
        onPress={() => handleDeliverySelect(SHIPPING_METHODS.shipping)}
        activeOpacity={0.8}
      >
        <Text
          style={[
            styles.pillOptionText,
            shippingMethodLocal === SHIPPING_METHODS.shipping && styles.pillOptionTextSelected,
          ]}
        >
          {t("delivery")}
        </Text>
        { isDeliverySupport && !driversLoading ? <Text style={styles.pillOptionSubtext}>
          {distanceKm ? distanceKm + " km · " : ""}
          {deliveryTime?.min} - {deliveryTime?.max} {t('minutes')}
        </Text>
        : driversLoading ? <ActivityIndicator size="small" color={themeStyle.GRAY_300} style={{ marginTop: 2 }} />
        : <Text style={{color: themeStyle.GRAY_300}}>
          {t('delivery-not-supported')}
        </Text>
        }
      </TouchableOpacity>
      {/* Pickup Option */}
      <TouchableOpacity
        style={[
          styles.pillOption,
          shippingMethodLocal === SHIPPING_METHODS.takAway
            ? styles.pillOptionSelected
            : styles.pillOptionUnselected,
          { borderRadius: 50 },
        ]}
        onPress={() => handleDeliverySelect(SHIPPING_METHODS.takAway)}
        activeOpacity={0.8}
      >
        <Text
          style={[
            styles.pillOptionText,
            shippingMethodLocal === SHIPPING_METHODS.takAway && styles.pillOptionTextSelected,
          ]}
        >
          {t("take-away")}
        </Text>
        <Text style={styles.pillOptionSubtext}>{takeAwayReadyTime?.min} - {takeAwayReadyTime?.max} {t('minutes')}</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  pillContainer: {
    flexDirection: 'row',
    backgroundColor: '#F3F3F3',
    borderRadius: 50,
    overflow: 'hidden',
    width: '100%',
    alignSelf: 'center',
    marginVertical: 8,
    height: 54,
    padding:5
  },
  pillOption: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 6,
    paddingHorizontal: 0,
    height: '100%',
  },
  pillOptionSelected: {
    backgroundColor: '#fff',
  },
  pillOptionUnselected: {
    backgroundColor: '#F3F3F3',
  },
  pillOptionText: {
    fontSize: 18,
    fontWeight: '400',
    color: '#232323',
    marginBottom: 2,
  },
  pillOptionTextSelected: {
    fontWeight: 'bold',
    color: '#232323',
  },
  pillOptionSubtext: {
    fontSize: 13,
    color: '#888',
    marginTop: -2,
    textAlign: 'center',
  },
});
