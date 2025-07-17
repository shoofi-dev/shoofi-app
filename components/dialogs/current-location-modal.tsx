import React, { useState, useEffect } from "react";
import { View, StyleSheet, DeviceEventEmitter, TouchableOpacity } from "react-native";
import Modal from "react-native-modal";
import { observer } from "mobx-react";
import { useTranslation } from "react-i18next";
import * as Animatable from "react-native-animatable";

import { useLocation } from "../../hooks/useLocation";
import Text from "../controls/Text";
import Button from "../controls/button/button";
import Icon from "../icon";
import themeStyle from "../../styles/theme.style";
import { getCurrentLang } from "../../translations/i18n";
import { DIALOG_EVENTS } from "../../consts/events";
import { MapViewCurrentLocation } from "../address/map-view/current-location";

const DEFAULT_REGION = { latitude: 32.0853, longitude: 34.7818, latitudeDelta: 0.01, longitudeDelta: 0.01 };

const CurrentLocationModal = () => {
  const { t } = useTranslation();
  const [visible, setVisible] = useState(false);
  const [region, setRegion] = useState(DEFAULT_REGION);
  const {
    latitude,
    longitude,
    errorMsg,
    isLoading,
    requestLocationPermission,
    getCurrentLocation,
  } = useLocation();

  useEffect(() => {
    const subscription = DeviceEventEmitter.addListener(
      DIALOG_EVENTS.OPEN_CURRENT_LOCATION_MODAL,
      openModal
    );
    return () => {
      subscription.remove();
    };
  }, []);

  useEffect(() => {
    if (visible) {
      requestLocationPermission();
    }
  }, [visible]);

  // When GPS is obtained, update region
  useEffect(() => {
    if (latitude && longitude) {
      setRegion({
        latitude,
        longitude,
        latitudeDelta: 0.01,
        longitudeDelta: 0.01,
      });
      
    }
  }, [latitude, longitude]);

  const openModal = () => {
    setVisible(true);
  };

  const hideModal = () => {
    setVisible(false);
  };

  const handleRefreshLocation = () => {
    getCurrentLocation();
  };

  // Real-time region update while dragging
  const handleRegionChange = (region) => {
    console.log('handleRegionChange called with:', region);
    setRegion(region);
  };

  const handleResetToGPS = () => {
    if (latitude && longitude) {
      setRegion({
        latitude,
        longitude,
        latitudeDelta: 0.01,
        longitudeDelta: 0.01,
      });
    }
  };

  const handleConfirmLocation = () => {
    console.log('CurrentLocationModal: Emitting location data:', { lat: region.latitude, lng: region.longitude });
    // DeviceEventEmitter.emit(
    //   `${DIALOG_EVENTS.OPEN_CURRENT_LOCATION_MODAL}_LOCATION_SELECTED`,
    //   { lat: region.latitude, lng: region.longitude }
    // );
    hideModal();
    // Add a small delay to ensure location data is processed before opening the new address modal
    setTimeout(() => {
      console.log('CurrentLocationModal: Emitting OPEN_NEW_ADDRESS_BASED_EVENT_DIALOG');
      DeviceEventEmitter.emit(DIALOG_EVENTS.OPEN_NEW_ADDRESS_BASED_EVENT_DIALOG,  { lat: region.latitude, lng: region.longitude });
    }, 400);
  };

  const locationData = { lat: region.latitude, lng: region.longitude };

  // Check if location has been manually adjusted
  const isLocationAdjusted = latitude && longitude &&
    (Math.abs(region.latitude - latitude) > 0.0001 ||
     Math.abs(region.longitude - longitude) > 0.0001);
console.log('region1', region);
  return (
    <Modal
      isVisible={visible}
      onBackdropPress={hideModal}
      onBackButtonPress={hideModal}
      style={styles.modal}
      animationIn="slideInUp"
      animationOut="slideOutDown"
      backdropOpacity={0.5}
    >
      <View style={styles.container}>
        {/* <View style={styles.header}>
          <View style={styles.backButton} />
          <Text style={styles.title}>{t('current-location')}</Text>
          <View style={styles.closeButton} onTouchEnd={hideModal}>
            <Icon icon="x-close" size={24} color={themeStyle.PRIMARY_COLOR} />
          </View>
          <Text style={styles.coordinatesText}>
            {t('latitude')}: {locationData.lat.toFixed(6)}
          </Text>
          <Text style={styles.coordinatesText}>
            {t('longitude')}: {locationData.lng.toFixed(6)}
          </Text>
        </View> */}
        <View style={styles.content}>
          {isLoading ? (
            <View style={styles.centerContainer}>
              <Text style={styles.loadingText}>{t('getting-location')}</Text>
            </View>
          ) : errorMsg ? (
            <View style={styles.centerContainer}>
              <Text style={styles.errorText}>{errorMsg}</Text>
              <Button
                onClickFn={requestLocationPermission}
                text={t('try-again')}
                bgColor={themeStyle.PRIMARY_COLOR}
                textColor={themeStyle.SECONDARY_COLOR}
                borderRadious={8}
              />
            </View>
          ) : (
            <View style={styles.mapContainer}>
              <MapViewCurrentLocation
                region={region}
                onRegionChangeComplete={handleRegionChange}
                draggable={false}
              />

              <TouchableOpacity onPress={handleResetToGPS} style={styles.resetButtonContainer}>
                <Icon icon="current-location2" size={30} color={themeStyle.PRIMARY_COLOR} />
                </TouchableOpacity>
       
 
                <View style={styles.buttonContainer}>
                  <Button
                    onClickFn={handleConfirmLocation}
                    text={t('confirm-location')}
                    bgColor={themeStyle.PRIMARY_COLOR}
                    textColor={themeStyle.SECONDARY_COLOR}
                    marginH={5}
                    fontSize={themeStyle.FONT_SIZE_LG}
                    
                  />
           
              </View>
            </View>
          )}
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modal: {
    margin: 0,
    height: "100%",
    width: "100%",
  },
  container: {
    backgroundColor: themeStyle.WHITE_COLOR,
    width: "100%",
    height: "100%",
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 20,
    backgroundColor: themeStyle.WHITE_COLOR,
    borderBottomWidth: 1,
    borderBottomColor: themeStyle.GRAY_10,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
  },
  backButton: {
    width: 40,
    height: 40,
  },
  closeButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    color: themeStyle.PRIMARY_COLOR,
    fontFamily: `${getCurrentLang()}-Bold`,
  },
  content: {
    height: "100%",
    width: "100%",
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  mapContainer: {
    flex: 1,
    height: "100%",
    width: "100%",
  },
  locationInfo: {
    backgroundColor: themeStyle.GRAY_10,
    padding: 15,
    borderRadius: 8,
    marginTop: 20,
    marginBottom: 20,
    marginHorizontal: 20,
  },
  dragInstructionText: {
    fontSize: 14,
    color: themeStyle.PRIMARY_COLOR,
    marginBottom: 10,
    textAlign: 'center',
    fontFamily: `${getCurrentLang()}-Medium`,
    fontStyle: 'italic',
  },
  adjustedIndicator: {
    fontSize: 12,
    color: themeStyle.SUCCESS_COLOR,
    marginBottom: 10,
    textAlign: 'center',
    fontFamily: `${getCurrentLang()}-Medium`,
    fontWeight: 'bold',
  },
  coordinatesText: {
    fontSize: 14,
    color: themeStyle.SECONDARY_COLOR,
    marginBottom: 5,
    fontFamily: `${getCurrentLang()}-Medium`,
  },
  loadingText: {
    fontSize: 16,
    color: themeStyle.PRIMARY_COLOR,
    textAlign: 'center',
    fontFamily: `${getCurrentLang()}-Medium`,
  },
  errorText: {
    fontSize: 16,
    color: themeStyle.ERROR_COLOR,
    textAlign: 'center',
    marginBottom: 20,
    fontFamily: `${getCurrentLang()}-Medium`,
  },
  noLocationText: {
    fontSize: 16,
    color: themeStyle.PRIMARY_COLOR,
    textAlign: 'center',
    marginBottom: 20,
    fontFamily: `${getCurrentLang()}-Medium`,
  },
  buttonContainer: {
    position: 'absolute',
    bottom:50,
    left: 20,
    right: 20,
 
  },
  resetButtonContainer: {
    position: 'absolute',
    bottom:200,
    left: 20,
    right: 0,
    backgroundColor: themeStyle.WHITE_COLOR,
    width: 56,
    height: 56,
    borderRadius: 50,
    alignItems: 'center',
    justifyContent: 'center',
 
  },
});

export default observer(CurrentLocationModal); 