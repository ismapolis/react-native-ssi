import * as jose from "jose";
import { ethers } from "ethers";

function hex2base64url(dataHex: any) {
  const buffer = Buffer.from(dataHex, "hex");
  const base64 = buffer.toString("base64");
  const base64url = base64
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=/g, "");
  return base64url;
}

export async function getJWKfromHex(_privKey: any) {
  let privKey = _privKey;

  const s = new ethers.SigningKey(privKey);
  let pubKey = s.publicKey;

  // remove 0x and 0x04 to be used in jose library
  privKey = privKey.replace("0x", "");
  pubKey = pubKey.replace("0x04", "");

  const jwk = await jose.importJWK({
    crv: "secp256k1",
    kty: "EC",
    d: hex2base64url(privKey),
    x: hex2base64url(pubKey),
    y: hex2base64url(pubKey),
  });

  return jwk;
}
