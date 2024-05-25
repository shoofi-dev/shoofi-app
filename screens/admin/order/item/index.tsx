import { StyleSheet, View, Image, ScrollView } from "react-native";
import { useContext, useEffect, useState } from "react";
import { observer } from "mobx-react";
import { StoreContext } from "../../../../stores";
import themeStyle from "../../../../styles/theme.style";
import { fromBase64 } from "../../../../helpers/convert-base64";
import moment from "moment";
import { useTranslation } from "react-i18next";
import { getCurrentLang } from "../../../../translations/i18n";
import { isEmpty } from "lodash";
import Icon from "../../../../components/icon";
import Text from "../../../../components/controls/Text";
import DashedLine from "react-native-dashed-line";
import { cdnUrl } from "../../../../consts/shared";
import BackButton from "../../../../components/back-button";
import { LinearGradient } from "expo-linear-gradient";
import { TouchableOpacity } from "react-native-gesture-handler";
import Button from "../../../../components/controls/button/button";
import { testPrint } from "../../../../helpers/printer/print";
import useWebSocket from "react-use-websocket";
import { WS_URL } from "../../../../consts/api";
import { schedulePushNotification } from "../../../../utils/notification";
import { orderBy } from "lodash";

//1 -SENT 3 -COMPLETE 2-READY 4-CANCELLED 5-REJECTED
export const inProgressStatuses = ["1"];
export const readyStatuses = ["2", "3"];
export const canceledStatuses = ["4", "5"];

const OrderItem = ({ order }: {order: any}) => {
// const from_date = today.startOf('week');
// const to_date = today.endOf('week');
// console.log({
//   from_date: from_date.toString(),
//   today: moment().toString(),
//   to_date: to_date.toString(),
// });
// var currentDate = moment();

// var weekStart = currentDate.clone().startOf('month');
// var weekEnd = currentDate.clone().endOf('month');

// var days = [];

// for (var i = 0; i <= 20; i++) {
//   days.push(moment(weekStart).add(i, 'days').format("MMMM Do,dddd"));
// }
// console.log(days)
  const { t } = useTranslation();
  const { menuStore, ordersStore, authStore, userDetailsStore,languageStore } = useContext(
    StoreContext
  );

  const getIconByStatus = (status: string, type: number) => {
    if (type === 1) {
      if (inProgressStatuses.indexOf(status) > -1) {
        return "checked-green";
      }
      return "checked-gray";
    }
    if (type === 2) {
      if (readyStatuses.indexOf(status) > -1) {
        return "checked-green";
      }
      if (canceledStatuses.indexOf(status) > -1) {
        return "red-x";
      }
      return "checked-gray";
    }
    return "checked-gray";
  };


  const getStatusTextByStatus = (status: string) => {
      if (inProgressStatuses.indexOf(status) > -1) {
        return "in-progress";
      }
      if (readyStatuses.indexOf(status) > -1) {
        return "מוכנה";
      }
      if (canceledStatuses.indexOf(status) > -1) {
        return "בוטלה";
      }
  };
  const getNextStatusTextByStatus = (status: string) => {
      if (inProgressStatuses.indexOf(status) > -1) {
        return "מוכנה";
      }
      if (readyStatuses.indexOf(status) > -1) {
        return "ביטול";
      }
      if (canceledStatuses.indexOf(status) > -1) {
        return "בוטלה";
      }
  };
  const getColorTextByStatus = (status: string) => {
    if (inProgressStatuses.indexOf(status) > -1) {
      return "#FFBD33";
    }
    if (readyStatuses.indexOf(status) > -1) {
      return themeStyle.SUCCESS_COLOR;
    }
    if (canceledStatuses.indexOf(status) > -1) {
      return themeStyle.ERROR_COLOR;
    }
};
  const getNextColorTextByStatus = (status: string) => {
    if (inProgressStatuses.indexOf(status) > -1) {
      return themeStyle.SUCCESS_COLOR;
        }
    if (readyStatuses.indexOf(status) > -1) {
      return themeStyle.ERROR_COLOR;
    }
    if (canceledStatuses.indexOf(status) > -1) {
      return themeStyle.ERROR_COLOR;
    }
};

const updateOrderStatus = (order) => {
  ordersStore.updateOrderStatus(order)
  // console.log(order.customerDetails.recipet)
  //testPrint(order);
}

  const renderOrderDateRaw = (order) => {
    const orderIdSplit = order.orderId.split("-");
    const idPart1 = orderIdSplit[0];
    const idPart2 = orderIdSplit[2];
    return (
      <View
        style={{
          flexDirection: "row",
          justifyContent: "space-between",
          marginBottom: 10,
        }}
      >
        <View style={{ flexDirection: "row" }}>
          <View>
            <Text style={styles.dateRawText}>{t("order-number")}:</Text>
          </View>
          <View>
            <Text style={styles.dateRawText}>
              {idPart1}-{idPart2}{" "}
            </Text>
          </View>
        </View>
        <View style={{ flexDirection: "row" }}>
          <Text style={styles.dateRawText}> שם לקוח:</Text>
          <Text style={styles.dateRawText}>
            {" "}
            {order?.customerDetails?.name}
          </Text>
        </View>
        <View style={{ flexDirection: "row" }}>
          <Text style={styles.dateRawText}> מספר טלפון:</Text>
          <Text style={styles.dateRawText}>
            {order?.customerDetails?.phone}{" "}
          </Text>
        </View>
        <View style={{}}>
          <Text style={styles.dateRawText}>
            {moment(order.created).format("HH:mm DD/MM/YYYY")}
          </Text>
        </View>
      </View>
    );
  };
  const renderOrderTotalRaw = (order) => {
    const oOrder = order.order;
    return (
      <View
        style={{
          borderTopWidth: 0.4,
          borderColor: "#707070",
          paddingTop: 20,
          marginTop: 15,
          marginHorizontal: 10,
          flexDirection: "row",
          justifyContent: "space-between",
        }}
      >
        <View
          style={{
            justifyContent: "space-between",
          }}
        >
          <View style={{ flexDirection: "row", alignItems: "center" }}>
            <View>
              <Text style={styles.totalPriceText}>
                {t(oOrder.payment_method?.toLowerCase())} |{" "}
                {t(oOrder.receipt_method?.toLowerCase())}
              </Text>
            </View>
          </View>
          <View style={{ flexDirection: "row" }}>
            <View>
              <Text style={styles.totalPriceText}>{t("final-price")}:</Text>
            </View>
            <View>
              <Text style={styles.totalPriceText}>₪{order.total} </Text>
            </View>
          </View>
          <View style={{ flexDirection: "row" }}>
            <View>
              <Text style={styles.totalPriceText}>{t("order-status")}:</Text>
            </View>
            <View>
              <Text style={styles.totalPriceText}> {getStatusTextByStatus(order.status)} </Text>
            </View>
          </View>
        </View>
        <View style={{justifyContent:"center"}}>
        <Button
            text={getNextStatusTextByStatus(order.status)}
            fontSize={17}
            onClickFn={()=>updateOrderStatus(order)}
            bgColor={getNextColorTextByStatus(order.status)}
            textColor={"#442213"}
            fontFamily={`${getCurrentLang()}-Bold`}
            borderRadious={19}
          />
  
        </View>
      </View>
    );
  };

  const renderOrderNote = (note: string) => {
    return note ? (
      <View
        style={{ marginLeft: 10, alignItems: "flex-end", flexDirection: "row" }}
      >
        <Text
          style={{
            marginRight: 2,
            paddingBottom: 4,
            color: themeStyle.SUCCESS_COLOR,
          }}
        >
          * {note}
        </Text>
      </View>
    ) : null;
  };
  const renderOrderItemsExtras = (extras) => {
    return extras.map((extra) => {
      return (
        <View style={{ flexDirection: "row", alignItems: "center" }}>
          <Text style={{ marginRight: 2, paddingBottom: 4 }}>+</Text>
          {extra.value === false && (
            <Text
              style={{
                fontFamily: `${getCurrentLang()}-SemiBold`,
                marginRight: 2,
              }}
            >
              {t("without")}
            </Text>
          )}
          <Text>
            {menuStore.translate(extra.name)} {extra.value}
          </Text>
        </View>
      );
    });
  };

  const renderOrderItems = (order) => {
    return order.order.items?.map((item, index) => {
      const meal = menuStore.getFromCategoriesMealByKey(item.item_id);

      if (isEmpty(meal)) {
        return;
      }
      return (
        <View>
          {index !== 0 && (
            <DashedLine
              dashLength={5}
              dashThickness={1}
              dashGap={0}
              dashColor={themeStyle.GRAY_300}
            />
          )}
          <View
            style={{
              flexDirection: "row",
              marginTop: 15,
              justifyContent: "space-between",
              alignItems: "center",
              paddingHorizontal: 5,
            }}
          >
            <View>
              <View
                style={{
                  flexDirection: "row",
                  alignContent: "center",
                  marginLeft: 10,
                }}
              >
                <Text
                  style={{
                    fontSize: 15,
                    fontFamily: `${getCurrentLang()}-SemiBold`,
                    color: themeStyle.GRAY_700,
                  }}
                >
                  {languageStore.selectedLang === 'ar' ? meal.nameAR : meal.nameHE}

                </Text>
              </View>
              <View style={{ flexDirection: "row" }}>
                <View
                  style={{
                    flexBasis: "20%",
                    height: 100,
                    marginVertical: 10,
                    alignItems: "center",
                  }}
                >
                  <Image
                    style={{ width: "100%", height: "100%" }}
                    source={{ uri: `${cdnUrl}${meal.img[0].uri}` }}
                    resizeMode="contain"
                  />
                </View>
                {/* <View style={{ alignItems: "flex-start" }}>
                  {renderOrderItemsExtras(item.data)}
                </View> */}
              </View>
            </View>
            <View style={{ alignItems: "center" }}>
              <View>
                <Text
                  style={{
                    fontSize: 15,
                    fontFamily: `${getCurrentLang()}-SemiBold`,
                    color: themeStyle.GRAY_700,
                  }}
                >
                  {t("count")}: {item.qty}
                </Text>
              </View>
              <View style={{ marginTop: 2, alignItems: "center" }}>
                <Text
                  style={{
                    fontSize: 15,
                    fontFamily: `${getCurrentLang()}-SemiBold`,
                    color: themeStyle.GRAY_700,
                  }}
                >
                  ₪
                  {(item.item_id === 3027 ? item.price : item.price) * item.qty}
                </Text>
              </View>
            </View>
          </View>
          {/* <View>{renderOrderNote(item?.notes)}</View> */}
        </View>
      );
    });
  };

  const getTextByShippingMethod = (method) => {
    switch (method) {
      case "TAKEAWAY":
        return "takeway-service";
      case "DELIVERY":
        return "delivery-service";
      case "TABLE":
        return "in-resturant-service";
    }
  };
  const getTextStatusByShippingMethod = (method, status) => {
    if (canceledStatuses.indexOf(status) > -1) {
      return "cancelled";
    }
    switch (method) {
      case "TAKEAWAY":
        return "ready-takeaway";
      case "DELIVERY":
        return "on-way";
      case "TABLE":
        return "ready-table";
    }
  };

  const renderStatus = (order) => {
    const oOrder = JSON.parse(fromBase64(order.order));
    return (
      <View style={{ marginTop: 40 }}>
        <View style={{ alignItems: "center", marginBottom: 30 }}>
          <Text
            style={{
              fontSize: 20,
              fontFamily: `${getCurrentLang()}-SemiBold`,
              color: themeStyle.GRAY_700,
            }}
          >
            {t(getTextByShippingMethod(oOrder.receipt_method))}
          </Text>
        </View>
        <View style={{ flexDirection: "row", justifyContent: "space-around" }}>
          <View style={{ alignItems: "center" }}>
            <View>
              <Text
                style={{
                  fontSize: 20,
                  fontFamily: `${getCurrentLang()}-SemiBold`,
                  color: themeStyle.GRAY_700,
                }}
              >
                {t("in-progress")}
              </Text>
            </View>
            <View style={{ marginTop: 10 }}>
              <Icon icon={getIconByStatus(order.status, 1)} size={40} />
            </View>
          </View>
          <View style={{ alignItems: "center" }}>
            <View>
              <Text
                style={{
                  fontSize: 20,
                  fontFamily: `${getCurrentLang()}-SemiBold`,
                  color: themeStyle.GRAY_700,
                }}
              >
                {t(
                  getTextStatusByShippingMethod(
                    oOrder.receipt_method,
                    order.status
                  )
                )}
              </Text>
            </View>
            <View style={{ marginTop: 10  }}>
              <Icon icon={getIconByStatus(order.status, 2)} size={40} />
            </View>
          </View>
        </View>
      </View>
    );
  };

  return (
    <ScrollView>
            <View
              style={[
                styles.orderContainer,
                { 
                  shadowColor: getColorTextByStatus(order.status),
                  shadowOffset: {
                    width: 0,
                    height: 3,
                  },
                  shadowOpacity: 1,
                  shadowRadius: 3.84,
                  elevation: 30,
                  borderRadius: 20,
                },
              ]}
            >
                              <LinearGradient
                          colors={[
                            "#c1bab3",
                            "#efebe5",
                            "#d8d1ca",
                            "#dcdcd4",
                            "#ccccc4",
                          ]}
                          start={{ x: 0, y: 0 }}
                          end={{ x: 1, y: 1 }}
                          style={[styles.background, { borderRadius: 20 }]}
                        />
              {renderOrderDateRaw(order)}
              {renderOrderItems(order)}
              {renderOrderTotalRaw(order)}
              {/*{renderStatus(order)} */}
            </View>
    

    </ScrollView>
  );
};
export default observer(OrderItem);

const styles = StyleSheet.create({
  container: {
  
  },
  orderContainer: {
    backgroundColor: themeStyle.WHITE_COLOR,
    borderRadius: 10,
    paddingTop: 15,
    paddingHorizontal: 10,
    paddingBottom: 20,
  },
  dateRawText: {
    fontSize: 17,
    fontFamily: `${getCurrentLang()}-SemiBold`,
    color: themeStyle.GRAY_700,
  },
  totalPriceText: {
    fontSize: 15,
    fontFamily: `${getCurrentLang()}-SemiBold`,
    color: themeStyle.GRAY_700,
  },
  background: {
    position: "absolute",
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
    
  },
});
