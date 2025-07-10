import { useContext, useEffect, useRef, useState } from "react";
import { AppState, DeviceEventEmitter } from "react-native";
import * as Device from "expo-device";
import { StoreContext } from "../../stores";
import { PLACE, SHIPPING_METHODS } from "../../consts/shared";
import { useNavigation } from "@react-navigation/native";
import { DIALOG_EVENTS } from "../../consts/events";
import { useTranslation } from "react-i18next";

export type TProps = {
  shippingMethod: any;
  addressLocation?: boolean;
  addressLocationText?: boolean;
  place?: any;
};
const _useCheckoutValidate = () => {
  const { t } = useTranslation();

  const navigation = useNavigation();

  const { cartStore, userDetailsStore, storeDataStore } =
    useContext(StoreContext);



  const validateAdress = async (addressLocation) => {
    return new Promise(async (resolve) => {
      if (addressLocation) {
        const isValidGeoRes: any = await cartStore.isValidGeo(
          addressLocation.coords.latitude,
          addressLocation.coords.longitude
        );
        resolve(isValidGeoRes.data);
      } else {
        //setIsOpenLocationIsDisableDialog(true);
        resolve(false);
      }
    });
  };





  // VALIDATE SHIPPING ADDRESS - START
  useEffect(() => {
    const subscription = DeviceEventEmitter.addListener(
      `${DIALOG_EVENTS.OPEN_INVALID_ADDRESS_BASED_EVENT_DIALOG}_HIDE`,
      handleInvalidAddressAnswer
    );
    return () => {
      subscription.remove();
    };
  }, []);
  const handleInvalidAddressAnswer = (data) => {};
  const toggleInvalidAddressDialog = () => {
    DeviceEventEmitter.emit(
      DIALOG_EVENTS.OPEN_INVALID_ADDRESS_BASED_EVENT_DIALOG
    );
  };
  const isValidShippingCheck = async (
    shippingMethod,
    addressLocation,
    addressLocationText,
    place
  ) => {

    if (shippingMethod === SHIPPING_METHODS.shipping) {
      if(place === PLACE.current){
        const isValid = await validateAdress(addressLocation);
        if (isValid) {
          return true;
        }
        toggleInvalidAddressDialog();
        DeviceEventEmitter.emit(DIALOG_EVENTS.PLACE_SWITCH_TO_CURRENT_PLACE);
        return false;
      }
      if(place === PLACE.other){
        if(addressLocationText){
          return true;
        }
        toggleInvalidAddressDialog();
        return true;
      }
      return false;
    }
    return true;
  };
  // VALIDATE SHIPPING ADDRESS - END

  const isCheckoutValid = async ({
    shippingMethod,
    addressLocation,
    addressLocationText,
    place,
  }: TProps) => {
    // Store validation is now handled in cart screen
    // Only shipping validation remains here
    
    // const isValidShipping = await isValidShippingCheck(
    //   shippingMethod,
    //   addressLocation,
    //   addressLocationText,
    //   place
    // );
    // if (!isValidShipping) {
    //   return false;
    // }
    
    return true;
  };

  return {
    isCheckoutValid,
  };
};

export default _useCheckoutValidate;
