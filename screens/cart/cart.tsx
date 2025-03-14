import React, { useState, useEffect, useRef, useCallback } from "react";
import { useNavigation } from "@react-navigation/native";
import { useContext } from "react";
import { observer } from "mobx-react";
import {
  View,
  StyleSheet,
  Platform,
  Animated,
  LayoutAnimation,
  Easing,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import * as Animatable from "react-native-animatable";

/* styles */
import theme from "../../styles/theme.style";
import * as Location from "expo-location";
import { StoreContext } from "../../stores";
import Counter from "../../components/controls/counter";
import Text from "../../components/controls/Text";
import Icon from "../../components/icon";
import { ScrollView, TouchableOpacity } from "react-native-gesture-handler";
import BackButton from "../../components/back-button";
import { TCCDetails } from "../../components/credit-card/api/validate-card";
import AsyncStorage from "@react-native-async-storage/async-storage";

import Button from "../../components/controls/button/button";
import { getCurrentLang } from "../../translations/i18n";
import { useTranslation } from "react-i18next";
import themeStyle from "../../styles/theme.style";
import {
  SHIPPING_METHODS,
  bcoindId,
  cdnUrl,
  PAYMENT_METHODS,
  animationDuration,
  APP_NAME,
} from "../../consts/shared";
import CustomFastImage from "../../components/custom-fast-image";
import ConfirmActiondDialog from "../../components/dialogs/confirm-action";
const barcodeString = "https://onelink.to/zky772";

type TShippingMethod = {
  shipping: string;
  takAway: string;
};

const icons = {
  bagOff: require("../../assets/pngs/buy-off.png"),
  bagOn: require("../../assets/pngs/buy-on.png"),
  deliveryOff: require("../../assets/pngs/delivery-off.png"),
  deliveryOn: require("../../assets/pngs/delivery-on.png"),
  ccOn: require("../../assets/pngs/card-on.png"),
  ccOff: require("../../assets/pngs/card-off.png"),
};

const CartScreen = ({ route }) => {
  const { t } = useTranslation();

  const {
    cartStore,
    languageStore,
    storeDataStore,
    userDetailsStore,
    ordersStore,
    adminCustomerStore,
    menuStore,
  } = useContext(StoreContext);
  const navigation = useNavigation();

  const [itemsPrice, setItemsPrice] = React.useState(0);
  const [isOpenConfirmActiondDialog, setIsOpenConfirmActiondDialog] =
    useState(false);
  const [editOrderData, setEditOrderData] = useState(null);

  useEffect(() => {
    if (ordersStore.editOrderData) {
      setEditOrderData(ordersStore.editOrderData);
    }
  }, [ordersStore.editOrderData]);

  // useEffect(() => {
  //   if (editOrderData) {
  //     setSelectedOrderDate(editOrderData.orderDate);
  //     setShippingMethod(editOrderData.order.receipt_method);
  //     setPaymentMthod(editOrderData.order.payment_method);
  //     setDeliveryPrice(
  //       editOrderData.order.receipt_method == SHIPPING_METHODS.shipping ? 20 : 0
  //     );
  //     ordersStore.setOrderType(editOrderData.orderType);
  //   }
  // }, [editOrderData]);


  const updateItemsPrice = () => {
    if (cartStore.cartItems.length === 0 && !editOrderData) {
      navigation.navigate("homeScreen");
      return;
    }
    if (cartStore.cartItems.length === 1 && isBcoinInCart()) {
      const bcoinMeal = {
        data: menuStore.categories["OTHER"][0],
        others: { count: 1, note: "" },
      };
      cartStore.removeProduct(getProductIndexId(bcoinMeal, 0));

      navigation.navigate("homeScreen");
      return;
    }
    let tmpOrderPrice = 0;
    cartStore.cartItems.forEach((item) => {
      if (item && item.data.id !== bcoindId) {
        tmpOrderPrice +=
          (getPriceBySize(item) || item.data.price) *
          item.data.extras.counter.value;
      }
    });
    setItemsPrice(tmpOrderPrice);
  };

  useEffect(() => {
    updateItemsPrice();
  }, [cartStore.cartItems]);

  const getProductIndexId = (product, index) => {
    if (product) {
      return product?.data._id.toString() + index;
    }
  };

  const onCounterChange = (product, index, value) => {
    cartStore.updateProductCount(getProductIndexId(product, index), value);
  };
  const itemRefs = useRef([]);

  const [itemToRemove, setItemToRemove] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);
  const onRemoveProduct = (product, index) => {
    if (isAnimating) {
      return false;
    }
    setIsAnimating(true);
    setItemToRemove(getProductIndexId(product, index));

    handleAnimation();
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut, () => {
      // Remove the item from the list
    });

    setTimeout(() => {
      cartStore.removeProduct(getProductIndexId(product, index));
      setIsAnimating(false);
    }, 600);
  };

  const onEditProduct = (index) => {
    navigation.navigate("meal", { index });
  };

  const [rotateAnimation, setRotateAnimation] = useState(new Animated.Value(0));
  const handleAnimation = () => {
    // @ts-ignore
    Animated.timing(rotateAnimation, {
      toValue: 1,
      duration: 1000,
      useNativeDriver: false,
    }).start(() => {
      rotateAnimation.setValue(0);
    });
  };
  const interpolateRotating = rotateAnimation.interpolate({
    inputRange: [0, 1],
    outputRange: [1, 0],
  });
  const interpolateRotating2 = rotateAnimation.interpolate({
    inputRange: [0, 10],
    outputRange: [0, -6000],
  });

  const animatedStyle = {
    opacity: interpolateRotating,
    color: themeStyle.PRIMARY_COLOR,
    transform: [{ translateX: interpolateRotating2 }],
    borderRadius: 20,
  };

  const isBcoinProduct = (product) => {
    return product.data._id === bcoindId;
  };

  const isBcoinInCart = () => {
    const bcoinFound = cartStore.cartItems.find(
      (product) => product.data._id === bcoindId
    );
    return bcoinFound;
  };

  const anim = useRef(new Animated.Value(1));

  const shake = useCallback(() => {
    // makes the sequence loop
    Animated.loop(
      // runs the animation array in sequence
      Animated.sequence([
        // shift element to the left by 2 units
        Animated.timing(anim.current, {
          toValue: 1,
          duration: 300,
          useNativeDriver: false,
        }),
        // shift element to the right by 2 units
        Animated.timing(anim.current, {
          toValue: 1.5,
          duration: 300,
          useNativeDriver: false,
        }),
        // bring the element back to its original position
        Animated.timing(anim.current, {
          toValue: 1,
          duration: 300,
          useNativeDriver: false,
        }),
      ])
      // loops the above animation config 2 times
    ).start();
  }, []);

  useEffect(() => {
    shake();
  }, []);

  const getPriceBySize = (product) => {
    return null;
    return product.data.extras.size.options[product.data.extras.size.value]
      .price;

    const size = product.data.extras.size.options?.filter(
      (size) => size.title === product.data.extras.size.value
    )[0];
    return size?.price;
  };

  const onBackClick = () => {
    if (userDetailsStore.isAdmin() && editOrderData) {
      adminCustomerStore.resetUser();
      ordersStore.setEditOrderData(null);
      cartStore.resetCart();
    }
  };

  const value = useRef(new Animated.Value(0));
  useEffect(() => {
    if (cartStore.cartItems?.length > 0) {
      Animated.timing(value.current, {
        toValue: cartStore.cartItems.length + 1,
        useNativeDriver: true,
        delay: 0,
        duration: cartStore.cartItems.length * 500,
        easing: Easing.linear,
      }).start();
    }
  }, [cartStore.cartItems]);



  let extrasArray = [];
  const renderFilteredExtras = (filteredExtras, extrasLength, key) => {
    return filteredExtras.map((extra, tagIndex) => {
      extrasArray.push(extra.id);
      return (
        <View>
          {/* <View
              style={{
                borderWidth: 1,
                width: 1,
                height: 20,
                position: "absolute",
                top: 10,
                left: 3,
                borderColor: themeStyle.PRIMARY_COLOR,
              }}
            ></View> */}
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              paddingBottom: 10,
            }}
          >
            <View
              style={{
                height: 8,
                width: 8,
                backgroundColor: themeStyle.PRIMARY_COLOR,
                borderRadius: 100,
                marginRight: 5,
              }}
            ></View>
            <View style={{ flexDirection: "row", alignItems: "center" }}>
              {extra.value === false && (
                <Text
                  style={{
                    fontFamily: `${getCurrentLang()}-SemiBold`,
                    fontSize: 14,
                    color: themeStyle.SUCCESS_COLOR,
                    marginRight: 2,
                  }}
                >
                  {t("without")}
                </Text>
              )}
              <Text
                style={{
                  textAlign: "left",
                  fontFamily: `${getCurrentLang()}-SemiBold`,
                  fontSize: 14,
                  color: themeStyle.SUCCESS_COLOR,
                }}
              >
                {menuStore.translate(extra.name)} {extra.value}
              </Text>
            </View>
          </View>
        </View>
      );
    });
  };


  const onPickTime = async () => {
    if(userDetailsStore.isAdmin() || !storeDataStore.storeData.isEnablePickTimeNote){
      goToPickTimeScreen();
    }else{
      setIsOpenConfirmActiondDialog(true);
    }
  };

  const goToPickTimeScreen = () => {
    navigation.navigate("pick-time-screen");
  };

  const handleConfirmActionAnswer = (answer: string) => {
    setIsOpenConfirmActiondDialog(false);
    goToPickTimeScreen();
  };

  const handleSubmintButton = () => {
    if(storeDataStore.storeData.isOrderLaterSupport){
      onPickTime();
    }else{
      navigation.navigate("checkout-screen");
    }
  };

  return (
    <View style={{ position: "relative", height: "100%", flex: 1, bottom: 0 }}>
      {/* <LinearGradient
        colors={["#c1bab3", "#efebe5", "#d8d1ca", "#dcdcd4", "#ccccc4"]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={[styles.background]}
      /> */}
      <ScrollView style={{ height: "100%", marginBottom: 110 }}>
        <View style={{ ...styles.container }}>
          <View style={{ paddingHorizontal: 20 }}>
            <View style={styles.backContainer}>
              <View
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  backgroundColor: "rgba(36, 33, 30, 0.8)",
                  paddingHorizontal: 5,
                  borderRadius: 10,
                }}
              >
                <Text
                  style={{
                    fontSize: 20,
                    color: themeStyle.SECONDARY_COLOR,
                  }}
                >
                  {t("items-count")}
                </Text>
                <Text
                  style={{
                    fontSize: 20,
                    color: themeStyle.SECONDARY_COLOR,
                    fontFamily: `${getCurrentLang()}-American-bold`,
                  }}
                >
                  {cartStore.getProductsCount()}{" "}
                </Text>
              </View>
              <View
                style={{
                  width: 40,
                  height: 35,
                  alignItems: "center",
                  justifyContent: "center",
                  marginVertical: 10,
                  marginLeft: 10,
                  backgroundColor: "rgba(36, 33, 30, 0.8)",
                  paddingHorizontal: 5,
                  borderRadius: 10,
                }}
              >
                <BackButton onClick={onBackClick} />
              </View>
            </View>

            <View style={{ marginTop: 10 }}>
              {/* <LinearGradient
                colors={[
                  "rgba(239, 238, 238, 0)",
                  "rgba(239, 238, 238, 0.6)",

                  "rgba(239, 238, 238, 0.6)",
                  "rgba(239, 238, 238, 0.6)",

                  "rgba(239, 238, 238, 0)",
                ]}
                start={{ x: 1, y: 0 }}
                end={{ x: 0, y: 0 }}
                style={[
                  styles.background,
                  { marginTop: 30, marginBottom: -30 },
                ]}
              /> */}
              {cartStore.cartItems.map((product, index) => {
                const moveBy = (1 - 1 / 1) * index;

                return (
                  product && (
                    <Animated.View
                      style={{
                        borderRadius: 20,
                        marginTop: index != 0 ? 15 : 0,
                        shadowColor: "black",
                        shadowOffset: {
                          width: 0,
                          height: 2,
                        },
                        shadowOpacity: 0.9,
                        shadowRadius: 6,
                        elevation: 5,
                        borderWidth: 0,
                        backgroundColor: "transparent",

                        opacity: value.current.interpolate({
                          inputRange:
                            index === 0
                              ? [-1, 0, 1, 2]
                              : [
                                  index - 1 - moveBy,
                                  index - moveBy,
                                  index + 1 - moveBy,
                                  index + 2 - moveBy,
                                ],
                          outputRange: [0, 0, 1, 1],
                          extrapolate: "clamp",
                        }),
                      }}
                    >
                      <Animated.View
                        style={[
                          getProductIndexId(product, index) === itemToRemove
                            ? animatedStyle
                            : null,
                          {
                            backgroundColor: themeStyle.SECONDARY_COLOR,
                            borderRadius: 20,
                          },
                        ]}
                      >
                        {/* <LinearGradient
                          colors={[
                            "rgba(207, 207, 207, 0.4)",
                            "rgba(246,246,247, 0.8)",
                            "rgba(246,246,247, 0.8)",
                            "rgba(207, 207, 207, 0.4)",
                          ]}
                          start={{ x: 1, y: 0 }}
                          end={{ x: 1, y: 1 }}
                          style={[styles.background]}
                        /> */}
                        <View
                          ref={itemRefs[getProductIndexId(product, index)]}
                          style={{
                            // borderColor: "#707070",
                            // borderColor: "rgba(112,112,112,0.1)",
                            // shadowColor: "#C19A6B",
                            // shadowOffset: {
                            //   width: 0,
                            //   height: 2,
                            // },
                            // shadowOpacity: 0.1,
                            // shadowRadius: 3.84,
                            // elevation: 8,
                            borderRadius: 20,
                            overflow: "hidden",
                            // backgroundColor: "#c1bab3"
                            // "radial-gradient(circle, rgba(121,117,119,0.5) 100%, rgba(88,88,88,0.5) 100%)",
                          }}
                          key={getProductIndexId(product, index)}
                        >
                          {/* <View
                                style={{
                                  flexDirection: "row",
                                  alignItems: "center",
                                }}
                              >
                                <View
                                  style={{
                                    justifyContent: "center",
                                  }}
                                >
                                  <Text
                                    style={{
                                      textAlign: "left",
                                      fontFamily: `${getCurrentLang()}-Bold`,
                                      fontSize: 20,
                                      marginLeft: isBcoinProduct(product)
                                        ? 10
                                        : 0,
                                      color: themeStyle.BROWN_700,
                                    }}
                                  >
                                    {
                                      product.data.name
                                    }
                                  </Text>
                                </View>
                              </View> */}
                          <View
                            style={{
                              flexDirection: "row",
                              alignItems: "center",
                              justifyContent: "space-between",
                            }}
                          >
                            <View
                              style={{
                                width: "100%",
                                flexDirection: "row",
                                paddingTop: 5,
                              }}
                            >
                              <View
                                style={{
                                  width: 80,
                                  height: 80,
                                  padding: 5,
                                  shadowColor: "black",
                                  shadowOffset: {
                                    width: 0,
                                    height: 2,
                                  },
                                  shadowOpacity: 0.9,
                                  shadowRadius: 6,
                                  elevation: 0,
                                  borderWidth: 0,
                                }}
                              >
                                <CustomFastImage
                                  style={{
                                    width: "100%",
                                    height: "100%",
                                    marginLeft: 0,
                                    borderRadius: 20,
                                  }}
                                  source={{
                                    uri: `${cdnUrl}${product.data.img[0].uri}`,
                                  }}
                                  cacheKey={`${APP_NAME}_${product.data.img[0].uri
                                    .split(/[\\/]/)
                                    .pop()}`}
                                />
                              </View>
                              <View
                                style={{
                                  flexDirection: "row",
                                  marginLeft: 5,
                                  marginTop: 10,
                                  marginBottom: 10,
                                }}
                              >
                                <View
                                  style={{
                                    marginTop: -5,
                                    flexDirection: "column",
                                    justifyContent: "space-between",
                                    flexBasis: "65%",
                                  }}
                                >
                                  <View
                                    style={{
                                      borderColor: themeStyle.PRIMARY_COLOR,
                                      alignItems: "center",
                                      borderTopWidth: 1,
                                      borderBottomWidth: 1,
                                      justifyContent: "center",
                                      paddingTop: 8,
                                      paddingBottom: 5,
                                    }}
                                  >
                                    <Text
                                      style={{
                                        textAlign: "left",
                                        fontSize: 18,
                                        color: themeStyle.TEXT_PRIMARY_COLOR,
                                        fontFamily: `${getCurrentLang()}-Bold`,
                                      }}
                                    >
                                      {languageStore.selectedLang === "ar"
                                        ? product.data.nameAR
                                        : product.data.nameHE}
                                    </Text>
                                  </View>

                                  <View
                                    style={{
                                      flexDirection: "row",
                                      justifyContent: "space-between",
                                      marginTop: 15,
                                    }}
                                  ></View>
                                  <View
                                    style={{
                                      flexDirection: "row",
                                    }}
                                  >
                                    <Text
                                      style={{
                                        fontSize: 18,
                                        color: themeStyle.TEXT_PRIMARY_COLOR,
                                      }}
                                    >
                                      <View style={{marginRight:10}}>
                                      <Icon
                                        icon="scale"
                                        size={20}
                                        style={{
                                          color: themeStyle.TEXT_PRIMARY_COLOR,
                                        }}
                                      />
                                      </View>
                          
                                      {t("weight")} :{" "}
                                      {t(product?.data?.extras?.weight?.value)}
                                      <Text
                                        style={{
                                          fontSize: 16,
                                          color: themeStyle.TEXT_PRIMARY_COLOR,
                                        }}
                                      >
                                        {" "}
                                        {t("gram")}
                                      </Text>
                                    </Text>
                                  </View>

                                  {product?.others?.note && (
                                    <View
                                      style={{
                                        flexDirection: "row",
                                        marginTop: 15,
                                      }}
                                    >
                                      <View>
                                        <Icon
                                          icon="file-text2"
                                          size={20}
                                          style={{
                                            color: themeStyle.PRIMARY_COLOR,
                                            marginRight: 10,
                                          }}
                                        />
                                      </View>

                                      <View
                                        style={{
                                          // flexDirection: "row",
                                          alignSelf: "flex-start",
                                        }}
                                      >
                                        <Text
                                          style={{
                                            fontSize: 18,
                                            alignSelf: "flex-start",
                                          }}
                                        >
                                          {t('note')}:
                                        </Text>
                                        <Text
                                          style={{
                                            fontSize: 18,
                                            color:
                                              themeStyle.TEXT_PRIMARY_COLOR,
                                            alignSelf: "flex-start",
                                          }}
                                        >
                                          {product.others.note}
                                        </Text>
                                      </View>
                                    </View>
                                  )}

                                  <View
                                    style={{
                                      flexDirection: "row",
                                      alignItems: "center",
                                      justifyContent: "center",
                                      marginTop: 25,
                                    }}
                                  >
                                    <View
                                      style={{
                                        flexDirection: "row",
                                      }}
                                    >
                                      <View style={{}}>
                                        <Counter
                                          value={
                                            product?.data?.extras?.counter
                                              ?.value
                                          }
                                          minValue={1}
                                          onCounterChange={(value) => {
                                            onCounterChange(
                                              product,
                                              index,
                                              value
                                            );
                                          }}
                                          variant={"colors"}
                                          size={30}
                                        />
                                      </View>
                                    </View>
                                    <View
                                      style={{
                                        alignItems: "center",
                                        justifyContent: "center",
                                        marginLeft: 15,
                                      }}
                                    >
                                      <View
                                        style={{
                                          flexDirection: "row",
                                          alignItems: "center",
                                        }}
                                      >
                                        <Text
                                          style={{
                                            fontSize: 20,
                                            fontWeight: "bold",
                                            color: themeStyle.PRIMARY_COLOR,
                                          }}
                                          type="number"
                                        >
                                          {(getPriceBySize(product) ||
                                            product.data.price) *
                                            product?.data?.extras?.counter
                                              ?.value}
                                        </Text>
                                        <Text
                                          style={{
                                            fontWeight: "bold",
                                            fontSize: 17,
                                            color: themeStyle.PRIMARY_COLOR,
                                          }}
                                        >
                                          ₪
                                        </Text>
                                      </View>
                                    </View>
                                  </View>

                                  {/* {product.extras &&
                                      Object.keys(product.extras).map(
                                        (key, extraIndex) => {
                                          if (key === "orderList") {
                                            return;
                                          }
                                          const filteredExtras = filterMealExtras(
                                            product.extras[key]
                                          );
                                          return (
                                            filteredExtras.length > 0 &&
                                            renderExtras(
                                              filteredExtras,
                                              Object.keys(product.extras)
                                                .length,
                                              key
                                            )
                                          );
                                        }
                                      )} */}
                                </View>
                              </View>
                              <View
                                style={{
                                  position: "absolute",
                                  right: -10,
                                  top: -10,
                                }}
                              >
                                <View>
                                  <TouchableOpacity
                                    style={{
                                      backgroundColor: themeStyle.ERROR_COLOR,
                                      height: 40,
                                      borderRadius: 10,
                                      width: 40,
                                      alignItems: "flex-end",
                                    }}
                                    onPress={() => {
                                      onRemoveProduct(product, index);
                                    }}
                                  >
                                    <Text
                                      style={{
                                        color: themeStyle.WHITE_COLOR,
                                        right: 20,
                                        top: 15,
                                        fontSize: 18,
                                        fontWeight: "900",
                                        fontFamily: `${getCurrentLang()}-GS-Black-Bold`,
                                      }}
                                    >
                                      X
                                    </Text>
                                  </TouchableOpacity>
                                </View>
                              </View>

                              <View
                                style={{
                                  position: "absolute",
                                  right: -14,
                                  bottom: -8,
                                }}
                              >
                                <View>
                                  <TouchableOpacity
                                    style={{
                                      backgroundColor: themeStyle.SUCCESS_COLOR,
                                      height: 40,
                                      borderRadius: 10,
                                      width: 45,
                                      alignItems: "flex-end",
                                    }}
                                    onPress={() => {
                                      //onRemoveProduct(product, index);
                                      onEditProduct(index);
                                    }}
                                  >
                                    <Icon
                                      icon="pencil"
                                      size={15}
                                      style={{
                                        right: 22,
                                        top: 8,
                                        color: themeStyle.WHITE_COLOR,
                                      }}
                                    />
                                  </TouchableOpacity>
                                </View>
                              </View>
                            </View>
                          </View>
                        </View>
                      </Animated.View>
                    </Animated.View>
                  )
                );
              })}
            </View>
          </View>
        </View>
      </ScrollView>
      <Animatable.View
        animation="fadeInUp"
        duration={animationDuration}
        style={{
          position: "absolute",
          bottom: 0,
          left: 0,
          right: 0,
          backgroundColor: themeStyle.SECONDARY_COLOR,
          flexDirection: "row",
          justifyContent: "space-between",
          padding: 20,
          borderTopStartRadius: 30,
          borderTopEndRadius: 30,
          shadowColor: themeStyle.PRIMARY_COLOR,
          shadowOffset: {
            width: 2,
            height: 2,
          },
          shadowOpacity: 1,
          shadowRadius: 15,
          alignItems: "center",
          height: 100,
        }}
      >
        <View style={{ width: "50%" }}>
          <Button
            onClickFn={handleSubmintButton}
            text={storeDataStore.storeData.isOrderLaterSupport? t("pick-time") : t("continue-to-pay")}
            fontSize={18}
            textColor={theme.WHITE_COLOR}
            borderRadious={50}
            textPadding={0}
          />
        </View>

        <View style={{ alignItems: "center", justifyContent: "center" }}>
          <View>
            <Text style={{ fontSize: 18, color: themeStyle.PRIMARY_COLOR }}>
              {t("price")}
            </Text>
          </View>
          <View>
            <Text
              style={{ fontSize: 22,  }}
              type="number"
            >
              ₪{itemsPrice}
            </Text>
          </View>
        </View>
      </Animatable.View>
      <ConfirmActiondDialog
        handleAnswer={handleConfirmActionAnswer}
        isOpen={isOpenConfirmActiondDialog}
        text={"pick-time-note"}
        positiveText="ok"
        isLoop
        isAnimateText
      />
    </View>
  );
};

export default observer(CartScreen);
// MapScreen.navigationOptions = {
//     header: null
// }

const styles = StyleSheet.create({
  container: {
    height: "100%",
  },
  backContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  togglleContainer: {
    borderRadius: 50,
    marginTop: 30,
    borderWidth: 2,
    overflow: "hidden",
    borderColor: theme.PRIMARY_COLOR,
    flexDirection: "row",
    width: "100%",
    shadowColor: "black",
    shadowOffset: {
      width: 2,
      height: 2,
    },
    shadowOpacity: 1,
    shadowRadius: 20,
  },
  togglleCItem: {
    borderWidth: 0,

    borderRadius: 50,
    flex: 1,
    alignItems: "flex-start",
  },
  togglleItemContent: {},
  togglleItemContentContainer: {
    width: "100%",
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    height: "100%",
  },
  mapContainerDefault: {
    width: "90%",
    height: 200,
    borderRadius: 10,
    minHeight: 200,
  },
  mapContainer: {
    width: "100%",
    height: 200,
    borderRadius: 10,
    minHeight: 200,
  },
  mapViewContainer: {
    width: "90%",
    height: 200,
    marginTop: 5,
    borderRadius: 10,
    minHeight: 200,
    alignSelf: "center",
    shadowColor: "black",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.9,
    shadowRadius: 6,
    elevation: 20,
    borderWidth: 0,
  },
  totalPrictContainer: {
    paddingHorizontal: 20,
    marginHorizontal: 20,
    marginTop: 40,
  },
  priceRowContainer: {
    flexDirection: "row",
    marginBottom: 10,
    fontSize: 25,
    alignItems: "center",
    justifyContent: "center",
  },
  submitButton: {
    backgroundColor: theme.SUCCESS_COLOR,
    borderRadius: 15,
    marginTop: 30,
  },
  submitContentButton: {
    height: 50,
  },
  background: {
    position: "absolute",
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
    height: "100%",
  },
  image: {
    flex: 1,
    resizeMode: "cover",
    justifyContent: "center",
  },
});
