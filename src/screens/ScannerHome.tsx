import { StatusBar } from "expo-status-bar";
import React from "react";
import { StyleSheet, Text, View, Button, SafeAreaView } from "react-native";

import { useNavigation } from "@react-navigation/native";
import { RootStackParamList, StackNavigation } from "../../App";
import { NativeStackScreenProps } from "@react-navigation/native-stack";

type Props = NativeStackScreenProps<RootStackParamList, "ScannerHome">;

export default function ScannerHome({ route, navigation }: Props) {
  const [urlText, setUrlText] = React.useState("Issuer URL");

  React.useEffect(() => {
    if (route.params?.url) {
      setUrlText(route.params.url);
    }
  }, [route.params?.url]);

  return (
    <View style={styles.container}>
      <Button title="Scan" onPress={() => navigation.navigate("Scanner")} />
      <Text style={{ fontSize: 30, fontWeight: "bold" }}>Scanned QR</Text>
      <Text>{urlText}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    alignItems: "baseline",
    justifyContent: "center",
  },
});
