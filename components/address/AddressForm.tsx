import React, { useState, useEffect, useContext } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert,
  ActivityIndicator,
  DeviceEventEmitter,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { observer } from "mobx-react-lite";
import Icon from "react-native-vector-icons/MaterialIcons";
import * as Location from "expo-location";
import { StoreContext } from "../../stores";
import CitiesList from "./CitiesList";
import GooglePlacesSearch from "./GooglePlacesSearch";
import themeStyle from "../../styles/theme.style";
import { useTranslation } from "react-i18next";
import { DIALOG_EVENTS } from "../../consts/events";

interface AddressFormProps {
  address?: any;
  onSuccess?: () => void;
}

const AddressForm = observer(({ route,address }: any) => {
  const { t } = useTranslation();


  const { userDetailsStore, addressStore } = useContext(StoreContext);
  const [selectedCity, setSelectedCity] = useState(null);
  const [customerId, setCustomerId] = useState<string | undefined>(undefined);
  useEffect(() => {
    if (userDetailsStore?.userDetails?.phone) {
      setCustomerId(userDetailsStore?.userDetails?.customerId);
    }
  }, [userDetailsStore?.userDetails?.phone]);
  const [formData, setFormData] = useState({
    name: "",
    street: "",
    city: "",
    streetNumber: "",
    floorNumber: "",
    isDefault: false,
    location: {
      type: "Point",
      coordinates: [0, 0],
    },
    selectedCity: null,
  });

  const [loading, setLoading] = useState(false);

  useEffect(() => {
    console.log("addressEEEEE", address);
    if (address) {
      setFormData(address);
    }
  }, [address]);

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handlePlaceSelected = (data: any, details: any) => {
    console.log("data", data);
    console.log("details", details);

    if (!details) return;
    const addressComponents = details.address_components || [];
    const getComponent = (type: string) => {
      const comp = addressComponents.find((c: any) => c.types.includes(type));
      return comp ? comp.long_name : "";
    };
    setFormData((prev) => ({
      ...prev,
      street: getComponent("route") || details.name || "",
      streetNumber: getComponent("street_number") || "",
      city:
        getComponent("locality") ||
        getComponent("administrative_area_level_2") ||
        "",
      location: {
        type: "Point",
        coordinates: [
          details.geometry?.location?.lng || 0,
          details.geometry?.location?.lat || 0,
        ],
      },
    }));
  };

  const getCurrentLocation = async () => {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") {
        Alert.alert(
          "Permission Denied",
          "Location permission is required to get your current location"
        );
        return;
      }

      setLoading(true);
      const location = await Location.getCurrentPositionAsync({});
      const { latitude, longitude } = location.coords;

      // Get address from coordinates
      const [address] = await Location.reverseGeocodeAsync({
        latitude,
        longitude,
      });

      if (address) {
        setFormData((prev) => ({
          ...prev,
          street: address.street || "",
          city: address.city || "",

          location: {
            type: "Point",
            coordinates: [longitude, latitude],
          },
        }));
      }
    } catch (error) {
      Alert.alert("Error", "Failed to get current location");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async () => {
    if ((!formData.name) || !formData.street) {
      Alert.alert("Error", "Please fill in all required fields");
      return;
    }
    setLoading(true);
    console.log("formData", formData.location);
    const [lng, lat] = address ? address.location.coordinates : formData.location.coordinates;
    const location = { lat, lng };  
    try {
      addressStore.getLocationSupported(location).then(async (res: any) => {
        console.log("res", res);
        if (res.available) {
          if (address) {
            console.log("updateAddress", address);
            await addressStore.updateAddress(customerId, address._id, formData);
            DeviceEventEmitter.emit(
              `${DIALOG_EVENTS.OPEN_NEW_ADDRESS_BASED_EVENT_DIALOG}_HIDE`
            );
          } else {
            console.log("addAddress", formData);

            await addressStore.addAddress(customerId, formData);
            DeviceEventEmitter.emit(
              `${DIALOG_EVENTS.OPEN_NEW_ADDRESS_BASED_EVENT_DIALOG}_HIDE`
            );
          }
        } else {
          Alert.alert("Error", t("location-not-supported"));
        }
      });
    } catch (error) {
      console.log("error", error);
      Alert.alert("Error", "Failed to save address");
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      keyboardVerticalOffset={0}
    >
      <ScrollView
        style={styles.container}
        contentContainerStyle={{ flexGrow: 1 }}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.form}>
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              marginBottom: 24,
            }}
          >
            <Text style={{ fontSize: 16, fontWeight: "bold" }}>
              {t("new-address")}
            </Text>
          </View>
          <View style={styles.inputGroup}>
            <Text style={styles.label}>{t("address-name")} *</Text>
            <TextInput
              style={styles.input}
              value={formData.name}
              onChangeText={(value) => handleInputChange("name", value)}
              placeholder={t("address-name-placeholder")}
            />
          </View>
          {/* Google Places Autocomplete */}
          <TouchableOpacity
            style={styles.locationButton}
            onPress={getCurrentLocation}
            disabled={loading}
          >
            <Icon name="my-location" size={20} color={themeStyle.PRIMARY_COLOR} />
            <Text style={styles.locationButtonText}>
              {t("user-current-location")}
            </Text>
          </TouchableOpacity>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>{t("street-address")}</Text>
            <GooglePlacesSearch onPlaceSelected={handlePlaceSelected} />

            {/* <TextInput
              style={styles.input}
              value={formData.street}
              onChangeText={(value) => handleInputChange('street', value)}
              placeholder="Enter street address"
            /> */}
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>{t("city")}</Text>
            <TextInput
              style={styles.input}
              value={formData.city}
              onChangeText={(value) => handleInputChange("city", value)}
            />
          </View>

          <View style={styles.row}>
            <View style={[styles.inputGroup, { flex: 1, marginRight: 8 }]}>
              <Text style={styles.label}>{t("street-number")}</Text>
              <TextInput
                style={styles.input}
                value={formData.streetNumber}
                onChangeText={(value) => handleInputChange("streetNumber", value)}
              />
            </View>

            {/* <View style={[styles.inputGroup, { flex: 1, marginLeft: 8 }]}>
              <Text style={styles.label}>State *</Text>
              <TextInput
                style={styles.input}
                value={formData.streetNumber}
                onChangeText={(value) => handleInputChange('streetNumber', value)}
                placeholder="Enter state"
              />
            </View> */}
          </View>

          {/* <CitiesList
            onCitySelect={(value) => handleInputChange("selectedCity", value)}
            selectedCity={formData.selectedCity}
          /> */}
          <TouchableOpacity
            style={styles.defaultToggle}
            onPress={() => handleInputChange("isDefault", !formData.isDefault)}
          >
            <Icon
              name={formData.isDefault ? "star" : "star-border"}
              size={24}
              color={formData.isDefault ? "#FFD700" : "#666"}
            />
            <Text style={styles.defaultText}>{t('set-as-default-address')}</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.submitButton}
            onPress={handleSubmit}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.submitButtonText}>
                {address ? t('update-address') : t('add-address')}
              </Text>
            )}
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
});

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: themeStyle.WHITE_COLOR,
  },
  form: {
    paddingHorizontal: 10,
  },
  inputGroup: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: "600",
    color: "#333",
    marginBottom: 8,
    textAlign: "left",
  },
  input: {
    backgroundColor: "#fff",
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    borderWidth: 1,
    borderColor: "#ddd",
    textAlign: "right",
  },
  row: {
    flexDirection: "row",
    marginBottom: 16,
  },
  locationButton: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 10,
    marginTop: -5,
  },
  locationButtonText: {
    marginLeft: 8,
    color: themeStyle.PRIMARY_COLOR,
    fontSize: 16,
  },
  defaultToggle: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 24,
    padding: 12,
    backgroundColor: "#fff",
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#ddd",
  },
  defaultText: {
    marginLeft: 8,
    fontSize: 16,
    color: "#333",
  },
  submitButton: {
    backgroundColor: "#007AFF",
    padding: 16,
    borderRadius: 8,
    alignItems: "center",
  },
  submitButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
});

export default AddressForm;
