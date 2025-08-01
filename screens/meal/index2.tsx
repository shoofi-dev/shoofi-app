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
  Keyboard,
} from "react-native";
import Modal from "react-native-modal";

import React, {
  useContext,
  useState,
  useEffect,
  useRef,
  useCallback,
  useMemo,
} from "react";
import ProductHeader from "./components/header/header";

import Text from "../../components/controls/Text";
import BirthdayImagesList from "../../components/birthday-images-list";
import { useNavigation } from "@react-navigation/native";
import { observer } from "mobx-react";
import { isEmpty } from "lodash";

import GradiantRow from "../../components/gradiant-row";
import Button from "../../components/controls/button/button";
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
} from "../../consts/shared";

import CustomFastImage from "../../components/custom-fast-image";
import PickImageNotificationDialog from "../../components/dialogs/pick-image-notification/pick-image-notification";
import OutOfStockDialog from "../../components/dialogs/out-of-stock/out-of-stock";
import ConfirmActiondDialog from "../../components/dialogs/confirm-action";
import InputText from "../../components/controls/input";
import AddCustomImagedDialog from "../../components/dialogs/add-custom-image";
import MealExtras from "./extras/Extras";
import { useResponsive } from "../../hooks/useResponsive";
import Counter from "../../components/controls/counter";
import StoreChangeConfirmationDialog from "../../components/dialogs/store-change-confirmation";
import GlassBG from "../../components/glass-background";

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

const MealScreen = ({
  handleClose,
  product,
  category,
  index,
  onFooterProps,
}) => {
  const { t } = useTranslation();
  const scrollRef = useRef(null);

  const navigation = useNavigation();
  let { cartStore, ordersStore, languageStore, storeDataStore, extrasStore } =
    useContext(StoreContext);
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
  const [isStoreChangeDialogOpen, setIsStoreChangeDialogOpen] = useState(false);
  const [pendingProduct, setPendingProduct] = useState(null);
  const [isValidForm, setIsValidForm] = useState(false);
  const scrollY = useRef(new Animated.Value(0)).current;
  const [isNoteModalVisible, setIsNoteModalVisible] = useState(false);
  const [noteValue, setNoteValue] = useState("");

  // Animated image height and opacity
  const IMAGE_MAX_HEIGHT = 180;
  const IMAGE_MIN_HEIGHT = 0;

  const imageHeight = scrollY.interpolate({
    inputRange: [0, 120],
    outputRange: [IMAGE_MAX_HEIGHT, IMAGE_MIN_HEIGHT],
    extrapolate: "clamp",
  });
  const imageOpacity = scrollY.interpolate({
    inputRange: [0, 120],
    outputRange: [1, 0],
    extrapolate: "clamp",
  });

  const { isTablet } = useResponsive();

  useEffect(() => {
    extrasStore.reset();

    let tmpProduct: any = {};
    if (product) {
      setIsEdit(false);
      tmpProduct.data = JSON.parse(JSON.stringify(product));
      tmpProduct.others = { qty: 1, note: "" };
      // Store the base price when first adding an item
      tmpProduct.data.basePrice = tmpProduct.data.price;

      // Initialize price based on initial weight if it's a weight-based product
      if (tmpProduct.data?.extras) {
        Object.keys(tmpProduct.data.extras).forEach((key) => {
          const extra = tmpProduct.data.extras[key];
          if (extra.categoryId === "weight" && extra.value) {
            const pricePerKg = tmpProduct.data.price;
            const weightInKg = extra.value;
            tmpProduct.data.price = pricePerKg * weightInKg;
            tmpProduct.data.basePrice = tmpProduct.data.price;
          }
        });
      }
    }
    if (index !== null && index !== undefined) {
      setIsEdit(true);
      tmpProduct = cartStore.getProductByIndex(index);
      // Calculate base price by subtracting extras price from total price
      if (tmpProduct.selectedExtras) {
        const extrasPrice = extrasStore.calculateExtrasPrice(
          tmpProduct.data.extras,
          tmpProduct.selectedExtras
        );
        tmpProduct.data.basePrice = tmpProduct.data.price - extrasPrice;
        extrasStore.reset();
        Object.entries(tmpProduct.selectedExtras).forEach(([key, value]) => {
          extrasStore.setSelection(key, value);
        });
      }
    }
    setMeal(tmpProduct);
    setNoteValue(tmpProduct?.others?.note || "");
    return () => {
      setMeal(null);
    };
  }, [index, product]);

  // Update meal price when extras change
  useEffect(() => {
    if (
      meal &&
      meal.data &&
      meal.data.price !== undefined &&
      meal.data.extras
    ) {
      const basePrice = meal.data.basePrice || meal.data.price;
      const extrasPrice = extrasStore.calculateExtrasPrice(meal.data.extras);
      setMeal((prev) => ({
        ...prev,
        data: {
          ...prev.data,
          price: basePrice + extrasPrice,
        },
      }));
    }
  }, [extrasStore?.selections]);

  const handleAddToCart = async () => {
    if (ordersStore.orderType == ORDER_TYPE.now && !meal.data.isInStore) {
      setConfirmActiondDialogText(
        getOutOfStockMessage() || "call-store-to-order"
      );
      setIsOpenConfirmActiondDialog(true);
      return;
    }

    const isDifferentStore = await cartStore.isDifferentStore();

    if (isDifferentStore) {
      setPendingProduct({
        ...meal,
        selectedExtras: { ...extrasStore.selections },
      });
      setIsStoreChangeDialogOpen(true);
      return;
    }
    addProductToCart();
  };

  const addProductToCart = () => {
    cartStore.addProductToCart({
      ...meal,
      selectedExtras: { ...extrasStore.selections },
    });
    handleClose();
  };

  const handleStoreChangeApprove = async () => {
    await cartStore.resetCartForNewStore();
    addProductToCart();
    setIsStoreChangeDialogOpen(false);
  };

  const handleStoreChangeCancel = () => {
    setIsStoreChangeDialogOpen(false);
    setPendingProduct(null);
  };

  const onUpdateCartProduct = () => {
    cartStore.updateCartProduct(index, {
      ...meal,
      selectedExtras: { ...extrasStore.selections },
    });
    handleClose();
  };

  const handleConfirmActionAnswer = (answer: string) => {
    setConfirmActiondDialogText("");
    setIsOpenConfirmActiondDialog(false);
  };

  const onClose = () => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    navigation.goBack();
  };

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

  const tasteScorll = () => {
    if (scrollRef.current) {
      scrollRef.current.scrollTo({
        y: 500,
        animated: true,
      });
    }
  };

  const updateOthers = (value, key, type) => {
    setMeal({ ...meal, [type]: { ...meal[type], [key]: value } });
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
          useNativeDriver: true,
        }),
        // shift element to the right by 2 units
        Animated.timing(anim.current, {
          toValue: 1.2,
          duration: 200,
          useNativeDriver: true,
        }),
        // bring the element back to its original position
        Animated.timing(anim.current, {
          toValue: 1,
          duration: 200,
          useNativeDriver: true,
        }),
      ]),
      // loops the above animation config 2 times
      { iterations: 2 }
    ).start();
  }, []);

  // Validation function for meal extras
  const validateMealExtras = () => {
    if (!meal?.data?.extras || meal.data.extras.length === 0) {
      return true;
    }
    const validationResult = extrasStore.validate(meal.data.extras);
    return validationResult;
  };

  // Get validation state - make it reactive to extras selections
  useEffect(() => {
    setIsValidForm(validateMealExtras());
  }, [meal?.data?.extras, extrasStore.selections]);

  // Pass footer props to parent component
  useEffect(() => {
    if (meal && onFooterProps) {
      onFooterProps({
        isEdit,
        isValidForm,
        onAddToCart: handleAddToCart,
        onUpdateCartProduct: onUpdateCartProduct,
        price: meal.data.price,
        qty: meal.others.qty,
      });
    }
  }, [meal?.data?.price, meal?.others?.qty, isEdit, isValidForm, meal?.others?.note]);

  if (!meal) {
    return null;
  }
  return (
    <View style={{ backgroundColor: themeStyle.WHITE_COLOR }}>
      <Animated.ScrollView
        ref={scrollRef}
        onScroll={Animated.event(
          [{ nativeEvent: { contentOffset: { y: scrollY } } }],
          { useNativeDriver: false }
        )}
        scrollEventThrottle={16}
        style={{}}
      >
        <View
          style={{
            width: "100%",
            paddingBottom: "25%",
          }}
        >
          <View style={{}}>
            <View style={{}}>
              <ProductHeader product={meal} updateOthers={updateOthers} />
            </View>

            {meal.data.extras && meal.data.extras.length > 0 && (
              <View style={{}}>
                <MealExtras extras={meal.data.extras} />
              </View>
            )}
          </View>
          <View
            style={{ marginTop: 20, paddingBottom: 20, paddingHorizontal: 10 }}
          >
            <TouchableOpacity
              style={{
                alignItems: "center",
                alignSelf: "center",

                flexDirection: "row",
                justifyContent: "space-between",
                width: "100%",
              }}
              onPress={() => {
                setNoteValue(meal?.others?.note || "");
                setIsNoteModalVisible(true);
              }}
            >
              <View style={{ flexDirection: "row", alignItems: "center" }}>
                <Icon icon="comment" size={20} style={{ marginRight: 10 }} />
                <Text>{t("note")}</Text>
              </View>
              <View style={{ flexDirection: "row", alignItems: "center" }}>
                <Icon icon="chevron" size={20} style={{}} />
              </View>
            </TouchableOpacity>
            <View style={{ marginTop: 10, marginLeft: 30, alignItems: "flex-start" }}>
              <Text>{meal.others.note}</Text>
            </View>
          </View>

          <View
            style={{
              alignItems: "center",
              alignSelf: "center",
              marginTop: 20,
              paddingBottom: 20,
            }}
          >
            <Counter
              value={meal.others.qty}
              minValue={1}
              onCounterChange={(value) => {
                updateOthers(value, "qty", "others");
              }}
              onDelete={() => {
                // Handle delete if needed
              }}
              variant={"gray"}
            />
          </View>
        </View>
      </Animated.ScrollView>

      <ConfirmActiondDialog
        handleAnswer={handleConfirmActionAnswer}
        isOpen={isOpenConfirmActiondDialog}
        text={confirmActiondDialogText}
        positiveText="ok"
      />

      <StoreChangeConfirmationDialog
        isOpen={isStoreChangeDialogOpen}
        onApprove={handleStoreChangeApprove}
        onCancel={handleStoreChangeCancel}
      />
      <Modal
        isVisible={isNoteModalVisible}
        onBackdropPress={() => setIsNoteModalVisible(false)}
        style={{ margin: 0, justifyContent: "flex-end", }}
        animationIn="slideInUp"
        animationOut="slideOutDown"
        backdropOpacity={0.5}
        propagateSwipe={true}
        avoidKeyboard={true}
      >
        <View
          style={{
            backgroundColor: "white",
            borderTopLeftRadius: 10,
            borderTopRightRadius: 10,
            padding: 20,
            width: "100%",
            paddingBottom:40,
          }}
        >
          <TextInput
            placeholder={t("insert-note")}
            value={meal?.others?.note}
            onChangeText={(text) => {
              setNoteValue(text);
              updateOthers(text, "note", "others");
            }}
            style={{
              borderWidth: 1,
              borderColor: "#eee",
              borderRadius: 8,
              padding: 10,
              minHeight: 80,
              marginBottom: 20,
              textAlign: "right",
              textAlignVertical: "top",
            }}
            multiline={false}
            returnKeyType="done"
            onSubmitEditing={() => {
              console.log("noteValue", noteValue)
              // updateOthers(noteValue, "note", "others");

              setIsNoteModalVisible(false);
              Keyboard.dismiss();
        
            }}
          />
        </View>
      </Modal>
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
