import React from "react";
import renderer from "react-test-renderer";
import { Text } from "react-native";
import { Button } from "../Button";

describe("Button component (react-test-renderer)", () => {
  it("renders correctly with title", () => {
    const tree = renderer
      .create(
        React.createElement(Button, { title: "Click Me", onPress: () => {} })
      )
      .toJSON();
    expect(tree).toMatchSnapshot();
  });

  it("renders loading indicator when loading is true", () => {
    const tree = renderer
      .create(
        React.createElement(Button, {
          title: "Save",
          onPress: () => {},
          loading: true,
        })
      )
      .toJSON();
    expect(tree).toMatchSnapshot();
  });

  it("renders as disabled when disabled prop is true", () => {
    const tree = renderer
      .create(
        React.createElement(Button, {
          title: "Disabled",
          onPress: () => {},
          disabled: true,
        })
      )
      .toJSON();
    expect(tree).toMatchSnapshot();
  });

  it("renders with icon", () => {
    const Icon = () => React.createElement(Text, null, "icon");
    const tree = renderer
      .create(
        React.createElement(Button, {
          title: "With Icon",
          onPress: () => {},
          icon: React.createElement(Icon),
        })
      )
      .toJSON();
    expect(tree).toMatchSnapshot();
  });

  it("applies fullWidth style", () => {
    const tree = renderer
      .create(
        React.createElement(Button, {
          title: "Full Width",
          onPress: () => {},
          fullWidth: true,
        })
      )
      .toJSON();
    expect(tree).toMatchSnapshot();
  });
});
