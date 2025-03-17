import { useContext, useEffect, useRef, useState } from "react";
import { AppState, DeviceEventEmitter } from "react-native";
import * as Device from "expo-device";
import { StoreContext } from "../../stores";
import { PAYMENT_METHODS, SHIPPING_METHODS } from "../../consts/shared";
import { TOrderSubmitResponse } from "../../stores/cart";
import _useCheckoutChargeCC from "./use-checkout-charge-cc";

export type TPropsCheckoutSubmit = {
  paymentMthod: any;
  shippingMethod: any;
  totalPrice: any;
  orderDate: any;
  editOrderData: any;
  location?: any;
  locationText?: any;
};
const _useCheckoutSubmit = (onLoadingOrderSent: any) => {
  const { cartStore, ordersStore, userDetailsStore, adminCustomerStore, storeDataStore } =
    useContext(StoreContext);
  const { chargeCC } = _useCheckoutChargeCC();

  const updateOrderAdmin = async (order: any, editOrderData, paymentMthod) => {
    if (editOrderData) {
      order.customerId = editOrderData.customerId;
      order.db_orderId = editOrderData._id;
      order.orderId = editOrderData.orderId;
    }
    const res: any = await cartStore.updateOrderAdmin(order);
    if (res?.has_err) {
      DeviceEventEmitter.emit(`OPEN_GENERAL_SERVER_ERROR_DIALOG`, {
        show: true,
      });
      return false;
    }
    return true;
  };

  const checkoutSubmitOrder = async ({
    paymentMthod,
    shippingMethod,
    totalPrice,
    orderDate,
    editOrderData,
    location,
    locationText,
  }: TPropsCheckoutSubmit) => {
    onLoadingOrderSent(true);

    const order: any = {
      paymentMthod,
      shippingMethod,
      totalPrice,
      products: cartStore.cartItems,
      orderDate,
      orderType: ordersStore.orderType,
    };

    if (
      userDetailsStore.isAdmin() &&
      adminCustomerStore?.userDetails?.customerId
    ) {
      order.customerId = adminCustomerStore?.userDetails?.customerId;
      order.isAdmin = true;
    } else {
      order.isAdmin = false;
    }

    if (shippingMethod === SHIPPING_METHODS.shipping) {
      if (location) {
        order.geo_positioning = {
          latitude: editOrderData
            ? editOrderData?.order?.geo_positioning?.latitude ||
              location?.coords?.latitude
            : location?.coords?.latitude,
          longitude: editOrderData
            ? editOrderData?.order?.geo_positioning?.longitude ||
              location?.coords?.longitude
            : location?.coords?.longitude,
        };
      }
      console.log("locationText", locationText);
      if (locationText) {
        order.locationText = editOrderData
          ? editOrderData?.order?.locationText ? editOrderData?.order?.locationText : locationText
          : locationText;
      }
      order.shippingPrice = storeDataStore.storeData.delivery_price;
    }
    
    if (!!editOrderData) {
      const updateOrderAdminRes = updateOrderAdmin(
        order,
        editOrderData,
        paymentMthod
      );
      return updateOrderAdminRes;
    }

    //cartStore.addOrderToHistory(order,userDetailsStore.userDetails.phone); TOrderSubmitResponse | string
    const res: any = await cartStore.submitOrder(order);
    if (res?.has_err) {
      DeviceEventEmitter.emit(`OPEN_GENERAL_SERVER_ERROR_DIALOG`, {
        show: true,
      });
      return false;
    }
    if (paymentMthod === PAYMENT_METHODS.creditCard) {
      const isChargeCCSuccess: any = await chargeCC({
        submitOrderResponse: res,
        totalPrice,
      });
      if (isChargeCCSuccess) {
        return true;
      }
      return false;
    }
    return true;
  };

  return {
    checkoutSubmitOrder,
  };
};

export default _useCheckoutSubmit;
