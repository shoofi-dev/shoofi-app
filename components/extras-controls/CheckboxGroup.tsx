import React from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";

export type CheckboxGroupProps = {
  options: { id: string; name: string; price?: number }[];
  value: string[];
  onChange: (value: string[]) => void;
  min?: number;
  max?: number;
};

const CheckboxGroup = ({
  options,
  value = [],
  onChange,
  min,
  max,
}: CheckboxGroupProps) => {
  const toggle = (id: string) => {
    let newValue = value.includes(id)
      ? value.filter((v) => v !== id)
      : [...value, id];
    if (max && newValue.length > max) return;
    onChange(newValue);
  };
  return (
    <View style={styles.optionsRow}>
      {options.map((opt) => {
        const selected = value.includes(opt.id);
        return (
          <TouchableOpacity
            key={opt.id}
            onPress={() => toggle(opt.id)}
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
};

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

export default CheckboxGroup;
