import React, { useContext } from "react";
import { View } from "react-native";
import Text from "../../../components/controls/Text";
import { extrasStore } from "../../../stores/extras";
import { isEmpty } from "lodash";
import { StoreContext } from "../../../stores";
import Icon from "../../../components/icon";

const CartExtras = ({
  extrasDef,
  selectedExtras,
  fontSize,
  basePrice,
  qty,
}) => {
  const { languageStore } = useContext(StoreContext);
  if (!extrasDef || !selectedExtras || isEmpty(extrasDef)) return null;
  const extrasPrice = extrasStore.calculateExtrasPrice(
    extrasDef,
    selectedExtras
  );
  const totalPrice = (basePrice + extrasPrice) * (qty || 1);

  const getName = (item) => {
    return languageStore.selectedLang === "ar" ? item.nameAR : item.nameHE;
  };

  const getToppingIcon = (area: any) => {
    switch (area.id) {
      case "full":
        return <Icon icon="pizza-full" size={20} color="black" />;
      case "half1":
        return <Icon icon="pizza-right" size={20} color="black" />;
      case "half2":
        return <Icon icon="pizza-left" size={20} color="black" />;
      default:
        return null;
    }
  };

  // Collect all pizza-topping extras and group by areaId
  const pizzaToppingExtras = extrasDef.filter(
    (extra) => extra.type === "pizza-topping"
  );
  const allToppingSelections = [];
  pizzaToppingExtras.forEach((extra) => {
    const value = selectedExtras?.[extra.id];
    if (!value) return;
    Object.entries(value).forEach(([toppingId, areaData]) => {
      const topping = extra.options.find((o) => o.id === toppingId);
      if (!topping) return;
      const typedAreaData = areaData as { areaId: string; isFree: boolean };
      allToppingSelections.push({
        areaId: typedAreaData.areaId,
        topping,
        areaData: typedAreaData,
        extra,
      });
    });
  });
  // Group by areaId
  const groupedByArea = allToppingSelections.reduce((acc, curr) => {
    if (!acc[curr.areaId]) acc[curr.areaId] = [];
    acc[curr.areaId].push(curr);
    return acc;
  }, {} as Record<string, Array<{ topping: any; areaData: { areaId: string; isFree: boolean }; extra: any }>>);

  // Render grouped pizza toppings by areaId
  const renderPizzaToppingSections = () => {
    return Object.entries(groupedByArea).map(
      ([areaId, toppings]: [
        string,
        Array<{
          topping: any;
          areaData: { areaId: string; isFree: boolean };
          extra: any;
        }>
      ]) => {
        // Try to get area object from any topping's extra
        const area = toppings[0]?.extra.options[0]?.areaOptions?.find(
          (a) => a.id === areaId
        );
        return (
          <View key={areaId} style={{ marginBottom: 5 }}>
            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                marginBottom: 0,
                flexWrap: "wrap",
              }}
            >
              <View style={{ marginRight: 5, }}>{getToppingIcon(area)}</View>

              {toppings.map(({ topping, areaData }, idx) => (
                <View
                  key={topping.id + idx}
                  style={{
                    flexDirection: "row",
                    alignItems: "center",
                  }}
                >
                  <Text
                    style={{
                      fontSize: fontSize(14),
                      color: "#333",
                    }}
                  >
                    {getName(topping)}
                    {!areaData.isFree &&
                      (() => {
                        const areaOption = topping.areaOptions?.find(
                          (opt) => opt.id === areaData.areaId
                        );
                        return areaOption && areaOption.price ? ` (+₪${areaOption.price || 0})` : null;
                      })()}
                  </Text>
                  {idx < toppings.length - 1 && (
                    <Text
                      style={{
                        fontSize: fontSize(14),
                        color: "#333",
                       
                      }}
                    >
                      ,
                    </Text>
                  )}
                </View>
              ))}
            </View>
          </View>
        );
      }
    );
  };

  return (
    <View style={{ marginTop: 5, alignItems: "flex-start" }}>
      {extrasDef.map((extra) => {
        // Skip pizza-topping extras as they will be rendered separately
        if (extra.type === "pizza-topping") return null;
        
        const value = selectedExtras[extra.id];
        if (
          value === undefined ||
          value === null ||
          value === "" ||
          (Array.isArray(value) && value.length === 0)
        )
          return null;
        // Single choice
        if (extra.type === "single") {
          const opt = extra.options.find((o) => o.id === value);
          return (
            <View
              key={extra.id}
              style={{
                flexDirection: "row",
                alignItems: "center",
                marginBottom: 2,
              }}
            >
              <Text style={{ fontSize: fontSize(14), color: "black" }}>
                {getName(extra)}
              </Text>
              <Text style={{ fontSize: fontSize(14), color: "black" }}>
                {getName(opt)}
                {opt?.price ? ` (+₪${opt.price})` : ""}
              </Text>
            </View>
          );
        }
        // Multi select
        if (extra.type === "multi") {
          const opts = extra.options.filter((o) => value.includes(o.id));
          return (
            <View
              key={extra.id}
              style={{
                flexDirection: "row",
                alignItems: "center",
                marginBottom: 2,
              }}
            >
              <Text style={{ fontSize: fontSize(14), color: "#888" }}>
                {getName(extra)}
              </Text>
              <View style={{   }}>
                {opts.map((o) => (
                  <View>
                    <Text>
                      {getName(o)}
                      {o.price ? ` (${o.price}+₪)` : ""}
                    </Text>
                  </View>
                  ))}
              </View>
            </View>
          );
        }
        // Counter
        if (extra.type === "counter") {
          return (
            <View
              key={extra.id}
              style={{
                flexDirection: "row",
                alignItems: "center",
                marginBottom: 2,
              }}
            >
              <Text style={{ fontSize: fontSize(14), color: "#888" }}>
                {getName(extra)}
              </Text>
              <Text style={{ fontSize: fontSize(14), color: "#333" }}>
                {value}x{extra.price ? ` (+₪${extra.price})` : ""}
              </Text>
            </View>
          );
        }
        // Weight
        if (extra.type === "weight") {
          return (
            <View
              key={extra.id}
              style={{
                flexDirection: "row",
                alignItems: "center",
                marginBottom: 2,
              }}
            >
              <Text style={{ fontSize: fontSize(14), color: "#333" }}>
                {getName(extra)}
              </Text>
              <Text style={{ fontSize: fontSize(14), color: "#333" }}>
                {value}x{extra.price ? ` (+₪${extra.price})` : ""}
              </Text>
            </View>
          );
        }
        return null;
      })}
      
      {/* Render grouped pizza toppings */}
      <View style={{ marginTop: 10, }}>
      {renderPizzaToppingSections()}
      </View>
      
      {/* Show extras price if any */}
      {/* {extrasPrice > 0 && (
        <Text
          style={{ fontSize: fontSize(14), color: "#007aff", marginTop: 2 }}
        >
          {`Extras: +₪${extrasPrice}`}
        </Text>
      )} */}
      {/* Show total price if basePrice is provided */}
      {/* {basePrice !== undefined && (
        <Text
          style={{
            fontSize: fontSize(14),
            color: "white",
            fontWeight: "bold",
            marginTop: 2,
          }}
        >
          {`Total: ₪${totalPrice}`}
        </Text>
      )} */}
    </View>
  );
};

export default CartExtras;
