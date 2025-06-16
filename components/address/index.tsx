import { View, StyleSheet, TouchableOpacity } from "react-native";
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
import { useAvailableDrivers } from "../../hooks/useAvailableDrivers";
import Icon from "../icon";
import Text from "../controls/Text";
import { useNavigation } from "@react-navigation/native";
import { observer } from "mobx-react-lite";

export type TProps = {
  onShippingMethodChangeFN: any;
  onGeoAddressChange: any;
  onTextAddressChange: any;
  onPlaceChangeFN: any;
  onAddressChange: any;
};
export const AddressCMP = observer(({
  onShippingMethodChangeFN,
  onGeoAddressChange,
  onTextAddressChange,  
  onAddressChange,
  onPlaceChangeFN,
}: TProps) => {
  const { t } = useTranslation();
  const navigation = useNavigation();
  const { storeDataStore, addressStore } = useContext(StoreContext);
  const {
    availableDrivers,
    loading: driversLoading,
    error: driversError,
    customerLocation,
  } = useAvailableDrivers();
  const [defaultAddress, setDefaultAddress] = useState(null);
  useEffect(() => {
    console.log("addressStore.defaultAddress", addressStore.defaultAddress)
    setDefaultAddress(addressStore.defaultAddress);
  }, [addressStore.defaultAddress]);
  const [place, setPlace] = useState(PLACE.current);
  const [textAddress, setTextAddress] = useState("");
  const [location, setLocation] = useState(null);
  const [region, setRegion] = useState(null);
  const [address, setAddress] = useState(null);
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
  const onChangeTextAddress = (addressObj) => {
    setTextAddress(addressObj ? `${addressObj.name}: ${addressObj.street || ''}${addressObj.streetNumber ? ',' + addressObj.streetNumber : ''}${addressObj.city ? ', ' + addressObj.city : ''}` : '');
    onTextAddressChange(addressObj);
  };
  useEffect(() => {
    console.log("defaultAddress", defaultAddress);
    if (defaultAddress) {
      setAddress(`${defaultAddress.name}: ${defaultAddress.street || ''}${defaultAddress.streetNumber ? ',' + defaultAddress.streetNumber : ''}${defaultAddress.city ? ', ' + defaultAddress.city : ''}`);
      onAddressChange(defaultAddress);
    }
  }, [defaultAddress]);
  
  const onGEOChange = (locationValue, regionValue) => {
    console.log("onGEOChange", locationValue, regionValue);
    setLocation(locationValue);
    setRegion(regionValue);
    onGeoAddressChange(locationValue);
  };

  const handleConfirmActionAnswer = () => {
    setIsOpenConfirmActiondDialog(false);
  };

  const minTakeAwayReadyTime = storeDataStore.storeData?.minReady;
  const maxTakeAwayReadyTime = storeDataStore.storeData?.maxReady;
  const takeAwayReadyTime = {
    min: minTakeAwayReadyTime,
    max: maxTakeAwayReadyTime,
  };
  const deliveryTime = {
    min: availableDrivers?.area?.minETA,
    max: availableDrivers?.area?.maxETA,
  };
  const distanceKm = availableDrivers?.distanceKm;
  console.log("address", address);

  return (
    <View style={{}}>
    
      <View>
        {/* <ShippingMethodPick
          onChange={onShippingMethodChange}
          shippingMethodValue={shippingMethod}
        /> */}
        <ShippingMethodPick
          onChange={onShippingMethodChange}
          shippingMethodValue={""}
          isDeliverySupport={availableDrivers?.available}
          takeAwayReadyTime={takeAwayReadyTime}
          deliveryTime={deliveryTime}
          distanceKm={distanceKm}
          driversLoading={driversLoading}
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
            {/* Default Address Bar */}
      {address && (
        <TouchableOpacity style={styles.defaultAddressBar} onPress={()=>{
          navigation.navigate("AddressList");
        }}>
          <Icon name="home" size={20} color="#888" style={{ marginLeft: 6, marginRight: 2 }} />
          <Text style={styles.defaultAddressText}>
            {address}
          </Text>
        </TouchableOpacity>
      )}
            {/* <PlacePickCmp onChnage={onPlaceChange} selectedPlace={place} /> */}
          </Animatable.View>
            <View style={{ width: "100%" }}>
              {/* <GEOAddress onChange={onGEOChange} /> */}
              <Animatable.View
                animation="fadeInLeft"
                duration={animationDuration}
                style={{ width: "100%", marginTop: 10, }}
              >
                {customerLocation && (
                  <MapViewAddress location={customerLocation} region={region} />
                )}
              </Animatable.View>
            </View>
      
          {/* {place === PLACE.other && (
            <Animatable.View
              animation="fadeInLeft"
              style={{ marginTop: 10, width: "100%" }}
            >
              <TextAddress onChange={onChangeTextAddress} />
            </Animatable.View>
          )} */}
        </View>
      )}
    </View>
  );
});
const styles = StyleSheet.create({
  defaultAddressBar: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    backgroundColor: '#f5f6f7',
    borderRadius: 8,
    paddingVertical: 6,
    paddingHorizontal: 12,
    marginBottom: 6,
    minHeight: 32,
  },
  defaultAddressText: {
    fontSize: 15,
    color: '#222',
    flexShrink: 1,
    textAlign: 'right',
  },
});
