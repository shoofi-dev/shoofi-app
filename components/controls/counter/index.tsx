import { StyleSheet, Text, View, TouchableOpacity } from "react-native";
import { useState, useEffect } from "react";
import themeStyle from "../../../styles/theme.style";
import * as Haptics from "expo-haptics";

export default function Counter({ onCounterChange, value, stepValue = 1, minValue = 0, isVertical = false, variant = null, size = 35 }) {
  const [couter, setCounter] = useState(value || 0);
  const onBtnClick = (value) => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
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

  if(variant === 'gray'){
    return (
      <View style={{...styles.containerGray, flexDirection: isVertical? "column" : "row"}}>
        <View>
          <TouchableOpacity
            style={styles.btnGray}
            onPress={() => {
              onBtnClick(stepValue);
            }}
          >
            <Text style={styles.btnTextGray}>+</Text>
          </TouchableOpacity>
        </View>
        <View style={styles.counterValue}>
          <Text style={{ fontSize: 20,color:themeStyle.WHITE_COLOR}}>{couter}</Text>
        </View>
        <View>
          <TouchableOpacity
            style={styles.btnGray}
            onPress={() => {
              onBtnClick(-stepValue);
            }}
          >
            <Text style={styles.btnTextGray}>-</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  if(variant === 'colors'){
    return (
      <View style={{...styles.containerGray, flexDirection: isVertical? "column" : "row"}}>
        <View>
          <TouchableOpacity
            style={[styles.btnGray,{width: size, height:size}]}
            onPress={() => {
              onBtnClick(stepValue);
            }}
          >
            <Text style={styles.btnTextGreen}>+</Text>
          </TouchableOpacity>
        </View>
        <View style={styles.counterValue}>
          <Text style={{ fontSize: 16,color:themeStyle.WHITE_COLOR}}>{couter}</Text>
        </View>
        <View>
          <TouchableOpacity
            style={[styles.btnGray,{width: size, height:size}]}
            onPress={() => {
              onBtnClick(-stepValue);
            }}
          >
            <Text style={styles.btnTextRed}>-</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <View style={{...styles.container, flexDirection: isVertical? "column" : "row"}}>
      <View>
        <TouchableOpacity
          style={[styles.btn]}
          onPress={() => {
            onBtnClick(stepValue);
          }}
        >
          <Text style={styles.btnText}>+</Text>
        </TouchableOpacity>
      </View>
      <View style={styles.counterValue}>
        <Text style={{ fontSize: 20,color:themeStyle.PRIMARY_COLOR}}>{couter}</Text>
      </View>
      <View>
        <TouchableOpacity
          style={styles.btn}
          onPress={() => {
            onBtnClick(-stepValue);
          }}
        >
          <Text style={styles.btnText}>-</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}
const styles = StyleSheet.create({
  container: {
  },
  containerGray: {
    borderRadius:50,
    shadowColor: themeStyle.GRAY_600,
    shadowOffset: {
      width: 0,
      height: 3,
    },
    shadowOpacity: 1,
    shadowRadius: 10,
    elevation: 20,
    borderWidth: 0,
    backgroundColor: "white",
    
  },
  counterValue: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    width:40,
    backgroundColor:themeStyle.PRIMARY_COLOR
  },
  btn: {
    // backgroundColor: themeStyle.PRIMARY_COLOR,
    width: 30,
    height: 30,
    borderRadius: 30,
    alignItems: "center",
    justifyContent: "center",
    color:themeStyle.PRIMARY_COLOR,
    borderColor: themeStyle.PRIMARY_COLOR,
    borderWidth:1
  },
  btnGray: {
    backgroundColor: themeStyle.WHITE_COLOR,

    width: 35,
    height: 35,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    color:themeStyle.PRIMARY_COLOR,
    borderColor: themeStyle.PRIMARY_COLOR,
    borderRadius:10
  },
  btnGreen: {
     backgroundColor: themeStyle.WHITE_COLOR,
    width: 35,
    height: 35,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    color:themeStyle.SUCCESS_COLOR,
    borderColor: themeStyle.SUCCESS_COLOR,
  },
  btnTextGray: {
    fontSize: 25,
    color: themeStyle.WHITE_COLOR,
    fontFamily: "Poppins-Regular",
  },
  btnTextGreen: {
    fontSize: 22,
    color: themeStyle.SUCCESS_COLOR,
    fontFamily: "Poppins-Regular",
  },
  btnTextRed: {
    fontSize: 22,
    color: themeStyle.ERROR_COLOR,
    fontFamily: "Poppins-Regular",
  },
  btnText: {
    fontSize: 20,
    color: themeStyle.PRIMARY_COLOR,
    fontFamily: "Poppins-Regular",
    // alignSelf:"center",
    // top:1,
    // right:0
  },
});
