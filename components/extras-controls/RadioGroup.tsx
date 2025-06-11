import React, { useContext } from "react";
import { View, TouchableOpacity, StyleSheet } from "react-native";
import { StoreContext } from "../../stores";
import Text from "../../components/controls/Text";
export type RadioGroupProps = {
  options: { id: string; nameAR?: string; nameHE?: string; price?: number }[];
  value: string;
  onChange: (value: string) => void;
};

const RadioGroup = ({ options, value, onChange }: RadioGroupProps) => {
  let { languageStore } = useContext(StoreContext);
  return (
    <View style={{paddingHorizontal: 15}}>
      {options.map((opt, idx) => {
        const selected = value === opt.id;
        const isLast = idx === options.length - 1;
        return (
          <TouchableOpacity
            key={opt.id}
            onPress={() => onChange(opt.id)}
            style={[
              styles.optionRow,
              isLast && { borderBottomWidth: 0 }
            ]}
            activeOpacity={0.7}
          >
            <Text style={styles.optionLabel}>
              {languageStore.selectedLang === "ar" ? opt.nameAR : opt.nameHE}
              {opt.price ? ` +₪${opt.price}` : ""}
            </Text>
            <View style={styles.radioOuter}>
              {selected && <View style={styles.radioInner} />}
            </View>
          </TouchableOpacity>
        );
      })}
    </View>
  );
};

const styles = StyleSheet.create({
  optionRow: {
    flexDirection: "row", // RTL: label right, radio left
    alignItems: "center",
    paddingVertical: 14,
    width: "100%",
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
    flex:1,
    
  },
  radioOuter: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: "#8BC34A",
    alignItems: "center",
    justifyContent: "center",
    marginLeft: 12,
  },
  radioInner: {
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: "#4CAF50",
  },
  optionLabel: {
    fontSize: 18,
    color: "#333",
    flex: 1,
    textAlign: "left",
  },
});

export default RadioGroup;
