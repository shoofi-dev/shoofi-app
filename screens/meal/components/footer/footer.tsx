import { useTranslation } from "react-i18next";
import { View } from "react-native";
import { observer } from "mobx-react";
import { useContext } from "react";
import { StoreContext } from "../../../../stores";
import Text from "../../../../components/controls/Text";
import Button from "../../../../components/controls/button/button";
import themeStyle from "../../../../styles/theme.style";
import { getCurrentLang } from "../../../../translations/i18n";

export type TProps = {
  isEdit: boolean;
  isValidForm: boolean;
  onAddToCart: () => void;
  onUpdateCartProduct: () => void;
  price: number;
  qty: number;
};
const ProductFooter = ({
  isEdit,
  onAddToCart,
  onUpdateCartProduct,
  isValidForm,
  price,
  qty
}: TProps) => {
  const { t } = useTranslation();
  let { languageStore } = useContext(StoreContext);

  return (
    <View
      style={{
        flexDirection: "row",
        alignItems: "center",
        marginHorizontal:10
      }}
    >
      {/* <Text>{Number(price)*Number(qty)}</Text> */}
        <Button
          text={isEdit ? t("save") : t("add-to-cart")}
          icon="shopping-bag-plus"
          fontSize={17}
          onClickFn={isEdit ? onUpdateCartProduct : onAddToCart}
          fontFamily={`${getCurrentLang()}-Bold`}
          disabled={!isValidForm}
          bgColor={themeStyle.PRIMARY_COLOR}
          textColor={themeStyle.WHITE_COLOR}
          borderRadious={100}
          extraText={`₪ ${Number(price)*Number(qty)}`}
        />
    </View>
  );
};

export default observer(ProductFooter);
