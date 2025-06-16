import React, { useContext, useEffect, useState, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, I18nManager, Dimensions, DeviceEventEmitter } from 'react-native';
import { observer } from 'mobx-react-lite';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { useNavigation } from '@react-navigation/native';
import { StoreContext } from '../../stores';
import * as Animatable from 'react-native-animatable';
import { DIALOG_EVENTS } from '../../consts/events';

const SCREEN_WIDTH = Dimensions.get('window').width;

const AddressSelector = observer(({ onAddressSelect }) => {
  const navigation = useNavigation();
  const { addressStore, userDetailsStore,shoofiAdminStore, authStore } = useContext(StoreContext);
  const [dropdownOpen, setDropdownOpen] = useState(false);

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

  const handleRowPress = () => setDropdownOpen((open) => !open);
  const updateStoresBasedOnSelectedAddress = (address) => {
    if (address?.location?.coordinates) {
      shoofiAdminStore.getStoresListData({
        lat: parseFloat(address.location.coordinates[1]),
        lng: parseFloat(address.location.coordinates[0])
      });
    }
  };
  const handleSelectAddress = async (address) => {
    console.log("address", address.location.coordinates);
    setDropdownOpen(false);
    await addressStore.setDefaultAddress(userDetailsStore?.userDetails?.customerId, address._id);
    updateStoresBasedOnSelectedAddress(address);
    onAddressSelect?.(address);
  };

  const handleAddNew = () => {
    // if(!authStore.isLoggedIn()){
    //   navigation.navigate('login')
    //   return;
    // }
    setDropdownOpen(false);
      DeviceEventEmitter.emit(
        DIALOG_EVENTS.OPEN_NEW_ADDRESS_BASED_EVENT_DIALOG
      );
  };

  return (
    <View style={{ zIndex: 100,  }}>
      <TouchableOpacity style={styles.row} onPress={handleRowPress} activeOpacity={0.8}>
        <Icon name="home" size={22} color="#444" style={styles.icon} />
        <View >
          {!selectedAddress ? (
            <Text style={styles.addPrompt}>הוסף את הכתובת שלך</Text>
          ) : (
            <Text  numberOfLines={1}>
              {selectedAddress.street && selectedAddress.city
                ? `${selectedAddress.street} ${selectedAddress.streetNumber ? selectedAddress.streetNumber + ', ' : ''}${selectedAddress.city}`
                : selectedAddress.city || ''}
            </Text>
          )}
        </View>
        <Icon name={dropdownOpen ? "keyboard-arrow-up" : "keyboard-arrow-down"} size={24} color="#444" style={styles.arrowIcon} />
      </TouchableOpacity>
      {dropdownOpen && (
        <Animatable.View
          animation="fadeInDown"
          duration={250}
          style={styles.dropdown}
        >
          {addressStore.addresses.map((address) => (
            <TouchableOpacity
              key={address._id}
              style={styles.dropdownItem}
              onPress={() => handleSelectAddress(address)}
            >
              <Icon name={address.isDefault ? "home" : "location-on"} size={20} color="#444" style={{  }} />
              <Text style={styles.dropdownItemText} numberOfLines={1}>
                {address.street && address.city
                  ? `${address.street} ${address.houseNumber ? address.houseNumber + ', ' : ''}${address.city}`
                  : address.name || ''}
              </Text>
            </TouchableOpacity>
          ))}
          <TouchableOpacity style={styles.addNewBtn} onPress={handleAddNew}>
            <Icon name="add" size={20} color="#43a047" style={{ marginLeft: 10, marginRight: 10 }} />
            <Text style={styles.addNewText}>הוסף עוד כתובת</Text>
          </TouchableOpacity>
        </Animatable.View>
      )}
    </View>
  );
});

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 12,
    paddingVertical: 10,
    paddingHorizontal: 5,
    marginBottom: 12,
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
  },
  icon: {
    marginRight:5,
  },
  textContainer: {
    flex: 1,
    alignItems: 'flex-end',
  },
  addPrompt: {
    fontSize: 16,
    color: '#444',
    fontWeight: '400',
  },
  addressText: {
    fontSize: 16,
    color: 'black',
    fontWeight: '700',
  },
  arrowIcon: {
    marginRight: 10,
    marginLeft: 0,
  },
  dropdown: {
    position: 'absolute',
    top: 56,
    left: 0,
    right: 0,
    backgroundColor: '#fff',
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 12,
    zIndex: 1000,
    paddingVertical: 0,
    paddingHorizontal: 0,
    borderWidth: 0,
    minWidth: SCREEN_WIDTH - 32,
  },
  dropdownItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
    backgroundColor: '#fff',
  },
  dropdownItemText: {
    fontSize: 16,
    color: '#222',
    flex: 1,
    textAlign: 'left',
    marginLeft: 10,
  },
  addNewBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
 
    backgroundColor: '#fff',
    borderBottomLeftRadius: 16,
    borderBottomRightRadius: 16,
  },
  addNewText: {
    color: '#43a047',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default AddressSelector;