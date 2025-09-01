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
    if (data === PAYMENT_METHODS.applePay || data === PAYMENT_METHODS.googlePay) {
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
        BitButtonEnabled: "false",
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
          setIsZCreditReady(true);
        }, 10000); // 10 seconds timeout
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
                  </View>
                </>
            )}

            {/* Custom Button for digital payments when ZCredit is ready */}
            {paymentPageUrl && isDigitalPaymentMethod() && isZCreditReady ? (
                <Button
                    onClickFn={() => triggerZCreditPayment()}
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
