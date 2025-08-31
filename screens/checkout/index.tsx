import React from "react";
import { StyleSheet, View, DeviceEventEmitter, TouchableOpacity, Image } from "react-native";
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
import { handleZCreditPostMessage, createZCreditConfigWithPostMessages, ZCreditMessageHandlerConfig } from "../../helpers/zcredit-message-handler";
import { getPaymentMethodByValue } from "../../helpers/get-supported-payment-methods";
import Icon from "../../components/icon";

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
  const [isZCreditReady, setIsZCreditReady] = useState(false);
  const [zcreditLoadingTimeout, setZcreditLoadingTimeout] = useState(null);
  const [isWebViewVisibleForAuth, setIsWebViewVisibleForAuth] = useState(false);
  const [authPopupUrl, setAuthPopupUrl] = useState(null);
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
        Key: "952ad5fd3a963d4fec9d2e13dacb148144c04bfd5729cdbf5b6bee31a3468d6a",
        Local: "He",
        UniqueId: `order_${Date.now()}`,
        SuccessUrl: "https://success.zcredit.local",
        CancelUrl: "https://cancel.zcredit.local",
        CallbackUrl: "https://callback.zcredit.local",
        FailureCallBackUrl: "https://failure.zcredit.local",
        FailureRedirectUrl: "https://failure.zcredit.local",
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
        Bypass3DS: "false",
        PostMessageOnSubmit: "true",
        PostMessageOnSuccess: "true",
        PostMessageOnCancel: "true",
        PostMessageOnFailure: "true",
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
        setIsZCreditReady(false); // Reset ready state for new session

        // Add a fallback timeout to avoid infinite loading
        if (zcreditLoadingTimeout) {
          clearTimeout(zcreditLoadingTimeout);
        }
        const timeout = setTimeout(() => {
          console.log('⚠️ ZCredit loading timeout reached - forcing ready state');
          setIsZCreditReady(true);
        }, 10000); // 10 seconds timeout
        setZcreditLoadingTimeout(timeout);
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

  // ZCredit postMessage handlers
  const zcreditMessageHandlers: ZCreditMessageHandlerConfig = {
    onSubmit: (data) => {
      console.log('ZCredit: Payment form submitted', data);
      // Show processing state while payment is being processed
      setIsProcessingPayment(true);
    },

    onSuccess: (data) => {
      console.log('ZCredit: Payment successful', data);
      setIsWebViewVisibleForAuth(false); // Hide auth WebView if visible
      setAuthPopupUrl(null); // Clear popup URL
      // Complete the checkout process with the successful digital payment
      completeDigitalPaymentCheckout(data);
    },

    onCancel: (data) => {
      console.log('ZCredit: Payment cancelled by user', data);
      // Reset states to allow user to try again
      setIsProcessingPayment(false);
      setIsZCreditReady(true); // Keep ready so button is available again
      setIsWebViewVisibleForAuth(false); // Hide auth WebView if visible
      setAuthPopupUrl(null); // Clear popup URL
    },

    onFailure: (data) => {
      console.log('ZCredit: Payment failed', data);
      // Reset states to allow user to try again after error
      setIsProcessingPayment(false);
      setIsZCreditReady(true); // Keep ready so button is available again
      setIsWebViewVisibleForAuth(false); // Hide auth WebView if visible
      setAuthPopupUrl(null); // Clear popup URL

      // Use the exact same error dialog as credit card payments
      const errorMessage = data?.errorMessage || t("order-error-modal-message");
      setTimeout(() => {
        DeviceEventEmitter.emit(DIALOG_EVENTS.OPEN_ORDER_ERROR_DIALOG, {
          title: t("order-error-modal-title"),
          message: errorMessage
        });
      }, 500);
    },

    onSubmitEnd: (data) => {
      console.log('ZCredit: Form submission ended', data);
      // This indicates the form submission process has ended
      // You might want to hide loading indicators here
    },

    onUnknownMessage: (message) => {
      console.warn('ZCredit: Unknown message received', message);
    }
  };

  // Handle ZCredit WebView postMessages
  const handleZCreditWebViewMessage = (event) => {
    const message = event.nativeEvent.data;
    console.log('React Native received WebView message:', message);

    // Handle injection test message
    try {
      const parsedMessage = JSON.parse(message);

      if (parsedMessage.type === 'InjectionComplete') {
        console.log('✅ WebView injection successful:', parsedMessage.message);
        return;
      }

      if (parsedMessage.type === 'ZCreditReady') {
        console.log('✅ ZCredit iframe ready:', parsedMessage.message);
        if (parsedMessage.availableButtons) {
          console.log('Available payment buttons:', parsedMessage.availableButtons);
        }

        // Clear the loading timeout since we're ready
        if (zcreditLoadingTimeout) {
          clearTimeout(zcreditLoadingTimeout);
          setZcreditLoadingTimeout(null);
        }

        setIsZCreditReady(true);
        return;
      }

      if (parsedMessage.type === 'AuthPopupRequested') {
        console.log('🔐 Authentication popup requested at', new Date().toISOString(), ':', parsedMessage.data);
        console.log('🔍 Current state - Processing:', isProcessingPayment, 'Modal Open:', isWebViewVisibleForAuth, 'Current URL:', authPopupUrl);

        // Store the popup URL for the authentication modal
        if (parsedMessage.data && parsedMessage.data.url) {
          const url = parsedMessage.data.url;
          console.log('🔗 Setting authentication URL:', url);

          // Validate the URL before setting it
          if (url.includes('pay.google.com') || url.includes('accounts.google.com')) {
            console.log('✅ Valid Google Pay authentication URL detected');
            setAuthPopupUrl(url);
            setIsWebViewVisibleForAuth(true);

            // Auto-hide after 2 minutes if user doesn't interact
            setTimeout(() => {
              console.log('Auto-hiding authentication WebView after timeout');
              setIsWebViewVisibleForAuth(false);
              setAuthPopupUrl(null);
              setIsProcessingPayment(false);
            }, 120000);
          } else {
            console.log('⚠️ Invalid or non-Google Pay URL, rejecting:', url);
            // Reset payment state since this isn't a valid authentication flow
            setIsProcessingPayment(false);
          }
        } else {
          console.log('⚠️ No URL provided in AuthPopupRequested message');
          setIsProcessingPayment(false);
        }
        return;
      }

      if (parsedMessage.type === 'AuthenticationError') {
        console.log('❌ Authentication error detected:', parsedMessage.data);

        // Close the modal and reset states
        setIsWebViewVisibleForAuth(false);
        setAuthPopupUrl(null);
        setIsProcessingPayment(false);

        // Show error message to user
        setTimeout(() => {
          DeviceEventEmitter.emit(DIALOG_EVENTS.OPEN_ORDER_ERROR_DIALOG, {
            title: t("order-error"),
            message: t("payment-authentication-failed") || "Payment authentication failed. Please try again."
          });
        }, 500);

        return;
      }

      if (parsedMessage.type === 'AuthPopupClosed') {
        console.log('🔐 Authentication popup closed:', parsedMessage.data);
        setIsWebViewVisibleForAuth(false);
        setAuthPopupUrl(null);

        const wasSuccessful = parsedMessage.data?.success;
        console.log('🔍 Authentication result:', wasSuccessful ? 'SUCCESS' : 'CANCELLED/FAILED');

        if (wasSuccessful) {
          // Authentication was successful - continue payment
          console.log('✅ Authentication successful, continuing payment process...');

          setTimeout(() => {
            if (webViewRef.current) {
              console.log('📤 Injecting payment continuation script');
              const continuePaymentScript = `
                console.log('🎉 Authentication completed successfully!');
                console.log('🔄 Attempting to continue Google Pay payment...');
                
                // The authentication should have completed, now try to proceed with payment
                if (window.vm) {
                  try {
                    // Check if we can now proceed with Google Pay
                    if (window.vm.PayWithGooglePay_Clicked && typeof window.vm.PayWithGooglePay_Clicked === 'function') {
                      console.log('▶️ Calling PayWithGooglePay_Clicked to continue payment');
                      window.vm.PayWithGooglePay_Clicked();
                    } else if (window.vm.DoGooglePaySubmit && typeof window.vm.DoGooglePaySubmit === 'function') {
                      console.log('▶️ Calling DoGooglePaySubmit to continue payment');  
                      window.vm.DoGooglePaySubmit();
                    } else {
                      console.log('⚠️ Payment methods not found, checking Google Pay state...');
                      // Check if Google Pay is ready and trigger it
                      var googlePayButton = document.querySelector('.google-pay-button button');
                      if (googlePayButton) {
                        console.log('🔘 Clicking Google Pay button to continue');
                        googlePayButton.click();
                      }
                    }
                  } catch (error) {
                    console.log('❌ Error continuing payment after authentication:', error);
                  }
                } else {
                  console.log('⚠️ AngularJS vm not available for payment continuation');
                }
                true;
              `;
              webViewRef.current.injectJavaScript(continuePaymentScript);
            }
          }, 1500);
        } else {
          // Authentication was cancelled or failed
          console.log('❌ Authentication cancelled by user');
          setIsProcessingPayment(false); // Reset payment state so user can try again

          // Also reset authentication state in WebView for next attempt
          if (webViewRef.current) {
            const resetScript = `
              console.log('🔄 Resetting WebView state after auth cancellation/failure');
              if (window.resetAuthenticationState) {
                window.resetAuthenticationState();
              }
              if (window.vm && window.vm.UpdateIsWhileSubmit) {
                window.vm.UpdateIsWhileSubmit(false);
              }
              true;
            `;
            webViewRef.current.injectJavaScript(resetScript);
          }

          // Optional: Show a message that authentication was cancelled
          console.log('ℹ️ User cancelled authentication, payment button will be available again');
        }

        return;
      }

      // Handle reset payment state message from WebView
      if (parsedMessage.type === 'ResetPaymentState') {
        console.log('🔄 Received ResetPaymentState message:', parsedMessage.data);
        setIsProcessingPayment(false);
        setIsWebViewVisibleForAuth(false);
        setAuthPopupUrl(null);
        return;
      }

      if (parsedMessage.type === 'DebugMessage') {
        console.log('🐛 Debug message from ' + parsedMessage.source + ':', parsedMessage.originalMessage);

        // Process the original message if it's from ZCredit
        const originalMsg = parsedMessage.originalMessage;
        if (originalMsg && originalMsg.Reason && originalMsg.SessionID) {
          console.log('Processing ZCredit message from debug:', originalMsg);

          // Map ZCredit messages to our handler format
          if (originalMsg.Reason === 'IsWhileSubmit' && originalMsg.State === true) {
            console.log('🟡 ZCredit: Payment form submitted');
            zcreditMessageHandlers.onSubmit?.({
              sessionId: originalMsg.SessionID,
              reason: originalMsg.Reason,
              state: originalMsg.State
            });
          } else if (originalMsg.Code && originalMsg.Code !== 0) {
            console.log('🔴 ZCredit: Payment failed with code', originalMsg.Code);
            zcreditMessageHandlers.onFailure?.({
              sessionId: originalMsg.SessionID,
              errorCode: originalMsg.Code,
              errorMessage: originalMsg.Reason
            });
          } else if (originalMsg.Reason === 'Success' || originalMsg.Reason === 'Completed') {
            console.log('🟢 ZCredit: Payment successful');
            zcreditMessageHandlers.onSuccess?.({
              sessionId: originalMsg.SessionID,
              reason: originalMsg.Reason
            });
          }
        }

        return; // Don't process debug messages further
      }
    } catch (e) {
      // Not JSON, continue with normal handling
    }
    // Handle ZCredit postMessages
    handleZCreditPostMessage(message, zcreditMessageHandlers);
  };

  // Handle WebView navigation state changes (fallback for non-postMessage scenarios)
  const handleWebViewNavigationStateChange = (navState) => {
    console.log('WebView navigation state changed:', navState.url);

    // Note: With postMessage implementation, this is mainly a fallback
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
  `;

  // JavaScript code to inject CSS, fonts, and postMessage listener into the WebView
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
      
      // Comprehensive ZCredit postMessage capture
      function captureZCreditMessage(message, source) {
        console.log('ZCredit message captured from ' + source + ':', message);
        
        // Forward all messages to React Native for debugging
        if (window.ReactNativeWebView) {
          window.ReactNativeWebView.postMessage(JSON.stringify({
            source: source,
            originalMessage: message,
            type: 'DebugMessage'
          }));
        }
        
        // Check if this is a ZCredit postMessage
        var messageToProcess = message;
        if (typeof message === 'string') {
          // Try to parse JSON message
          try {
            messageToProcess = JSON.parse(message);
          } catch (e) {
            // Not JSON, check for specific keywords
            if (message.includes('PostMessage') || 
                message.includes('Submit') || 
                message.includes('Success') || 
                message.includes('Cancel') || 
                message.includes('Failure')) {
              // Likely a ZCredit message - forward to React Native
              if (window.ReactNativeWebView) {
                window.ReactNativeWebView.postMessage(message);
              }
            }
            return;
          }
        }
        
        // Check if it's a ZCredit postMessage type (original format)
        if (messageToProcess && messageToProcess.type && (
          messageToProcess.type === 'PostMessageOnSubmit' ||
          messageToProcess.type === 'PostMessageOnSuccess' ||
          messageToProcess.type === 'PostMessageOnCancel' ||
          messageToProcess.type === 'PostMessageOnFailure'
        )) {
          console.log('ZCredit postMessage detected:', messageToProcess.type);
          if (window.ReactNativeWebView) {
            window.ReactNativeWebView.postMessage(JSON.stringify(messageToProcess));
          }
        }
        
        // Check if it's ZCredit's actual message format
        if (messageToProcess && messageToProcess.Reason && messageToProcess.SessionID) {
          console.log('ZCredit custom message detected:', messageToProcess.Reason);
          
          var zcreditEvent = null;
          
          // Map ZCredit's Reason to our standard postMessage types
          if (messageToProcess.Reason === 'IsWhileSubmit' && messageToProcess.State === true) {
            zcreditEvent = {
              type: 'PostMessageOnSubmit',
              data: {
                sessionId: messageToProcess.SessionID,
                reason: messageToProcess.Reason,
                state: messageToProcess.State
              }
            };
          } else if (messageToProcess.Reason === 'IsWhileSubmit' && messageToProcess.State === false) {
            // This could be end of submit or form ready state
            zcreditEvent = {
              type: 'PostMessageOnSubmitEnd',
              data: {
                sessionId: messageToProcess.SessionID,
                reason: messageToProcess.Reason,
                state: messageToProcess.State
              }
            };
          } else if (messageToProcess.Code && messageToProcess.Code !== 0) {
            // Error/failure case
            zcreditEvent = {
              type: 'PostMessageOnFailure',
              data: {
                sessionId: messageToProcess.SessionID,
                reason: messageToProcess.Reason,
                errorCode: messageToProcess.Code,
                errorMessage: messageToProcess.Reason
              }
            };
          } else if (messageToProcess.Reason === 'Success' || messageToProcess.Reason === 'Completed') {
            // Success case (if they use this format)
            zcreditEvent = {
              type: 'PostMessageOnSuccess',
              data: {
                sessionId: messageToProcess.SessionID,
                reason: messageToProcess.Reason
              }
            };
          }
          
          if (zcreditEvent && window.ReactNativeWebView) {
            console.log('Sending mapped ZCredit event:', zcreditEvent.type);
            window.ReactNativeWebView.postMessage(JSON.stringify(zcreditEvent));
          }
        }
      }
      
      // Listen for postMessages on current window
      window.addEventListener('message', function(event) {
        captureZCreditMessage(event.data, 'window');
      });
      
      // Listen for postMessages on parent window (if in iframe)
      if (window.parent && window.parent !== window) {
        window.parent.addEventListener('message', function(event) {
          captureZCreditMessage(event.data, 'parent');
        });
      }
      
      // Listen for postMessages on top window
      if (window.top && window.top !== window) {
        window.top.addEventListener('message', function(event) {
          captureZCreditMessage(event.data, 'top');
        });
      }
      
      // Override postMessage to intercept all outgoing messages
      var originalPostMessage = window.postMessage;
      window.postMessage = function(message, targetOrigin) {
        console.log('Intercepted postMessage:', message);
        captureZCreditMessage(message, 'intercepted');
        return originalPostMessage.call(this, message, targetOrigin);
      };
      
      // Also override parent.postMessage if available
      if (window.parent && window.parent.postMessage) {
        var originalParentPostMessage = window.parent.postMessage;
        window.parent.postMessage = function(message, targetOrigin) {
          console.log('Intercepted parent postMessage:', message);
          captureZCreditMessage(message, 'parent-intercepted');
          return originalParentPostMessage.call(this, message, targetOrigin);
        };
      }
      

      
      // Also listen for custom events that ZCredit might dispatch
      document.addEventListener('ZCreditEvent', function(event) {
        console.log('ZCredit custom event:', event.detail);
        if (window.ReactNativeWebView) {
          window.ReactNativeWebView.postMessage(JSON.stringify({
            type: 'ZCreditEvent',
            data: event.detail
          }));
        }
      });
      
      // Optional: Hide loading screen faster
      setTimeout(function() {
        var loadingElements = document.querySelectorAll('.loading, .spinner, .loader');
        loadingElements.forEach(function(el) {
          el.style.display = 'none';
        });
      }, 1000);
      
      // Hide the ZCredit iframe but keep it in DOM
      function hideZCreditIframe() {
        console.log('Attempting to hide ZCredit iframe');
        
        // Hide the entire page body initially
        if (document.body) {
          document.body.style.display = 'none';
          document.body.style.visibility = 'hidden';
          document.body.style.opacity = '0';
          document.body.style.height = '0';
          document.body.style.overflow = 'hidden';
        }
        
        // Set up observer to hide iframe when it appears
        var observer = new MutationObserver(function(mutations) {
          mutations.forEach(function(mutation) {
            mutation.addedNodes.forEach(function(node) {
              if (node.nodeType === 1) { // Element node
                // Hide any iframe or container that appears
                if (node.tagName === 'IFRAME' || node.classList && node.classList.contains('payment-frame')) {
                  node.style.display = 'none';
                }
                // Also check children
                var iframes = node.querySelectorAll && node.querySelectorAll('iframe');
                if (iframes) {
                  for (var i = 0; i < iframes.length; i++) {
                    iframes[i].style.display = 'none';
                  }
                }
              }
            });
          });
        });
        
        observer.observe(document.body, {
          childList: true,
          subtree: true
        });
      }
      
             // Function to trigger ZCredit payment methods
       function triggerZCreditPaymentMethod(paymentMethod) {
         console.log('Triggering ZCredit payment for method:', paymentMethod);
         
         // Try multiple ways to access the Angular controller
         var vm = null;
         var scope = null;
         
         // Method 1: Standard Angular element selector
         try {
           var angularElement = document.querySelector('[ng-controller="ZCreditWebCheckoutController"]');
           if (angularElement && window.angular) {
             scope = window.angular.element(angularElement).scope();
             vm = scope ? scope.vm : null;
             console.log('Method 1 - Angular element access:', vm ? 'Success' : 'Failed');
           }
         } catch (e) {
           console.log('Method 1 failed:', e);
         }
         
         // Method 2: Try accessing through body or document
         if (!vm) {
           try {
             var bodyElement = document.body;
             if (bodyElement && window.angular) {
               var bodyScope = window.angular.element(bodyElement).scope();
               if (bodyScope && bodyScope.$$childHead) {
                 // Walk through child scopes to find the controller
                 var currentScope = bodyScope.$$childHead;
                 while (currentScope) {
                   if (currentScope.vm) {
                     vm = currentScope.vm;
                     scope = currentScope;
                     console.log('Method 2 - Body scope walk:', vm ? 'Success' : 'Failed');
                     break;
                   }
                   currentScope = currentScope.$$nextSibling;
                 }
               }
             }
           } catch (e) {
             console.log('Method 2 failed:', e);
           }
         }
         
         // Method 3: Global scope access (if Angular puts it there)
         if (!vm) {
           try {
             if (window.angular && window.angular.element(document).scope()) {
               var rootScope = window.angular.element(document).scope();
               if (rootScope.$$childHead) {
                 var currentScope = rootScope.$$childHead;
                 while (currentScope) {
                   if (currentScope.vm) {
                     vm = currentScope.vm;
                     scope = currentScope;
                     console.log('Method 3 - Root scope walk:', vm ? 'Success' : 'Failed');
                     break;
                   }
                   currentScope = currentScope.$$nextSibling;
                 }
               }
             }
           } catch (e) {
             console.log('Method 3 failed:', e);
           }
         }
         
         if (!vm) {
           console.error('Could not access ZCredit controller vm through any method');
           return false;
         }
         
         console.log('Successfully found controller vm:', vm);
         
         // Trigger the appropriate payment method based on the payment type
         try {
           switch (paymentMethod) {
             case 'apple_pay':
               console.log('Triggering Apple Pay');
               if (typeof vm.PayWithApplePay_Clicked === 'function') {
                 console.log('Calling vm.PayWithApplePay_Clicked()');
                 
                 // Wrap the Apple Pay call to catch cancellation
                 try {
                   vm.PayWithApplePay_Clicked();
                   if (scope) scope.$apply();
                   return true;
                 } catch (error) {
                   console.log('Apple Pay error or cancellation:', error);
                   
                   // Send cancel message back to React Native
                   if (window.ReactNativeWebView) {
                     window.ReactNativeWebView.postMessage(JSON.stringify({
                       type: 'PostMessageOnCancel',
                       data: {
                         message: 'Apple Pay cancelled',
                         cancelled: true
                       }
                     }));
                   }
                   return false;
                 }
               } else {
                 console.error('Apple Pay method not found or not a function:', typeof vm.PayWithApplePay_Clicked);
               }
               break;
               
 
               
               
             default:
               console.log('Unknown payment method:', paymentMethod);
               // Fallback to clicking submit button
               return triggerSubmitButton();
           }
         } catch (error) {
           console.error('Error triggering payment method:', error);
           return false;
         }
         
         return false;
       }
       
               // Listen for postMessages from React Native to trigger payments
        window.addEventListener('message', function(event) {
          console.log('ZCredit iframe received message:', event.data);
          console.log('Message origin:', event.origin);
          console.log('Message source:', event.source);
          
          try {
            var data;
            if (typeof event.data === 'string') {
              data = JSON.parse(event.data);
            } else {
              data = event.data;
            }
            
            console.log('Parsed message data:', data);
            
            if (data.type === 'TriggerZCreditPayment') {
              console.log('Processing TriggerZCreditPayment message');
              var result = triggerZCreditPaymentMethod(data.paymentMethod);
              console.log('Payment trigger result:', result);
            }
          } catch (e) {
            console.log('Message processing error:', e);
          }
        });
        
        // Also listen for custom events as fallback
        window.addEventListener('triggerZCreditPayment', function(event) {
          console.log('ZCredit iframe received custom event:', event.detail);
          
          if (event.detail && event.detail.type === 'TriggerZCreditPayment') {
            console.log('Processing custom event');
            var result = triggerZCreditPaymentMethod(event.detail.paymentMethod);
            console.log('Custom event trigger result:', result);
          }
        });
        
                 // Monitor for payment session cancellations/completions
         var paymentInProgress = false;
         
         // Override PaymentRequest show method to detect cancellations
         if (window.PaymentRequest) {
           var originalShow = window.PaymentRequest.prototype.show;
           window.PaymentRequest.prototype.show = function() {
             console.log('Payment session started');
             paymentInProgress = true;
             
             var promise = originalShow.apply(this, arguments);
             
             promise.then(function(response) {
               console.log('Payment session completed successfully');
               paymentInProgress = false;
             }).catch(function(error) {
               console.log('Payment session cancelled or failed:', error);
               paymentInProgress = false;
               
               // Send cancel message back to React Native
               if (window.ReactNativeWebView) {
                 window.ReactNativeWebView.postMessage(JSON.stringify({
                   type: 'PostMessageOnCancel',
                   data: {
                     message: 'Payment cancelled by user',
                     cancelled: true,
                     error: error.message
                   }
                 }));
               }
             });
             
             return promise;
           };
         }
         
 
         // Additional debugging - check if Angular is available
         setTimeout(function() {
           console.log('Angular availability check:');
           console.log('- window.angular:', typeof window.angular);
           console.log('- angular.element:', typeof (window.angular && window.angular.element));
           console.log('- Controller element:', document.querySelector('[ng-controller="ZCreditWebCheckoutController"]'));
           
           // Try to access the controller
           var angularElement = document.querySelector('[ng-controller="ZCreditWebCheckoutController"]');
           if (angularElement && window.angular) {
             try {
               var scope = window.angular.element(angularElement).scope();
               console.log('- Angular scope:', scope);
               console.log('- Controller vm:', scope ? scope.vm : 'No scope');
               if (scope && scope.vm) {
                 console.log('- Available payment methods:', {
                   applePay: typeof scope.vm.PayWithApplePay_Clicked,
                   googlePay: typeof scope.vm.PayWithGooglePay_Clicked,
                   bit: typeof scope.vm.PayWithBit_Clicked
                 });
               }
             } catch (e) {
               console.log('- Error accessing Angular scope:', e);
             }
           }
         }, 2000);
      
      // Fallback function to click submit button
      function triggerSubmitButton() {
        console.log('Attempting to trigger submit button as fallback');
        
        var selectors = [
          '.SubmitButton',
          'button[type="submit"]',
          'input[type="submit"]',
          '.payment-button',
          'button'
        ];
        
        for (var i = 0; i < selectors.length; i++) {
          var buttons = document.querySelectorAll(selectors[i]);
          if (buttons && buttons.length > 0) {
            for (var j = 0; j < buttons.length; j++) {
              var button = buttons[j];
              if (button.offsetParent !== null || button.style.display !== 'none') {
                console.log('Clicking submit button:', button);
                button.click();
                return true;
              }
            }
          }
        }
        
        return false;
      }
      
      // Wait for page to load then hide iframe and check for payment buttons
      var retryCount = 0;
      var maxRetries = 10; // Max 5 seconds of retrying
      
      function checkAndSetupPayment() {
        console.log('Checking for payment setup... attempt', retryCount + 1);
        hideZCreditIframe();
        
        // Check if payment buttons are available
        var paymentButtons = [
          document.querySelector('.SubmitButton'),
          document.querySelector('.apple-pay-button'), 
          document.querySelector('.GooglePayContainer button')
        ];
        
        var foundButton = false;
        for (var i = 0; i < paymentButtons.length; i++) {
          if (paymentButtons[i]) {
            console.log('Found payment button:', paymentButtons[i]);
            foundButton = true;
            break;
          }
        }
        
        if (foundButton || document.querySelector('form')) {
          console.log('Payment ready - sending ZCreditReady message');
          if (window.ReactNativeWebView) {
            window.ReactNativeWebView.postMessage(JSON.stringify({
              type: 'ZCreditReady',
              message: 'ZCredit iframe hidden and payment buttons ready',
              hasPaymentButtons: foundButton,
              availableButtons: {
                submitButton: !!document.querySelector('.SubmitButton'),
                applePayButton: !!document.querySelector('.apple-pay-button'),
                googlePayButton: !!document.querySelector('.GooglePayContainer button')
              }
            }));
          }
        } else if (retryCount < maxRetries) {
          console.log('Payment buttons not ready yet, retrying...', retryCount + 1, '/', maxRetries);
          retryCount++;
          setTimeout(checkAndSetupPayment, 500);
        } else {
          console.log('Max retries reached, proceeding anyway - sending ZCreditReady message');
          if (window.ReactNativeWebView) {
            window.ReactNativeWebView.postMessage(JSON.stringify({
              type: 'ZCreditReady',
              message: 'ZCredit iframe hidden - proceeding without payment buttons detected',
              hasPaymentButtons: false,
              maxRetriesReached: true,
              availableButtons: {
                submitButton: false,
                applePayButton: false,
                googlePayButton: false
              }
            }));
          }
        }
      }
      
      // Start checking after initial load
      setTimeout(checkAndSetupPayment, 1000);
      
      // Debug: Log that the injection was successful
      console.log('ZCredit WebView injection completed - postMessage listeners active');
      
      // Send a test message to confirm communication works
      if (window.ReactNativeWebView) {
        window.ReactNativeWebView.postMessage(JSON.stringify({
          type: 'InjectionComplete',
          message: 'ZCredit WebView JavaScript injection completed'
        }));
      }
    })();
    true; // Required for iOS
  `;

  // Complete checkout for successful digital payments (bypasses validation)
  const completeDigitalPaymentCheckout = async (paymentData) => {
    console.log('Completing digital payment checkout with data:', paymentData);

    // Prevent multiple submissions
    if (isCheckoutInProgress.current) {
      return;
    }

    isCheckoutInProgress.current = true;
    setIsLoadingOrderSent(true);
    setIsProcessingPayment(false); // Digital payment is already processed
    setIsProcessingModalOpen(true); // Show processing modal

    try {
      // Skip validation since payment is already successful

      // Handle coupon redemption if needed
      try {
        const userId = adminCustomerStore.userDetails?.customerId || editOrderData?.customerId || userDetailsStore.userDetails?.customerId;
        const orderId = editOrderData?._id || `temp-${Date.now()}`;

        if (couponsStore.appliedCoupon) {
          await couponsStore.redeemCoupon(
              couponsStore.appliedCoupon.coupon.code,
              userId,
              orderId,
              couponsStore.appliedCoupon.discountAmount
          );
        }
      } catch (error) {
        console.log('Coupon redemption error (continuing):', error);
      }

      // Submit the order with successful digital payment
      const checkoutSubmitOrderRes = await checkoutSubmitOrder({
        paymentMthod,
        shippingMethod,
        totalPrice,
        itemsPrice,
        orderDate: selectedDate,
        editOrderData: ordersStore.editOrderData,
        address: addressLocation,
        locationText: addressLocationText,
        paymentData: paymentData, // Use digital payment data
        shippingPrice: shippingMethod === SHIPPING_METHODS.shipping ? availableDrivers?.area?.price || 0 : 0,
        storeData: storeDataStore.storeData,
      });

      if (checkoutSubmitOrderRes) {
        // Success - proceed with post-checkout actions
        postChargeOrderActions();
        return;
      }

      // If order submission failed
      setIsLoadingOrderSent(false);
      isCheckoutInProgress.current = false;
      setIsProcessingModalOpen(false);
      setIsZCreditReady(true); // Re-enable digital payment button

    } catch (error) {
      console.error('Digital payment checkout error:', error);
      setIsLoadingOrderSent(false);
      isCheckoutInProgress.current = false;
      setIsProcessingModalOpen(false);
      setIsZCreditReady(true); // Re-enable digital payment button

      // Show error dialog
      setTimeout(() => {
        DeviceEventEmitter.emit(DIALOG_EVENTS.OPEN_ORDER_ERROR_DIALOG, {
          title: t("order-error-modal-title"),
          message: t("order-error-modal-message")
        });
      }, 500);
    }
  };

  // Get the payment method configuration for digital payments
  const getDigitalPaymentMethodConfig = () => {
    const paymentMethodConfig = getPaymentMethodByValue(paymentMthod);
    return paymentMethodConfig;
  };

  // Get the appropriate icon name for digital payment method (fallback)
  const getDigitalPaymentIcon = () => {
    if (paymentMthod === PAYMENT_METHODS.applePay) {
      return "kupa"; // Use payment icon for Apple Pay
    } else if (paymentMthod === PAYMENT_METHODS.googlePay) {
      return "kupa"; // Use payment icon for Google Pay
    } else if (paymentMthod === PAYMENT_METHODS.bit) {
      return "shekel"; // Use shekel icon for Bit
    }
    // Fallback to default payment icon
    return "kupa";
  };

  // Handle payment button click (only for non-digital payment methods)
  const handlePaymentButtonClick = () => {
    handleCheckout();
  };

  // Trigger ZCredit payment from custom button
  const triggerZCreditPayment = async () => {
    if (paymentPageUrl && isDigitalPaymentMethod() && webViewRef.current) {
      console.log('🚀 Triggering ZCredit payment via custom button');

      // Reset authentication state in WebView before starting new payment attempt
      console.log('🔄 Resetting authentication state before payment');
      const resetScript = `
        console.log('🔄 ZCredit: Resetting authentication state for new payment attempt');
        if (window.resetAuthenticationState) {
          window.resetAuthenticationState();
        }
        // Also reset any stuck states
        if (window.vm && window.vm.UpdateIsWhileSubmit) {
          window.vm.UpdateIsWhileSubmit(false);
        }
        true;
      `;
      webViewRef.current.injectJavaScript(resetScript);

      // Set processing state for validation
      setIsProcessingPayment(true);

      try {
        // For digital payments, use cash as payment method for validation
        // since digital payments are handled through ZCredit and might not be
        // configured as supported payment methods in store settings
        const isCheckoutValidRes = await isCheckoutValid({
          shippingMethod,
          addressLocation,
          addressLocationText,
          place,
          paymentMethod: PAYMENT_METHODS.cash, // Use cash for validation
          isAvailableDrivers: availableDrivers?.available,
          isDeliverySupport: shoofiAdminStore.storeData?.delivery_support,
        });

        if (!isCheckoutValidRes) {
          console.log('Digital payment validation failed');
          // Reset processing state if validation fails
          setIsProcessingPayment(false);
          return;
        }

        console.log('Digital payment validation passed, proceeding with payment');

        // Add fallback timeout to reset processing state if no response
        setTimeout(() => {
          if (isProcessingPayment) {
            console.log('Payment timeout - resetting processing state');
            setIsProcessingPayment(false);
          }
        }, 30000); // 30 second timeout

        // Determine which payment method is selected
        let paymentMethod = 'unknown';
        if (paymentMthod === PAYMENT_METHODS.applePay) {
          paymentMethod = 'apple_pay';
        } else if (paymentMthod === PAYMENT_METHODS.googlePay) {
          paymentMethod = 'google_pay';
        } else if (paymentMthod === PAYMENT_METHODS.bit) {
          paymentMethod = 'bit';
        }

        console.log('📤 Selected payment method for trigger:', paymentMethod);
        console.log('🔍 Current modal state before trigger - isWebViewVisibleForAuth:', isWebViewVisibleForAuth, 'authPopupUrl:', authPopupUrl);

        // Send postMessage to iframe with payment method info
        const triggerScript = `
          (function() {
            console.log('Sending postMessage to trigger ZCredit payment:', '${paymentMethod}');
            
            // Send message to the iframe's window
            window.postMessage(JSON.stringify({
              type: 'TriggerZCreditPayment',
              paymentMethod: '${paymentMethod}'
            }), '*');
            
            // Also dispatch a custom event as a fallback
            window.dispatchEvent(new CustomEvent('triggerZCreditPayment', {
              detail: {
                type: 'TriggerZCreditPayment',
                paymentMethod: '${paymentMethod}'
              }
            }));
          })();
          true;
        `;

        webViewRef.current.injectJavaScript(triggerScript);

      } catch (error) {
        console.error('Error during digital payment validation:', error);
        setIsProcessingPayment(false);
      }
    }
  };

  // WebView ref to communicate with iframe
  const webViewRef = useRef(null);

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
            {/* Hidden WebView for digital payments - completely invisible and out of layout flow */}
            {paymentPageUrl && isDigitalPaymentMethod() && (
                <>
                  {/* Hidden WebView Container */}
                  <View style={{
                    position: 'absolute',
                    left: -10000,
                    top: -10000,
                    width: 0,
                    height: 0,
                    overflow: 'hidden',
                    opacity: 0,
                    zIndex: -999,
                  }}>
                    <WebView
                        ref={webViewRef}
                        source={{ uri: paymentPageUrl }}
                        style={{
                          width: 300, // Give it some size inside the hidden container
                          height: 400,
                        }}
                        onNavigationStateChange={handleWebViewNavigationStateChange}
                        startInLoadingState={true}

                        javaScriptEnabled={true}
                        domStorageEnabled={true}
                        injectedJavaScript={injectedJavaScript}
                        injectedJavaScriptBeforeContentLoaded={`
                  console.log('WebView: JavaScript injection before content loaded');
                  window.isReactNativeWebView = true;
                `}
                        onMessage={handleZCreditWebViewMessage}
                        // Enable postMessage communication from WebView to React Native
                        mixedContentMode="compatibility"
                        allowsInlineMediaPlayback={true}
                        // Additional WebView settings for better postMessage support
                        allowFileAccess={true}
                        allowUniversalAccessFromFileURLs={true}
                        allowFileAccessFromFileURLs={true}
                        // Enable popup handling for Google Pay authentication
                        setSupportMultipleWindows={true}
                        onShouldStartLoadWithRequest={(request) => {
                          console.log('WebView navigation request:', request.url);
                          return true;
                        }}
                        // Handle new window requests (popups)
                        onOpenWindow={(syntheticEvent) => {
                          const { nativeEvent } = syntheticEvent;
                          console.log('WebView wants to open new window:', nativeEvent.targetUrl);
                          // Let the WebView handle the popup
                          return true;
                        }}
                        onLoadEnd={() => {
                          console.log('WebView: Load completed');
                        }}
                        onError={(syntheticEvent) => {
                          const { nativeEvent } = syntheticEvent;
                          console.error('WebView error:', nativeEvent);
                        }}
                    />

                    {/* Close button overlay when WebView is visible for authentication */}
                    {isWebViewVisibleForAuth && (
                        <TouchableOpacity
                            style={{
                              position: 'absolute',
                              top: 50,
                              right: 20,
                              backgroundColor: 'rgba(0,0,0,0.7)',
                              borderRadius: 20,
                              width: 40,
                              height: 40,
                              justifyContent: 'center',
                              alignItems: 'center',
                              zIndex: 10000,
                            }}
                            onPress={() => {
                              console.log('User manually closed WebView authentication');
                              setIsWebViewVisibleForAuth(false);
                            }}
                        >
                          <Icon
                              icon="close"
                              size={24}
                              color="white"
                          />
                        </TouchableOpacity>
                    )}
                  </View>

                  {/* Authentication Modal - Centered and Animated */}
                  <Modal
                      isVisible={isWebViewVisibleForAuth}
                      onBackdropPress={() => {
                        console.log('User closed authentication modal by tapping backdrop');
                        setIsWebViewVisibleForAuth(false);
                        setAuthPopupUrl(null);

                        // Reset payment state since user cancelled authentication
                        console.log('❌ Authentication cancelled by backdrop tap');
                        setIsProcessingPayment(false);

                        // Reset authentication state in WebView
                        if (webViewRef.current) {
                          const cancelScript = `
                      console.log('🔄 Resetting WebView state - user closed modal via backdrop');
                      // Reset authentication state for next attempt
                      if (window.resetAuthenticationState) {
                        window.resetAuthenticationState();
                      }
                      // Reset any payment state in ZCredit
                      if (window.vm && window.vm.UpdateIsWhileSubmit) {
                        window.vm.UpdateIsWhileSubmit(false);
                      }
                      true;
                    `;
                          webViewRef.current.injectJavaScript(cancelScript);
                        }
                      }}
                      style={{
                        margin: 0,
                        justifyContent: 'center',
                        alignItems: 'center',
                      }}
                      animationIn="zoomIn"
                      animationOut="zoomOut"
                      backdropOpacity={0.5}
                      useNativeDriver={true}
                      animationInTiming={300}
                      animationOutTiming={200}
                      backdropTransitionInTiming={300}
                      backdropTransitionOutTiming={200}
                  >
                    <View style={{
                      backgroundColor: 'white',
                      borderRadius: 12,
                      width: '90%',
                      maxWidth: 400,
                      maxHeight: '80%',
                      overflow: 'hidden',
                      shadowColor: "#000",
                      shadowOffset: { width: 0, height: 4 },
                      shadowOpacity: 0.3,
                      shadowRadius: 6,
                      elevation: 8,
                    }}>
                      {/* Modal Header */}
                      <View style={{
                        flexDirection: 'row',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        paddingHorizontal: 20,
                        paddingVertical: 15,
                        backgroundColor: '#f8f9fa',
                        borderBottomWidth: 1,
                        borderBottomColor: '#e9ecef',
                      }}>
                        <Text style={{
                          fontSize: 18,
                          fontWeight: '600',
                          color: '#333',
                        }}>
                          {t("payment-method") || "Payment Authentication"}
                        </Text>
                        <TouchableOpacity
                            style={{
                              padding: 8,
                              borderRadius: 20,
                              backgroundColor: 'transparent',
                            }}
                            onPress={() => {
                              console.log('User manually closed authentication modal');
                              setIsWebViewVisibleForAuth(false);
                              setAuthPopupUrl(null);

                              // Reset payment state since user cancelled authentication
                              console.log('❌ Authentication cancelled by close button');
                              setIsProcessingPayment(false);

                              // Reset authentication state in WebView
                              if (webViewRef.current) {
                                const cancelScript = `
                            console.log('🔄 Resetting WebView state - user closed modal via close button');
                            // Reset authentication state for next attempt
                            if (window.resetAuthenticationState) {
                              window.resetAuthenticationState();
                            }
                            // Reset any payment state in ZCredit
                            if (window.vm && window.vm.UpdateIsWhileSubmit) {
                              window.vm.UpdateIsWhileSubmit(false);
                            }
                            true;
                          `;
                                webViewRef.current.injectJavaScript(cancelScript);
                              }
                            }}
                        >
                          <Icon
                              icon="close"
                              size={24}
                              color="#333"
                          />
                        </TouchableOpacity>
                      </View>

                      {/* WebView in Modal */}
                      <View style={{
                        height: 500,
                        width: '100%',
                        backgroundColor: 'white'
                      }}>
                        {/* Debug info at top */}
                        <View style={{
                          backgroundColor: '#f0f0f0',
                          padding: 5,
                          borderBottomWidth: 1,
                          borderBottomColor: '#ddd'
                        }}>
                          <Text style={{
                            fontSize: 10,
                            color: '#666',
                            textAlign: 'center'
                          }}>
                            Auth URL: {authPopupUrl ? authPopupUrl.substring(0, 60) + '...' : 'Loading...'}
                          </Text>
                        </View>

                        {authPopupUrl ? (
                            <WebView
                                source={{ uri: authPopupUrl }}
                                style={{
                                  width: '100%',
                                  height: 450, // Reduced to account for debug header
                                  backgroundColor: 'white'
                                }}
                                javaScriptEnabled={true}
                                domStorageEnabled={true}
                                onMessage={(event) => {
                                  console.log('Auth WebView message:', event.nativeEvent.data);
                                  // Handle authentication WebView messages
                                  try {
                                    const message = event.nativeEvent.data;
                                    const parsedMessage = typeof message === 'string' ? JSON.parse(message) : message;

                                    // Check for authentication success/completion signals
                                    if (parsedMessage.type === 'AuthenticationSuccess' ||
                                        message.includes('success') ||
                                        message.includes('authorized') ||
                                        message.includes('completed')) {
                                      console.log('✅ Authentication appears successful, closing modal');
                                      setIsWebViewVisibleForAuth(false);
                                      setAuthPopupUrl(null);

                                      // Continue payment process
                                      setTimeout(() => {
                                        if (webViewRef.current) {
                                          console.log('📤 Continuing payment after successful authentication');
                                          const continueScript = `
                                    console.log('🎉 Authentication successful, continuing payment...');
                                    // The authentication should have updated the payment state
                                    // Google Pay should now be able to proceed without popup
                                    true;
                                  `;
                                          webViewRef.current.injectJavaScript(continueScript);
                                        }
                                      }, 1000);
                                    }
                                  } catch (error) {
                                    console.log('Error parsing auth WebView message:', error);
                                  }

                                  // Also forward to main message handler
                                  handleZCreditWebViewMessage(event);
                                }}
                                mixedContentMode="compatibility"
                                allowsInlineMediaPlayback={true}
                                allowFileAccess={false}
                                allowUniversalAccessFromFileURLs={false}
                                allowFileAccessFromFileURLs={false}
                                setSupportMultipleWindows={false}
                                scalesPageToFit={true}
                                onShouldStartLoadWithRequest={(request) => {
                                  console.log('🔗 Auth WebView navigation to:', request.url);

                                  // Check for error URLs and handle them
                                  if (request.url.includes('error') || request.url.includes('failure')) {
                                    console.log('❌ Auth WebView: Error URL detected:', request.url);
                                    // Close modal and reset payment state
                                    setTimeout(() => {
                                      setIsWebViewVisibleForAuth(false);
                                      setAuthPopupUrl(null);
                                      setIsProcessingPayment(false);
                                    }, 2000);
                                    return true; // Allow loading to show the error
                                  }

                                  // Allow Google Pay related URLs and HTTPS
                                  if (request.url.includes('pay.google.com') ||
                                      request.url.includes('accounts.google.com') ||
                                      request.url.includes('google.com') ||
                                      request.url.includes('gstatic.com') ||
                                      request.url.startsWith('https://')) {
                                    console.log('✅ Auth WebView: Allowing navigation to', request.url);
                                    return true;
                                  }

                                  console.log('⚠️ Auth WebView: Blocking navigation to', request.url);
                                  return false;
                                }}
                                onLoadStart={() => {
                                  console.log('🔄 Auth WebView: Starting to load:', authPopupUrl);
                                }}
                                onLoadEnd={() => {
                                  console.log('✅ Auth WebView: Load completed for:', authPopupUrl);

                                  // Inject script to detect error pages
                                  const errorDetectionScript = `
                            (function() {
                              console.log('🔍 Checking for error content in auth page...');
                              
                              // Check for common error indicators
                              var bodyText = document.body ? document.body.innerText : '';
                              var hasError = bodyText.includes('error') || 
                                           bodyText.includes('שגיאה') || 
                                           bodyText.includes('OR_BIBED') ||
                                           bodyText.includes('לא ניתן לטעון') ||
                                           bodyText.includes('failed') ||
                                           bodyText.includes('unavailable');
                              
                              if (hasError) {
                                console.log('❌ Error detected in auth page content');
                                if (window.ReactNativeWebView) {
                                  window.ReactNativeWebView.postMessage(JSON.stringify({
                                    type: 'AuthenticationError',
                                    data: {
                                      message: 'Authentication page loaded with error content',
                                      errorText: bodyText.substring(0, 200)
                                    }
                                  }));
                                }
                              } else {
                                console.log('✅ Auth page loaded successfully');
                              }
                              
                              return true;
                            })();
                          `;

                                  // Delay execution to ensure page is fully loaded
                                  setTimeout(() => {
                                    webViewRef.current?.injectJavaScript && webViewRef.current.injectJavaScript(errorDetectionScript);
                                  }, 1000);
                                }}
                                onError={(syntheticEvent) => {
                                  const { nativeEvent } = syntheticEvent;
                                  console.error('❌ Auth WebView error:', nativeEvent);
                                }}
                                onHttpError={(syntheticEvent) => {
                                  const { nativeEvent } = syntheticEvent;
                                  console.error('🔴 Auth WebView HTTP error:', nativeEvent);
                                }}
                                startInLoadingState={true}
                                renderError={(errorDomain, errorCode, errorDesc) => (
                                    <View style={{
                                      flex: 1,
                                      justifyContent: 'center',
                                      alignItems: 'center',
                                      backgroundColor: 'white',
                                      padding: 20
                                    }}>
                                      <Text style={{ fontSize: 16, color: 'red', textAlign: 'center', marginBottom: 10 }}>
                                        Failed to load authentication page
                                      </Text>
                                      <Text style={{ fontSize: 12, color: '#666', textAlign: 'center' }}>
                                        Error: {errorDesc}
                                      </Text>
                                      <Text style={{ fontSize: 10, color: '#999', textAlign: 'center', marginTop: 10 }}>
                                        URL: {authPopupUrl}
                                      </Text>
                                    </View>
                                )}
                                renderLoading={() => (
                                    <View style={{
                                      position: 'absolute',
                                      top: 0,
                                      left: 0,
                                      right: 0,
                                      bottom: 0,
                                      justifyContent: 'center',
                                      alignItems: 'center',
                                      backgroundColor: 'white'
                                    }}>
                                      <Text style={{ fontSize: 16, color: '#666' }}>
                                        Loading Google Pay...
                                      </Text>
                                      <Text style={{ fontSize: 10, color: '#999', marginTop: 10, textAlign: 'center' }}>
                                        {authPopupUrl}
                                      </Text>
                                    </View>
                                )}
                                userAgent="Mozilla/5.0 (iPhone; CPU iPhone OS 15_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/15.0 Mobile/15E148 Safari/604.1"
                            />
                        ) : (
                            <View style={{
                              flex: 1,
                              justifyContent: 'center',
                              alignItems: 'center',
                              padding: 20,
                              backgroundColor: 'white'
                            }}>
                              <Text style={{ fontSize: 16, color: '#666', textAlign: 'center' }}>
                                Waiting for authentication URL...
                              </Text>
                              <Text style={{ fontSize: 12, color: '#999', marginTop: 10 }}>
                                Current authPopupUrl: {authPopupUrl || 'null'}
                              </Text>
                              <Text style={{ fontSize: 12, color: '#999', marginTop: 5 }}>
                                Fallback paymentPageUrl: {paymentPageUrl || 'null'}
                              </Text>
                            </View>
                        )}

                        {/* Fallback button */}
                        <View style={{
                          backgroundColor: '#f8f9fa',
                          borderTopWidth: 1,
                          borderTopColor: '#e9ecef',
                          paddingHorizontal: 20,
                          paddingVertical: 10,
                        }}>
                          <TouchableOpacity
                              style={{
                                backgroundColor: '#6c757d',
                                paddingHorizontal: 15,
                                paddingVertical: 8,
                                borderRadius: 6,
                                alignSelf: 'center',
                              }}
                              onPress={() => {
                                console.log('🔄 User requested to retry authentication');
                                setIsWebViewVisibleForAuth(false);
                                setAuthPopupUrl(null);
                                setIsProcessingPayment(false);

                                // Show message that they can try again
                                setTimeout(() => {
                                  DeviceEventEmitter.emit(DIALOG_EVENTS.OPEN_ORDER_ERROR_DIALOG, {
                                    title: t("payment-method"),
                                    message: "Authentication cancelled. You can try the payment again."
                                  });
                                }, 500);
                              }}
                          >
                            <Text style={{
                              color: 'white',
                              fontSize: 12,
                              fontWeight: '600',
                              textAlign: 'center'
                            }}>
                              {t("cancel") || "Cancel & Try Again"}
                            </Text>
                          </TouchableOpacity>
                        </View>
                      </View>
                    </View>
                  </Modal>
                </>
            )}

            {/* Custom Button for digital payments when ZCredit is ready */}
            {paymentPageUrl && isDigitalPaymentMethod() && isZCreditReady ? (
                <TouchableOpacity
                    onPress={triggerZCreditPayment}
                    disabled={isLoadingOrderSent || driversLoading || isProcessingPayment}
                    style={[
                      styles.customButton,
                      {
                        backgroundColor: isProcessingPayment ? themeStyle.GRAY_30 : themeStyle.PRIMARY_COLOR,
                        opacity: (isLoadingOrderSent || driversLoading || isProcessingPayment) ? 0.5 : 1,
                      }
                    ]}
                    activeOpacity={0.8}
                >
                  <View style={styles.customButtonRow}>
                    {/* Cart Count */}
                    {cartCount && (
                        <View style={styles.customButtonCountContainer}>
                          <Text style={[
                            styles.customButtonCountText,
                            { color: themeStyle.PRIMARY_COLOR }
                          ]}>
                            {cartCount}
                          </Text>
                        </View>
                    )}

                    {/* Center Content - Icon and Text */}
                    <View style={styles.customButtonCenterContent}>
                      {/* Payment Method Icon */}
                      {(() => {
                        const paymentConfig = getDigitalPaymentMethodConfig();
                        if (paymentConfig?.iconSource) {
                          return (
                              <Image
                                  source={paymentConfig.iconSource}
                                  style={styles.customButtonIcon}
                              />
                          );
                        } else {
                          return (
                              <Icon
                                  icon={getDigitalPaymentIcon()}
                                  size={themeStyle.FONT_SIZE_LG}
                                  style={{ color: themeStyle.SECONDARY_COLOR, marginRight: 8 }}
                              />
                          );
                        }
                      })()}

                      {/* Button Text */}
                      <Text style={[
                        styles.customButtonText,
                        {
                          color: themeStyle.SECONDARY_COLOR,
                          fontSize: themeStyle.FONT_SIZE_LG,
                          fontFamily: `${getCurrentLang()}-Bold`,
                        }
                      ]}>
                        {isProcessingPayment ? t("processing") : t("pay")}
                      </Text>
                    </View>

                    {/* Price */}
                    <View style={styles.customButtonPriceContainer}>
                      <Text style={[
                        styles.customButtonPriceText,
                        {
                          color: themeStyle.SECONDARY_COLOR,
                          fontSize: themeStyle.FONT_SIZE_MD,
                          fontFamily: `${getCurrentLang()}-Bold`,
                        }
                      ]}>
                        ₪{totalPrice}
                      </Text>
                    </View>
                  </View>
                </TouchableOpacity>
            ) : paymentPageUrl && isDigitalPaymentMethod() && !isZCreditReady ? (
                // Loading state for digital payments
                <Button
                    onClickFn={() => {}}
                    disabled={true}
                    text={t("loading")}
                    isLoading={true}
                    icon="kupa"
                    iconSize={themeStyle.FONT_SIZE_LG}
                    fontSize={themeStyle.FONT_SIZE_LG}
                    iconColor={themeStyle.SECONDARY_COLOR}
                    fontFamily={`${getCurrentLang()}-Bold`}
                    bgColor={themeStyle.GRAY_30}
                    textColor={themeStyle.SECONDARY_COLOR}
                    borderRadious={100}
                    extraText={`₪${totalPrice}`}
                    countText={`${cartCount}`}
                    countTextColor={themeStyle.PRIMARY_COLOR}
                />
            ) : (
                // Regular checkout button for non-digital payments
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
  // Custom Button Styles
  customButton: {
    width: "100%",
    borderRadius: 999,
    borderWidth: 0,
    justifyContent: "center",
    alignItems: "center",
    padding: 15,
  },
  customButtonRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    width: "100%",
  },
  customButtonCountContainer: {
    backgroundColor: "#4E2E53",
    borderRadius: 50,
    alignSelf: "center",
    width: 30,
    height: 30,
    justifyContent: "center",
    alignItems: "center",
  },
  customButtonCountText: {
    fontWeight: "bold",
    fontSize: themeStyle.FONT_SIZE_MD,
  },
  customButtonCenterContent: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    flex: 1,
  },
  customButtonIcon: {
    width: 32,
    height: 32,
    marginRight: 8,
    resizeMode: "contain",
  },
  customButtonText: {
    fontWeight: "bold",
    textAlign: "center",
  },
  customButtonPriceContainer: {
    justifyContent: "center",
    alignItems: "center",
    right: 5,
  },
  customButtonPriceText: {
    fontWeight: "bold",
  },
});
