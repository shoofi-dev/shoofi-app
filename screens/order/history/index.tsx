import { StyleSheet, View, Image, ActivityIndicator } from "react-native";
import { useContext, useEffect, useState } from "react";
import { observer } from "mobx-react";
import { useNavigation } from "@react-navigation/native";
import { StoreContext } from "../../../stores";
import themeStyle from "../../../styles/theme.style";
import { LinearGradient } from "expo-linear-gradient";
import Text from "../../../components/controls/Text";
import OrderItems from "./components/order-items";
import OrderHeader from "./components/order-header";
import { ScrollView } from "react-native-gesture-handler";
import OrderFooter from "./components/order-footer";
import { useTranslation } from "react-i18next";
import BackButton from "../../../components/back-button";



const OrderHistoryScreen = ({ route }) => {
  const { t } = useTranslation();

  const { ordersStore } = useContext(StoreContext);
  const [ordersList, setOrdersList] = useState([]);
  const [pageNumber, setPageNumber] = useState(1);
  const [isLoading, setIsLoading] = useState(false);

  const getOrders = () =>{
    ordersStore.getCustomerOrders().then((res) => {
      setOrdersList(res || []);
      setIsLoading(false);
    });
  }

  useEffect(() => {
    setIsLoading(true);
      getOrders();
      setTimeout(() => {
        getOrders();
      }, 15 * 1000);
      const interval = setInterval(() => {
        getOrders();
      }, 30 * 1000);
      return () => clearInterval(interval);
  }, []);

  const onScrollEnd = ({ nativeEvent }) => {
    const paddingToBottom = 2000;
    const isReachedBottom =
      nativeEvent.layoutMeasurement.height + nativeEvent.contentOffset.y >=
      nativeEvent.contentSize.height - paddingToBottom;
    if (isReachedBottom) {
      setPageNumber(pageNumber + 1);
    }
  };

  return (
    <View style={{ width: "100%", marginTop: 20 }}>
      <View style={{ alignItems: "center", width: "100%" }}>
        <View style={{ alignItems: "center", width: "100%" }}>
          <View style={{flexDirection:'row', width:"100%", alignItems:'center', justifyContent:'center'}}>
          <Text
            style={{
              ...styles.textLang,
              fontFamily: "ar-SemiBold",
            }}
          >
            {t("order-list")}
          </Text>
          <View style={{position:'absolute', right:10}}>
      <BackButton />
      </View>
          </View>
 
          {ordersList.length === 0 ? (
            <View style={{ marginTop: 60 }}>
              { isLoading ?           <View
                  style={{ flexDirection: "row", justifyContent: "center" }}
                >
                  <ActivityIndicator
                    size="large"
                    style={{}}
                    color={themeStyle.PRIMARY_COLOR}
                  />
                </View> : <Text style={{ fontSize: 20, color:themeStyle.WHITE_COLOR }}>{t("empty-orders")}...</Text>}
            </View>
          ) : (
            <ScrollView
              style={{ width: "100%" }}
              onMomentumScrollEnd={onScrollEnd}
              onScrollEndDrag={onScrollEnd}
              onMomentumScrollBegin={onScrollEnd}
            >
              <View style={{ marginBottom: 130 }}>
                {ordersList?.slice(0, pageNumber * 5)?.map((order) => (
                  <View
                    style={[
                      styles.orderContainer,
                      {
                        shadowColor: 'black',
                        shadowOffset: {
                          width: 0,
                          height: 0,
                        },
                        shadowOpacity: 1,
                        shadowRadius: 10.84,
                        elevation: 30,
                        borderRadius: 20,
                        backgroundColor: themeStyle.SECONDARY_COLOR
                      },
                    ]}
                  >
                    {/* <LinearGradient
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
                    /> */}
                    <OrderHeader order={order} />
                    <OrderItems order={order} />
                    <OrderFooter order={order} />
                  </View>
                ))}
              </View>
              {ordersList.length >= pageNumber * 5 && (
                <View
                  style={{ flexDirection: "row", justifyContent: "center" }}
                >
                  <ActivityIndicator
                    size="large"
                    style={{}}
                    color={themeStyle.PRIMARY_COLOR}
                  />
                </View>
              )}
            </ScrollView>
          )}
        </View>
      </View>
    </View>
  );
};
export default observer(OrderHistoryScreen);

const styles = StyleSheet.create({
  orderContainer: {
    backgroundColor: "white",
    width: "95%",
    borderRadius: 10,
    marginTop: 30,
    alignSelf: "center",
  },
  textLang: {
    fontSize: 25,
    textAlign: "left",
    color: themeStyle.WHITE_COLOR
  },
  background: {
    position: "absolute",
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
  },
});
