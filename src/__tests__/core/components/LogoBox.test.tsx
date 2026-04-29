import React from "react";
import { render } from "@testing-library/react-native";

jest.mock("react-native-svg", () => {
  const { View } = require("react-native");
  return {
    Svg: ({ children }: { children: React.ReactNode }) => <View>{children}</View>,
    Circle: () => <View />,
  };
});

import LogoBox from "@/src/core/components/LogoBox";

describe("LogoBox", () => {
  it("renders without crashing with default size", () => {
    const { toJSON } = render(<LogoBox />);
    expect(toJSON()).toBeTruthy();
  });

  it("renders without crashing with custom size", () => {
    const { toJSON } = render(<LogoBox size={60} />);
    expect(toJSON()).toBeTruthy();
  });
});
