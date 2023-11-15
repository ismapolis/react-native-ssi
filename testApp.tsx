// shims
import "@sinonjs/text-encoding";
import "react-native-get-random-values";
import "@ethersproject/shims";
import "cross-fetch/polyfill";

// filename: App.tsx
import React, { useEffect, useState } from "react";
import { SafeAreaView, ScrollView, View, Text, Button } from "react-native";

// Import the agent from our earlier setup
import { agent } from "./setup";
// import some data types:
import { IIdentifier } from "@veramo/core";

const App = () => {
  const [identifiers, setIdentifiers] = useState<IIdentifier[]>([]);

  // Remove identifier from state
  const removeIdentifier = async (_id: IIdentifier) => {
    await agent
      .didManagerDelete({ did: _id.did })
      .then(() => {
        const newIdentifiers = identifiers.filter((s) => s !== _id);
        setIdentifiers(newIdentifiers);
      })
      .catch((error) => {
        console.log("Remove Identifier catch: " + error);
      });
  };

  // Add the new identifier to state
  const createIdentifier = async () => {
    await agent
      .didManagerCreate({
        provider: "did:ethr",
        kms: "local",
      })
      .then((_id) => setIdentifiers((s) => s.concat([_id])))
      .catch((error) => console.log("Create Identifier catch: " + error));
  };

  // Check for existing identifers on load and set them to state
  useEffect(() => {
    (async () => {
      try {
        const _ids = await agent.didManagerFind();
        setIdentifiers(_ids);
        console.log(_ids);
      } catch (error) {
        console.log(error);
      }
    })();
  }, []);

  return (
    <SafeAreaView>
      <ScrollView>
        <View style={{ padding: 20 }}>
          <Text style={{ fontSize: 30, fontWeight: "bold" }}>Identifiers</Text>
          <Button
            onPress={() => createIdentifier()}
            title={"Create Identifier"}
          />
          <View style={{ marginBottom: 50, marginTop: 20 }}>
            {identifiers && identifiers.length > 0 ? (
              identifiers.map((id: IIdentifier) => (
                <Button
                  onPress={() => removeIdentifier(id)}
                  title={id.did}
                  key={id.did}
                />
              ))
            ) : (
              <Text>No identifiers created yet</Text>
            )}
          </View>
          <Text style={{ fontSize: 30, fontWeight: "bold" }}>
            Resolved DID document:
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default App;
