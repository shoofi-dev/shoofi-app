import {
  StyleSheet,
  View,
  TouchableOpacity,
  Image,
  ImageBackground,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import { useState, useRef, useEffect } from "react";
import { observer } from "mobx-react";
import { useContext } from "react";
import { StoreContext } from "../../../../stores";
import { ScrollView } from "react-native-gesture-handler";
import Text from "../../../../components/controls/Text";
import themeStyle from "../../../../styles/theme.style";
import { getCurrentLang } from "../../../../translations/i18n";
import * as Haptics from "expo-haptics";
import Button from "../../../../components/controls/button/button";
import {
  cdnUrl,
  ORDER_TYPE,
  devicesType,
  mealsImages,
} from "../../../../consts/shared";
import { LinearGradient } from "expo-linear-gradient";
import { useTranslation } from "react-i18next";
import _useDeviceType from "../../../../hooks/use-device-type";
import CustomFastImage from "../../../../components/custom-fast-image";
import Icon from "../../../../components/icon";
const addToCartIcon = require("../../../../assets/add-to-cart.png")
export type TProps = {
  item: any;
  onItemSelect: (item: any) => void;
  onDeleteProduct: (item: any) => void;
  onEditProduct: (item: any) => void;
};
const ProductItem = ({
  item,
  onItemSelect,
  onDeleteProduct,
  onEditProduct,
}: TProps) => {
  const { t } = useTranslation();

  const {
    userDetailsStore,
    languageStore,
    cartStore,
    ordersStore,
    storeDataStore,
  } = useContext(StoreContext);
  const { deviceType } = _useDeviceType();

  const isDisabled = (item) => {
    return !isInStore(item);
  };
  const isInStore = (item) => {
    if (
      (ordersStore.orderType == ORDER_TYPE.now && !item.isInStore) ||
      (storeDataStore.storeData.isInStoreOrderLaterCats.indexOf(
        item?.categoryId
      ) > -1 &&
        !item.isInStore)
    ) {
      return false;
    }
    return true;
  };

  const getOutOfStockMessage = (item) => {
    if (item.notInStoreDescriptionAR || item.notInStoreDescriptionHE) {
      return languageStore.selectedLang === "ar"
        ? item.notInStoreDescriptionAR
        : item.notInStoreDescriptionHE;
    }
    return t("call-store-to-order");
  };

  const onAddToCart = (prodcut) => {
    // DeviceEventEmitter.emit(`add-to-cart-animate`, {
    //   imgUrl: meal.data.img,
    // });
    // cartStore.resetCart();
    onItemSelect(prodcut);

    // let tmpProduct: any = {};
    // tmpProduct.others = { count: 1, note: "" };
    // tmpProduct.data = prodcut;
    // cartStore.addProductToCart(tmpProduct);
  };

  return (
    <View
      style={{
        borderRadius: 10,
        backgroundColor: themeStyle.SECONDARY_COLOR,
        width: "85%",
        alignSelf: "center",
        opacity: !isInStore(item) ? 0.4 : 1,
        borderTopStartRadius:50,
        borderBottomStartRadius:50,
        right:10
      }}
    >
      {/* <LinearGradient
        colors={[
          "rgba(207, 207, 207, 0.9)",
          "rgba(232, 232, 230, 0.8)",
          "rgba(232, 232, 230, 0.8)",
          "rgba(232, 232, 230, 0.8)",
          "rgba(207, 207, 207, 0.9)",
        ]}
        start={{ x: 1, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={[styles.background,{borderRadius:30}]}
      /> */}
      <TouchableOpacity
        style={[
          styles.categoryItem,
          { opacity: isDisabled(item) ? 0.4 : 1, height: "100%" },
        ]}
        delayPressIn={30}
        onPress={() => {
          onAddToCart(item);
        }}
        key={item.id}
        disabled={isDisabled(item)}
      >
        {/* <View
          style={{
            backgroundColor: themeStyle.PRIMARY_COLOR,
            position: "absolute",
            alignSelf: "center",
            top: -35,
            padding: 10,
            borderRadius: 20,
            zIndex: 1,
          }}
        >
          <Icon
            icon="shopping-bag-plus"
            size={25}
            style={{ color: themeStyle.SECONDARY_COLOR }}
          />
        </View> */}
        <View
          style={{
            height: deviceType === devicesType.tablet ? 90 :90,
            shadowColor: "#737370",
            shadowOffset: {
              width: 0,
              height: 2,
            },
            shadowOpacity: 0.9,
            shadowRadius: 3,
            elevation: 0,
            borderWidth: 0,
            alignItems: "center",
          
          }}
        >
          {/* <CustomFastImage
            style={{
              height: deviceType === devicesType.tablet ? 350 : 250,
              position: "absolute",
              top: 0,
              bottom: 0,
              right: 0,
              left: 0,
            }}
            source={{ uri: `${cdnUrl}${item.img[0].uri}` }}
            cacheKey={`${item.img[0].uri.split(/[\\/]/).pop()}`}
            resizeMode={item.subCategoryId == '2' ? 'stretch' : null}
          /> */}
          <Image
            source={mealsImages[item.img]}
            style={{
              height: "120%",
              width: "100%",
              alignSelf: "center",
              marginTop: -10,
              position:'absolute', 
              left:"40%"
            }}
            resizeMode="contain"
          />

          {/* <ImageBackground
          source={{ uri: `${cdnUrl}${item.img[0].uri}` }}
          resizeMode={"cover"}
        > */}
          {/* <View
            style={{
              backgroundColor: "rgba(247,247,247,0.6)",
              alignItems: "center",
              padding: 5,
            }}
          >
            <Text
              style={{
                color: themeStyle.GRAY_700,
                marginTop: 5,
                fontSize: 18,
                fontFamily: `${getCurrentLang()}-SemiBold`,
                textAlign: "center",
              }}
            >
              {languageStore.selectedLang === "ar" ? item.nameAR : item.nameHE}
            </Text>
          </View> */}
          {/* <LinearGradient
          colors={["rgba(250, 249, 248,1)", "rgba(250, 249, 248,1)"]}
          start={{ x: 1, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={[styles.background]}
        /> */}

          {/* <View style={[styles.iconContainer]}>
          <Image
            style={{
              width: "100%",
              height: "100%",
              borderTopLeftRadius: 30,
              borderTopRightRadius: 30,
            }}
            source={{ uri: `${cdnUrl}${item.img[0].uri}` }}
            resizeMode="stretch"
          />
        </View> */}
  <View style={{flexDirection:'row',  width: "100%",paddingLeft:20, marginTop:15}}>
  <Image source={addToCartIcon} style={{ alignSelf: "center", width:35, height:32, }} />
            <View style={{ width:"57%", alignItems:'center', justifyContent:'center' }}>
          <View
            style={{
             
              flexDirection: "row",
            }}
          >
            
            <Text style={{ textAlinge: "right", fontSize: 22 }}>
              {languageStore.selectedLang === "ar" ? item.nameAR : item.nameHE}
            </Text>
            {/* <View style={{ paddingHorizontal: 8 / 2 }}>
            <Text
              style={{
                color: themeStyle.GRAY_700,
                fontFamily: `${getCurrentLang()}-SemiBold`,
                fontSize: 20,
              }}
            >
              ₪{item.price}
            </Text>
          </View> */}
            {/* {userDetailsStore.isAdmin() && item.count > 0 && (
              <View style={{ paddingHorizontal: 8 / 2 }}>
                <Text
                  style={{
                    color: themeStyle.GRAY_700,
                    fontFamily: `${getCurrentLang()}-SemiBold`,
                    fontSize: 20,
                  }}
                >
                  כמות: {item.count}
                </Text>
              </View>
            )} */}

            {/* {isInStore(item) && (
            <View>
              {!userDetailsStore.isAdmin() && (
                <Button
                  bgColor={themeStyle.PRIMARY_COLOR}
                  text={"اضف للسله"}
                  fontSize={14}
                  onClickFn={() => onAddToCart(item)}
                  textPadding={0}
                  marginH={0}
                  textColor={themeStyle.WHITE_COLOR}
                  icon="cart_icon"
                  iconSize={15}
                  iconMargin={5}
                />
              )}
            </View>
          )} */}
          </View>
          <View
            style={{
              width: "100%",
              flexDirection: "row",
              alignItems:'center',
              justifyContent:'center'
            }}
          >
            <Text style={{  fontSize: 22 }}>
             {item.price}10 ₪
            </Text></View>
            </View>
            </View>
          {/* {!isInStore(item) && (
            <View
              style={{ position: "absolute", bottom: "50%", width: "100%" }}
            >
              <LinearGradient
                colors={[
                  "rgba(207, 207, 207, 0.9)",
                  "rgba(232, 232, 230, 0.9)",
                  "rgba(232, 232, 230, 0.9)",
                  "rgba(232, 232, 230, 0.9)",
                  "rgba(207, 207, 207, 0.9)",
                ]}
                start={{ x: 1, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={[styles.background, { borderRadius: 0 }]}
              />
              <Text
                style={{
                  color: themeStyle.GRAY_700,
                  fontFamily: `${getCurrentLang()}-SemiBold`,
                  fontSize: 20,
                  alignSelf: "center",
                }}
              >
                {getOutOfStockMessage(item)}
              </Text>
            </View>
          )} */}
          {userDetailsStore.isAdmin() && (
            <View
              style={{
                flexDirection: "row",
                flex: 1,
                width: "100%",
                justifyContent: "space-around",
              }}
            >
              <View style={{ flexBasis: "45%" }}>
                <Button
                  bgColor={themeStyle.ORANGE_COLOR}
                  text={"تعديل"}
                  fontSize={16}
                  onClickFn={() => onEditProduct(item)}
                  textPadding={0}
                  marginH={0}
                  textColor={themeStyle.WHITE_COLOR}
                  icon="cart_icon"
                  iconSize={15}
                  iconMargin={5}
                />
              </View>
              <View style={{ flexBasis: "45%" }}>
                <Button
                  bgColor={"red"}
                  text={t("delete")}
                  fontSize={16}
                  onClickFn={() => onDeleteProduct(item)}
                  textPadding={0}
                  marginH={0}
                  textColor={themeStyle.WHITE_COLOR}
                  icon="cart_icon"
                  iconSize={15}
                  iconMargin={5}
                />
              </View>
            </View>
          )}
          {/* {userDetailsStore.isAdmin() && (
            <View
              style={{
                position: "absolute",
                bottom: 0,
                width: "100%",
                padding: 10,
              }}
            >
              <LinearGradient
                colors={[
                  "rgba(207, 207, 207, 0.7)",
                  "rgba(232, 232, 230, 0.7)",
                  "rgba(232, 232, 230, 0.7)",
                  "rgba(232, 232, 230, 0.7)",
                  "rgba(207, 207, 207, 0.7)",
                ]}
                start={{ x: 1, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={[styles.background]}
              />
              <Text
                style={{
                  color: themeStyle.GRAY_700,
                  fontFamily: `${getCurrentLang()}-SemiBold`,
                  fontSize: 20,
                  alignSelf: "center",
                }}
              >
                כמות רגיל: {item.extras.size.options["medium"].count}
                {"       "}
                כמות גדול: {item.extras.size.options["large"].count}
              </Text>
            </View>
          )} */}
        </View>
      </TouchableOpacity>
    </View>
  );
};

export default observer(ProductItem);

const styles = StyleSheet.create({
  container: {
    flexDirection: "row-reverse",
    alignItems: "center",
    flex: 1,
    justifyContent: "space-between",
    paddingHorizontal: 10,
    // backgroundColor:"#857C74",
    // height:"100%"
  },
  categoryItem: {
    width: "100%",
    //height: 280,
    borderRadius: 30,
    // backgroundColor: "rgba(255, 255, 255, 0.7)",
    borderColor: "rgba(0, 0, 0, 0.1)",

    // borderWidth: 1,
    // shadowColor: "#C19A6B",
    // shadowOffset: {
    //   width: 0,
    //   height: 2,
    // },
    // shadowOpacity: 0.1,
    // shadowRadius: 3.84,
    // elevation: 8,
    alignSelf: "center", // backgroundColor:"#857C74",
  },
  iconContainer: {
    width: "100%",
    height: "100%",
  },
  square: {
    alignSelf: "center",
    borderRadius: 4,
    height: "100%",
    width: 150,
  },
  background: {
    position: "absolute",
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
    borderRadius: 30,
  },
});
