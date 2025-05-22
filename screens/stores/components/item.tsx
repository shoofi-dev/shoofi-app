import { StyleSheet, View, Image, TouchableOpacity } from "react-native";
import { useContext, useEffect } from "react";
import { observer } from "mobx-react";
import { useTranslation } from "react-i18next";
import Text from "../../../components/controls/Text";
import themeStyle from "../../../styles/theme.style";
import CustomFastImage from "../../../components/custom-fast-image";
import { StoreContext } from "../../../stores";
import { useNavigation } from "@react-navigation/native";

export type TProps = {
    storeItem: any;
}

const StoresCategoryItem = ({storeItem}: TProps) => {
  const { t } = useTranslation();
  const navigation = useNavigation();

  let {
    menuStore,
    storeDataStore,
    shoofiAdminStore,
  } = useContext(StoreContext);
  const onStoreSelect = async (store: any) => {
    await shoofiAdminStore.setStoreDBName(store.dbName);
    await menuStore.getMenu();
    await storeDataStore.getStoreData();
    navigation.navigate("menuScreen");
  };
  return (
    <View style={styles.container}>

<TouchableOpacity
        onPress={() => onStoreSelect(storeItem)}
        style={{
          width: "100%",
        }}
      >
        <View
          style={{
            shadowColor: themeStyle.SHADOW_COLOR,
            shadowOffset: {
              width: 0,
              height: 2,
            },
            shadowOpacity: 0.9,
            shadowRadius: 6,
            elevation: 20,
            borderWidth: 0,
            backgroundColor: "transparent",

            width: "100%",
          }}
        >
          <CustomFastImage
            style={{
              width: "100%",
              height: 150,
              borderRadius: 30,
            }}
            source={{ uri: `${storeItem.storeLogo}` }}
            cacheKey={`${storeItem.storeLogo.split(/[\\/]/).pop()}1`}
          />
        </View>
        <View
          style={{
            alignItems: "center",
            marginTop: 5,
          }}
        >
          <Text
            style={{
              fontSize: 18,
              fontWeight: "700",
            }}
          >
            {storeItem.storeName}
          </Text>
        </View>
      </TouchableOpacity>
    </View>
  );
};
export default observer(StoresCategoryItem);

const styles = StyleSheet.create({
  container: {},
  subContainer: {
    width: "100%",
    height: "100%",
    alignItems: "center",
  },
  background: {
    position: "absolute",
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
  },
});
