import chalk from "chalk";
import { configDirs, initConfigs } from "./configLoader.js";
import JSONfn from "json-fn";
import inquirer from "inquirer";
import forge from "node-forge";
import ora from "ora";
import lodash from "lodash";
import fs, { mkdir, readFileSync, writeFileSync } from "fs";
import { spinnerObj } from "./spinner.js";
let ed25519 = forge.pki.ed25519;

function getSigningKeyPair(seed) {
	return ed25519.generateKeyPair({ seed: seed });
}

async function createAccount(config) {
	try {
		const answer = await inquirer.prompt([
			{
				type: "password",
				name: "password",
				message: "Type a password",
			},
		]);
		const spinner = ora({
			text: "Generating Keys (this might take a while)",
			color: "yellow",
			spinner: "arrow3",
		}).start();
		let seed = Buffer.from(answer.password, "utf8");
		let signingkeyPair = getSigningKeyPair(seed);
		let encKeyPair = await getRsaKeysFromSeed(seed);
		encKeyPair.publicKey = forge.pki.publicKeyToPem(
			encKeyPair.publicKey
		);
		encKeyPair.privateKey = forge.pki.encryptRsaPrivateKey(
			encKeyPair.privateKey,
			answer.password
		);
		spinner.succeed("Keys Generated Successfully");
		const accountName = await inquirer.prompt([
			{
				type: "input",
				name: "accountName",
				message: "give this key pair for future selection",
				default:
					"Account:" +
					Math.floor(Math.random() * 10000),
			},
		]);
		let result = {
			name: accountName.accountName,
			value: {
				signingkeyPair,
				encKeyPair,
				name: accountName.accountName,
			},
		};
		let acc = {
			name: result.name,
			signingkeyPair: lodash.cloneDeep(
				result.value.signingkeyPair
			),
			encKeyPair: lodash.cloneDeep(result.value.encKeyPair),
		};

		config.setSelectedAccount(acc);
		result.value.signingkeyPair.privateKey = "";
		config.accounts.push(result);
		let output = JSONfn.stringify(config.accounts);
		writeFileSync(configDirs.accountsPath, output);
	} catch (error) {
		if (error.isTtyError) {
			console.log("tty error");
			// Prompt couldn't be rendered in the current environment
		} else {
			console.log("something went wrong", error);
			// Something else went wrong
		}
	}
}
function getRsaKeysFromSeed(seed) {
	return new Promise((resolve, reject) => {
		const prng = forge.random.createInstance();
		let seedObj = new String(seed);
		prng.seedFileSync = () => seedObj.toString("hex");
		forge.pki.rsa.generateKeyPair(
			{
				bits: 4096,
				prng,
				workers: -1,
			},
			function (err, keypair) {
				resolve(keypair);
			}
		);
	});
}
export { createAccount, getSigningKeyPair };
