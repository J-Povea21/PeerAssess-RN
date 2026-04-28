import React from "react";
import { StyleSheet, View, ViewStyle } from "react-native";
import { Circle, Svg } from "react-native-svg";

import { AppColors } from "@/src/theme/appColors";

type Props = {
  size?: number;
  style?: ViewStyle;
};

export default function LogoBox({ size = 100, style }: Props) {
  const svgSize = size * 0.6;

  return (
    <View
      style={[
        styles.box,
        { width: size, height: size, borderRadius: size * 0.24 },
        style,
      ]}
    >
      <Svg width={svgSize} height={svgSize} viewBox="0 0 50 50">
        <Circle cx={18} cy={18} r={10} stroke="white" strokeWidth={3} fill="none" />
        <Circle cx={32} cy={18} r={10} stroke="white" strokeWidth={3} fill="none" />
        <Circle cx={25} cy={32} r={10} stroke="white" strokeWidth={3} fill="none" />
      </Svg>
    </View>
  );
}

const styles = StyleSheet.create({
  box: {
    backgroundColor: `${AppColors.olive}D9`,
    justifyContent: "center",
    alignItems: "center",
  },
});
