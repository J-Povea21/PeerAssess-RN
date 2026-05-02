import React from "react";
import { render, screen } from "@testing-library/react-native";

jest.mock("expo-linear-gradient", () => ({
  LinearGradient: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}));

jest.mock("react-native-svg", () => {
  const { View } = require("react-native");
  return {
    Svg: ({ children }: { children: React.ReactNode }) => <View>{children}</View>,
    Circle: () => <View />,
  };
});

import SplashScreen from "@/src/features/auth/presentation/screens/SplashScreen";

describe("SplashScreen", () => {
  it("renders without crashing", () => {
    const { toJSON } = render(<SplashScreen />);
    expect(toJSON()).toBeTruthy();
  });

  it("shows the PeerAssess title", () => {
    render(<SplashScreen />);
    expect(screen.getByText("PeerAssess")).toBeTruthy();
  });
});
