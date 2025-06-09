import React, { useContext } from "react";
import { View, Text, TouchableOpacity } from "react-native";
import { Extra } from "./ExtrasSection";
import { StoreContext } from "../../stores";
import themeStyle from "../../styles/theme.style";

export type CounterProps = {
  value: number;
  min?: number;
  max?: number;
  step?: number;
  onChange: (value: number) => void;
  price?: number;
  extra?: Extra;
};

const Counter = ({ value, min = 0, max = 10, step = 1, onChange, price, extra }: CounterProps) => {
  let { languageStore } = useContext(StoreContext);

  return(
<View style={{ flexDirection: "row", alignItems: "center", width: "100%", justifyContent: "space-between", paddingHorizontal: 16, paddingVertical: 10 }}>
       <Text >{languageStore.selectedLang === "ar" ? extra.nameAR : extra.nameHE}</Text> 

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
      <Text style={{ fontSize: themeStyle.FONT_SIZE_MD, color: "#444", fontWeight: "300" }}>−</Text>
    </TouchableOpacity>
    <Text style={{ fontSize: themeStyle.FONT_SIZE_MD, fontWeight: "bold", marginHorizontal: 16, minWidth: 40, textAlign: "center" }}>
      {value}
    </Text>
    <TouchableOpacity onPress={() => value + step <= max && onChange(value + step)}>
      <Text style={{ fontSize: themeStyle.FONT_SIZE_MD, color: "#444", fontWeight: "300" }}>+</Text>
    </TouchableOpacity>
  </View>
  {/* You can render the label and image here if needed */}
</View>
)};

export default Counter; 