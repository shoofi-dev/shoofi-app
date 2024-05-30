import { LinearGradient } from "expo-linear-gradient";
import { View, StyleSheet } from "react-native";
import themeStyle from "../../../styles/theme.style";
import Text from "../../../components/controls/Text";
import { useTranslation } from "react-i18next";
import { getCurrentLang } from "../../../translations/i18n";
import moment from "moment";
import DashedLine from "react-native-dashed-line";
export const inProgressStatuses = ["1"];
export const readyStatuses = ["2", "3"];
export const canceledStatuses = ["4", "5"];

const CurrentStatus = ({ order }) => {
  const { t } = useTranslation();

  const getStatusTextByStatus = (status: string) => {
    if (inProgressStatuses.indexOf(status) > -1) {
      return "in-progress";
    }
    if (readyStatuses.indexOf(status) > -1) {
      return "ready";
    }
    if (canceledStatuses.indexOf(status) > -1) {
      return "canceled";
    }
};

  const renderOrderTotalRaw = (order) => {
    const oOrder = order.order;
    return (
      <View
        style={{
          borderColor: "#707070",
          marginVertical: 15,
          marginHorizontal: 10,
          flexDirection: "row",
          alignSelf: "center",
          marginBottom:40
        }}
      >
        <View style={{ alignItems: "center", position:'relative' }}>
          <View style={[styles.statusCircle,{backgroundColor: inProgressStatuses.indexOf(order.status) > -1 && order.isViewd ? themeStyle.SUCCESS_COLOR: 'transparent' }]}></View>
          <View style={{position:'absolute', width:100, bottom:-25}}>
          <Text style={{ fontSize: 20, alignSelf:'center' }}>{t('in-progress')}</Text>
          </View>
        </View>

        <DashedLine
          dashLength={5}
          dashThickness={2}
          dashGap={0}
          dashColor={themeStyle.TEXT_PRIMARY_COLOR}
          style={{ width: 90, alignSelf: "center", marginTop:0 }}
        />

        <View style={{ alignItems: "center", position:'relative' }}>
          <View style={[styles.statusCircle,{backgroundColor: inProgressStatuses.indexOf(order.status) > -1 && order.isViewd ? themeStyle.SUCCESS_COLOR: 'transparent' }]}></View>
          <View style={{position:'absolute', width:100, bottom:-25}}>
            <Text style={{ fontSize: 20, alignSelf:'center' }}>{t('ready')}</Text>
          </View>
        </View>
      </View>
    );
  };

  return <View style={{ width: "100%" }}>{renderOrderTotalRaw(order)}</View>;
};

export default CurrentStatus;

const styles = StyleSheet.create({
  statusCircle: {
    height: 40,
    width: 40,
    borderRadius: 30,
    borderColor: themeStyle.TEXT_PRIMARY_COLOR,
    borderWidth: 3,
  },
});
