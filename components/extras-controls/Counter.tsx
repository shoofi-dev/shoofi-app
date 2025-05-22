import React from "react";
import { View, Text, TouchableOpacity } from "react-native";

export type CounterProps = {
  value: number;
  min?: number;
  max?: number;
  onChange: (value: number) => void;
  price?: number;
};

const Counter = ({ value, min = 0, max = 10, onChange, price }: CounterProps) => (
  <View style={{ flexDirection: "row", alignItems: "center", marginVertical: 5 }}>
    <TouchableOpacity onPress={() => value > min && onChange(value - 1)} style={{ padding: 10 }}>
      <Text style={{ fontSize: 20 }}>-</Text>
    </TouchableOpacity>
    <Text style={{ marginHorizontal: 10 }}>{value}</Text>
    <TouchableOpacity onPress={() => value < max && onChange(value + 1)} style={{ padding: 10 }}>
      <Text style={{ fontSize: 20 }}>+</Text>
    </TouchableOpacity>
    {price !== undefined && price > 0 && (
      <Text style={{ marginLeft: 10, color: "#888" }}>+₪{price * value}</Text>
    )}
  </View>
);

export default Counter; 