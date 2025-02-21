import LottieView from "lottie-react-native";
import {
  View,
  Image,
  StyleSheet,
  DeviceEventEmitter,
  TouchableOpacity,
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

const icons = {
  bagOff: require("../../../assets/pngs/buy-off.png"),
  bagOn: require("../../../assets/pngs/buy-on.png"),
  deliveryOff: require("../../../assets/pngs/delivery-off.png"),
  deliveryOn: require("../../../assets/pngs/delivery-on.png"),
};

export type TProps = {
  onReplaceCreditCard: any;
  ccData: any;
  shippingMethod: any;
};
export const CCDataCMP = ({
  onReplaceCreditCard,
  ccData,
  shippingMethod,
}: TProps) => {
  const { t } = useTranslation();

  const replaceCreditCard = () => {
    onReplaceCreditCard();
  };

  return (
    <View
      style={{
        width: "100%",
      }}
    >
      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "space-between",

          borderRadius: 15,
          paddingHorizontal: 10,
          overflow: "hidden",
          shadowColor: "#C19A6B",
          shadowOffset: {
            width: 0,
            height: 2,
          },
          shadowOpacity: 0.9,
          shadowRadius: 6,
          elevation: 20,
          borderWidth: 0,
        }}
      >
        <LinearGradient
          colors={[
            "rgba(207, 207, 207, 0.4)",
            "rgba(246,246,247, 0.8)",
            "rgba(246,246,247, 0.8)",
            "rgba(207, 207, 207, 0.4)",
          ]}
          start={{ x: 1, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={[styles.background]}
        />
        <View
          style={{
            alignItems: "center",
            flexDirection: "row",
          }}
        >
          <TouchableOpacity onPress={replaceCreditCard}>
            <Text
              style={{
                fontSize: 16,
                color: themeStyle.TEXT_PRIMARY_COLOR,
              }}
            >
              {t("change")}
            </Text>
          </TouchableOpacity>
          {/* <TouchableOpacity
                      onPress={removeCreditCard}
                      style={{ marginLeft: 20 }}
                    >
                      <Icon icon="trash" size={20} />
                    </TouchableOpacity> */}
        </View>
        <View style={{ flexDirection: "row", alignItems: "center" }}>
          <Text
            style={{
              fontSize: 17,
              color: themeStyle.TEXT_PRIMARY_COLOR,
              fontFamily: `${getCurrentLang()}-American-bold`,
            }}
          >{`****_****_****_${ccData?.last4Digits}`}</Text>
          <Icon
            icon={ccData?.ccType}
            size={50}
            style={{ color: theme.GRAY_700, marginLeft: 5 }}
          />
        </View>
      </View>
      {shippingMethod === SHIPPING_METHODS.shipping && (
        <View
          style={{
            marginTop: 10,
            paddingHorizontal: 20,
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <Text
            style={{
              fontSize: 18,
              color: themeStyle.ERROR_COLOR,
              textAlign: "left",
            }}
          >
            *{t("delivery-method-note")}.
          </Text>
        </View>
      )}
    </View>
  );
};
const styles = StyleSheet.create({
  togglleContainer: {
    borderRadius: 50,
    marginTop: 30,
    borderWidth: 1,
    overflow: "hidden",
    borderColor: theme.PRIMARY_COLOR,
    flexDirection: "row",
    width: "100%",
    shadowColor: "#C19A6B",
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
