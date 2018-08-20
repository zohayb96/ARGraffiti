import React, { Component } from 'react';
import { createStackNavigator } from 'react-navigation';
import { Provider } from 'react-redux';
import CameraView from './components/CameraView';

const RootNavigator = createStackNavigator({
  Main: {
    screen: CameraView,
    navigationOptions: ({ navigation }) => ({
      header: null,
      title: `GraftAR`,
    }),
  },
});

export default class App extends Component {
  render() {
    return <RootNavigator />;
  }
}
