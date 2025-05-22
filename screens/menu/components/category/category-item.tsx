import { StyleSheet, View, TouchableOpacity, Image } from "react-native";
import Text from "../../../../components/controls/Text";
import { observer } from "mobx-react";
import themeStyle from "../../../../styles/theme.style";

/* components */
import Icon from "../../../../components/icon";
import { getCurrentLang } from "../../../../translations/i18n";
import { useTranslation } from "react-i18next";
import { useContext } from "react";
import { StoreContext } from "../../../../stores";
import { cdnUrl } from "../../../../consts/shared";
import { LinearGradient } from "expo-linear-gradient";

export type TProps = {
  item: any;
  onItemSelect: (item: any) => void;
  selectedItem: any;
  isDisabledCatItem?: any;
};

const CategoryItem = ({
  item,
  onItemSelect,
  selectedItem,
  isDisabledCatItem,
}: TProps) => {
  const { t } = useTranslation();
  const { languageStore } = useContext(StoreContext);
  return (
    <View style={[styles.categoryItem, styles.shadow]}>
      <TouchableOpacity
        style={{
 
          borderWidth: selectedItem._id === item._id ? 2 : 0,
          zIndex: 1,  
        //   shadowOpacity: selectedItem._id === item._id ? 0.5 : 0,
        //   shadowRadius: 6.84,
        //   elevation: 9,
         borderRadius: 10,
  
          // marginTop: selectedItem._id === item._id ? 35 : 0,
          backgroundColor:
            selectedItem._id === item._id ? themeStyle.SECONDARY_COLOR : themeStyle.GRAY_300,
            borderColor:themeStyle.SECONDARY_COLOR,
            overflow:'hidden',
            alignItems:'center',
            justifyContent:'center',
            paddingVertical:5,
            paddingHorizontal:15,
            minWidth:100
        }}
        onPress={() => {
          onItemSelect(item);
        }}
        disabled={isDisabledCatItem}
      >
             {/* {selectedItem._id === item._id && <LinearGradient
            colors={ ["#eaaa5c", "#a77948"]}
            start={{ x: 1, y: 0 }}
            end={{ x: 0, y: 1 }}
            style={[styles.background]}
          />} */}
        <View>
          <Text
            style={{
                color: selectedItem._id === item._id ? themeStyle.WHITE_COLOR : themeStyle.TEXT_PRIMARY_COLOR,
                fontSize:16
              }}
          >
            {languageStore.selectedLang === "ar" ? item.nameAR : item.nameHE}
          </Text>
   
        </View>
      </TouchableOpacity>
    </View>
  );
};

export default observer(CategoryItem);

const styles = StyleSheet.create({
  container: {
    // backgroundColor: "#F1F1F1",
  },
  categoryItem: {
    alignItems: "center",
    // justifyContent: "center",
    flex: 1,
    marginHorizontal: 5,
    // width: 120,
    

  },
  iconContainer: {
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 50,
    height: 60,
    width: 60,
    // padding: 15,
  },
  itemsListConainer: {},
  background: {
    position: "absolute",
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
  },
  shadow: {
    shadowColor: themeStyle.GRAY_600,
     shadowOffset: {
          width: 0,
          height: 2,
        },
        shadowOpacity: 0.9,
        shadowRadius: 5,
        elevation: 20,
        borderWidth:0,
  }
});
