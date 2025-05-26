import * as React from "react";
import renderer from "react-test-renderer";

// Hanya mock useColorScheme, bukan seluruh react-native
import * as ReactNative from "react-native";
jest.spyOn(ReactNative, "useColorScheme").mockReturnValue("light");

import { ThemedText } from "../ThemedText";

describe("ThemedText", () => {
  it("renders correctly with default props", () => {
    const tree = renderer
      .create(<ThemedText>Snapshot test!</ThemedText>)
      .toJSON();
    expect(tree).toMatchSnapshot();
  });

  it('renders with type="title"', () => {
    const tree = renderer
      .create(<ThemedText type='title'>Title</ThemedText>)
      .toJSON();
    expect(tree).toMatchSnapshot();
  });

  it("renders with custom lightColor", () => {
    const tree = renderer
      .create(<ThemedText lightColor='#ff0000'>Red Text</ThemedText>)
      .toJSON();
    expect(tree).toMatchSnapshot();
  });

  it("renders with style prop", () => {
    const tree = renderer
      .create(<ThemedText style={{ fontSize: 30 }}>Styled Text</ThemedText>)
      .toJSON();
    expect(tree).toMatchSnapshot();
  });
});
