import React from "react";
import { View, Text, TouchableOpacity } from "react-native";

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
  console.log("CheckboxGroup value:", value);

  const toggle = (id: string) => {
    let newValue = value.includes(id)
      ? value.filter((v) => v !== id)
      : [...value, id];
    if (max && newValue.length > max) return;
    onChange(newValue);
  };
  return (
    <View>
      {options.map((opt) => (
        <TouchableOpacity
          key={opt.id}
          onPress={() => toggle(opt.id)}
          style={{
            flexDirection: "row",
            alignItems: "center",
            marginVertical: 5,
          }}
        >
          <View
            style={{
              width: 20,
              height: 20,
              borderRadius: 4,
              borderWidth: 2,
              borderColor: value.includes(opt.id) ? "#007aff" : "#ccc",
              alignItems: "center",
              justifyContent: "center",
              marginRight: 10,
            }}
          >
            {value.includes(opt.id) && (
              <View
                style={{
                  width: 12,
                  height: 12,
                  borderRadius: 2,
                  backgroundColor: "#007aff",
                }}
              />
            )}
          </View>
          <Text>
            {opt.name}
            {opt.price ? ` +₪${opt.price}` : ""}
          </Text>
        </TouchableOpacity>
      ))}
      <View style={{ flexDirection: "row", marginTop: 10 }}>
        {!!max && (
          <Text style={{ color: "#888", fontSize: 12, textAlign: "left" }}>
            Choose up to {max} items
          </Text>
        )}
        {!!min && (
          <Text style={{ color: "#888", fontSize: 12, textAlign: "left" }}>
            Choose at least {min} items
          </Text>
        )}
      </View>
    </View>
  );
};

export default CheckboxGroup;
