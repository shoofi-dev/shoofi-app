import {
  StyleSheet,
  View,
  TouchableOpacity,
  Image,
  ScrollView,
  Text,
  Animated,
  I18nManager,
} from "react-native";

import { useState, useEffect, useRef } from "react";
import { observer } from "mobx-react";
import { useContext } from "react";
import { StoreContext } from "../../stores";
import themeStyle from "../../styles/theme.style";
import { LinearGradient } from "expo-linear-gradient";
import { useNavigation } from "@react-navigation/native";

/* components */
import CategoryItemsList from "./components/categoryItemsList";
import Icon from "../../components/icon";
import { Buffer } from "buffer";
import i18n from "../../translations/index-x";
import { getCurrentLang } from "../../translations/i18n";
import { useTranslation } from "react-i18next";
import * as Haptics from "expo-haptics";
import MenuItem from "./components/menu-item/index";
import AddMenuItem from "./components/menu-item/add";
import useWebSocket from "react-use-websocket";
import { WS_URL } from "../../consts/api";
import { ActivityIndicator } from "react-native-paper";
import { adminCustomerStore } from "../../stores/admin-customer";
import CategoryList from "./components/category/category-list";
import StoreHeaderCard from "./components/StoreHeaderCard";

const HEADER_IMAGE_HEIGHT = 210;
const STICKY_HEADER_HEIGHT = 110; // Info + categories

export function toBase64(input) {
  return Buffer.from(input, "utf-8").toString("base64");
}

export function fromBase64(encoded) {
  return Buffer.from(encoded, "base64").toString("utf8");
}

const MenuScreen = () => {
  const { t } = useTranslation();
  const scrollRef = useRef();
  const navigation = useNavigation();

  const { menuStore, languageStore, storeDataStore } =
    useContext(StoreContext);
    const [menuAnimationDone, setMenuAnimationDone] = useState(false)

  useEffect(() => {}, [languageStore]);

  const { lastJsonMessage } = useWebSocket(WS_URL, {
    share: true,
  });

  useEffect(() => {
    if (lastJsonMessage) {
      menuStore.getMenu().then(() => {
        getMenu();
      });
    }
  }, [lastJsonMessage]);

  const [categoryList, setCategoryList] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [tmpSelectedCategory, setTmpSelectedCategory] = useState(null);
  const [tmpSelectedCategoryProg, setTmpSelectedCategoryProg] = useState(false);
  const [isDisabledCatItem, setIsDisabledCatItem] = useState(false);
  const [selectedCats, setSelectedCats] = useState([]);

  const [selectedCategoryKey, setSelectedCategoryKey] = useState("BURGERS");

  const onCategorySelect = (category) => {
    if (category.categoryId != selectedCategory.categoryId) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      setTmpSelectedCategoryProg(true);
      setIsDisabledCatItem(true);
      setSelectedCategory(category);
      setTmpSelectedCategory(undefined);
    }
  };
  const onAddCategory = () => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
  };

  useEffect(() => {
    //if (selectedCats.indexOf(selectedCategory) > -1) {
    setTmpSelectedCategoryProg(false);
    setTmpSelectedCategory(selectedCategory);
    setIsDisabledCatItem(false);
    return;
    // }

    // setTimeout(() => {0
    //   setTmpSelectedCategoryProg(false);
    //   setIsDisabledCatItem(false);

    //   setTmpSelectedCategory(selectedCategory);
    //   setSelectedCats([...selectedCats, selectedCategory]);
    // }, 1400);
  }, [selectedCategory]);

  const getMenu = () => {
    const categories = menuStore.categories;
    setCategoryList(categories);
    setSelectedCategory(selectedCategory || categories[0]);
  };

  const productsAnim = useRef(new Animated.Value(600));
  const productsAnimate = ()=> {
    Animated.timing(productsAnim.current, {
      toValue: 0,
      duration: 1400,
      useNativeDriver: false,

    }).start(() => {

    });
};


  const handleMenuAnimScrollEnd = () => {

    setMenuAnimationDone(true);
      productsAnimate();

  }
  const anim = useRef(new Animated.Value(10));

  const tasteScorll = ()=> {
      Animated.timing(anim.current, {
        toValue:300,
        duration: 600,
        useNativeDriver: true,
  
      }).start(()=>{
        Animated.timing(anim.current, {
          toValue:-10,
          duration: 600,
          useNativeDriver: true,
    
        }).start(()=>{
          setTimeout(() => {
            handleMenuAnimScrollEnd()
          }, 0);
        });
     
      });


  };

  const tasteScorll2 = () => {
    scrollRef.current?.scrollTo({
      x: 600,
      animated: true,
      duration:1

      
    });
    setTimeout(() => {
      scrollRef.current?.scrollTo({
        x: -1000,
        animated: true,
        duration:1
      });
    }, 500);
    setTimeout(() => {
      //productsAnimate();
      handleMenuAnimScrollEnd();
    }, 0);

  };
  useEffect(() => {
    getMenu();
    setTimeout(() => {
      tasteScorll();

    }, 1000);
  

  }, [ ]);
  useEffect(() => {
    getMenu();
  }, [menuStore.categories]);

  const scrollY = useRef(new Animated.Value(0)).current;

  const translateY = scrollY.interpolate({
    inputRange: [0, HEADER_IMAGE_HEIGHT],
    outputRange: [HEADER_IMAGE_HEIGHT, 0],
    extrapolate: "clamp",
  });

  if (!categoryList || !selectedCategory) {
    return null;
  }
  return (
    <View style={{ flex: 1, backgroundColor: "#fff" }}>
      {/* Fixed Back and Heart Buttons */}
      <View style={styles.fixedButtons} pointerEvents="box-none">
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <View style={styles.circle}>
            <Icon name={I18nManager.isRTL ? "chevron-right" : "chevron-left"} size={28} color="#222" />
          </View>
        </TouchableOpacity>
        <TouchableOpacity style={styles.heartButton} onPress={() => {}}>
          <View style={styles.circle}>
            <Icon name="heart" size={22} color={themeStyle.SECONDARY_COLOR} />
          </View>
        </TouchableOpacity>
      </View>
      {/* Animated Store Image */}
      <Animated.View
        style={[
          styles.animatedHeader,
          {
            height: scrollY.interpolate({
              inputRange: [0, HEADER_IMAGE_HEIGHT],
              outputRange: [HEADER_IMAGE_HEIGHT, 0],
              extrapolate: "clamp",
            }),
            opacity: scrollY.interpolate({
              inputRange: [0, HEADER_IMAGE_HEIGHT / 2, HEADER_IMAGE_HEIGHT],
              outputRange: [1, 0.5, 0],
              extrapolate: "clamp",
            }),
          },
        ]}
      >
        <StoreHeaderCard store={storeDataStore.storeData} showImageOnly />
      </Animated.View>

      {/* Sticky Info + Categories */}
      <Animated.View
        style={[
          styles.stickyHeader,
          {
            transform: [{ translateY }],
          },
          
        ]}
      >
        <StoreHeaderCard store={storeDataStore.storeData} showInfoOnly />
        <CategoryList
          categoryList={categoryList}
          onCategorySelect={setSelectedCategory}
          selectedCategory={selectedCategory}
          isDisabledCatItem={false}
        />
      </Animated.View>

      {/* Items List */}
      <Animated.ScrollView
        style={{ flex: 1, }}
        contentContainerStyle={{
          paddingTop: HEADER_IMAGE_HEIGHT + STICKY_HEADER_HEIGHT,
          paddingBottom: 40,
          marginTop:-100
        }}
        scrollEventThrottle={16}
        onScroll={Animated.event(
          [{ nativeEvent: { contentOffset: { y: scrollY } } }],
          { useNativeDriver: false }
        )}
      >
        <CategoryItemsList
          productsList={selectedCategory.products}
          category={selectedCategory}
        />
      </Animated.ScrollView>
    </View>
  );
};

export default observer(MenuScreen);

const styles = StyleSheet.create({
  container: {
    display: "flex",
    flexDirection: "row",
    paddingTop: 10,
    height: 115,
    paddingHorizontal: 5,
    // backgroundColor: "#F1F1F1",
  },
  categoryItem: {},
  iconContainer: {},
  itemsListConainer: {
    top: 120,
    position: "absolute",
    alignSelf: "center",
  },
  background: {
    position: "absolute",
    left: 0,
    right: 0,
    top: 10,
    bottom: 0,
    zIndex: -1,
  },
  animatedHeader: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    zIndex: 10,
    overflow: "hidden",
    backgroundColor: "#fff",
  },
  stickyHeader: {
    zIndex: 9,
    backgroundColor: "#fff",
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
    paddingBottom: 4,
    width: "100%",
    
  },
  fixedButtons: {
    position: "absolute",
    top: 18,
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
    shadowOpacity: 0.10,
    shadowRadius: 4,
    elevation: 2,
  },
});
