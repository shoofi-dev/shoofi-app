import React from "react";
import { View, Text, TouchableOpacity } from "react-native";

export type CounterProps = {
  value: number;
  min?: number;
  max?: number;
  step?: number;
  onChange: (value: number) => void;
  price?: number;
};

const Counter = ({ value, min = 0, max = 10, step = 1, onChange, price }: CounterProps) => {
  return(
<View style={{ flexDirection: "row-reverse", alignItems: "center", width: "100%" }}>
  <View
    style={{
      flexDirection: "row",
      alignItems: "center",
      backgroundColor: "#f7f9fa",
      borderRadius: 999,
      borderWidth: 1,
      borderColor: "#d1d5db",
      paddingHorizontal: 24,
      paddingVertical: 8,
      minWidth: 140,
      justifyContent: "space-between",
    }}
  >
    <TouchableOpacity onPress={() => value - step >= min && onChange(value - step)}>
      <Text style={{ fontSize: 28, color: "#444", fontWeight: "300" }}>−</Text>
    </TouchableOpacity>
    <Text style={{ fontSize: 22, fontWeight: "bold", marginHorizontal: 16, minWidth: 40, textAlign: "center" }}>
      {value}
    </Text>
    <TouchableOpacity onPress={() => value + step <= max && onChange(value + step)}>
      <Text style={{ fontSize: 28, color: "#444", fontWeight: "300" }}>+</Text>
    </TouchableOpacity>
  </View>
  {/* You can render the label and image here if needed */}
</View>
)};

export default Counter; 