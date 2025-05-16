import {
  StyleSheet,
  View,
  TouchableOpacity,
  DeviceEventEmitter,
  TextInput,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import Text from "../../components/controls/Text";
import { useNavigation } from "@react-navigation/native";
import { observer } from "mobx-react";
import { groupBy, isEmpty } from "lodash";
import * as Animatable from "react-native-animatable";

import GradiantRow from "../../components/gradiant-row";
import Button from "../../components/controls/button/button";
import { useContext, useState, useEffect, useRef, useCallback } from "react";
import { StoreContext } from "../../stores";
import { ScrollView } from "react-native-gesture-handler";
import themeStyle from "../../styles/theme.style";
import Icon from "../../components/icon";
import { getCurrentLang } from "../../translations/i18n";
import { useTranslation } from "react-i18next";
import * as Haptics from "expo-haptics";
import {
  animationDuration,
  APP_NAME,
  cdnUrl,
  ORDER_TYPE,
} from "../../consts/shared";

import CustomFastImage from "../../components/custom-fast-image";

import ConfirmActiondDialog from "../../components/dialogs/confirm-action";
import Counter from "../../components/controls/counter";
import { useResponsive } from "../../hooks/useResponsive";

const MealScreen = ({ route }) => {
  const { t } = useTranslation();
  const scrollRef = useRef();

  const { product, index, category } = route.params;
  const navigation = useNavigation();
  let { cartStore, ordersStore, languageStore, storeDataStore, authStore } =
    useContext(StoreContext);
  const [meal, setMeal] = useState(null);
  const [isEdit, setIsEdit] = useState(false);

  const [isOpenConfirmActiondDialog, setIsOpenConfirmActiondDialog] =
    useState(false);
  const [confirmActiondDialogText, setConfirmActiondDialogText] = useState("");

  const { isTablet, isPad, scale, fontSize, height } = useResponsive();

  useEffect(() => {
    let tmpProduct: any = {};
    if (product) {
      setIsEdit(false);
      // tmpProduct = menuStore.getMealByKey(product.id);
      tmpProduct.data = JSON.parse(JSON.stringify(product));
      // for products without constants
      if (isEmpty(tmpProduct)) {
        tmpProduct.data = JSON.parse(JSON.stringify(product));
      }
      tmpProduct.others = { qty: 1, note: "" };
    }
    if (index !== null && index !== undefined) {
      setIsEdit(true);
      tmpProduct = cartStore.getProductByIndex(index);
    }
    // DeviceEventEmitter.emit(`update-meal-uri`, {
    //   imgUrl: `${cdnUrl}${tmpProduct.data.img[0].uri}`,
    //   cacheKey: `${cdnUrl}${tmpProduct.data.img[0].uri}`.split(/[\\/]/).pop(),
    // });

    setMeal(tmpProduct);
    return () => {
      setMeal(null);
    };
  }, [index, product]);

  const onAddToCart = () => {
    if (ordersStore.orderType == ORDER_TYPE.now && !meal.data.isInStore) {
      setConfirmActiondDialogText(
        getOutOfStockMessage() || "call-store-to-order"
      );
      setIsOpenConfirmActiondDialog(true);
      return;
    }
    DeviceEventEmitter.emit(`add-to-cart-animate`, {
      imgUrl: meal.data.img,
    });

    cartStore.addProductToCart(meal);
    setTimeout(() => {
      navigation.goBack();
    }, 1000);
  };

  const onUpdateCartProduct = () => {
    cartStore.updateCartProduct(index, meal);
    setTimeout(() => {
      navigation.goBack();
    }, 1000);
  };

  const handleConfirmActionAnswer = (answer: string) => {
    setConfirmActiondDialogText("");
    setIsOpenConfirmActiondDialog(false);
  };

  const onClose = () => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    navigation.goBack();
  };

  // useEffect(() => {
  //   if (meal && meal?.data?.extras?.weight) {
  //     const mealPrice =
  //       meal?.data?.extras?.weight?.price *
  //       (meal?.data?.extras?.weight?.value /
  //         meal?.data?.extras?.weight.minValue);

  //     let finalPrice = mealPrice;

  //     setMeal({
  //       ...meal,
  //       data: {
  //         ...meal.data,
  //         price: finalPrice,
  //       },
  //     });
  //   }
  // }, [meal?.data.extras]);

  const updateMeal3 = (value, tag, type) => {
    setMeal({
      ...meal,
      data: {
        ...meal.data,
        extras: {
          ...meal.data.extras,
          [tag]: { ...meal.data.extras[tag], value: value },
        },
      },
    });
  };

  const updateMeal = (value, extraData, type) => {
    let extraPrice = 0;

    switch (type) {
      case "COUNTER":
        extraPrice =
          value > extraData.value
            ? extraPrice + extraData.price
            : extraPrice - extraData.price;
        break;
      case "oneChoice":
        if (!extraData.multiple_choice) {
          // const currentTag = currentExtraType.find(
          //   (tagItem) => tagItem.value === true
          // );
          // if (currentTag) {
          //   const tagDeltaPrice = extraData.price - currentTag.price;
          //   extraPrice = extraPrice + tagDeltaPrice;
          // }
        } else {
          extraPrice = value
            ? extraPrice + extraData.price
            : extraPrice - extraData.price;
        }
        break;
      case "CHOICE":
        if (!extraData.multiple_choice) {
          // const currentTag = currentExtraType.find(
          //   (tagItem) => tagItem.value === true
          // );
          // if (currentTag) {
          if (value === true) {
            extraPrice = extraPrice + extraData.price;
          } else {
            extraPrice = extraPrice + extraData.price * -1;
          }
          // }
        } else {
          extraPrice = value
            ? extraPrice + extraData.price
            : extraPrice - extraData.price;
        }
        break;
      default:
        break;
    }

    extraData.value = value;
    // meal.extras[type] = extraData;
    setMeal({
      ...meal,
      data: { ...meal.data, price: meal.data.price + extraPrice },
      extras: {
        ...meal.data?.extras,
        [extraData.name]: {
          ...meal.data.extras[extraData?.name],
          value: value,
        },
      },
    });
  };

  const updateMeal2 = (value, tag, type) => {
    let extraPrice = 0;
    const currentExtraType = meal.extras[type];
    const extrasType = meal.extras[type].map((tagItem) => {
      if (tagItem.id === tag.id) {
        switch (tag.type) {
          case "COUNTER":
            extraPrice =
              value > tagItem.value
                ? extraPrice + tagItem.price
                : extraPrice - tagItem.price;
            break;
          case "oneChoice":
            if (!tag.multiple_choice) {
              const currentTag = currentExtraType.find(
                (tagItem) => tagItem.value === true
              );
              if (currentTag) {
                const tagDeltaPrice = tagItem.price - currentTag.price;
                extraPrice = extraPrice + tagDeltaPrice;
              }
            } else {
              extraPrice = value
                ? extraPrice + tagItem.price
                : extraPrice - tagItem.price;
            }
            break;
          case "CHOICE":
            if (!tag.multiple_choice) {
              const currentTag = currentExtraType.find(
                (tagItem) => tagItem.value === true
              );
              if (currentTag) {
                const tagDeltaPrice = tagItem.price - currentTag.price;
                extraPrice = extraPrice + tagDeltaPrice;
              }
            } else {
              extraPrice = value
                ? extraPrice + tagItem.price
                : extraPrice - tagItem.price;
            }
            break;
          default:
            break;
        }
        tagItem.value = value;
      } else {
        if (tag.type === "CHOICE" && !tag.multiple_choice) {
          tagItem.value = false;
        }
      }
      return tagItem;
    });
    if (extraPrice !== 0) {
      meal.extras[type] = extrasType;
      setMeal({
        ...meal,
        data: { ...meal.data, price: meal.data.price + extraPrice },
        extras: meal.extras,
      });
    }
  };

  const updateOthers = (value, key, type) => {
    if (key === "qty") {
      const updatedPrice =
        meal.data.price +
        (value - meal.others.qty) * (meal.data.price / meal.others.qty);
      console.log("valuevalue", value, key, type);
      setMeal({
        ...meal,
        [type]: { ...meal[type], [key]: value },
        // data: { ...meal.data, price: updatedPrice },
      });
    } else {
      setMeal({ ...meal, [type]: { ...meal[type], [key]: value } });
    }
  };

  const isAvailableOnApp = (key: string) => {
    let isAvailable = false;
    Object.keys(meal.extras[key]).forEach((tagId) => {
      const tag = meal.extras[key][tagId];
      if (tag.available_on_app) {
        isAvailable = true;
      }
    });
    return isAvailable;
  };

  const getOutOfStockMessage = () => {
    if (
      meal.data.notInStoreDescriptionAR ||
      meal.data.notInStoreDescriptionHE
    ) {
      return languageStore.selectedLang === "ar"
        ? meal.data.notInStoreDescriptionAR
        : meal.data.notInStoreDescriptionHE;
    }
    return null;
  };

  const handleCartClick = () => {
    if (authStore.isLoggedIn()) {
      if (cartStore.getProductsCount() > 0) {
        navigation.navigate("cart");
      }
    } else {
      navigation.navigate("login");
    }
  };

  const isValidMeal = () => {
    return true;
  };

  const groupExtrasByCategory = () => {
    const extras = groupBy(meal?.data?.extras, (x) => x.categoryId);
    return extras;
  };

  const extasByCategory: any = groupExtrasByCategory();

  if (!meal) {
    return null;
  }

  return (
    <Animatable.View
      animation="fadeInUp"
      duration={animationDuration}
      style={{ height: "100%" }}
    >
      <View style={{ zIndex: 10 }}>
        <TouchableOpacity
          onPress={onClose}
          style={{
            zIndex: 1,
            position: "absolute",
            right: 0,
            width: isTablet ? 60 : 45,
            padding: 0,
            alignItems: "center",
            height: isTablet ? 55 : 40,
            justifyContent: "center",
            top: 10,
            backgroundColor: "rgba(36, 33, 30, 0.8)",
            borderTopStartRadius: 50,
            borderBottomStartRadius: 50,
            alignSelf: "center",
            shadowColor: themeStyle.SECONDARY_COLOR,
            shadowOffset: {
              width: 0,
              height: 3,
            },
            shadowOpacity: 1,
            shadowRadius: 15,
            elevation: 5,
            borderWidth: 0,
          }}
        >
          <Text
            style={{
              color: themeStyle.SECONDARY_COLOR,
              fontSize: isTablet ? 40 : 30,
            }}
          >
            X
          </Text>
        </TouchableOpacity>
      </View>
      <View style={{ zIndex: 10 }}>
        <TouchableOpacity
          style={[
            {
              zIndex: 1,
              position: "absolute",
              left: 0,
              width: isTablet ? 60 : 45,
              padding: 9,
              alignItems: "center",
              height: isTablet ? 60 : 45,
              justifyContent: "center",
              top: 10,
              backgroundColor: "rgba(36, 33, 30, 0.8)",
              borderTopEndRadius: 50,
              borderBottomEndRadius: 50,
              alignSelf: "center",
              shadowColor: themeStyle.SECONDARY_COLOR,
              shadowOffset: {
                width: 0,
                height: 3,
              },
              shadowOpacity: 1,
              shadowRadius: 15,
              elevation: 5,
              borderWidth: 0,
            },
          ]}
          onPress={handleCartClick}
        >
          <Icon
            icon="grill"
            size={isTablet ? 50 : 40}
            style={{ color: themeStyle.SECONDARY_COLOR }}
          />

          <Text style={styles.cartCount}>{cartStore.getProductsCount()}</Text>
        </TouchableOpacity>
      </View>

      <View
        style={{
          shadowColor: "black",
          shadowOffset: {
            width: 0,
            height: 2,
          },
          shadowOpacity: 0.9,
          shadowRadius: 6,
          elevation: 0,
          borderWidth: 0,
          padding: 5,
          alignItems: "center",
          marginTop: 20,
        }}
      >
        <CustomFastImage
          style={{
            width: "100%",
            height: isTablet ? 300 : 200,
          }}
          source={{ uri: `${cdnUrl}${meal.data.img[0].uri}` }}
          cacheKey={`${APP_NAME}_${meal.data.img[0].uri.split(/[\\/]/).pop()}`}
          resizeMode="contain"
        />
      </View>
      <View style={{ alignSelf: "center", marginTop: 10 }}>
        <Text
          style={{ fontSize: isTablet ? 30 : 25, color: themeStyle.SECONDARY_COLOR }}
        >
          {languageStore.selectedLang === "ar"
            ? meal.data.nameAR
            : meal.data.nameHE}
        </Text>
      </View>
      <ScrollView
        ref={scrollRef}
        style={{
          height: "100%",
          marginBottom: isTablet ? 150 : 120,
        }}
      >
        <KeyboardAvoidingView
          keyboardVerticalOffset={100}
          behavior={"position"}
          style={{ flex: 1 }}
        >
          <View
            style={{
              width: isTablet ? "80%" : "100%",
              height: "100%",
              alignSelf: "center",
              minHeight: height - (height * 70) / 100,
              padding: isTablet ? 30 : 20,
            }}
          >
            <View
              style={{
                width: "100%",
                alignSelf: "center",
              }}
            >
              {extasByCategory &&
                Object.keys(extasByCategory)?.map((extraCategoryId) => {
                  return (
                    <View
                      style={{
                        marginBottom: 15,
                        borderRadius: 10,
                      }}
                    >
                      {Object.keys(extasByCategory[extraCategoryId]).map(
                        (key) => (
                          <View
                            style={{
                              marginBottom: 10,
                              width: "100%",
                              padding: 10,
                              paddingVertical: 10,
                              borderRadius: 10,
                            }}
                          >
                            <GradiantRow
                              onChangeFn={(value) => {
                                updateMeal(
                                  value,
                                  extasByCategory[extraCategoryId][key],
                                  extasByCategory[extraCategoryId][key].type
                                );
                              }}
                              type={extasByCategory[extraCategoryId][key].type}
                              value={
                                extasByCategory[extraCategoryId][key].value
                              }
                              title={t(
                                extasByCategory[extraCategoryId][key].name
                              )}
                              stepValue={
                                extasByCategory[extraCategoryId][key].stepValue
                              }
                              options={
                                extasByCategory[extraCategoryId][key].options
                              }
                              minValue={extasByCategory[extraCategoryId][key].minValue}
                              fontSize={20}
                              color={themeStyle.SECONDARY_COLOR}
                              variant={"colors"}
                            />
                          </View>
                        )
                      )}
                    </View>
                  );
                })}
            </View>
            <View
              style={{
                position: "relative",
                // backgroundColor: themeStyle.RGBA_BLACK,
                borderRadius: 10,
                // borderWidth: 1,
                // borderColor: themeStyle.SECONDARY_COLOR,
                padding: 10,
              }}
            >
              {/* <View>
                <GradiantRow
                  onChangeFn={(value) => {
                    updateMeal(value, "weight", meal.data?.extras?.weight);
                  }}
                  // type={tag.type}
                  title={t("weight")}
                  price={meal.data?.extras?.weight?.price}
                  minValue={500}
                  stepValue={500}
                  value={meal.data?.extras?.weight?.value}
                  type={"COUNTER"}
                  variant={"colors"}
                  fontSize={26}
                  color={themeStyle.SECONDARY_COLOR}
                  icon="scale"
                />
              </View> */}

              {/* <View
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  marginTop: 30,
                }}
              >
                <View
                  style={{
                    width: "100%",
                  }}
                >
                  {Object.keys(meal.data.extras).map((key) => (
                    <View style={{ marginBottom: 20, width: "100%" }}>
                      <GradiantRow
                        onChangeFn={(value) => {
                          updateMeal(value, key, meal.data.extras[key].type);
                        }}
                        type={meal.data.extras[key].type}
                        value={meal.data.extras[key].value}
                        title={key}
                        options={meal.data.extras[key].options}
                        minValue={1}
                      />
                    </View>
                  ))}
                </View>
              </View> */}
            </View>
          </View>
        </KeyboardAvoidingView>
      </ScrollView>
      <View
        style={{
          bottom: isTablet ? 180 : 150,
          marginHorizontal: isTablet ? 40 : 20,
          width: isTablet ? "60%" : "90%",
          alignSelf: "center",
        }}
      >
        <View style={{ flexDirection: "column", width: "100%" }}>
          <Text
            style={{
              marginBottom: 5,
              textAlign: "center",
              fontSize: isTablet ? 32 : 26,
              color: themeStyle.SECONDARY_COLOR,
            }}
          >
            {t("insert-note")}
          </Text>

          <TextInput
            onChange={(e) => {
              updateOthers(e.nativeEvent.text, "note", "others");
            }}
            value={meal.others["note"]}
            placeholderTextColor={themeStyle.GRAY_600}
            multiline={true}
            selectionColor="black"
            underlineColorAndroid="transparent"
            numberOfLines={5}
            style={{
              backgroundColor: "white",
              textAlignVertical: "top",
              textAlign: "right",
              padding: isTablet ? 15 : 10,
              height: isTablet ? 100 : 80,
              width: "100%",
              borderRadius: 10,
              shadowColor: themeStyle.SECONDARY_COLOR,
              shadowOffset: {
                width: 2,
                height: 2,
              },
              shadowOpacity: 1,
              shadowRadius: 2,
              alignItems: "center",
              borderWidth: 0,
              fontSize: isTablet ? 18 : 16,
            }}
          />
        </View>
      </View>
      <Animatable.View
        animation="fadeInUp"
        duration={animationDuration}
        style={{
          position: "absolute",
          bottom: 0,
          left: 0,
          right: 0,
          backgroundColor: themeStyle.SECONDARY_COLOR,
          padding: isTablet ? 30 : 20,
          borderTopStartRadius: 30,
          borderTopEndRadius: 30,
          shadowColor: themeStyle.SECONDARY_COLOR,
          shadowOffset: {
            width: 2,
            height: 2,
          },
          shadowOpacity: 1,
          shadowRadius: 10,
          alignItems: "center",
          borderWidth: 0,
          height: isTablet ? 160 : 130,
        }}
      >
        <View
          style={{
            flexDirection: "row",
            justifyContent: "space-around",
            width: isTablet ? "50%" : "70%",
            alignItems: "center",
          }}
        >
          <View style={{ alignSelf: "center" }}>
            <Counter
              value={meal.others.qty}
              minValue={1}
              onCounterChange={(value) => {
                updateOthers(value, "qty", "others");
              }}
              variant={"colors"}
            />
          </View>
          <Text
            style={{
              fontSize: isTablet ? 28 : 22,
              color: themeStyle.WHITE_COLOR,
            }}
            type="number"
          >
            ₪{meal.data.price * meal.others.qty}
          </Text>
        </View>
        <View
          style={{
            width: isTablet ? "60%" : "90%",
            marginTop: isTablet ? 15 : 10,
          }}
        >
          <Button
            text={isEdit ? t("save") : t("add-to-cart")}
            icon="shopping-bag-plus"
            fontSize={isTablet ? 22 : 17}
            onClickFn={isEdit ? onUpdateCartProduct : onAddToCart}
            textColor={themeStyle.WHITE_COLOR}
            fontFamily={`${getCurrentLang()}-Bold`}
            borderRadious={19}
            disabled={!isValidMeal()}
          />
        </View>
      </Animatable.View>

      <ConfirmActiondDialog
        handleAnswer={handleConfirmActionAnswer}
        isOpen={isOpenConfirmActiondDialog}
        text={confirmActiondDialogText}
        positiveText="ok"
      />
    </Animatable.View>
  );
};
export default observer(MealScreen);

const styles = StyleSheet.create({
  gradiantRowContainer: {
    paddingHorizontal: 20,
    paddingVertical: 10,
  },
  buttonContainer: {
    width: "100%",
    backgroundColor: "rgba(254, 254, 254, 0.1)",
    // bottom: 20,
    // marginTop: 60,
    paddingVertical: 10,
  },
  titleContainer: {
    alignSelf: "center",
  },
  sectionContainer: {
    backgroundColor: "white",
    marginTop: 25,
    shadowColor: "#F1F1F1",
    shadowOffset: {
      width: 0,
      height: 0,
    },
    shadowOpacity: 1,
    shadowRadius: 30,
    elevation: 0,
    borderWidth: 0,
  },
  background: {
    position: "absolute",
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
    // borderRadius: 50,
  },
  backgroundAddCart: {
    position: "absolute",
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
    borderRadius: 50,
  },
  backgroundEdit: {
    position: "absolute",
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
    borderRadius: 50,

    // borderRadius: 50,
  },
  bannerLinear: {
    position: "absolute",
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
  },
  banner: {
    position: "absolute",
    left: -45,
    top: 20,
    width: 180,
    transform: [{ rotate: "45deg" }],
    // backgroundColor: themeStyle.PRIMARY_COLOR,
    color: "white",
    padding: 8,
    textAlign: "center",
  },
  cartCount: {
    position: "absolute",
    top: Platform.OS === "ios" ? 0 : 0,
    fontSize: 15,

    alignItems: "center",
    justifyContent: "center",
    color: themeStyle.SECONDARY_COLOR,
  },
});
