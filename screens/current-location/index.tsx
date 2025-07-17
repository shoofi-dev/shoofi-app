import React, { useEffect } from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { observer } from 'mobx-react';
import { useTranslation } from 'react-i18next';

import { useLocation } from '../../hooks/useLocation';
import { MapViewAddress } from '../../components/address/map-view';
import Text from '../../components/controls/Text';
import Button from '../../components/controls/button/button';
import Icon from '../../components/icon';
import themeStyle from '../../styles/theme.style';
import { getCurrentLang } from '../../translations/i18n';

interface CurrentLocationScreenProps {
  onLocationSelected?: (locationData: { lat: number; lng: number }) => void;
  onClose?: () => void;
}

const CurrentLocationScreen = ({ onLocationSelected, onClose }: CurrentLocationScreenProps) => {
  const { t } = useTranslation();
  const {
    latitude,
    longitude,
    errorMsg,
    isLoading,
    requestLocationPermission,
    getCurrentLocation,
  } = useLocation();

  useEffect(() => {
    requestLocationPermission();
  }, []);

  const handleRefreshLocation = () => {
    getCurrentLocation();
  };

  const handleBack = () => {
    onClose && onClose();
  };

  const handleConfirmLocation = () => {
    if (latitude && longitude && onLocationSelected) {
      onLocationSelected({ lat: latitude, lng: longitude });
    }
  };

  const locationData = latitude && longitude ? {
    lat: latitude,
    lng: longitude,
  } : null;

  const regionData = latitude && longitude ? {
    latitude,
    longitude,
    latitudeDelta: 0.01,
    longitudeDelta: 0.01,
  } : null;

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={handleBack}
        >
          <Icon icon="chevron_back" size={24} color={themeStyle.PRIMARY_COLOR} />
        </TouchableOpacity>
        <Text style={styles.title}>{t('current-location')}</Text>
        <View style={{ width: 40 }} />
      </View>

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
              marginH={20}
            />
          </View>
        ) : locationData ? (
          <View style={styles.mapContainer}>
            <MapViewAddress
              region={regionData}
              location={locationData}
            />
            <View style={styles.locationInfo}>
              <Text style={styles.coordinatesText}>
                {t('latitude')}: {latitude.toFixed(6)}
              </Text>
              <Text style={styles.coordinatesText}>
                {t('longitude')}: {longitude.toFixed(6)}
              </Text>
            </View>
            <View style={styles.buttonContainer}>
              <Button
                onClickFn={handleRefreshLocation}
                text={t('refresh-location')}
                bgColor={themeStyle.GRAY_10}
                textColor={themeStyle.PRIMARY_COLOR}
                borderRadious={8}
                marginH={5}
              />
              <Button
                onClickFn={handleConfirmLocation}
                text={t('confirm-location')}
                bgColor={themeStyle.SUCCESS_COLOR}
                textColor={themeStyle.WHITE_COLOR}
                borderRadious={8}
                marginH={5}
              />
            </View>
          </View>
        ) : (
          <View style={styles.centerContainer}>
            <Text style={styles.noLocationText}>{t('no-location-available')}</Text>
            <Button
              onClickFn={requestLocationPermission}
              text={t('get-location')}
              bgColor={themeStyle.PRIMARY_COLOR}
              textColor={themeStyle.SECONDARY_COLOR}
              borderRadious={8}
              marginH={20}
            />
          </View>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: themeStyle.WHITE_COLOR,
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
  },
  backButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 20,
    backgroundColor: themeStyle.GRAY_10,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    color: themeStyle.PRIMARY_COLOR,
    fontFamily: `${getCurrentLang()}-Bold`,
  },
  content: {
    flex: 1,
    padding: 20,
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  mapContainer: {
    flex: 1,
  },
  locationInfo: {
    backgroundColor: themeStyle.GRAY_10,
    padding: 15,
    borderRadius: 8,
    marginTop: 20,
    marginBottom: 20,
  },
  coordinatesText: {
    fontSize: 14,
    color: themeStyle.PRIMARY_COLOR,
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
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 10,
  },
});

export default observer(CurrentLocationScreen); 