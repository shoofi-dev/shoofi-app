import { StyleSheet, Text, View, TextInput } from "react-native";
import { TextInput as TextInputPaper } from "react-native-paper";
import themeStyle from "../../../styles/theme.style";
import { getCurrentLang } from "../../../translations/i18n";

type TProps = {
  onChange: any;
  label: string;
  value?: string;
  isEditable?: boolean;
  onClick?: any;
  keyboardType?: any;
  isError?: boolean;
  isPreviewMode?: boolean;
  variant?: "default" | "outlined";
  placeHolder?: string;
  onFocus?: any;
  onBlur?: any;
  isFlex?: boolean;
  fontSize?: number;
  color?: string;
  textAlign?: "left" | "right" | "center";
};
export default function InputText({
  onChange,
  value,
  label,
  isEditable = true,
  onClick,
  keyboardType,
  isError,
  isPreviewMode,
  variant,
  placeHolder,
  onFocus,
  onBlur,
  isFlex,
  fontSize,
  color,
  textAlign
}: TProps) {
  const handleOnChange = (e) => {
    onChange && onChange(e.nativeEvent.text);
  };
  if (variant === "default") {
    return (
      <View style={[styles.container, {flexDirection: isFlex ? "row":"column", justifyContent:'space-around'}]}>
        <Text
          style={{
            textAlign: "left",
            paddingLeft: 0,
            marginBottom: 10,
            fontSize: 20,
            fontFamily: `${getCurrentLang()}-SemiBold`,
            color: color || themeStyle.TEXT_PRIMARY_COLOR

          }}
        >
          {label}
        </Text>
        <TextInput
          value={value}
          onPressIn={onClick}
          editable={isEditable}
          onChange={handleOnChange}
          placeholder={placeHolder}
          placeholderTextColor={color || themeStyle.GRAY_40}
          selectionColor={"black"}
          keyboardType={keyboardType}
          onFocus={onFocus}
          onBlur={onBlur}
          style={{
            borderWidth: 1,
            borderColor: isError
              ? themeStyle.ERROR_COLOR
              :  themeStyle.GRAY_30,
            // borderRadius: 30,
            fontSize: fontSize || 20,
            color: isEditable ? themeStyle.GRAY_80 : color || themeStyle.GRAY_40,
            fontFamily: `${getCurrentLang()}-SemiBold`,
            width:isFlex ? "60%":"100%",
            marginLeft:0,
            paddingHorizontal:5,
            backgroundColor:themeStyle.WHITE_COLOR,
            paddingTop:5, borderRadius:6,
            height:48,
            textAlign: textAlign || null
          }}
        />
      </View>
    );
  }
  return (
<View style={styles.container}>
  <TextInputPaper
    value={value}
    onPressIn={onClick}
    editable={isEditable}
    onChange={handleOnChange}
    mode="flat"
    disabled={isPreviewMode}
    placeholder={placeHolder}
    keyboardType={keyboardType}
    onFocus={onFocus}
    onBlur={onBlur}
    style={{
      backgroundColor: 'transparent',
      fontSize: 20,
      fontFamily: `${getCurrentLang()}-SemiBold`,

      textAlign: 'right',
      color: color || themeStyle.TEXT_PRIMARY_COLOR,
      borderWidth:1,
      borderColor:isError ? themeStyle.ERROR_COLOR : themeStyle.GRAY_30,
      paddingHorizontal:5,
      paddingTop:5,
      borderRadius:6,
      height:48
    }}
    theme={{
      colors: {
        text: color || themeStyle.TEXT_PRIMARY_COLOR,
        placeholder: '#A1A1A1',
        primary: isError ? themeStyle.ERROR_COLOR : '#DCDCDC',
        background: '#F5F5F5',
      },
    }}
    underlineColor="transparent"
    activeUnderlineColor="transparent"
  />
</View>
  );
}
const styles = StyleSheet.create({
  container: { width: "100%" },
});
