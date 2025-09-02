import { View, StyleSheet, DeviceEventEmitter, ActivityIndicator, Platform } from "react-native";
import { useTranslation } from "react-i18next";
import { PAYMENT_METHODS, PLACE, SHIPPING_METHODS } from "../../consts/shared";
import { useContext, useEffect, useState } from "react";
import isStoreSupportAction from "../../helpers/is-store-support-action";
import theme from "../../styles/theme.style";
import { PaymentMethodPickSquare } from "./payment-method-pick/payment-method-square";
import { DIALOG_EVENTS } from "../../consts/events";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { TCCDetails } from "../credit-card/api/validate-card";
import { CCDataCMP } from "./cc-data";
import { StoreContext } from "../../stores";
import { useNavigation } from "@react-navigation/native";
import { creditCardsStore } from "../../stores/creditCards";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import Modal from "react-native-modal";
import CreditCardModal from "../CreditCardModal";

// Navigation type definition
type RootStackParamList = {
  "credit-cards": undefined;
  "add-credit-card": undefined;
};

// Interface for credit card data used in payment method
interface PaymentCreditCardData {
  ccToken: string;
  last4Digits: string;
  ccType: string;
  holderName: string;
  id: string;
  cvv: string;
}

export type TProps = {
  onChange: any;
  onPaymentDataChange?: any;
  editOrderData?: any;
  defaultValue?: any;
  shippingMethod: any;
};
export const PaymentMethodCMP = ({ onChange, onPaymentDataChange, editOrderData, defaultValue, shippingMethod }: TProps) => {
  const { t } = useTranslation();
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const { userDetailsStore } = useContext(StoreContext);
  const [paymentMethod, setPaymentMethod] = useState(null);
  const [ccData, setCCData] = useState<PaymentCreditCardData | undefined>();
  const [isLoadingCreditCards, setIsLoadingCreditCards] = useState(false);
  const [isCreditCardModalOpen, setIsCreditCardModalOpen] = useState(false);

  const getCCData = async () => {
    setIsLoadingCreditCards(true);
    try {
      // Fetch credit cards from database
      const creditCardsResponse = await creditCardsStore.fetchCreditCards();
      console.log("creditCardsResponse", creditCardsResponse)
      const defaultCard = creditCardsResponse.find(card => card.isDefault) || null;
      console.log("defaultCard", defaultCard)
      
      if(creditCardsResponse.length === 0){
        console.log("No credit cards found")
        setCCData(null);
        // Don't automatically change to cash - let the dialog handle it
        return;
      }
      
      if (defaultCard) {
        setCCData({
          ccToken: defaultCard.ccToken,
          last4Digits: defaultCard.last4Digits,
          ccType: defaultCard.ccType,
          holderName: defaultCard.holderName || '',
          id: defaultCard.id,
          cvv: defaultCard.cvv,
        });
        // Pass payment data to parent component
        if (onPaymentDataChange) {
          onPaymentDataChange({
            ccToken: defaultCard.ccToken,
            last4Digits: defaultCard.last4Digits,
            ccType: defaultCard.ccType,
            holderName: defaultCard.holderName || '',
            cvv: defaultCard.cvv,
            id: defaultCard.id,
          });   
        }
        onChange(PAYMENT_METHODS.creditCard);

      } else {
        setCCData(null);
        if (onPaymentDataChange) {
          onPaymentDataChange(null);
        }
      }
    } catch (error) {
      console.error('Failed to load credit cards:', error);
      setCCData(null);
    } finally {
      setIsLoadingCreditCards(false);
    }
  };

  useEffect(()=>{
    setPaymentMethod(defaultValue);
  },[defaultValue])

  const resetCreditCardAdmin = async () => {
    await AsyncStorage.removeItem("@storage_CCData");
  };
  useEffect(() => {
    return () => {
      if (userDetailsStore.isAdmin()) {
        resetCreditCardAdmin();
      }
    };
  }, []);

  const openNewCreditCardDialog = () => {
    console.log("Opening new credit card dialog");
    // Add iOS-specific delay to ensure proper modal handling
    const delay = Platform.OS === 'ios' ? 200 : 100;
    
    setTimeout(() => {
      console.log("Emitting OPEN_NEW_CREDIT_CARD_BASED_EVENT_DIALOG event");
      DeviceEventEmitter.emit(
        DIALOG_EVENTS.OPEN_NEW_CREDIT_CARD_BASED_EVENT_DIALOG
      );
      
      // iOS fallback: if event doesn't work, try direct modal opening
      if (Platform.OS === 'ios') {
        setTimeout(() => {
          console.log("iOS fallback: checking if dialog opened");
          // You could add additional fallback logic here if needed
        }, 500);
      }
    }, delay);
  };

  const onPaymentMethodChange = async (paymentMethodValue: string) => {
    console.log("Payment method changed to:", paymentMethodValue);
    console.log("Previous payment method was:", paymentMethod);

    setPaymentMethod(paymentMethodValue);
    onChange(paymentMethodValue);
    
    // Only fetch credit cards when selecting credit card payment
    if (paymentMethodValue === PAYMENT_METHODS.creditCard) {
      console.log("Credit card selected, checking for existing cards");

      if (!ccData && !editOrderData) {
        // If no credit card data exists, fetch from database
        await getCCData();
        
        // Check if we still have no credit cards after fetching
        if (!ccData && creditCardsStore.creditCards.length === 0) {
          console.log("No credit cards available, opening dialog");
          // Add a small delay to ensure state is updated before opening dialog
          setTimeout(() => {
            openNewCreditCardDialog();
          }, 100);
        }
      }
    }
  };

  useEffect(() => {
    const subscription = DeviceEventEmitter.addListener(
      `${DIALOG_EVENTS.OPEN_NEW_CREDIT_CARD_BASED_EVENT_DIALOG}_HIDE`,
      handleNewPMAnswer
    );
    return () => {
      subscription.remove();
    };
  }, []);

  const handleNewPMAnswer = async (data: any) => {
    console.log("Credit card dialog closed with data:", data);
    
    // Check if credit card was added successfully
    if (data.value === "success") {
      console.log("Credit card added successfully, refreshing data");
      // If credit card was added successfully, refresh the credit cards list
      setTimeout(async () => {
        await getCCData();
      }, 400);
    } else {
      // User closed modal without adding credit card
      console.log("Credit card modal closed without adding card, resetting to default state");
      console.log("Previous payment method:", paymentMethod);
      console.log("Resetting to: null (default state)");
      
      // Reset payment method to null (default state) since no credit card was added
      setPaymentMethod(null);
      console.log("Payment method state updated, calling onChange with null");
      onChange(null);
      
      // Clear any credit card data
      setCCData(undefined);
      if (onPaymentDataChange) {
        onPaymentDataChange(null);
      }
      
      // Reset credit cards store state
      creditCardsStore.reset();
      console.log("Credit card reset completed");
      
      // Force a small delay to ensure state updates are processed
      setTimeout(() => {
        console.log("Credit card reset delay completed, current payment method:", paymentMethod);
      }, 100);
    }
  };

  const onReplaceCreditCard = () => {
    // Open credit cards modal
    setIsCreditCardModalOpen(true);
  };

  const handleCloseCreditCardModal = () => {
    setIsCreditCardModalOpen(false);
    // Refresh credit card data when modal is closed
    setTimeout(async () => {  
      await getCCData();
    }, 400);
  };

  return (
    <View style={{}}>
      <PaymentMethodPickSquare
        onChange={onPaymentMethodChange}
        paymentMethodValue={paymentMethod}
        isLoadingCreditCards={isLoadingCreditCards}
      />
      {paymentMethod === PAYMENT_METHODS.creditCard && ccData && (
        <View style={{ marginTop: 10 }}>
          <CCDataCMP
            onReplaceCreditCard={onReplaceCreditCard}
            ccData={ccData}
            shippingMethod={shippingMethod}
          />
        </View>
      )}
      
      <Modal
        isVisible={isCreditCardModalOpen}
        onBackdropPress={() => setIsCreditCardModalOpen(false)}
        style={{ margin: 0, justifyContent: "flex-end" }}
        animationIn="slideInUp"
        animationOut="slideOutDown"
        backdropOpacity={0.5}
      >
        <CreditCardModal onClose={handleCloseCreditCardModal} />
      </Modal>
    </View>
  );
};
const styles = StyleSheet.create({
  container: {
    height: "100%",
  },
  backContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  togglleContainer: {
    borderRadius: 50,
    marginTop: 30,
    borderWidth: 1,
    overflow: "hidden",
    borderColor: theme.PRIMARY_COLOR,
    flexDirection: "row",
    width: "100%",
    shadowColor: "#C19A6B",
    shadowOffset: {
      width: 2,
      height: 2,
    },
    shadowOpacity: 1,
    shadowRadius: 20,
  },
  togglleCItem: {
    borderWidth: 0,

    borderRadius: 50,
    flex: 1,
    alignItems: "flex-start",
  },
  togglleItemContent: {},
  togglleItemContentContainer: {
    width: "100%",
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    height: "100%",
  },
  mapContainerDefault: {
    width: "90%",
    height: 200,
    borderRadius: 10,
    minHeight: 200,
  },
  mapContainer: {
    width: "100%",
    height: 200,
    borderRadius: 10,
    minHeight: 200,
  },
  mapViewContainer: {
    width: "90%",
    height: 200,
    marginTop: 5,
    borderRadius: 10,
    minHeight: 200,
    alignSelf: "center",
    shadowColor: "#C19A6B",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.9,
    shadowRadius: 6,
    elevation: 20,
    borderWidth: 0,
  },
  totalPrictContainer: {
    paddingHorizontal: 20,
    marginHorizontal: 20,
    marginTop: 40,
  },
  priceRowContainer: {
    flexDirection: "row",
    marginBottom: 10,
    fontSize: 25,
    alignItems: "center",
    justifyContent: "center",
  },
  submitButton: {
    backgroundColor: theme.SUCCESS_COLOR,
    borderRadius: 15,
    marginTop: 30,
  },
  submitContentButton: {
    height: 50,
  },
  background: {
    position: "absolute",
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
    height: "100%",
  },
  image: {
    flex: 1,
    resizeMode: "cover",
    justifyContent: "center",
  },
});
