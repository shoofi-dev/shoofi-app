import { StyleSheet, View, TextInput, Image } from "react-native";
import InputText from "../../../../components/controls/input";
import Button from "../../../../components/controls/button/button";
import Text from "../../../../components/controls/Text";
import { observer } from "mobx-react";
import { useState, useEffect, useContext } from "react";
import { useTranslation } from "react-i18next";
import DropDown from "../../../../components/controls/dropdown";
import themeStyle from "../../../../styles/theme.style";
import { launchImageLibrary } from "react-native-image-picker";
import { StoreContext } from "../../../../stores";
import Icon from "../../../../components/icon";
import { TouchableOpacity, ScrollView } from "react-native-gesture-handler";
import { useNavigation } from "@react-navigation/native";
import { cdnUrl, ROLES } from "../../../../consts/shared";
import CheckBox from "../../../../components/controls/checkbox";
import BackButton from "../../../../components/back-button";

export type TProduct = {
  id?: string;
  categoryId: string;
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
  isWeight?: boolean;
  isHidden?: boolean;
  extras?: any;
  others?: any;
  hasDiscount?: boolean;
  discountQuantity?: string;
  discountPrice?: string;
};

const AddProductScreen = ({ route }) => {
  const { t } = useTranslation();
  const navigation = useNavigation();
  const { categoryId, product } = route.params;

  const { menuStore, languageStore, userDetailsStore, storeDataStore } =
    useContext(StoreContext);

  const [isEditMode, setIdEditMode] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [categoryList, setCategoryList] = useState();
  const [selectedCategoryId, setSelectedCategoryId] = useState();
  const [selectedProduct, setSelectedProduct] = useState<TProduct>();
  const [image, setImage] = useState();
  const [extrasList, setExtrasList] = useState([]);
  const [selectedExtras, setSelectedExtras] = useState<string[]>([]);

  const initNewProduct = (defaultExtrasData, editProductData) => {
    let defaultProductData = {
      categoryId: "",
      nameAR: "",
      nameHE: "",
      img: null,
      descriptionAR: "",
      descriptionHE: "",
      notInStoreDescriptionAR: "",
      notInStoreDescriptionHE: "",
      price: 0,
      mediumPrice: 0,
      largePrice: 0,
      mediumCount: 0,
      largeCount: 0,
      isInStore: true,
      isWeight: true,
      isHidden: false,
      extras: defaultExtrasData,
      others: {
        qty: 1,
      },
      hasDiscount: false,
      discountQuantity: "",
      discountPrice: "",
    };
    if (editProductData) {
      defaultProductData = {
        ...defaultProductData,
        ...editProductData,
      };
    }
    return {
      ...defaultProductData,
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
      let tmpProduct = {
        ...product,
      };
      if (product.extras) {
        setSelectedExtras(Object.keys(product.extras));
      }
      setSelectedProduct(tmpProduct);
    } else {
      //setSelectedProduct(initNewProduct());
    }
  }, []);

  const getExtrasLit = async () => {
    const extrasListRes: any = await menuStore.getExrasList();

    setExtrasList(extrasListRes);
    // const extrasData = extrasListRes.map((extra)=>{
    //   if(extra.isActive){
    //     return {
    //       [extra.name]: {
    //         ...extra
    //       }
    //     }
    //   }
    // })

    const extrasDataFiltered = extrasListRes.filter((extra) => extra.isActive);
    const extrasData = {};
    extrasDataFiltered.forEach((extra) => {
      extrasData[extra.name] = {
        ...extra,
      };
    });
    let tmpProduct = null;
    if (product) {
      tmpProduct = { ...product };
    }
    setSelectedProduct(initNewProduct(extrasData, tmpProduct));
  };
  useEffect(() => {
    getExtrasLit();
  }, []);

  const updateExtraField = (extraName, field, value) => {
    // Allow decimal input by validating the string format
    const isValidNumber = /^\d*\.?\d*$/.test(value);
    if (!isValidNumber && value !== "") {
      return;
    }

    setSelectedProduct((prev) => ({
      ...prev,
      extras: {
        ...prev.extras,
        [extraName]: {
          ...prev.extras?.[extraName],
          [field]: value === "" ? "" : value,
        },
      },
    }));

    if (field === "value") {
      setSelectedProduct((prev) => ({
        ...prev,
        extras: {
          ...prev.extras,
          [extraName]: {
            ...prev.extras?.[extraName],
            ["defaultValue"]: value === "" ? "" : value,
          },
        },
      }));
    }
  };

  const toggleExtraSelection = (extraName: string) => {
    setSelectedExtras((prev) => {
      const isSelected = prev.includes(extraName);

      // Update selectedExtras list
      const updatedSelectedExtras = isSelected
        ? prev.filter((name) => name !== extraName)
        : [...prev, extraName];

      // Update selectedProduct.extras
      setSelectedProduct((old) => {
        const newExtras = { ...old.extras };

        if (isSelected) {
          // If unselected, REMOVE the extra completely
          delete newExtras[extraName];
        } else {
          // If selected, ADD it with the product's price
          const extraFromList = extrasList.find(
            (extra) => extra.name === extraName
          );
          if (extraFromList) {
            newExtras[extraName] = {
              ...extraFromList,
              isActive: true,
              price: old.price?.toString() || "0", // Set the extra's price to match the product's price
            };
          }
        }

        return {
          ...old,
          extras: newExtras,
        };
      });

      return updatedSelectedExtras;
    });
  };

  const onImageSelect = async () => {
    const result = await launchImageLibrary({
      mediaType: "photo",
    });
    setImage(result.assets[0]);
  };

  const handleInputChange = (value: any, name: string) => {
    setSelectedProduct({ ...selectedProduct, [name]: value });
  };

  const handlAddClick = () => {
    if (
      selectedProduct &&
      (isEditMode || image || selectedProduct.categoryId == "8")
    ) {
      // Convert string values to numbers before sending to API
      const processedProduct = {
        ...selectedProduct,
        // Convert discount fields to numbers if discount is enabled
        discountQuantity: selectedProduct.hasDiscount ? parseFloat(selectedProduct.discountQuantity) || 0 : 0,
        discountPrice: selectedProduct.hasDiscount ? parseFloat(selectedProduct.discountPrice) || 0 : 0,
        extras: Object.keys(selectedProduct.extras || {}).reduce(
          (acc, extraName) => {
            const extra = selectedProduct.extras[extraName];
            acc[extraName] = {
              ...extra,
              price: parseFloat(extra.price) || 0,
              value: parseFloat(extra.value) || 0,
              stepValue: parseFloat(extra.stepValue) || 0,
              minValue: parseFloat(extra.minValue) || 0,
              maxValue: parseFloat(extra.maxValue) || 0,
              defaultValue: parseFloat(extra.defaultValue) || 0,
            };
            return acc;
          },
          {}
        ),
      };

      setIsLoading(true);
      let updatedData = image
        ? { ...processedProduct, img: image }
        : processedProduct;
      setSelectedProduct(updatedData);
      menuStore
        .addOrUpdateProduct(updatedData, isEditMode, image)
        .then((res: any) => {
          menuStore.getMenu();
          setIsLoading(false);
          navigateToMenu();
        });
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
  };

  useEffect(() => {
    getMenu();
  }, []);

  const chunkArray = (array: string[], size: number): string[][] => {
    const result: string[][] = [];
    for (let i = 0; i < array.length; i += size) {
      result.push(array.slice(i, i + size));
    }
    return result;
  };

  if (!selectedProduct) {
    return;
  }

  return (
    <ScrollView style={styles.container}>
      <View
        style={{
          right: 15,
          position: "absolute",
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
        <BackButton />
      </View>

      <View style={styles.inputsContainer}>
        <Text style={{ fontSize: 30, color: themeStyle.WHITE_COLOR }}>
          {t("add-product")}
        </Text>

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
          <Text
            style={{
              fontSize: 20,
              marginLeft: 10,
              color: themeStyle.WHITE_COLOR,
            }}
          >
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
              <Text
                style={{
                  fontSize: 16,
                  marginBottom: 10,
                  color: themeStyle.WHITE_COLOR,
                }}
              >
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
                onChange={(e) => handleInputChange(e, "price")}
                label={t("medium-price")}
                value={selectedProduct?.price?.toString()}
                keyboardType="numeric"
                isPreviewMode={!userDetailsStore.isAdmin(ROLES.all)}
                color={themeStyle.WHITE_COLOR}
              />
              {selectedProduct?.price == undefined && (
                <Text style={{ color: themeStyle.ERROR_COLOR }}>
                  {t("invalid-medium-price")}
                </Text>
              )}
            </View>
          </View>

          {/* Add Discount Section */}
          <View style={{ width: "100%", marginTop: 40 }}>
            <View style={{ flexDirection: "row", alignItems: "center", marginBottom: 15 }}>
              <CheckBox
                onChange={(e) => handleInputChange(e, "hasDiscount")}
                value={selectedProduct?.hasDiscount}
              />
              <View style={{marginLeft: 10}}>
              <Text style={{ fontSize: 16,  color: themeStyle.WHITE_COLOR }}>
                {t("enable_bulk_discount")}
              </Text></View>
            </View>

            {selectedProduct?.hasDiscount && (
              <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
                <View style={{ flexBasis: "48%" }}>
                  <InputText
                    onChange={(e) => handleInputChange(e, "discountQuantity")}
                    label={t("discount_quantity_kg")}
                    value={selectedProduct?.discountQuantity?.toString()}
                    keyboardType="decimal-pad"
                    isPreviewMode={!userDetailsStore.isAdmin(ROLES.all)}
                    color={themeStyle.WHITE_COLOR}
                  />
                </View>
                <View style={{ flexBasis: "48%" }}>
                  <InputText
                    onChange={(e) => handleInputChange(e, "discountPrice")}
                    label={t("discount_total_price")}
                    value={selectedProduct?.discountPrice?.toString()}
                    keyboardType="decimal-pad"
                    isPreviewMode={!userDetailsStore.isAdmin(ROLES.all)}
                    color={themeStyle.WHITE_COLOR}
                  />
                </View>
              </View>
            )}
          </View>
          {/* End Discount Section */}

          <View
            style={{
              width: "100%",
              marginTop: 40,
              alignItems: "flex-start",
            }}
          >
            <View>
              <Text
                style={{
                  fontSize: 20,
                  marginBottom: 10,
                  color: themeStyle.WHITE_COLOR,
                }}
              >
                قائمة الاضافات:
              </Text>
            </View>
            <View>
              {extrasList?.map((extra) => {
                const extraData = selectedProduct?.extras?.[extra.name] || {};
                const isSelected = selectedExtras.includes(extra.name);

                return (
                  <View key={extra._id} style={{ marginBottom: 20 }}>
                    <TouchableOpacity
                      style={{
                        flexDirection: "row",
                        alignItems: "center",
                        marginBottom: 10,
                      }}
                      onPress={() => toggleExtraSelection(extra.name)}
                    >
                      <View
                        style={{
                          height: 20,
                          width: 20,
                          borderRadius: 4,
                          borderWidth: 2,
                          borderColor: themeStyle.WHITE_COLOR,
                          alignItems: "center",
                          justifyContent: "center",
                          marginRight: 10,
                        }}
                      >
                        {isSelected && (
                          <View
                            style={{
                              height: 12,
                              width: 12,
                              borderRadius: 2,
                              backgroundColor: themeStyle.WHITE_COLOR,
                            }}
                          />
                        )}
                      </View>
                      <Text
                        style={{ color: themeStyle.WHITE_COLOR, fontSize: 18 }}
                      >
                        {t(extra.name)}
                      </Text>
                    </TouchableOpacity>
                    {isSelected && (
                      <View style={{ paddingHorizontal: 10 }}>
                        {chunkArray(
                          [
                            "price",
                            "value",
                            "minValue",
                            "maxValue",
                            "stepValue",
                          ].filter((field) => extra[field] !== undefined),
                          2 // now it's 2 in a row
                        ).map((row, rowIndex) => (
                          <View
                            key={rowIndex}
                            style={{
                              flexDirection: "row",
                              justifyContent: "space-between",
                              width: "100%",
                              marginBottom: 20,
                            }}
                          >
                            {row.map((field) => (
                              <View
                                key={field}
                                style={{
                                  flexBasis: "49%", // 🔥 important: ~half the row, with margin between
                                }}
                              >
                                <InputText
                                  label={t(field)}
                                  value={extraData?.[field]?.toString() || ""}
                                  onChange={(val) =>
                                    updateExtraField(extra.name, field, val)
                                  }
                                  keyboardType="decimal-pad"
                                  color={themeStyle.WHITE_COLOR}
                                />
                              </View>
                            ))}
                          </View>
                        ))}
                      </View>
                    )}
                  </View>
                );
              })}
            </View>
          </View>
        </View>

        <View style={{ marginTop: 60 }}>
          <Text
            style={{
              fontSize: 20,
              textAlign: "center",
              width: "100%",
              textDecorationLine: "underline",
              color: themeStyle.WHITE_COLOR,
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
          <Text
            style={{
              fontSize: 16,
              marginBottom: 10,
              color: themeStyle.WHITE_COLOR,
            }}
          >
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
              opacity: userDetailsStore.isAdmin(ROLES.all) ? 1 : 0.5,
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
          <Text
            style={{
              fontSize: 16,
              marginBottom: 10,
              color: themeStyle.WHITE_COLOR,
            }}
          >
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
              opacity: userDetailsStore.isAdmin(ROLES.all) ? 1 : 0.5,
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
                resizeMode="contain"
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
                resizeMode="contain"
              />
              <View
                style={{
                  opacity: userDetailsStore.isAdmin(ROLES.all) ? 1 : 0.5,
                }}
              >
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
    marginTop: 50,
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
