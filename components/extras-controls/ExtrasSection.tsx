import React from "react";
import { View } from "react-native";
import ExtraGroup from "./ExtraGroup";
import PizzaToppingGroup from "./PizzaToppingGroup";

export type AreaOption = {
  id: string; // e.g. "full", "left", "right"
  name: string;
  price: number;
};

export type PizzaToppingOption = {
  id: string;
  name: string;
  price?: number; // fallback
  areaOptions?: AreaOption[];
};

export type Extra = {
  id: string;
  type: "single" | "multi" | "counter" | "pizza-topping";
  title: string;
  required?: boolean;
  min?: number;
  max?: number;
  options?: PizzaToppingOption[];
  price?: number; // for counter
};

export type ExtrasSectionProps = {
  extras: Extra[];
  selections: Record<string, any>;
  onChange: (extraId: string, value: any) => void;
};

const ExtrasSection = ({ extras, selections, onChange }: ExtrasSectionProps) => (
  <View>
    {extras.map((extra) => {
      if (extra.type === "pizza-topping") {
        return (
          <PizzaToppingGroup
            key={extra.id}
            extra={extra}
            value={selections[extra.id] || {}}
            onChange={(val) => onChange(extra.id, val)}
          />
        );
      }
      return (
        <ExtraGroup
          key={extra.id}
          extra={extra}
          value={selections[extra.id]}
          onChange={(val) => onChange(extra.id, val)}
        />
      );
    })}
  </View>
);

export default ExtrasSection; 