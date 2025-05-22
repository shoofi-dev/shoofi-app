import { useTranslation } from "react-i18next";
import { View } from "react-native";
import { observer } from "mobx-react";
import { useContext } from "react";
import { StoreContext } from "../../../../stores";
import Text from "../../../../components/controls/Text";
import Counter from "../../../../components/controls/counter";
import { getCurrentLang } from "../../../../translations/i18n";

export type TProps = {
  product: any;
  updateMeal: (value: number, key: string, type: string)=> void;
};
const ProductHeader = ({ product, updateMeal }: TProps) => {
  const { t } = useTranslation();
  let { languageStore } = useContext(StoreContext);

  return (
    <View style={{flexDirection:'row', justifyContent:'space-between', alignItems:'center'}}>
      <View>
        <Text style={{fontSize: 18, fontWeight: '600', fontFamily: `${getCurrentLang()}-Bold`}}>
            {languageStore.selectedLang === "ar"
                    ? product.nameAR
                    : product.nameHE}
        </Text>
      </View>
      <View>
      <Counter
                value={product.others.qty}
                minValue={1}
                onCounterChange={(value) => {
                  updateMeal(value, "counter", product.extras.counter.type);
                }}
                variant={"gray"}
              />
      </View>
    </View>
  );
};

export default observer(ProductHeader);

