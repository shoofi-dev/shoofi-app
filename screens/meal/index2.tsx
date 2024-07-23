import {
  StyleSheet,
  View,
  Image,
  TouchableOpacity,
  DeviceEventEmitter,
  TextInput,
  KeyboardAvoidingView,
  Animated,
  Dimensions,
  Platform,
} from "react-native";
import { orderBy } from "lodash";
import Text from "../../components/controls/Text";
import BirthdayImagesList from "../../components/birthday-images-list";
import { useNavigation } from "@react-navigation/native";
import { observer } from "mobx-react";
import { isEmpty } from "lodash";

import GradiantRow from "../../components/gradiant-row";
import Button from "../../components/controls/button/button";
import { useContext, useState, useEffect, useRef, useCallback } from "react";
import { StoreContext } from "../../stores";
import { ScrollView } from "react-native-gesture-handler";
import themeStyle from "../../styles/theme.style";
import Icon from "../../components/icon";
import { getCurrentLang } from "../../translations/i18n";
import { useTranslation } from "react-i18next";
import { LinearGradient } from "expo-linear-gradient";
import * as Haptics from "expo-haptics";
import {
  canOrderOutOfStock,
  cdnUrl,
  mealsImages,
  ORDER_TYPE,
  shmareemId,
  TASETS_LIST,
} from "../../consts/shared";
import CheckBox from "../../components/controls/checkbox";
import Counter from "../../components/controls/counter";
import PickImagedDialog from "../../components/dialogs/pick-image";
import DropDown from "../../components/controls/dropdown";
import CustomFastImage from "../../components/custom-fast-image";
import PickImageNotificationDialog from "../../components/dialogs/pick-image-notification/pick-image-notification";
import OutOfStockDialog from "../../components/dialogs/out-of-stock/out-of-stock";
import ConfirmActiondDialog from "../../components/dialogs/confirm-action";
import InputText from "../../components/controls/input";
import AddCustomImagedDialog from "../../components/dialogs/add-custom-image";
import ToggleControl from "../../components/controls/toggle";

const showCakeNoteList = ["3", "5"];

const gradiantColors =
  Platform.OS === "ios"
    ? [
        "rgba(199, 199, 199, 0.9)",
        "rgba(254, 254, 254, 0.9)",
        "rgba(254, 254, 254, 0.9)",
        "rgba(254, 254, 254, 0.9)",
        "rgba(199, 199, 199, 0.9)",
      ]
    : [
        "rgba(199, 199, 199, 0.5)",
        "rgba(254, 254, 254, 0.1)",
        "rgba(254, 254, 254, 0.1)",
        "rgba(254, 254, 254, 0.1)",
        "rgba(199, 199, 199, 0.1)",
      ];

const MealScreen = ({ route }) => {
  const { t } = useTranslation();
  const scrollRef = useRef();

  const { product, index, category } = route.params;
  const navigation = useNavigation();
  let {
    cartStore,
    ordersStore,
    languageStore,
    storeDataStore,
    userDetailsStore,
    authStore
  } = useContext(StoreContext);
  const [meal, setMeal] = useState(null);
  const [clientImage, setClientImage] = useState();
  const [suggestedImage, setSuggestedImage] = useState();
  const [isEdit, setIsEdit] = useState(false);
  const [isSelectOpen, setIsSelectOpen] = useState(false);
  const [customCakeData, setCustomCakeData] = useState(null);
  const [isPickImageDialogOpen, setIsPickImageDialogOpen] = useState(false);
  const [isPickImageDone, setIsPickImageDone] = useState(false);
  const [selectedPizzaHalf, setSelectedPizzaHalf] = useState("halfOne");
  const [
    isPickImageNotificationDialogOpen,
    setIsPickImageNotificationDialogOpen,
  ] = useState(false);
  const [pickImageNotificationDialogText, setPickImageNotificationDialogText] =
    useState("");
  const [isOpenConfirmActiondDialog, setIsOpenConfirmActiondDialog] =
    useState(false);
  const [confirmActiondDialogText, setConfirmActiondDialogText] = useState("");

  useEffect(() => {
    let tmpProduct: any = {};
    if (product) {
      setIsEdit(false);
      // tmpProduct = menuStore.getMealByKey(product.id);
      tmpProduct.data = {...product};
      // for products without constants
      if (isEmpty(tmpProduct)) {
        tmpProduct.data = {...product};
      }
      tmpProduct.others = { count: 1, note: "" };
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

  const initExtras = () => {};

  const onAddToCart = () => {
    if (
      ((ordersStore.orderType == ORDER_TYPE.now && !meal.data.isInStore) ||
        (storeDataStore.storeData.isInStoreOrderLaterCats.indexOf(
          meal?.data?.categoryId
        ) > -1 &&
          !meal.data.isInStore)) &&
      storeDataStore.storeData?.isOutOfStockCanOrderProduct?.indexOf(
        meal.data._id
      ) == -1
    ) {
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

  const handlePickImageAnswer = (value: any) => {
    if (value?.clientImage) {
      updateMealClientImage(
        value?.clientImage,
        "image",
        null,
        "suggestedImage"
      );
    }
    if (value?.suggestedImage) {
      updateMealClientImage(
        value?.suggestedImage,
        "suggestedImage",
        null,
        "image"
      );
    }
    setIsPickImageDone(true);
    setIsPickImageDialogOpen(false);
  };

  const handlePickNotificationAnswer = (value: any) => {
    setIsPickImageNotificationDialogOpen(false);
    setTimeout(() => {
      shake();
    }, 500);
  };

  const handleConfirmActionAnswer = (answer: string) => {
    setConfirmActiondDialogText("");
    setIsOpenConfirmActiondDialog(false);
  };

  const updateMealClientImage = (value1, tag1, value2, tag2) => {
    setMeal({
      ...meal,
      data: {
        ...meal.data,
        extras: {
          ...meal.data.extras,
          [tag1]: { ...meal.data.extras[tag1], value: value1 },
          [tag2]: { ...meal.data.extras[tag2], value: value2 },
        },
      },
    });
  };

  const onClose = () => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    navigation.goBack();
  };

  useEffect(() => {
    if (meal) {
      const sizePrice =
        meal?.data?.extras?.size?.options[meal?.data?.extras?.size?.value]
          .price;

      let finalPrice = sizePrice;

      if (meal.data?.extras?.halfOne?.value.indexOf("tuna") > -1) {
        finalPrice = finalPrice + 5;
      }
      if (meal.data?.extras?.halfTwo?.value.indexOf("tuna") > -1) {
        finalPrice = finalPrice + 5;
      }

      if (meal.data?.extras?.halfOne) {
        const filterTunaHalfOne = meal.data?.extras?.halfOne?.value.filter(
          (extra) => extra != "tuna"
        );
        const extraPayHalfOne = filterTunaHalfOne.slice(
          meal.data?.extras?.halfOne?.value.length != filterTunaHalfOne.length
            ? 2
            : 3
        );
        if (extraPayHalfOne.length > 0) {
          extraPayHalfOne.map((extra) => {
            const currentExtra = storeDataStore.storeData.pizzaExtras.filter(
              (item) => item.title == extra
            )[0];
            finalPrice = finalPrice + currentExtra.price;
          });
        }
      }

      if (meal.data?.extras?.halfTwo) {
        const filterTunaHalfTwo = meal.data?.extras?.halfTwo?.value.filter(
          (extra) => extra != "tuna"
        );
        const extraPayHalfTwo = filterTunaHalfTwo.slice(
          meal.data?.extras?.halfTwo?.value.length != filterTunaHalfTwo.length
            ? 2
            : 3
        );

        if (extraPayHalfTwo.length > 0) {
          extraPayHalfTwo.map((extra) => {
            const currentExtra = storeDataStore.storeData.pizzaExtras.filter(
              (item) => item.title == extra
            )[0];
            finalPrice = finalPrice + currentExtra.price;
          });
        }
      }

      setMeal({
        ...meal,
        data: {
          ...meal.data,
          price: finalPrice,
        },
      });
    }
  }, [meal?.data.extras]);

  const updateMeal = (value, tag, type) => {
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

  const customCakeUpdateMealPrice = (price) => {
    setMeal({
      ...meal,
      data: {
        ...meal.data,
        price: price,
      },
    });
  };

  const tasteScorll = () => {
    // scrollRef.current?.scrollTo({
    //   y: 500,
    //   animated: true,
    // });
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
                ? extraPrice + tagItem.price * meal.others.count
                : extraPrice - tagItem.price * meal.others.count;
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
                ? extraPrice + tagItem.price * meal.others.count
                : extraPrice - tagItem.price * meal.others.count;
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
                ? extraPrice + tagItem.price * meal.others.count
                : extraPrice - tagItem.price * meal.others.count;
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
    if (key === "count") {
      const updatedPrice =
        meal.data.price +
        (value - meal.others.count) * (meal.data.price / meal.others.count);
      setMeal({
        ...meal,
        [type]: { ...meal[type], [key]: value },
        data: { ...meal.data },
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

  const isOneChoiceTag = (tags) => {
    const result = tags.find((tag) => tag.multiple_choice === false);
    return !!result;
  };
  const isOneChoiceTagStyle = (tags) => {
    const result = isOneChoiceTag(tags);
    const rowStyle = {
      flexDirection: "row",
      justifyContent: "space-evenly",
    };
    return result ? rowStyle : {};
  };

  const orderList = (index: any) => {
    const result = Object.keys(meal.extras.orderList).find(
      (key) => meal.extras.orderList[key] === index
    );
    return result;
  };
  const sizes = {
    medium: true,
    large: false,
  };

  const [sizesOptions, setSizeOptions] = useState(sizes);

  const onSizeChange = (value, key) => {
    const updatesSizeOptions = sizes;
    Object.keys(sizesOptions).forEach((size) => {
      updatesSizeOptions[size] = size === key;
    });
    setSizeOptions(updatesSizeOptions);
  };

  const getPriceBySize = () => {
    return null;
    let finalPrice = 0;
    if (
      meal.data.extras?.image?.value ||
      meal.data.extras?.suggestedImage?.value
    ) {
      finalPrice = finalPrice + 10;
    }
    finalPrice =
      finalPrice +
      meal.data.extras.size.options[meal.data.extras.size.value].price;

    return finalPrice;

    const size = meal.data.extras.size.options?.filter(
      (size) => size.title === meal.data.extras.size.value
    )[0];
    return size.price;
  };

  const onSelectToggle = (value: boolean) => {
    setIsSelectOpen(value);
  };

  const isValidMeal = () => {
    return isTasteValid();
  };

  const isTasteValid = () => {
    if (meal.data.extras["taste"] && meal.data.extras["taste"].options) {
      let isValid = true;
      if (
        !isEmpty(meal.data.extras["taste"].value) &&
        Object.keys(meal.data.extras["taste"].value).length ==
          Object.keys(meal.data.extras["taste"].options).length
      ) {
        Object.keys(meal.data.extras["taste"].value).forEach((tasteKey) => {
          if (!meal.data.extras["taste"].value[tasteKey]) {
            isValid = false;
          }
        });
      } else {
        return false;
      }

      return isValid;
    } else {
      return true;
    }
  };

  const initShmareemTastes = (list) => {
    const tmpList = list.filter(
      (taste) => meal.data.activeTastes.indexOf(taste.value) > -1
    );
    return tmpList;
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

  const handleCustomCakeInputChange = (value, key) => {
    setCustomCakeData({
      ...customCakeData,
      [key]: value,
    });
  };
  const anim = useRef(new Animated.Value(0));

  const shake = useCallback(() => {
    // makes the sequence loop
    Animated.loop(
      // runs the animation array in sequence
      Animated.sequence([
        // shift element to the left by 2 units
        Animated.timing(anim.current, {
          toValue: 1,
          duration: 200,
        }),
        // shift element to the right by 2 units
        Animated.timing(anim.current, {
          toValue: 1.2,
          duration: 200,
        }),
        // bring the element back to its original position
        Animated.timing(anim.current, {
          toValue: 1,
          duration: 200,
        }),
      ]),
      // loops the above animation config 2 times
      { iterations: 2 }
    ).start();
  }, []);

  const handlePickImage = () => {
    if (storeDataStore.storeData.image_support) {
      setIsPickImageDialogOpen(true);
    } else {
      setConfirmActiondDialogText(t("image-not-supported"));
      setIsOpenConfirmActiondDialog(true);
    }
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

  if (!meal) {
    return null;
  }

  return (
    <View style={{ height: "100%" }}>
      <LinearGradient
        colors={[
          "rgba(207, 207, 207, 0.4)",
          "rgba(246,246,247, 0.1)",
          "rgba(246,246,247, 0.8)",
          "rgba(246,246,247, 0.8)",
          "rgba(246,246,247, 0.8)",
          "rgba(246,246,247, 0.8)",
          "rgba(207, 207, 207, 0.4)",
        ]}
        start={{ x: 1, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={[styles.background]}
      />
      <View
        style={{
          width: Dimensions.get("window").width + 70,
          height: Dimensions.get("window").width + 70,
          backgroundColor: "#C31A21",
          position: "absolute",
          borderRadius:Dimensions.get("window").width / 1.9,
          marginTop: (Dimensions.get("window").width/2 * -1) - 140,
          alignSelf:'center'
        }}
      >
   
      </View>

      <View style={{ zIndex: 10 }}>
        <TouchableOpacity
          onPress={onClose}
          style={{
            zIndex: 1,
            position: "absolute",
            right: 10,
            width: 40,
            padding: 0,
            alignItems: "center",
            height: 40,
            justifyContent: "center",
            top: 10,
          }}
        >
          <Icon
            icon={"arrow-left2"}
            style={{ color: themeStyle.WHITE_COLOR }}
            size={30}
          />
        </TouchableOpacity>
      </View>
      <View style={{ zIndex: 10 }}>
      <TouchableOpacity
            style={[{
              zIndex: 1,
              position: "absolute",
              left: 10,
              width: 40,
              padding: 0,
              alignItems: "center",
              height: 40,
              justifyContent: "center",
              top: 10,
            }]}
            onPress={handleCartClick}
        >
          <Icon icon="cart_icon" size={30} style={{ color: themeStyle.WHITE_COLOR }} />
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
          padding:5,
        }}
      >
        <Image
          source={mealsImages[meal.data.img]}
          style={{
            alignSelf: "center",
            width: 150,
            height: 150,
            borderRadius: 100,
          }}
        />
      </View>
      <ScrollView ref={scrollRef} style={{ height: "100%" }}>
        <KeyboardAvoidingView
          keyboardVerticalOffset={100}
          behavior="position"
          style={{ flex: 1 }}
        >
          <View
            style={{
              paddingBottom: 15,
              width: "100%",
              height: "100%",
              // borderRadius: 30,
              // borderTopLeftRadius:30,
              alignSelf: "center",
              minHeight:
                Platform.OS === "ios"
                  ? "100%"
                  : Dimensions.get("window").height -
                    (Dimensions.get("window").height * 70) / 100,
              marginTop: 15,
            }}
          >
            <View
              style={{
                alignSelf: "center",
                zIndex: isSelectOpen ? 0 : 1,
              }}
            >
              <Counter
                value={meal.data.extras.counter.value}
                minValue={1}
                onCounterChange={(value) => {
                  updateMeal(value, "counter", meal.data.extras.counter.type);
                }}
                variant={"colors"}
              />
            </View>
            <View
              style={{
                height: "90%",
                position: "relative",
              }}
            >
              {/* {meal.data?.categoryId != "8" && (
                <View
                  style={{
                    height: 125,
                    width: 125,
                    position: "absolute",
                    overflow: "hidden",
                  }}
                >
                  <View style={[styles.banner, { alignItems: "center" }]}>
                    <LinearGradient
                      colors={[
                        "rgba(183, 133, 77, 1)",
                        "rgba(198, 143, 81, 1)",
                        "rgba(215, 156, 86, 1)",
                        "rgba(220, 160, 88, 1)",
                        "rgba(222, 161, 88, 1)",
                      ]}
                      start={{ x: 0, y: 0 }}
                      end={{ x: 1, y: 0 }}
                      style={[styles.bannerLinear]}
                    />
                    <Text
                      style={{
                        color: "white",
                        alignItems: "center",
                        fontSize: 25,
                      }}
                      type="number"
                    >
                      ₪{" "}
                      {(getPriceBySize() || meal.data.price) *
                        meal.data.extras.counter.value}
                    </Text>
                  </View>
                </View>
              )} */}

              {meal.data?.categoryId == "1" && (
                <View style={{ marginTop: 20, width: "100%" }}>
                  <GradiantRow
                    onChangeFn={(value) => {
                      updateMeal(value, "size", meal.data.extras["size"].type);
                    }}
                    type={meal.data.extras["size"].type}
                    value={meal.data.extras["size"].value}
                    title={"size"}
                    options={meal.data.extras["size"].options}
                  />
                </View>
              )}

              {meal.data?.categoryId == "1" && (
                <View style={{ marginTop: 10 }}>
                  <View style={{ marginHorizontal: 40, marginBottom: 20 }}>
                    <ToggleControl
                      value={selectedPizzaHalf}
                      option1={"halfOne"}
                      option2={"halfTwo"}
                      onChange={(value) => {if(value){setSelectedPizzaHalf(value)}}}
                    />
                    <View
                      style={{
                        flexDirection: "row",
                        marginTop: 5,
                        alignItems: "center",
                        justifyContent: "center",
                      }}
                    >
                      <Text
                        style={{ fontSize: 16, marginRight: 3 }}
                        type="number"
                      >
                        3
                      </Text>
                      <Text style={{ fontSize: 16 }}>{t('extra-free')}</Text>
                    </View>
                  </View>
                  {selectedPizzaHalf == "halfOne" && (
                    <View style={{ width: "100%" }}>
                      <GradiantRow
                        onChangeFn={(value) => {
                          updateMeal(
                            value,
                            "halfOne",
                            meal.data.extras["halfOne"].type
                          );
                        }}
                        type={meal.data.extras["halfOne"].type}
                        value={[...meal.data.extras["halfOne"].value]}
                        title={"halfOne"}
                        options={orderBy(storeDataStore.storeData.pizzaExtras, ["order"], ["asc"])}
                      />
                    </View>
                  )}
                  {selectedPizzaHalf == "halfTwo" && (
                    <View style={{ width: "100%" }}>
                      <GradiantRow
                        onChangeFn={(value) => {
                          updateMeal(
                            value,
                            "halfTwo",
                            meal.data.extras["halfTwo"].type
                          );
                        }}
                        type={meal.data.extras["halfTwo"].type}
                        value={[...meal.data.extras["halfTwo"].value]}
                        title={"halfTwo"}
                        options={orderBy(storeDataStore.storeData.pizzaExtras, ["order"], ["asc"])}
                      />
                    </View>
                  )}
                </View>
              )}

              {meal.data.extras["taste"] &&
                meal.data.extras["taste"].options && (
                  <View style={{ zIndex: 20 }}>
                    <View style={{ marginTop: 20, width: "100%" }}>
                      <GradiantRow
                        onChangeFn={(value) => {
                          // tasteScorll(value)
                          updateMeal(
                            value,
                            "taste",
                            meal.data.extras["taste"].type
                          );
                        }}
                        type={meal.data.extras["taste"].type}
                        value={meal.data.extras["taste"].value}
                        title={"taste"}
                        categoryId={meal.data.categoryId}
                        placeholder={
                          meal.data.categoryId == "5" ||
                          meal.data.categoryId == "6"
                            ? `${t("select-taste")}`
                            : t("select-taste-shmareem")
                        }
                        options={meal.data.extras["taste"].options}
                        onToggle={onSelectToggle}
                        dropDownDirection={"TOP"}
                        tasteList={
                          meal.data?.categoryId == "5" ||
                          meal.data?.categoryId == "6"
                            ? storeDataStore.storeData?.TASETS_LIST
                                .specialCackes
                            : initShmareemTastes(
                                storeDataStore.storeData?.TASETS_LIST.shmareem
                              )
                        }
                      />
                    </View>
                  </View>
                )}

              {meal.data.extras["onTop"] &&
                meal.data.extras["onTop"].options && (
                  <View style={{ zIndex: 20 }}>
                    <View style={{ marginTop: 20, width: "100%" }}>
                      <GradiantRow
                        onChangeFn={(value) => {
                          updateMeal(
                            value,
                            "onTop",
                            meal.data.extras["onTop"].type
                          );
                        }}
                        type={meal.data.extras["onTop"].type}
                        value={meal.data.extras["onTop"].value}
                        title={"onTop"}
                        categoryId={meal.data.categoryId}
                        options={meal.data.extras["onTop"].options}
                        tasteList={initShmareemTastes(
                          storeDataStore.storeData?.TASETS_LIST.mkhboze
                        )}
                        price={storeDataStore.storeData.mkhboze_ontop_price}
                      />
                    </View>
                  </View>
                )}

              {meal.data.isToNameAndAge && (
                <View
                  style={{
                    width: "100%",
                    alignItems: "center",
                    justifyContent: "center",
                    flexDirection: "column",
                    alignSelf: "center",
                  }}
                >
                  <View
                    style={{
                      marginTop: 20,
                    }}
                  >
                    <InputText
                      onChange={(e) => {
                        updateOthers(e, "toName", "others");
                      }}
                      value={meal.others["toName"]}
                      label={`${t("toName")}:`}
                      variant="default"
                      isFlex={true}
                    />
                  </View>
                  <View
                    style={{
                      marginTop: 20,
                    }}
                  >
                    <InputText
                      onChange={(e) => {
                        updateOthers(e, "toAge", "others");
                      }}
                      value={meal.others["toAge"]}
                      label={`${t("toAge")}:`}
                      variant="default"
                      isFlex={true}
                    />
                  </View>
                </View>
              )}

              {meal.data.subCategoryId == "6" && (
                <View style={{ marginTop: 25 }}>
                  <View style={{ flexDirection: "column", width: "100%" }}>
                    <Text
                      style={{
                        fontSize: 20,
                        marginBottom: 15,
                        textAlign: "center",
                      }}
                    >
                      ادخل مواصفات الكعكة
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
                        borderWidth: 1,
                        textAlignVertical: "top",
                        textAlign: "right",
                        padding: 10,
                        height: 80,
                        width: "100%",
                        // fontFamily: `${getCurrentLang()}-SemiBold`,
                      }}
                    />
                    {/* <Text>{meal.others["note"]}</Text> */}
                  </View>
                  {userDetailsStore.isAdmin() && (
                    <View
                      style={{
                        flexBasis: "49%",
                        marginTop: 15,
                        alignItems: "flex-start",
                      }}
                    >
                      <InputText
                        onChange={(e) => customCakeUpdateMealPrice(e)}
                        label={t("ادخل السعر")}
                        value={meal.data.price}
                      />
                    </View>
                  )}
                </View>
              )}

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
      <View style={styles.buttonContainer}>
        <View
          style={{
            width: "60%",
            alignSelf: "center",
            alignItems: "center",
            flexDirection: "row",
          }}
        >
          <Button
            text={isEdit ? t("save") : t("add-to-cart")}
            icon="shopping-bag-plus"
            fontSize={17}
            onClickFn={isEdit ? onUpdateCartProduct : onAddToCart}
            textColor={themeStyle.WHITE_COLOR}
            fontFamily={`${getCurrentLang()}-Bold`}
            borderRadious={19}
            disabled={!isValidMeal()}
          />
          <View style={{ marginLeft: 10 }}>
            <Text style={{ fontSize: 22 }} type="number">
              {" "}
              ₪{meal.data.price * meal.data.extras.counter.value}
            </Text>
          </View>
        </View>
      </View>
      {meal.data.subCategoryId == "1" && (
        <PickImagedDialog
          isOpen={isPickImageDialogOpen}
          handleAnswer={handlePickImageAnswer}
        />
      )}
      {meal.data.subCategoryId == "6" && (
        <AddCustomImagedDialog
          isOpen={isPickImageDialogOpen}
          handleAnswer={handlePickImageAnswer}
        />
      )}
      <PickImageNotificationDialog
        isOpen={isPickImageNotificationDialogOpen}
        handleAnswer={handlePickNotificationAnswer}
        text={pickImageNotificationDialogText}
      />
      <ConfirmActiondDialog
        handleAnswer={handleConfirmActionAnswer}
        isOpen={isOpenConfirmActiondDialog}
        text={confirmActiondDialogText}
        positiveText="ok"
      />
    </View>
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
   marginTop: Platform.OS === 'ios' ? 18 : 12,
   color: themeStyle.WHITE_COLOR,
   fontSize:15
 },
});
