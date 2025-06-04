import React, { useContext } from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { StoreContext } from "../../stores";

export type CheckboxGroupProps = {
  options: { id: string; nameAR: string; nameHE: string; price?: number }[];
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
  let { languageStore } = useContext(StoreContext);
  const toggle = (id: string) => {
    let newValue = value.includes(id)
      ? value.filter((v) => v !== id)
      : [...value, id];
    if (max && newValue.length > max) return;
    onChange(newValue);
  };
  return (
    <View style={styles.optionsRow}>
      {options.map((opt) => {
        const selected = value.includes(opt.id);
        return (
          <TouchableOpacity
          key={opt.id}
          onPress={() => toggle(opt.id)}
          style={styles.optionRow}
          activeOpacity={0.7}
        >
      
          <View style={styles.labelContainer}>
            <Text style={styles.optionLabel}>
              {languageStore.selectedLang === "ar" ? opt.nameAR : opt.nameHE}
            </Text>
            {opt.price !== undefined && (
              <Text style={styles.optionPrice}>₪{opt.price}</Text>
            )}
          </View>

          <View style={styles.checkboxOuter}>
            {selected && (
              <View style={styles.checkboxInner}>
                <Text style={styles.checkmark}>✓</Text>
              </View>
            )}
          </View>

          {/* {opt.image && (
            <View style={styles.imageContainer}>
              <Image source={{ uri: opt.image }} style={styles.optionImage} />
            </View>
          )} */}
        </TouchableOpacity>
        );
      })}
    </View>
  );
};

const styles = StyleSheet.create({
  optionsRow: {
    marginBottom: 16,
  },
  optionRow: {
    flexDirection: "row", // RTL: label right, checkbox left
    alignItems: "center",
    paddingVertical: 16,
    paddingHorizontal: 8,
    width: "100%",
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
    backgroundColor: "#fff",
    justifyContent: "space-between",
  },
  checkboxOuter: {
    width: 32,
    height: 32,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: "#8BC34A",
    alignItems: "center",
    justifyContent: "center",
    marginLeft: 12,
    backgroundColor: "#fff",
  },
  checkboxInner: {
    width: 28,
    height: 28,
    borderRadius: 4,
    backgroundColor: "#4CAF50",
    alignItems: "center",
    justifyContent: "center",
  },
  checkmark: {
    color: "#fff",
    fontSize: 20,
    fontWeight: "bold",
    lineHeight: 22,
  },
  labelContainer: {
    flex: 1,
    flexDirection: "column",
    alignItems: "flex-start",
    marginRight: 8,
  },
  optionLabel: {
    fontSize: 18,
    color: "#333",
    textAlign: "right",
    fontWeight: "bold",
  },
  optionPrice: {
    fontSize: 16,
    color: "#888",
    textAlign: "right",
  },
  imageContainer: {
    marginLeft: 8,
  },
  optionImage: {
    width: 48,
    height: 48,
    borderRadius: 8,
    resizeMode: "cover",
  },
});

export default CheckboxGroup;
