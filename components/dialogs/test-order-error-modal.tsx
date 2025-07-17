import React from 'react';
import { View, Button } from 'react-native';
import { DeviceEventEmitter } from 'react-native';
import { DIALOG_EVENTS } from '../../consts/events';
import { useTranslation } from 'react-i18next';

const TestOrderErrorModal = () => {
  const { t } = useTranslation();
    
  const testOrderError = () => {
    DeviceEventEmitter.emit(DIALOG_EVENTS.OPEN_ORDER_ERROR_DIALOG, {
      title: t("order-error-modal-title"),
      message: t("order-error-modal-message")
    });
  };

  const testPaymentError = () => {
    DeviceEventEmitter.emit(DIALOG_EVENTS.OPEN_ORDER_ERROR_DIALOG, {
      title: t("order-error-modal-title"),
      message: t("order-error-modal-message")
    });
  };

  const testDuplicateOrder = () => {
    DeviceEventEmitter.emit(DIALOG_EVENTS.OPEN_ORDER_ERROR_DIALOG, {
      title: t("order-error-modal-title"),
      message: t("order-error-modal-message")
    });
  };

  return (
    <View style={{ padding: 20 }}>
      <Button title="Test Order Error" onPress={testOrderError} />
      <Button title="Test Payment Error" onPress={testPaymentError} />
      <Button title="Test Duplicate Order" onPress={testDuplicateOrder} />
    </View>
  );
};

export default TestOrderErrorModal; 