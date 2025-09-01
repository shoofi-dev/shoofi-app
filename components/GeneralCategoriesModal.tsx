import React, { useContext } from "react";
import { View, TouchableOpacity, ScrollView, StyleSheet, Dimensions } from "react-native";
import GlassBG from "./glass-background";
import BackButton from "./back-button";
import themeStyle from "../styles/theme.style";
import { StoreContext } from "../stores";
import { getCurrentLang } from "../translations/i18n";
import { cdnUrl } from "../consts/shared";
import {
  normalizeWidth,
  normalizeHeight,
} from "../helpers/responsive-normalize";
import OptimizedImage from "./custom-fast-image";
import Icon from "./icon";
import Text from "./controls/Text";
import { useTranslation } from "react-i18next";
const screenHeight = Dimensions.get('window').height;

interface GeneralCategoriesModalProps {
  generalCategories: any[];
  selectedGeneralCategory: any;
  onCategorySelect: (category: any) => void;
  onClose: () => void;
}

const GeneralCategoriesModal = ({ 
  generalCategories, 
  selectedGeneralCategory, 
  onCategorySelect, 
  onClose 
}: GeneralCategoriesModalProps) => {
  const { t } = useTranslation();
  const { languageStore } = useContext(StoreContext);

  const handleCategoryPress = (category: any) => {
    onCategorySelect(category);
  };

  const renderCategoryItem = (category: any) => {
    const categoryName = languageStore.selectedLang === "ar" ? category.nameAR : category.nameHE;
    const isSelected = selectedGeneralCategory?._id === category._id;

    return (
      <TouchableOpacity
        key={category._id}
        style={[
          styles.categoryItem,
        ]}
        onPress={() => handleCategoryPress(category)}
        activeOpacity={0.7}
      >
        <View style={styles.categoryContent}>
   
          <Text style={[
            styles.categoryName,
          ]}>
            {categoryName}
          </Text>
        </View>
        {isSelected && (
            <Icon icon="v1" size={28} color={themeStyle.SUCCESS_COLOR} />
        )}
      </TouchableOpacity>
    );
  };
  return (
    <View style={styles.modalContainer}>
      <View style={styles.closeButton}>
        <BackButton 
          isDisableGoBack={true} 
          color={themeStyle.WHITE_COLOR} 
          onClick={onClose}
        />
      </View>
      
      <View style={styles.header}>
        <Text style={styles.headerTitle}>
          {t("choose-general-category")}
        </Text>
      </View>

      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {generalCategories?.map(renderCategoryItem)}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  modalContainer: {
    maxHeight: screenHeight * 0.8,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    overflow: 'hidden',
    backgroundColor: "#fff",
    height: screenHeight * 0.8,
  },
  closeButton: {
    position: "absolute",
    top: 20,
    left: 20,
    zIndex: 1000,
    width: 40,
    height: 40,
    justifyContent: "center",
    alignItems: "center",
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 30,

  },
  headerTitle: {
    fontSize: themeStyle.FONT_SIZE_XL,
    fontWeight: "bold",
    color: themeStyle.GRAY_900,
    textAlign: "center",
    fontFamily: `${getCurrentLang()}-Bold`,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 40,
  },
  categoryItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 20,
    marginBottom: 8,
    justifyContent: "space-between",

    borderTopWidth: 1,
    borderTopColor: themeStyle.GRAY_30,
    paddingHorizontal: 15,
  },
  selectedCategoryItem: {
    backgroundColor: themeStyle.PRIMARY_COLOR + "10",
    borderColor: themeStyle.PRIMARY_COLOR,
  },
  categoryContent: {

  },
  categoryImageContainer: {
    width: normalizeWidth(50),
    height: normalizeHeight(50),
    borderRadius: 12,
    overflow: "hidden",
    backgroundColor: themeStyle.GRAY_100,
    marginRight: 12,
  },
  categoryImage: {
    width: "100%",
    height: "100%",
  },
  placeholderImage: {
    width: "100%",
    height: "100%",
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: themeStyle.GRAY_100,
  },
  categoryName: {
    fontSize: themeStyle.FONT_SIZE_MD,
    fontWeight: "500",
    color: themeStyle.GRAY_900,
    flex: 1,
  },
  selectedCategoryName: {
    color: themeStyle.PRIMARY_COLOR,
    fontWeight: "600",
  },
  checkContainer: {
    // width: 24,
    // height: 24,
    // borderRadius: 12,
    // backgroundColor: themeStyle.PRIMARY_COLOR + "20",
    // justifyContent: "center",
    // alignItems: "center",
  },
});

export default GeneralCategoriesModal;
