import React, { useCallback, useMemo, useState } from "react";
import { StyleSheet, View, ScrollView, FlatList } from "react-native";
import { observer } from "mobx-react";
import { useContext } from "react";
import { StoreContext } from "../../../stores";
import themeStyle from "../../../styles/theme.style";
import Text from "../../../components/controls/Text";
import BigStoreProduct from "./product-item/big-sotre-product";
import Modal from "react-native-modal";
import MealModal from "../../../components/MealModal";
import * as Haptics from "expo-haptics";

// Memoized product item to prevent unnecessary re-renders
const MemoizedBigStoreProduct = React.memo(BigStoreProduct, (prevProps, nextProps) => {
  // Only re-render if the product data actually changed
  return prevProps.item._id === nextProps.item._id && 
         prevProps.item.name === nextProps.item.name &&
         prevProps.item.price === nextProps.item.price;
});

interface SubCategoriesListProps {
  generalCategories: any[];
  menuStore: any;
}

const SubCategoriesList: React.FC<SubCategoriesListProps> = observer(({ generalCategories, menuStore }) => {
  const { languageStore, cartStore } = useContext(StoreContext);
  
  // Modal state management
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [selectedProductIndex, setSelectedProductIndex] = useState(null);

  // Memoize the filtered categories data to avoid recalculating on every render
  const filteredCategoriesData = useMemo(() => {
    if (!generalCategories || !menuStore.categories) return [];
    
    return generalCategories.map(generalCategory => {
      const filteredCategory = menuStore.categories.find(category => 
        category.supportedGeneralCategoryIds && category.products.length > 0 &&
        category.supportedGeneralCategoryIds.some(id => 
          id === generalCategory?._id || id.$oid === generalCategory?._id
        )
      );
      
      if (!filteredCategory || !filteredCategory.products || filteredCategory.products.length === 0) {
        return null;
      }
      
      return {
        generalCategory,
        filteredCategory,
        categoryName: languageStore.selectedLang === "ar" ? filteredCategory.nameAR : filteredCategory.nameHE
      };
    }).filter(Boolean);
  }, [generalCategories, menuStore.categories, languageStore.selectedLang]);

  // Handle product selection
  const onItemSelect = useCallback((item, category) => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    
    // Check if product is already in cart
    const existingCartItem = cartStore.getProductByProductId(item._id);
    let productIndex = null;
    
    if (existingCartItem) {
      // Find the index of the product in the cart
      productIndex = cartStore.cartItems.findIndex(cartItem => 
        cartItem.data._id === item._id
      );
    }
    
    setSelectedProduct(item);
    setSelectedCategory(category);
    setSelectedProductIndex(productIndex);
    setIsModalOpen(true);
  }, [cartStore]);

  // Memoized product renderer for ScrollView
  const renderProductItem = useCallback((item: any, index: number) => (
    <View key={item._id || `product-${item.id || Math.random()}`} style={styles.productContainer}>
      <MemoizedBigStoreProduct 
        item={item} 
        onItemSelect={(item) => onItemSelect(item, filteredCategoriesData.find(data => 
          data.filteredCategory.products.some(product => product._id === item._id)
        )?.filteredCategory)} 
        onDeleteProduct={() => {}} 
        onEditProduct={() => {}} 
      />
    </View>
  ), [onItemSelect, filteredCategoriesData]);

  // Memoize the render function to prevent unnecessary re-renders
  const renderCategorySection = useCallback(
    (data: any, index: number) => {
      const { filteredCategory, categoryName } = data;
      
      return (
        <View key={`category-${index}`} style={styles.categorySection}>
          <Text style={styles.categoryTitle}>{categoryName}</Text>
          <ScrollView
            horizontal={true}
            style={styles.productsScrollView}
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.productsScrollViewContent}
          >
            {filteredCategory.products.slice(0, 10).map((item, productIndex) => 
              renderProductItem(item, productIndex)
            )}
          </ScrollView>
        </View>
      );
    },
    [renderProductItem]
  );

  // Early return if no data
  if (!filteredCategoriesData || filteredCategoriesData.length === 0) {
    return null;
  }

  return (
    <View style={styles.container}>
      {filteredCategoriesData.map((data, index) => 
        renderCategorySection(data, index)
      )}
      
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
          index={selectedProductIndex}
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
  categorySection: {
    padding: 10,
    marginBottom: 20,
  },
  categoryTitle: {
    fontSize: themeStyle.FONT_SIZE_MD,
    fontWeight: "bold",
    marginBottom: 10,
  },
  productsScrollView: {
    padding: 10,
  },
  productsScrollViewContent: {
    paddingRight: 10,
  },
  productContainer: {
    width: 150,
    marginRight: 10,
  },
  modal: {
    justifyContent: 'flex-end',
    margin: 0,
  },
});

export default React.memo(SubCategoriesList);
