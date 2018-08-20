import React from "react";
import { Text, TouchableOpacity } from "react-native";

const Button = ({ onPress, children }) => {
  const { buttonStyle, textStyle } = styles;

  return (
    <TouchableOpacity onPress={onPress} style={buttonStyle}>
      <Text style={textStyle}>{children}</Text>
    </TouchableOpacity>
  );
};

const styles = {
  textStyle: {
    alignSelf: "center",
    fontSize: 16,
    paddingTop: 5,
    paddingBottom: 5
  },
  buttonStyle: {
    borderWidth: 1,
    width: 150,
    height: 50,
    alignItems: `center`,
    justifyContent: `center`
  }
};

export default Button;
