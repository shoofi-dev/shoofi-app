import { useState, useEffect, useCallback, useContext, useRef } from "react";
import "./translations/i18n";
import { Asset } from "expo-asset";
import * as Notifications from "expo-notifications";
import { captureRef } from "react-native-view-shot";
import EscPosPrinter, {
  getPrinterSeriesByName,
} from "react-native-esc-pos-printer";
import * as Font from "expo-font";
import Constants from "expo-constants";
import RNRestart from "react-native-restart";
import {
  View,
  I18nManager,
  ImageBackground,
  Image,
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
import { SITE_URL, WS_URL } from "./consts/api";
import themeStyle from "./styles/theme.style";
import { isLatestGreaterThanCurrent } from "./helpers/check-version";
import moment from "moment";
import "moment/locale/ar"; // without this line it didn't work
import useWebSocket, { ReadyState } from "react-use-websocket";
import i18n, { setTranslations } from "./translations/i18n";
import {
  registerForPushNotificationsAsync,
  schedulePushNotification,
} from "./utils/notification";
import { testPrint } from "./helpers/printer/print";
import { ROLES, cdnUrl } from "./consts/shared";
import _useAppCurrentState from "./hooks/use-app-current-state";
import OrderInvoiceCMP from "./components/order-invoice";
// import { cacheImage } from "./components/custom-fast-image";

moment.locale("en");

// Keep the splash screen visible while we fetch resources
//SplashScreen.preventAutoHideAsync();
let customARFonts = {
  "ar-Black": require(`./assets/fonts/ar/Tajawal-Black.ttf`),
  "ar-GS-Black-Bold": require(`./assets/fonts/ar/GESSUniqueBold-Bold.otf`),
  "ar-GS-Black-Light": require(`./assets/fonts/ar/GESSUniqueLight-Light.otf`),
  "ar-Bold": require(`./assets/fonts/ar/Tajawal-Bold.ttf`),
  "ar-ExtraBold": require(`./assets/fonts/ar/ExtraBold.ttf`),
  "ar-Light": require(`./assets/fonts/ar/Tajawal-Light.ttf`),
  "ar-Medium": require(`./assets/fonts/ar/Medium.ttf`),
  "ar-Regular": require(`./assets/fonts/ar/Regular.ttf`),
  "ar-SemiBold": require(`./assets/fonts/ar/Tajawal-Medium.ttf`),
  "ar-Arslan": require(`./assets/fonts/ar/Arslan.ttf`),
  "ar-American": require(`./assets/fonts/ar/American-Typewriter-Light.ttf`),
  "ar-American-bold": require(`./assets/fonts/ar/American-Typewriter-Bold.ttf`),

  "he-Black": require(`./assets/fonts/he/Black.ttf`),
  "he-Bold": require(`./assets/fonts/he/Bold.ttf`),
  "he-ExtraBold": require(`./assets/fonts/he/ExtraBold.ttf`),
  "he-Light": require(`./assets/fonts/he/Light.ttf`),
  "he-Medium": require(`./assets/fonts/he/Medium.ttf`),
  "he-Regular": require(`./assets/fonts/he/Regular.ttf`),
  "he-SemiBold": require(`./assets/fonts/he/SemiBold.ttf`),
  "he-Arslan": require(`./assets/fonts/ar/Arslan.ttf`),
  "he-American": require(`./assets/fonts/he/American-Typewriter-Light.ttf`),
  "he-American-bold": require(`./assets/fonts/ar/American-Typewriter-Bold.ttf`),
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
  } = useContext(StoreContext);
  // const { t } = useTranslation();
  // const invoiceRef = useRef();
  const invoicesRef = useRef([]);

  const [assetsIsReady, setAssetsIsReady] = useState(false);
  const [appIsReady, setAppIsReady] = useState(false);
  const [isExtraLoadFinished, setIsExtraLoadFinished] = useState(false);
  const [isFontReady, setIsFontReady] = useState(false);
  const [isPrinting, setIsPrinting] = useState(false);
  const [expoPushToken, setExpoPushToken] = useState("123");
  const [notification, setNotification] = useState(null);
  const [invoiceOrder, setInvoiceOrder] = useState(null);
  const [printer, setPrinter] = useState(null);
  const [printOrdersQueue, setPrintOrdersQueue] = useState([]);
  const [invoiceScrollViewSize, setInvoiceScrollViewSize] = useState({
    w: 0,
    h: 0,
  });

  const notificationListener = useRef(null);
  const responseListener = useRef(null);
  const [isOpenInternetConnectionDialog, setIsOpenInternetConnectionDialog] =
    useState(false);
  const [isOpenUpdateVersionDialog, setIsOpenUpdateVersionDialog] =
    useState(false);

  const { readyState, sendJsonMessage, lastJsonMessage } = useWebSocket(
    WS_URL,
    {
      onOpen: (data) => {
        // console.log("connected", data);
      },
      onClose: () => {
        // console.log("closed websocket");
      },
      shouldReconnect: (closeEvent) => true,
      queryParams: { customerId: userDetailsStore.userDetails?.customerId },
    }
  );

  const connectionStatus = {
    [ReadyState.CONNECTING]: "Connecting",
    [ReadyState.OPEN]: "Open",
    [ReadyState.CLOSING]: "Closing",
    [ReadyState.CLOSED]: "Closed",
    [ReadyState.UNINSTANTIATED]: "Uninstantiated",
  }[readyState];

  const repeatNotification = () => {
    const tmpRepeatNotificationInterval = setInterval(() => {
      schedulePushNotification({
        data: {
          orderId: 1,
        },
      });
    }, 10000);
    storeDataStore.setRepeatNotificationInterval(tmpRepeatNotificationInterval);
  };

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
    if (userDetailsStore.isAdmin()) {
      registerForPushNotificationsAsync().then((token) =>
        setExpoPushToken(token)
      );

      notificationListener.current =
        Notifications.addNotificationReceivedListener((notification) => {
          setNotification(notification);
        });

      responseListener.current =
        Notifications.addNotificationResponseReceivedListener((response) => {});

      return () => {
        Notifications.removeNotificationSubscription(
          notificationListener.current
        );
        Notifications.removeNotificationSubscription(responseListener.current);
      };
    }
  }, [userDetailsStore.userDetails]);

  const listenToNewOrder = async () => {
    if (lastJsonMessage && lastJsonMessage.type === "new order" || lastJsonMessage && lastJsonMessage.type === "order viewed updated") {
      await ordersStore.getNotViewdOrders(userDetailsStore.isAdmin(ROLES.all));
    }
    if (
      lastJsonMessage &&
      (lastJsonMessage.type === "new order" ||
        lastJsonMessage.type === "print not printed") &&
      userDetailsStore.isAdmin()
    ) {
      if (userDetailsStore.isAdmin(ROLES.all) && !isPrinting) {
        printNotPrinted();
      }
      if (!storeDataStore.repeatNotificationInterval && lastJsonMessage.type !== "print not printed") {
        repeatNotification();
      }
    }
  };

  const getInvoiceSP = async (queue) => {
    const SPs = [];
    for (let i = 0; i < queue.length; i++) {
      const invoiceRef = invoicesRef.current[queue[i].orderId];
      const result = await captureRef(invoiceRef, {
        result: "data-uri",
        width: pixels,
        quality: 1,
        format: "png",
      });
      SPs.push(result);
    }
    return SPs;
  };
  const printInvoice = async (invoiceRef) => {
    const result = await captureRef(invoiceRef, {
      result: "data-uri",
      width: pixels,
      quality: 1,
      format: "png",
    });
    const isPrinted = await testPrint(result, printer);
  };

  const printNotPrinted = async () => {
    setIsPrinting(true);
    try{
      ordersStore
      .getOrders(true, ["1","2","3","4","5"], null, true)
      .then(async (res) => {
        const notPrintedOrderds = res;
        if (notPrintedOrderds?.length > 0) {
          setPrintOrdersQueue(notPrintedOrderds);
        } else {
          setIsPrinting(false);
        }
      })
      .catch((err) => {
        setIsPrinting(false);
      });
    }catch{
      setIsPrinting(false);
    }
  };

  const forLoop = async (queue) => {
    try {
      const orderInvoicesPS = await getInvoiceSP(queue);
      if (userDetailsStore.isAdmin(ROLES.all)) {
        const isPrinted = await testPrint(orderInvoicesPS, printer);
        if (isPrinted) {
          for (let i = 0; i < queue.length; i++) {
            await ordersStore.updateOrderPrinted(queue[i]._id, true);
          }
          setPrintOrdersQueue([]);
        }
        setIsPrinting(false);
        printNotPrinted();
      }
    } catch {
      setIsPrinting(false);
    }
  };

  useEffect(() => {
    if (printOrdersQueue.length > 0) {
      setTimeout(() => {
        forLoop(printOrdersQueue);
      }, 1000);
    }else{
      setIsPrinting(false);
    }
  }, [printOrdersQueue]);


  useEffect(() => {
    listenToNewOrder();
  }, [lastJsonMessage, userDetailsStore.userDetails]);

  const initPrinter = async () => {
    await EscPosPrinter.init({
      target: "BT:00:01:90:56:EB:70",
      seriesName: getPrinterSeriesByName("TM-m30"),
      language: "EPOS2_LANG_EN",
    });
    const printing = new EscPosPrinter.printing();
    setPrinter(printing);
  };

  const { currentAppState } = _useAppCurrentState();
  useEffect(() => {
    console.log("currentAppState", currentAppState);
    if (
      currentAppState === "active" &&
      authStore.isLoggedIn() &&
      userDetailsStore.isAdmin() &&
      appIsReady
    ){
      if(userDetailsStore.isAdmin(ROLES.all) && !isPrinting){
        initPrinter();
        printNotPrinted();
      }
      ordersStore.getNotViewdOrders(userDetailsStore.isAdmin(ROLES.all));
    }
  }, [appIsReady, userDetailsStore.userDetails?.phone, currentAppState]);

  // print not printied backup
  useEffect(() => {
    const interval = setInterval(() => {
      if (
        currentAppState === "active" &&
        authStore.isLoggedIn() &&
        userDetailsStore.isAdmin() &&
        appIsReady
      ){
        if(userDetailsStore.isAdmin(ROLES.all) && !isPrinting){
          // initPrinter();
          printNotPrinted();
        }
        ordersStore.getNotViewdOrders(userDetailsStore.isAdmin(ROLES.all));
      }    }, 60 * 1000);
    return () => clearInterval(interval);
  }, [appIsReady, userDetailsStore.userDetails?.phone, currentAppState]);

  useEffect(()=>{
    if(currentAppState === "active" &&
        userDetailsStore.isAdmin() &&
        appIsReady){
          if(ordersStore.notViewdOrders?.length > 0){
            if (!storeDataStore.repeatNotificationInterval) {
              repeatNotification();
            }
          }else{
            clearInterval(storeDataStore.repeatNotificationInterval);
            storeDataStore.setRepeatNotificationInterval(null);
          }
    }
  }, [ordersStore.notViewdOrders, appIsReady, userDetailsStore.userDetails?.phone, currentAppState]);

  useEffect(() => {
    if (!I18nManager.isRTL) {
      I18nManager.forceRTL(true);
      RNRestart.Restart();
    }
  }, []);

  const cacheImages = (images) => {
    return new Promise((resolve) => {
      const tempImages = images.map(async (image) => {
        if (typeof image === "string") {
          await Image.prefetch(image);
        } else {
          await Asset.fromModule(image).downloadAsync();
        }
      });
      resolve(true);
    });
  };
  const cacheImages2 = (images) => {
    return new Promise(async (resolve) => {
      for (let index = 0; index < images.length; index++) {
        const res = await Image.prefetch(images[index]);
      }
      resolve(true);
    });
  };

  const deleteCreditCardData = async (appversion: string) => {
    const data = await AsyncStorage.getItem("@storage_CCData");
    const ccDetails = JSON.parse(data);
    if (ccDetails && !ccDetails?.cvv) {
      await AsyncStorage.removeItem("@storage_CCData");
    }
  };

  const handleV02 = async (appversion: string) => {
    if (
      appversion === "1.0.0" ||
      appversion === "1.0.1" ||
      appversion === "1.0.2"
    ) {
      setIsOpenUpdateVersionDialog(true);
      return true;
    }
    return false;
  };

  const handleVersions = async () => {
    const appVersion = Constants.nativeAppVersion;
    const currentVersion = await AsyncStorage.getItem("@storage_version");
    deleteCreditCardData(appVersion);
    const flag = await handleV02(appVersion);
    if (flag) {
      return;
    }
    if (
      !currentVersion ||
      isLatestGreaterThanCurrent(appVersion, currentVersion)
    ) {
      await AsyncStorage.setItem("@storage_version", appVersion?.toString());
      return;
    }
  };

  const handleUpdateVersionDialogAnswer = () => {
    Linking.openURL("https://onelink.to/zky772");
  };

  async function prepare() {
    try {
      //authStore.resetAppState()
      // handleVersions();
      // Pre-load fonts, make any API calls you need to do here
      await Font.loadAsync(customARFonts);
      setIsFontReady(true);
      const imageAssets2 = cacheImages([
        require("./assets/store-logo.png"),
        require("./assets/categories/long-cake-active.png"),
        require("./assets/categories/long-cake-inactive.png"),
        require("./assets/categories/moouse-active.png"),
        require("./assets/categories/moouse-inactive.png"),
        require("./assets/categories/cookies-active.png"),
        require("./assets/categories/cookies-inactive.png"),
        require("./assets/categories/birthday-active.png"),
        require("./assets/categories/birthday-inactive.png"),
        require("./assets/categories/design-active.png"),
        require("./assets/categories/design-inactive.png"),
        require("./assets/categories/desserts-active.png"),
        require("./assets/categories/desserts-inactive.png"),
        require("./assets/categories/shmareem-active.png"),
        require("./assets/categories/shmareem-inactive.png"),
      ]);

      const fetchMenu = menuStore.getMenu();
      //const fetchHomeSlides = menuStore.getSlides();
      const fetchStoreDataStore = storeDataStore.getStoreData();
      const fetchTranslations = translationsStore.getTranslations();

      Promise.all([fetchMenu, fetchStoreDataStore, fetchTranslations]).then(
        async (responses) => {
          const tempHomeSlides = storeDataStore.storeData.home_sliders.map(
            (slide) => {
              return `${cdnUrl}${slide}`;
            }
          );

          const imageAssets = await cacheImages(tempHomeSlides);
          if (authStore.isLoggedIn()) {
            const fetchUserDetails = userDetailsStore.getUserDetails();
            //const fetchOrders = ordersStore.getOrders(userDetailsStore.isAdmin());
            userDetailsStore.setIsAcceptedTerms(true);
            Promise.all([
              fetchUserDetails,
              // fetchOrders,
            ]).then((res) => {
              setTimeout(() => {
                setAppIsReady(true);
              }, 2000);
              setTimeout(() => {
                setIsExtraLoadFinished(true);
              }, 2400);
            });
            const imageAssets3 = await cacheImages2(
              menuStore.categoriesImages["1"]
            );
          } else {
            const data = await AsyncStorage.getItem("@storage_terms_accepted");
            userDetailsStore.setIsAcceptedTerms(JSON.parse(data));
            setTimeout(() => {
              setAppIsReady(true);
            }, 2000);
            setTimeout(() => {
              setIsExtraLoadFinished(true);
            }, 2400);
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

  useEffect(() => {
    prepare();
  }, []);


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

  // const idPart1 = orderIdSplit[0];
  // const idPart2 = orderIdSplit[2];

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

  const loadingPage = () => {
    const version = Constants.nativeAppVersion;
    return (
      <View
        style={{
          height: appIsReady ? 0 : "100%",
          display: appIsReady ? "none" : "flex",
        }}
      >
        <ImageBackground
          source={require("./assets/splash-screen-8.jpg")}
          resizeMode="stretch"
          style={{ height: "100%", backgroundColor: "white" }}
        >
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

  if (!appIsReady) {
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
          }}
        >
          <View style={{ height: "100%" }}>
            <RootNavigator />
          </View>
          {userDetailsStore.isAdmin(ROLES.all) &&
            printOrdersQueue.map((invoice) => {
              return (
                <ScrollView
                  style={{ flex: 1, maxWidth: 820, alignSelf: "center" }}
                  onContentSizeChange={(width, height) => {
                    setInvoiceScrollViewSize({ h: height, w: width });
                  }}
                  key={invoice.orderId}
                >
                  <View
                    // ref={invoiceRef}

                    ref={(el) => (invoicesRef.current[invoice.orderId] = el)}
                    style={{
                      width: "100%",

                      flexDirection: "row",
                      zIndex: 10,
                      height: "100%",
                    }}
                  >
                    <OrderInvoiceCMP invoiceOrder={invoice} />
                  </View>
                </ScrollView>
              );
            })}
          <ExpiryDate />
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
