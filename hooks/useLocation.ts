import { useState, useEffect } from 'react';
import * as Location from 'expo-location';
import { Alert, Platform, Linking } from 'react-native';

interface LocationState {
  latitude: number | null;
  longitude: number | null;
  errorMsg: string | null;
  isLoading: boolean;
}

interface LocationHookResult extends LocationState {
  requestLocationPermission: () => Promise<void>;
  getCurrentLocation: () => Promise<void>;
}

// Default location (can be set to a common area in your app's region)
const DEFAULT_LOCATION = {
  latitude: 32.0853, // Default to a common location
  longitude: 34.7818,
};

export const useLocation = (): LocationHookResult => {
  const [state, setState] = useState<LocationState>({
    latitude: null,
    longitude: null,
    errorMsg: null,
    isLoading: false,
  });

  const requestLocationPermission = async (): Promise<void> => {
    try {
      setState(prev => ({ ...prev, isLoading: true, errorMsg: null }));
      
      const { status } = await Location.requestForegroundPermissionsAsync();
      
      if (status !== 'granted') {
        setState(prev => ({
          ...prev,
          errorMsg: 'Permission to access location was denied',
          isLoading: false,
        }));
        
        // Show settings alert on iOS
        if (Platform.OS === 'ios') {
          Alert.alert(
            'Location Permission Required',
            'Please enable location services in your device settings to use this feature.',
            [
              { text: 'Cancel', style: 'cancel' },
              { 
                text: 'Open Settings',
                onPress: () => {
                  if (Platform.OS === 'ios') {
                    Linking.openURL('app-settings:');
                  }
                }
              }
            ]
          );
        }
        return;
      }

      await getCurrentLocation();
    } catch (error) {
      setState(prev => ({
        ...prev,
        errorMsg: 'Failed to request location permission',
        isLoading: false,
      }));
    }
  };

  const getCurrentLocation = async (): Promise<void> => {
    try {
      setState(prev => ({ ...prev, isLoading: true, errorMsg: null }));

      // First try with lower accuracy for faster response
      const location = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced, // Faster than High accuracy
        timeInterval: 5000, // 5 second timeout
        distanceInterval: 10, // Update every 10 meters
      });

      setState({
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
        errorMsg: null,
        isLoading: false,
      });
      console.log('GPS Location obtained:', { 
        latitude: location.coords.latitude, 
        longitude: location.coords.longitude 
      });
    } catch (error) {
      // If high accuracy fails, try with lower accuracy
      try {
        const location = await Location.getCurrentPositionAsync({
          accuracy: Location.Accuracy.Low,
          timeInterval: 3000, // 3 second timeout
        });

        setState({
          latitude: location.coords.latitude,
          longitude: location.coords.longitude,
          errorMsg: null,
          isLoading: false,
        });
        console.log('Fallback GPS Location obtained:', { 
          latitude: location.coords.latitude, 
          longitude: location.coords.longitude 
        });
      } catch (fallbackError) {
        setState(prev => ({
          ...prev,
          errorMsg: 'Failed to get current location',
          isLoading: false,
        }));
      }
    }
  };

  useEffect(() => {
    // Check if location services are enabled
    const checkLocationServices = async () => {
      const enabled = await Location.hasServicesEnabledAsync();
      if (!enabled) {
        setState(prev => ({
          ...prev,
          errorMsg: 'Location services are disabled',
        }));
      }
    };

    checkLocationServices();
  }, []);

  return {
    ...state,
    requestLocationPermission,
    getCurrentLocation,
  };
}; 