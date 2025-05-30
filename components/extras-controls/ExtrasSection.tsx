import React from "react";
import { View, StyleSheet } from "react-native";
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
  maxCount?: number;
  options?: PizzaToppingOption[];
  price?: number; // for counter
};

export type ExtrasSectionProps = {
  extras: Extra[];
  selections: Record<string, any>;
  onChange: (extraId: string, value: any) => void;
};

const ExtrasSection = ({
  extras,
  selections,
  onChange,
}: ExtrasSectionProps) => (
  <View style={styles.container}>
    {extras.map((extra) => {
      if (extra.type === "pizza-topping") {
        return (
          <View style={styles.card}>

          <PizzaToppingGroup
            key={extra.id}
            extra={extra}
            value={selections[extra.id] || {}}
            onChange={(val) => onChange(extra.id, val)}
          />
          </View>
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

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 8,
    paddingTop: 8,
    paddingBottom: 16,
  },
  card: {
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOpacity: 0.06,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 8,
    elevation: 2,
  },
});

export default ExtrasSection;
