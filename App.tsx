import { useState, useEffect, useCallback, useContext, useRef } from "react";
import "./translations/i18n";
import { Asset } from "expo-asset";
import * as Notifications from "expo-notifications";
import * as Font from "expo-font";
import Constants from "expo-constants";
import RNRestart from "react-native-restart";
import LottieView from "lottie-react-native";
import {
  View,
  I18nManager,
  ImageBackground,
  DeviceEventEmitter,
  Text,
  Linking,
  PixelRatio,
  ScrollView,
} from "react-native";
import RootNavigator from "./navigation";
import NetInfo from "@react-native-community/netinfo";
import "moment-timezone";
import ErrorBoundary from "react-native-error-boundary";
import { useImagePreloader, getCriticalImages } from "./hooks/use-image-preloader";
const appLoaderAnimation = require("./assets/lottie/loader-animation.json");

moment.tz.setDefault("Asia/Jerusalem");

I18nManager.forceRTL(true);
I18nManager.allowRTL(true);
/* stores*/
// import * as FileSystem from "expo-file-system";

import ExpiryDate from "./components/expiry-date";
import Icon from "./components/icon";
import GeneralServerErrorDialog from "./components/dialogs/general-server-error";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { observer } from "mobx-react";
import { StoreContext } from "./stores";
import { ordersStore } from "./stores/orders";
import { calanderStore } from "./stores/calander";
import { translationsStore } from "./stores/translations";
import { adminCustomerStore } from "./stores/admin-customer";
import { errorHandlerStore } from "./stores/error-handler";
import InterntConnectionDialog from "./components/dialogs/internet-connection";
import UpdateVersion from "./components/dialogs/update-app-version";

import themeStyle from "./styles/theme.style";
import { isLatestGreaterThanCurrent } from "./helpers/check-version";
import moment from "moment";
import "moment/locale/ar"; // without this line it didn't work
import "moment/locale/he"; // without this line it didn't work

import i18n, { setTranslations } from "./translations/i18n";

import { testPrint } from "./helpers/printer/print";
import { APP_NAME, ROLES, SHIPPING_METHODS, cdnUrl } from "./consts/shared";
import _useAppCurrentState from "./hooks/use-app-current-state";
import OrderInvoiceCMP from "./components/order-invoice";
import { axiosInstance } from "./utils/http-interceptor";
import getPizzaCount from "./helpers/get-pizza-count";

import { useLocation } from "./hooks/useLocation";
import { addressStore } from "./stores/address";
import NewAddressBasedEventDialog from "./components/dialogs/new-address-based-event";
import { couponsStore } from "./stores/coupons";
import { creditCardsStore } from "./stores/creditCards";
import { deliveryDriverStore } from "./stores/delivery-driver";
import useNotifications from "./hooks/use-notifications";
import useWebSocket from "./hooks/use-websocket";
// import { cacheImage } from "./components/custom-fast-image";

moment.locale("en");

// Keep the splash screen visible while we fetch resources
//SplashScreen.preventAutoHideAsync();
let customARFonts = {
  "ar-Black": require(`./assets/fonts/ar/Black.ttf`),
  "ar-Bold": require(`./assets/fonts/ar/Bold.ttf`),
  "ar-ExtraBold": require(`./assets/fonts/ar/ExtraBold.ttf`),
  "ar-Light": require(`./assets/fonts/ar/Light.ttf`),
  "ar-Medium": require(`./assets/fonts/ar/Medium.ttf`),
  "ar-Regular": require(`./assets/fonts/ar/Regular.ttf`),
  "ar-SemiBold": require(`./assets/fonts/ar/Medium.ttf`),
  // "ar-Arslan": require(`./assets/fonts/ar/Arslan.ttf`),
  // "ar-American": require(`./assets/fonts/ar/American-Typewriter-Light.ttf`),
  // "ar-Bold": require(`./assets/fonts/ar/American-Typewriter-Bold.ttf`),
  "ar-GS-Black-Bold": require(`./assets/fonts/ar/GESSUniqueBold-Bold.otf`),

  "he-Black": require(`./assets/fonts/he/Black.ttf`),
  "he-Bold": require(`./assets/fonts/he/Bold.ttf`),
  "he-ExtraBold": require(`./assets/fonts/he/ExtraBold.ttf`),
  "he-Light": require(`./assets/fonts/he/Light.ttf`),
  "he-Medium": require(`./assets/fonts/he/Medium.ttf`),
  "he-Regular": require(`./assets/fonts/he/Regular.ttf`),
  "he-SemiBold": require(`./assets/fonts/he/SemiBold.ttf`),
  // "he-Arslan": require(`./assets/fonts/ar/Arslan.ttf`),
  "he-American": require(`./assets/fonts/he/American-Typewriter-Light.ttf`),
  // "he-Bold": require(`./assets/fonts/ar/American-Typewriter-Bold.ttf`),
   "he-GS-Black-Bold": require(`./assets/fonts/ar/GESSUniqueBold-Bold.otf`),

  "Poppins-Regular": require(`./assets/fonts/shared/Poppins-Regular.ttf`),
  "Rubik-Regular": require(`./assets/fonts/shared/Rubik-Regular.ttf`),
  "Rubik-Medium": require(`./assets/fonts/shared/Rubik-Medium.ttf`),
  "Rubik-Bold": require(`./assets/fonts/shared/Rubik-Bold.ttf`),
  "Rubik-Light": require(`./assets/fonts/shared/Rubik-Light.ttf`),
};

const targetPixelCount = 1080; // If you want full HD pictures
const pixelRatio = PixelRatio.get(); // The pixel ratio of the device
// pixels * pixelratio = targetPixelCount, so pixels = targetPixelCount / pixelRatio
const pixels = targetPixelCount / pixelRatio;

const App = () => {
  const {
    authStore,
    cartStore,
    userDetailsStore,
    menuStore,
    storeDataStore,
    languageStore,
    shoofiAdminStore,
    extrasStore
  } = useContext(StoreContext);
  // const { t } = useTranslation();
  // const invoiceRef = useRef();
  const invoicesRef = useRef([]);
  const {
    isConnected: wsConnected,
    connectionStatus: wsStatus,
    lastMessage: wsMessage,
    error: wsError,
    sendMessage,
    reconnect,
    getStats: getWebSocketStats
  } = useWebSocket();
  // const {
  //   latitude,
  //   longitude,
  //   errorMsg,
  //   isLoading,
  //   requestLocationPermission,
  //   getCurrentLocation
  // } = useLocation();

  // Request permission and get location when component mounts
  // useEffect(() => {
  //   requestLocationPermission();
  // }, []);

  // Image preloader hook
  const {
    isPreloading,
    preloadProgress,
    preloadResults,
    isComplete: imagesComplete,
    preloadImages,
    reset: resetImagePreloader
  } = useImagePreloader();

  const [assetsIsReady, setAssetsIsReady] = useState(false);
  const [appIsReady, setAppIsReady] = useState(false);
  const [isExtraLoadFinished, setIsExtraLoadFinished] = useState(false);
  const [isFontReady, setIsFontReady] = useState(false);
  const [dataLoaded, setDataLoaded] = useState(false);

  // Use the notifications hook
  const notifications = useNotifications();
  const [isOpenInternetConnectionDialog, setIsOpenInternetConnectionDialog] =
    useState(false);
  const [isOpenUpdateVersionDialog, setIsOpenUpdateVersionDialog] =
    useState(false);



 

  useEffect(() => {
    const subscription = Notifications.addNotificationResponseReceivedListener(
      (response) => {
        clearInterval(storeDataStore.repeatNotificationInterval);
        storeDataStore.setRepeatNotificationInterval(null);
      }
    );
    return () => subscription.remove();
  }, [storeDataStore.repeatNotificationInterval]);





  useEffect(() => {
    if (!I18nManager.isRTL) {
      I18nManager.forceRTL(true);
      RNRestart.Restart();
    }
  }, []);


  const handleUpdateVersionDialogAnswer = () => {
    // TODO: change to the new app url
    Linking.openURL(
      "https://sari-apps-lcibm.ondigitalocean.app/api/store/download-app/shoofi-shopping"
    );
  };

  async function prepare() {
    try {

      // Pre-load fonts, make any API calls you need to do here
      await Font.loadAsync(customARFonts);
      setIsFontReady(true);

      const fetchShoofiStoreData = shoofiAdminStore.getStoreData();
      const fetchCategoryList = shoofiAdminStore.getCategoryListData();
      const fetchTranslations = translationsStore.getTranslations();

      Promise.all([fetchShoofiStoreData, fetchCategoryList, fetchTranslations]).then(
        async (responses) => {
          setDataLoaded(true);
 
          setTimeout(async () => {
            const isShouldUpdateVersion =
              await storeDataStore.isUpdateAppVersion();
            if (isShouldUpdateVersion) {
              setIsOpenUpdateVersionDialog(true);
              return;
            }
          }, 1000);

          // const imageAssets = await cacheImages(tempHomeSlides);
          if (authStore.isLoggedIn()) {
      
            const fetchUserDetails = userDetailsStore.getUserDetails();
            const fetchStoreZCrData = shoofiAdminStore.getStoreZCrData();
            //const fetchOrders = ordersStore.getOrders(userDetailsStore.isAdmin());
            // userDetailsStore.setIsAcceptedTerms(true);
            Promise.all([
              fetchUserDetails,
              fetchStoreZCrData,
              // fetchOrders,
            ]).then(async (res: any) => {
              const store = res[0];
              if(store?.appName){
                const storeData = shoofiAdminStore.getStoreById(store.appName);
                await shoofiAdminStore.setStoreDBName(storeData?.appName || store?.appName);
                await menuStore.getMenu();
                await storeDataStore.getStoreData();
              }else{
                const appNameStorage: any = await shoofiAdminStore.getStoreDBName();
                const cartStoreDBName = await cartStore.getCartStoreDBName();
                if(cartStoreDBName){
                  // await shoofiAdminStore.setStoreDBName(appNameStorage);
                    await storeDataStore.getStoreData(cartStoreDBName);
                  
                // await menuStore.getMenu();
                // await storeDataStore.getStoreData();
                }
              }
              
              // Start preloading critical images
              await preloadCriticalImages();
            });
          } else {
            const data = await AsyncStorage.getItem("@storage_terms_accepted");
            const cartStoreDBName = await cartStore.getCartStoreDBName();
            if(cartStoreDBName){
              await storeDataStore.getStoreData(cartStoreDBName);
            }
            
            // Start preloading critical images
            await preloadCriticalImages();
          }
        }
      );
      // Artificially delay for two seconds to simulate a slow loading
      // experience. Please remove this if you copy and paste the code!
    } catch (e) {
      console.warn(e);
    } finally {
      // Tell the application to render
      setAssetsIsReady(true);
    }
  }

  // Function to preload critical images
  const preloadCriticalImages = async () => {
    try {
      // TEMPORARY: Skip image preloading to fix stuck loading issue
      setTimeout(() => {
        setAppIsReady(true);
      }, 0);
      setTimeout(() => {
        setIsExtraLoadFinished(true);
      }, 200);
      return;

      // Check if we should skip image preloading for faster startup
      const skipImagePreloading = await AsyncStorage.getItem('@skip_image_preloading');
      
      if (skipImagePreloading === 'true') {
        // Set app as ready immediately
        setTimeout(() => {
          setAppIsReady(true);
        }, 0);
        setTimeout(() => {
          setIsExtraLoadFinished(true);
        }, 200);
        return;
      }

      const storeData = storeDataStore.storeData;
      const categories = shoofiAdminStore.categoryList || [];
      const ads = []; // You can fetch ads here if needed
      
      const criticalImages = getCriticalImages(storeData, categories, ads);
      
      // If no critical images, skip preloading
      if (criticalImages.length === 0) {
        setTimeout(() => {
          setAppIsReady(true);
        }, 0);
        setTimeout(() => {
          setIsExtraLoadFinished(true);
        }, 200);
        return;
      }
      
      // Add a timeout to prevent getting stuck
      const preloadTimeout = setTimeout(() => {
        console.warn('Image preloading timeout - proceeding without preloaded images');
        setAppIsReady(true);
        setTimeout(() => {
          setIsExtraLoadFinished(true);
        }, 200);
      }, 10000); // 10 second timeout
      
      await preloadImages(criticalImages);
      
      // Clear the timeout since preloading completed
      clearTimeout(preloadTimeout);
      
      // Set app as ready after images are loaded
      setTimeout(() => {
        setAppIsReady(true);
      }, 0);
      setTimeout(() => {
        setIsExtraLoadFinished(true);
      }, 200);
    } catch (error) {
      console.warn('Error preloading images:', error);
      
      // Set app as ready even if image preloading fails
      setTimeout(() => {
        setAppIsReady(true);
      }, 0);
      setTimeout(() => {
        setIsExtraLoadFinished(true);
      }, 200);
    }
  };

  useEffect(() => {
    //setTranslations([]);
    const unsubscribe = NetInfo.addEventListener((state) => {
      setIsOpenInternetConnectionDialog(!state.isConnected);
      if (!state.isConnected) {
        prepare();
      }
    });

    return () => {
      unsubscribe();
    };
  }, []);

  const initApp = async () => {
    if(!cartStore.cartItems.length){
      await shoofiAdminStore.setStoreDBName("");
    }
    prepare();

  }

  useEffect(() => {
    if(!appIsReady){
      initApp();
    }
  }, []);

  // Fallback timeout to ensure app starts even if something goes wrong
  useEffect(() => {
    const fallbackTimeout = setTimeout(() => {
      if (!appIsReady) {
        console.warn('Fallback timeout triggered - forcing app to start');
        setAppIsReady(true);
        setTimeout(() => {
          setIsExtraLoadFinished(true);
        }, 200);
      }
    }, 15000); // 15 second fallback

    return () => clearTimeout(fallbackTimeout);
  }, [appIsReady]);

  useEffect(() => {
    const ExpDatePicjkerChange = DeviceEventEmitter.addListener(
      `PREPARE_APP`,
      prepare
    );
    return () => {
      ExpDatePicjkerChange.remove();
    };
  }, []);

  const onLayoutRootView = useCallback(async () => {
    if (appIsReady) {
      // This tells the splash screen to hide immediately! If we call this after
      // `setAppIsReady`, then we may see a blank screen while the app is
      // loading its initial state and rendering its first pixels. So instead,
      // we hide the splash screen once we know the root view has already
      // performed layout.
      //await SplashScreen.hideAsync();
    }
  }, [appIsReady]);

  const errorHandler = (error: Error, stackTrace: string) => {
    errorHandlerStore.sendClientError({
      error: {
        message: error?.message,
        cause: error?.cause,
        name: error?.name,
      },
      stackTrace,
      customerId: userDetailsStore.userDetails?.customerId,
      createdDate: moment().format(),
    });
  };
  const CustomFallback = (props: { error: Error; resetError: Function }) => {
    props.resetError();
    return <View></View>;
  };

  const getOrderTotalPrice = (order) => {
    return order?.total;
  };

  // Show splash screen until everything is ready
  const shouldShowSplash = !appIsReady;

  const loadingPage = () => {
    const version = Constants.nativeAppVersion;
    return (
      <View
        style={{
          height: shouldShowSplash ? "100%" : 0,
          display: shouldShowSplash ? "flex" : "none",
        }}
      >
        <ImageBackground
          source={require("./assets/splash-screen.png")}
          resizeMode="stretch"
          style={{ height: "100%", backgroundColor: "white" }}
        >
          <View
            style={{
              position: "absolute",
              alignSelf: "center",
              top: "70%",
              zIndex: 10,
            }}
          >
            <LottieView
              source={appLoaderAnimation}
              autoPlay
              style={{
                width: 120,
                height: 120,
              }}
              loop={true}
            />
          </View>

          {/* Image loading progress indicator */}
          {isPreloading && (
            <View
              style={{
                position: "absolute",
                alignSelf: "center",
                top: "85%",
                zIndex: 10,
                backgroundColor: "rgba(255, 255, 255, 0.9)",
                paddingHorizontal: 20,
                paddingVertical: 10,
                borderRadius: 20,
                minWidth: 200,
              }}
            >
              <Text
                style={{
                  textAlign: "center",
                  fontSize: 14,
                  color: themeStyle.BROWN_700,
                  marginBottom: 5,
                }}
              >
                Loading images... {Math.round(preloadProgress)}%
              </Text>
              <View
                style={{
                  height: 4,
                  backgroundColor: "#e0e0e0",
                  borderRadius: 2,
                  overflow: "hidden",
                }}
              >
                <View
                  style={{
                    height: "100%",
                    backgroundColor: themeStyle.PRIMARY_COLOR,
                    width: `${preloadProgress}%`,
                    borderRadius: 2,
                  }}
                />
              </View>
            </View>
          )}

          <View
            style={{
              bottom: 50,
              flexDirection: "row",
              height: "100%",
              justifyContent: "center",
            }}
          >
            <View
              style={{
                position: "absolute",
                bottom: 40,
                marginBottom: 20,
                flexDirection: "row",
              }}
            ></View>

            <Text
              style={{
                position: "absolute",
                bottom: 10,
                marginBottom: 42,
                fontSize: 20,
                color: themeStyle.BROWN_700,
              }}
            >
              <View
                style={{
                  flexDirection: "row-reverse",
                  paddingLeft: 5,
                  paddingRight: 5,
                }}
              >
                {/* <Icon style={{ width: 80, height: 21 }} icon="moveit" /> */}
              </View>
            </Text>

            <View
              style={{
                position: "absolute",
                bottom: 10,
                marginBottom: 15,
                flexDirection: "row-reverse",
                paddingLeft: 10,
              }}
            >
              {/* <Text
              style={{
                fontWeight: "bold",
                fontSize: 15,
                color: themeStyle.BROWN_700,
              }}
            >
              Sari Qashuw{" "}
            </Text>
            <Text
              style={{
                fontWeight: "bold",
                fontSize: 15,
                color: themeStyle.BROWN_700,
              }}
            >
              | Sabri Qashuw
            </Text> */}
            </View>
            <View
              style={{
                position: "absolute",
                bottom: 0,
                marginBottom: 0,
              }}
            >
              {/* <Text style={{ textAlign: "center", color: themeStyle.BROWN_700 }}>
              {version}
            </Text> */}
            </View>
          </View>
          <GeneralServerErrorDialog />
          <InterntConnectionDialog isOpen={isOpenInternetConnectionDialog} />
        </ImageBackground>
      </View>
    );
  };

  if (shouldShowSplash) {
    return loadingPage();
  }

  //userDetailsStore.isAdmin()
  return (
    <ErrorBoundary onError={errorHandler} FallbackComponent={CustomFallback}>
      <View style={{ flex: 1 }}>
        {!isExtraLoadFinished && loadingPage()}
        <StoreContext.Provider
          value={{
            cartStore: cartStore,
            authStore: authStore,
            menuStore: menuStore,
            languageStore: languageStore,
            userDetailsStore: userDetailsStore,
            storeDataStore: storeDataStore,
            ordersStore: ordersStore,
            calanderStore: calanderStore,
            translationsStore: translationsStore,
            adminCustomerStore: adminCustomerStore,
            errorHandlerStore: errorHandlerStore,
            shoofiAdminStore: shoofiAdminStore,
            extrasStore: extrasStore,
            addressStore: addressStore,
            couponsStore: couponsStore,
            creditCardsStore: creditCardsStore,
            deliveryDriverStore: deliveryDriverStore,
            notifications: {
              notifications: [],
              stats: { total: 0, unread: 0, read: 0, byType: {} },
              unreadCount: 0,
              isLoading: false,
              error: null,
              markAsRead: async (notificationId: string) => {},
              markAllAsRead: async () => {},
              deleteNotification: async (notificationId: string) => {},
              refreshNotifications: async () => {},
              connectionStatus: 'Unknown'
            },
            websocket: {
              isConnected: wsConnected,
              connectionStatus: wsStatus,
              lastMessage: wsMessage,
              error: wsError,
              sendMessage,
              reconnect,
              getStats: getWebSocketStats
            }
          }}
        >
          <View style={{ height: "100%" }}>
            <RootNavigator />
          </View>
          <NewAddressBasedEventDialog />
          <GeneralServerErrorDialog />
          <InterntConnectionDialog isOpen={isOpenInternetConnectionDialog} />
          <UpdateVersion
            isOpen={isOpenUpdateVersionDialog}
            handleAnswer={handleUpdateVersionDialogAnswer}
          />
        </StoreContext.Provider>
      </View>
    </ErrorBoundary>
  );
};
export default observer(App);
