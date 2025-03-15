import {
  StyleSheet,
  View,
  TouchableOpacity,
  Image,
  ScrollView,
  Text,
  Animated,
} from "react-native";

import { useState, useEffect, useRef } from "react";
import { observer } from "mobx-react";
import { useContext } from "react";
import { StoreContext } from "../../stores";
import themeStyle from "../../styles/theme.style";
import { LinearGradient } from "expo-linear-gradient";

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
import { ActivityIndicator } from "react-native-paper";
import { adminCustomerStore } from "../../stores/admin-customer";
import { useNavigation } from "@react-navigation/native";
import _useWebSocketUrl from "../../hooks/use-web-socket-url";
import { animationDuration } from "../../consts/shared";
import * as Animatable from "react-native-animatable";

export function toBase64(input) {
  return Buffer.from(input, "utf-8").toString("base64");
}

export function fromBase64(encoded) {
  return Buffer.from(encoded, "base64").toString("utf8");
}

const MenuScreen = () => {
  const { t } = useTranslation();
  const navigation = useNavigation();

  const scrollRef = useRef();
  const animationRefs = useRef({});


  const { menuStore, languageStore, userDetailsStore } =
    useContext(StoreContext);
    const [menuAnimationDone, setMenuAnimationDone] = useState(false)

  useEffect(() => {}, [languageStore]);

  const { webScoketURL } = _useWebSocketUrl();

  const { lastJsonMessage } = useWebSocket(webScoketURL, {
    share: true,
    shouldReconnect: (closeEvent) => true,
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

  useEffect(()=>{
    if(animationRefs.current && animationRefs.current[tmpSelectedCategory?.categoryId]){
      animationRefs.current[tmpSelectedCategory?.categoryId].fadeInRight(1000);

    }
  },[tmpSelectedCategory?.categoryId])

  const onCategorySelect = (category) => {

    if (category.categoryId != selectedCategory.categoryId) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      setTmpSelectedCategoryProg(true);
      setIsDisabledCatItem(true);
      menuStore.updateSelectedCategory(category.categoryId);
      setSelectedCategory(category);
      setTmpSelectedCategory(undefined);
      // console.log("cate",category)
      // if(category?.categoryId == "1"){
      //   navigation.navigate("meal", { product: category.products[0], category });

      // }
    }
  };
  const onAddCategory = () => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
  };

  useEffect(() => {
    //if (selectedCats.indexOf(selectedCategory) > -1) {
    setTmpSelectedCategoryProg(false);
    menuStore.updateSelectedCategory(selectedCategory?.categoryId);
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
    menuStore.updateSelectedCategory(selectedCategory?.categoryId || categories[0]?.categoryId);

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

  const anim = useRef(new Animated.Value(10));

  const handleMenuAnimScrollEnd = () => {

    setMenuAnimationDone(true);
      productsAnimate();

  }

  const tasteScorll = ()=> {
      Animated.timing(anim.current, {
        toValue:300,
        duration: 600,
        useNativeDriver: true,
  
      }).start(()=>{
        Animated.timing(anim.current, {
          toValue: 25,
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

  if (!categoryList || !selectedCategory) {
    return null;
  }
  return (
    <View style={{ height: "100%", marginTop: 0 }}>
      <View style={styles.container}>
        <View
          style={{ height: "100%", width: "100%",flexDirection:'row', alignItems:'center', justifyContent:'center',  paddingTop:15,
      }}
        >
          {/* {userDetailsStore.isAdmin() && <View style={{ width: 120, height: 96, flexBasis: 90 }}>
            <AddMenuItem onItemSelect={onAddCategory} />
          </View>} */}
          {/* <Animated.View style={{flexDirection:'row'}}> */}
          <Animated.View style={{flexDirection:'row', transform:[{translateX: anim.current}]}}> 

       
          {categoryList.map((category) => (
            <View
              style={{
                width: 100,
                height:100,
                marginHorizontal:5
              }}
              key={category._id}
            >
                <MenuItem
                  item={category}
                  onItemSelect={onCategorySelect}
                  selectedItem={selectedCategory}
                  isDisabledCatItem={isDisabledCatItem}
                />
            </View>
          ))}
              </Animated.View>
        </View>
      </View>
      {/* <LinearGradient
        colors={[
          "rgba(239, 238, 238, 0.04)",
          "rgba(239, 238, 238, 0.9)",
          "rgba(239, 238, 238, 0.9)",
          "rgba(239, 238, 238, 0.9)",
          "rgba(239, 238, 238, 0.9)",
          "rgba(239, 238, 238, 0.01)",
        ]}
        start={{ x: 1, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={[styles.background]}
      /> */}
      {/* {(tmpSelectedCategory == undefined || tmpSelectedCategoryProg) && (
        <View style={{ width: "20%", alignSelf: "center", marginTop: 100 }}>
          <Image source={loaderGif} style={{ alignSelf: "center" }} />
        </View>
      )} */}

      <View>
        {/* { menuAnimationDone && categoryList.map((category, index) => ( */}
        { categoryList.map((category, index) => (
          <View
            style={{
              display:
                category.categoryId === tmpSelectedCategory?.categoryId
                  ? "flex"
                  : "none",
                  marginTop:60,
                  
            }}
          >
                              <Animatable.View
                     animation="fadeInUp"
                     duration={animationDuration}
                     style={{ height: "100%" }}
                     ref={(ref) => (animationRefs.current[category.categoryId] = ref)}
   
                   >
            <CategoryItemsList
              productsList={category.products}
              category={category}
            />
            </Animatable.View>
          </View>
        ))}
      </View>
    </View>
  );
};

export default observer(MenuScreen);

const styles = StyleSheet.create({
  container: {
    display: "flex",
    flexDirection: "row",
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
});
