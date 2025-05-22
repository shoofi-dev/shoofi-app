import React from "react";
import { View, Text, TouchableOpacity } from "react-native";

export type RadioGroupProps = {
  options: { id: string; name: string; price?: number }[];
  value: string;
  onChange: (value: string) => void;
};

const RadioGroup = ({ options, value, onChange }: RadioGroupProps) => (
  <View>
    {options.map((opt) => (
      <TouchableOpacity key={opt.id} onPress={() => onChange(opt.id)} style={{ flexDirection: "row", alignItems: "center", marginVertical: 5 }}>
        <View style={{ width: 20, height: 20, borderRadius: 10, borderWidth: 2, borderColor: value === opt.id ? "#007aff" : "#ccc", alignItems: "center", justifyContent: "center", marginRight: 10 }}>
          {value === opt.id && <View style={{ width: 12, height: 12, borderRadius: 6, backgroundColor: "#007aff" }} />}
        </View>
        <Text>{opt.name}{opt.price ? ` +₪${opt.price}` : ""}</Text>
      </TouchableOpacity>
    ))}
  </View>
);

export default RadioGroup; 