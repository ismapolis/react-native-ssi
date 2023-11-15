import { StatusBar } from "expo-status-bar";
import React from "react";
import { StyleSheet, Text, View, Button } from "react-native";
import Scanner from "./src/screens/Scanner";
import {
  StackNavigationProp,
  createStackNavigator,
} from "@react-navigation/stack";
import Home from "./src/screens/Home";
import ScannerHome from "./src/screens/ScannerHome";

import { NavigationContainer } from "@react-navigation/native";
import { NativeStackScreenProps } from "@react-navigation/native-stack";

export type RootStackParamList = {
  Scanner: undefined;
  ScannerHome: { url: any } | undefined;
  Home: undefined;
};

const Stack = createStackNavigator<RootStackParamList>();

export type StackNavigation = StackNavigationProp<RootStackParamList>;

function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="ScannerHome">
        <Stack.Screen name="Home" component={Home} />
        <Stack.Screen name="Scanner" component={Scanner} />
        <Stack.Screen name="ScannerHome" component={ScannerHome} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    alignItems: "center",
    justifyContent: "center",
  },
});

export default App;
