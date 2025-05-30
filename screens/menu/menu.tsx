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
import { WS_URL } from "../../consts/api";
import { ActivityIndicator } from "react-native-paper";
import { adminCustomerStore } from "../../stores/admin-customer";
import CategoryList from "./components/category/category-list";
import StoreHeaderCard from "./components/StoreHeaderCard";
export function toBase64(input) {
  return Buffer.from(input, "utf-8").toString("base64");
}

export function fromBase64(encoded) {
  return Buffer.from(encoded, "base64").toString("utf8");
}

const MenuScreen = () => {
  const { t } = useTranslation();
  const scrollRef = useRef();

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

  if (!categoryList || !selectedCategory) {
    return null;
  }
  return (
    <View style={{ height: "100%", marginTop: 0 }}>
              <StoreHeaderCard store={storeDataStore.storeData} />

            <CategoryList categoryList={categoryList} onCategorySelect={onCategorySelect} selectedCategory={selectedCategory} isDisabledCatItem={isDisabledCatItem} />

      {/* <View style={styles.container}>
        <ScrollView
          ref={scrollRef}
          style={{ height: "100%", width: "100%" }}
          horizontal={true}
          showsHorizontalScrollIndicator={false}
          decelerationRate={0.5}          
        >
          <Animated.View style={{flexDirection:'row', transform:[{translateX: anim.current}]}}>

       
          {categoryList.map((category) => (
            <View
              style={{
                width: selectedCategory._id === category._id ? 70 : 70,
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
        </ScrollView>
      </View> */}
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
            }}
          >
            <CategoryItemsList
              productsList={category.products}
              category={category}
            />
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
});
