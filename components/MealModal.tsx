import React, { useMemo, useState, useContext, useCallback } from "react";
import { View, TouchableOpacity, Text, ScrollView, StyleSheet, Dimensions } from "react-native";
import GlassBG from "./glass-background";
import MealScreen from "../screens/meal/index2";
import BackButton from "./back-button";
import themeStyle from "../styles/theme.style";
import ProductFooter from "../screens/meal/components/footer/footer";
import { StoreContext } from "../stores";

const screenHeight = Dimensions.get('window').height;

const MealModal = ({ product, category, onClose, index=null }) => {
  const [footerProps, setFooterProps] = useState(null);
  const { cartStore } = useContext(StoreContext);

  const handleFooterProps = useCallback((props) => {
    setFooterProps(props);
  }, []);

  return (
    <View style={styles.modalContainer}>
      <View style={styles.closeButton}>
  
          <BackButton isDisableGoBack={true} color={themeStyle.WHITE_COLOR} onClick={onClose}/>
      </View>
      <View style={{  }}>
        <MealScreen  
          handleClose={onClose} 
          product={product} 
          category={category} 
          index={index}
          onFooterProps={handleFooterProps}
        />
      </View>
      {footerProps && (
        <View style={styles.footerContainer}>
          <ProductFooter {...footerProps} />
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  modalContainer: {
    maxHeight: screenHeight * 0.9,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    overflow: 'hidden',
    backgroundColor: "#fff",
  },
  closeButton: {
    position: "absolute",
    top: 20,
    right: 20,
    zIndex: 1000,
    width: 40,
    height: 40,
    justifyContent: "center",
    alignItems: "center",

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
  footerContainer: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0,0,0,0)",
    padding: 10,
    paddingHorizontal: 20,
    
  },
});

export default MealModal; 