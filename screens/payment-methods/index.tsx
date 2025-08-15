import React, { useState } from "react";
import {
  View,
  StyleSheet,
  TouchableOpacity,
} from "react-native";
import { observer } from "mobx-react";
import { useTranslation } from "react-i18next";
import Text from "../../components/controls/Text";
import Icon from "../../components/icon";
import BackButton from "../../components/back-button";
import Button from "../../components/controls/button/button";
import themeStyle from "../../styles/theme.style";
import { useResponsive } from "../../hooks/useResponsive";
import { colors } from "../../styles/colors";

interface PaymentMethod {
  id: string;
  name: string;
  icon?: string;
  color?: string;
}

const PaymentMethodsScreen = ({ onClose, isModal = false }) => {
  const { t } = useTranslation();
  const { scale, fontSize } = useResponsive();
  const [selectedMethod, setSelectedMethod] = useState<string>("");

  // Temporary hardcoded translations (until server translations are updated)
  const getPaymentTranslations = () => {
    return {
      title: "אמצעי תשלום",
      add: "הוסף",
      methods: {
        apple_pay: "Apple Pay",
        bit: "בִּיט",
        paybox: "פיי בוקס", 
        credit_card: "כרטיס אשראי",
        cash: "מזומן"
      }
    };
  };

  const translations = getPaymentTranslations();

  const paymentMethods: PaymentMethod[] = [
    {
      id: "apple_pay",
      name: translations.methods.apple_pay,
      icon: "plus3",
      color: "#000",
    },
    {
      id: "bit",
      name: translations.methods.bit,
      icon: "phone1",
      color: "#00B4D8",
    },
    {
      id: "paybox",
      name: translations.methods.paybox,
      icon: "kupa1",
      color: "#FF6B35",
    },
    {
      id: "credit_card",
      name: translations.methods.credit_card,
      icon: "credit-card1",
      color: "#2196F3",
    },
    {
      id: "cash",
      name: translations.methods.cash,
      icon: "shekel1",
      color: "#4CAF50",
    },
  ];

  const handleMethodSelect = (methodId: string) => {
    setSelectedMethod(methodId);
  };

  const handleAdd = () => {
    if (selectedMethod) {
      // Handle adding the selected payment method
      console.log("Selected payment method:", selectedMethod);
      onClose();
    }
  };

  const renderPaymentMethod = (method: PaymentMethod) => {
    const isSelected = selectedMethod === method.id;
    
    return (
      <TouchableOpacity
        key={method.id}
        style={styles.paymentMethodItem}
        onPress={() => handleMethodSelect(method.id)}
        activeOpacity={0.7}
      >
        <View style={styles.paymentMethodContent}>
          <View style={styles.iconContainer}>
            <Icon
              icon={method.icon}
              size={scale(24)}
              color={method.color}
            />
          </View>
          
          <Text style={[styles.paymentMethodText, { fontSize: fontSize(16) }]}>
            {method.name}
          </Text>
          
          <View style={styles.radioContainer}>
            <View style={[
              styles.radioOuter,
              isSelected && styles.radioSelected
            ]}>
              {isSelected && <View style={styles.radioInner} />}
            </View>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={[styles.title, { fontSize: fontSize(18) }]}>
          {translations.title}
        </Text>
        <TouchableOpacity
          style={styles.closeButton}
          onPress={onClose}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <Icon icon="x-close1" size={scale(24)} color="#666" />
        </TouchableOpacity>
      </View>

      {/* Modal Handle */}
      <View style={styles.modalHandle} />

      {/* Payment Methods List */}
      <View style={styles.methodsList}>
        {paymentMethods.map(renderPaymentMethod)}
      </View>

      {/* Add Button */}
      <View style={styles.buttonContainer}>
        <Button
          bgColor={selectedMethod ? (colors.primary || "#8BC34A") : "#CCC"}
          onClickFn={handleAdd}
          disabled={!selectedMethod}
          text={translations.add}
          fontSize={fontSize(16)}
          textColor={!selectedMethod ? "#999" : "#fff"}
          borderRadious={25}
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: "#fff",
    // Content-based height, no fixed dimensions
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 10,
  },
  title: {
    fontWeight: "600",
    color: "#333",
    textAlign: "center",
    flex: 1,
  },
  closeButton: {
    padding: 5,
  },
  modalHandle: {
    width: 40,
    height: 4,
    backgroundColor: "#DDD",
    borderRadius: 2,
    alignSelf: "center",
    marginBottom: 20,
  },
  methodsList: {
    paddingHorizontal: 20,
  },
  paymentMethodItem: {
    marginBottom: 16,
  },
  paymentMethodContent: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 16,
    paddingHorizontal: 4,
  },
  iconContainer: {
    width: 40,
    alignItems: "center",
    marginRight: 16,
  },
  paymentMethodText: {
    flex: 1,
    color: "#333",
    fontWeight: "500",
    textAlign: "right", // Hebrew text alignment
  },
  radioContainer: {
    marginLeft: 16,
  },
  radioOuter: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: "#DDD",
    alignItems: "center",
    justifyContent: "center",
  },
  radioSelected: {
    borderColor: colors.primary || "#8BC34A",
  },
  radioInner: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: colors.primary || "#8BC34A",
  },
  buttonContainer: {
    padding: 20,
    paddingBottom: 30,
  },
  addButton: {
    backgroundColor: colors.primary || "#8BC34A",
    borderRadius: 25,
    paddingVertical: 16,
    alignItems: "center",
    justifyContent: "center",
  },
  addButtonDisabled: {
    backgroundColor: "#CCC",
  },
  addButtonText: {
    color: "#fff",
    fontWeight: "600",
  },
  addButtonTextDisabled: {
    color: "#999",
  },
});

export default observer(PaymentMethodsScreen); 