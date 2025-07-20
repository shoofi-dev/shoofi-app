import { useContext, useEffect, useRef, useState } from "react";
import { AppState, DeviceEventEmitter } from "react-native";
import * as Device from "expo-device";
import { StoreContext } from "../../stores";
import { PAYMENT_METHODS, SHIPPING_METHODS } from "../../consts/shared";
import { TOrderSubmitResponse } from "../../stores/cart";
import _useCheckoutChargeCC from "./use-checkout-charge-cc";
import { DIALOG_EVENTS } from "../../consts/events";
import { useTranslation } from "react-i18next";

export type TPropsCheckoutSubmit = {
  paymentMthod: any;
  shippingMethod: any;
  totalPrice: any;
  orderDate: any;
  editOrderData: any;
  address?: any;
  locationText?: any;
  paymentData?: any;
  shippingPrice?: any;
  storeData?: any;
};
const _useCheckoutSubmit = (onLoadingOrderSent: any) => {
  const { cartStore, ordersStore, userDetailsStore, adminCustomerStore, shoofiAdminStore, couponsStore } =
    useContext(StoreContext);
  const { chargeCC } = _useCheckoutChargeCC();
  const { t } = useTranslation();
  // Prevent multiple rapid order submissions
  const isSubmittingRef = useRef(false);
  const lastSubmissionTimeRef = useRef(0);

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
    paymentData,
    shippingPrice,
    storeData,
  }: TPropsCheckoutSubmit) => {
    // Prevent multiple rapid submissions
    const now = Date.now();
    const minInterval = 3000; // 3 seconds minimum between submissions
    
    if (isSubmittingRef.current) {
      return false;
    }
    
    if (now - lastSubmissionTimeRef.current < minInterval) {
      return false;
    }
    
    isSubmittingRef.current = true;
    lastSubmissionTimeRef.current = now;
    onLoadingOrderSent(true);
    
    try {
    const order: any = {
      paymentMthod,
      shippingMethod,
      totalPrice,
      products: cartStore.cartItems,
      orderDate,
      orderType: ordersStore.orderType,
      storeData,
    };
    
    // Add applied coupon information if exists
    if (couponsStore.appliedCoupon) {
      order.appliedCoupon = {
        coupon: couponsStore.appliedCoupon.coupon,
        discountAmount: couponsStore.appliedCoupon.discountAmount
      };
    }
    
    // Add payment data for credit card payments
    if (paymentMthod === "CREDITCARD" && paymentData) {
      order.paymentData = paymentData;
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
      if (locationText) {
        order.locationText = editOrderData
          ? editOrderData?.order?.locationText ? editOrderData?.order?.locationText : locationText
          : locationText;
      }
      order.shippingPrice = shippingPrice;
    }
    if (!!editOrderData) {
      const updateOrderAdminRes = updateOrderAdmin(
        order,
        editOrderData,
        paymentMthod
      );
      return updateOrderAdminRes;
    }

    // Submit order (payment will be processed server-side for credit card)
    const res: any = await cartStore.submitOrder(order);
    console.log("RRRRRRRRRRRRRR", res)
    // Handle server response
    if (res?.response?.data) {
      const responseData = res.response.data;
      
      // Handle specific error codes for order duplication prevention
      if (responseData.code === "ORDER_IN_PROGRESS") {
        DeviceEventEmitter.emit(DIALOG_EVENTS.OPEN_ORDER_ERROR_DIALOG, {
          title: t("order-error-modal-title"),
          message: responseData.err || t("order-error-modal-message")
        });
        return false;
      }
      
      if (responseData.code === "DUPLICATE_ORDER") {
        DeviceEventEmitter.emit(DIALOG_EVENTS.OPEN_ORDER_ERROR_DIALOG, {
          title: t("order-error-modal-title"),
          message: responseData.err || t("order-error-modal-message")
        });
        return false;
      }
    }
    
    if (res?.has_err) {
      console.log("XXXXXXXXXX")
      // Show order error modal for general order creation failures
      setTimeout(() => {
      DeviceEventEmitter.emit(DIALOG_EVENTS.OPEN_ORDER_ERROR_DIALOG, {
          title: t("order-error-modal-title"),
          message: t("order-error-modal-message")
        });
      }, 500);
      return false;
    }
    
    // Check payment status from server response
    if (paymentMthod === "CREDITCARD") {
      if (res?.paymentStatus === "success") {
        return true;
      } else if (res?.paymentStatus === "failed" || res?.paymentStatus === "error") {
        // Handle payment failure
        setTimeout(() => {

        DeviceEventEmitter.emit(DIALOG_EVENTS.OPEN_ORDER_ERROR_DIALOG, {
          title: t("order-error-modal-title"),
          message: res?.paymentError || t("order-error-modal-message")
        });
      }, 500);
        return false;
      }
    }
    
    return true;
  } catch (error) {
    console.error('Error during order submission:', error);
    // Show order error modal for any unexpected errors
    setTimeout(() => {
    DeviceEventEmitter.emit(DIALOG_EVENTS.OPEN_ORDER_ERROR_DIALOG, {
      title: t("order-error-modal-title"),
      message: t("order-error-modal-message")
    });
  }, 500);
      return false;
  } finally {
    // Reset submission state
    isSubmittingRef.current = false;
    onLoadingOrderSent(false);
  }
  };

  return {
    checkoutSubmitOrder,
  };
};

export default _useCheckoutSubmit;
