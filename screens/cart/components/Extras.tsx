import React from "react";
import { View } from "react-native";
import Text from "../../../components/controls/Text";
import { extrasStore } from "../../../stores/extras";

const CartExtras = ({ extrasDef, selectedExtras, fontSize, basePrice, qty }) => {
  if (!extrasDef || !selectedExtras) return null;
  const extrasPrice = extrasStore.calculateExtrasPrice(extrasDef, selectedExtras);
  const totalPrice = (basePrice + extrasPrice) * (qty || 1);
  return (
    <View style={{ marginTop: 5 }}>
      {extrasDef.map((extra) => {
        const value = selectedExtras[extra.id];
        if (value === undefined || value === null || value === "" || (Array.isArray(value) && value.length === 0)) return null;
        // Single choice
        if (extra.type === "single") {
          const opt = extra.options.find(o => o.id === value);
          return (
            <View key={extra.id} style={{ flexDirection: "row", alignItems: "center", marginBottom: 2 }}>
              <Text style={{ fontSize: fontSize(14), color: "#888" }}>{extra.title}: </Text>
              <Text style={{ fontSize: fontSize(14), color: "#333" }}>{opt?.name}{opt?.price ? ` (+₪${opt.price})` : ""}</Text>
            </View>
          );
        }
        // Multi select
        if (extra.type === "multi") {
          const opts = extra.options.filter(o => value.includes(o.id));
          return (
            <View key={extra.id} style={{ flexDirection: "row", alignItems: "center", marginBottom: 2 }}>
              <Text style={{ fontSize: fontSize(14), color: "#888" }}>{extra.title}: </Text>
              <Text style={{ fontSize: fontSize(14), color: "#333" }}>{opts.map(o => `${o.name}${o.price ? ` (+₪${o.price})` : ""}`).join(", ")}</Text>
            </View>
          );
        }
        // Counter
        if (extra.type === "counter") {
          return (
            <View key={extra.id} style={{ flexDirection: "row", alignItems: "center", marginBottom: 2 }}>
              <Text style={{ fontSize: fontSize(14), color: "#888" }}>{extra.title}: </Text>
              <Text style={{ fontSize: fontSize(14), color: "#333" }}>{value}x{extra.price ? ` (+₪${extra.price})` : ""}</Text>
            </View>
          );
        }
        return null;
      })}
      {/* Show extras price if any */}
      {extrasPrice > 0 && (
        <Text style={{ fontSize: fontSize(14), color: "#007aff", marginTop: 2 }}>
          {`Extras: +₪${extrasPrice}`}
        </Text>
      )}
      {/* Show total price if basePrice is provided */}
      {basePrice !== undefined && (
        <Text style={{ fontSize: fontSize(14), color: "white", fontWeight: "bold", marginTop: 2 }}>
          {`Total: ₪${totalPrice}`}
        </Text>
      )}
    </View>
  );
};

export default CartExtras; 