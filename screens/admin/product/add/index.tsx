import { StyleSheet, View, TextInput, Image } from "react-native";
import InputText from "../../../../components/controls/input";
import Button from "../../../../components/controls/button/button";
import Text from "../../../../components/controls/Text";
import { observer } from "mobx-react";
import { useState, useEffect, useContext } from "react";
import { useTranslation } from "react-i18next";
import DropDown from "../../../../components/controls/dropdown";
import themeStyle from "../../../../styles/theme.style";
import { launchCamera, launchImageLibrary } from "react-native-image-picker";
import { StoreContext } from "../../../../stores";
import Icon from "../../../../components/icon";
import { TouchableOpacity, ScrollView } from "react-native-gesture-handler";
import { useNavigation } from "@react-navigation/native";
import { cdnUrl, ROLES, shmareemId } from "../../../../consts/shared";
import CheckBox from "../../../../components/controls/checkbox";
import BackButton from "../../../../components/back-button";
import { Divider } from "react-native-paper";

export type TProduct = {
  id?: string;
  categoryId: string;
  subCategoryId?: string;
  nameAR: string;
  nameHE: string;
  img: any;
  descriptionAR: string;
  descriptionHE: string;
  notInStoreDescriptionAR?: string;
  notInStoreDescriptionHE?: string;
  price: number;
  mediumPrice: number;
  largePrice: number;
  mediumCount: number;
  largeCount: number;
  isInStore: boolean;
  isSizes: boolean;
  isUploadImage: boolean;
  cakeLevels: number;
  activeTastes: string[];
  isToNameAndAge: boolean;
  isWeight?: boolean;
};

const cakeLevels = [
  {
    label: 1,
    value: 1,
  },
  {
    label: 2,
    value: 2,
  },
  {
    label: 3,
    value: 3,
  },
  {
    label: 4,
    value: 4,
  },
];

const AddProductScreen = ({ route }) => {
  const { t } = useTranslation();
  const navigation = useNavigation();
  const { categoryId, product } = route.params;

  const { menuStore, languageStore, userDetailsStore, storeDataStore } = useContext(StoreContext);

  const [isEditMode, setIdEditMode] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [categoryList, setCategoryList] = useState();
  const [birthdaySubCategories, setBirthdaySubCategories] = useState();
  const [selectedCategoryId, setSelectedCategoryId] = useState();
  const [selectedSubCategoryId, setSelectedSubCategoryId] = useState();
  const [selectedProduct, setSelectedProduct] = useState<TProduct>();
  const [image, setImage] = useState();

  const initNewProduct = () => {
    return {
      categoryId: "",
      nameAR: "",
      nameHE: "",
      img: null,
      descriptionAR: "",
      descriptionHE: "",
      price: 0,
      mediumPrice: 0,
      largePrice: selectedProduct?.categoryId == "5" ? 20 : 0,
      mediumCount: 0,
      largeCount: selectedProduct?.categoryId == "5" ? 10 : 0,
      isInStore: true,
      isToNameAndAge: false,
      isSizes: false,
      isUploadImage: false,
      subCategoryId: "",
      isWeight: true

    };
  };



  const isValidForm = () => {
    return (
      selectedProduct?.nameAR &&
      selectedProduct?.nameHE &&
      selectedProduct?.categoryId
      // selectedProduct?.descriptionAR &&
      // selectedProduct?.descriptionHE
    );
  };

  const isValidForm5 = () => {
    return (
      (selectedProduct?.nameAR &&
        selectedProduct?.nameHE &&
        selectedProduct?.categoryId &&
        image) ||
      (selectedProduct?.img &&
        selectedProduct?.descriptionAR &&
        selectedProduct?.descriptionHE &&
        selectedProduct?.mediumPrice !== undefined &&
        selectedProduct?.mediumCount !== undefined)
    );
  };

  useEffect(() => {
    if (product) {
      setIdEditMode(true);
      setSelectedCategoryId(Number(product.categoryId));
      setSelectedSubCategoryId(
        product.subCategoryId ? Number(product.subCategoryId) : null
      );
      let tmpProduct = {
        ...product,
        mediumPrice: product?.extras?.size?.options["medium"]?.price,
        mediumCount: product?.extras?.size?.options["medium"].count,
        largePrice: product?.extras?.size?.options["large"]?.price,
        largeCount: product?.extras?.size?.options["large"]?.count,
      };
      setSelectedProduct(tmpProduct);
    } else {
      setSelectedProduct(initNewProduct());
    }
  }, []);

  const onImageSelect = async () => {
    const result = await launchImageLibrary({
      mediaType: "photo",

    });
    setImage(result.assets[0]);
  };
  const onPriceChange = (value) => {};
  const onDescriptionChange = (value) => {};

  const handleInputChange = (value: any, name: string) => {
    setSelectedProduct({ ...selectedProduct, [name]: value });
  };

  const handlAddClick = () => {
    if (selectedProduct && (isEditMode || image || selectedProduct.categoryId == '8')) {
      setIsLoading(true);
      //uploadImage(imgFile).then((res) => {
      let updatedData: TProduct = null;
      if (image) {
        updatedData = { ...selectedProduct, img: image };
      } else {
        updatedData = { ...selectedProduct };
      }

      // if (updatedData.categoryId == "3") {
      //   updatedData = {
      //     ...updatedData,
      //     isUploadImage: true,
      //   };
      // }
      setSelectedProduct(updatedData);
      menuStore
        .addOrUpdateProduct(updatedData, isEditMode, image)
        .then((res: any) => {
          menuStore.getMenu();
          setIsLoading(false);
          navigateToMenu();
        });

      //});
    }
  };

  const navigateToMenu = () => {
    navigation.navigate("menuScreen");
  };

  const getMenu = () => {
    const categories = menuStore.categories;
    const mappedCategories = categories.map((category, index) => {
      if (categoryId && category.categoryId === categoryId) {
        setSelectedCategoryId(index);
      }
      return {
        label:
          languageStore.selectedLang === "ar"
            ? category.nameAR
            : category.nameHE,
        value: category.categoryId,
      };
    });
    setCategoryList(mappedCategories);
    initBirthdaySubCat();
  };

  const initBirthdaySubCat = () => {
    const birthdaySubCategories = [
      {
        label:
          languageStore.selectedLang === "ar"
            ? "كعكات حفل ميلاد"
            : "עוגות יום הולדת",
        value: 1,
      },
      {
        label:
          languageStore.selectedLang === "ar" ? "اولاد" : "עוגות בנים",
        value: 2,
      },
      {
        label:
          languageStore.selectedLang === "ar" ? "بنات" : "עוגות לבנות",
        value: 3,
      },
      {
        label:
          languageStore.selectedLang === "ar" ? "صبايا وشباب" : "עוגות למבוגרים",
        value: 4,
      },
      {
        label:
          languageStore.selectedLang === "ar" ? "مناسبات خاصة" : "אירועים מיוחדים",
        value: 5,
      },
      {
        label:
          languageStore.selectedLang === "ar" ? "تصميم خاص" : "עיצוב מיוחד",
        value: 6,
      },
    ];
    setBirthdaySubCategories(birthdaySubCategories);
  };

  const handleTasteActiveChange = (value, name) => {
    let tmpActiveTastes = [...selectedProduct.activeTastes] || [];
    if (value) {
      tmpActiveTastes.push(name);
    } else {
      tmpActiveTastes = tmpActiveTastes.filter((taste) => taste != name);
    }
    setSelectedProduct({
      ...selectedProduct,
      ["activeTastes"]: [...tmpActiveTastes],
    });
  };

  useEffect(() => {
    getMenu();
  }, []);
  if (!selectedProduct) {
    return;
  }

  return (
    <ScrollView style={styles.container}>
      <View style={{marginLeft:15,}}>
      <BackButton />

      </View>

      <View style={styles.inputsContainer}>
        <Text style={{  fontSize: 30, color: themeStyle.WHITE_COLOR }}>{t("add-product")}</Text>

        <View
          style={{
            flexDirection: "row",
            justifyContent: "space-around",
            width: "100%",
            marginTop: 30,
          }}
        >
          <View
            style={{
              flexBasis: "49%",
              marginTop: 15,
              alignItems: "flex-start",
            }}
          >
            <InputText
              onChange={(e) => handleInputChange(e, "nameAR")}
              label={t("name-ar")}
              value={selectedProduct?.nameAR}
              isPreviewMode={!userDetailsStore.isAdmin(ROLES.all)}
              color={themeStyle.WHITE_COLOR}
            />
            {!selectedProduct?.nameAR && (
              <Text style={{ color: themeStyle.ERROR_COLOR }}>
                {t("invalid-nameAR")}
              </Text>
            )}
          </View>
          <View
            style={{
              flexBasis: "49%",
              marginTop: 15,
              alignItems: "flex-start",
            }}
          >
            <InputText
              onChange={(e) => handleInputChange(e, "nameHE")}
              label={t("name-he")}
              value={selectedProduct?.nameHE}
              isPreviewMode={!userDetailsStore.isAdmin(ROLES.all)}
              color={themeStyle.WHITE_COLOR}

            />
            {!selectedProduct?.nameHE && (
              <Text style={{ color: themeStyle.ERROR_COLOR }}>
                {t("invalid-nameHE")}
              </Text>
            )}
          </View>
        </View>

        <View
          style={{
            width: "100%",
            marginTop: 40,
            alignItems: "center",
            flexDirection: "row",
          }}
        >
          <CheckBox
            onChange={(e) => handleInputChange(e, "isInStore")}
            value={selectedProduct?.isInStore}
          />
          <Text style={{ fontSize: 20, marginLeft: 10,color: themeStyle.WHITE_COLOR }}>
            {t("هل متوفر حاليا")}
          </Text>
        </View>

        {/* <Divider style={{width:"100%", height:10, marginTop:20, backgroundColor: themeStyle.PRIMARY_COLOR}}/> */}

        <View
          style={{
            width: "100%",
            marginTop: 40,
            alignItems: "flex-start",
            zIndex: 11,
          }}
        >
          {categoryList && (
            <View style={{ alignItems: "flex-start" }}>
              <Text style={{ fontSize: 16, marginBottom: 10, color: themeStyle.WHITE_COLOR }}>
                اختر القسم :
              </Text>
              <View style={{ zIndex: 11 }}>
                <DropDown
                  itemsList={categoryList}
                  defaultValue={selectedCategoryId}
                  onChangeFn={(e) => handleInputChange(e, "categoryId")}
                  placeholder={"اختر القسم"}
                  disabled={!userDetailsStore.isAdmin(ROLES.all)}
                />
              </View>

              {!selectedProduct?.categoryId && (
                <Text style={{ color: themeStyle.ERROR_COLOR }}>
                  {t("invalid-categoryId")}
                </Text>
              )}
            </View>
          )}
        </View>

        <View style={{ width: "100%", marginTop: 40 }}>
          {/* <View>
            <Text
              style={{
                textAlign: "center",
                fontSize: 20,
                textDecorationLine: "underline",
              }}
            >
              {t("medium-size")}
            </Text>
          </View> */}
          <View
            style={{
              flexDirection: "row",
              width: "100%",
              // justifyContent: "space-around",
            }}
          >
            <View
              style={{
                marginTop: 15,
                alignItems: "flex-start",
                flexBasis: "49%",
              }}
            >
              <InputText
                onChange={(e) => handleInputChange(e, "mediumPrice")}
                label={t("medium-price")}
                value={selectedProduct?.mediumPrice?.toString()}
                keyboardType="numeric"
                isPreviewMode={!userDetailsStore.isAdmin(ROLES.all)}
                color={themeStyle.WHITE_COLOR}
              />
              {selectedProduct?.mediumPrice == undefined && (
                <Text style={{ color: themeStyle.ERROR_COLOR }}>
                  {t("invalid-medium-price")}
                </Text>
              )}
            </View>
            {/* <View
              style={{
                marginTop: 15,
                alignItems: "flex-start",
                flexBasis: "49%",
              }}
            >
              <InputText
                onChange={(e) => handleInputChange(e, "mediumCount")}
                label={t("medium-count")}
                value={selectedProduct?.mediumCount?.toString()}
                keyboardType="numeric"
                isPreviewMode={!userDetailsStore.isAdmin(ROLES.all)}
              />
              {selectedProduct?.mediumCount == undefined && (
                <Text style={{ color: themeStyle.ERROR_COLOR }}>
                  {t("invalid-medium-count")}
                </Text>
              )}
            </View> */}
          </View>
        </View>

        <View style={{ marginTop: 60 }}>
          <Text
            style={{
              fontSize: 20,
              textAlign: "center",
              width: "100%",
              textDecorationLine: "underline",
              color: themeStyle.WHITE_COLOR
            }}
          >
            {t("product-description")}
          </Text>
        </View>

        <View
          style={{
            width: "100%",
            marginTop: 20,
            alignItems: "flex-start",
          }}
        >
          <Text style={{ fontSize: 16, marginBottom: 10, color: themeStyle.WHITE_COLOR }}>
            {t("insert-discription-ar")}
          </Text>
          <TextInput
            onChange={(e) => {
              handleInputChange(e.nativeEvent.text, "descriptionAR");
            }}
            editable={userDetailsStore.isAdmin(ROLES.all)}
            value={selectedProduct?.descriptionAR}
            placeholder={t("insert-discription-ar")}
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
              opacity: userDetailsStore.isAdmin(ROLES.all) ? 1 : 0.5
              // fontFamily: `${getCurrentLang()}-SemiBold`,
            }}
          />
          {!selectedProduct?.descriptionAR && (
            <Text style={{ color: themeStyle.ERROR_COLOR }}>
              {t("invalid-descriptionAR")}
            </Text>
          )}
        </View>

        <View
          style={{
            width: "100%",
            marginTop: 15,
            alignItems: "flex-start",
          }}
        >
          <Text style={{ fontSize: 16, marginBottom: 10, color: themeStyle.WHITE_COLOR }}>
            {t("insert-discription-he")}
          </Text>
          <TextInput
            onChange={(e) => {
              handleInputChange(e.nativeEvent.text, "descriptionHE");
            }}
            editable={userDetailsStore.isAdmin(ROLES.all)}
            value={selectedProduct?.descriptionHE}
            placeholder={t("insert-discription-he")}
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
              opacity: userDetailsStore.isAdmin(ROLES.all) ? 1 : 0.5
              // fontFamily: `${getCurrentLang()}-SemiBold`,
            }}
          />
          {!selectedProduct?.descriptionHE && (
            <Text style={{ color: themeStyle.ERROR_COLOR }}>
              {t("invalid-descriptionHE")}
            </Text>
          )}
        </View>

        {/* <View style={{ marginTop: 50 }}>
          <Text
            style={{
              fontSize: 20,
              textAlign: "center",
              width: "100%",
              textDecorationLine: "underline",
            }}
          >
            رسالة خاصه بحالة عدم توفر المنتج
          </Text>
        </View> */}

        {/* <View
          style={{
            width: "100%",
            marginTop: 20,
            alignItems: "flex-start",
          }}
        >
          <Text style={{ fontSize: 16, marginBottom: 10 }}>رسالة - عربي</Text>
          <TextInput
            onChange={(e) => {
              handleInputChange(e.nativeEvent.text, "notInStoreDescriptionAR");
            }}
            
            value={selectedProduct?.notInStoreDescriptionAR}
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
        </View> */}
        {/* <View
          style={{
            width: "100%",
            marginTop: 15,
            alignItems: "flex-start",
          }}
        >
          <Text style={{ fontSize: 16, marginBottom: 10 }}>رسالة - عبري</Text>
          <TextInput
            onChange={(e) => {
              handleInputChange(e.nativeEvent.text, "notInStoreDescriptionHE");
            }}
            value={selectedProduct?.notInStoreDescriptionHE}
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
        </View> */}
        <View style={{ marginTop: 40 }}>
          {image && (
            <View>
              <Image
                source={{
                  uri: image.uri,
                }}
                style={{ width: 300, height: 400 }}
              />

              <TouchableOpacity
                onPress={onImageSelect}
                style={{
                  marginTop: 10,
                  borderWidth: 1,
                  padding: 10,
                  backgroundColor: themeStyle.ORANGE_COLOR,
                }}
              >
                <Text
                  style={{
                    fontSize: 20,
                    textAlign: "center",
                    textDecorationLine: "underline",
                  }}
                >
                  {t("replace-image")}
                </Text>
              </TouchableOpacity>
            </View>
          )}

          {!image && isEditMode && product && product.img[0].uri && (
            <View>
              <Image
                source={{
                  uri: `${cdnUrl}${product.img[0].uri}`,
                }}
                style={{ width: 300, height: 400 }}
              />
              <View style={{                  opacity: userDetailsStore.isAdmin(ROLES.all) ? 1 : 0.5
}}>
              <TouchableOpacity
                onPress={onImageSelect}
                style={{
                  marginTop: 10,
                  borderWidth: 1,
                  padding: 10,
                  backgroundColor: themeStyle.ORANGE_COLOR,
                }}
                disabled={!userDetailsStore.isAdmin(ROLES.all)}
              >
                <Text
                  style={{
                    fontSize: 20,
                    textAlign: "center",
                    textDecorationLine: "underline",
                  }}
                >
                  {t("replace-image")}
                </Text>
              </TouchableOpacity>
              </View>
            </View>
          )}

          {!image && !isEditMode && (
            <TouchableOpacity
              onPress={onImageSelect}
              style={{
                backgroundColor: themeStyle.PRIMARY_COLOR,
                width: "100%",
                padding: 40,
                marginTop: 20,
              }}
            >
              <Icon icon="add_image" size={80} />
            </TouchableOpacity>
          )}
        </View>

        <View style={{ width: "100%", paddingHorizontal: 50, marginTop: 25 }}>
          <Button
            text={t("approve")}
            fontSize={20}
            onClickFn={handlAddClick}
            isLoading={isLoading}
            disabled={isLoading || !isValidForm()}
          />
        </View>
      </View>
    </ScrollView>
  );
};

export default observer(AddProductScreen);

const styles = StyleSheet.create({
  container: {
    width: "100%",
    height: "100%",
    marginBottom: 30,
  },
  inputsContainer: {
    marginTop: 0,
    width: "100%",
    height: "100%",
    alignItems: "center",
    paddingHorizontal: 15,
  },
  footerTabs: {
    backgroundColor: "blue",
    width: "100%",
    position: "absolute",
    bottom: 0,
  },
});
