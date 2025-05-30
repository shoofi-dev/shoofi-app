import React from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";

export type RadioGroupProps = {
  options: { id: string; name: string; price?: number }[];
  value: string;
  onChange: (value: string) => void;
};

const RadioGroup = ({ options, value, onChange }: RadioGroupProps) => (
  <View style={styles.optionsRow}>
    {options.map((opt) => {
      const selected = value === opt.id;
      return (
        <TouchableOpacity
          key={opt.id}
          onPress={() => onChange(opt.id)}
          style={[
            styles.optionPill,
            selected && styles.optionPillSelected,
          ]}
        >
          <Text style={[styles.optionText, selected && styles.optionTextSelected]}>
            {opt.name}
            {opt.price ? ` +₪${opt.price}` : ""}
          </Text>
        </TouchableOpacity>
      );
    })}
  </View>
);

const styles = StyleSheet.create({
  optionsRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  optionPill: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: "#f0f0f0",
    marginRight: 8,
    marginBottom: 8,
  },
  optionPillSelected: {
    backgroundColor: "#007aff",
  },
  optionText: {
    color: "#333",
    fontSize: 15,
  },
  optionTextSelected: {
    color: "#fff",
    fontWeight: "bold",
  },
});

export default RadioGroup; 