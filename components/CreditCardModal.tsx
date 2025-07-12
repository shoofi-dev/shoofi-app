import React from "react";
import { View, StyleSheet, Dimensions } from "react-native";
import CreditCardsScreen from "../screens/credit-cards";

const screenHeight = Dimensions.get('window').height;

const CreditCardModal = ({ onClose }) => {
  return (
    <View style={styles.modalContainer}>
      <CreditCardsScreen onClose={onClose} isModal={true} />
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

    height: "100%",
  },
});

export default CreditCardModal; 