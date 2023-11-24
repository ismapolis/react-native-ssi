import "reflect-metadata"; // needed for migrations
import "@ethersproject/shims";
import "react-native-gesture-handler";
import crypto from "isomorphic-webcrypto";
// if (typeof BigInt === 'undefined') global.BigInt = require('big-integer')
import { registerRootComponent } from "expo";

import App from "./App";

(async () => {
  // Only needed for crypto.getRandomValues
  // but only wait once, future calls are secure
  await crypto.ensureSecure();
  const array = new Uint8Array(1);
  crypto.getRandomValues(array);
  const safeValue = array[0];
})();

// registerRootComponent calls AppRegistry.registerComponent('main', () => App);
// It also ensures that whether you load the app in Expo Go or in a native build,
// the environment is set up appropriately
registerRootComponent(App);
