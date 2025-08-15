import { LinearGradient } from "expo-linear-gradient";
import { View, StyleSheet, TouchableOpacity, Image } from "react-native";
import themeStyle from "../../../../styles/theme.style";
import Text from "../../../../components/controls/Text";
import { useTranslation } from "react-i18next";
import { getCurrentLang } from "../../../../translations/i18n";
import moment from "moment";
import { useContext } from "react";
import { StoreContext } from "../../../../stores";
import { isEmpty } from "lodash";
import DashedLine from "react-native-dashed-line";
import { APP_NAME, cdnUrl } from "../../../../consts/shared";
import sizeTitleAdapter from "../../../../helpers/size-name-adapter";
import Button from "../../../../components/controls/button/button";
import isShowSize from "../../../../helpers/is-show-size";
import CustomFastImage from "../../../../components/custom-fast-image";

const OrderItems = ({ order }) => {
  const { t } = useTranslation();
  const { menuStore, languageStore } = useContext(StoreContext);

  const renderOrderItems = (order) => {
    return order.order.items?.map((item, index) => {
      // const meal = menuStore.getFromCategoriesMealByKey(item.item_id);

      // if (isEmpty(meal)) {
      //   return;
      // }

      return (
        <View style={{}}>
          {index !== 0 && (
            <DashedLine
              dashLength={5}
              dashThickness={1}
              dashGap={0}
              dashColor={themeStyle.GRAY_20}
              style={{ marginTop: 15 }}
            />
          )}
          <View
            style={{
              flexDirection: "row",
              marginTop: index !== 0 ? 15 : 0,
              paddingHorizontal: 5,
              flexWrap: "wrap",
          
            }}
          >
            <View style={{alignItems: "center"}}>
              <View style={{ flexDirection: "row", flex: 1 }}>
                <View
                  style={{
                    width: 90,
                    height: 60,
                  }}
                >
                      <CustomFastImage
                      style={{
                        width: "100%",
                        height: "100%",
                        borderRadius: 5
                      }}
                      source={{
                        uri: `${cdnUrl}${item.img[0].uri}`,
                      }}
                      resizeMode="contain"
                  
                    />
                  {/* <Image
                    style={{ width: "100%", height: "100%" }}
                    source={{ uri: `${cdnUrl}${meal.img[0].uri}` }}
                    resizeMode="contain"
                  /> */}
                </View>
                {/* <View style={{ alignItems: "flex-start" }}>
                        {renderOrderItemsExtras(item.data)}
                      </View> */}
              </View>
            </View>
            <View
              style={{
                marginLeft: 10,
                flexDirection: "column",
                flex: 1,
              }}
            >
              <View
                style={{
                  flexDirection: "row",
                  alignContent: "center",
                  justifyContent: "space-between",
                  flex: 1,
                }}
              >
                <View style={{ flexDirection: "row", alignItems: "center" }}>
                <Text
                  style={{
                    fontSize: themeStyle.FONT_SIZE_MD,
                    color: themeStyle.GRAY_800,
                  }}
                >
                  {languageStore.selectedLang === "ar"
                    ? item.nameAR
                    : item.nameHE}
                </Text>
                <View style={{ marginLeft: 10 }}>
                <Text style={{ fontSize: themeStyle.FONT_SIZE_XS, color: themeStyle.GRAY_800 }}>X{item.qty}</Text>
                </View>
                </View>
             
                <View style={{ flexDirection: "row", alignItems: "center",  }}>
                  
                  <Text style={{ fontSize: themeStyle.FONT_SIZE_SM, color: themeStyle.GRAY_800 }}>₪{item.price}</Text>
                </View>
              </View>

              <View>
                <Text style={{ fontSize: themeStyle.FONT_SIZE_SM, color: themeStyle.GRAY_800 }}>{JSON.stringify(item.selectedExtras)  }</Text>
              </View>
     
      

              {item.note && (
                <View
                  style={{
                    marginTop: 2,
                    alignItems: "flex-start",
                    width: "100%",
                  }}
                >
                  <Text
                    style={{
                      fontSize: themeStyle.FONT_SIZE_MD,
                    }}
                  >
                    {t("note")}:  
                  </Text>
                  <Text
                    style={{
                      fontSize: themeStyle.FONT_SIZE_MD,
                      fontFamily: `${getCurrentLang()}-SemiBold`,
                      color: themeStyle.GRAY_700,
                      textAlign: "left",
                      marginVertical: 5,
                    }}
                  >
                    {item.note}
                  </Text>
                </View>
              )}
            </View>
          </View>
        </View>
      );
    });
  };

  return <View style={{}}>{renderOrderItems(order)}</View>;
};

export default OrderItems;

const styles = StyleSheet.create({
  orderContainer: {
    backgroundColor: "white",
    padding: 10,
    width: "100%",
    borderRadius: 10,
  },
  textLang: {
    //   fontFamily: props.fontFamily + "Bold",
    fontSize: 18,
    textAlign: "left",
  },
  background: {
    position: "absolute",
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
  },
  dateRawText: {
    fontSize: 16,
    fontFamily: `${getCurrentLang()}-SemiBold`,
    color: themeStyle.GRAY_700,
  },
});
