import React from "react";
import { View, TouchableOpacity, StyleSheet } from "react-native";
import { Extra, PizzaToppingOption, AreaOption } from "./ExtrasSection";
import { useContext } from "react";
import { StoreContext } from "../../stores";
import Icon from "../icon";
import themeStyle from "../../styles/theme.style";
import Text from "../../components/controls/Text";

export type PizzaToppingGroupProps = {
  extra: Extra;
  value: Record<string, { areaId: string; isFree: boolean }>; // { [toppingId]: { areaId, isFree } }
  onChange: (
    value: Record<string, { areaId: string; isFree: boolean }>
  ) => void;
  freeToppingIds?: string[];
  freeCount?: number;
};

const PizzaToppingGroup = ({
  extra,
  value,
  onChange,
  freeToppingIds,
  freeCount,
}: PizzaToppingGroupProps) => {
  const { languageStore } = useContext(StoreContext);

  const handleAreaSelect = (toppingId: string, areaId: string) => {
    const newValue = { ...value };
    const isFree = freeToppingIds ? isToppingFree(toppingId) : false;
    if (newValue[toppingId] && newValue[toppingId].areaId === areaId) {
      delete newValue[toppingId]; // Deselect if already selected
    } else {
      newValue[toppingId] = { areaId, isFree };
    }
    onChange(newValue);
  };

  const getSelectedArea = (toppingId: string) => value[toppingId]?.areaId;

  // Use freeToppingIds if provided
  const isToppingFree = (toppingId: string) => {
    if (freeToppingIds)
      return (
        freeToppingIds.includes(toppingId) || freeToppingIds.length < freeCount
      );
    return false;
  };

  const getToppingIcon = (area: AreaOption, toppingId: string) => {
    switch (area.id) {
      case "full":
        return (
          <Icon
            icon="pizza-full"
            size={30}
            color={getSelectedArea(toppingId) === area.id ? themeStyle.PRIMARY_COLOR : themeStyle.text}
            style={{
              opacity: getSelectedArea(toppingId) === area.id ? 1 : 1,
            }}
          />
        );
      case "half1":
        return (
          <Icon
            icon="pizza-right"
            size={30}
            color={getSelectedArea(toppingId) === area.id ? themeStyle.PRIMARY_COLOR : themeStyle.text}
            style={{
              opacity: getSelectedArea(toppingId) === area.id ? 1 : 1,
            }}
          />
        );
      case "half2":
        return (
          <Icon
            icon="pizza-left"
            size={30}
            color={getSelectedArea(toppingId) === area.id ? themeStyle.PRIMARY_COLOR : themeStyle.text}
            style={{
              opacity: getSelectedArea(toppingId) === area.id ? 1 : 1,
            }}
          />
        );
      default:
        return null;
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>
        {languageStore.selectedLang === "ar" ? extra.nameAR : extra.nameHE}
      </Text>
      <View style={styles.toppingsContainer}>
        {extra.options?.map((topping: PizzaToppingOption) => (
          <View key={topping.id} style={styles.toppingRow}>
            <View style={styles.toppingNameContainer}>
              <View>
                <Text style={styles.toppingName}>
                  {languageStore.selectedLang === "ar"
                    ? topping.nameAR
                    : topping.nameHE}
                </Text>
              </View>
              {/* <View>
                  <Text style={styles.toppingPrice}>{topping.price}</Text>
                </View>  */}
            </View>

            <View style={styles.areaSelector}>
              {topping.areaOptions
                ?.sort((a, b) => {
                  // Sort by area.id: half2 (left) -> full -> half1 (right)
                  const order = { half2: 2, full: 1, half1: 0 };
                  return (order[a.id as keyof typeof order] || 0) - (order[b.id as keyof typeof order] || 0);
                })
                .map((area: AreaOption) => (
                <TouchableOpacity
                  key={area.id}
                  style={[styles.areaButton]}
                  onPress={() => handleAreaSelect(topping.id, area.id)}
                >
                  <View style={{ alignItems: "center" }}>
                    {getToppingIcon(area, topping.id)}
                    {area.price > 0 && !isToppingFree(topping.id) && (
                      <View>
                        <Text style={styles.toppingPrice}>₪{area.price}</Text>
                      </View>
                    )}
                  </View>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        ))}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {},
  title: {
    fontWeight: "bold",
    fontSize: 16,
    textAlign: "left",
    marginBottom: 10,
  },
  toppingsContainer: {
    flexDirection: "column",
    gap: 12,
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 12,
    marginBottom: 8,
    shadowColor: "#000",
    shadowOpacity: 0.04,
    shadowOffset: { width: 0, height: 1 },
    shadowRadius: 4,
    elevation: 1,
  },
  toppingRow: {
    marginBottom: 10,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  toppingNameContainer: {
    alignItems: "center",
  },
  toppingName: {
    fontWeight: "bold",
    fontSize: 15,
    textAlign: "left",
  },
  areaSelector: {
    flexDirection: "row",
    flexWrap: "wrap",
  },
  areaButton: {
    marginRight: 20,
  },
  toppingPrice: {
    fontSize: 12,
  },
});

export default PizzaToppingGroup;
