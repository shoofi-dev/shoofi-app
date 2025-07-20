import React from "react";
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

import CouponInput from "../coupon/CouponInput";
import { CouponApplication } from "../../types/coupon";

export type TProps = {
  onChangeTotalPrice: any;
  hideCouponInput?: boolean;
  onCouponApplied?: (coupon: any) => void;
};
export default function TotalPriceCMP({
  onChangeTotalPrice,
  hideCouponInput = false,
  onCouponApplied,
}: TProps) {
  const { t } = useTranslation();
  const { cartStore, couponsStore, storeDataStore, shoofiAdminStore, addressStore } = useContext(StoreContext);
  const [shippingMethod, setShippingMethod] = useState(null);
  const [appliedCoupon, setAppliedCoupon] = useState<CouponApplication | null>(
    null
  );

  useEffect(() => {
    cartStore.getShippingMethod().then((shippingMethodTmp) => {
      setShippingMethod(shippingMethodTmp);
    });
  }, [cartStore]);

  useEffect(() => {
    if (shippingMethod !== SHIPPING_METHODS.shipping) return;
    console.log("XXX2")

    const defaultAddress = addressStore?.defaultAddress;
    if (
      defaultAddress &&
      defaultAddress.location &&
      defaultAddress.location.coordinates
    ) {
      const [lng, lat] = defaultAddress.location.coordinates;
      const customerLocation = { lat, lng };
      
      let storeLocation = undefined;
      if (storeDataStore.storeData?.location) {
        const { lat: storeLat, lng: storeLng } = storeDataStore.storeData.location;
        storeLocation = { lat: storeLat, lng: storeLng };
      }
      shoofiAdminStore.fetchAvailableDrivers(customerLocation, storeLocation);
    }
  }, [shippingMethod, addressStore?.defaultAddress, storeDataStore.storeData?.location.lat, storeDataStore.storeData?.location.lng]);

  const {
    availableDrivers,
    availableDriversLoading: driversLoading,
    availableDriversError: driversError,
  } = shoofiAdminStore;
  const [itemsPrice, setItemsPrice] = useState(0);
  const [totalPrice, setTotalPrice] = useState(0);
  const [discount, setDiscount] = useState(0);
  const [deliveryPrice, setDeliveryPrice] = useState(0);
  const areaDeliveryPrice = availableDrivers?.area?.price;

  useEffect(() => {
    getItemsPrice();
  }, [cartStore.cartItems]);

  useEffect(() => {
    const deliveryPriceTmp =
      shippingMethod === SHIPPING_METHODS.shipping
        ? areaDeliveryPrice || 0
        : null;
    setDeliveryPrice(deliveryPriceTmp);
  }, [availableDrivers, shippingMethod]);

  useEffect(() => {
    getTotalPrice();
  }, [
    itemsPrice,
    shippingMethod,
    availableDrivers?.area?.price,
    availableDrivers,
    driversLoading,
    discount,
    deliveryPrice,
  ]);

  // Auto-apply coupons when component loads or when total price changes
  useEffect(() => {
    const applyAutoCoupons = async () => {
      if (totalPrice > 0 && !appliedCoupon) {
        try {
          const userId = "current-user-id"; // This should be replaced with actual user ID
          const autoCoupon = await couponsStore?.getAndApplyAutoCoupons(
            userId,
            totalPrice,
            deliveryPrice
          );
          if (autoCoupon) {
            setAppliedCoupon(autoCoupon);
            console.log("autoCoupon", autoCoupon);
            if(shippingMethod === SHIPPING_METHODS.shipping && autoCoupon?.coupon.type === "free_delivery"){
              setDiscount(autoCoupon.discountAmount);
            }
            // Notify parent component about the applied coupon
            onCouponApplied?.(autoCoupon);
          }
        } catch (error) {
          console.error("Failed to auto-apply coupon:", error);
        }
      }
    };

    applyAutoCoupons();
  }, [totalPrice, appliedCoupon, shippingMethod]);

  // Notify parent component when appliedCoupon changes
  useEffect(() => {
    onCouponApplied?.(appliedCoupon);
  }, [appliedCoupon, onCouponApplied]);

  const getTotalPrice = () => {
    // If free delivery coupon is applied, delivery price should be 0
    const effectiveDeliveryPrice =
      appliedCoupon?.coupon.type === "free_delivery" ? 0 : deliveryPrice;
      console.log("deliveryPrice", deliveryPrice)
      console.log("appliedCoupon", appliedCoupon)
      console.log("itemsPrice", itemsPrice)
      console.log("discount", discount)
    const totalPriceTmp = itemsPrice + deliveryPrice - discount;

    setTotalPrice(totalPriceTmp);
    onChangeTotalPrice(totalPriceTmp);
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

  type PriceRow = {
    label: string;
    value: number;
    isFree?: boolean;
  };

  const rows: PriceRow[] = [{ label: t("order-price"), value: itemsPrice }];

  // Handle delivery price display with coupon logic
  if (deliveryPrice !== null) {

    rows.push({
      label: t("delivery"),
      value: deliveryPrice,
    });
  }

  if (discount && deliveryPrice !== null) {
    rows.push({ label: t("discount"), value: -discount });
  }

  const renderCouponInput = () => {
    if (hideCouponInput) return null;

    return (
      <CouponInput
        orderAmount={totalPrice}
        userId="current-user-id"
        appliedCoupon={appliedCoupon}
        deliveryFee={deliveryPrice}
        onCouponApplied={(couponApp) => {
          setAppliedCoupon(couponApp);
          if(shippingMethod === SHIPPING_METHODS.shipping && couponApp?.coupon.type === "free_delivery"){
            setDiscount(couponApp.discountAmount);
          }
          // Notify parent component about the applied coupon
          onCouponApplied?.(couponApp);
        }}
        onCouponRemoved={() => {
          setAppliedCoupon(null);
          setDiscount(0);
          // Notify parent component that coupon was removed
          onCouponApplied?.(null);
        }}
      />
    );
  };

  const renderRows = () => {
    return rows.map((row, idx) => (
      <React.Fragment key={row.label}>
        <View
          style={[styles.row, idx === rows.length - 1 ? styles.lastRow : null]}
        >
         
            {row.isFree ? (
              <Text style={styles.freeText} type="number">
                ₪{row.value.toFixed(2)}
              </Text>
            ) : (
              <Text style={styles.price} type="number">₪{row.value.toFixed(2)}</Text>
            )}
          {row.isFree ? (
            <Text style={styles.labelFree}>{row.label}</Text>
          ) : (
            <Text style={styles.label}>{row.label}</Text>
          )}
        </View>
        <View
          style={{
            height: 1,
            width: "100%",
            backgroundColor: themeStyle.GRAY_20,
          }}
        ></View>
      </React.Fragment>
    ));
  };

  return (
    <View style={styles.totalPriceContainer}>
      {/* {renderCouponInput()} */}
      <View
        style={{
          height: 1,
          width: "100%",
          backgroundColor: "#E5E7EB",
        }}
      ></View>
      {renderRows()}
      <View style={[styles.row, styles.lastRow, { marginTop: 8 }]}>
        <Text style={styles.priceTotal} type="number">
          ₪{totalPrice.toFixed(2)}
        </Text>
        <Text style={styles.labelTotal}>{t("final-price-short")}</Text>
      </View>
    </View>
  );
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
    paddingHorizontal: 20,
    width: "100%",
  },
  lastRow: {
    borderBottomWidth: 0,
  },
  price: {
    color: themeStyle.GRAY_60,
    fontSize: themeStyle.FONT_SIZE_SM,
  },
  label: {
    fontSize: themeStyle.FONT_SIZE_MD,
    textAlign: "left",
  },
  labelFree: {
    fontSize: themeStyle.FONT_SIZE_MD,
    textAlign: "left",
    color: themeStyle.SUCCESS_COLOR,
  },
  priceTotal: {
    color: themeStyle.GRAY_60,
    fontWeight: "bold",
    fontSize: themeStyle.FONT_SIZE_SM,
  },
  labelTotal: {
    fontWeight: "bold",
    fontSize: themeStyle.FONT_SIZE_MD,
    textAlign: "left",
  },
  freeText: {
    color: themeStyle.SUCCESS_COLOR,
    fontSize: themeStyle.FONT_SIZE_SM,
    minWidth: 70,
    textAlign: "left",

  },
});
