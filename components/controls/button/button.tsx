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
  countText?: string;
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
  countText,
  fontFamilyExtraText,
  borderWidth = true,
  isOposetGradiant,
  borderColor,
  borderWidthNumber,
  transformIconAnimate,
}: TProps) {
  const onBtnClick = () => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    onClickFn();
  };

  const getBorderWitdth = () => {
    if (borderWidthNumber) {
      return borderWidthNumber;
    }
    return borderWidth && bgColor ? 1 : 0;
  };

  const getBorderColor = () => {
    if (borderColor) {
      return borderColor;
    }
    if (disabled) {
      return themeStyle.GRAY_600;
    }

    if (bgColor == "white" || bgColor == themeStyle.PRIMARY_COLOR) {
      return themeStyle.TEXT_PRIMARY_COLOR;
    }

    if (bgColor) {
      return themeStyle.TEXT_PRIMARY_COLOR;
    }
  };
  const renderIcon = () => (
    <Animated.View
      style={{
        transform: transformIconAnimate,
      }}
    >
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
        style={{ width: "100%" }}
        disabled={disabled}
        onPress={onBtnClick}
        activeOpacity={0.8}
      >
        <LinearGradient
          colors={["#5fd100", "#00b32a"]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={styles.gradient}
        >
          <View style={styles.row}>
          {countText && <View style={styles.countTextContainer}><Text style={styles.countText}>{countText}</Text></View>}

            {/* Centered text and icon */}
            <View style={styles.centerContent}>
              {icon && (
                <Animated.View
                  style={{ marginRight: 8, transform: transformIconAnimate }}
                >
                  <Icon
                    icon={icon}
                    size={iconSize ? iconSize : themeStyle.FONT_SIZE_MD}
                    style={{ color: "#fff" }}
                  />
                </Animated.View>
              )}
              <Text style={styles.buttonText}>{text}</Text>
            </View>
            {/* Price on the left */}
            {extraText && <Text style={styles.price}>{extraText}</Text>}
          </View>
        </LinearGradient>
      </TouchableOpacity>
    </View>
  );
}
const styles = StyleSheet.create({
  container: {
    width: "100%",
  },
  gradient: {
    width: "100%",
    borderRadius: 999,

    justifyContent: "center",
    alignItems: "center",
    padding:15
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    width: "100%",
  },
  price: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: themeStyle.FONT_SIZE_MD,
    marginLeft: 10,
    position: "absolute",
    right: 0,
    top: 0,
  },
  countText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: themeStyle.FONT_SIZE_MD,


  },
  countTextContainer: {

    backgroundColor: "#4E2E53",
    borderRadius: 50,
    
    alignSelf:'center',
    width:30,
    height:30,
    justifyContent:'center',
    alignItems:'center'
  },
  centerContent: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    flex: 1,
  },
  buttonText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: themeStyle.FONT_SIZE_MD,
    textAlign: "center",
  },
});
