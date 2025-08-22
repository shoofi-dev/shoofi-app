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
import { WebView } from 'react-native-webview';

const CheckoutScreen = ({ route }) => {
  const { t } = useTranslation();
  const navigation = useNavigation();

  const { ordersStore, cartStore, adminCustomerStore, couponsStore, userDetailsStore, languageStore, shoofiAdminStore, addressStore } =
    useContext(StoreContext);
  const { selectedDate } = route.params;

  const { isCheckoutValid } = _useCheckoutValidate();
  

  const [isLoadingOrderSent, setIsLoadingOrderSent] = useState(null);
  const [paymentMthod, setPaymentMthod] = useState(null);
  const [paymentData, setPaymentData] = useState(null);
  const isCheckoutInProgress = useRef(false);

  const [isShippingMethodAgrred, setIsShippingMethodAgrred] = useState(false);
  const [addressLocation, setAddressLocation] = useState();
  const [addressLocationText, setAddressLocationText] = useState();
  const [place, setPlace] = useState(PLACE.current);
  const [totalPrice, setTotalPrice] = useState(0);
  const [itemsPrice, setItemsPrice] = useState(0);  

  const [editOrderData, setEditOrderData] = useState(null);

  const [shippingMethod, setShippingMethod] = useState(null);
  const [cartCount, setCartCount] = useState(0);
  
  // WebView state for digital payments
  const [paymentPageUrl, setPaymentPageUrl] = useState(null);
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);
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
  // useEffect(() => {
  //   const calculateTotalPrice = () => {
  //     let itemsPrice = 0;
  //     cartStore.cartItems.forEach((item) => {
  //       if (item) {
  //         itemsPrice += item.data.price * item.others.qty;
  //       }
  //     });

  //     // Get delivery price if shipping method is shipping
  //     const deliveryPrice = shippingMethod === SHIPPING_METHODS.shipping ? 
  //       (availableDrivers?.area?.price || 0) : 0;

  //     // Get discount from applied coupon
  //     const discount =  shippingMethod === SHIPPING_METHODS.shipping ? couponsStore.appliedCoupon?.discountAmount || 0 : 0;

  //     const finalPrice = itemsPrice + deliveryPrice - discount;
  //     setItemsPrice(itemsPrice);
  //     setTotalPrice(finalPrice);
  //   };

  //   calculateTotalPrice();
  // }, [cartStore.cartItems, shippingMethod, couponsStore.appliedCoupon, availableDrivers]);

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
    
    // Always clear payment URL and processing state when payment method changes
    setPaymentPageUrl(null);
    setIsProcessingPayment(false);
    
    // Create new ZCredit session for digital payment methods
    if (data === PAYMENT_METHODS.applePay || data === PAYMENT_METHODS.googlePay || data === PAYMENT_METHODS.bit) {
      // Pass the new payment method directly to avoid state timing issues
      createZCreditSession(data);
    }
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

  // Function to create ZCredit payment session for digital payments
  const createZCreditSession = async (newPaymentMethod = paymentMthod) => {
    try {
      setIsProcessingPayment(true);
      
      // Get user details
      const userDetails = adminCustomerStore.userDetails || userDetailsStore.userDetails;
      const customerName = userDetails?.name || "";
      const customerPhone = userDetails?.phone || "";
      
      // Determine FocusType based on payment method
      let focusType = "ApplePayOnly";
      if (newPaymentMethod === PAYMENT_METHODS.googlePay) {
        focusType = "GooglePayOnly";
      } else if (newPaymentMethod === PAYMENT_METHODS.bit) {
        focusType = "BitOnly";
      }
      
      // Prepare cart items
      const cartItems = cartStore.cartItems.map(item => ({
        Amount: (1 * item.others.qty).toString(),
        Currency: "ILS",
        Name: item.data.name,
        Description: item.data.description || "Item from order",
        Quantity: item.others.qty,
        Image: "",
        IsTaxFree: "false",
        AdjustAmount: "false"
      }));

      const requestBody = {
        Key: "c0863aa14e77ec032effda671797c295d8a2ab154e49242871a197d158fa3f30",
        Local: "He",
        UniqueId: "",
        SuccessUrl: "",
        CancelUrl: "",
        CallbackUrl: "",
        FailureCallBackUrl: "",
        FailureRedirectUrl: "",
        NumberOfFailures: 5,
        PaymentType: "regular",
        CreateInvoice: "false",
        AdditionalText: "",
        ShowCart: "false",
        ThemeColor: "c0e202",
        BitButtonEnabled: newPaymentMethod === PAYMENT_METHODS.bit ? "true" : "false",
        ApplePayButtonEnabled: newPaymentMethod === PAYMENT_METHODS.applePay ? "true" : "false",
        GooglePayButtonEnabled: newPaymentMethod === PAYMENT_METHODS.googlePay ? "true" : "false",
        Installments: 1,
        Customer: {
          Email: "",
          Name: customerName,
          PhoneNumber: customerPhone,
          Attributes: {
            HolderId: "none",
            Name: "required",
            PhoneNumber: "required",
            Email: "optional"
          }
        },
        CartItems: cartItems,
        FocusType: focusType,
        CardsIcons: {
          ShowVisaIcon: "true",
          ShowMastercardIcon: "true",
          ShowDinersIcon: "true",
          ShowAmericanExpressIcon: "true",
          ShowIsracardIcon: "true",
        },
        IssuerWhiteList: [1,2,3,4,5,6],
        BrandWhiteList: [1,2,3,4,5,6],
        UseLightMode: "true",
        UseCustomCSS: "true",
        BackgroundColor: "FFFFFF",
        ShowTotalSumInPayButton: "false",
        ForceCaptcha: "false",
        CustomCSS: "",
        Bypass3DS: "false"
      };

      const response = await fetch('https://pci.zcredit.co.il/webcheckout/api/WebCheckout/CreateSession', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody)
      });

      const responseData = await response.json();
      
      // Log the complete response
      console.log('ZCredit API Response:', responseData);
      
      // Log the SessionId specifically
      if (responseData.Data?.SessionId) {
        console.log('ZCredit SessionId:', responseData.Data.SessionId);
      }
      
      if (responseData.HasError === false && responseData.Data?.SessionUrl) {
        console.log('ZCredit SessionUrl:', responseData.Data.SessionUrl);
        setPaymentPageUrl(responseData.Data.SessionUrl);
      } else {
        console.error('Failed to create payment session:', responseData);
        // Handle error - maybe show an error dialog
        alert('Failed to create payment session. Please try again.');
      }
    } catch (error) {
      console.error('Error creating payment session:', error);
      alert('Network error. Please try again.');
    } finally {
      setIsProcessingPayment(false);
    }
  };

  // Handle WebView navigation state changes
  const handleWebViewNavigationStateChange = (navState) => {
    console.log('WebView navigation state changed:', navState.url);
    
    // Check for success/failure URLs and handle accordingly
    if (navState.url.includes('success') || navState.url.includes('callback')) {
      // Payment successful - proceed with order submission
      setPaymentPageUrl(null);
      handleCheckout();
    } else if (navState.url.includes('cancel') || navState.url.includes('failure')) {
      // Payment cancelled or failed
      setPaymentPageUrl(null);
      setIsProcessingPayment(false);
    }
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
        isAvailableDrivers: availableDrivers?.available,
        isDeliverySupport: shoofiAdminStore.storeData?.delivery_support,
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

    // // Remove applied coupon if shipping method is not delivery
    // if (couponsStore.appliedCoupon && shippingMethod !== SHIPPING_METHODS.shipping) {
    //   couponsStore.removeCoupon();
    // }

    // Redeem coupon if applied and shipping method is delivery
    // if (couponsStore.appliedCoupon && shippingMethod === SHIPPING_METHODS.shipping) {
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
  //  }
    const checkoutSubmitOrderRes = await checkoutSubmitOrder({
      paymentMthod,
      shippingMethod,
      totalPrice,
      itemsPrice,
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
    setTotalPrice(toalPriceValue);
  };

  const onItemsPriceChange = (itemsPriceValue) => {
    setItemsPrice(itemsPriceValue);
  };

  // Helper function to check if payment method is digital (Apple Pay, Google Pay, Bit)
  const isDigitalPaymentMethod = () => {
    return paymentMthod === PAYMENT_METHODS.applePay || 
           paymentMthod === PAYMENT_METHODS.googlePay || 
           paymentMthod === PAYMENT_METHODS.bit;
  };

  // Custom CSS to inject into the WebView
  const customCSS = `
    .ProductsMarginHE {
      display: none;
    }
      
    .CustomerDivTitle {
      display: none;
    }

    .PoweredBy {
      display: none;
    }

    /* Hide the parent element with ng-disabled attribute */
    .row[ng-disabled="vm.IsSubmitButtonDisabled()"][disabled="disabled"] {
      display: none !important;
    }

    .row[ng-show="vm.IsNameFieldShow()"] {
      display: none !important;
    }

    .row[ng-show="vm.IsEmailFieldShow()"] {
      display: none !important;
    }

    .row[ng-show="vm.IsPhoneNumberFieldShow()"] {
      display: none !important;
    }

    .row {
      margin-top: -16px;
      display: block;
    }

    .container {
      width: 100%;
      padding-left: 0;
      padding-right: 0;
      margin-left: unset;
      margin-right: unset;
    }

    #wrapper > div:first-child,
    #wrapper > div:nth-child(2) {
      display: none;
    }

    .sweet-overlay {
      display: none !important;
    }

    .showSweetAlert {
      display: none !important;
    }

    .gpay-card-info-container.black.hover, .gpay-card-info-animation-container.black.hover {
      background-color: #000 !important;
      outline: 1px solid #757575 !important;
    }

    #gpay-button-online-api-id {
      border-radius: 40px;
    }

    .col, .col-1, .col-10, .col-11, .col-12, .col-2, .col-3, .col-4, .col-5, .col-6, .col-7, .col-8, .col-9, .col-auto, .col-lg, .col-lg-1, .col-lg-10, .col-lg-11, .col-lg-12, .col-lg-2, .col-lg-3, .col-lg-4, .col-lg-5, .col-lg-6, .col-lg-7, .col-lg-8, .col-lg-9, .col-lg-auto, .col-md, .col-md-1, .col-md-10, .col-md-11, .col-md-12, .col-md-2, .col-md-3, .col-md-4, .col-md-5, .col-md-6, .col-md-7, .col-md-8, .col-md-9, .col-md-auto, .col-sm, .col-sm-1, .col-sm-10, .col-sm-11, .col-sm-12, .col-sm-2, .col-sm-3, .col-sm-4, .col-sm-5, .col-sm-6, .col-sm-7, .col-sm-8, .col-sm-9, .col-sm-auto, .col-xl, .col-xl-1, .col-xl-10, .col-xl-11, .col-xl-12, .col-xl-2, .col-xl-3, .col-xl-4, .col-xl-5, .col-xl-6, .col-xl-7, .col-xl-8, .col-xl-9, .col-xl-auto {
      padding-left: 0;
      padding-right: 0;
    }

    .gpay-card-info-animation-container {
      display: none !important;
      visibility: hidden !important;
      pointer-events: none !important;
    }

    .gpay-card-info-container {
      overflow: hidden !important;
    }

    .gpay-card-info-container * {
      animation: none !important;
      transition: none !important;
    }

    /* Force iframe to be immediately visible */
    .gpay-card-info-iframe {
      display: block !important;
      opacity: 1 !important;
      animation: none !important;
    }
    
    .SubmitButton {
        border-radius: 50px;
        height: 55px;
        box-shadow: none:
        background-color: #C1E300;
        border: none;
       color: #4d2e53;
       font-size: 20px;
       font-family: 'Tajawal', Arial, sans-serif !important;
       font-weight: 500;
    }


.SubmitButton .ng-binding {
    font-size: 0;
    visibility: hidden;
    position: relative;
}

.SubmitButton .ng-binding::before {
    content: "اتمام الدفع";
    visibility: visible;
    font-size: 20px;
    position: absolute;
        left: -40px;
        top: -17px;
        bottom: 0;
        margin: auto;
    white-space: nowrap;
}

    .SubmitButton i:before {
      content: '';
      width: 40px; /* Set desired width */
      height: 40px; /* Set desired height */
      background-image: url("data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAKcAAABcCAYAAAALQ6U2AAAACXBIWXMAAA7EAAAOxAGVKw4bAAAE3GlUWHRYTUw6Y29tLmFkb2JlLnhtcAAAAAAAPD94cGFja2V0IGJlZ2luPSfvu78nIGlkPSdXNU0wTXBDZWhpSHpyZVN6TlRjemtjOWQnPz4KPHg6eG1wbWV0YSB4bWxuczp4PSdhZG9iZTpuczptZXRhLyc+CjxyZGY6UkRGIHhtbG5zOnJkZj0naHR0cDovL3d3dy53My5vcmcvMTk5OS8wMi8yMi1yZGYtc3ludGF4LW5zIyc+CgogPHJkZjpEZXNjcmlwdGlvbiByZGY6YWJvdXQ9JycKICB4bWxuczpBdHRyaWI9J2h0dHA6Ly9ucy5hdHRyaWJ1dGlvbi5jb20vYWRzLzEuMC8nPgogIDxBdHRyaWI6QWRzPgogICA8cmRmOlNlcT4KICAgIDxyZGY6bGkgcmRmOnBhcnNlVHlwZT0nUmVzb3VyY2UnPgogICAgIDxBdHRyaWI6Q3JlYXRlZD4yMDI1LTA4LTIyPC9BdHRyaWI6Q3JlYXRlZD4KICAgICA8QXR0cmliOkV4dElkPjU2YTliYTYxLTE0MDYtNGY2Zi05MjM0LTQyMmQ0ZTBlYTQzYjwvQXR0cmliOkV4dElkPgogICAgIDxBdHRyaWI6RmJJZD41MjUyNjU5MTQxNzk1ODA8L0F0dHJpYjpGYklkPgogICAgIDxBdHRyaWI6VG91Y2hUeXBlPjI8L0F0dHJpYjpUb3VjaFR5cGU+CiAgICA8L3JkZjpsaT4KICAgPC9yZGY6U2VxPgogIDwvQXR0cmliOkFkcz4KIDwvcmRmOkRlc2NyaXB0aW9uPgoKIDxyZGY6RGVzY3JpcHRpb24gcmRmOmFib3V0PScnCiAgeG1sbnM6ZGM9J2h0dHA6Ly9wdXJsLm9yZy9kYy9lbGVtZW50cy8xLjEvJz4KICA8ZGM6dGl0bGU+CiAgIDxyZGY6QWx0PgogICAgPHJkZjpsaSB4bWw6bGFuZz0neC1kZWZhdWx0Jz5VbnRpdGxlZCAoMTY3IHggOTIgcHgpIC0gMTwvcmRmOmxpPgogICA8L3JkZjpBbHQ+CiAgPC9kYzp0aXRsZT4KIDwvcmRmOkRlc2NyaXB0aW9uPgoKIDxyZGY6RGVz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"); 
      background-size: contain;
      background-repeat: no-repeat;
      background-position: center;
      display: inline-block;
      position: absolute;
      top: 0;
      left: 0;
    }
    .SubmitButton:hover {
         box-shadow: none;
         color: #4d2e53;
         font-size: 18px;
     }
  `;

  // JavaScript code to inject CSS and fonts into the WebView
  const injectedJavaScript = `
    (function() {
      // Add Google Fonts preconnect links
      var preconnect1 = document.createElement('link');
      preconnect1.rel = 'preconnect';
      preconnect1.href = 'https://fonts.googleapis.com';
      document.head.appendChild(preconnect1);
      
      var preconnect2 = document.createElement('link');
      preconnect2.rel = 'preconnect';
      preconnect2.href = 'https://fonts.gstatic.com';
      preconnect2.crossOrigin = 'anonymous';
      document.head.appendChild(preconnect2);
      
      // Add Tajawal font link
      var fontLink = document.createElement('link');
      fontLink.rel = 'stylesheet';
      fontLink.href = 'https://fonts.googleapis.com/css2?family=Tajawal:wght@200;300;400;500;700;800;900&display=swap';
      document.head.appendChild(fontLink);
      
      // Add custom CSS styles
      var style = document.createElement('style');
      style.type = 'text/css';
      style.innerHTML = \`${customCSS}\`;
      document.head.appendChild(style);
      
      // Optional: Hide loading screen faster
      setTimeout(function() {
        var loadingElements = document.querySelectorAll('.loading, .spinner, .loader');
        loadingElements.forEach(function(el) {
          el.style.display = 'none';
        });
      }, 1000);
    })();
    true; // Required for iOS
  `;

  // Handle payment button click (only for non-digital payment methods)
  const handlePaymentButtonClick = () => {
    handleCheckout();
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
        style={{ marginHorizontal: 20, }}
        keyboardShouldPersistTaps="handled"
      >
        <View style={{height: "100%", paddingBottom: 100}}>

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
        <View
          style={{ marginTop: 20, }}
        >
          <AddressCMP
            onShippingMethodChangeFN={onShippingMethodChange}
            onGeoAddressChange={onGeoAddressChange}
            onTextAddressChange={onTextAddressChange}
            onPlaceChangeFN={onPlaceChange}
            onAddressChange={onAddressChange}
            shippingMethod={shippingMethod}
          />
        </View>
        <View

          style={{ marginTop: 40 }}
        >
          <PaymentMethodCMP
            onChange={onPaymentMethodChange}
            onPaymentDataChange={onPaymentDataChange}
            defaultValue={paymentMthod}
            shippingMethod={shippingMethod}
          />
        </View>
        <View style={{ marginTop: 10 }}>
            <TotalPriceCMP onChangeTotalPrice={onChangeTotalPrice} onItemsPriceChange={onItemsPriceChange} shippingMethod={shippingMethod} isCheckCoupon={true} appName={storeDataStore.storeData?.appName}  />
        </View>
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
          height: (100), // Keep same height for both button and WebView
          justifyContent: "center",
        }}
      >

        <View style={{ width: "90%", alignSelf: "center", height: "100%" }}>
          {paymentPageUrl && isDigitalPaymentMethod() ? (
            // WebView for digital payments - replaces the button
              <WebView
                  source={{ uri: paymentPageUrl }}
                  style={styles.webview}
                  onNavigationStateChange={handleWebViewNavigationStateChange}
                  startInLoadingState={true}
                  javaScriptEnabled={true}
                  domStorageEnabled={true}
                  injectedJavaScript={injectedJavaScript}
                  onMessage={(event) => {
                    // Handle messages from injected JavaScript if needed
                    console.log('WebView message:', event.nativeEvent.data);
                  }}
              />
          ) : (
            // Regular checkout button
            <Button
              onClickFn={() => handlePaymentButtonClick()}
              disabled={isLoadingOrderSent || driversLoading || isProcessingPayment}
              text={t("send-order")}
              isLoading={isLoadingOrderSent || driversLoading || isProcessingPayment}

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
          )}
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
  webview: {
    height: "100%",
    paddingTop: 100,
  },
});
