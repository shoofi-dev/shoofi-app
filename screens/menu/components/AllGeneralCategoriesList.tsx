import React, {
  forwardRef,
  useImperativeHandle,
  useRef,
  useCallback,
  useState,
  useMemo,
  useEffect,
} from "react";
import {
  StyleSheet,
  View,
  TouchableOpacity,
  Dimensions,
  ScrollView,
} from "react-native";
import { observer } from "mobx-react";
import { useContext } from "react";
import { StoreContext } from "../../../stores";
import themeStyle from "../../../styles/theme.style";
import { useNavigation } from "@react-navigation/native";
import ProductItem from "./product-item/index";
import * as Haptics from "expo-haptics";
import Modal from "react-native-modal";
import MealScreen from "../../meal/index2";
import GlassBG from "../../../components/glass-background";
import MealModal from "../../../components/MealModal";
import Text from "../../../components/controls/Text";
import { getCurrentLang } from "../../../translations/i18n";
import BigStoreProductItem from "./product-item/big-sotre-product";
const categoryHeaderHeight = 40;
const productHeight = 140;
const sectionMargin = 24;

interface AllGeneralCategoriesListProps {
  categoryList: any[];
  ListHeaderComponent?: React.ReactElement;
  productId?: string;
  categoryId?: string;
}

export interface AllGeneralCategoriesListRef {
  scrollToCategory: (categoryId: string) => void;
}

const screenHeight = Dimensions.get("window").height;

// Memoized ProductItem for better performance
const MemoizedProductItem = ProductItem;

// Memoized category section component
const CategorySection = ({
  category,
  languageStore,
  onItemSelect,
}: {
  category: any;
  languageStore: any;
  onItemSelect: (item: any, category: any) => void;
}) => {
  // Early return with a minimal view instead of null to maintain layout consistency
  if (!category.products || category.products.length === 0) {
    return (
      <View style={[styles.categorySection, { height: 1 }]}>
        {/* Empty view to maintain layout */}
      </View>
    );
  }

  const categoryName =
    languageStore.selectedLang === "ar" ? category.nameAR : category.nameHE;

  return (
    <View style={styles.categorySection}>
      {/* <View style={styles.categoryHeader}>
        <Text style={styles.categoryTitle}>{categoryName}</Text>
      </View> */}
      <View style={styles.productsContainer}>
        {category.products.map((product, index) => {
          // if (product.isHidden) {
          //   return null;
          // }
          return (
            <View key={product._id} style={styles.productWrapper}>
              <BigStoreProductItem  
                item={product}
                onItemSelect={(item) => onItemSelect(item, category)}
                onDeleteProduct={() => {}}
                onEditProduct={() => {}}
              />
            </View>
          );
        })}
      </View>
    </View>
  );
};

const AllGeneralCategoriesList = forwardRef<AllGeneralCategoriesListRef, AllGeneralCategoriesListProps>(({ categoryList, ListHeaderComponent, productId, categoryId }, ref) => {   
  const navigation = useNavigation<any>();
  const { languageStore } = useContext(StoreContext);
  const scrollViewRef = useRef<ScrollView>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState(null);

  // Filter out categories with no products
  const filteredCategoryList = useMemo(
    () => categoryList.filter((cat) => cat.products && cat.products.length > 0),
    [categoryList]
  );

  // Memoize category offsets calculation
  const categoryOffsets = useMemo(() => {
    const offsets: number[] = [];
    let currentOffset = 0;

    for (let i = 0; i < filteredCategoryList.length; i++) {
      offsets.push(currentOffset);
      const category = filteredCategoryList[i];
      if (category && category.products && category.products.length > 0) {
        const productsHeight = category.products.length * productHeight;
        currentOffset += categoryHeaderHeight + productsHeight + sectionMargin;
      } else {
        // Add minimal offset for empty categories to maintain layout consistency
        currentOffset += 1;
      }
    }

    return offsets;
  }, [filteredCategoryList]);

  // Calculate estimated heights for each category
  const getCategoryOffset = useCallback(
    (categoryIndex: number) => {
      return categoryOffsets[categoryIndex] || 0;
    },
    [categoryOffsets]
  );

  useImperativeHandle(
    ref,
    () => ({
      scrollToCategory: (categoryId: string) => {
        const categoryIndex = filteredCategoryList.findIndex(
          (cat) => cat._id === categoryId
        );
        if (categoryIndex !== -1) {

          // Calculate the offset for this category
          const offset = getCategoryOffset(categoryIndex);

          scrollViewRef.current?.scrollTo({
            y: offset,
            animated: true,
          });
        }
      },
    }),
    [filteredCategoryList, getCategoryOffset]
  );

  const onItemSelect = useCallback((item, category) => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    setSelectedProduct(item);
    setSelectedCategory(category);
    setIsModalOpen(true);
  }, []);

  useEffect(() => {
    if (productId && filteredCategoryList) {
      for (let i = 0; i < filteredCategoryList.length; i++) {
        const category = filteredCategoryList[i];
        if (category.products && category.products.length > 0) {
          for (let j = 0; j < category.products.length; j++) {
            if (category.products[j]._id === productId) {
              setTimeout(() => {
                setSelectedCategory(category);
                setSelectedProduct(category.products[j]);
                setIsModalOpen(true);
              }, 500);
              return;
            }
          }
        }
      }
    }
  }, [productId, filteredCategoryList]);

  const renderCategorySection = useCallback(
    (category: any) => {
      return (
        <CategorySection
          key={category._id}
          category={category}
          languageStore={languageStore}
          onItemSelect={onItemSelect}
        />
      );
    },
    [languageStore, onItemSelect]
  );

  const selectedCategoryA = useMemo(() => {
    return categoryList.find((cat) => cat._id === categoryId);
  }, [categoryList, categoryId]);

  console.log("========selectedCategoryA", selectedCategoryA);

  return (
    <View style={styles.container}>
      <ScrollView
        ref={scrollViewRef}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.listContainer}
        scrollEventThrottle={16}
      >
        {ListHeaderComponent}
        {
          renderCategorySection(selectedCategoryA)
        }
      </ScrollView>
      <Modal
        isVisible={isModalOpen}
        onBackdropPress={() => setIsModalOpen(false)}
        style={styles.modal}
        animationIn="slideInUp"
        animationOut="slideOutDown"
        backdropOpacity={0.5}
      >
        <MealModal
          product={selectedProduct}
          category={selectedCategory}
          onClose={() => setIsModalOpen(false)}
        />
      </Modal>
    </View>
  );
});

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  listContainer: {
    paddingBottom: 20,
  },
  categorySection: {
    marginBottom: 24,
  },
  categoryHeader: {
    paddingHorizontal: 16,
    height: 40,
    flexDirection: "row",

  },
  categoryTitle: {
    fontSize: themeStyle.FONT_SIZE_LG,
    fontWeight: "bold",
    color: themeStyle.GRAY_900,
    marginBottom: 4,
    fontFamily: `${getCurrentLang()}-Bold`,

  },
  categoryDescription: {
    fontSize: 14,
    color: themeStyle.GRAY_600,
  },
  productsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
paddingTop: 5,
    
  },
  productWrapper: {
    width: '48%',
    marginBottom: 25,
    
  },
  modalContainer: {
    maxHeight: screenHeight * 0.9,
    borderTopLeftRadius: 10,
    borderTopRightRadius: 10,
    overflow: "hidden",
    backgroundColor: "#fff",
  },
  modal: {
    justifyContent: "flex-end",
    margin: 0,
  },
  closeButton: {
    position: "absolute",
    top: 20,
    right: 20,
    zIndex: 1000,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(0, 0, 0, 0.7)",
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  closeButtonInner: {
    width: 24,
    height: 24,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
  },
  closeButtonText: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#fff",
  },
});

export default observer(AllGeneralCategoriesList);
