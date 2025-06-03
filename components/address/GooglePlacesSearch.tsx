import React, { useContext } from 'react';
import { View, StyleSheet } from 'react-native';
import { GooglePlacesAutocomplete } from 'react-native-google-places-autocomplete';
import { StoreContext } from '../../stores';

const GOOGLE_PLACES_API_KEY = 'YOUR_GOOGLE_API_KEY'; // Replace with your key

const GooglePlacesSearch = ({ onPlaceSelected }) =>{
    const { shoofiAdminStore } = useContext(StoreContext);
    const GOOGLE_PLACES_API_KEY = shoofiAdminStore.storeData.GOOGLE_API_KEY;

    return (
        <View style={styles.container}>
          <GooglePlacesAutocomplete
            placeholder="חפש כתובת"
            onPress={(data, details = null) => {
              onPlaceSelected && onPlaceSelected(data, details);
            }}
            fetchDetails={true}
            query={{
              key: GOOGLE_PLACES_API_KEY,
              language: 'iw', // Hebrew
              components: 'country:il', // Only Israel
            }}
            enablePoweredByContainer={false}
            styles={{
              textInput: styles.textInput,
            }}
          />
        </View>
      );
} 

const styles = StyleSheet.create({
  container: {
    width: '100%',
    zIndex: 10,
  },
  textInput: {
    height: 44,
    borderRadius: 8,
    paddingHorizontal: 12,
    fontSize: 16,
    backgroundColor: '#fff',
    borderColor: '#ddd',
    borderWidth: 1,
  },
});

export default GooglePlacesSearch; 