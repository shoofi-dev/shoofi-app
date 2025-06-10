import React, { useContext } from "react";
import { View, StyleSheet } from "react-native";
import RadioGroup from "./RadioGroup";
import CheckboxGroup from "./CheckboxGroup";
import Counter from "./Counter";
import { Extra } from "./ExtrasSection";
import { StoreContext } from "../../stores";
import Text from "../../components/controls/Text";
export type ExtraGroupProps = {
  extra: Extra;
  value: any;
  onChange: (value: any) => void;
};

const ExtraGroup = ({ extra, value, onChange }: ExtraGroupProps) => {
  let { languageStore } = useContext(StoreContext);

  return (
    <View style={styles.card}>
      {/* <Text style={styles.title}>{languageStore.selectedLang === "ar" ? extra.nameAR : extra.nameHE}</Text> */}
      <View style={{ }}>
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
              value={value || extra.defaultValue ||  0}
              min={extra.min}
              max={extra.max}
              onChange={onChange}
              price={extra.price}
              step={extra.step}
              extra={extra}
            />
        )}
        {extra.type === "weight" && (
            <Counter
              value={value || extra.defaultValue || 0}
              min={extra.min}
              max={extra.max}
              onChange={onChange}
              price={extra.price}
              step={extra.step}
              extra={extra}
            />
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: "#fff",
    marginBottom: 8,
    shadowColor: "#000",
    shadowOpacity: 0.04,
    shadowOffset: { width: 0, height: 1 },
    shadowRadius: 4,
    elevation: 1,
  },
  title: {
    fontWeight: "bold",
    fontSize: 16,
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