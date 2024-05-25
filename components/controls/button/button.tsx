import { StyleSheet, View, TouchableOpacity, Animated } from "react-native";
import theme from "../../../styles/theme.style";
import Icon from "../../icon";
import themeStyle from "../../../styles/theme.style";
import { ActivityIndicator } from "react-native-paper";
import * as Haptics from "expo-haptics";
import Text from "../Text";
import { getCurrentLang } from "../../../translations/i18n";
import { LinearGradient } from "expo-linear-gradient";

type TProps = {
  onClickFn: any;
  text: any;
  icon?: any;
  iconSize?: any;
  iconPosition?: "right" | "left";
  fontSize?: any;
  bgColor?: any;
  textColor?: any;
  fontFamily?: any;
  disabled?: boolean;
  isLoading?: boolean;
  borderRadious?: number;
  textPadding?: number;
  isFlexCol?: boolean;
  borderWidth?: boolean;
  marginH?: number;
  iconMargin?: number;
  extraText?: string;
  fontFamilyExtraText?: string;
  isOposetGradiant?: boolean;
  borderColor?: string;
  borderWidthNumber?: number;
  transformIconAnimate?: any;
};
export default function Button({
  onClickFn,
  text,
  icon,
  iconSize,
  fontSize,
  iconPosition = "right",
  bgColor,
  textColor,
  fontFamily,
  disabled,
  isLoading,
  borderRadious,
  textPadding,
  isFlexCol,
  marginH,
  iconMargin,
  extraText,
  fontFamilyExtraText,
  borderWidth = true,
  isOposetGradiant,
  borderColor,
  borderWidthNumber,
  transformIconAnimate
}: TProps) {
  const onBtnClick = () => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    onClickFn();
  };

  const getBorderWitdth = () => {
    if(borderWidthNumber){
      return borderWidthNumber;
    }
    return borderWidth && bgColor ? 1 : 0;
  }

  const getBorderColor = () => {
    if(borderColor){
      return borderColor;
    }
    if (disabled) {
      return themeStyle.GRAY_600;
    }

    if (bgColor == "white" || bgColor == themeStyle.PRIMARY_COLOR) {
      return themeStyle.PRIMARY_COLOR;
    }

    if (bgColor) {
      return themeStyle.PRIMARY_COLOR;
    }
  };
  const renderIcon = () => (
    <Animated.View style={{
      transform: transformIconAnimate
    }}>
    <Icon
      icon={icon}
      size={iconSize ? iconSize : 20}
      style={{
        color: textColor || theme.GRAY_700,
        marginBottom: isFlexCol ? 10 : 0,
        marginRight: iconMargin ? iconMargin : 0,
      }}
    />
    </Animated.View>
  );
  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={{
          ...styles.button,
          borderRadius: borderRadious !== undefined ? borderRadious : 30,
          backgroundColor: disabled ? themeStyle.GRAY_600 : bgColor,
          borderColor: getBorderColor(),
          borderWidth:getBorderWitdth(),
          opacity: disabled && 0.3,
          alignItems: "center",
          padding: isFlexCol ? 0 : 10,
          height: isFlexCol ? "100%" : "auto",
        }}
        disabled={disabled}
        onPress={() => {
          onBtnClick();
        }}
      >
        {!bgColor && (
          <LinearGradient
            colors={isOposetGradiant ? ["#eaaa5c", "#a77948"] : ["#EBA33E", "#D75F30","#EBA33E"]}
            start={{ x: 1, y: 0 }}
            end={{ x: 0, y: 1 }}
            style={[styles.background,{borderRadius:borderRadious !== undefined ? borderRadious : 30}]}
          />
        )}
        <View
          style={{
            height: isFlexCol ? "100%" : "auto",
            flexDirection: isFlexCol ? "column" : "row",
            alignItems: "center",
            ...styles.button,
            borderRadius: borderRadious !== undefined ? borderRadious : 30,
            backgroundColor: "transparent",
            borderColor: getBorderColor(),
            width: "100%",
          }}
        >
          {icon && iconPosition && iconPosition === "right" && renderIcon()}
          <Text
            style={{
              marginHorizontal: marginH !== undefined ? marginH : 15,
              fontSize: fontSize,
              color: textColor || theme.WHITE_COLOR,
              fontFamily: fontFamily || `${getCurrentLang()}-Light`,
              padding: textPadding,
              textAlign: "center",
              fontWeight:"Bold"

            }}
          >
            {text}
          </Text>

          {icon && iconPosition && iconPosition === "left" && renderIcon()}
          {isLoading && (
            <ActivityIndicator animating={true} color={theme.WHITE_COLOR} />
          )}
          <View></View>
        </View>
        {extraText && (
          <Text
            style={{
              fontSize: 20,
              color: textColor,
              fontFamily: fontFamilyExtraText || fontFamily,
              textAlign: "center",
            }}
          >
            {extraText}
          </Text>
        )}
      </TouchableOpacity>
    </View>
  );
}
const styles = StyleSheet.create({
  container: {
    width: "100%",
  },
  button: {
    backgroundColor: theme.PRIMARY_COLOR,
    alignItems: "center",
    justifyContent: "center",
  },
  buttonText: {
    marginHorizontal: 15,
  },
  background: {
    position: "absolute",
    left: "0%",
    right: "0%",
    top: "0%",
    bottom: "0%",
  },
});
