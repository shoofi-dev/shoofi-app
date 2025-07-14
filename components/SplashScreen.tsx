import React from "react";
import { View, StyleSheet, ScrollView } from "react-native";

const PLACEHOLDER_COLOR = '#e0e0e0';

const SplashScreen = () => {
  return (
    <View style={styles.container}>
      {/* Categories row (gray squares) */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.categoriesRow}
        style={{ marginTop: 0, marginBottom: 24 }}
      >
        {[...Array(5)].map((_, idx) => (
          <View
            key={idx}
            style={styles.categorySquare}
          />
        ))}
      </ScrollView>
      {/* Carousel rectangle */}
      <View style={styles.carouselRect} />
      {/* Store cards row */}
      <View style={styles.storesRow}>
        <View style={styles.storeRect} />
        <View style={styles.storeRect} />
      </View>
      <View style={styles.storesRow}>
        <View style={styles.storeRect} />
        <View style={styles.storeRect} />
      </View>
      <View style={styles.storesRow}>
        <View style={styles.storeRect} />
        <View style={styles.storeRect} />
      </View>
      <View style={styles.storesRow}>
        <View style={styles.storeRect} />
        <View style={styles.storeRect} />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#fff',
    justifyContent: 'flex-start',
  },
  categoriesRow: {
    marginTop: 20,
  },
  categorySquare: {
    width: 68,
    height: 68,
    borderRadius: 20,
    marginHorizontal: 8,
    backgroundColor: PLACEHOLDER_COLOR,
  },
  carouselRect: {
    height: 180,
    backgroundColor: PLACEHOLDER_COLOR,
    borderRadius: 16,
    marginHorizontal: 16,
    marginBottom: 24,
  },
  storesRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginHorizontal: 16,
    marginBottom: 16,
  },
  storeRect: {
    width: '48%',
    height: 120,
    backgroundColor: PLACEHOLDER_COLOR,
    borderRadius: 16,
  },
});

export default SplashScreen; 