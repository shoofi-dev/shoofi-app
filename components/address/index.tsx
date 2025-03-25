import { View, StyleSheet } from "react-native";
import { useTranslation } from "react-i18next";
import {
  animationDuration,
  PLACE,
  SHIPPING_METHODS,
} from "../../consts/shared";
import { useContext, useEffect, useState } from "react";
import isStoreSupportAction from "../../helpers/is-store-support-action";
import theme from "../../styles/theme.style";
import { ShippingMethodPick } from "./shipping-method-pick";
import { MapViewAddress } from "./map-view";
import { PlacePickCmp } from "./place-pick";
import TextAddress from "./text-address";
import GEOAddress from "./geo-address";
import { StoreContext } from "../../stores";
import * as Animatable from "react-native-animatable";

export type TProps = {
  onShippingMethodChangeFN: any;
  onGeoAddressChange: any;
  onTextAddressChange: any;
  onPlaceChangeFN: any;
};
export const AddressCMP = ({
  onShippingMethodChangeFN,
  onGeoAddressChange,
  onTextAddressChange,
  onPlaceChangeFN,
}: TProps) => {
  const { t } = useTranslation();
  const { ordersStore } = useContext(StoreContext);

  const [place, setPlace] = useState(PLACE.current);
  const [textAddress, setTextAddress] = useState("");
  const [location, setLocation] = useState(null);
  const [region, setRegion] = useState(null);
  const [isOpenConfirmActiondDialog, setIsOpenConfirmActiondDialog] =
    useState(false);

  const [recipetSupportText, setRecipetSupportText] = useState({
    text: "",
    icon: null,
  });
  const [isOpenRecipetNotSupportedDialog, setIOpenRecipetNotSupportedDialog] =
    useState(false);

  const [shippingMethod, setShippingMethod] = useState(
    SHIPPING_METHODS.takAway
  );

  const onShippingMethodChange = async (shippingMethodValue: string) => {
    setShippingMethod(shippingMethodValue);
    onShippingMethodChangeFN(shippingMethodValue);
  };

  const onPlaceChange = (placeValue) => {
    setPlace(placeValue);
    onPlaceChangeFN(placeValue);
    // if(placeValue === PLACE.other){
    //   setIsOpenConfirmActiondDialog(true);
    // }
  };
  const onChangeTextAddress = (textAddressValue) => {
    setTextAddress(textAddressValue);
    onTextAddressChange(textAddressValue);
  };
  const onGEOChange = (locationValue, regionValue) => {
    console.log("onGEOChange");
    setLocation(locationValue);
    setRegion(regionValue);
    onGeoAddressChange(locationValue);
  };

  const handleConfirmActionAnswer = () => {
    setIsOpenConfirmActiondDialog(false);
  };

  return (
    <View style={{}}>
      <View>
        <ShippingMethodPick
          onChange={onShippingMethodChange}
          shippingMethodValue={shippingMethod}
        />
      </View>
      {shippingMethod === SHIPPING_METHODS.shipping && (
        <View style={{ alignItems: "center" }}>
          <Animatable.View
            animation="fadeInLeft"
            duration={animationDuration}
            style={{
              height: 60,
              marginTop: 10,
              width: "90%",
              alignItems: "center",
            }}
          >
            <PlacePickCmp onChnage={onPlaceChange} selectedPlace={place} />
          </Animatable.View>
          {place === PLACE.current && (
            <View style={{ width: "100%" }}>
              <GEOAddress onChange={onGEOChange} />
              <Animatable.View
                animation="fadeInLeft"
                duration={animationDuration}
                style={{ width: "100%", marginTop: 10 }}
              >
                {location && region && (
                  <MapViewAddress location={location} region={region} />
                )}
              </Animatable.View>
            </View>
          )}
          {place === PLACE.other && (
            <Animatable.View
              animation="fadeInLeft"
              style={{ marginTop: 10, width: "100%" }}
            >
              <TextAddress onChange={onChangeTextAddress} />
            </Animatable.View>
          )}
        </View>
      )}
    </View>
  );
};
const styles = StyleSheet.create({});
