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

export type TProps = {
  shippingMethod: any;
  onChangeTotalPrice: any;
};
export default function TotalPriceCMP({ shippingMethod, onChangeTotalPrice }: TProps) {
  const { t } = useTranslation();
  const { storeDataStore, cartStore } = useContext(StoreContext);

  const [itemsPrice, setItemsPrice] = useState(0);
  const [totalPrice, setTotalPrice] = useState(0);

  useEffect(() => {
    getItemsPrice();
  }, []);

  useEffect(()=>{
            getTotalPrice();

  }, [itemsPrice, shippingMethod])

  const getTotalPrice = () => {
    const shippingPrice =
      shippingMethod === SHIPPING_METHODS.shipping
        ? storeDataStore.storeData?.delivery_price
        : 0;
        const totalPriceTmp = shippingPrice + itemsPrice;
    setTotalPrice(totalPriceTmp);
    onChangeTotalPrice(totalPriceTmp)
  };
  const getItemsPrice = () => {
    let tmpOrderPrice = 0;
    cartStore.cartItems.forEach((item) => {
      if (item) {
        tmpOrderPrice += item.data.price * item.data.others.qty;
      }
    });
    setItemsPrice(tmpOrderPrice);
  };

  return (
    <View style={styles.totalPrictContainer}>
      {/* <LinearGradient
          colors={["#c1bab3", "#efebe5", "#d8d1ca", "#dcdcd4", "#ccccc4"]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={[styles.background, { borderRadius: 10 }]}
        /> */}
      <View
        style={{
          flexDirection: "row",
          justifyContent: "space-around",
          borderBottomWidth: 1,
          borderBottomColor: themeStyle.PRIMARY_COLOR,
        }}
      >
        <View style={styles.priceRowContainer}>
          <View>
            <Text
              style={{
                fontFamily: `${getCurrentLang()}-SemiBold`,
                fontSize: 18,
              }}
            >
              {t("order-price")}:
            </Text>
          </View>
          <View>
            <Text
              style={{
                fontSize: 18,
                fontFamily: `${getCurrentLang()}-SemiBold`,
              }}
              type="number"
            >
              ₪{itemsPrice}{" "}
            </Text>
          </View>
        </View>

        {shippingMethod === SHIPPING_METHODS.shipping && (
          <View style={styles.priceRowContainer}>
            <View style={{marginHorizontal:10,}}>
            <Text style={{fontSize:18}}>|</Text>
              </View>
            <View>
              <Text
                style={{
                  fontFamily: `${getCurrentLang()}-SemiBold`,
                  fontSize: 18,
                }}
              >
              {t("delivery")}:
              </Text>
            </View>
            <View>
              <Text
                style={{
                  fontSize: 18,
                  fontFamily: `${getCurrentLang()}-SemiBold`,
                }}
                type="number"
              >
                ₪{storeDataStore.storeData?.delivery_price}{" "}
              </Text>
            </View>
          </View>
        )}
      </View>

      {/* {storeDataStore.storeData?.delivery_price > 0 && (
        <View style={{ borderWidth: 0.3 }}></View>
      )} */}

      <View style={[styles.priceRowContainer, { marginTop: 10 }]}>
        <View>
          <Text
            style={{
              fontFamily: `${getCurrentLang()}-SemiBold`,
              fontSize: 20,
            }}
          >
            {t("final-price")}:
          </Text>
        </View>
        <View style={{ flexDirection: "row", alignItems: "center" }}>
          <Text
            style={{
              fontSize: 20,
              fontWeight: "bold",
            }}
            type="number"
          >
            {totalPrice}{" "}
          </Text>
          <Text
            style={{
              fontWeight: "bold",
              fontSize: 17,
            }}
          >
            ₪
          </Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  totalPrictContainer: {},
  priceRowContainer: {
    flexDirection: "row",
    marginBottom: 10,
    fontSize: 25,
    alignItems: "center",
    justifyContent: "center",
  },
});
