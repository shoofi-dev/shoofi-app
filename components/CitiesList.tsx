import React from 'react';
import { View, Text, FlatList, StyleSheet, TouchableOpacity } from 'react-native';

interface City {
  name: string;
  location: {
    lat: string;
    lng: string;
  };
}

interface CitiesListProps {
  cities: City[];
  onCitySelect?: (city: City) => void;
  selectedCity?: City | null;
}

const CitiesList: React.FC<CitiesListProps> = ({ cities, onCitySelect, selectedCity }) => {
  const isSelected = (city: City) => {
    if (!selectedCity) return false;
    return (
      city.name === selectedCity.name &&
      city.location.lat === selectedCity.location.lat &&
      city.location.lng === selectedCity.location.lng
    );
  };

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Cities</Text>
      <FlatList
        data={cities}
        keyExtractor={(_, idx) => idx.toString()}
        renderItem={({ item }) => {
          const selected = isSelected(item);
          return (
            <TouchableOpacity
              style={[styles.cityItem, selected && styles.selectedCityItem]}
              onPress={() => onCitySelect && onCitySelect(item)}
              activeOpacity={0.7}
            >
              <Text style={[styles.cityName, selected && styles.selectedCityName]}>{item.name}</Text>
            </TouchableOpacity>
          );
        }}
        ListEmptyComponent={<Text style={styles.emptyText}>No cities available.</Text>}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 16,
    backgroundColor: '#fff',
    borderRadius: 12,
    margin: 8,
    elevation: 2,
  },
  header: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 12,
    color: '#333',
  },
  cityItem: {
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
    backgroundColor: '#fff',
    borderRadius: 6,
    marginBottom: 4,
  },
  selectedCityItem: {
    backgroundColor: '#e0f7fa',
  },
  cityName: {
    fontSize: 16,
    color: '#222',
  },
  selectedCityName: {
    fontWeight: 'bold',
    color: '#00796b',
  },
  emptyText: {
    textAlign: 'center',
    color: '#888',
    marginTop: 20,
  },
});

export default CitiesList; 