import React from "react";
import { View, Text } from "react-native";
import RadioGroup from "./RadioGroup";
import CheckboxGroup from "./CheckboxGroup";
import Counter from "./Counter";
import { Extra } from "./ExtrasSection";

export type ExtraGroupProps = {
  extra: Extra;
  value: any;
  onChange: (value: any) => void;
};

const ExtraGroup = ({ extra, value, onChange }: ExtraGroupProps) => {
  console.log("ExtraGroup value:", value);
  return (
    <View style={{ marginBottom: 20,}}>
      <View style={{flexDirection: "row",marginBottom: 10}}>
        <Text style={{ fontWeight: "bold", fontSize: 16,textAlign: "right"  }}>{extra.title}</Text>
      </View>
      {extra.type === "single" && extra.options && (
        <RadioGroup options={extra.options} value={value} onChange={onChange} />
      )}
      {extra.type === "multi" && extra.options && (
        <CheckboxGroup options={extra.options} value={value} onChange={onChange} min={extra.min} max={extra.max} />
      )}
      {extra.type === "counter" && (
        <Counter value={value || 0} min={extra.min} max={extra.max} onChange={onChange} price={extra.price} />
      )}
    </View>
  );
};

export default ExtraGroup; 