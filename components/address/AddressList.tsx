import React, { useContext, useEffect, useState } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { observer } from 'mobx-react-lite';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { useNavigation } from '@react-navigation/native';
import { StoreContext } from '../../stores';

interface AddressListProps {
  onAddressSelect?: (address: any) => void;
  selectionMode?: boolean;
}

const AddressList = observer(({ onAddressSelect, selectionMode = false }: AddressListProps) => {
  const navigation = useNavigation();
  const { addressStore, userDetailsStore } = useContext(StoreContext);
  const [customerId, setCustomerId] = useState<string | undefined>(undefined);

  useEffect(() => {
    loadAddresses();
  }, []);

    useEffect(() => {
    if(userDetailsStore?.userDetails?.phone){
      setCustomerId(userDetailsStore?.userDetails?.customerId);
    }
  }, [userDetailsStore?.userDetails?.phone]);

  const loadAddresses = async () => {
    try {
      await addressStore.fetchAddresses(customerId);
    } catch (error) {
      Alert.alert('Error', 'Failed to load addresses');
    }
  };

  const handleDelete = async (addressId: string) => {
    Alert.alert(
      'Delete Address',
      'Are you sure you want to delete this address?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await addressStore.deleteAddress(customerId, addressId);
            } catch (error) {
              Alert.alert('Error', 'Failed to delete address');
            }
          },
        },
      ]
    );
  };

  const handleSetDefault = async (addressId: string) => {
    try {
      await addressStore.setDefaultAddress(customerId, addressId);
    } catch (error) {
      Alert.alert('Error', 'Failed to set default address');
    }
  };

  const renderAddress = ({ item }: { item: any }) => (
    <View style={styles.addressCard}>
      <View style={styles.addressInfo}>
        <Text style={styles.addressName}>{item.name}</Text>
        <Text style={styles.addressText}>{item.street}</Text>
        <Text style={styles.addressText}>{`${item.city}, ${item.state} ${item.zipCode}`}</Text>
        {item.isDefault && (
          <View style={styles.defaultBadge}>
            <Text style={styles.defaultText}>Default</Text>
          </View>
        )}
      </View>
      
      <View style={styles.actions}>
        {!selectionMode && (
          <>
            <TouchableOpacity
              onPress={() => navigation.navigate('EditAddress', { address: item })}
              style={styles.actionButton}
            >
              <Icon name="edit" size={24} color="#666" />
            </TouchableOpacity>
            
            {!item.isDefault && (
              <TouchableOpacity
                onPress={() => handleSetDefault(item._id)}
                style={styles.actionButton}
              >
                <Icon name="star-border" size={24} color="#666" />
              </TouchableOpacity>
            )}
            
            <TouchableOpacity
              onPress={() => handleDelete(item._id)}
              style={styles.actionButton}
            >
              <Icon name="delete" size={24} color="#ff4444" />
            </TouchableOpacity>
          </>
        )}
        
        {selectionMode && (
          <TouchableOpacity
            onPress={() => onAddressSelect?.(item)}
            style={styles.selectButton}
          >
            <Text style={styles.selectButtonText}>Select</Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );

  if (addressStore.loading) {
    return (
      <View style={styles.centered}>
        <Text>Loading addresses...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={addressStore.addresses}
        renderItem={renderAddress}
        keyExtractor={(item) => item._id}
        contentContainerStyle={styles.list}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>No addresses found</Text>
            {!selectionMode && (
              <TouchableOpacity
                style={styles.addButton}
                onPress={() => navigation.navigate('AddAddress')}
              >
                <Text style={styles.addButtonText}>Add New Address</Text>
              </TouchableOpacity>
            )}
          </View>
        }
      />
      
      {!selectionMode && addressStore.addresses.length > 0 && (
        <TouchableOpacity
          style={styles.fab}
          onPress={() => navigation.navigate('AddAddress')}
        >
          <Icon name="add" size={24} color="#fff" />
        </TouchableOpacity>
      )}
    </View>
  );
});

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  list: {
    padding: 16,
  },
  addressCard: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 16,
    marginBottom: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  addressInfo: {
    flex: 1,
  },
  addressName: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  addressText: {
    fontSize: 14,
    color: '#666',
    marginBottom: 2,
  },
  actions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: 12,
  },
  actionButton: {
    padding: 8,
    marginLeft: 8,
  },
  selectButton: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 4,
  },
  selectButtonText: {
    color: '#fff',
    fontWeight: '600',
  },
  defaultBadge: {
    backgroundColor: '#e3f2fd',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
    alignSelf: 'flex-start',
    marginTop: 8,
  },
  defaultText: {
    color: '#1976d2',
    fontSize: 12,
    fontWeight: '600',
  },
  fab: {
    position: 'absolute',
    right: 16,
    bottom: 16,
    backgroundColor: '#007AFF',
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyContainer: {
    alignItems: 'center',
    padding: 32,
  },
  emptyText: {
    fontSize: 16,
    color: '#666',
    marginBottom: 16,
  },
  addButton: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 4,
  },
  addButtonText: {
    color: '#fff',
    fontWeight: '600',
  },
});

export default AddressList; 