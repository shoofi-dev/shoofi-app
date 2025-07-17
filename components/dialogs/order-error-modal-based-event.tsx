import React, { useState, useEffect } from "react";
import { DeviceEventEmitter } from "react-native";
import OrderErrorModal from "./order-error-modal";
import { DIALOG_EVENTS } from "../../consts/events";

export default function OrderErrorModalBasedEvent() {
  const [visible, setVisible] = useState(false);
  const [title, setTitle] = useState("");
  const [message, setMessage] = useState("");

  useEffect(() => {
    const subscription = DeviceEventEmitter.addListener(
      DIALOG_EVENTS.OPEN_ORDER_ERROR_DIALOG,
      openDialog
    );
    return () => {
      subscription.remove();
    };
  }, []);

  const openDialog = (data) => {
    setTitle(data?.title || "");
    setMessage(data?.message || "");
    setVisible(true);
  };

  const hideDialog = () => {
    DeviceEventEmitter.emit(`${DIALOG_EVENTS.OPEN_ORDER_ERROR_DIALOG}_HIDE`, {
      value: true,
    });
    setVisible(false);
  };

  return (
    <OrderErrorModal
      visible={visible}
      title={title}
      message={message}
      onClose={hideDialog}
    />
  );
} 