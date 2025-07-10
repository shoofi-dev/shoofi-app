import React, { useState, useEffect, useContext } from 'react';
import { View, Text, StyleSheet, Alert, ActivityIndicator, ScrollView } from 'react-native';
import { useTranslation } from 'react-i18next';
import { StoreContext } from '../../../stores';
import DraggableFlatList, { RenderItemParams, ScaleDecorator } from 'react-native-draggable-flatlist';
import CustomFastImage from '../../../components/custom-fast-image';
import Button from '../../../components/controls/button/button';
import TextInput from '../../../components/controls/input';
import { cdnUrl } from '../../../consts/shared';
import themeStyle from '../../../styles/theme.style';
import { observer } from 'mobx-react';

interface Product {
  _id: string;
  nameAR: string;
  nameHE: string;
  img: Array<{ uri: string }>;
  order: number;
  categoryOrders?: { [categoryId: string]: number };
  isInStore: boolean;
  supportedCategoryIds: string[];
  price?: number;
  descriptionAR?: string;
  descriptionHE?: string;
  displayOrder?: number;
  categoryOrder?: number;
}

interface Category {
  _id: string;
  nameAR: string;
  nameHE: string;
  products: Product[];
}

const ProductOrderManager = observer(({ route }) => {
  const { t } = useTranslation();
  const { menuStore, languageStore } = useContext(StoreContext);
  
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    loadCategories();
  }, []);

  useEffect(() => {
    if (selectedCategory) {
      loadProductsForCategory();
    }
  }, [selectedCategory]);

  const loadCategories = async () => {
    try {
      setIsLoading(true);
      await menuStore.getMenu();
      const menuCategories = menuStore.categories || [];
      setCategories(menuCategories);
      
      // Set first category as default
      if (menuCategories.length > 0 && !selectedCategory) {
        setSelectedCategory(menuCategories[0]);
      }
    } catch (error) {
      console.error('Error loading categories:', error);
      Alert.alert('שגיאה', 'שגיאה בטעינת הקטגוריות');
    } finally {
      setIsLoading(false);
    }
  };

  const loadProductsForCategory = () => {
    if (!selectedCategory) return;
    
    const categoryProducts = selectedCategory.products || [];
    setProducts(categoryProducts);
  };

  const handleCategorySelect = (category: Category) => {
    setSelectedCategory(category);
    setSearchQuery('');
  };

  const handleDragEnd = ({ data }: { data: Product[] }) => {
    setProducts(data);
  };

  const handleSaveOrder = async () => {
    if (!selectedCategory) return;

    try {
      setIsSaving(true);
      
      await menuStore.updateProductsOrder({
        productsList: products,
        categoryId: selectedCategory._id,
        subCategoryId: null
      });

      await menuStore.getMenu();
      Alert.alert('הצלחה', 'סדר המוצרים נשמר בהצלחה');
    } catch (error) {
      console.error('Error saving product order:', error);
      Alert.alert('שגיאה', 'שגיאה בשמירת סדר המוצרים');
    } finally {
      setIsSaving(false);
    }
  };

  const handleResetOrder = async () => {
    if (!selectedCategory) return;

    Alert.alert(
      'אפס סדר מוצרים',
      'האם אתה בטוח שברצונך לאפס את סדר המוצרים?',
      [
        { text: 'ביטול', style: 'cancel' },
        {
          text: 'אפס',
          style: 'destructive',
          onPress: async () => {
            try {
              setIsSaving(true);
              
              // Sort products by creation date (assuming they have createdAt field)
              const sortedProducts = [...products].sort((a, b) => {
                // If no createdAt, sort by name
                return a.nameAR.localeCompare(b.nameAR);
              });
              
              setProducts(sortedProducts);
              
              await menuStore.updateProductsOrder({
                productsList: sortedProducts,
                categoryId: selectedCategory._id,
                subCategoryId: null
              });

              await menuStore.getMenu();
              Alert.alert('הצלחה', 'סדר המוצרים אופס בהצלחה');
            } catch (error) {
              console.error('Error resetting product order:', error);
              Alert.alert('שגיאה', 'שגיאה באיפוס סדר המוצרים');
            } finally {
              setIsSaving(false);
            }
          }
        }
      ]
    );
  };

  const filteredProducts = products.filter(product => {
    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();
    return (
      product.nameAR.toLowerCase().includes(query) ||
      product.nameHE.toLowerCase().includes(query) ||
      (product.descriptionAR && product.descriptionAR.toLowerCase().includes(query)) ||
      (product.descriptionHE && product.descriptionHE.toLowerCase().includes(query))
    );
  });

  const renderProduct = ({ item, drag, isActive }: RenderItemParams<Product>) => {
    return (
      <ScaleDecorator>
        <View
          style={[
            styles.productItem,
            isActive && styles.productItemActive,
            item.isInStore ? styles.productInStore : styles.productNotInStore
          ]}
        >
          {/* Order Number */}
          <View style={styles.orderNumber}>
            <Text style={styles.orderText}>{products.indexOf(item) + 1}</Text>
          </View>

          {/* Product Image */}
          <View style={styles.imageContainer}>
            <CustomFastImage
              style={styles.productImage}
              source={{ uri: `${cdnUrl}${item.img?.[0]?.uri}` }}
              cacheKey={`${item.img?.[0]?.uri?.split(/[\\/]/).pop()}`}
              resizeMode="cover"
            />
          </View>

          {/* Product Info */}
          <View style={styles.productInfo}>
            <Text style={styles.productName}>
              {languageStore.selectedLang === 'ar' ? item.nameAR : item.nameHE}
            </Text>
            <Text style={styles.productDescription}>
              {languageStore.selectedLang === 'ar' ? item.descriptionAR : item.descriptionHE}
            </Text>
            {item.price && (
              <Text style={styles.productPrice}>
                ₪{item.price.toFixed(2)}
              </Text>
            )}
            <View style={styles.statusContainer}>
              <View style={[
                styles.statusIndicator,
                item.isInStore ? styles.statusInStore : styles.statusNotInStore
              ]} />
              <Text style={styles.statusText}>
                {item.isInStore ? 'בחנות' : 'לא בחנות'}
              </Text>
            </View>
          </View>

          {/* Drag Handle */}
          <View style={styles.dragHandle}>
            <Text style={styles.dragIcon}>⋮⋮</Text>
          </View>
        </View>
      </ScaleDecorator>
    );
  };

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={themeStyle.PRIMARY_COLOR} />
        <Text style={styles.loadingText}>טוען...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>{t('ניהול סדר מוצרים')}</Text>
      </View>

      {/* Category Selection */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.categoryScroll}>
        {categories.map((category) => (
          <Button
            key={category._id}
            onClickFn={() => handleCategorySelect(category)}
            text={languageStore.selectedLang === 'ar' ? category.nameAR : category.nameHE}
            textColor={themeStyle.WHITE_COLOR}
            fontSize={16}
            style={[
              styles.categoryButton,
              selectedCategory?._id === category._id && styles.categoryButtonActive
            ]}
          />
        ))}
      </ScrollView>

      {/* Search */}
      {selectedCategory && (
        <View style={styles.searchContainer}>
          <TextInput
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholder={t('חפש מוצרים...')}
            style={styles.searchInput}
          />
        </View>
      )}

      {/* Products List */}
      {selectedCategory && (
        <View style={styles.productsContainer}>
          <View style={styles.productsHeader}>
            <Text style={styles.productsTitle}>
              {t('מוצרים בקטגוריה')}: {languageStore.selectedLang === 'ar' ? selectedCategory.nameAR : selectedCategory.nameHE}
            </Text>
            <Text style={styles.productsCount}>
              {filteredProducts.length} {t('מוצרים')}
            </Text>
          </View>

          {filteredProducts.length === 0 ? (
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>{t('אין מוצרים בקטגוריה זו')}</Text>
            </View>
          ) : (
            <DraggableFlatList
              data={filteredProducts}
              onDragEnd={handleDragEnd}
              keyExtractor={(item) => item._id}
              renderItem={renderProduct}
              contentContainerStyle={styles.productsList}
            />
          )}
        </View>
      )}

      {/* Action Buttons */}
      {selectedCategory && filteredProducts.length > 0 && (
        <View style={styles.actionButtons}>
          <Button
            onClickFn={handleResetOrder}
            text={t('אפס סדר')}
            textColor={themeStyle.WHITE_COLOR}
            fontSize={16}
            style={[styles.actionButton, styles.resetButton]}
            disabled={isSaving}
          />
          <Button
            onClickFn={handleSaveOrder}
            text={t('שמור סדר')}
            textColor={themeStyle.WHITE_COLOR}
            fontSize={16}
            style={[styles.actionButton, styles.saveButton]}
            disabled={isSaving}
          />
        </View>
      )}

      {/* Instructions */}
      {selectedCategory && (
        <View style={styles.instructionsContainer}>
          <Text style={styles.instructionsTitle}>{t('הוראות שימוש')}:</Text>
          <Text style={styles.instructionText}>• {t('גרור מוצרים כדי לשנות את הסדר שלהם')}</Text>
          <Text style={styles.instructionText}>• {t('לחץ על שמור כדי לשמור את השינויים')}</Text>
          <Text style={styles.instructionText}>• {t('לחץ על אפס סדר כדי לחזור לסדר המקורי')}</Text>
          <Text style={styles.instructionText}>• {t('מוצרים ירוקים זמינים בחנות, אדומים לא זמינים')}</Text>
        </View>
      )}
    </View>
  );
});

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: themeStyle.BACKGROUND_COLOR,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: themeStyle.TEXT_PRIMARY_COLOR,
  },
  header: {
    padding: 20,
    backgroundColor: themeStyle.PRIMARY_COLOR,
    alignItems: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: themeStyle.WHITE_COLOR,
  },
  categoryScroll: {
    paddingHorizontal: 10,
    paddingVertical: 10,
  },
  categoryButton: {
    marginHorizontal: 5,
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: themeStyle.SECONDARY_COLOR,
  },
  categoryButtonActive: {
    backgroundColor: themeStyle.SUCCESS_COLOR,
  },
  searchContainer: {
    padding: 15,
  },
  searchInput: {
    backgroundColor: themeStyle.WHITE_COLOR,
    borderRadius: 10,
    paddingHorizontal: 15,
    paddingVertical: 10,
    fontSize: 16,
  },
  productsContainer: {
    flex: 1,
    padding: 15,
  },
  productsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  productsTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: themeStyle.TEXT_PRIMARY_COLOR,
  },
  productsCount: {
    fontSize: 14,
    color: themeStyle.TEXT_SECONDARY_COLOR,
  },
  productsList: {
    paddingBottom: 100,
  },
  productItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: themeStyle.WHITE_COLOR,
    marginVertical: 5,
    padding: 15,
    borderRadius: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  productItemActive: {
    transform: [{ scale: 1.05 }],
    shadowOpacity: 0.3,
  },
  productInStore: {
    borderLeftWidth: 4,
    borderLeftColor: themeStyle.SUCCESS_COLOR,
  },
  productNotInStore: {
    borderLeftWidth: 4,
    borderLeftColor: themeStyle.ERROR_COLOR,
  },
  orderNumber: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: themeStyle.PRIMARY_COLOR,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
  },
  orderText: {
    color: themeStyle.WHITE_COLOR,
    fontWeight: 'bold',
    fontSize: 14,
  },
  imageContainer: {
    width: 60,
    height: 60,
    marginRight: 15,
  },
  productImage: {
    width: '100%',
    height: '100%',
    borderRadius: 8,
  },
  productInfo: {
    flex: 1,
    marginRight: 15,
  },
  productName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: themeStyle.TEXT_PRIMARY_COLOR,
    marginBottom: 4,
  },
  productDescription: {
    fontSize: 14,
    color: themeStyle.TEXT_SECONDARY_COLOR,
    marginBottom: 4,
  },
  productPrice: {
    fontSize: 16,
    fontWeight: 'bold',
    color: themeStyle.PRIMARY_COLOR,
    marginBottom: 4,
  },
  statusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statusIndicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 5,
  },
  statusInStore: {
    backgroundColor: themeStyle.SUCCESS_COLOR,
  },
  statusNotInStore: {
    backgroundColor: themeStyle.ERROR_COLOR,
  },
  statusText: {
    fontSize: 12,
    color: themeStyle.TEXT_SECONDARY_COLOR,
  },
  dragHandle: {
    padding: 10,
  },
  dragIcon: {
    fontSize: 20,
    color: themeStyle.TEXT_SECONDARY_COLOR,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 50,
  },
  emptyText: {
    fontSize: 16,
    color: themeStyle.TEXT_SECONDARY_COLOR,
  },
  actionButtons: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    padding: 20,
    backgroundColor: themeStyle.WHITE_COLOR,
    borderTopWidth: 1,
    borderTopColor: themeStyle.BORDER_COLOR,
  },
  actionButton: {
    flex: 1,
    marginHorizontal: 10,
    paddingVertical: 12,
    borderRadius: 8,
  },
  resetButton: {
    backgroundColor: themeStyle.WARNING_COLOR,
  },
  saveButton: {
    backgroundColor: themeStyle.SUCCESS_COLOR,
  },
  instructionsContainer: {
    padding: 15,
    backgroundColor: themeStyle.BACKGROUND_COLOR,
  },
  instructionsTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: themeStyle.TEXT_PRIMARY_COLOR,
    marginBottom: 10,
  },
  instructionText: {
    fontSize: 14,
    color: themeStyle.TEXT_SECONDARY_COLOR,
    marginBottom: 5,
  },
});

export default ProductOrderManager; 