// ZCredit WebCheckout Configuration
export const ZCREDIT_CONFIG = {
  // API Configuration
  API_BASE_URL: 'https://pci.zcredit.co.il/webcheckout/api/WebCheckout/CreateSession',
  API_KEY: '952ad5fd3a963d4fec9d2e13dacb148144c04bfd5729cdbf5b6bee31a3468d6a',
  
  // Default Session Configuration
  DEFAULT_CONFIG: {
    Local: "He",
    UniqueId: "", // Will be set dynamically
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
    Installments: 1,
    UseLightMode: "true",
    UseCustomCSS: "true",
    BackgroundColor: "FFFFFF",
    ShowTotalSumInPayButton: "false",
    ForceCaptcha: "false",
    CustomCSS: "",
    Bypass3DS: "false",
    // PostMessage Configuration
    PostMessageOnSubmit: "true",
    PostMessageOnSuccess: "true",
    PostMessageOnCancel: "true",
    PostMessageOnFailure: "true",
  },

  // Cards Configuration
  CARDS_CONFIG: {
    ShowVisaIcon: "true",
    ShowMastercardIcon: "true",
    ShowDinersIcon: "true",
    ShowAmericanExpressIcon: "true",
    ShowIsracardIcon: "true",
  },

  // Whitelist Configuration
  ISSUER_WHITELIST: [1, 2, 3, 4, 5, 6],
  BRAND_WHITELIST: [1, 2, 3, 4, 5, 6],

  // Customer Attributes Configuration
  CUSTOMER_ATTRIBUTES: {
    HolderId: "none",
    Name: "required",
    PhoneNumber: "required",
    Email: "optional"
  },

  // Focus Types for different payment methods
  FOCUS_TYPES: {
    APPLE_PAY: "ApplePayOnly",
    GOOGLE_PAY: "GooglePayOnly",
    BIT: "BitOnly",
    DEFAULT: "ApplePayOnly"
  }
};

// Interface for ZCredit session creation parameters
export interface ZCreditSessionParams {
  customerName: string;
  customerPhone: string;
  customerEmail?: string;
  cartItems: Array<{
    Amount: string;
    Currency: string;
    Name: string;
    Description: string;
    Quantity: number;
    Image: string;
    IsTaxFree: string;
    AdjustAmount: string;
  }>;
  paymentMethod: string;
  focusType?: string;
}

// Function to create ZCredit session request body
export const createZCreditSessionBody = (params: ZCreditSessionParams) => {
  const {
    customerName,
    customerPhone,
    customerEmail = "",
    cartItems,
    paymentMethod,
    focusType = ZCREDIT_CONFIG.FOCUS_TYPES.DEFAULT
  } = params;

  return {
    Key: ZCREDIT_CONFIG.API_KEY,
    ...ZCREDIT_CONFIG.DEFAULT_CONFIG,
    
    // Payment method specific configuration
    BitButtonEnabled: paymentMethod === 'BIT' ? "true" : "false",
    ApplePayButtonEnabled: paymentMethod === 'APPLE_PAY' ? "true" : "false",
    GooglePayButtonEnabled: paymentMethod === 'GOOGLE_PAY' ? "true" : "false",
    
    // Customer configuration
    Customer: {
      Email: customerEmail,
      Name: customerName,
      PhoneNumber: customerPhone,
      Attributes: ZCREDIT_CONFIG.CUSTOMER_ATTRIBUTES
    },
    
    // Cart and payment configuration
    CartItems: cartItems,
    FocusType: focusType,
    CardsIcons: ZCREDIT_CONFIG.CARDS_CONFIG,
    IssuerWhiteList: ZCREDIT_CONFIG.ISSUER_WHITELIST,
    BrandWhiteList: ZCREDIT_CONFIG.BRAND_WHITELIST,
  };
}; 
