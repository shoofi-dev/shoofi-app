import React, { useContext, useEffect, useState } from "react";
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  Alert,
  DeviceEventEmitter,
} from "react-native";
import { observer } from "mobx-react-lite";
import Icon from "react-native-vector-icons/MaterialIcons";
import { useNavigation } from "@react-navigation/native";
import { StoreContext } from "../../stores";
import { useTranslation } from "react-i18next";
import themeStyle from "../../styles/theme.style";
import BackButton from "../back-button";
import { DIALOG_EVENTS } from "../../consts/events";

interface AddressListProps {
  onAddressSelect?: (address: any) => void;
  selectionMode?: boolean;
}

const AddressList = observer(
  ({ onAddressSelect, selectionMode = false }: AddressListProps) => {
    const { t } = useTranslation();

    const navigation = useNavigation();
    const { addressStore, userDetailsStore } = useContext(StoreContext);
    const [customerId, setCustomerId] = useState<string | undefined>(undefined);

    useEffect(() => {
      if (customerId) {
        loadAddresses();
      }
    }, [customerId]);

    useEffect(() => {
      if (userDetailsStore?.userDetails?.phone) {
        setCustomerId(userDetailsStore?.userDetails?.customerId);
      }
    }, [userDetailsStore?.userDetails?.phone]);

    const loadAddresses = async () => {
      try {
        await addressStore.fetchAddresses(customerId);
      } catch (error) {
        console.log("error", error);
        Alert.alert("Error", "Failed to load addresses");
      }
    };

    const handleDelete = async (addressId: string) => {
      Alert.alert(
        t("delete-address"),
        t("are-you-sure-you-want-to-delete-this-address"),
        [
          { text: t("cancel"), style: "cancel" },
          {
            text: t("delete"),
            style: "destructive",
            onPress: async () => {
              try {
                await addressStore.deleteAddress(customerId, addressId);
              } catch (error) {
                Alert.alert("Error", t("failed-to-delete-address"));
              }
            },
          },
        ]
      );
    };

    const handleSetDefault = async (addressId: string) => {
      try {
        await addressStore.setDefaultAddress(customerId, addressId);
        navigation.goBack();
      } catch (error) {
        Alert.alert("Error", t("failed-to-set-default-address"));
      }
    };

    const openNewAddressDialog = () => {
      DeviceEventEmitter.emit(
        DIALOG_EVENTS.OPEN_NEW_ADDRESS_BASED_EVENT_DIALOG
      );
    };

    const renderAddress = ({ item }: { item: any }) => (
      <View style={styles.addressCard}>
        <View style={styles.addressInfo}>
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              marginBottom: 10,
            }}
          >
            <Text style={styles.addressName}>{item.name}</Text>
            {item.isDefault && (
              <View style={styles.defaultBadge}>
                <Text style={styles.defaultText}>{t("default")}</Text>
              </View>
            )}
          </View>
          <Text style={styles.addressText}>{item.city}</Text>
          <Text
            style={styles.addressText}
          >{`${item.street}, ${item.streetNumber} `}</Text>
        </View>

        <View style={styles.actions}>
          {!selectionMode && (
            <>
              <TouchableOpacity
                onPress={() =>
                  navigation.navigate("EditAddress", { address: item })
                }
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
              <Text style={styles.selectButtonText}>{t("select")}</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>
    );

    if (addressStore.loading) {
      return (
        <View style={styles.centered}>
          <Text>{t("loading-addresses")}</Text>
        </View>
      );
    }

    return (
      <View style={styles.container}>
        <View style={styles.backContainer}>
          <BackButton onClick={() => {}} />
          <View style={{ marginLeft: 10 }}>
            <Text style={{ fontSize: 20, color: themeStyle.BLACK_COLOR }}>
              {t("my-order")}
            </Text>
          </View>
        </View>
        <FlatList
          data={addressStore.addresses}
          renderItem={renderAddress}
          keyExtractor={(item) => item._id}
          contentContainerStyle={styles.list}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>{t("no-addresses-found")}</Text>
              {!selectionMode && (
                <TouchableOpacity
                  style={styles.addButton}
                  onPress={openNewAddressDialog}
                >
                  <Text style={styles.addButtonText}>
                    {t("add-new-address")}
                  </Text>
                </TouchableOpacity>
              )}
            </View>
          }
        />

        {!selectionMode && addressStore.addresses.length > 0 && (
          <TouchableOpacity
            style={styles.fab}
            onPress={openNewAddressDialog}
          >
            <Icon name="add" size={24} color="#fff" />
          </TouchableOpacity>
        )}
      </View>
    );
  }
);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f5f5",
  },
  list: {
    padding: 16,
  },
  addressCard: {
    backgroundColor: "#fff",
    borderRadius: 8,
    padding: 16,
    marginBottom: 12,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  addressInfo: {
    flex: 1,
    alignItems: "flex-start",
  },
  addressName: {
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 4,
  },
  addressText: {
    fontSize: 14,
    color: "#666",
    marginBottom: 2,
  },
  actions: {
    flexDirection: "row",
    justifyContent: "flex-end",
    marginTop: 12,
  },
  backContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 10,
    paddingHorizontal: 15,
  },
  actionButton: {
    padding: 8,
    marginLeft: 8,
  },
  selectButton: {
    backgroundColor: "#007AFF",
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 4,
  },
  selectButtonText: {
    color: "#fff",
    fontWeight: "600",
  },
  defaultBadge: {
    backgroundColor: "#e3f2fd",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
    alignSelf: "flex-start",
    marginLeft: 10,
  },
  defaultText: {
    color: "#1976d2",
    fontSize: 12,
    fontWeight: "600",
  },
  fab: {
    position: "absolute",
    right: 16,
    bottom: 16,
    backgroundColor: "#007AFF",
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: "center",
    alignItems: "center",
    elevation: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
  },
  centered: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  emptyContainer: {
    alignItems: "center",
    padding: 32,
  },
  emptyText: {
    fontSize: 16,
    color: "#666",
    marginBottom: 16,
  },
  addButton: {
    backgroundColor: "#007AFF",
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 4,
  },
  addButtonText: {
    color: "#fff",
    fontWeight: "600",
  },
});

export default AddressList;
