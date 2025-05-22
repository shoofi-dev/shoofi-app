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
import ProductHeader from "./components/header/header";
import ProductDescription from "./components/description/description";
import ProductFooter from "./components/footer/footer";

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
  } = useContext(StoreContext);
  const [meal, setMeal] = useState(null);
  const [clientImage, setClientImage] = useState();
  const [suggestedImage, setSuggestedImage] = useState();
  const [isEdit, setIsEdit] = useState(false);
  const [isSelectOpen, setIsSelectOpen] = useState(false);
  const [customCakeData, setCustomCakeData] = useState(null);
  const [isPickImageDialogOpen, setIsPickImageDialogOpen] = useState(false);
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
      tmpProduct.data = product;
      if (isEmpty(tmpProduct)) {
        tmpProduct.data = product;
      }
      tmpProduct.others = { count: 1, note: "" };
    }
    if (index !== null && index !== undefined) {
      setIsEdit(true);
      tmpProduct = cartStore.getProductByIndex(index);
    }
    DeviceEventEmitter.emit(`update-meal-uri`, {
      imgUrl: `${cdnUrl}${tmpProduct.data.img[0].uri}`,
      cacheKey: `${cdnUrl}${tmpProduct.data.img[0].uri}`.split(/[\\/]/).pop(),
    });
    if (
      tmpProduct.data.subCategoryId == "1" ||
      tmpProduct.data.categoryId == "8"
    ) {
      if (tmpProduct.data.subCategoryId == "1") {
        setPickImageNotificationDialogText(t("you-can-pick-image"));
      }
      if (tmpProduct.data.categoryId == "8") {
        setPickImageNotificationDialogText(t("you-can-add-image-custom-cake"));
      }
      setIsPickImageNotificationDialogOpen(true);
    }
    setMeal(tmpProduct);
    setTimeout(() => {
      tasteScorll();
    }, 1000);
  }, []);


  const onAddToCart = () => {
    if (
      (ordersStore.orderType == ORDER_TYPE.now && !meal.data.isInStore) ||
      (storeDataStore.storeData.isInStoreOrderLaterCats.indexOf(
        meal?.data?.categoryId
      ) > -1 &&
        !meal.data.isInStore)
    ) {
      setConfirmActiondDialogText(
        getOutOfStockMessage() || "call-store-to-order"
      );
      setIsOpenConfirmActiondDialog(true);
      return;
    }
    DeviceEventEmitter.emit(`add-to-cart-animate`, {
      imgUrl: `${cdnUrl}${meal.data.img[0].uri}`,
    });

    cartStore.addProductToCart(meal);
    setTimeout(() => {
      navigation.goBack();
    }, 1600);
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
      let imagePrice =
        meal.data.extras["image"] || meal.data.extras["suggestedImage"]
          ? 10
          : 0;
      if (ordersStore.editOrderData) {
        imagePrice =
          meal.data.extras["image"]?.value?.uri ||
          meal.data.extras["suggestedImage"]?.value
            ? 10
            : 0;
      }
      let finalPrice = sizePrice;
      if (meal.data?.categoryId != "8") {
        finalPrice = finalPrice + imagePrice;
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
    scrollRef.current?.scrollTo({
      y: 500,
      animated: true,
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

  if (!meal) {
    return null;
  }

  return (
    <View style={{ height: "100%" }}>
      {/* <ScrollView ref={scrollRef} style={{ height: "100%",borderWidth:1 }}> */}
      {/* <KeyboardAvoidingView
          keyboardVerticalOffset={100}
          behavior="position"
          style={{ height:"100%" }}
        > */}
      <View
        style={{
          height: "50%",
          marginHorizontal: 5,
          shadowColor: themeStyle.SHADOW_COLOR,
          shadowOffset: {
            width: 0,
            height: 2,
          },
          shadowOpacity: 0.9,
          shadowRadius: 6,
          elevation: 20,
          borderWidth: 0,
        }}
      >
        <View
          style={{
            height: "100%",
            width: "100%",
            alignSelf: "center",
          }}
        >
          <View
            style={{
              backgroundColor: "transparent",
            }}
          >
            <CustomFastImage
              style={{
                width: "100%",
                height: "100%",
              }}
              source={{ uri: `${cdnUrl}${meal.data.img[0].uri}` }}
              cacheKey={`${meal.data.img[0].uri.split(/[\\/]/).pop()}`}
            />
          </View>
        </View>
      </View>
      <View
        style={{
          width: "100%",
          height: "50%",
          borderTopLeftRadius: 20,
          borderTopRightRadius: 20,
          zIndex: 2,
          top: -30,
          backgroundColor: themeStyle.PRIMARY_COLOR,
          padding: 20,
          shadowColor: themeStyle.SHADOW_COLOR,
          shadowOffset: {
            width: 0,
            height: 2,
          },
          shadowOpacity: 0.9,
          shadowRadius: 6,
          elevation: 20,
          borderWidth: 0,
        }}
      >
        <View
          style={{
            height: "100%",
            flexDirection: "column",
          }}
        >
          <View>
            <ProductHeader product={meal.data} updateMeal={updateMeal}/>
          </View>
          <View style={{ marginTop: 15 }}>
            <ProductDescription product={meal.data} />
          </View>
          <View style={{ marginTop: 15, bottom: 0, position: "absolute" }}>
            <ProductFooter
              isEdit={isEdit}
              isValidForm={isValidMeal()}
              onAddToCart={onAddToCart}
              onUpdateCartProduct={onUpdateCartProduct}
              price={
                (getPriceBySize() || meal.data.price) 
              }
            />
          </View>
        </View>
      </View>
      {/* </KeyboardAvoidingView> */}
      {/* </ScrollView> */}
      {/* <View style={styles.buttonContainer}>
        <View
          style={{
            width: "60%",
            alignSelf: "center",
            alignItems: "center",
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
        </View>
      </View> */}
      {meal.data.subCategoryId == "1" && (
        <PickImagedDialog
          isOpen={isPickImageDialogOpen}
          handleAnswer={handlePickImageAnswer}
        />
      )}
      {meal.data.categoryId == "8" && (
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
    backgroundColor: themeStyle.PRIMARY_COLOR,
    marginTop: 25,
    shadowColor: "#F1F1F1",
    shadowOffset: {
      width: 0,
      height: 0,
    },
    shadowOpacity: 1,
    shadowRadius: 30,
    elevation: 0,
  },
  background: {
    position: "absolute",
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
    borderTopLeftRadius: 50,
    borderTopRightRadius: 50,

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
    color: themeStyle.PRIMARY_COLOR,
    padding: 8,
    textAlign: "center",
  },
});
