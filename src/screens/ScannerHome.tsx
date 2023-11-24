import React from "react";
import {
  StyleSheet,
  Text,
  View,
  Button,
  SafeAreaView,
  ScrollView,
} from "react-native";
import { RootStackParamList } from "../../App";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { OpenID4VCIClient } from "@sphereon/oid4vci-client";
import * as jose from "jose";
import { Jwt, ProofOfPossessionCallbacks, Alg } from "@sphereon/oid4vci-common";
import { DIDDocument } from "did-resolver";
import { v4 } from "uuid";
import { agent } from "../../setup";
import { getJWKfromHex } from "../utils";
import { Key } from "@sphereon/ssi-sdk-ext.key-utils";

type Props = NativeStackScreenProps<RootStackParamList, "ScannerHome">;

export default function ScannerHome({ route, navigation }: Props) {
  const [urlText, setUrlText] = React.useState("Issuer URL");
  const [credential, setCredential] = React.useState("undefined");

  React.useEffect(() => {
    if (route.params?.url) {
      setUrlText(route.params.url);
    }
  }, [route.params?.url]);

  const requestCredential = async () => {
    const client = await OpenID4VCIClient.fromURI({
      uri: urlText,
      clientId: "test-clientID",
    });
    const metadata = await client.retrieveServerMetadata();
    console.log(`Server metadata: ${JSON.stringify(metadata)}`);

    const accessToken = await client.acquireAccessToken({
      clientId: "test-clientID",
    });
    console.log(`Access token: ${JSON.stringify(accessToken)}`);

    const options = { type: Key.Secp256k1 };
    const identifier = await agent.didManagerCreate({ options });
    const kid = identifier.keys[0].kid;
    const privateKeyHex = await agent.keyManagerGet({ kid });
    console.log(`PrivateKeyHex: ${privateKeyHex}`);
    const privateKeyJwk = await getJWKfromHex(privateKeyHex);

    async function signCallback(args: Jwt, kid?: string): Promise<string> {
      if (!args.payload.aud) {
        throw Error("aud required");
      } else if (!kid) {
        throw Error("kid required");
      }
      return await new jose.SignJWT({ ...args.payload })
        .setProtectedHeader({
          alg: args.header.alg,
          kid,
          typ: "openid4vci-proof+jwt",
        })
        .setIssuedAt()
        .setIssuer(kid)
        .setAudience(args.payload.aud)
        .setExpirationTime("2h")
        .sign(privateKeyJwk);
    }
    const callbacks: ProofOfPossessionCallbacks<DIDDocument> = {
      signCallback: signCallback,
    };

    // 5. Request credential
    const credentialResponse = await client.acquireCredentials({
      credentialTypes: "GuestCredential",
      proofCallbacks: callbacks,
      format: "jwt_vc_json",
      alg: Alg.ES256K,
      kid,
      jti: v4(),
    });
    setCredential(JSON.stringify(credentialResponse.credential));
  };

  return (
    <SafeAreaView>
      <ScrollView>
        <View style={styles.container}>
          <Button title="Scan" onPress={() => navigation.navigate("Scanner")} />
          <Text style={{ fontSize: 30, fontWeight: "bold" }}>Scanned QR</Text>
          <Text>{urlText}</Text>
        </View>
        <View style={styles.container}>
          <Button
            title="Request credential"
            onPress={() => requestCredential()}
          />
          <Text style={{ fontSize: 30, fontWeight: "bold" }}>
            Credential token
          </Text>
          <Text>{credential}</Text>
        </View>
      </ScrollView>
    </SafeAreaView>
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
