import { StyleSheet, View, Image } from "react-native";
import { observer } from "mobx-react";
import { useNavigation } from "@react-navigation/native";
import Button from "../../../components/controls/button/button";
import themeStyle from "../../../styles/theme.style";
import { useTranslation } from "react-i18next";
import { getCurrentLang } from "../../../translations/i18n";
import { useEffect, useContext, useState } from "react";
import { StoreContext } from "../../../stores";
import { SHIPPING_METHODS } from "../../../consts/shared";
import Icon from "../../../components/icon";
import Text from "../../../components/controls/Text";
import LottieView from 'lottie-react-native';
import { color } from "react-native-reanimated";
const orderSubmitedAnimation = require('../../../assets/order/animation-order-submitted.json')
const cakeAnimation = require('../../../assets/lottie/butcher-typ-animation.json')
const OrderSubmittedScreen = ({ route }) => {
  const { t } = useTranslation();
  const { ordersStore,userDetailsStore } = useContext(StoreContext);
  
  const { shippingMethod } = route.params;
  const navigation = useNavigation();
  const [isAnimateReady, setIsAnimateReady] = useState(false);

  useEffect(() => {
    // ordersStore.getOrders(userDetailsStore.isAdmin());
    setTimeout(()=>{
      setIsAnimateReady(true)
    }, 500)
  }, []);

  const goToOrderStatus = () => {
    if(userDetailsStore.isAdmin()){
      navigation.navigate("homeScreen");
    }else{
      navigation.navigate("order-history");
    }
  };

  return (
    <View style={styles.container}>
      <View style={{ alignItems: "center", width: "100%" }}>
        <View
          style={{ alignItems: "center", paddingHorizontal: 0, width: "100%", top:-60 }}
        >
          <View style={{width: 200, height:200, }}>
         {isAnimateReady &&  <LottieView
              source={orderSubmitedAnimation}
              autoPlay
              loop={false}
              
            />}
          </View>
  
          <View style={{ flexDirection: "row", alignItems: "center"}}>
            <Text
              style={{
                ...styles.textLang,
                fontFamily: `${getCurrentLang()}-Bold`,
                marginRight: 10,
                top: -20,
                color:themeStyle.WHITE_COLOR
              }}
            >
              {t("order-succefully-sent")}
            </Text>
          </View>

          <View
            style={{
              alignItems: "center",
              height: 275,
              width: "100%",
              marginBottom: 20, marginTop:20 
            }}
          >
            {shippingMethod === SHIPPING_METHODS.shipping && isAnimateReady && (
            <LottieView
            source={cakeAnimation}
            autoPlay
            loop={true}
            
          />
            )}
            {shippingMethod === SHIPPING_METHODS.takAway && isAnimateReady &&(
              <LottieView
              source={cakeAnimation}
              autoPlay
              loop={true}
            />
            )}

          </View>
          {/* <View>
            <Text
              style={{
                ...styles.textLang,
                fontFamily: `${getCurrentLang()}-Bold`,
                fontSize: 22,
                textAlign: "center",
                marginTop:10,
                color:themeStyle.WHITE_COLOR,
                marginBottom:20
              }}
            >
             
              {t("يسعدنا ان نكون جزءا من فرحتكم")}
            
        
             
         
            </Text>
          </View> */}
        </View>
        <View style={{ width: "80%", bottom:0, position:'absolute' }}>
          <View>
            <Button
              onClickFn={() => {
                goToOrderStatus();
              }}
              textColor={themeStyle.WHITE_COLOR}
              fontSize={20}
              fontFamily={`${getCurrentLang()}-SemiBold`}
              // text={userDetailsStore.isAdmin() ? t("new-order") : t("current-orderds")}
              text={t("current-orderds")}
            />
          </View>
        </View>
      </View>
    </View>
  );
};
export default observer(OrderSubmittedScreen);

const styles = StyleSheet.create({
  container: {
    justifyContent: "center",
    width: "100%",
    height: "100%",
  },
  textLang: {
    fontSize: 25,
    textAlign: "left",
  },
});
