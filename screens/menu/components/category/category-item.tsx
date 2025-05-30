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
  const isSelected = selectedItem._id === item._id;
  return (
    <TouchableOpacity
      style={[
        styles.pill,
        isSelected && styles.pillSelected,
      ]}
      onPress={() => onItemSelect(item)}
      disabled={isDisabledCatItem}
    >
      <Text style={[styles.pillText, isSelected && styles.pillTextSelected]}>
        {languageStore.selectedLang === "ar" ? item.nameAR : item.nameHE}
      </Text>
    </TouchableOpacity>
  );
};

export default observer(CategoryItem);

const styles = StyleSheet.create({
  pill: {
    backgroundColor: "#f0f0f0",
    borderRadius: 20,
    paddingHorizontal: 18,
    paddingVertical: 8,
    marginHorizontal: 6,
    minWidth: 80,
    alignItems: "center",
    justifyContent: "center",
  },
  pillSelected: {
    backgroundColor: "#B6D436",
  },
  pillText: {
    color: "#222",
    fontSize: 16,
    fontWeight: "500",
  },
  pillTextSelected: {
    color: "#fff",
    fontWeight: "bold",
  },
});
