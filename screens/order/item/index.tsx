import { StyleSheet, View, ScrollView } from "react-native";
import { useContext, useEffect, useState } from "react";
import { observer } from "mobx-react";
import { useNavigation, useRoute, RouteProp } from "@react-navigation/native";
import { StoreContext } from "../../../stores";
import themeStyle from "../../../styles/theme.style";
import Text from "../../../components/controls/Text";
import OrderItems from "./components/order-items";
import OrderHeader from "./components/order-header";
import OrderFooter from "../active/components/order-footer";
import { useTranslation } from "react-i18next";
import BackButton from "../../../components/back-button";

type RouteParams = {
  orderId: string;
  isHistory?: boolean;
  sourceScreen?: string;
};

const OrderItemScreen = () => {
  const { t } = useTranslation();
  const navigation = useNavigation();
  const route = useRoute<RouteProp<{ params: RouteParams }, 'params'>>();
  const { orderId, isHistory, sourceScreen } = route.params || {};

  const { ordersStore, authStore, menuStore } = useContext(StoreContext);
  const [order, setOrder] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [menu, setMenu] = useState(null);

  useEffect(() => {
    if (orderId && authStore.isLoggedIn()) {
      setIsLoading(true);
      // Get the specific order by ID - try both active orders and history
      const getOrder = async () => {
        try {
          let foundOrder = null;
          
          if (isHistory) {
            // Try to get from order history first
            const historyRes = await ordersStore.getCustomerOrdersHistory();
            if (historyRes && historyRes.length > 0) {
              foundOrder = historyRes.find(o => o._id === orderId || o.orderId === orderId);
            }
          }
          
          // If not found in history (or not from history), try active orders
          if (!foundOrder) {
            const activeRes = await ordersStore.getCustomerActiveOrders();
            if (activeRes && activeRes.length > 0) {
              foundOrder = activeRes.find(o => o._id === orderId || o.orderId === orderId);
            }
          }
          
          setOrder(foundOrder || null);
          
          if (foundOrder) {
            const menu = await menuStore.getMenu(foundOrder?.appName);
            setMenu(menu);
          }
        } catch (error) {
          console.error('Error fetching order:', error);
        } finally {
          setIsLoading(false);
        }
      };
      
      getOrder();
    }
  }, [orderId, authStore.isLoggedIn(), isHistory]);

  if (isLoading) {
    return (
      <View style={styles.container}>
   
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>{t("loading")}...</Text>
        </View>
      </View>
    );
  }

  if (!order) {
    return (
      <View style={styles.container}>

        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>{t("order-not-found")}</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* <View style={styles.header}>
        <BackButton onClick={() => navigation.goBack()} />
      </View> */}
      
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <View style={styles.orderContainer}>
          <OrderHeader order={order} isHistory={isHistory} sourceScreen={sourceScreen} />
          <View style={{marginTop: 10}}>
          <OrderItems order={order} menu={menu} />

          </View>
          {/* <OrderFooter order={order} /> */}
        </View>
      </ScrollView>
    </View>
  );
};

export default observer(OrderItemScreen);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: themeStyle.WHITE_COLOR,
    marginHorizontal: 5,
 
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 5,

  },
  headerTitle: {
    fontSize: themeStyle.FONT_SIZE_LG,
    fontWeight: 'bold',
    marginLeft: 20,
    color: themeStyle.TEXT_COLOR || '#000',
  },
  scrollView: {
    flex: 1,
  },
  orderContainer: {
    marginBottom: 100,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 18,
    color: themeStyle.GRAY_60,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorText: {
    fontSize: 18,
    color: themeStyle.ERROR_COLOR || '#ff0000',
  },
});
