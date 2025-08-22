import React from "react";
import { View, StyleSheet, Dimensions } from "react-native";
import PaymentMethodsScreen from "../screens/payment-methods";
import { PaymentMethodOption } from "../helpers/get-supported-payment-methods";

// TypeScript interface for component props
interface PaymentMethodModalProps {
  onClose: () => void;
  onSelect?: (selectedMethod: string) => void;
  supportedMethods?: PaymentMethodOption[];
  isLoading?: boolean;
}

// Get screen dimensions once (performance improvement)
const { height: screenHeight } = Dimensions.get('window');

const PaymentMethodModal: React.FC<PaymentMethodModalProps> = ({ 
  onClose, 
  onSelect, 
  supportedMethods = [],
  isLoading = false 
}) => {
  return (
    <View 
      style={styles.modalContainer}
      accessibilityRole="none"
      accessibilityLabel="Payment Methods Modal"
      accessible={true}
    >
      <PaymentMethodsScreen 
        onClose={onClose} 
        onSelect={onSelect} 
        isModal={true}
        supportedMethods={supportedMethods}
        isLoading={isLoading}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  modalContainer: {
    backgroundColor: "#fff",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    overflow: 'hidden',
    // Remove fixed height to make it content-based
    maxHeight: screenHeight * 0.8,
    minHeight: 300,
    // Add shadows for better visual depth
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 10,
  },
});

export default PaymentMethodModal; 