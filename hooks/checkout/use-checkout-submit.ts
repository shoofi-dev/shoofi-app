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
  address?: any;
  locationText?: any;
};
const _useCheckoutSubmit = (onLoadingOrderSent: any) => {
  const { cartStore, ordersStore, userDetailsStore, adminCustomerStore, storeDataStore, couponsStore } =
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
    address,
    locationText,
  }: TPropsCheckoutSubmit) => {
    onLoadingOrderSent(true);
    console.log("location2xxx", address?.location);
    const order: any = {
      paymentMthod,
      shippingMethod,
      totalPrice,
      products: cartStore.cartItems,
      orderDate,
      orderType: ordersStore.orderType,
    };
    
    // Add applied coupon information if exists
    if (couponsStore.appliedCoupon) {
      order.appliedCoupon = {
        code: couponsStore.appliedCoupon.coupon.code,
        discountAmount: couponsStore.appliedCoupon.discountAmount,
        couponId: couponsStore.appliedCoupon.coupon._id
      };
    }
    
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
      if (address) {
        order.address = address;
        order.geo_positioning = {
          latitude: editOrderData
            ? editOrderData?.order?.geo_positioning?.latitude ||
              address?.location?.coordinates?.[1]
            : address?.location?.coordinates?.[1],
          longitude: editOrderData
            ? editOrderData?.order?.geo_positioning?.longitude ||
              address?.location?.coordinates?.[0]
            : address?.location?.coordinates?.[0],
        };
      }
      console.log("order.geo_positioning", order.geo_positioning);
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
