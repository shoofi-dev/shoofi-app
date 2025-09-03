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
import { createZCreditSessionBody } from "../../data/zcredit-config";

import {
  PaymentRequest,
  GooglePayButton,
  GooglePayButtonConstants,
} from '@google/react-native-make-payment';

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
  const [zcreditSessionId, setZcreditSessionId] = useState(null);
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
    console.log("Checkout: Payment method changed to:", data);
    console.log("Checkout: Previous payment method was:", paymentMthod);
    console.log("Checkout: PAYMENT_METHODS.cash =", PAYMENT_METHODS.cash);
    console.log("Checkout: PAYMENT_METHODS.creditCard =", PAYMENT_METHODS.creditCard);
    
    setPaymentMthod(data);

    // Always clear payment URL and processing state when payment method changes
    setPaymentPageUrl(null);
    setIsProcessingPayment(false);

    // Create new ZCredit session for digital payment methods (only if data is not null)
    if (data && (data === PAYMENT_METHODS.applePay || data === PAYMENT_METHODS.googlePay)) {
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
      }

      // Prepare cart items
      const cartItems = cartStore.cartItems.map(item => ({
        Amount: (totalPrice).toString(),
        Currency: "ILS",
        Name: item.data.name,
        Description: item.data.description,
        Quantity: 1,
        Image: "",
        IsTaxFree: "false",
        AdjustAmount: "false"
      }));

      // Get API key from payment credentials
      const apiKey = shoofiAdminStore.paymentCredentials?.zcredit_api_key;
      // Use the createZCreditSessionBody function from config
      const requestBody = createZCreditSessionBody({
        customerName,
        customerPhone,
        cartItems,
        paymentMethod: newPaymentMethod,
        focusType,
        apiKey
      });

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
        console.log('ZCredit SessionId:', responseData.Data.SessionId);
        // Store the session ID for Google Pay configuration
        if (responseData.Data.SessionId) {
          setZcreditSessionId(responseData.Data.SessionId);
        }
        
        setPaymentPageUrl(responseData.Data.SessionUrl);
        setIsZCreditReady(false); // Reset ready state for new session

        // Add a shorter fallback timeout to avoid long loading
        if (zcreditLoadingTimeout) {
          clearTimeout(zcreditLoadingTimeout);
        }
        const timeout = setTimeout(() => {
          setIsZCreditReady(true);
        }, 3000); // 3 seconds timeout - much faster
        setZcreditLoadingTimeout(timeout);
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
      handleCheckout({
        paymentMethod: paymentMthod,
        failed: false,
        sessionId: data.sessionId,
      });
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

      // Call handleCheckout with failed status to create order record
      handleCheckout({
        paymentMethod: paymentMthod,
        failed: true,
        errorData: data,
        method: paymentMthod === PAYMENT_METHODS.applePay ? 'apple_pay' : 
                paymentMthod === PAYMENT_METHODS.googlePay ? 'google_pay' : 'unknown'
      });

      // Use the exact same error dialog as credit card payments
      const errorMessage = t("payment-error-modal-message");
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
        return;
      }

      if (parsedMessage.type === 'ZCreditReady') {
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



      // Handle reset payment state message from WebView
      if (parsedMessage.type === 'ResetPaymentState') {
        setIsProcessingPayment(false);
        setIsWebViewVisibleForAuth(false);
        setAuthPopupUrl(null);
        return;
      }

      if (parsedMessage.type === 'DebugMessage') {

        // Process the original message if it's from ZCredit
        const originalMsg = parsedMessage.originalMessage;
        if (originalMsg && originalMsg.Reason && originalMsg.SessionID) {

          // Map ZCredit messages to our handler format
          if (originalMsg.Reason === 'IsWhileSubmit' && originalMsg.State === true) {
            zcreditMessageHandlers.onSubmit?.({
              sessionId: originalMsg.SessionID,
              reason: originalMsg.Reason,
              state: originalMsg.State
            });
          } else if (originalMsg.Code && originalMsg.Code !== 0) {
            zcreditMessageHandlers.onFailure?.({
              sessionId: originalMsg.SessionID,
              errorCode: originalMsg.Code,
              errorMessage: originalMsg.Reason
            });
          } else if (originalMsg.Reason === 'Success' || originalMsg.Reason === 'Completed') {
            zcreditMessageHandlers.onSuccess?.({
              sessionId: originalMsg.SessionID,
              reason: originalMsg.Reason
            });
          }
        }

        return; // Don't process debug messages further
      }

      // Handle Apple Pay specific messages
      if (parsedMessage.PaymentMethod === 'ApplePay') {
        console.log('🍎 Apple Pay message received in React Native:', parsedMessage);
        
        if (parsedMessage.Reason === 'Success') {
          console.log('🍎 Apple Pay successful:', parsedMessage);
          setIsWebViewVisibleForAuth(false);
          setAuthPopupUrl(null);
          // Complete the checkout process with successful Apple Pay
          handleCheckout({
            paymentMethod: PAYMENT_METHODS.applePay,
            sessionId: parsedMessage.SessionID,
            transactionData: parsedMessage.TransactionData,
            method: 'apple_pay'
          });
        } else if (parsedMessage.Reason.includes('Failure') || parsedMessage.Reason.includes('Error')) {
          console.log('🍎 Apple Pay failed:', parsedMessage);
          // Reset states to allow user to try again
          setIsProcessingPayment(false);
          setIsZCreditReady(true);
          setIsWebViewVisibleForAuth(false);
          setAuthPopupUrl(null);

          // Call handleCheckout with failed status to create order record
          handleCheckout({
            paymentMethod: PAYMENT_METHODS.applePay,
            failed: true,
            errorData: parsedMessage,
            method: 'apple_pay'
          });

          // Show error dialog
          const errorMessage = parsedMessage.ErrorDetails?.MessageEn || parsedMessage.ErrorDetails?.message || t("payment-error-modal-message");
          setTimeout(() => {
            DeviceEventEmitter.emit(DIALOG_EVENTS.OPEN_ORDER_ERROR_DIALOG, {
              title: t("order-error-modal-title"),
              message: errorMessage
            });
          }, 500);
        }
        return; // Don't process Apple Pay messages further
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

  const handleCheckout = async (data?: any) => {
    // Prevent multiple clicks using ref for immediate check
    if (isCheckoutInProgress.current) {
      return;
    }



    isCheckoutInProgress.current = true;
    setIsLoadingOrderSent(true);

    try {
      // For digital payments, skip validation since payment is already processed
      if (!data) {
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
      }

      // Only show processing modal if this is not a failed payment
      if (!data || !data.failed) {
        setIsProcessingModalOpen(true); // Show processing modal
      }

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
        // Continue with checkout even if coupon redemption fails
        console.log('Coupon redemption error (continuing):', error);
      }

      // Determine payment method and provider for order submission
      let orderPaymentMethod = paymentMthod;
      let paymentProvider = paymentMthod;
      let orderStatus = "0"; // Default to failed
      let sessionId = "";
      let errorMessage = "";

      if (data) {
        // Digital payment - use CREDITCARD as payment method
        orderPaymentMethod = PAYMENT_METHODS.creditCard;
        
        // Check if this is a failed payment
        if (data.failed) {
          orderStatus = "0"; // Failed status
          errorMessage = data.errorData.errorMessage;
        } else {
          sessionId = data.sessionId;
          orderStatus = "6"; // Success for digital payments
        }
      }

      const checkoutSubmitOrderRes = await checkoutSubmitOrder({
        paymentMthod: orderPaymentMethod,
        shippingMethod,
        totalPrice,
        itemsPrice,
        orderDate: selectedDate,
        editOrderData: ordersStore.editOrderData,
        address: addressLocation,
        locationText: addressLocationText,
        paymentData: data || (paymentMthod === PAYMENT_METHODS.creditCard ? paymentData : undefined),
        shippingPrice: shippingMethod === SHIPPING_METHODS.shipping ? availableDrivers?.area?.price || 0 : 0,
        storeData: storeDataStore.storeData,
        paymentProvider: paymentProvider,
        status: orderStatus,
        sessionId: sessionId,
        errorMessage
      });
      
      // For failed payments, stop here after recording the failure
      if (data && data.failed) {
        console.log('Payment failed, order recorded with status 0, stopping flow');
        onLoadingOrderSent(false);
        isCheckoutInProgress.current = false;
        setIsProcessingModalOpen(false); // Hide processing modal if it was shown
        return;
      }
      
      // For successful payments and regular checkouts, continue with normal flow
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
        paymentMthod === PAYMENT_METHODS.googlePay
  };

  // JavaScript code to inject CSS, fonts, and postMessage listener into the WebView
  const injectedJavaScript = `
 (function() {

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

	// Override only the Apple Pay response handling section
	function overrideApplePayResponseSection() {
		console.log('🍎 Setting up Apple Pay response section override...');
		
		// Wait for the ZCredit controller to be available
		var checkController = setInterval(function() {
			if (window.vm && window.vm.PayWithApplePay_Clicked) {
				clearInterval(checkController);
				console.log('🍎 PayWithApplePay_Clicked found, setting up response section override...');
				
				// Store the original function
				var originalPayWithApplePayClicked = window.vm.PayWithApplePay_Clicked;
				
				// Override the function
				window.vm.PayWithApplePay_Clicked = function(form) {
					console.log('🍎 PayWithApplePay_Clicked intercepted, calling original...');
					
					// Call the original function
					var result = originalPayWithApplePayClicked.call(this, form);
					
					// Override the AppleShowResponse section specifically
					overrideAppleShowResponse();
					
					return result;
				};
				
				console.log('🍎 PayWithApplePay_Clicked override successful');
			} else {
				console.log('🍎 PayWithApplePay_Clicked not found yet, retrying...');
			}
		}, 100);
	}
	
	// Function to override only the AppleShowResponse section
	function overrideAppleShowResponse() {
		console.log('🍎 Setting up AppleShowResponse override...');
		
		// Since ApplePayRrequest is a local variable, we need to override the PaymentRequest constructor
		// to intercept when it's created and add our postMessage handling
		if (window.PaymentRequest) {
			var originalPaymentRequest = window.PaymentRequest;
			window.PaymentRequest = function(paymentMethods, paymentDetails, options) {
				console.log('🍎 PaymentRequest constructor intercepted');
				
				// Create the original PaymentRequest
				var paymentRequest = new originalPaymentRequest(paymentMethods, paymentDetails, options);
				
				// Check if this is an Apple Pay request by looking at the payment method
				var isApplePay = false;
				if (paymentMethods && paymentMethods.length > 0) {
					for (var i = 0; i < paymentMethods.length; i++) {
						if (paymentMethods[i].supportedMethods === "https://apple.com/apple-pay") {
							isApplePay = true;
							break;
						}
					}
				}
				
				if (isApplePay) {
					console.log('🍎 Apple Pay PaymentRequest detected, setting up show() override');
					
					// Store the original show method
					var originalShow = paymentRequest.show;
					
					// Override the show method
					paymentRequest.show = function() {
						console.log('🍎 Apple Pay show() method intercepted');
						
						// Call the original show method
						var promise = originalShow.call(this);
						
						// Check if it returned a promise
						if (promise && typeof promise.then === 'function') {
							console.log('🍎 Apple Pay show() returned promise, adding postMessage handlers');
							
							// Create a new promise that wraps the original
							var newPromise = promise.then(function(CurrentPaymentResponse) {
								console.log('🍎 Apple Pay show() resolved, setting up DoApplePaySubmit override');
								
								// Override DoApplePaySubmit to add postMessage handling
								if (window.vm && window.vm.DoApplePaySubmit) {
									var originalDoApplePaySubmit = window.vm.DoApplePaySubmit;
									
									window.vm.DoApplePaySubmit = function(form, AppleToken) {
										console.log('🍎 DoApplePaySubmit intercepted in Apple Pay flow');
										
										// Call the original function
										var result = originalDoApplePaySubmit.call(this, form, AppleToken);
										
										// Check if result is a promise
										if (result && typeof result.then === 'function') {
											console.log('🍎 DoApplePaySubmit returned promise, adding postMessage handlers');
											
											result.then(function(results) {
												console.log('🍎 DoApplePaySubmit promise resolved:', results);
												
												if (results.HasError) {
													console.log('🍎 Apple Pay transaction failed, sending failure postMessage');
													
													// Send failure postMessage
													var failureMessage = {
														Reason: 'ApplePayFailure',
														Code: results.Errors ? results.Errors[0].Code : -1,
														SessionID: window.vm.SessionKey,
														PaymentMethod: 'ApplePay',
														ErrorDetails: results.Errors ? results.Errors[0] : results
													};
													
													if (window.ReactNativeWebView) {
														window.ReactNativeWebView.postMessage(JSON.stringify(failureMessage));
													}
													
													// Call original failure handling
													window.vm.UpdateIsWhileSubmit(false);
													const FailurStatus = "fail";
													CurrentPaymentResponse.complete(FailurStatus);
												} else {
													console.log('🍎 Apple Pay transaction successful, sending success postMessage');
													
													// Send success postMessage
													var successMessage = {
														Reason: 'Success',
														Code: 0,
														SessionID: window.vm.SessionKey,
														PaymentMethod: 'ApplePay',
														TransactionData: results.Data || results,
														Success: true
													};
													
													if (window.ReactNativeWebView) {
														window.ReactNativeWebView.postMessage(JSON.stringify(successMessage));
													}
													
													// Call original success handling
													const SuccessStatus = "success";
													CurrentPaymentResponse.complete(SuccessStatus);
													window.vm.IsTransactionSuccess = true;
													
													if (window.vm.DoRedirect) {
														setTimeout(function () {
															if (window.vm.CreateSessionRequest.PostMessageOnSuccess) {
																window.vm.DoPostMessage("Success", 0);
															}
															window.location = window.vm.CreateSessionRequest.SuccessURL;
														}, 1500);
													} else {
														alert("Success skip redirect to success. 3");
													}
												}
											}).catch(function(error) {
												console.log('🍎 DoApplePaySubmit promise rejected:', error);
												
												// Send error postMessage
												var errorMessage = {
													Reason: 'ApplePayError',
													Code: -1,
													SessionID: window.vm.SessionKey,
													PaymentMethod: 'ApplePay',
													ErrorDetails: {
														message: 'Apple Pay transaction failed',
														error: error
													}
												};
												
												if (window.ReactNativeWebView) {
													window.ReactNativeWebView.postMessage(JSON.stringify(errorMessage));
												}
												
												// Call original error handling
												window.vm.UpdateIsWhileSubmit(false);
												window.vm.IsGetSessionFinish = true;
												window.vm.Message = "Error on http post";
												window.vm.IsFinish = true;
												if (window.$loading && window.$loading.finish) {
													window.$loading.finish("MainLoading");
												}
												const status = "fail";
												CurrentPaymentResponse.complete(status);
											});
										} else {
											console.log('🍎 DoApplePaySubmit returned non-promise result:', result);
											
											// Handle non-promise result
											if (result && !result.HasError) {
												// Success case
												var successMessage = {
													Reason: 'Success',
													Code: 0,
													SessionID: window.vm.SessionKey,
														PaymentMethod: 'ApplePay',
													TransactionData: result.Data || result,
													Success: true
												};
												
												if (window.ReactNativeWebView) {
													window.ReactNativeWebView.postMessage(JSON.stringify(successMessage));
												}
												
												// Call original success handling
												const SuccessStatus = "success";
												CurrentPaymentResponse.complete(SuccessStatus);
												window.vm.IsTransactionSuccess = true;
												
												if (window.vm.DoRedirect) {
													setTimeout(function () {
														if (window.vm.CreateSessionRequest.PostMessageOnSuccess) {
															window.vm.DoPostMessage("Success", 0);
														}
														window.location = window.vm.CreateSessionRequest.SuccessURL;
													}, 1500);
												} else {
													alert("Success skip redirect to success. 3");
												}
											} else if (result && result.HasError) {
												// Failure case
												var failureMessage = {
													Reason: 'ApplePayFailure',
													Code: result.Errors ? result.Errors[0].Code : -1,
													SessionID: window.vm.SessionKey,
													PaymentMethod: 'ApplePay',
													ErrorDetails: result.Errors ? result.Errors[0] : result
												};
												
												if (window.ReactNativeWebView) {
													window.ReactNativeWebView.postMessage(JSON.stringify(failureMessage));
												}
												
												// Call original failure handling
												window.vm.UpdateIsWhileSubmit(false);
												const FailurStatus = "fail";
												CurrentPaymentResponse.complete(FailurStatus);
											}
										}
										
										return result;
									};
									
									console.log('🍎 DoApplePaySubmit override in Apple Pay flow successful');
								}
								
								return CurrentPaymentResponse;
							}).catch(function(error) {
								console.log('🍎 Apple Pay show() rejected:', error);
								
								// Send error postMessage for show() failure
								var errorMessage = {
									Reason: 'ApplePayError',
									Code: -1,
									SessionID: window.vm.SessionKey || 'unknown',
									PaymentMethod: 'ApplePay',
									ErrorDetails: {
										message: 'Apple Pay show() failed',
										error: error
									}
								};
								
								if (window.ReactNativeWebView) {
									window.ReactNativeWebView.postMessage(JSON.stringify(errorMessage));
								}
								
								throw error; // Re-throw to maintain original behavior
							});
							
							return newPromise;
						}
						
						return promise;
					};
					
					console.log('🍎 Apple Pay show() override successful');
				}
				
				return paymentRequest;
			};
			
			console.log('🍎 PaymentRequest constructor override successful');
		}
	}
	
	// Start the override process
	overrideApplePayResponseSection();

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



  const paymentDetails = {
    total: {
      amount: {
        currency: 'ILS',
        value: totalPrice.toString(),
      },
    },
  };

  // Dynamic Google Pay request configuration
  const getGooglePayRequest = (sessionId = '', tPrice = totalPrice) => ({
    apiVersion: 2,
    apiVersionMinor: 0,
    allowedPaymentMethods: [
      {
        type: 'CARD',
        parameters: {
          allowedAuthMethods: ['PAN_ONLY', 'CRYPTOGRAM_3DS'],
          allowedCardNetworks: ['AMEX', 'DISCOVER', 'MASTERCARD', 'VISA'],
        },
        tokenizationSpecification: {
          type: 'PAYMENT_GATEWAY',
          parameters: {
            gateway: 'zcredit',
            gatewayMerchantId: sessionId,
          },
        },
      },
    ],
    merchantInfo: {
      merchantId: 'BCR2DN6TQ6QYPSBE',
      merchantName: 'Z-Credit',
    },
    transactionInfo: {
      totalPriceStatus: 'FINAL',
      totalPriceLabel: 'Total',
      totalPrice: tPrice.toString(),
      currencyCode: 'ILS',
      countryCode: 'IL',
    },
  });

  // Default Google Pay request (will be updated dynamically)
  const googlePayRequest = getGooglePayRequest();

  // Dynamic payment methods with updated Google Pay request
  const getPaymentMethods = () => [
    {
      supportedMethods: 'google_pay',
      data: getGooglePayRequest(zcreditSessionId, totalPrice),
    },
  ];

  const paymentRequest = new PaymentRequest(getPaymentMethods(), paymentDetails);

  const checkCanMakePayment = async () => {
    try {
      // Set processing state for validation
      setIsProcessingPayment(true);

      // Validate checkout first (same as Apple Pay)
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
        console.log('Google Pay validation failed');
        setIsProcessingPayment(false);
        return;
      }

      console.log('Google Pay validation passed, proceeding with payment');

      // Add fallback timeout to reset processing state if no response
      setTimeout(() => {
        if (isProcessingPayment) {
          console.log('Google Pay timeout - resetting processing state');
          setIsProcessingPayment(false);
        }
      }, 30000); // 30 second timeout

      // Now check if Google Pay is available
      paymentRequest
          .canMakePayment()
          .then((canMakePayment) => {
            if (canMakePayment) {
              showPaymentForm();
            } else {
              console.log('Google Pay unavailable');
              setIsProcessingPayment(false);
            }
          })
          .catch((error) => {
            console.error('Google Pay canMakePayment error:', error);
            setIsProcessingPayment(false);
          });
    } catch (error) {
      console.error('Error during Google Pay validation:', error);
      setIsProcessingPayment(false);
    }
  }

  const showPaymentForm = () => {
    paymentRequest
        .show()
        .then((response) => {
          if (response === null) {
            console.log('Google Pay payment cancelled by user');
            setIsProcessingPayment(false); // Reset processing state on cancellation
          } else {
            console.log('Google Pay payment successful:', response);
            // alert(JSON.stringify(response));
            // Handle successful Google Pay payment like credit card
            handleCheckout({
              paymentMethod: PAYMENT_METHODS.googlePay,
              token: response.details?.paymentToken || response.details?.token,
              paymentData: response,
              method: 'google_pay'
            });
          }
        })
        .catch((error) => {
          console.error('Google Pay payment error:', error);
          setIsProcessingPayment(false); // Reset processing state on error
          
          // Call handleCheckout with failed status to create order record
          handleCheckout({
            paymentMethod: PAYMENT_METHODS.googlePay,
            failed: true,
            errorData: error,
            method: 'google_pay'
          });
        });
  }


  // Handle payment button click (only for non-digital payment methods)
  const handlePaymentButtonClick = () => {
    handleCheckout();
  };

  // Trigger ZCredit payment from custom button
  const triggerZCreditPayment = async () => {
    if (paymentPageUrl && isDigitalPaymentMethod() && webViewRef.current) {
      const resetScript = `
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
  // GooglePayButton ref for programmatic triggering
  const googlePayButtonRef = useRef(null);

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
                          // Set ready state faster when WebView loads
                          setTimeout(() => {
                            if (!isZCreditReady) {
                              console.log('WebView loaded, setting ready state');
                              setIsZCreditReady(true);
                              if (zcreditLoadingTimeout) {
                                clearTimeout(zcreditLoadingTimeout);
                                setZcreditLoadingTimeout(null);
                              }
                            }
                          }, 1000); // Wait 1 second after load to ensure injection is complete
                        }}
                        onError={(syntheticEvent) => {
                          const { nativeEvent } = syntheticEvent;
                          console.error('WebView error:', nativeEvent);
                        }}
                    />
                  </View>
                </>
            )}

            {/* Custom Button for digital payments when ZCredit is ready */}
            {paymentPageUrl && isDigitalPaymentMethod() && isZCreditReady ? (
                <>
                    {/* Hidden GooglePayButton for programmatic triggering */}
                    {paymentMthod === PAYMENT_METHODS.googlePay && (
                        <GooglePayButton
                            ref={googlePayButtonRef}
                            style={[styles.googlepaybutton, { opacity: 0, position: 'absolute', left: -10000 }]}
                            onPress={checkCanMakePayment}
                            allowedPaymentMethods={getGooglePayRequest(zcreditSessionId, totalPrice).allowedPaymentMethods}
                            theme={GooglePayButtonConstants.Themes.Dark}
                            type={GooglePayButtonConstants.Types.Buy}
                            radius={4}
                        />
                    )}
                    
                    <Button
                        onClickFn={async () => {
                            if (paymentMthod === PAYMENT_METHODS.applePay) {
                                await triggerZCreditPayment();
                            } else if (paymentMthod === PAYMENT_METHODS.googlePay) {
                                // Trigger Google Pay - this will call the same function as the GooglePayButton
                                checkCanMakePayment();
                            }
                        }}
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
                </>
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
  googlepaybutton: {
    width: 0,
    height: 0,
    opacity: 0,
    position: 'absolute',
    left: -10000,
  },
});
