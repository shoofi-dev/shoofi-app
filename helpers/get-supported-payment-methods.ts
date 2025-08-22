import { PAYMENT_METHODS } from "../consts/shared";
import isStoreSupportAction from "./is-store-support-action";
import { getCurrentLang } from "../translations/i18n";

export interface PaymentMethodOption {
  id: string;
  paymentMethodValue: string;
  supportKey: string;
  translationKey: string;
  iconSource?: any;
  iconName?: string;
  // Local translations
  translations: {
    ar: string;
    he: string;
  };
}

// Define all available payment methods with their configurations
const ALL_PAYMENT_METHODS: PaymentMethodOption[] = [
  {
    id: "cash",
    paymentMethodValue: PAYMENT_METHODS.cash,
    supportKey: "cash_support",
    translationKey: "cash",
    iconName: "shekel1",
    translations: {
      ar: "نقداً",
      he: "מזומן"
    }
  },
  {
    id: "credit_card",
    paymentMethodValue: PAYMENT_METHODS.creditCard,
    supportKey: "creditcard_support", 
    translationKey: "credit-card",
    iconSource: require("../assets/icons/credit-card.png"),
    translations: {
      ar: "بطاقة",
      he: "כרטיס אשראי"
    }
  },
  {
    id: "apple_pay",
    paymentMethodValue: PAYMENT_METHODS.applePay,
    supportKey: "apple_pay_support",
    translationKey: "apple-pay",
    iconSource: require("../assets/icons/apple-pay.png"),
    translations: {
      ar: "Apple Pay",
      he: "Apple Pay"
    }
  },
  {
    id: "google_pay",
    paymentMethodValue: PAYMENT_METHODS.googlePay,
    supportKey: "google_pay_support",
    translationKey: "google-pay",
    iconSource: require("../assets/icons/google-pay.png"),
    translations: {
      ar: "Google Pay",
      he: "Google Pay"
    }
  },
  {
    id: "bit",
    paymentMethodValue: PAYMENT_METHODS.bit,
    supportKey: "bit_support",
    translationKey: "bit",
    iconSource: require("../assets/icons/bit.png"),
    translations: {
      ar: "بيت",
      he: "בִּיט"
    }
  },
];

/**
 * Get translated name for a payment method
 */
export const getPaymentMethodTranslatedName = (method: PaymentMethodOption): string => {
  const currentLang = getCurrentLang();
  return method.translations[currentLang] || method.translations.ar;
};

/**
 * Get all available payment methods
 */
export const getAllPaymentMethods = (): PaymentMethodOption[] => {
  return ALL_PAYMENT_METHODS;
};

/**
 * Get only the payment methods that are supported by the store
 */
export const getSupportedPaymentMethods = async (): Promise<PaymentMethodOption[]> => {
  const supportedMethods: PaymentMethodOption[] = [];

  for (const method of ALL_PAYMENT_METHODS) {
    try {
      const isSupported = await isStoreSupportAction(method.supportKey);
      if (isSupported) {
        supportedMethods.push(method);
      }
    } catch (error) {
      console.warn(`Error checking support for ${method.id}:`, error);
    }
  }

  return supportedMethods;
};

/**
 * Get payment method configuration by ID
 */
export const getPaymentMethodById = (id: string): PaymentMethodOption | undefined => {
  return ALL_PAYMENT_METHODS.find(method => method.id === id);
};

/**
 * Get payment method configuration by payment method value
 */
export const getPaymentMethodByValue = (value: string): PaymentMethodOption | undefined => {
  return ALL_PAYMENT_METHODS.find(method => method.paymentMethodValue === value);
};

/**
 * Check if a specific payment method is supported
 */
export const isPaymentMethodSupported = async (id: string): Promise<boolean> => {
  const method = getPaymentMethodById(id);
  if (!method) return false;
  
  try {
    return await isStoreSupportAction(method.supportKey);
  } catch (error) {
    console.warn(`Error checking support for ${id}:`, error);
    return false;
  }
}; 