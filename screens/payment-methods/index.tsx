import React, { useState, useEffect } from "react";
import {
  View,
  StyleSheet,
  TouchableOpacity,
  Image,
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
import { getCurrentLang } from "../../translations/i18n";
import { getSupportedPaymentMethods, PaymentMethodOption } from "../../helpers/get-supported-payment-methods";

interface PaymentMethodsScreenProps {
  onClose: any;
  onSelect: any;
  isModal?: boolean;
  supportedMethods?: PaymentMethodOption[];
  isLoading?: boolean;
}

const PaymentMethodsScreen = ({ 
  onClose, 
  onSelect, 
  isModal = false,
  supportedMethods = [],
  isLoading = false
}: PaymentMethodsScreenProps) => {
  const { t } = useTranslation();
  const { scale, fontSize } = useResponsive();
  const [selectedMethod, setSelectedMethod] = useState<string>("");
  const [internalSupportedMethods, setInternalSupportedMethods] = useState<PaymentMethodOption[]>([]);
  const [internalIsLoading, setInternalIsLoading] = useState(true);

  // Use provided supported methods if available, otherwise load them internally
  useEffect(() => {
    if (supportedMethods.length > 0) {
      setInternalSupportedMethods(supportedMethods);
      setInternalIsLoading(isLoading);
    } else {
      const loadSupportedMethods = async () => {
        try {
          setInternalIsLoading(true);
          const methods = await getSupportedPaymentMethods();
          setInternalSupportedMethods(methods);
        } catch (error) {
          console.error("Error loading supported payment methods:", error);
          setInternalSupportedMethods([]);
        } finally {
          setInternalIsLoading(false);
        }
      };

      loadSupportedMethods();
    }
  }, [supportedMethods, isLoading]);

  const handleMethodSelect = (methodId: string) => {
    setSelectedMethod(methodId);
  };

  const handleAdd = () => {
    if (selectedMethod) {
      // Handle adding the selected payment method
      console.log("Selected payment method:", selectedMethod);
      
      // Call onSelect if provided
      if (onSelect) {
        onSelect(selectedMethod);
      }
      
      onClose();
    }
  };

  const renderPaymentMethod = (method: PaymentMethodOption) => {
    const isSelected = selectedMethod === method.id;
    
    return (
      <TouchableOpacity
        key={method.id}
        style={styles.paymentMethodItem}
        onPress={() => handleMethodSelect(method.id)}
        activeOpacity={0.7}
      >
        <View style={styles.paymentMethodContent}>
          <View style={styles.radioContainer}>
            <View style={[
              styles.radioOuter,
              isSelected && styles.radioSelected
            ]}>
              {isSelected && <View style={styles.radioInner} />}
            </View>
          </View>
          
          <View style={styles.iconContainer}>
            {method.iconSource ? (
              <Image
                source={method.iconSource}
                style={styles.paymentIcon}
                resizeMode="contain"
              />
            ) : (
              <Icon
                icon={method.iconName}
                size={scale(20)}
                color={themeStyle.TEXT_PRIMARY_COLOR}
              />
            )}
          </View>
          
          <Text style={[styles.paymentMethodText, { fontSize: fontSize(16) }]}>
            {t(method.translationKey)}
          </Text>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      {/* Modal Handle */}
      <View style={styles.modalHandle} />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.closeButton}
          onPress={onClose}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <Icon icon="x-close1" size={scale(20)} color="#999" />
        </TouchableOpacity>
        <Text style={[styles.title, { fontSize: fontSize(18) }]}>
          {t("payment-method")}
        </Text>
        <View style={styles.headerSpacer} />
      </View>

      {/* Payment Methods List */}
      <View style={styles.methodsList}>
        {internalIsLoading ? (
          <View style={styles.loadingContainer}>
            <Text style={styles.loadingText}>{t("loading")}</Text>
          </View>
        ) : internalSupportedMethods.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>{t("no-payment-methods-available")}</Text>
          </View>
        ) : (
          internalSupportedMethods.map(renderPaymentMethod)
        )}
      </View>

      {/* Add Button */}
      <View style={styles.buttonContainer}>
        <Button
          bgColor={selectedMethod ? (colors.primary || "#8BC34A") : "#CCC"}
          onClickFn={handleAdd}
          disabled={!selectedMethod || internalIsLoading}
          text={t("add")}
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
    paddingTop: 8, // Reduced from 20 to 8 since handle is now above
    paddingBottom: 16, // Increased for better spacing below title
  },
  title: {
    fontWeight: "600",
    color: "#333",
    textAlign: "center",
    flex: 1,
  },
  closeButton: {
    padding: 8,
    borderRadius: 20,
    backgroundColor: "#f5f5f5",
    width: 32,
    height: 32,
    alignItems: "center",
    justifyContent: "center",
  },
  headerSpacer: {
    width: 32, // Same width as close button for balance
  },
  modalHandle: {
    width: 40,
    height: 4,
    backgroundColor: "#DDD",
    borderRadius: 2,
    alignSelf: "center",
    marginTop: 12,
    marginBottom: 16,
  },
  methodsList: {
    paddingHorizontal: 20,
  },
  paymentMethodItem: {
    marginBottom: 8,
  },
  paymentMethodContent: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    paddingHorizontal: 4,
  },
  iconContainer: {
    width: 36,
    height: 36,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#f9fafb",
    backgroundColor: "transparent",
    marginHorizontal: 8,
  },
  paymentIcon: {
    width: 28,
    height: 28,
  },
  paymentMethodText: {
    flex: 1,
    color: "#333",
    fontWeight: "500",
    textAlign: "right", // Right alignment for Hebrew text
    marginRight: 2, // Reduced from 4 to 2
  },
  radioContainer: {
    marginLeft: 2, // Reduced from 4 to 2
  },
  radioOuter: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: "#DDD",
    alignItems: "center",
    justifyContent: "center",
  },
  radioSelected: {
    borderColor: colors.primary || "#8BC34A",
  },
  radioInner: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: colors.primary || "#8BC34A",
  },
  buttonContainer: {
    padding: 20,
    paddingBottom: 30,
  },
  loadingContainer: {
    padding: 20,
    alignItems: "center",
  },
  loadingText: {
    fontSize: 16,
    color: "#666",
  },
  emptyContainer: {
    padding: 20,
    alignItems: "center",
  },
  emptyText: {
    fontSize: 16,
    color: "#666",
    textAlign: "center",
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
