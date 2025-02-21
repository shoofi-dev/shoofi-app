import { View, StyleSheet, DeviceEventEmitter } from "react-native";
import { useTranslation } from "react-i18next";
import { PAYMENT_METHODS, PLACE, SHIPPING_METHODS } from "../../consts/shared";
import { useContext, useEffect, useState } from "react";
import isStoreSupportAction from "../../helpers/is-store-support-action";
import theme from "../../styles/theme.style";
import { PaymentMethodMethodPick } from "./payment-method-pick";
import { DIALOG_EVENTS } from "../../consts/events";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { TCCDetails } from "../credit-card/api/validate-card";
import { CCDataCMP } from "./cc-data";
import { StoreContext } from "../../stores";

export type TProps = {
  onChange: any;
  editOrderData?: any;
  defaultValue?: any;
  shippingMethod: any;
};
export const PaymentMethodCMP = ({ onChange, editOrderData, defaultValue, shippingMethod }: TProps) => {
  const { t } = useTranslation();
  const { userDetailsStore } = useContext(StoreContext);
  const [paymentMethod, setPaymentMethod] = useState(PAYMENT_METHODS.cash);
  const [ccData, setCCData] = useState<TCCDetails | undefined>();

  const getCCData = async () => {
    //await AsyncStorage.setItem("@storage_CCData","");
    const data = await AsyncStorage.getItem("@storage_CCData");
    setCCData(JSON.parse(data));
  };
  useEffect(() => {
    getCCData();
  }, []);

  useEffect(()=>{
    setPaymentMethod(defaultValue);
  },[defaultValue])

  const resetCreditCardAdmin = async () => {
    await AsyncStorage.removeItem("@storage_CCData");
  };
  useEffect(() => {
    return () => {
      if (userDetailsStore.isAdmin()) {
        resetCreditCardAdmin();
      }
    };
  }, []);

  const openNewCreditCardDialog = () => {
    DeviceEventEmitter.emit(
      DIALOG_EVENTS.OPEN_NEW_CREDIT_CARD_BASED_EVENT_DIALOG
    );
  };

  const onPaymentMethodChange = async (paymentMethodValue: string) => {
    setPaymentMethod(paymentMethodValue);
    onChange(paymentMethodValue);
    if (
      paymentMethodValue === PAYMENT_METHODS.creditCard &&
      !ccData &&
      !editOrderData
    ) {
      openNewCreditCardDialog();
    }
  };

  useEffect(() => {
    const subscription = DeviceEventEmitter.addListener(
      `${DIALOG_EVENTS.OPEN_NEW_CREDIT_CARD_BASED_EVENT_DIALOG}_HIDE`,
      handleNewPMAnswer
    );
    return () => {
      subscription.remove();
    };
  }, []);

  const handleNewPMAnswer = (data: any) => {
    if (data.value === "close") {
      setPaymentMethod(PAYMENT_METHODS.cash);
      onChange(PAYMENT_METHODS.cash);
      return;
    }
    getCCData();
  };

  const onReplaceCreditCard = () => {
    openNewCreditCardDialog();
  };

  return (
    <View style={{}}>
      <PaymentMethodMethodPick
        onChange={onPaymentMethodChange}
        paymentMethodValue={paymentMethod}
      />
      {paymentMethod === PAYMENT_METHODS.creditCard && ccData && (
        <View style={{ marginTop: 10 }}>
          <CCDataCMP
            onReplaceCreditCard={onReplaceCreditCard}
            ccData={ccData}
            shippingMethod={shippingMethod}
          />
        </View>
      )}
    </View>
  );
};
const styles = StyleSheet.create({
  container: {
    height: "100%",
  },
  backContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
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
  mapContainerDefault: {
    width: "90%",
    height: 200,
    borderRadius: 10,
    minHeight: 200,
  },
  mapContainer: {
    width: "100%",
    height: 200,
    borderRadius: 10,
    minHeight: 200,
  },
  mapViewContainer: {
    width: "90%",
    height: 200,
    marginTop: 5,
    borderRadius: 10,
    minHeight: 200,
    alignSelf: "center",
    shadowColor: "#C19A6B",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.9,
    shadowRadius: 6,
    elevation: 20,
    borderWidth: 0,
  },
  totalPrictContainer: {
    paddingHorizontal: 20,
    marginHorizontal: 20,
    marginTop: 40,
  },
  priceRowContainer: {
    flexDirection: "row",
    marginBottom: 10,
    fontSize: 25,
    alignItems: "center",
    justifyContent: "center",
  },
  submitButton: {
    backgroundColor: theme.SUCCESS_COLOR,
    borderRadius: 15,
    marginTop: 30,
  },
  submitContentButton: {
    height: 50,
  },
  background: {
    position: "absolute",
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
    height: "100%",
  },
  image: {
    flex: 1,
    resizeMode: "cover",
    justifyContent: "center",
  },
});
