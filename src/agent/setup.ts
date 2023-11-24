// filename: setup.ts

// imports:
// Core interfaces
import {
  createAgent,
  IDataStore,
  IDataStoreORM,
  IDIDManager,
  IKeyManager,
  IResolver,
} from "@veramo/core";

// Core identity manager plugin. This allows you to create and manage DIDs by orchestrating different DID provider packages.
// This implements `IDIDManager`
import { DIDManager } from "@veramo/did-manager";

import {
  SphereonKeyManager,
  AbstractKeyStore,
  AbstractPrivateKeyStore,
} from "@sphereon/ssi-sdk-ext.key-manager";

// This plugin allows us to create and manage `did:ethr` DIDs. (used by DIDManager)
import { EthrDIDProvider } from "@veramo/did-provider-ethr";

import { JwkDIDProvider } from "@sphereon/ssi-sdk-ext.did-provider-jwk";

// A key management system that uses a local database to store keys (used by KeyManager)
import { SecretBox } from "@veramo/kms-local";

import { SphereonKeyManagementSystem } from "@sphereon/ssi-sdk-ext.kms-local";

// Storage plugin using TypeORM to link to a database
import {
  Entities,
  KeyStore,
  DIDStore,
  migrations,
  PrivateKeyStore,
} from "@veramo/data-store";

// Core DID resolver plugin. This plugin orchestrates different DID resolver drivers to resolve the corresponding DID Documents for the given DIDs.
// This plugin implements `IResolver`
import { DIDResolverPlugin } from "@veramo/did-resolver";

// the did:web resolver package
import { getResolver as webDidResolver } from "web-did-resolver";

// TypeORM is installed with '@veramo/data-store'
import { DataSource } from "typeorm";
import { getDbConnection } from "../services/databaseService";
import { DB_CONNECTION_NAME } from "../@config/database";
import { OrPromise } from "@veramo/utils";

// filename: setup.ts

// ... imports

// CONSTANTS
// You will need to get a project ID from infura https://www.infura.io
const INFURA_PROJECT_ID = "3586660d179141e3801c3895de1c2eba";

// This is a raw X25519 private key, provided as an example.
// You can run `npx @veramo/cli config create-secret-key` in a terminal to generate a new key.
// In a production app, this MUST NOT be hardcoded in your source code.
const DB_ENCRYPTION_KEY =
  "29739248cad1bd1a0fc4d9b75cd4d2990de535baf5caadfdf8d8f86664aa830c";

// DB setup:

const dbConnection: OrPromise<DataSource> = getDbConnection(DB_CONNECTION_NAME);
const privateKeyStore = new PrivateKeyStore(
  dbConnection,
  new SecretBox(DB_ENCRYPTION_KEY)
);

// we need to overwrite the import values because sphereon is using the old ones
(privateKeyStore as unknown as AbstractPrivateKeyStore).import =
  privateKeyStore.importKey;
(privateKeyStore as unknown as AbstractPrivateKeyStore).get =
  privateKeyStore.getKey;
(privateKeyStore as unknown as AbstractPrivateKeyStore).delete =
  privateKeyStore.deleteKey;
(privateKeyStore as unknown as AbstractPrivateKeyStore).list =
  privateKeyStore.listKeys;
const store = new KeyStore(dbConnection);
(store as unknown as AbstractKeyStore).get = store.getKey;
(store as unknown as AbstractKeyStore).import = store.importKey;
(store as unknown as AbstractKeyStore).delete = store.deleteKey;
(store as unknown as AbstractKeyStore).list = store.listKeys;

// ... imports & CONSTANTS & DB setup

// Veramo agent setup
export const agent = createAgent<
  IDIDManager & IKeyManager & IDataStore & IDataStoreORM & IResolver
>({
  plugins: [
    new SphereonKeyManager({
      store: store as unknown as AbstractKeyStore,
      kms: {
        local: new SphereonKeyManagementSystem(
          privateKeyStore as unknown as AbstractPrivateKeyStore
        ),
      },
    }),
    new DIDManager({
      store: new DIDStore(dbConnection),
      defaultProvider: "did:jwk",
      providers: {
        "did:ethr:goerli": new EthrDIDProvider({
          defaultKms: "local",
          network: "goerli",
          name: "goerli",
          rpcUrl: "https://goerli.infura.io/v3/" + INFURA_PROJECT_ID,
          gas: 1000001,
          ttl: 31104001,
        }),
        "did:jwk": new JwkDIDProvider({ defaultKms: "local" }),
      },
    }),
    new DIDResolverPlugin({
      ...webDidResolver(), // and `did:web`
    }),
  ],
});
