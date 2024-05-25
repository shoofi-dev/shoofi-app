import React from "react";
import { createStackNavigator, CardStyleInterpolators, TransitionSpecs, HeaderStyleInterpolators } from "@react-navigation/stack";
import FooterTabs from "../components/layout/footer-tabs/FooterTabs";
import CartScreen from "../screens/cart/cart";
import TermsAndConditionsScreen from "../screens/terms-and-conditions";
import MealScreen from "../screens/meal/index2";
import ProfileScreen from "../screens/profile";
import OrdersStatusScreen from "../screens/order/status";
import InvoicesScreen from "../screens/order/invoices";
import BcoinScreen from "../screens/b-coin";
import LoginScreen from "../screens/login";
import AboutUsScreen from "../screens/about-us";
import ContactUs from "../screens/contact-us";
import SearchCustomerScreen from "../screens/search-customer";
import VerifyCodeScreen from "../screens/verify-code";
import LanguageScreen from "../screens/language";
import OrderSubmittedScreen from "../screens/order/submitted";
import OrderHistoryScreen from "../screens/order/history";
import insertCustomerName from "../screens/insert-customer-name";
import OrdersListScreen from "../screens/admin/order/list";
import NewOrdersListScreen from "../screens/admin/order/new-orders/list";
import AddProductScreen from "../screens/admin/product/add";
import CalanderContainer from "../screens/admin/calander/clander-container";
import DashboardScreen from "../screens/admin/dashboard/main";
import HomeScreen from "../screens/home/home";
import uploadImages from "../screens/admin/upload-images/upload-images";
import EditTranslationsScreen from "../screens/admin/edit-translations";
import StockManagementScreen from "../screens/admin/stock-management";
import StoreManagementScreen from "../screens/admin/store-managment";
import ProductOrderScreen from "../screens/admin/products-order";

const Stack = createStackNavigator();
const TransitionScreen = {
  gestureDirection: 'horizontal',
  transitionSpec: {
      open: TransitionSpecs.TransitionIOSSpec,
      close: TransitionSpecs.TransitionIOSSpec
  },
  cardStyleInterpolator: ({ current, next, layouts }) => {
      return {
          cardStyle: {
              transform: [
                  {
                      translateX: current.progress.interpolate({
                          inputRange: [0, 1],
                          outputRange: [layouts.screen.width, 0]
                      })
                  },
                  {
                      translateX: next
                          ? next.progress.interpolate({
                                inputRange: [0, 1],
                                outputRange: [0, -layouts.screen.width]
                            })
                          : 1
                  }
              ]
          },
          overlayStyle: {
              opacity: current.progress.interpolate({
                  inputRange: [0, 1],
                  outputRange: [0, 0]
              })
          }
      };
  }
};

export const MainStackNavigator = () => {
  return (
    <Stack.Navigator
      initialRouteName="homeScreen"
      header={null}
      presentation={"presentation"}
      screenOptions={{
        cardStyle: { backgroundColor: 'transparent' },
        headerMode: false,
        ...TransitionScreen

      }}
    >
       {/* name: "menuScreen",
    title: "תפריט",
    icon: "shopping-bag1",
    iconSize: 30,
    component: MenuScreen, */}
      <Stack.Screen name="menuScreen" component={FooterTabs} />
      <Stack.Screen name="homeScreen" component={HomeScreen} />
      <Stack.Screen name="terms-and-conditions" component={TermsAndConditionsScreen} />
      <Stack.Screen name="orders-status" component={OrdersStatusScreen} />
      <Stack.Screen name="invoices-list" component={InvoicesScreen} />
      <Stack.Screen name="admin-orders" component={OrdersListScreen} />
      <Stack.Screen name="admin-new-orders" component={NewOrdersListScreen} />
      <Stack.Screen name="admin-calander" component={CalanderContainer} />
      <Stack.Screen name="admin-dashboard" component={DashboardScreen} />
      <Stack.Screen name="admin-add-product" component={AddProductScreen}  initialParams={{ categoryId: null, product: null }}/>
      <Stack.Screen name="becoin" component={BcoinScreen} />
      <Stack.Screen name="cart" component={CartScreen}/>
      <Stack.Screen name="profile" component={ProfileScreen} />
      <Stack.Screen name="login" component={LoginScreen} />
      <Stack.Screen name="search-customer" component={SearchCustomerScreen} />
      <Stack.Screen name="insert-customer-name" component={insertCustomerName} initialParams={{ name: null }}/>
      <Stack.Screen name="verify-code" component={VerifyCodeScreen} initialParams={{ phoneNumber: null }} />
      <Stack.Screen name="language" component={LanguageScreen} initialParams={{ isFromTerms: null }}/>
      <Stack.Screen name="about-us" component={AboutUsScreen} />
      <Stack.Screen name="contact-us" component={ContactUs} />
      <Stack.Screen name="order-history" component={OrderHistoryScreen} />
      <Stack.Screen name="upload-images" component={uploadImages} />
      <Stack.Screen name="edit-translations" component={EditTranslationsScreen} />
      <Stack.Screen name="stock-management" component={StockManagementScreen} />
      <Stack.Screen name="store-management" component={StoreManagementScreen} />
      <Stack.Screen name="products-order" component={ProductOrderScreen} />
      <Stack.Screen 
        name="order-submitted"
        component={OrderSubmittedScreen}
        initialParams={{ shippingMethod: null }}
      />
      <Stack.Screen
        name="meal"
        component={MealScreen}
        initialParams={{ product: null, categoryId: null }}
      />
      <Stack.Screen
        name="meal/edit"
        component={MealScreen}
        initialParams={{ index: null }}
      />
    </Stack.Navigator>
  );
};
