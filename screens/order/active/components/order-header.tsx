import { LinearGradient } from "expo-linear-gradient";
import { View, StyleSheet, TouchableOpacity, Linking } from "react-native";
import themeStyle from "../../../../styles/theme.style";
import Text from "../../../../components/controls/Text";
import { useTranslation } from "react-i18next";
import { getCurrentLang } from "../../../../translations/i18n";
import moment from "moment";
import { cdnUrl, SHIPPING_METHODS } from "../../../../consts/shared";
import CustomFastImage from "../../../../components/custom-fast-image";
import { StoreContext } from "../../../../stores";
import { useContext } from "react";
import Icon from "../../../../components/icon";
import OrderTimer from "./order-timer";

const OrderHeader = ({ order }) => {
  const { t } = useTranslation();
  const oOrder = order.order;

  const { languageStore, shoofiAdminStore } = useContext(StoreContext);

  // Mock data for timer testing
  const mockTimerData = {
    status: order?.status || "1",
    totalMinutes: 45,
    remainingMinutes: Math.floor(Math.random() * 30) + 10, // Random time between 10-40 minutes
    isActive: true,
  };
  const actionHandler = async (uri) => {
    Linking.openURL(uri);
  };
  const getOrderPrice = () => {
    if (oOrder.receipt_method === SHIPPING_METHODS.shipping) {
      return (
        <View style={{ marginTop: 10, flexDirection: "row" }}>
          <Text style={styles.subTitleInfo}>{t("order-price")}: </Text>
          <Text style={styles.priceText}>₪{order.orderPrice}</Text>
        </View>
      );
    }
    return (
      <View style={{ marginTop: 10, flexDirection: "row" }}>
        <Text style={styles.subTitleInfo}>{t("order-price")}: </Text>
        <Text style={styles.priceText}>₪{order.total}</Text>
      </View>
    );
  };

  const getShippingPrice = () => {
    if (oOrder.receipt_method === SHIPPING_METHODS.shipping) {
      const shippingPrice =
        order.appliedCoupon?.discountAmount > 0
          ? order.shippingPrice - order.appliedCoupon?.discountAmount
          : order.shippingPrice;
      return (
        <View style={{ marginTop: 10, flexDirection: "row" }}>
          <Text style={styles.subTitleInfo}>{t("delivery-price")}: </Text>
          <Text style={styles.priceText}>₪{shippingPrice}</Text>
        </View>
      );
    }
    return null;
  };

  const getPriceSection = () => {
    if (oOrder.receipt_method === SHIPPING_METHODS.shipping) {
      return (
        <View>
          {getOrderPrice()}
          {getShippingPrice()}
        </View>
      );
    }
    return getOrderPrice();
  };

  const renderOrderDateRaw = (order) => {
    return (
      <View
        style={{
          flexDirection: "row",
          justifyContent: "space-between",
          marginBottom: 10,
          flexWrap: "wrap",
          // marginTop: 25,
        }}
      >
        <View style={{ flexDirection: "row" }}>
          <View>
            <Text style={styles.dateRawText}>{t("order-number")}:</Text>
            <Text style={styles.dateRawText}>{order?.appName}</Text>
          </View>
          <View>
            <Text style={styles.dateRawText}>{order.orderId} </Text>
          </View>
        </View>
      </View>
    );
  };

  return (
    <View style={{ width: "100%" }}>
      <View style={[styles.orderContainer]}>
        <View style={styles.imageWrapper}>
          <CustomFastImage
            style={styles.image}
            source={{
              uri: `${cdnUrl}${order?.storeData?.cover_sliders?.[0]}`,
            }}
            resizeMode="cover"
          />
          {/* {renderOrderDateRaw(order)} */}
        </View>
        <View style={{ marginHorizontal: 15, marginBottom: 10, marginTop: 10 }}>
          <View style={{ flexDirection: "row" }}>
            <Text style={styles.storeName}>
              {languageStore.selectedLang === "ar"
                ? order?.storeData?.name_ar
                : order?.storeData?.name_he}
            </Text>
          </View>
          <View style={{ flexDirection: "row" }}>
            <View>
              <Text style={styles.subTitleInfo}>
                {t(oOrder.payment_method?.toLowerCase())}
              </Text>
            </View>
            <Text style={{ marginHorizontal: 2 }}>.</Text>
            <View style={{ flexDirection: "row" }}>
              <Text style={styles.subTitleInfo}>{t("order-number")}: </Text>
              <Text style={styles.subTitleInfo}> {order.orderId}</Text>
            </View>
          </View>
          {getPriceSection()}
          <View
            style={{
              flexDirection: "row",
              justifyContent: "space-between",
              marginTop: 40,
              alignItems: "center",
            }}
          >
            <TouchableOpacity
              style={styles.iconWrapper}
              onPress={() => {
                const phoneNumber =
                  shoofiAdminStore?.storeData?.waSupportPhone?.replace(
                    /[^0-9]/g,
                    ""
                  );
                if (phoneNumber) {
                  const message =
                    languageStore.selectedLang === "ar"
                      ? `في عندي استفسار بالنسبه لطلبيه رقم ${order.orderId}`
                      : `אני רוצה לברר לגבי הזמנה מספר ${order.orderId}`;
                  const encodedMessage = encodeURIComponent(message);
                  Linking.openURL(
                    `https://wa.me/${phoneNumber}?text=${encodedMessage}`
                  );
                }
              }}
            >
              <Icon icon="whatapp" size={24} color={themeStyle.SUCCESS_COLOR} />
            </TouchableOpacity>

            { order?.ccPaymentRefData?.url && shoofiAdminStore?.storeData?.isShowInvoice && <View>
              {/* <Text>{order?.ccPaymentRefData?.url}</Text> */}
              <TouchableOpacity
                onPress={() => actionHandler(order?.ccPaymentRefData?.url)}
              >
                <View
                  style={{
                    alignItems: "center",
                    backgroundColor: themeStyle.GRAY_10,
                    padding: 5,
                    borderRadius: 5,
                  }}
                >
                  <View style={{ alignItems: "center" }}>
                    <Icon
                      icon="file-pdf"
                      size={25}
                      style={{ color: themeStyle.SECONDARY_COLOR, opacity: 1 }}
                    />
                  </View>
                  <View style={{ alignItems: "center" }}>
                    <Text style={{ fontSize: 12 }}>{t("invoice")}</Text>
                  </View>
                </View>
              </TouchableOpacity>
            </View>}
            <View style={styles.receiptMethodWrapper}>
              <Text>{t(oOrder.receipt_method?.toLowerCase())}</Text>
            </View>
          </View>
          <View style={{flexDirection: "row",alignItems: "center",justifyContent: "center", marginTop: 10, borderTopWidth: 1, borderTopColor: themeStyle.GRAY_20, paddingTop: 10}}>
            <Text style={{fontSize: 12, color: themeStyle.GRAY_60}}> {moment(order.orderDate).format('HH:mm DD/MM/YY')}</Text>
          </View>
        </View>
      </View>

      {/* Timer Component */}
      <View
        style={{
          position: "absolute",
          right: 20,
          top: 70,
          zIndex: 1000,
          backgroundColor: themeStyle.WHITE_COLOR,
          borderRadius: 50,
        }}
      >
        <OrderTimer order={order} mockData={mockTimerData} />
      </View>
    </View>
  );
};

export default OrderHeader;

const styles = StyleSheet.create({
  orderContainer: {
    width: "100%",
    borderRadius: 10,
  },
  textLang: {
    //   fontFamily: props.fontFamily + "Bold",
    fontSize: 25,
    textAlign: "left",
  },
  background: {
    position: "absolute",
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
  },
  dateRawText: {
    fontSize: 16,
  },
  image: {
    width: "100%",
    height: "100%",
    resizeMode: "cover",
  },
  imageWrapper: {
    width: "100%",
    height: 100,
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    overflow: "hidden",
    position: "relative",
    backgroundColor: "#eee",
  },
  storeName: {
    fontSize: themeStyle.FONT_SIZE_LG,
    fontWeight: "bold",
    textAlign: "right",
  },
  subTitleInfo: {
    fontSize: themeStyle.FONT_SIZE_SM,
    textAlign: "right",
    color: themeStyle.GRAY_60,
  },
  priceText: {
    fontSize: themeStyle.FONT_SIZE_MD,
    fontWeight: "bold",
    textAlign: "right",
    color: themeStyle.SUCCESS_COLOR,
  },
  iconWrapper: {
    padding: 10,
    backgroundColor: themeStyle.GRAY_10,
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 10,
  },
  receiptMethodWrapper: {
    backgroundColor: themeStyle.GRAY_10,
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 10,
    padding: 10,
  },
});
