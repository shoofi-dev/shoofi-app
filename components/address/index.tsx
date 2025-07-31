import React, { useContext, useEffect, useState } from "react";
import {
  View,
  TouchableOpacity,
  StyleSheet,
} from "react-native";
import Modal from "react-native-modal";
import { observer } from "mobx-react-lite";
import { useTranslation } from "react-i18next";
import { StoreContext } from "../../stores";
import {
  animationDuration,
  PLACE,
  SHIPPING_METHODS,
} from "../../consts/shared";

import { ShippingMethodPick } from "./shipping-method-pick";
import { MapViewAddress } from "./map-view";
import * as Animatable from "react-native-animatable";
import Icon from "../icon";
import Text from "../controls/Text";
import { useNavigation } from "@react-navigation/native";
import themeStyle from "../../styles/theme.style";
import AddressModal from "./AddressModal";
import { ShippingMethodPickSquare } from "./shipping-method-pick/method-square";

export type TProps = {
  onShippingMethodChangeFN: any;
  onGeoAddressChange: any;
  onTextAddressChange: any;
  onPlaceChangeFN: any;
  onAddressChange: any;
  shippingMethod: any;
};

export const AddressCMP = observer(({
  onShippingMethodChangeFN,
  onGeoAddressChange,
  onTextAddressChange,  
  onAddressChange,
  onPlaceChangeFN,
  shippingMethod,
}: TProps) => {
  const { t } = useTranslation();
  const navigation = useNavigation();
  const { storeDataStore, addressStore, shoofiAdminStore } = useContext(StoreContext);
  const {
    availableDrivers,
    availableDriversLoading: driversLoading,
    availableDriversError: driversError,
    customerLocation,
  } = shoofiAdminStore;
  const [defaultAddress, setDefaultAddress] = useState(null);
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
  const [isAddressModalVisible, setIsAddressModalVisible] = useState(false);

  useEffect(() => {
    setDefaultAddress(addressStore.defaultAddress);
    if(shippingMethod === SHIPPING_METHODS.shipping){
      setIsAddressModalVisible(true);
    }
  }, [shippingMethod]);
  useEffect(() => {
    if(addressStore.defaultAddress){
      setDefaultAddress(addressStore.defaultAddress);
    }
  }, [addressStore.defaultAddress]);

  useEffect(() => {
    // if (!storeDataStore.storeData || shippingMethod) return;
    const defaultAddressTmp = defaultAddress || addressStore.defaultAddress;
    if (
      defaultAddressTmp &&
      defaultAddressTmp.location &&
      defaultAddressTmp.location.coordinates
    ) {
      const [lng, lat] = defaultAddressTmp?.location.coordinates;
      const customerLocation = { lat, lng };
      
      let storeLocation = undefined;
      if (storeDataStore.storeData?.location) {
        const { lat: storeLat, lng: storeLng } = storeDataStore.storeData.location;
        storeLocation = { lat: storeLat, lng: storeLng };
      }
      
       shoofiAdminStore.fetchAvailableDrivers(customerLocation, storeLocation);
    }
  }, [addressStore.defaultAddress, addressStore.addresses, shippingMethod, defaultAddress, storeDataStore.storeData?.location?.lat, storeDataStore.storeData?.location?.lng]);

  const onShippingMethodChange = async (shippingMethodValue: string) => {
    onShippingMethodChangeFN(shippingMethodValue);
  };

  const onPlaceChange = (placeValue) => {
    setPlace(placeValue);
    onPlaceChangeFN(placeValue);
  };

  const onChangeTextAddress = (addressObj) => {
    setTextAddress(addressObj ? `${addressObj.name}: ${addressObj.street || ''}${addressObj.streetNumber ? ',' + addressObj.streetNumber : ''}${addressObj.city ? ', ' + addressObj.city : ''}` : '');
    onTextAddressChange(addressObj);
  };

  useEffect(() => {
    if (defaultAddress) {
      setAddress(
        [
          defaultAddress.name && `${defaultAddress.name}:`,
          defaultAddress.street,
          defaultAddress.streetNumber && defaultAddress.street && defaultAddress.streetNumber,
          defaultAddress.city,
        ]
          .filter(Boolean)
          .join(', ')
      );
      onAddressChange(defaultAddress);
    }
  }, [defaultAddress]);
  
  const onGEOChange = (locationValue, regionValue) => {
    setLocation(locationValue);
    setRegion(regionValue);
    onGeoAddressChange(locationValue);
  };

  const handleConfirmActionAnswer = () => {
    setIsOpenConfirmActiondDialog(false);
  };

  const handleAddressChange = (addressValue) => {
    setDefaultAddress(addressValue);
    onAddressChange(addressValue);
    setIsAddressModalVisible(false);
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
  console.log("address", defaultAddress)

  return (
    <View style={{}}>
      <View>
        {/* <ShippingMethodPick
          onChange={onShippingMethodChange}
          shippingMethodValue={""}
          isDeliverySupport={availableDrivers?.available && shoofiAdminStore.storeData?.delivery_support}
          takeAwayReadyTime={takeAwayReadyTime}
          isTakeAwaySupport={shoofiAdminStore.storeData?.takeaway_support && storeDataStore.storeData?.takeaway_support}

          deliveryTime={deliveryTime}
          distanceKm={distanceKm}
          driversLoading={driversLoading}
          shippingMethod={shippingMethod}
        /> */}
        <ShippingMethodPickSquare
          onChange={onShippingMethodChange}
          shippingMethodValue={""}
          isDeliverySupport={availableDrivers?.available && shoofiAdminStore.storeData?.delivery_support}
          takeAwayReadyTime={takeAwayReadyTime}
          isTakeAwaySupport={shoofiAdminStore.storeData?.takeaway_support && storeDataStore.storeData?.takeaway_support}

          deliveryTime={deliveryTime}
          distanceKm={distanceKm}
          driversLoading={driversLoading}
          shippingMethod={shippingMethod}
        />
      </View>
      
      {shippingMethod === SHIPPING_METHODS.shipping && (
        <View style={{ alignItems: "center" }}>
          <Animatable.View
            animation="fadeInLeft"
            duration={animationDuration}
            style={{
              marginTop: 10,
              width: "100%",
              alignItems: "center",
            }}
          >
            {address && (
              <TouchableOpacity 
                style={styles.defaultAddressBar} 
                onPress={() => setIsAddressModalVisible(true)}
              >
                <View>
                  <Text style={styles.defaultAddressText}>
                    {address}
                  </Text>
                </View>
                <View>
                  <Icon icon="chevron" size={20} color="#888" style={{ marginLeft: 6, marginRight: 2 }} />
                </View>
              </TouchableOpacity>
            )}
          </Animatable.View>
          
          <View style={{ width: "100%" }}>
            <Animatable.View
              animation="fadeInLeft"
              duration={animationDuration}
              style={{ width: "100%" }}
            >
              {customerLocation && (
                <MapViewAddress location={customerLocation} region={region} />
              )}
            </Animatable.View>
          </View>
        </View>
      )}
      <Modal
        isVisible={isAddressModalVisible}
        onBackdropPress={() => {}}
        style={{ justifyContent: 'flex-end', margin: 0, }}
        animationIn="slideInUp"
        animationOut="slideOutDown"
        backdropOpacity={0.5}
      >
        <AddressModal 
          onClose={() =>  setIsAddressModalVisible(false)}
          onAddressSelect={(selectedAddress) => {
            setDefaultAddress(selectedAddress);
            handleAddressChange(selectedAddress);
          }}
          selectionMode={true}
          customSelectedAddress={defaultAddress}
          isHideCloseButton={true}
        />
      </Modal>
    </View>
  );
});

const styles = StyleSheet.create({
  defaultAddressBar: {
    backgroundColor: themeStyle.GRAY_10,
    borderRadius: 8,
    marginBottom: 6,
    width: '100%',
    padding: 10,
    flexDirection: 'row', 
    alignItems: 'center', 
    justifyContent: 'space-between'
  },
  defaultAddressText: {
    fontSize: themeStyle.FONT_SIZE_MD,
    color: '#222',
    flexShrink: 1,
    textAlign: 'right',
  },
});
