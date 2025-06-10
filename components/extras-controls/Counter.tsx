import React, { useContext } from "react";
import { View, TouchableOpacity } from "react-native";
import { Extra } from "./ExtrasSection";
import { StoreContext } from "../../stores";
import themeStyle from "../../styles/theme.style";
import Text from "../../components/controls/Text";

export type CounterProps = {
  value: number;
  min: number;
  max: number;
  onChange: (value: number) => void;
  price?: number;
  step?: number;
  extra: Extra;
  unit?: string;
};

const Counter = ({ value, min, max, onChange, price, step = 1, extra, unit }: CounterProps) => {
  const { languageStore } = useContext(StoreContext);
  const name = languageStore.selectedLang === "ar" ? extra.nameAR : extra.nameHE;

  const handleIncrement = () => {
    if (value < max) {
      onChange(value + step);
    }
  };

  const handleDecrement = () => {
    if (value > min) {
      onChange(value - step);
    }
  };

  return (
    <View style={{ flexDirection: "row", alignItems: "center", width: "100%", justifyContent: "space-between", paddingHorizontal: 16, paddingVertical: 10 }}>
      <View style={{flexDirection: "row", alignItems: "center", justifyContent: "space-between"}}>
        <Text >{name}</Text> 
        <View style={{marginLeft:10}}>
          {price && (
            <Text style={{marginLeft:20}}>+{price} ₪</Text> 
          )}
        </View>
      </View>

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
        <TouchableOpacity onPress={handleDecrement} disabled={value <= min}>
          <Text style={{ fontSize: themeStyle.FONT_SIZE_MD, color: "#444", fontWeight: "300" }}>−</Text>
        </TouchableOpacity>
        <Text style={{ fontSize: themeStyle.FONT_SIZE_MD, fontWeight: "bold", marginHorizontal: 16, minWidth: 40, textAlign: "center" }}>
          {value}{unit ? ` ${unit}` : ''}
        </Text>
        <TouchableOpacity onPress={handleIncrement} disabled={value >= max}>
          <Text style={{ fontSize: themeStyle.FONT_SIZE_MD, color: "#444", fontWeight: "300" }}>+</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default Counter; 