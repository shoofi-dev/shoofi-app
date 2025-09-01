import { StyleSheet, View, TouchableOpacity, I18nManager } from "react-native";
import { useState, useEffect, useRef, useContext, useCallback } from "react";
import { observer } from "mobx-react";
import { StoreContext } from "../../stores";
import themeStyle from "../../styles/theme.style";
import { useFocusEffect, useNavigation, useRoute } from "@react-navigation/native";
import Animated, {
  useSharedValue,
  useAnimatedScrollHandler,
  Extrapolate,
} from "react-native-reanimated";
import Button from "../../components/controls/button/button";
import AllCategoriesList, {
  AllCategoriesListRef,
} from "./components/AllCategoriesList";
import Icon from "../../components/icon";
import { useTranslation } from "react-i18next";
import { ActivityIndicator } from "react-native-paper";
import CategoryList from "./components/category/category-list";
import StoreHeaderCard from "./components/StoreHeaderCard";
import { ShippingMethodPickStatic } from "../../components/address/shipping-method-pick/shipping-method-static";
import CouponCarousel from "../../components/shared/CouponCarousel";
import { getCurrentLang } from "../../translations/i18n";
import BackButton from "../../components/back-button";
import Text from "../../components/controls/Text";
import StorePlaceHolder from "../../components/placeholders/StorePlaceHolder";
import { APP_NAME } from "../../consts/shared";
import GeneralCategoriesList from "./components/GeneralCategoriesList";
import AllGeneralCategoriesList from "./components/AllGeneralCategoriesList";
import GeneralCategoriesModal from "../../components/GeneralCategoriesModal";
import Modal from "react-native-modal";
const HEADER_HEIGHT = 290;
const COUPON_CONTAINER_HEIGHT = 80;
const STICKY_HEADER_HEIGHT = 90;
// Calculate dynamic heights based on active coupons
const getCouponContainerHeight = (activeCoupons) => activeCoupons.length > 0 ? COUPON_CONTAINER_HEIGHT : 0;
const getScrollablePartHeight = (activeCoupons) => HEADER_HEIGHT + getCouponContainerHeight(activeCoupons);
const categoryHeaderHeight = 35;
const productHeight = 140;
const sectionMargin = 28;
const MenuGeneralCategoriesScreen = () => {
  const { t } = useTranslation();
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const { categoryId } = route.params;
  const scrollViewRef = useRef<Animated.ScrollView>(null);
  const allCategoriesListRef = useRef<AllCategoriesListRef>(null);
  const categoryUpdateTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const manualSelectionRef = useRef<boolean>(false);
  const { menuStore, storeDataStore, cartStore, languageStore, shoofiAdminStore, websocket, addressStore, couponsStore } =
    useContext(StoreContext);
  const { availableDrivers, availableDriversLoading: driversLoading } = shoofiAdminStore;
  const { isConnected, connectionStatus, lastMessage } = websocket;
  const [isThisStoreInCart, setIsThisStoreInCart] = useState(false);
  // Handle menu refresh messages
       useEffect(() => { 
        if (lastMessage) {
          if (lastMessage.type === 'menu_refresh') {
            // Check if the message is for the current app
            if (lastMessage.data?.appName === storeDataStore.storeData?.appName) {
              // Refresh the menu
              menuStore.getMenu();
            }
          }
        }
       },[lastMessage])

       useEffect(() => {
         const defaultAddress = addressStore?.defaultAddress || addressStore?.systemAddress;
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
       }, [addressStore?.defaultAddress, storeDataStore.storeData?.location?.lat, storeDataStore.storeData?.location?.lng]);

  const [cartPrice, setCartPrice] = useState(0);

  const [categoryList, setCategoryList] = useState(null);
  const [generalCategories, setGeneralCategories] = useState(null);
  const [selectedGeneralCategory, setSelectedGeneralCategory] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [cartCount, setCartCount] = useState(0);
  const [activeCoupons, setActiveCoupons] = useState([]);
  const [isGeneralCategoriesModalOpen, setIsGeneralCategoriesModalOpen] = useState(false);
  const isSilentRefreshing = useRef(false);

  useEffect(() => {
    setCartCount(cartStore.getProductsCount());
    setCartPrice(cartStore.getProductsPrice());
  }, [cartStore.cartItems]);

  const getMenu = () => {
    const selectedGeneralCategory = menuStore.generalCategories.find((cat) => cat._id === categoryId);
    
    // Filter categories that support the selected general category
    const filteredCategories = menuStore.categories?.filter(category => 
      category.supportedGeneralCategoryIds && category.products.length > 0 &&
      category.supportedGeneralCategoryIds.some(id => 
        id === selectedGeneralCategory?._id || id.$oid === selectedGeneralCategory?._id
      )
    ) || [];
    
    setSelectedGeneralCategory(selectedGeneralCategory);
    setCategoryList(filteredCategories);
    setGeneralCategories(menuStore.generalCategories);
    if (!selectedCategory && filteredCategories?.length > 0) {
      setSelectedCategory(filteredCategories[0]);
    }
  };

  useEffect(() => {
    if(menuStore.generalCategories){
      getMenu();
    }
  }, [menuStore.generalCategories]);


    // Clear menu data when navigating back to prevent showing old store data
    useFocusEffect(
      useCallback(() => {
        // Check if we're coming from stores-list via route params
        const isFromStoresList = route.params?.fromStoresList;
        
        
        if (isFromStoresList) {
          // Clear store data first to prevent showing old data
          menuStore.clearMenu();
          
          // Clear local state when entering the screen to prevent showing old data
          setCategoryList(null);
          setSelectedCategory(null);
          storeDataStore.storeData = null;
          
          // Clear the route params to prevent future resets
          navigation.setParams({ fromStoresList: undefined });
        }
        
        return () => {
          // Only clear menu data when leaving the screen if we came from stores-list
          if (isFromStoresList) {
            menuStore.clearMenu();
          }
        };
      }, [menuStore, navigation, route.params])
    );
    
  const initMenu = async () => {
    await menuStore.getMenu();
    await storeDataStore.getStoreData();
  }

  const fetchActiveCoupons = async () => {
    try {
      const storeAppName = storeDataStore.storeData?.appName;
      const response = await couponsStore.getActiveCoupons(1, 20, storeAppName); // Get first 20 active coupons
      if (response && response.coupons) {
        setActiveCoupons(response.coupons);
      }
    } catch (error) {
      console.error('Failed to fetch active coupons:', error);
    }
  };

  // Silent refresh handler for menu screen
  const handleSilentRefresh = useCallback(() => {
    if (isSilentRefreshing.current) {
      console.log('Menu silent refresh already in progress, skipping');
      return;
    }

    console.log('Starting silent refresh of menu data');
    isSilentRefreshing.current = true;

    // Refresh menu and store data silently
    Promise.all([
      menuStore.getMenu(),
      storeDataStore.getStoreData(),
      fetchActiveCoupons(),
    ]).finally(() => {
      isSilentRefreshing.current = false;
      console.log('Menu silent refresh completed');
    });
  }, [menuStore, storeDataStore, fetchActiveCoupons]);

  // Use silent refresh hook for menu screen


  useEffect(() => {
    initMenu();
  }, []);

  useEffect(() => {
    if (storeDataStore.storeData?.appName) {
      fetchActiveCoupons();
    }
  }, [storeDataStore.storeData?.appName]);

  const handleCategorySelect = useCallback(
    (cat) => {
      if (selectedCategory?._id !== cat._id) {
        // Set flag to prevent scroll handler from overriding
        manualSelectionRef.current = true;
        
        setSelectedCategory(cat);
        return;
        // Find the category index in the list
        const categoryIndex = categoryList.findIndex(c => c._id === cat._id);
        
        if (categoryIndex !== -1) {
          // Calculate approximate position based on category index
          let offset = 0;
          for (let i = 0; i < categoryIndex; i++) {
            const category = categoryList[i];
            if (category.products && category.products.length > 0) {
              const productsHeight = category.products.length * productHeight;
              offset += categoryHeaderHeight + productsHeight + sectionMargin;
            }
          }
          
          const finalOffset = getScrollablePartHeight(activeCoupons) + offset + 15 - STICKY_HEADER_HEIGHT;
          
          scrollViewRef.current?.scrollTo({
            y: finalOffset,
            animated: true,
          });
        }
        
        // Clear the flag after a delay to allow scroll handler to work again
        setTimeout(() => {
          manualSelectionRef.current = false;
        }, 500);
      }
    },
    [selectedCategory, categoryList]
  );

  const handleCategoryVisible = useCallback(
    (categoryId: string) => {
      if (categoryUpdateTimeoutRef.current) {
        clearTimeout(categoryUpdateTimeoutRef.current);
      }

      categoryUpdateTimeoutRef.current = setTimeout(() => {
        const category = categoryList.find((cat) => cat._id === categoryId);
        if (selectedCategory?._id !== categoryId) {
          setSelectedCategory(category);
        }
      }, 50);
    },
    [categoryList, selectedCategory]
  );

  const scrollY = useRef(new Animated.Value(0)).current;

  // Add scroll handler to detect visible category
  const handleScroll = (event) => {
    // Update the animated value for header animations
    scrollY.setValue(event.nativeEvent.contentOffset.y);

    const scrollOffset = event.nativeEvent.contentOffset.y;
    const adjustedOffset = scrollOffset - getScrollablePartHeight(activeCoupons);

    if (adjustedOffset < 0) return;

    // Don't update selected category if a manual selection was just made
    if (manualSelectionRef.current) return;

    // Calculate which category should be visible based on scroll position
    let accumulatedHeight = 0;
    for (const category of categoryList) {
      if (category.products && category.products.length > 0) {
        const productsHeight = category.products.length * productHeight;
        const categoryHeight =
          categoryHeaderHeight + productsHeight + sectionMargin;

        if (
          adjustedOffset >= accumulatedHeight &&
          adjustedOffset < accumulatedHeight + categoryHeight
        ) {
          if (selectedCategory?._id !== category._id) {
            setSelectedCategory(category);
          }
          break;
        }
        accumulatedHeight += categoryHeight;
      }
    }
  };

  const headerTranslateY = scrollY.interpolate({
    inputRange: [0, getScrollablePartHeight(activeCoupons) - STICKY_HEADER_HEIGHT],
    outputRange: [0, -(getScrollablePartHeight(activeCoupons) - STICKY_HEADER_HEIGHT)],
    extrapolate: Extrapolate.CLAMP,
  });

  const stickyCategoryHeaderOpacity = scrollY.interpolate({
    inputRange: [
      getScrollablePartHeight(activeCoupons) - STICKY_HEADER_HEIGHT - 1,
      getScrollablePartHeight(activeCoupons) - STICKY_HEADER_HEIGHT,
    ],
    outputRange: [0, 1],
    extrapolate: Extrapolate.CLAMP,
  });

  const stickyHeaderZIndex = scrollY.interpolate({
    inputRange: [
      getScrollablePartHeight(activeCoupons) - STICKY_HEADER_HEIGHT - 1,
      getScrollablePartHeight(activeCoupons) - STICKY_HEADER_HEIGHT,
    ],
    outputRange: [0, 100], // zIndex 0 when opacity 0, 100 when opacity 1
    extrapolate: Extrapolate.CLAMP,
  });



  const takeAwayReadyTime = {
    min: storeDataStore.storeData?.minReady,
    max: storeDataStore.storeData?.maxReady,
  };
  const deliveryTime = {
    min: availableDrivers?.area?.minETA + takeAwayReadyTime.min,
    max: availableDrivers?.area?.maxETA + takeAwayReadyTime.max,
  };
  const handleCartClick = () => {
    navigation.navigate("cart");
  };

  const handleShippingMethodChange = async (value) => {
    await cartStore.setShippingMethod(value);
  };

  const handleMenuIconPress = () => {
    setIsGeneralCategoriesModalOpen(true);
  };

  const handleGeneralCategorySelect = (category) => {
    setIsGeneralCategoriesModalOpen(false);
    // Update the current screen to show the selected general category
    setSelectedGeneralCategory(category);
    
    // Update route params to reflect the new category selection
    navigation.setParams({ categoryId: category._id });
    
    // Filter categories that support the selected general category
    const filteredCategories = menuStore.categories?.filter(categoryItem => 
      categoryItem.supportedGeneralCategoryIds && categoryItem.products.length > 0 &&
      categoryItem.supportedGeneralCategoryIds.some(id => 
        id === category._id || id.$oid === category._id
      )
    ) || [];
    
    setCategoryList(filteredCategories);
    
    // Set the first category as selected if available
    if (filteredCategories?.length > 0) {
      setSelectedCategory(filteredCategories[0]);
    } else {
      setSelectedCategory(null);
    }
  };

  const handleCloseGeneralCategoriesModal = () => {
    setIsGeneralCategoriesModalOpen(false);
  };
  useEffect(() => {
    const getStoreData = async () => {
      const cartStoreDBName = await cartStore.getCartStoreDBName();
      const storerDBName = storeDataStore.storeData?.appName;

      setIsThisStoreInCart(cartStoreDBName === storerDBName)
    }
    getStoreData();
  }, [cartStore.cartItems, storeDataStore.storeData]);

  

  if (!storeDataStore.storeData ||!categoryList || !selectedCategory) {
    return (
      <StorePlaceHolder />
    );
  }

  
  return (
    <View style={{ flex: 1, backgroundColor: "#fff" }}>
            <Animated.View
        style={[
          styles.stickyHeader,
          {
            // opacity: stickyCategoryHeaderOpacity,
            // transform: [{ translateY: headerTranslateY }],
            // zIndex: stickyHeaderZIndex,
            height:150,
          },
        ]}
      >
        <View
          style={{ marginLeft: 15, flexDirection: "row", alignItems: "center" }}
        >
          <BackButton />
          <View style={{ marginLeft: 10 }}>
            <Text style={{ fontSize: themeStyle.LG, fontWeight: "bold" }}>
              {languageStore.selectedLang === "ar"
                ? storeDataStore.storeData.name_ar
                : storeDataStore.storeData.name_he}
            </Text>
          </View>
        </View>
        <View style={{ flexDirection: "row", alignItems: "center",marginLeft: 15, marginTop: 15, marginBottom: 5 }}>
        <TouchableOpacity onPress={handleMenuIconPress} activeOpacity={0.7}>
          <Icon icon="menu1" size={24} />
        </TouchableOpacity>
          <View style={{ marginLeft: 10 }}>
            <Text style={{ fontSize: themeStyle.FONT_SIZE_LG, fontFamily: `${getCurrentLang()}-Bold` }}>{getCurrentLang() === "ar" ? selectedGeneralCategory.nameAR :  selectedGeneralCategory.nameHE}</Text>
          </View>
    
        </View>
        <CategoryList
          style={{ width: "100%" }}
          categoryList={categoryList}
          onCategorySelect={handleCategorySelect}
          selectedCategory={selectedCategory}
          isDisabledCatItem={false}
        />
      </Animated.View>
      <Animated.ScrollView
        ref={scrollViewRef}
        style={{ flex: 1 }}
        contentContainerStyle={{
      
        }}
        scrollEventThrottle={16}
        onScroll={(event) => {
          handleScroll(event);
        }}
      >
        <View style={{ }}>
     <AllGeneralCategoriesList
            ref={allCategoriesListRef}
            categoryList={categoryList}
            categoryId={selectedCategory._id}
             productId={route.params?.productId} // Removed productId prop
          />
          
        </View>
      </Animated.ScrollView>




      {/* <View style={styles.fixedButtons} pointerEvents="box-none">
       <BackButton  />
      </View> */}

      <View style={styles.cartContainer}>
        {cartCount > 0 && isThisStoreInCart && (
          <Button
            text={t("show-order")}
            icon="orders-new1"
            iconSize={themeStyle.FONT_SIZE_XL}
            fontSize={themeStyle.FONT_SIZE_XL}
            iconColor={themeStyle.SECONDARY_COLOR}
            onClickFn={() => {
              handleCartClick();
            }}
            fontFamily={`${getCurrentLang()}-Bold`}
            bgColor={themeStyle.PRIMARY_COLOR}
            textColor={themeStyle.SECONDARY_COLOR}
            borderRadious={100}
            countText={`${cartCount}`}
            countTextColor={themeStyle.PRIMARY_COLOR}
            extraText={`₪${cartPrice}`}
          />
        )}
      </View>

      {/* General Categories Modal */}
      <Modal
        isVisible={isGeneralCategoriesModalOpen}
        onBackdropPress={handleCloseGeneralCategoriesModal}
        style={styles.modal}
        animationIn="slideInUp"
        animationOut="slideOutDown"
        backdropOpacity={0.5}
      >
        <GeneralCategoriesModal
          generalCategories={generalCategories}
          selectedGeneralCategory={selectedGeneralCategory}
          onCategorySelect={handleGeneralCategorySelect}
          onClose={handleCloseGeneralCategoriesModal}
        />
      </Modal>
    </View>
  );
};

export default observer(MenuGeneralCategoriesScreen);

const styles = StyleSheet.create({
  header: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    zIndex: 10,
    backgroundColor: themeStyle.WHITE_COLOR,
  },
  shippingPickerContainer: {
    justifyContent: "center",
    marginTop: 110,
  },
  stickyHeader: {

    backgroundColor: "#fff",

    height: STICKY_HEADER_HEIGHT,
    paddingTop: 0,
    top: 0,
  },
  cartContainer: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "transparent",
    padding: 10,
    paddingHorizontal: 20,
  },
  fixedButtons: {
    position: "absolute",
    top: 8,
    left: 0,
    right: 0,
    zIndex: 20,
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: 18,
    pointerEvents: "box-none",
  },
  backButton: {},
  heartButton: {},
  circle: {
    backgroundColor: "#fff",
    borderRadius: 22,
    width: 44,
    height: 44,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  modal: {
    justifyContent: "flex-end",
    margin: 0,
  },
});
