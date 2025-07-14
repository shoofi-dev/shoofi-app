import React, { useContext, useEffect, useState } from "react";
import {
  View,
  StyleSheet,
  TouchableOpacity,
  I18nManager,
  Dimensions,
  DeviceEventEmitter,
} from "react-native";
import { observer } from "mobx-react-lite";
import { useNavigation } from "@react-navigation/native";
import { StoreContext } from "../../stores";
import { DIALOG_EVENTS } from "../../consts/events";
import Text from "../controls/Text";
import { useTranslation } from "react-i18next";
import Icon from "../icon";
import themeStyle from "../../styles/theme.style";
import Modal from "react-native-modal";
import AddressModal from "./AddressModal";

const SCREEN_WIDTH = Dimensions.get("window").width;

interface AddressSelectorProps {
  onAddressSelect?: (address: any) => void;
}

const AddressSelector = observer(({ onAddressSelect }: AddressSelectorProps) => {
  const { t } = useTranslation();
  const navigation = useNavigation();
  const { addressStore, userDetailsStore, shoofiAdminStore, authStore } =
    useContext(StoreContext);
  const [isAddressModalVisible, setIsAddressModalVisible] = useState(false);

  useEffect(() => {
    if (!I18nManager.isRTL) {
      I18nManager.forceRTL(true);
    }
  }, []);

  useEffect(() => {
    if (userDetailsStore?.userDetails?.customerId) {
      addressStore.fetchAddresses(userDetailsStore?.userDetails?.customerId);
    }
  }, [userDetailsStore?.userDetails?.customerId]);

  const selectedAddress = addressStore.defaultAddress;

  const handleRowPress = () => setIsAddressModalVisible(true);
  
  const updateStoresBasedOnSelectedAddress = (address) => {
    if (address?.location?.coordinates) {
      shoofiAdminStore.getStoresListData({
        lat: parseFloat(address.location.coordinates[1]),
        lng: parseFloat(address.location.coordinates[0]),
      });
    }
  };

  const handleSelectAddress = async (address) => {
    await addressStore.setDefaultAddress(
      userDetailsStore?.userDetails?.customerId,
      address._id
    );
    updateStoresBasedOnSelectedAddress(address);
    onAddressSelect?.(address);
  };

  const initStoresList = async () => {
    if (shoofiAdminStore.storeData?.systemAddress) {
      await shoofiAdminStore.getStoresListData({
        lat: parseFloat(shoofiAdminStore.storeData?.systemAddress.location.coordinates[1]),
        lng: parseFloat(shoofiAdminStore.storeData?.systemAddress.location.coordinates[0]),
      });
    }
  };

  useEffect(() => {
    initStoresList();
  }, [shoofiAdminStore.storeData?.systemAddress]);

  const handleAddNew = () => {
    // if(!authStore.isLoggedIn()){
    //   navigation.navigate('login')
    //   return;
    // }
    setIsAddressModalVisible(false);
    DeviceEventEmitter.emit(DIALOG_EVENTS.OPEN_NEW_ADDRESS_BASED_EVENT_DIALOG);
  };

  const getAddressText = (address: any) => {
    return [
      address.name && `${address.name}:`,
      address.street,
      address.streetNumber && address.street && address.streetNumber,
      address.city,
    ]
      .filter(Boolean)
      .join(", ");
  };
  
  return (
    <View style={{ zIndex: 100 }}>
      <TouchableOpacity
        style={styles.row}
        onPress={handleRowPress}
        activeOpacity={0.8}
      >
        <Icon
          icon={!selectedAddress ? "location-3" : "location-3"}
          size={20}
          style={{ marginRight: 5 }}
          color={themeStyle.GRAY_80}
        />

        <View>
          {!selectedAddress ? (
            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                width: "100%",
              }}
            >
              <Text style={styles.addPrompt}>{t("add_your_address")}</Text>
              <Icon icon="edit" size={18} style={{ marginLeft: 5 }} />
            </View>
          ) : (
            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                width: "100%",
              }}
            >
              <Text style={{ color: themeStyle.TEXT_PRIMARY_COLOR, fontSize: 16 }}>
                {getAddressText(selectedAddress)}
              </Text>
              <View style={{  marginLeft: 10 }}>
                <Icon
                  icon="edit"
                  size={20}
                />
         
              </View>
            </View>
          )}
        </View>
      </TouchableOpacity>
      
      <Modal
        isVisible={isAddressModalVisible}
        onBackdropPress={() => setIsAddressModalVisible(false)}
        style={{ justifyContent: 'flex-end', margin: 0, }}
        animationIn="slideInUp"
        animationOut="slideOutDown"
        backdropOpacity={0.5}
      >
        <AddressModal 
          onClose={() => setIsAddressModalVisible(false)}
          onAddressSelect={handleSelectAddress}
          selectionMode={true}
        />
      </Modal>
    </View>
  );
});

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    borderRadius: 12,
    paddingHorizontal: 5,
  },
  icon: {
    marginRight: 5,
  },
  textContainer: {
    flex: 1,
    alignItems: "flex-end",
  },
  addPrompt: {
    fontSize: 16,
    color: "#444",
    fontWeight: "400",
  },
  addressText: {
    fontSize: 16,
    color: "black",
    fontWeight: "700",
  },
  arrowIcon: {
    marginRight: 10,
    marginLeft: 0,
  },
});

export default AddressSelector;
