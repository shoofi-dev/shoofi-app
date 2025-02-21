import { useContext, useEffect, useRef, useState } from "react";
import { AppState, DeviceEventEmitter } from "react-native";
import * as Device from "expo-device";
import { StoreContext } from "../../stores";
import { PAYMENT_METHODS, SHIPPING_METHODS } from "../../consts/shared";
import {
  TOrderSubmitResponse,
  TUpdateCCPaymentRequest,
} from "../../stores/cart";
import chargeCreditCard, {
  TPaymentProps,
} from "../../components/credit-card/api/payment";
import AsyncStorage from "@react-native-async-storage/async-storage";
import moment from "moment";
import { DIALOG_EVENTS } from "../../consts/events";
import { useTranslation } from "react-i18next";

export type TPropsCheckoutChargeCC = {
  submitOrderResponse: any;
  totalPrice: any;
};
const _useCheckoutChargeCC = () => {
  const { t } = useTranslation();

  const { cartStore, ordersStore, userDetailsStore, adminCustomerStore } =
    useContext(StoreContext);

  const getCCData = async () => {
    const ccData: any = await AsyncStorage.getItem("@storage_CCData");
    return  JSON.parse(ccData);
  };

  // CHARGE ERROR MESSAGE - START
  useEffect(() => {
    const subscription = DeviceEventEmitter.addListener(
      `${DIALOG_EVENTS.OPEN_PAYMENT_ERROR_MESSAGE_DIALOG}_HIDE`,
      handlePaymentErrorMessageAnswer
    );
    return () => {
      subscription.remove();
    };
  }, []);
  const handlePaymentErrorMessageAnswer = (data) => {};
  const togglePaymentErrorMessageDialog = (chargeError) => {
    DeviceEventEmitter.emit(DIALOG_EVENTS.OPEN_PAYMENT_ERROR_MESSAGE_DIALOG, {
      text: chargeError,
    });
  };
  // CHARGE ERROR MESSAGE - END

  const chargeCC = async ({
    submitOrderResponse,
    totalPrice,
  }: TPropsCheckoutChargeCC) => {
    const ccData = await getCCData();

    const chargeData: TPaymentProps = {
      token: ccData.ccToken,
      id: ccData.id,
      totalPrice: totalPrice,
      orderId: submitOrderResponse.response.orderId,
      email: ccData?.email,
      cvv: ccData?.cvv,
      phone: userDetailsStore?.userDetails?.phone,
      userName: userDetailsStore?.userDetails?.name,
    };
    return chargeCreditCard(chargeData, submitOrderResponse.cartData).then(
      (resCharge) => {
        const updateCCData: TUpdateCCPaymentRequest = {
          orderId: chargeData.orderId,
          creditcard_ReferenceNumber: resCharge?.ReferenceNumber,
          datetime: moment().format(),
          ZCreditInvoiceReceiptResponse:
            resCharge?.ZCreditInvoiceReceiptResponse,
          ZCreditChargeResponse: resCharge,
        };
        return cartStore.UpdateCCPayment(updateCCData).then((res) => {

          if (resCharge.HasError) {
            togglePaymentErrorMessageDialog(resCharge.ReturnMessage);
            return false;
          }
          if (res?.has_err) {
            togglePaymentErrorMessageDialog('');
            return false;
          }
          return true;
        });
      }
    );
  };

  return {
    chargeCC,
  };
};

export default _useCheckoutChargeCC;
