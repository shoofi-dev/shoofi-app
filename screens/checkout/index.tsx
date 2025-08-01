import { StyleSheet, View, DeviceEventEmitter } from "react-native";
import { observer } from "mobx-react";
import { useNavigation } from "@react-navigation/native";
import Button from "../../components/controls/button/button";
import themeStyle from "../../styles/theme.style";
import { useTranslation } from "react-i18next";
import { useEffect, useContext, useState, useRef } from "react";
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

import { getCurrentLang } from "../../translations/i18n";
import Modal from "react-native-modal";
import OrderSubmittedScreen from "../order/submitted";
import OrderProcessingModal from "../../components/dialogs/order-processing-modal";

const CheckoutScreen = ({ route }) => {
  const { t } = useTranslation();
  const navigation = useNavigation();

  const { ordersStore, cartStore, adminCustomerStore, couponsStore, userDetailsStore, languageStore, shoofiAdminStore, addressStore } =
    useContext(StoreContext);
  const { selectedDate } = route.params;

  const { isCheckoutValid } = _useCheckoutValidate();

  const [isLoadingOrderSent, setIsLoadingOrderSent] = useState(null);
  const [paymentMthod, setPaymentMthod] = useState(PAYMENT_METHODS.cash);
  const [paymentData, setPaymentData] = useState(null);
  const isCheckoutInProgress = useRef(false);

  const [isShippingMethodAgrred, setIsShippingMethodAgrred] = useState(false);
  const [addressLocation, setAddressLocation] = useState();
  const [addressLocationText, setAddressLocationText] = useState();
  const [place, setPlace] = useState(PLACE.current);
  const [totalPrice, setTotalPrice] = useState(0);

  const [editOrderData, setEditOrderData] = useState(null);

  const [shippingMethod, setShippingMethod] = useState(null);
  const [cartCount, setCartCount] = useState(0);
  useEffect(() => {
    setCartCount(cartStore.getProductsCount());
  }, [cartStore.cartItems]);
  const {
    availableDrivers,
    availableDriversLoading: driversLoading,
    availableDriversError: driversError,
  } = shoofiAdminStore;

  useEffect(()=>{
    // cartStore.getShippingMethod().then((shippingMethodTmp)=>{
    //   setShippingMethod(shippingMethodTmp)
    // })
  }, [])

  useEffect(() => {
    if (shippingMethod !== SHIPPING_METHODS.shipping) return;
   
    const defaultAddress = addressStore?.defaultAddress;
    if (
      defaultAddress &&
      defaultAddress.location &&
      defaultAddress.location.coordinates
    ) {
      const [lng, lat] = defaultAddress.location.coordinates;
      const customerLocation = { lat, lng };
      
      let storeLocation = undefined;
      if (storeDataStore.storeData?.location) {
        const { lat: storeLat, lng: storeLng } = storeDataStore.storeData.location;
        storeLocation = { lat: storeLat, lng: storeLng };
      }
      
      shoofiAdminStore.fetchAvailableDrivers(customerLocation, storeLocation);
    }
  }, [shippingMethod, addressStore?.defaultAddress, addressStore.addresses, storeDataStore.storeData?.location?.lat, storeDataStore.storeData?.location?.lng]);

  useEffect(() => {
    if (ordersStore.editOrderData) {
      setEditOrderData(ordersStore.editOrderData);
    }
  }, [ordersStore.editOrderData]);

  // useEffect(() => {
  //   if (editOrderData) {
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
      const discount =  shippingMethod === SHIPPING_METHODS.shipping ? couponsStore.appliedCoupon?.discountAmount || 0 : 0;

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
    console.log("onShippingMethodChange", data)
    setShippingMethod(data);
  };

  const onPlaceChange = (data: any) => {
    setPlace(data);
  };
  const onGeoAddressChange = (data: any) => {
    setAddressLocation(data);
  };
  const onTextAddressChange = (addressObj: any) => {
    setAddressLocationText(addressObj);
  };
  const onAddressChange = (addressObj: any) => {
    setAddressLocation(addressObj);
  };

  const onPaymentMethodChange = (data: any) => {
    setPaymentMthod(data);
  };

  // Handle payment data from credit card component
  const onPaymentDataChange = (data: any) => {
    console.log("onPaymentDataChange", data)
    setPaymentData(data);
  };

  // SHIPPING METHOD AGGRE - START
  // useEffect(() => {
  //   const subscription = DeviceEventEmitter.addListener(
  //     `${DIALOG_EVENTS.OPEN_DELIVER_METHOD_AGGREE_BASED_EVENT_DIALOG}_HIDE`,
  //     handleShippingMethodAgrreAnswer
  //   );
  //   return () => {
  //     subscription.remove();
  //   };
  // }, [
  //   paymentMthod,
  //   shippingMethod,
  //   totalPrice,
  //   selectedDate,
  //   ordersStore.editOrderData,
  //   addressLocation,
  //   addressLocationText,
  //   paymentData
  // ]);
  // const handleShippingMethodAgrreAnswer = (data) => {
  //   setIsShippingMethodAgrred(data.value);
  //   handleCheckout(data.value);
  // };
  const toggleShippingMethodAgrreeAnswer = () => {
    DeviceEventEmitter.emit(
      DIALOG_EVENTS.OPEN_DELIVER_METHOD_AGGREE_BASED_EVENT_DIALOG,
      { shippingMethod, selectedDate, paymentMthod }
    );
  };
  const isShippingMethodAgrredCheck = () => {
    if (isShippingMethodAgrred) {
      handleCheckout();
      return true;
    }
    toggleShippingMethodAgrreeAnswer();
    return false;
  };
  // SHIPPING METHOD AGGRE - END

  const [isOrderSubmittedModalOpen, setIsOrderSubmittedModalOpen] = useState(false);
  const [submittedShippingMethod, setSubmittedShippingMethod] = useState(null);
  const [isProcessingModalOpen, setIsProcessingModalOpen] = useState(false);

  // Debug modal states
  useEffect(() => {
    console.log('Modal states changed:', { isOrderSubmittedModalOpen, isProcessingModalOpen });
  }, [isOrderSubmittedModalOpen, isProcessingModalOpen]);

  const postChargeOrderActions = () => {
    onLoadingOrderSent(false);
    isCheckoutInProgress.current = false;
    console.log('Hiding processing modal');
    setIsProcessingModalOpen(false); // Hide processing modal
    cartStore.resetCart();
    if (editOrderData) {
      setTimeout(() => {
        adminCustomerStore.setCustomer(null);
        ordersStore.setEditOrderData(null);
      }, 1000);
      (navigation as any).navigate("admin-orders");
      return;
    }
    DeviceEventEmitter.emit(
      `ORDER_SUBMITTED`
    );
    setSubmittedShippingMethod(shippingMethod);
    // Add a small delay to ensure processing modal is hidden before showing order submitted modal
    setTimeout(() => {
      setIsOrderSubmittedModalOpen(true);
    }, 700); // Increased delay to ensure processing modal is fully hidden
  };

  const handleCheckout = async () => {
    // Prevent multiple clicks using ref for immediate check
    if (isCheckoutInProgress.current) {
      return;
    }
    
    isCheckoutInProgress.current = true;
    setIsLoadingOrderSent(true);

    try {
      const isCheckoutValidRes = await isCheckoutValid({
        shippingMethod,
        addressLocation,
        addressLocationText,
        place,
        paymentMethod: paymentMthod,
      });
      if (!isCheckoutValidRes) {
        //todo: show error message
        setIsLoadingOrderSent(false);
        isCheckoutInProgress.current = false;
        setIsProcessingModalOpen(false); // Hide processing modal
        return;
      }
      setIsProcessingModalOpen(true); // Show processing modal

    // if (!isShippingMethodAgrredValue) {
    //   isShippingMethodAgrredCheck();
    //   return false;
    // }

    // Remove applied coupon if shipping method is not delivery
    if (couponsStore.appliedCoupon && shippingMethod !== SHIPPING_METHODS.shipping) {
      couponsStore.removeCoupon();
    }

    // Redeem coupon if applied and shipping method is delivery
    if (couponsStore.appliedCoupon && shippingMethod === SHIPPING_METHODS.shipping) {
      try {
        const userId = adminCustomerStore.userDetails?.customerId || editOrderData?.customerId || userDetailsStore.userDetails?.customerId;
        const orderId = editOrderData?._id || `temp-${Date.now()}`;
        
        await couponsStore.redeemCoupon(
          couponsStore.appliedCoupon.coupon.code,
          userId,
          orderId,
          couponsStore.appliedCoupon.discountAmount
        );
        
      } catch (error) {
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
      shippingPrice: shippingMethod === SHIPPING_METHODS.shipping ? availableDrivers?.area?.price || 0 : 0,
      storeData: storeDataStore.storeData,
    });
    if (checkoutSubmitOrderRes) {
      postChargeOrderActions();
      return;
    }
    onLoadingOrderSent(false);
    isCheckoutInProgress.current = false;
    setIsProcessingModalOpen(false); // Hide processing modal
  } catch (error) {
    console.error('Checkout error:', error);
    setIsLoadingOrderSent(false);
    isCheckoutInProgress.current = false;
    setIsProcessingModalOpen(false); // Hide processing modal
  }
  };

  const onChangeTotalPrice = (toalPriceValue) => {
    //setTotalPrice(toalPriceValue);
  };

  return (
    <View style={styles.container}>
      <View style={styles.backContainer}>
        <Animatable.View
          animation="fadeInLeft"
          duration={animationDuration}
     
        >
          <BackButton />
        </Animatable.View>
        <Text style={{ fontSize: 20, color: themeStyle.BLACK_COLOR }}>
        {languageStore.selectedLang === "ar" ? storeDataStore.storeData?.name_ar : storeDataStore.storeData?.name_he}
        </Text>
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
          style={{ marginTop: 40 }}
        >
          <PaymentMethodCMP
            onChange={onPaymentMethodChange}
            onPaymentDataChange={onPaymentDataChange}
            defaultValue={paymentMthod}
            shippingMethod={shippingMethod}
          />
        </Animatable.View>
        <View style={{ marginTop: 20 }}>
            <TotalPriceCMP onChangeTotalPrice={onChangeTotalPrice} shippingMethod={shippingMethod} isCheckCoupon={true} />
        </View>
  
      </ScrollView>

      <Animatable.View
        animation="fadeInUp"
        duration={animationDuration}
        style={{
          position: "absolute",
          bottom: 0,
          left: 0,
          right: 0,
          backgroundColor: "transparent",
          flexDirection: "row",
          borderTopStartRadius: (30),
          borderTopEndRadius: (30),

          alignItems: "center",
          height: (100),
          justifyContent: "center",
        }}
      >

        <View style={{ width: "90%", alignSelf: "center" }}>
          <Button
            onClickFn={() => handleCheckout()}
            disabled={isLoadingOrderSent}
            text={t("send-order")}
            isLoading={isLoadingOrderSent}

            icon="kupa"
            iconSize={themeStyle.FONT_SIZE_LG}
            fontSize={themeStyle.FONT_SIZE_LG}
            iconColor={themeStyle.SECONDARY_COLOR}
            fontFamily={`${getCurrentLang()}-Bold`}
            bgColor={themeStyle.PRIMARY_COLOR}
            textColor={themeStyle.SECONDARY_COLOR}
            borderRadious={100}
            extraText={`₪${totalPrice}`}
            countText={`${cartCount}`}
            countTextColor={themeStyle.PRIMARY_COLOR}
          />
        </View>
      </Animatable.View>
      <ConfirmActiondBasedEventDialog />
      <LocationIsDisabledBasedEventDialog />
      <RecipetNotSupportedBasedEventDialog />
      <NewPaymentMethodBasedEventDialog />
      <StoreErrorMsgDialogEventBased />
      <StoreIsCloseBasedEventDialog />
      <DeliveryMethodAggreeBasedEventDialog />
      <InvalidAddressdBasedEventDialog />
      <PaymentFailedBasedEventDialog />
      <OrderProcessingModal visible={isProcessingModalOpen} />
      <Modal
        isVisible={isOrderSubmittedModalOpen}
        onBackdropPress={() => {}}
        style={{ margin: 0, justifyContent: "flex-end", zIndex: 1000 }}
        animationIn="slideInUp"
        animationOut="slideOutDown"
        backdropOpacity={0.5}
        useNativeDriver
      >
        <OrderSubmittedScreen
          route={{ params: { shippingMethod: submittedShippingMethod } }}
          onClose={() => setIsOrderSubmittedModalOpen(false)}
          isModal={true}
        />
      </Modal>
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
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 15,
    marginTop: 10,
  },
});
