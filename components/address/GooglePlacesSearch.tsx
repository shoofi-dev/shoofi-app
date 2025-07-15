import React, { useContext, useRef, useEffect } from 'react';
import { View, StyleSheet, TextInput, TouchableOpacity } from 'react-native';
import { GooglePlacesAutocomplete } from 'react-native-google-places-autocomplete';
import { StoreContext } from '../../stores';
import { useTranslation } from 'react-i18next';
import Icon from 'react-native-vector-icons/MaterialIcons';

interface FormData {
  street?: string;
  city?: string;
  streetNumber?: string;
  [key: string]: any;
}

interface GooglePlacesSearchProps {
  onPlaceSelected: (data: any, details: any) => void;
  formData: FormData;
}

const GooglePlacesSearch = ({ onPlaceSelected, formData }: GooglePlacesSearchProps) => {
  const { t } = useTranslation();
  const { shoofiAdminStore, languageStore } = useContext(StoreContext);
  const GOOGLE_PLACES_API_KEY = shoofiAdminStore.storeData.GOOGLE_API_KEY;

  const placesRef = useRef<any>(null);

  const handleClear = () => {
    if (placesRef.current) {
      placesRef.current.clear();
    }
    onPlaceSelected && onPlaceSelected({ description: '' }, null);
  };

  if (!GOOGLE_PLACES_API_KEY) {
    console.warn('Google Places API key is not available');
  }

  return (
    <View style={styles.container}>
      {GOOGLE_PLACES_API_KEY ? (
        <View style={styles.inputContainer}>
          <GooglePlacesAutocomplete
            ref={placesRef}
            placeholder={''}
            onPress={(data, details = null) => {
              onPlaceSelected && onPlaceSelected(data, details);
            }}
            fetchDetails={true}
            query={{
              key: GOOGLE_PLACES_API_KEY,
              language: languageStore.selectedLang, // Hebrew
              components: 'country:il', // Only Israel
            }}
            enablePoweredByContainer={false}
            styles={{
              textInput: styles.textInput,
            }}
            textInputProps={{
              value: formData.street || '',
              onChangeText: (text) => {
                onPlaceSelected && onPlaceSelected({ description: text }, null);
              },
              clearButtonMode: 'never',
              placeholder: t('enter-street-address'),
            }}
          />
          {formData.street && formData.street.length > 0 && (
            <TouchableOpacity style={styles.clearButton} onPress={handleClear}>
              <Icon name="close" size={20} color="#666" />
            </TouchableOpacity>
          )}
        </View>
      ) : (
        <View style={styles.inputContainer}>
          <TextInput
            style={styles.textInput}
            value={formData.street || ''}
            onChangeText={(text) => {
              onPlaceSelected && onPlaceSelected({ description: text }, null);
            }}
            placeholder={t('enter-street-address')}
          />
          {formData.street && formData.street.length > 0 && (
            <TouchableOpacity style={styles.clearButton} onPress={handleClear}>
              <Icon name="close" size={20} color="#666" />
            </TouchableOpacity>
          )}
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
    zIndex: 10,
  },
  inputContainer: {
    position: 'relative',
  },
  textInput: {
    height: 44,
    borderRadius: 8,
    paddingHorizontal: 12,
    fontSize: 16,
    backgroundColor: '#fff',
    borderColor: '#ddd',
    borderWidth: 1,
    textAlign: 'right',
  },
  clearButton: {
    position: 'absolute',
    right: 12,
    top: 12,
    zIndex: 1,
    padding: 2,
  },
});

export default GooglePlacesSearch; 