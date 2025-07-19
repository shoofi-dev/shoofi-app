import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import GlassBG from './index';

const GlassBackgroundExample = () => {
  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Apple Liquid Glass Examples</Text>
      
      {/* Light intensity */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Light Intensity</Text>
        <GlassBG intensity="light" borderRadius={12} style={styles.glassCard}>
          <Text style={styles.cardText}>Light glass effect</Text>
        </GlassBG>
      </View>

      {/* Medium intensity (default) */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Medium Intensity</Text>
        <GlassBG intensity="medium" borderRadius={16} style={styles.glassCard}>
          <Text style={styles.cardText}>Medium glass effect</Text>
        </GlassBG>
      </View>

      {/* Heavy intensity */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Heavy Intensity</Text>
        <GlassBG intensity="heavy" borderRadius={20} style={styles.glassCard}>
          <Text style={styles.cardText}>Heavy glass effect</Text>
        </GlassBG>
      </View>

      {/* Different tints */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Different Tints</Text>
        
        <GlassBG tint="white" style={styles.glassCard}>
          <Text style={styles.cardText}>White tint</Text>
        </GlassBG>
        
        <GlassBG tint="black" style={styles.glassCard}>
          <Text style={styles.cardText}>Black tint</Text>
        </GlassBG>
        
        <GlassBG tint="none" style={styles.glassCard}>
          <Text style={styles.cardText}>No tint</Text>
        </GlassBG>
      </View>

      {/* Custom blur amount */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Custom Blur</Text>
        <GlassBG blurAmount={5} style={styles.glassCard}>
          <Text style={styles.cardText}>Low blur (5)</Text>
        </GlassBG>
        
        <GlassBG blurAmount={20} style={styles.glassCard}>
          <Text style={styles.cardText}>High blur (20)</Text>
        </GlassBG>
      </View>

      {/* Rounded corners */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Rounded Corners</Text>
        <GlassBG borderRadius={8} style={styles.glassCard}>
          <Text style={styles.cardText}>Small radius (8)</Text>
        </GlassBG>
        
        <GlassBG borderRadius={24} style={styles.glassCard}>
          <Text style={styles.cardText}>Large radius (24)</Text>
        </GlassBG>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f0f0f0',
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 30,
    color: '#333',
  },
  section: {
    marginBottom: 30,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 15,
    color: '#333',
  },
  glassCard: {
    height: 80,
    marginBottom: 15,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cardText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#333',
  },
});

export default GlassBackgroundExample; 