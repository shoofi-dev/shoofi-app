import React, { useState, useEffect, useContext } from "react";
import {
  View,
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
import * as Location from "expo-location";
import { StoreContext } from "../../stores";
import CitiesList from "./CitiesList";
import GooglePlacesSearch from "./GooglePlacesSearch";
import themeStyle from "../../styles/theme.style";
import { useTranslation } from "react-i18next";
import { DIALOG_EVENTS } from "../../consts/events";
import Text from "../controls/Text";
import Icon from "../icon";
import Icon2 from "react-native-vector-icons/MaterialIcons";
interface AddressFormProps {
  address?: any;
  onSuccess?: () => void;
  locationData?: any;
}

const AddressForm = observer(({ route, address, locationData, onClose }: any) => {
  const { t } = useTranslation();

  const { userDetailsStore, addressStore, shoofiAdminStore, storeDataStore } = useContext(StoreContext);
  const [selectedCity, setSelectedCity] = useState(null);
  const [customerId, setCustomerId] = useState<string | undefined>(undefined);
  const [errors, setErrors] = useState<{[key: string]: string}>({});
  // useEffect(() => {
  //   getCurrentLocation()
  // }, [address])

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
    isDefault: true,
    location: {
      type: "Point",
      coordinates: [0, 0],
    },
    selectedCity: null,
  });

  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (address) {
      setFormData(address);
    }
  }, [address]);

  // Handle locationData prop when provided
  useEffect(() => {
    if (locationData && locationData.lat && locationData.lng) {
      console.log('AddressForm: Received locationData prop:', locationData);
      setFormData((prev) => ({
        ...prev,
        location: {
          type: "Point",
          coordinates: [locationData.lng, locationData.lat],
        },
      }));
      
      // Get address details using reverseGeocodeAsync
      getAddressFromCoordinates(locationData.lat, locationData.lng);
    }
  }, [locationData]);

  const getAddressFromCoordinates = async (latitude: number, longitude: number) => {
    try {
      setLoading(true);
      
      // First try Expo's reverse geocoding
      const [expoAddress] = await Location.reverseGeocodeAsync({
        latitude,
        longitude,
      });

      let streetAddress = "";
      let cityAddress = "";
      let streetNumber = "";
      console.log("expoAddress",expoAddress)
      // Check if Expo provided street information
      if (expoAddress && expoAddress.street && false) {
        streetAddress = expoAddress.street;
        cityAddress = expoAddress.city || "";
        streetNumber = expoAddress.streetNumber || "";
      } else {
        // Fallback: Use Google Geocoding API for better results
        try {
          const googleApiKey = shoofiAdminStore.storeData.GOOGLE_API_KEY;
          const response = await fetch(
            `https://maps.googleapis.com/maps/api/geocode/json?latlng=${latitude},${longitude}&key=${googleApiKey}`
          );
          const data = await response.json();

          if (data.results && data.results.length > 0) {
            const addressComponents = data.results[0].address_components;
            // Extract street name
            const routeComponent = addressComponents.find((component: any) =>
              component.types.includes("route")
            );
            streetAddress = routeComponent ? routeComponent.long_name : "";

            // Extract city
            const localityComponent = addressComponents.find((component: any) =>
              component.types.includes("locality")
            );
            cityAddress = localityComponent ? localityComponent.long_name : "";

            const streetNumberComponent = addressComponents.find((component: any) =>
              component.types.includes("street_number")
            );
            streetNumber = streetNumberComponent ? streetNumberComponent.long_name : "";

            // If still no street, try using the formatted address
            if (!streetAddress) {
              const formattedAddress = data.results[0].formatted_address;
              // Extract street from formatted address (basic parsing)
              const addressParts = formattedAddress.split(",");
              streetAddress = addressParts[0] || "";
            }
          }
        } catch (googleError) {
          // If Google API fails, use whatever Expo provided
          streetAddress = expoAddress?.street || "";
          cityAddress = expoAddress?.city || "";
          streetNumber = expoAddress?.streetNumber || "";
        }
      }

      // Update form with the address data
      setFormData((prev) => ({
        ...prev,
        street: streetAddress,
        city: cityAddress,
        streetNumber: streetNumber || "",
      }));
    } catch (error) {
      console.error("Reverse geocoding error:", error);
      setError("location", "Failed to get address from coordinates");
    } finally {
      setLoading(false);
    }
  };

  // Listen for location selection from the modal
  useEffect(() => {
    const subscription = DeviceEventEmitter.addListener(
      `${DIALOG_EVENTS.OPEN_CURRENT_LOCATION_MODAL}_LOCATION_SELECTED`,
      handleLocationSelected
    );
    return () => {
      subscription.remove();
    };
  }, []);

  const clearErrors = () => {
    setErrors({});
  };

  const setError = (field: string, message: string) => {
    setErrors((prev) => ({
      ...prev,
      [field]: message,
    }));
  };

  const handleInputChange = (field: string, value: string) => {
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }

    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handlePlaceSelected = (data: any, details: any) => {
    if (details) {
      // Handle Google Places selection with details
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
    } else if (data?.description) {
      // Only update if the value is different
      setFormData((prev) => {
        if (prev.street === data.description) return prev;
        return { ...prev, street: data.description };
      });
    }
  };

  const getCurrentLocation = async () => {
    onClose();
    setTimeout(() => {
      // Emit event to open the current location modal
      DeviceEventEmitter.emit(DIALOG_EVENTS.OPEN_CURRENT_LOCATION_MODAL);
    }, 400);
  };

  const handleLocationSelected = (locationData: any) => {
    // Handle location selection from CurrentLocationModal
    if (locationData && locationData.lat && locationData.lng) {
      setFormData((prev) => ({
        ...prev,
        location: {
          type: "Point",
          coordinates: [locationData.lng, locationData.lat],
        },
      }));
    }
  };

  const handleSubmit = async () => {
    clearErrors();

    // Validate required fields
    if (!formData.name) {
      setError("name", t("address-name-required"));
      return;
    }

    if (!formData.street) {
      setError("street", t("street-address-required"));
      return;
    }

    setLoading(true);
    const [lng, lat] = address
      ? address.location.coordinates
      : formData.location.coordinates;
    const location = { lat, lng };
    try {
      addressStore.getLocationSupported(location).then(async (res: any) => {
        if (res.available) {
          if (address) {
            await addressStore.updateAddress(customerId, address._id, formData);
            DeviceEventEmitter.emit(
              `${DIALOG_EVENTS.OPEN_NEW_ADDRESS_BASED_EVENT_DIALOG}_HIDE`
            );
          } else {
            const newAddress = await addressStore.addAddress(customerId, formData);
            
            // Immediately trigger delivery price calculation for new addresses
            if (newAddress && newAddress.location && newAddress.location.coordinates) {
              const [newLng, newLat] = newAddress.location.coordinates;
              const customerLocation = { lat: newLat, lng: newLng };
              
              let storeLocation = undefined;
              if (storeDataStore.storeData?.location) {
                const { lat: storeLat, lng: storeLng } = storeDataStore.storeData.location;
                storeLocation = { lat: storeLat, lng: storeLng };
              }
              
              console.log('AddressForm: Triggering delivery price calculation for new address:', customerLocation);
              // Trigger delivery price calculation immediately
              shoofiAdminStore.fetchAvailableDrivers(customerLocation, storeLocation);
            } else {
              console.log('AddressForm: New address data incomplete:', newAddress);
            }
            
            DeviceEventEmitter.emit(
              `${DIALOG_EVENTS.OPEN_NEW_ADDRESS_BASED_EVENT_DIALOG}_HIDE`
            );
          }
        } else {
          setError("location", t("location-not-supported"));
        }
      });
    } catch (error) {
      setError("general", t("failed-to-save-address"));
    } finally {
      setLoading(false);
    }
  };

  return (
    <View>
      <ScrollView
        style={styles.container}
        contentContainerStyle={{ flexGrow: 1 }}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.form}>
          <View style={[styles.inputGroup, { marginBottom: 20 }]}>
            <Text style={styles.label}>{t("address-name")}</Text>
            <TextInput
              style={[styles.input, errors.name && styles.inputError]}
              value={formData.name}
              onChangeText={(value) => handleInputChange("name", value)}
            />
            {errors.name && <Text style={styles.errorText}>{errors.name}</Text>}
          </View>

          {/* Google Places Autocomplete */}
          <View style={styles.row}>
            <TouchableOpacity
              style={styles.locationButton}
              onPress={getCurrentLocation}
              disabled={loading}
            >
              <Icon
                icon="current-location2"
                size={20}
                color={themeStyle.SUCCESS_COLOR}
              />
              <View style={styles.locationButtonTextContainer}>
                <Text style={styles.locationButtonText}>
                  {t("user-current-location")}
                </Text>
              </View>
            </TouchableOpacity>
          </View>

          <View style={[styles.inputGroup, { flex: 1 }]}>
            <Text style={styles.label}>{t("street-address")}</Text>
            <GooglePlacesSearch
              onPlaceSelected={handlePlaceSelected}
              formData={formData}
            />
            {errors.street && (
              <Text style={styles.errorText}>{errors.street}</Text>
            )}
          </View>

          <View style={styles.row}>
            <View style={[styles.inputGroup, { marginRight: 30 }]}>
              <Text style={styles.label}>{t("street-number")}</Text>
              <TextInput
                style={styles.input}
                value={formData.streetNumber}
                onChangeText={(value) =>
                  handleInputChange("streetNumber", value)
                }
              />
            </View>

            <View style={[styles.inputGroup, { flex: 1 }]}>
              <Text style={styles.label}>{t("city")}</Text>
              <TextInput
                style={styles.input}
                value={formData.city}
                onChangeText={(value) => handleInputChange("city", value)}
              />
            </View>
          </View>

          {/* Location error message */}
          {errors.location && (
            <View style={styles.errorContainer}>
              <Text style={styles.errorText}>{errors.location}</Text>
            </View>
          )}

          {/* General error message */}
          {errors.general && (
            <View style={styles.errorContainer}>
              <Text style={styles.errorText}>{errors.general}</Text>
            </View>
          )}

          <TouchableOpacity
            style={styles.defaultToggle}
            onPress={() =>
              handleInputChange("isDefault", (!formData.isDefault).toString())
            }
          >
            <Icon2
              name={formData.isDefault ? "star" : "star-border"}
              size={24}
              color={formData.isDefault ? "#FFD700" : "#666"}
            />
            <View style={styles.defaultTextContainer}>
              <Text style={styles.defaultText}>
                {t("set-as-default-address")}
              </Text>
            </View>
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
                {address ? t("update-address") : t("add-address")}
              </Text>
            )}
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
});

const styles = StyleSheet.create({
  container: {
    backgroundColor: themeStyle.WHITE_COLOR,
  },
  form: {
    paddingHorizontal: 10,
  },
  inputGroup: {
    marginBottom: 16,
  },
  label: {
    fontSize: themeStyle.FONT_SIZE_SM,
    fontWeight: "600",
    color: "#333",
    marginBottom: 8,
  },
  input: {
    backgroundColor: "#fff",
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    borderWidth: 1,
    borderColor: "#ddd",
  },
  inputError: {
    borderColor: "#ff0000",
  },
  errorText: {
    color: "#ff0000",
    fontSize: 12,
    marginTop: 4,
  },
  errorContainer: {
    marginBottom: 16,
    padding: 8,
    backgroundColor: "#ffebee",
    borderRadius: 4,
    borderLeftWidth: 4,
    borderLeftColor: "#ff0000",
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
    color: themeStyle.SUCCESS_COLOR,
    fontSize: themeStyle.FONT_SIZE_SM,
  },
  locationButtonTextContainer: {
    marginLeft: 5,
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
  defaultTextContainer: {
    marginLeft: 8,
  },
  defaultText: {
    marginLeft: 8,
    fontSize: themeStyle.FONT_SIZE_SM,
    color: "#333",
  },
  submitButton: {
    backgroundColor: themeStyle.SUCCESS_COLOR,
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
