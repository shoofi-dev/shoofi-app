import React, { useContext } from "react";
import { View, Text, StyleSheet } from "react-native";
import RadioGroup from "./RadioGroup";
import CheckboxGroup from "./CheckboxGroup";
import Counter from "./Counter";
import { Extra } from "./ExtrasSection";
import { StoreContext } from "../../stores";

export type ExtraGroupProps = {
  extra: Extra;
  value: any;
  onChange: (value: any) => void;
};

const ExtraGroup = ({ extra, value, onChange }: ExtraGroupProps) => {
  let { languageStore } = useContext(StoreContext);

  return (
    <View style={styles.card}>
      <Text style={styles.title}>{languageStore.selectedLang === "ar" ? extra.nameAR : extra.nameHE}</Text>
      <View style={{ marginTop: 10 }}>
        {extra.type === "single" && extra.options && (
          <RadioGroup options={extra.options} value={value} onChange={onChange} />
        )}
        {extra.type === "multi" && extra.options && (
          <>
            <CheckboxGroup
              options={extra.options}
              value={value}
              onChange={onChange}
              min={extra.min}
              max={extra.maxCount ?? extra.max}
            />
            {extra.maxCount && (
              <View style={styles.maxCountPill}>
                <Text style={styles.maxCountText}>
                  ניתן לבחור עד {extra.maxCount} אפשרויות
                </Text>
              </View>
            )}
          </>
        )}
        {extra.type === "counter" && (
          <Counter
            value={value || 0}
            min={extra.min}
            max={extra.max}
            onChange={onChange}
            price={extra.price}
          />
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
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
  title: {
    fontWeight: "bold",
    fontSize: 18,
    textAlign: "left",
    color: "#222",
  },
  maxCountPill: {
    backgroundColor: "#f0f4fa",
    borderRadius: 20,
    alignSelf: "center",
    paddingHorizontal: 16,
    paddingVertical: 4,
    marginTop: 10,
  },
  maxCountText: {
    color: "#007aff",
    fontSize: 13,
    textAlign: "center",
    fontWeight: "500",
  },
});

export default ExtraGroup; 