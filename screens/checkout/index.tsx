import { StyleSheet, View, DeviceEventEmitter } from "react-native";
import { observer } from "mobx-react";
import { useNavigation } from "@react-navigation/native";
import Button from "../../components/controls/button/button";
import themeStyle from "../../styles/theme.style";
import { useTranslation } from "react-i18next";
import { useEffect, useContext, useState } from "react";
import { StoreContext } from "../../stores";
import { AddressCMP } from "../../components/address";
import ConfirmActiondBasedEventDialog from "../../components/dialogs/confirm-action-based-event";
import LocationIsDisabledBasedEventDialog from "../../components/dialogs/location-is-disabled-based-event";
import RecipetNotSupportedBasedEventDialog from "../../components/dialogs/recipet-service-based-event/recipet-not-supported";
import { PaymentMethodCMP } from "../../components/payment-method";
import NewPaymentMethodBasedEventDialog from "../../components/dialogs/new-credit-card-based-event";
import SelectedTimeCMP from "../../components/dialogs/pick-time/selected-time";
import BackButton from "../../components/back-button";
import TotalPriceCMP from "../../components/total-price";
import { ScrollView } from "react-native-gesture-handler";
import StoreErrorMsgDialogEventBased from "../../components/dialogs/store-errot-msg-based-event";
import { DIALOG_EVENTS } from "../../consts/events";
import DeliveryMethodAggreeBasedEventDialog from "../../components/dialogs/delivery-method-aggree-based-event";
import _useCheckoutValidate from "../../hooks/checkout/use-checkout-validate";
import StoreIsCloseBasedEventDialog from "../../components/dialogs/store-is-close-based-event";
import InvalidAddressdBasedEventDialog from "../../components/dialogs/invalid-address-based-event";
import {
  animationDuration,
  PAYMENT_METHODS,
  PLACE,
  SHIPPING_METHODS,
} from "../../consts/shared";
import _useCheckoutSubmit from "../../hooks/checkout/use-checkout-submit";
import PaymentFailedBasedEventDialog from "../../components/dialogs/payment-failed-based-event";
import * as Animatable from "react-native-animatable";
import { storeDataStore } from "../../stores/store";
import Text from "../../components/controls/Text";
import { useAvailableDrivers } from "../../hooks/useAvailableDrivers";

const CheckoutScreen = ({ route }) => {
  const { t } = useTranslation();
  const navigation = useNavigation();

  const { ordersStore, cartStore, adminCustomerStore, couponsStore, userDetailsStore } =
    useContext(StoreContext);
  const { selectedDate } = route.params;

  const { isCheckoutValid } = _useCheckoutValidate();

  const [isLoadingOrderSent, setIsLoadingOrderSent] = useState(null);
  const [paymentMthod, setPaymentMthod] = useState(PAYMENT_METHODS.cash);
  const [paymentData, setPaymentData] = useState(null);

  const [isShippingMethodAgrred, setIsShippingMethodAgrred] = useState(false);
  const [addressLocation, setAddressLocation] = useState();
  const [addressLocationText, setAddressLocationText] = useState();
  const [place, setPlace] = useState(PLACE.current);
  const [totalPrice, setTotalPrice] = useState(0);

  const [editOrderData, setEditOrderData] = useState(null);

  const [shippingMethod, setShippingMethod] = useState(null);

  const {
    availableDrivers,
    loading: driversLoading,
    error: driversError,
  } = useAvailableDrivers({
    isEnabled: shippingMethod === SHIPPING_METHODS.shipping,
  });

  useEffect(()=>{
    cartStore.getShippingMethod().then((shippingMethodTmp)=>{
      console.log("shippingMethodTmp", shippingMethodTmp)
      setShippingMethod(shippingMethodTmp)
    })
  }, [])

  useEffect(() => {
    if (ordersStore.editOrderData) {
      setEditOrderData(ordersStore.editOrderData);
    }
  }, [ordersStore.editOrderData]);

  // useEffect(() => {
  //   if (editOrderData) {
  //     console.log("editOrderData",editOrderData.order.receipt_method)
  //     setShippingMethod(editOrderData.order.receipt_method);
  //     setPaymentMthod(editOrderData.order.payment_method);
  //     ordersStore.setOrderType(editOrderData.orderType);
  //   }
  // }, [editOrderData]);

  useEffect(() => {
    setIsShippingMethodAgrred(false);
  }, []);

  // Calculate total price including discount
  useEffect(() => {
    const calculateTotalPrice = () => {
      let itemsPrice = 0;
      cartStore.cartItems.forEach((item) => {
        if (item) {
          itemsPrice += item.data.price * item.others.qty;
        }
      });

      // Get delivery price if shipping method is shipping
      const deliveryPrice = shippingMethod === SHIPPING_METHODS.shipping ? 
        (availableDrivers?.area?.price || 0) : 0;

      // Get discount from applied coupon
      const discount = couponsStore.appliedCoupon?.discountAmount || 0;

      const finalPrice = itemsPrice + deliveryPrice - discount;
      setTotalPrice(finalPrice);
    };

    calculateTotalPrice();
  }, [cartStore.cartItems, shippingMethod, couponsStore.appliedCoupon, availableDrivers]);

  const goToOrderStatus = () => {
    (navigation as any).navigate("homeScreen");

    // if(userDetailsStore.isAdmin()){
    //   navigation.navigate("homeScreen");
    // }else{
    //   navigation.navigate("orders-status");
    // }
  };

  const onLoadingOrderSent = (value: boolean) => {
    setIsLoadingOrderSent(value);
  };
  const { checkoutSubmitOrder } = _useCheckoutSubmit(onLoadingOrderSent);

  const onShippingMethodChange = (data: any) => {
    setShippingMethod(data);
    console.log("onShippingMethodChange", data);
  };

  const onPlaceChange = (data: any) => {
    setPlace(data);
    console.log("onPlaceChange", data);
  };
  const onGeoAddressChange = (data: any) => {
    console.log("onGeoAddressChange", data);
    setAddressLocation(data);
  };
  const onTextAddressChange = (addressObj: any) => {
    console.log("onTextAddressChange", addressObj);
    setAddressLocationText(addressObj);
  };
  const onAddressChange = (addressObj: any) => {
    console.log("onAddressChange", addressObj);
    setAddressLocation(addressObj);
  };

  const onPaymentMethodChange = (data: any) => {
    setPaymentMthod(data);
    console.log("data", data);
  };

  // Handle payment data from credit card component
  const onPaymentDataChange = (data: any) => {
    setPaymentData(data);
    console.log("paymentData", data);
  };

  // SHIPPING METHOD AGGRE - START
  useEffect(() => {
    const subscription = DeviceEventEmitter.addListener(
      `${DIALOG_EVENTS.OPEN_DELIVER_METHOD_AGGREE_BASED_EVENT_DIALOG}_HIDE`,
      handleShippingMethodAgrreAnswer
    );
    return () => {
      subscription.remove();
    };
  }, [
    paymentMthod,
    shippingMethod,
    totalPrice,
    selectedDate,
    ordersStore.editOrderData,
    addressLocation,
    addressLocationText,
    paymentData
  ]);
  const handleShippingMethodAgrreAnswer = (data) => {
    setIsShippingMethodAgrred(data.value);
    handleCheckout(data.value);
  };
  const toggleShippingMethodAgrreeAnswer = () => {
    DeviceEventEmitter.emit(
      DIALOG_EVENTS.OPEN_DELIVER_METHOD_AGGREE_BASED_EVENT_DIALOG,
      { shippingMethod, selectedDate, paymentMthod }
    );
  };
  const isShippingMethodAgrredCheck = () => {
    if (isShippingMethodAgrred) {
      handleCheckout(isShippingMethodAgrred);
      return true;
    }
    toggleShippingMethodAgrreeAnswer();
    return false;
  };
  // SHIPPING METHOD AGGRE - END

  const postChargeOrderActions = () => {
    onLoadingOrderSent(false);
    cartStore.resetCart();
    if (editOrderData) {
      setTimeout(() => {
        adminCustomerStore.setCustomer(null);
        ordersStore.setEditOrderData(null);
      }, 1000);
      (navigation as any).navigate("admin-orders");
      return;
    }
    (navigation as any).navigate("order-submitted", { shippingMethod });
  };

  const handleCheckout = async (isShippingMethodAgrredValue) => {
    if (isShippingMethodAgrredValue) {
      const isCheckoutValidRes = await isCheckoutValid({
        shippingMethod,
        addressLocation,
        addressLocationText,
        place,
      });

      if (!isCheckoutValidRes) {
        return;
      }
    }

    if (!isShippingMethodAgrredValue) {
      isShippingMethodAgrredCheck();
      return false;
    }

    // Redeem coupon if applied
    if (couponsStore.appliedCoupon) {
      try {
        const userId = adminCustomerStore.userDetails?.customerId || editOrderData?.customerId || userDetailsStore.userDetails?.customerId;
        const orderId = editOrderData?._id || `temp-${Date.now()}`;
        
        await couponsStore.redeemCoupon(
          couponsStore.appliedCoupon.coupon.code,
          userId,
          orderId,
          couponsStore.appliedCoupon.discountAmount
        );
        
        console.log('Coupon redeemed successfully');
      } catch (error) {
        console.error('Failed to redeem coupon:', error);
        // Continue with checkout even if coupon redemption fails
      }
    }
    const checkoutSubmitOrderRes = await checkoutSubmitOrder({
      paymentMthod,
      shippingMethod,
      totalPrice,
      orderDate: selectedDate,
      editOrderData: ordersStore.editOrderData,
      address: addressLocation,
      locationText: addressLocationText,
      paymentData: paymentMthod === PAYMENT_METHODS.creditCard ? paymentData : undefined,
    });
    if (checkoutSubmitOrderRes) {
      postChargeOrderActions();
      return;
    }
    onLoadingOrderSent(false);
  };

  const onChangeTotalPrice = (toalPriceValue) => {
    setTotalPrice(toalPriceValue);
  };

  return (
    <View style={styles.container}>
      <View style={styles.backContainer}>
        <Animatable.View
          animation="fadeInLeft"
          duration={animationDuration}
          style={{
            width: 40,
            height: 35,
            alignItems: "center",
            justifyContent: "center",
            marginVertical: 0,
            marginLeft: 10,
            backgroundColor: themeStyle.GRAY_600,
            paddingHorizontal: 5,
            borderRadius: 10,
          }}
        >
          <BackButton />
        </Animatable.View>
      </View>
      <ScrollView
        style={{ marginHorizontal: 20 }}
        keyboardShouldPersistTaps="handled"
      >
        {storeDataStore.storeData?.isOrderLaterSupport && (
          <Animatable.View
            animation="fadeInDown"
            duration={animationDuration}
            style={{
              justifyContent: "center",
              alignItems: "center",
            }}
          >
            <SelectedTimeCMP selectedTime={selectedDate} />
          </Animatable.View>
        )}
        <Animatable.View
          animation="fadeInRight"
          duration={animationDuration}
          style={{ marginTop: 20 }}
        >
          <AddressCMP
            onShippingMethodChangeFN={onShippingMethodChange}
            onGeoAddressChange={onGeoAddressChange}
            onTextAddressChange={onTextAddressChange}
            onPlaceChangeFN={onPlaceChange}
            onAddressChange={onAddressChange}
            shippingMethod={shippingMethod}
          />
        </Animatable.View>
        <Animatable.View
          animation="fadeInLeft"
          duration={animationDuration}
          style={{ marginTop: 25 }}
        >
          <PaymentMethodCMP
            onChange={onPaymentMethodChange}
            onPaymentDataChange={onPaymentDataChange}
            defaultValue={paymentMthod}
            shippingMethod={shippingMethod}
          />
        </Animatable.View>
      </ScrollView>

      <Animatable.View
        animation="fadeInUp"
        duration={animationDuration}
        style={{
          position: "absolute",
          bottom: 0,
          left: 0,
          right: 0,
          backgroundColor: themeStyle.SECONDARY_COLOR,
          padding: 20,
          borderTopStartRadius: 30,
          borderTopEndRadius: 30,
          shadowColor: themeStyle.BLACK_COLOR,
          shadowOffset: {
            width: 2,
            height: 2,
          },
          shadowOpacity: 1,
          shadowRadius: 20,
          alignItems: "center",
        }}
      >
        <View style={{ width: "100%", marginBottom: 10 }}>
          <Text style={{ fontSize: 18, textAlign: "center", color: themeStyle.TEXT_PRIMARY_COLOR }}>
            {t("total-price")}: ₪{totalPrice.toFixed(2)}
          </Text>
        </View>
        <View style={{ width: "90%", marginTop: 10 }}>
          <Button
            onClickFn={() => handleCheckout(isShippingMethodAgrred)}
            // onClickFn={onSendCart}
            disabled={isLoadingOrderSent}
            // disabled={
            //   isLoadingOrderSent ||
            //   // isOpenShippingMethodDialog ||
            //   isloadingLocation
            //   //  ||
            //   // isPickTimeValid()
            // }
            text={t("send-order")}
            fontSize={18}
            textColor={themeStyle.TEXT_PRIMARY_COLOR}
            isLoading={isLoadingOrderSent}
            borderRadious={50}
            textPadding={0}
          />
        </View>
      </Animatable.View>
      <ConfirmActiondBasedEventDialog />
      <LocationIsDisabledBasedEventDialog />
      <RecipetNotSupportedBasedEventDialog />
      <NewPaymentMethodBasedEventDialog />
      <StoreErrorMsgDialogEventBased />
      <DeliveryMethodAggreeBasedEventDialog />
      <StoreIsCloseBasedEventDialog />
      <InvalidAddressdBasedEventDialog />
      <PaymentFailedBasedEventDialog />
    </View>
  );
};
export default observer(CheckoutScreen);

const styles = StyleSheet.create({
  container: {
    width: "100%",
    height: "100%",
  },
  textLang: {
    fontSize: 25,
    textAlign: "left",
  },
  backContainer: {
    flexDirection: "row-reverse",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 10,
    marginTop: 10,
  },
});
