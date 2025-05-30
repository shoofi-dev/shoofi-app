import React from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { Extra, PizzaToppingOption, AreaOption } from "./ExtrasSection";

export type PizzaToppingGroupProps = {
  extra: Extra;
  value: Record<string, string>; // { [toppingId]: areaId }
  onChange: (value: Record<string, string>) => void;
};

const PizzaToppingGroup = ({ extra, value, onChange }: PizzaToppingGroupProps) => {
  const handleAreaSelect = (toppingId: string, areaId: string) => {
    const newValue = { ...value };
    if (newValue[toppingId] === areaId) {
      delete newValue[toppingId]; // Deselect if already selected
    } else {
      newValue[toppingId] = areaId;
    }
    onChange(newValue);
  };

  const getSelectedArea = (toppingId: string) => value[toppingId];

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{extra.title}</Text>
      <View style={styles.toppingsContainer}>
        {extra.options?.map((topping: PizzaToppingOption) => (
          <View key={topping.id} style={styles.toppingRow}>
            {/* <Text style={styles.toppingName}>{topping.name}</Text> */}
  
            <View style={styles.areaSelector}>
              {topping.areaOptions?.map((area: AreaOption) => (
                <TouchableOpacity
                  key={area.id}
                  style={[
                    styles.areaButton,
                    getSelectedArea(topping.id) === area.id && styles.selectedAreaButton
                  ]}
                  onPress={() => handleAreaSelect(topping.id, area.id)}
                >
                  <Text style={[
                    styles.areaButtonText,
                    getSelectedArea(topping.id) === area.id && styles.selectedAreaButtonText
                  ]}>
                    {area.name} {area.price ? `(+${area.price})` : ""}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        ))}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 20,
  },
  title: {
    fontWeight: "bold",
    fontSize: 16,
    textAlign: "left",
    marginBottom: 10,
  },
  toppingsContainer: {
    flexDirection: "column",
    gap: 12,
  },
  toppingRow: {
    marginBottom: 10,
  },
  toppingName: {
    fontWeight: "bold",
    fontSize: 15,
    marginBottom: 6,
  },
  areaSelector: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  areaButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    backgroundColor: "#f0f0f0",
    marginRight: 6,
    marginBottom: 4,
  },
  selectedAreaButton: {
    backgroundColor: "#007AFF",
  },
  areaButtonText: {
    color: "#333",
  },
  selectedAreaButtonText: {
    color: "#fff",
  },
});

export default PizzaToppingGroup; 