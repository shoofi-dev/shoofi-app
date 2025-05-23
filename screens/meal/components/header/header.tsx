import { useTranslation } from "react-i18next";
import { View } from "react-native";
import { observer } from "mobx-react";
import { useContext, useEffect } from "react";
import { StoreContext } from "../../../../stores";
import Text from "../../../../components/controls/Text";
import Counter from "../../../../components/controls/counter";
import { getCurrentLang } from "../../../../translations/i18n";
import themeStyle from "../../../../styles/theme.style";

export type TProps = {
  product: any;
  updateOthers: (value: number, key: string, type: string) => void;
};
const ProductHeader = ({ product, updateOthers }: TProps) => {
  const { t } = useTranslation();
  let { languageStore } = useContext(StoreContext);
  return (
    <View
      style={{
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
      }}
    >
      <View>
        <Text
          style={{
            fontSize: themeStyle.FONT_SIZE_2XL,
            fontWeight: "600",
            fontFamily: `${getCurrentLang()}-Bold`,
          }}
        >
          {languageStore.selectedLang === "ar"
            ? product.data.nameAR
            : product.data.nameHE}
          
        </Text>
      </View>
      <View style={{width:"25%",alignItems:"center"}}>
        <Counter
          value={product.others.qty}
          minValue={1}
          onCounterChange={(value) => {
            updateOthers(value, "qty", "others");
          }}
          variant={"gray"}
        />
      </View>
    </View>
  );
};

export default observer(ProductHeader);
