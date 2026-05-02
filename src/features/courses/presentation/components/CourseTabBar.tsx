import React from "react";
import { ScrollView, StyleSheet, TouchableOpacity, View } from "react-native";
import { Text } from "react-native-paper";

import { AppColors } from "@/src/theme/appColors";

export type CourseTabKey = "info" | "categorias" | "evaluaciones" | "miembros";

export const COURSE_TABS: { key: CourseTabKey; label: string }[] = [
  { key: "info", label: "Info" },
  { key: "categorias", label: "Categorías" },
  { key: "evaluaciones", label: "Evaluaciones" },
  { key: "miembros", label: "Miembros" },
];

type Props = {
  activeKey: CourseTabKey;
  onChange: (key: CourseTabKey) => void;
};

export default function CourseTabBar({ activeKey, onChange }: Props) {
  return (
    <View style={styles.wrapper}>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.row}
      >
        {COURSE_TABS.map((tab) => {
          const active = tab.key === activeKey;
          return (
            <TouchableOpacity
              key={tab.key}
              onPress={() => onChange(tab.key)}
              activeOpacity={0.7}
              style={styles.tab}
            >
              <Text style={[styles.label, active && styles.labelActive]}>
                {tab.label}
              </Text>
              <View style={[styles.indicator, active && styles.indicatorActive]} />
            </TouchableOpacity>
          );
        })}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    backgroundColor: "#FFFFFF",
    borderBottomWidth: 1,
    borderBottomColor: AppColors.beige,
  },
  row: {
    paddingHorizontal: 12,
  },
  tab: {
    paddingHorizontal: 16,
    paddingTop: 14,
    alignItems: "center",
  },
  label: {
    fontSize: 14,
    fontWeight: "500",
    color: AppColors.textMuted,
  },
  labelActive: {
    color: AppColors.olive,
    fontWeight: "600",
  },
  indicator: {
    height: 3,
    width: "100%",
    marginTop: 10,
    backgroundColor: "transparent",
    borderTopLeftRadius: 2,
    borderTopRightRadius: 2,
  },
  indicatorActive: {
    backgroundColor: AppColors.olive,
  },
});
