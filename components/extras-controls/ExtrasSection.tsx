import React from "react";
import { View, StyleSheet, Text } from "react-native";
import ExtraGroup from "./ExtraGroup";
import PizzaToppingGroup from "./PizzaToppingGroup";
import { useContext } from "react";
import { StoreContext } from "../../stores";
import themeStyle from "../../styles/theme.style";

export type AreaOption = {
  id: string; // e.g. "full", "left", "right"
  name: string;
  price: number;
};

export type PizzaToppingOption = {
  id: string;
  nameAR: string;
  nameHE: string;
  price?: number; // fallback
  areaOptions?: AreaOption[];
};

export type Extra = {
  id: string;
  type: "single" | "multi" | "counter" | "pizza-topping" | "weight";
  nameAR: string;
  nameHE: string;
  required?: boolean;
  min?: number;
  max?: number;
  maxCount?: number;
  options?: PizzaToppingOption[];
  price?: number; // for counter and weight
  step?: number;
  defaultValue?: number;
  groupId?: string;
  isGroupHeader?: boolean;
  order?: number;
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
}: ExtrasSectionProps) => {
  const { languageStore } = useContext(StoreContext);

  // Group extras by groupId
  const groupedExtras = extras.reduce((acc, extra) => {
    if (extra.groupId) {
      if (!acc[extra.groupId]) {
        acc[extra.groupId] = [];
      }
      acc[extra.groupId].push(extra);
    } else {
      if (!acc.ungrouped) {
        acc.ungrouped = [];
      }
      acc.ungrouped.push(extra);
    }
    return acc;
  }, {} as Record<string, Extra[]>);
  return (
    <View style={styles.container}>
      {Object.entries(groupedExtras)
        .sort((a, b) => a[1][0].order - b[1][0].order)
        .map(([groupId, groupExtras]) => (
          <View key={groupId}>
            {groupId === "ungrouped"
              ? groupExtras
                  .sort((a, b) => a.order - b.order)
                  .map((extra) => {
                    if (extra.type === "pizza-topping") {
                      return (
                        <View style={styles.groupWrapper}>
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
                      <View style={styles.groupWrapper}>
                        <ExtraGroup
                          key={extra.id}
                          extra={extra}
                          value={selections[extra.id]}
                          onChange={(val) => onChange(extra.id, val)}
                        />
                      </View>
                    );
                  })
              : (() => {
                  const groupHeader = groupExtras.find(
                    (extra) => extra.isGroupHeader
                  );
                  if (!groupHeader) return null;
                  return (
                    <View style={styles.groupContainer}>
                      <View style={styles.groupHeader}>
                        <Text style={styles.groupTitle}>
                          {languageStore.selectedLang === "ar"
                            ? groupHeader.nameAR
                            : groupHeader.nameHE}
                        </Text>
                      </View>
                      <View style={styles.groupContent}>
                        {groupExtras
                          .filter((extra) => !extra.isGroupHeader)
                          .sort((a, b) => a.order - b.order)
                          .map((extra) => {
                            if (extra.type === "pizza-topping") {
                              return (
                                <View style={styles.groupWrapper}>
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
                              <View style={styles.groupWrapper}>
                                <ExtraGroup
                                  key={extra.id}
                                  extra={extra}
                                  value={selections[extra.id]}
                                  onChange={(val) => onChange(extra.id, val)}
                                />
                              </View>
                            );
                          })}
                      </View>
                    </View>
                  );
                })()}
          </View>
        ))}
    </View>
  );
};

const styles = StyleSheet.create({
  groupWrapper: {
    marginBottom: 30,
  },
  container: {
    backgroundColor: themeStyle.GRAY_600,
  },
  groupContainer: {
    backgroundColor: "#fff",
    shadowColor: "#000",
    shadowOpacity: 0.06,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 8,
    elevation: 2,
    overflow: "hidden",
    marginBottom: 30,

  },
  groupHeader: {
    backgroundColor: themeStyle.WHITE_COLOR,
    padding: 10,
    borderBottomColor: "#e5e7eb",
    flexDirection: "row",
    alignItems: "center",
  },
  groupTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#222",
  },
  groupContent: {
    paddingHorizontal: 12,
  },
});

export default ExtrasSection;
