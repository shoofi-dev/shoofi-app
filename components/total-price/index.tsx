import { View, StyleSheet } from "react-native";
import Text from "../controls/Text";
import Icon from "../icon";
import themeStyle from "../../styles/theme.style";
import moment from "moment";
import { useTranslation } from "react-i18next";
import { SHIPPING_METHODS } from "../../consts/shared";
import { StoreContext } from "../../stores";
import { useContext, useEffect, useState } from "react";
import { getCurrentLang } from "../../translations/i18n";
import { useAvailableDrivers } from "../../hooks/useAvailableDrivers";
import CouponInput from "../coupon/CouponInput";

export type TProps = {
  onChangeTotalPrice: any;
};
export default function TotalPriceCMP({ onChangeTotalPrice }: TProps) {
  const { t } = useTranslation()
 
  const [shippingMethod, setShippingMethod] = useState(null);

  useEffect(()=>{
    cartStore.getShippingMethod().then((shippingMethodTmp)=>{
      console.log("shippingMethodTmp", shippingMethodTmp)
      setShippingMethod(shippingMethodTmp)
    })
  }, [])

  const { cartStore } = useContext(StoreContext);
  const { availableDrivers, loading: driversLoading, error: driversError } = useAvailableDrivers({isEnabled: shippingMethod === SHIPPING_METHODS.shipping});
  const [itemsPrice, setItemsPrice] = useState(0);
  const [totalPrice, setTotalPrice] = useState(0);
  const areaDeliveryPrice = availableDrivers?.area?.price
  useEffect(() => {
    getItemsPrice();
  }, []);

  useEffect(()=>{
            getTotalPrice();

  }, [itemsPrice,shippingMethod, availableDrivers?.area?.price, availableDrivers, driversLoading])

  const getTotalPrice = () => {
    const shippingPrice =
      shippingMethod === SHIPPING_METHODS.shipping
        ? deliveryPrice
        : 0;
        console.log("shippingPrice", shippingPrice)
        const totalPriceTmp = shippingPrice + itemsPrice;
    setTotalPrice(totalPriceTmp);
    onChangeTotalPrice(totalPriceTmp)
  };
  const getItemsPrice = () => {
    let tmpOrderPrice = 0;
    cartStore.cartItems.forEach((item) => {
      if (item) {
        tmpOrderPrice += item.data.price * item.others.qty;
      }
    });
    setItemsPrice(tmpOrderPrice);
  };

  // --- NEW DESIGN START ---
  // Calculate values
  const orderPrice = itemsPrice;
  const deliveryPrice = shippingMethod === SHIPPING_METHODS.shipping ? areaDeliveryPrice || 0 : null;
  // Placeholder for discount logic (replace with real discount if available)
  const discount = 0; // e.g., -5
  const finalTotal = orderPrice + deliveryPrice + discount;

  // Hebrew labels
  const rows = [
    { label: t("order-price"), value: orderPrice },
   
  ];
  if (deliveryPrice !== null) {
    rows.push( { label: t("delivery"), value: deliveryPrice  });
  }
  if (discount) {
    rows.push({ label: t("discount"), value: discount });
  }

  return (
    <View style={styles.totalPriceContainer}>
      <CouponInput
        orderAmount={finalTotal}
        userId="current-user-id" // Replace with actual user ID
        onCouponApplied={(couponApp) => {
          // Handle coupon applied
          console.log('Coupon applied:', couponApp);
        }}
        onCouponRemoved={() => {
          // Handle coupon removed
          console.log('Coupon removed');
        }}
      />
      {rows.map((row, idx) => (
        <View
          key={row.label}
          style={[
            styles.row,
            idx === rows.length - 1 ? styles.lastRow : null,
          ]}
        >
          <Text style={styles.price} type="number">
            ₪{row.value.toFixed(2)}
          </Text>
          <Text style={styles.label}>{row.label}</Text>
        </View>
      ))}
      <View style={[styles.row, styles.lastRow, { marginTop: 8 }]}> 
        <Text style={styles.priceTotal} type="number">
          ₪{finalTotal.toFixed(2)}
        </Text>
        <Text style={styles.labelTotal}>{t("final-price-short")}</Text>
      </View>
    </View>
  );
  // --- NEW DESIGN END ---
}

const styles = StyleSheet.create({
  totalPriceContainer: {
    backgroundColor: "#fff",
    borderRadius: 8,
    overflow: "hidden",
    marginVertical: 8,
  },
  row: {
    flexDirection: "row-reverse",
    justifyContent: "space-between",
    alignItems: "center",
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
    paddingVertical: 12,
    paddingHorizontal: 8,
  },
  lastRow: {
    borderBottomWidth: 0,
  },
  price: {
    color: "#888",
    fontSize: 16,
    minWidth: 70,
    textAlign: "left",
  },
  label: {
    color: "#222",
    fontSize: 16,
    textAlign: "right",
    flex: 1,
  },
  priceTotal: {
    color: "#222",
    fontWeight: "bold",
    fontSize: 18,
    minWidth: 70,
    textAlign: "left",
  },
  labelTotal: {
    color: "#222",
    fontWeight: "bold",
    fontSize: 18,
    textAlign: "right",
    flex: 1,
  },
});
