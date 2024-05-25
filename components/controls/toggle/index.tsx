import { StyleSheet, Text, View, TouchableOpacity } from "react-native";
import { useState, useEffect } from "react";
import themeStyle from "../../../styles/theme.style";

export default function Toggle({ onCounterChange, value, stepValue = 1, minValue = 0, isVertical = false }) {
  const [couter, setCounter] = useState(value || 0);
  const onBtnClick = (value) => {
    if ((couter === 0 && value === -1) || (couter + value < minValue )) {
      return;
    }
    const updatedValue = couter + value;
    setCounter(updatedValue);
    onCounterChange(updatedValue);
  };
  useEffect(()=>{
    setCounter(value || 0)
  },[value]);

  return (
    // <View style={{...styles.container, flexDirection: isVertical? "column" : "row"}}>
    //          <ToggleButton.Row
    //           onValueChange={(value) => setShippingMethod(value)}
    //           value={shippingMethod}
    //           style={styles.togglleContainer}
    //         >
    //           <ToggleButton
    //             style={{
    //               ...styles.togglleCItem,
    //               backgroundColor:
    //                 shippingMethod === SHIPPING_METHODS.shipping
    //                   ? theme.PRIMARY_COLOR
    //                   : "white",
    //             }}
    //             icon={() => (
    //               <View style={styles.togglleItemContentContainer}>
    //                 <Icon
    //                   icon="shipping_icon"
    //                   size={25}
    //                   style={{ color: theme.GRAY_700 }}
    //                 />
    //                 <Text style={{ fontSize: 20, fontWeight: "bold" }}>
    //                   {" "}
    //                   {t("delivery")}
    //                 </Text>
    //               </View>
    //             )}
    //             value={SHIPPING_METHODS.shipping}
    //           />
    //           <ToggleButton
    //             style={{
    //               ...styles.togglleCItem,
    //               backgroundColor:
    //                 shippingMethod === SHIPPING_METHODS.takAway
    //                   ? theme.PRIMARY_COLOR
    //                   : "white",
    //             }}
    //             icon={() => (
    //               <View style={styles.togglleItemContentContainer}>
    //                 <Text style={{ fontSize: 20, fontWeight: "bold" }}>
    //                   {t("take-away")}
    //                 </Text>

    //                 <Icon
    //                   icon="cart_burger_icon"
    //                   size={25}
    //                   style={{ color: theme.GRAY_700 }}
    //                 />
    //               </View>
    //             )}
    //             value={SHIPPING_METHODS.takAway}
    //           />
    //         </ToggleButton.Row>
    // </View>
  );
}
const styles = StyleSheet.create({
  container: {
    justifyContent: "space-between",
    width: "100%",
    alignItems: "center"
  },
  counterValue: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
  btn: {
    backgroundColor: themeStyle.PRIMARY_COLOR,
    width: 30,
    height: 30,
    borderRadius: 10,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
  btnText: {
    fontSize: 20,
    color: "white",
  },
});
