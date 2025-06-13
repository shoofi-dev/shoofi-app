import { StyleSheet, View, TouchableOpacity } from "react-native";
import { useNavigation } from "@react-navigation/native";

import theme from "../../styles/theme.style";
import Icon from "../icon";
import * as Haptics from "expo-haptics";
import themeStyle from "../../styles/theme.style";
import Text from "../controls/Text";
import { useResponsive } from "../../hooks/useResponsive";

export type TProps = {
  goTo?: string;
  onClick?: any;
};
export default function BackButton({ goTo, onClick }: TProps) {
  const navigation = useNavigation();
  const { isTablet, scale, fontSize } = useResponsive();

  const onBtnClick = () => {
    onClick && onClick();
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    const routes = navigation.getState()?.routes;
    const currentRoute = routes[routes.length - 1]; // -2 because -1 is the current route
    const prevRoute = routes[routes.length - 2]; // -2 because -1 is the current route
    if (
      (currentRoute.name === "cart" || currentRoute.name === "profile") &&
      (prevRoute.name === "verify-code" ||
        prevRoute.name === "insert-customer-name")
    ) {
      navigation.navigate("homeScreen");
      return;
    }
    if (goTo) {
      navigation.navigate(goTo);
      return;
    }
    navigation.goBack();
  };

  return (
    
      <TouchableOpacity
        onPress={() => {
          onBtnClick();
        }}
        style={styles.container}
      >
   
         <Text style={{fontSize:20, color:themeStyle.BLACK_COLOR}}>{'>'}</Text>
      </TouchableOpacity>
    
  );
}
const styles = StyleSheet.create({
  container: {
      width: 36,
      height: 36,
      alignItems: "center",
      justifyContent: "center",
      backgroundColor: "#ECF0F4",
      borderRadius: 50,
  },
  button: {
    backgroundColor: theme.PRIMARY_COLOR,
    borderRadius: 30,
    display: "flex",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    padding: 10,
  },
  buttonText: {
    marginHorizontal: 20,
  },
});
