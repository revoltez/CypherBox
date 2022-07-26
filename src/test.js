import forge from "node-forge";
import fs, { mkdir, readFileSync, writeFileSync } from "fs";
import os from "os";
import path from "path";

let ED25519 = forge.pki.ed25519;

var password = "Mai9ohgh6ahxee0jutheew0pungoozil";
var seed = Buffer.from(password, "utf8");
var { publicKey, privateKey } = ED25519.generateKeyPair({ seed: seed });

var md = forge.md.sha256.create();
md.update("test", "utf8");
/*var signature = ED25519.sign({
	md: md,
	privateKey: privateKey,
});
*/
let signature = readFileSync("/home/ezio/vim.txt.signed");
let file = readFileSync("/home/ezio/vim.txt");
var verified = ED25519.verify({
	// also accepts a forge ByteBuffer or Uint8Array
	message: file,
	// node.js Buffer, Uint8Array, forge ByteBuffer, or binary string
	signature: signature,
	// node.js Buffer, Uint8Array, forge ByteBuffer, or binary string
	publicKey: publicKey,
});
console.log("verfiied", verified);
