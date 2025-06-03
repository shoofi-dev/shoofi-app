import React, { useContext, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, I18nManager } from 'react-native';
import { observer } from 'mobx-react-lite';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { useNavigation } from '@react-navigation/native';
import { StoreContext } from '../../stores';

interface AddressSelectorProps {
  onAddressSelect?: (address: any) => void;
}
// customerId={userDetailsStore?.userDetails?.customerId}
// selectedAddress={addressStore.defaultAddress}
const AddressSelector = observer(({

  onAddressSelect,
}: AddressSelectorProps) => {
  const navigation = useNavigation();
  const { addressStore, userDetailsStore } =
  useContext(StoreContext);
  // RTL support
  React.useEffect(() => {
    if (!I18nManager.isRTL) {
      I18nManager.forceRTL(true);
    }
  }, []);

  useEffect(() => { 
    if(userDetailsStore?.userDetails?.customerId){
      addressStore.fetchAddresses(userDetailsStore?.userDetails?.customerId);
    }
  }, [userDetailsStore?.userDetails?.customerId]);

  const selectedAddress = addressStore.defaultAddress;
  // Handler for row press
  const handlePress = () => {
    const nav: any = navigation;
    if (!selectedAddress) {
      nav.navigate('AddAddress', {
        onSuccess: () => {
          navigation.goBack();
        },
      });
    } else {
      nav.navigate('AddressList', {
        selectionMode: true,
        onAddressSelect,
      });
    }
  };
  console.log("selectedAddress",selectedAddress)
  return (
    <TouchableOpacity style={styles.row} onPress={handlePress} activeOpacity={0.8}>
      <Icon name="home" size={22} color="#444" style={styles.icon} />
      <View style={styles.textContainer}>
        {!selectedAddress ? (
          <Text style={styles.addPrompt}>הוסף את הכתובת שלך</Text>
        ) : (
          <Text style={styles.addressText} numberOfLines={1}>
            {selectedAddress.street && selectedAddress.city
              ? `${selectedAddress.street} ${selectedAddress.houseNumber ? selectedAddress.houseNumber + ', ' : ''}${selectedAddress.city}`
              : selectedAddress.name || ''}
          </Text>
        )}
      </View>
      {!selectedAddress ? (
        <Icon name="edit" size={20} color="#444" style={styles.editIcon} />
      ) : (
        <Icon name="keyboard-arrow-down" size={24} color="#444" style={styles.arrowIcon} />
      )}
    </TouchableOpacity>
  );
});

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 12,
    paddingVertical: 10,
    paddingHorizontal: 16,
    marginBottom: 12,
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
  },
  icon: {
    marginLeft: 10,
    marginRight: 0,
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
  editIcon: {
    marginRight: 10,
    marginLeft: 0,
  },
  arrowIcon: {
    marginRight: 10,
    marginLeft: 0,
  },
});

export default AddressSelector; 