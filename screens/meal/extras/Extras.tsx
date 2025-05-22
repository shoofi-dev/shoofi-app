import React, { useContext } from "react";
import { observer } from "mobx-react";
import ExtrasSection, {
  Extra,
} from "../../../components/extras-controls/ExtrasSection";
import { StoreContext } from "../../../stores";

export type MealExtrasProps = {
  extras: Extra[];
};

const MealExtras = ({ extras }: MealExtrasProps) => {
  let { extrasStore } = useContext(StoreContext);
  console.log("extrasStore.selections", extrasStore.selections);
  return (
    <ExtrasSection
      extras={extras}
      selections={extrasStore.selections}
      onChange={(extraId, value) => extrasStore.setSelection(extraId, value)}
    />
  );
};

export default observer(MealExtras);
