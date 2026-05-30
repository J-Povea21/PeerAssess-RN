import React from "react";
import { ScrollView, StyleSheet, TouchableOpacity, View } from "react-native";
import { Text } from "react-native-paper";

import { AppColors } from "@/src/theme/appColors";

export type BarDatum = {
  key: string;
  label: string;
  value: number; // expected on the 2–5 scale
  highlight?: boolean; // e.g. equity-alert groups
};

type Props = {
  data: BarDatum[];
  onBarPress?: (key: string) => void;
  maxValue?: number;
};

const CHART_HEIGHT = 150;
const BAR_SLOT_WIDTH = 64;

// Lightweight bar chart built from native views (no chart dependency) so each bar
// is a reliable tap target. Bars scroll horizontally when a course has many groups.
export default function GroupBarChart({ data, onBarPress, maxValue = 5 }: Props) {
  if (data.length === 0) return null;

  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.row}
    >
      {data.map((d) => {
        const ratio = Math.max(0, Math.min(d.value / maxValue, 1));
        const barHeight = Math.max(4, ratio * CHART_HEIGHT);
        return (
          <TouchableOpacity
            key={d.key}
            style={styles.slot}
            activeOpacity={0.7}
            onPress={() => onBarPress?.(d.key)}
          >
            <Text style={styles.value}>{d.value.toFixed(1)}</Text>
            <View style={styles.track}>
              <View
                style={[
                  styles.bar,
                  { height: barHeight },
                  d.highlight ? styles.barAlert : styles.barNormal,
                ]}
              />
            </View>
            <Text style={styles.label} numberOfLines={1}>
              {d.label}
            </Text>
          </TouchableOpacity>
        );
      })}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  row: {
    paddingVertical: 8,
    paddingHorizontal: 4,
    alignItems: "flex-end",
  },
  slot: {
    width: BAR_SLOT_WIDTH,
    alignItems: "center",
  },
  value: {
    fontSize: 12,
    fontWeight: "700",
    color: AppColors.textDark,
    marginBottom: 4,
  },
  track: {
    height: CHART_HEIGHT,
    justifyContent: "flex-end",
  },
  bar: {
    width: 34,
    borderTopLeftRadius: 6,
    borderTopRightRadius: 6,
  },
  barNormal: {
    backgroundColor: AppColors.olive,
  },
  barAlert: {
    backgroundColor: AppColors.rose,
  },
  label: {
    fontSize: 11,
    color: AppColors.textMuted,
    marginTop: 6,
    textAlign: "center",
    maxWidth: BAR_SLOT_WIDTH,
  },
});
