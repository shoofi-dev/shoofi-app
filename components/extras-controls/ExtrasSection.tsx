import React from "react";
import { View } from "react-native";
import ExtraGroup from "./ExtraGroup";

export type Extra = {
  id: string;
  type: "single" | "multi" | "counter";
  title: string;
  required?: boolean;
  min?: number;
  max?: number;
  options?: { id: string; name: string; price?: number }[];
  price?: number; // for counter
};

export type ExtrasSectionProps = {
  extras: Extra[];
  selections: Record<string, any>;
  onChange: (extraId: string, value: any) => void;
};

const ExtrasSection = ({ extras, selections, onChange }: ExtrasSectionProps) => (
  <View>
    {extras.map((extra) => (
      <ExtraGroup
        key={extra.id}
        extra={extra}
        value={selections[extra.id]}
        onChange={(val) => onChange(extra.id, val)}
      />
    ))}
  </View>
);

export default ExtrasSection; 