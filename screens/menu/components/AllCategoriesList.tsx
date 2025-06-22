import React, { forwardRef, useImperativeHandle, useRef, useCallback, useState } from "react";
import {
  StyleSheet,
  View,
  Text,
  FlatList,
  TouchableOpacity,
  Dimensions,
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

interface AllCategoriesListProps {
  categoryList: any[];
  ListHeaderComponent?: React.ReactElement;
}

export interface AllCategoriesListRef {
  scrollToCategory: (categoryId: string) => void;
}

const screenHeight = Dimensions.get('window').height;

const AllCategoriesList = forwardRef<AllCategoriesListRef, AllCategoriesListProps>(
  ({ categoryList, ListHeaderComponent }, ref) => {
    const navigation = useNavigation<any>();
    const { languageStore } = useContext(StoreContext);
    const flatListRef = useRef<FlatList>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedProduct, setSelectedProduct] = useState(null);
    const [selectedCategory, setSelectedCategory] = useState(null);
    
    // Calculate estimated heights for each category
    const getCategoryOffset = (categoryIndex: number) => {
      let offset = 0;
      for (let i = 0; i < categoryIndex; i++) {
        const category = categoryList[i];
        if (category && category.products && category.products.length > 0) {
          // Category header height + products height + margins
          const categoryHeaderHeight = 60; // header + padding
          const productHeight = 120; // estimated product height
          const productsHeight = category.products.length * productHeight;
          const sectionMargin = 24;
          offset += categoryHeaderHeight + productsHeight + sectionMargin;
        }
      }
      return offset;
    };

    useImperativeHandle(ref, () => ({
      scrollToCategory: (categoryId: string) => {
        const categoryIndex = categoryList.findIndex(cat => cat._id === categoryId);
        if (categoryIndex !== -1) {
          console.log("categoryIndex", categoryIndex);
          
          // Calculate the offset for this category
          const offset = getCategoryOffset(categoryIndex);
          console.log("scrollToOffset", offset);
          
          flatListRef.current?.scrollToOffset({
            offset: offset,
            animated: true,
          });
        }
      },
    }));

    const onItemSelect = (item, category) => {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      setSelectedProduct(item);
      setSelectedCategory(category);
      setIsModalOpen(true);
    };

    const renderCategorySection = ({ item: category }) => {
      if (!category.products || category.products.length === 0) {
        return null;
      }

      const categoryName = languageStore.selectedLang === "ar" 
        ? category.nameAR 
        : category.nameHE;

      return (
        <View style={styles.categorySection}>
          <View style={styles.categoryHeader}>
            <Text style={styles.categoryTitle}>{categoryName}</Text>
          </View>
          <View style={styles.productsContainer}>
            {category.products.map((product) => (
              <ProductItem
                key={product._id}
                item={product}
                onItemSelect={(item) => onItemSelect(item, category)}
                onDeleteProduct={() => {}}
                onEditProduct={() => {}}
              />
            ))}
          </View>
        </View>
      );
    };

    return (
      <View style={styles.container}>
        <FlatList
          ref={flatListRef}
          data={categoryList}
          keyExtractor={(item) => item._id}
          renderItem={renderCategorySection}
          ListHeaderComponent={ListHeaderComponent}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.listContainer}
          scrollEventThrottle={16}
        />
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
  }
);

// Wrapper component to adapt props for MealScreen
const MealModal = ({ product, category, onClose }) => {
  const route = {
    params: {
      product,
      category,
      index: null
    }
  };

  return (
    <View style={styles.modalContainer}>
      <GlassBG style={styles.closeButton}>

      <TouchableOpacity 
         
        onPress={onClose}
        activeOpacity={0.7}
      >
        <View style={styles.closeButtonInner}>
          <Text style={styles.closeButtonText}>✕</Text>
        </View>
      </TouchableOpacity>
      </GlassBG>
      <View style={{ height: "100%" }}> 
      <MealScreen route={route} />

      </View>
    </View>
  );
};

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
    paddingVertical: 12,
    marginBottom: 8,
  },
  categoryTitle: {
    fontSize: themeStyle.FONT_SIZE_XL,
    fontWeight: "bold",
    color: themeStyle.GRAY_900,
    textAlign: "left",
    marginBottom: 4,
  },
  categoryDescription: {
    fontSize: 14,
    color: themeStyle.GRAY_600,
    textAlign: "right",
  },
  productsContainer: {
    paddingHorizontal: 8,
  },
  modalContainer: {
    maxHeight: screenHeight * 0.9,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    overflow: 'hidden',
    backgroundColor: "#fff",
  },
  modal: {
    justifyContent: 'flex-end',
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

export default observer(AllCategoriesList); 