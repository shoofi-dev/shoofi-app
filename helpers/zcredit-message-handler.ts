// ZCredit WebView PostMessage Event Types
export interface ZCreditPostMessage {
  type: 'PostMessageOnSubmit' | 'PostMessageOnSuccess' | 'PostMessageOnCancel' | 'PostMessageOnFailure' | 'PostMessageOnSubmitEnd';
  data?: {
    sessionId?: string;
    transactionId?: string;
    amount?: number;
    currency?: string;
    status?: string;
    errorMessage?: string;
    errorCode?: string;
    paymentMethod?: string;
    lastFourDigits?: string;
    cardBrand?: string;
    reason?: string;
    state?: boolean;
    [key: string]: any;
  };
}

// ZCredit PostMessage Handler Configuration
export interface ZCreditMessageHandlerConfig {
  onSubmit?: (data?: ZCreditPostMessage['data']) => void;
  onSuccess?: (data?: ZCreditPostMessage['data']) => void;
  onCancel?: (data?: ZCreditPostMessage['data']) => void;
  onFailure?: (data?: ZCreditPostMessage['data']) => void;
  onSubmitEnd?: (data?: ZCreditPostMessage['data']) => void;
  onUnknownMessage?: (message: any) => void;
}

// Main handler function for ZCredit WebView postMessages
export const handleZCreditPostMessage = (
  message: string,
  handlers: ZCreditMessageHandlerConfig
): void => {
  try {
    console.log('ZCredit WebView postMessage received:', message);
    
    // Try to parse the message as JSON
    let parsedMessage: ZCreditPostMessage;
    try {
      parsedMessage = JSON.parse(message);
    } catch (parseError) {
      console.warn('Failed to parse ZCredit postMessage as JSON:', parseError);
      
      // Handle simple string messages that might indicate events
      if (message.includes('submit') && handlers.onSubmit) {
        handlers.onSubmit();
        return;
      }
      if (message.includes('success') && handlers.onSuccess) {
        handlers.onSuccess();
        return;
      }
      if (message.includes('cancel') && handlers.onCancel) {
        handlers.onCancel();
        return;
      }
      if (message.includes('failure') || message.includes('error')) {
        handlers.onFailure?.({ errorMessage: message });
        return;
      }
      
      // If we can't parse or handle it, pass to unknown handler
      handlers.onUnknownMessage?.(message);
      return;
    }

    // Handle parsed JSON messages
    switch (parsedMessage.type) {
      case 'PostMessageOnSubmit':
        console.log('ZCredit: Payment form submitted', parsedMessage.data);
        handlers.onSubmit?.(parsedMessage.data);
        break;

      case 'PostMessageOnSuccess':
        console.log('ZCredit: Payment successful', parsedMessage.data);
        handlers.onSuccess?.(parsedMessage.data);
        break;

      case 'PostMessageOnCancel':
        console.log('ZCredit: Payment cancelled by user', parsedMessage.data);
        handlers.onCancel?.(parsedMessage.data);
        break;

      case 'PostMessageOnFailure':
        console.log('ZCredit: Payment failed', parsedMessage.data);
        handlers.onFailure?.(parsedMessage.data);
        break;

      case 'PostMessageOnSubmitEnd':
        console.log('ZCredit: Form submission ended', parsedMessage.data);
        handlers.onSubmitEnd?.(parsedMessage.data);
        break;

      default:
        console.warn('Unknown ZCredit postMessage type:', parsedMessage.type);
        handlers.onUnknownMessage?.(parsedMessage);
        break;
    }
  } catch (error) {
    console.error('Error handling ZCredit postMessage:', error);
    handlers.onUnknownMessage?.(message);
  }
};

// Utility function to create ZCredit session configuration with postMessage enabled
export const createZCreditConfigWithPostMessages = (baseConfig: any) => {
  return {
    ...baseConfig,
    // Enable postMessage events according to ZCredit API
    PostMessageOnSubmit: "true",
    PostMessageOnSuccess: "true", 
    PostMessageOnCancel: "true",
    PostMessageOnFailure: "true",
    // Optional: Configure the target origin for postMessage security
    PostMessageTargetOrigin: "*", // In production, should be your app's origin
  };
}; 