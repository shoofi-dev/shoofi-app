import React from "react";
import { View, StyleSheet } from "react-native";
import Svg, { G, Circle } from "react-native-svg";
import Text from "../../../../components/controls/Text";
import themeStyle from "../../../../styles/theme.style";
import { useTranslation } from "react-i18next";

interface OrderTimerProps {
  order?: any;
  mockData?: {
    status: string;
    totalMinutes: number;
    remainingMinutes: number;
    isActive: boolean;
  };
}

const SEGMENTS = 5;
const RADIUS = 40;
const STROKE = 8;
const GAP_DEG = 18;
const SIZE = (RADIUS + STROKE) * 2;

const OrderTimer: React.FC<OrderTimerProps> = ({ mockData, order }) => {
  const { t } = useTranslation();

  // Calculate totalMinutes and remainingMinutes from order.created and order.orderDate
  let timerData: {
    status: string;
    totalMinutes: number;
    remainingMinutes: number;
    isActive: boolean;
  };

  if (
    order &&
    order.created &&
    order.orderDate &&
    !isNaN(Date.parse(order.created)) &&
    !isNaN(Date.parse(order.orderDate))
  ) {
    const created = new Date(order.created).getTime();
    const orderDate = new Date(order.orderDate).getTime();
    const now = Date.now();
    const totalMinutes = Math.max(1, Math.round((orderDate - created) / 60000));
    const remainingMinutes = Math.max(0, Math.ceil((orderDate - now) / 60000));
    timerData = {
      status: order.status || "1",
      totalMinutes,
      remainingMinutes,
      isActive: true,
    };
  } else if (mockData) {
    timerData = mockData;
  } else {
    timerData = {
      status: "3",
      totalMinutes: 10,
      remainingMinutes: 7,
      isActive: true,
    };
  }

  // Progress: how many segments should be green
  const progress = Math.max(
    0,
    Math.min(
      1,
      (timerData.totalMinutes - timerData.remainingMinutes) /
        timerData.totalMinutes
    )
  );
  const filledSegments = Math.round(progress * SEGMENTS);

  // For RTL/minutes
  const statusText =
    timerData.status === "3" ? t("on-the-way") : t("preparing");

  // Helper to get arc for each segment
  const getSegment = (index: number, color: string) => {
    const startAngle = (360 / SEGMENTS) * index + GAP_DEG / 2;
    const endAngle = (360 / SEGMENTS) * (index + 1) - GAP_DEG / 2;
    const largeArc = endAngle - startAngle > 180 ? 1 : 0;
    const start = polarToCartesian(
      RADIUS + STROKE,
      RADIUS + STROKE,
      RADIUS,
      endAngle
    );
    const end = polarToCartesian(
      RADIUS + STROKE,
      RADIUS + STROKE,
      RADIUS,
      startAngle
    );
    const d = [
      `M ${start.x} ${start.y}`,
      `A ${RADIUS} ${RADIUS} 0 ${largeArc} 0 ${end.x} ${end.y}`,
    ].join(" ");
    return (
      <Path
        key={index}
        d={d}
        stroke={color}
        strokeWidth={STROKE}
        fill="none"
        strokeLinecap="round"
      />
    );
  };

  // Helper: polar to cartesian
  function polarToCartesian(cx: number, cy: number, r: number, angle: number) {
    const a = ((angle - 90) * Math.PI) / 180.0;
    return {
      x: cx + r * Math.cos(a),
      y: cy + r * Math.sin(a),
    };
  }

  // For Hebrew/RTL: time first, then "דק'"
  const timeValue = timerData.remainingMinutes.toString().padStart(2, "0");
  const timeUnit = t("דק"); // e.g. דק'

  return (
    <View style={styles.centered}>
      <View style={styles.ringContainer}>
        <Svg width={SIZE} height={SIZE}>
          <G>
            {[...Array(SEGMENTS)].map((_, i) =>
              getSegment(
                i,
                i < filledSegments
                  ? themeStyle.SUCCESS_COLOR
                  : themeStyle.GRAY_30
              )
            )}
          </G>
        </Svg>
        <View style={styles.timeCenter}>
          <Text style={styles.timeText}>
            <Text style={styles.timeValue}>{timeValue}</Text>
            <Text style={styles.timeUnit}> {timeUnit}</Text>
          </Text>
        </View>
      </View>
      <Text style={styles.statusText}>{statusText}</Text>
    </View>
  );
};

import { Path } from "react-native-svg";

const styles = StyleSheet.create({
  centered: {
    alignItems: "center",
    justifyContent: "center",
  },
  ringContainer: {
    width: SIZE,
    height: SIZE,
    alignItems: "center",
    justifyContent: "center",
  },
  timeCenter: {
    position: "absolute",
    top: 0,
    left: 0,
    width: SIZE,
    height: SIZE,
    alignItems: "center",
    justifyContent: "center",
  },
  timeText: {
    flexDirection: "row-reverse",
    alignItems: "center",
    fontWeight: "bold",
    color: themeStyle.SUCCESS_COLOR,
    fontSize: 28,
  },
  timeValue: {
    color: themeStyle.SUCCESS_COLOR,
    fontWeight: "bold",
    fontSize: themeStyle.FONT_SIZE_XL,
  },
  timeUnit: {
    color: themeStyle.SUCCESS_COLOR,
    fontWeight: "bold",
    fontSize: themeStyle.FONT_SIZE_XL,
  },
  statusText: {
    marginTop: 5,
    fontSize: themeStyle.FONT_SIZE_SM,
    textAlign: "center",
    fontWeight: "500",
  },
});

export default OrderTimer;
