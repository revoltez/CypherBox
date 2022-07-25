import chalk from "chalk";
import inquirer from "inquirer";
import forge from "node-forge";
import ora from "ora";
import { spinnerObj } from "./spinner.js";
let ed25519 = forge.pki.ed25519;

function getSigningKeyPair(seed) {
	return ed25519.generateKeyPair({ seed: seed });
}

async function createAccount() {
	try {
		const answer = await inquirer.prompt([
			{
				type: "input",
				name: "password",
				message: "Type a password",
			},
		]);
		const spinner = ora({
			text: "Generating Keys (this might take a while)",
			color: "yellow",
			spinner: "arrow3",
		}).start();
		let seed = Buffer.from(answer.password);
		let signingkeyPair = getSigningKeyPair(seed);
		let encKeyPair = await getRsaKeysFromSeed(seed);
		console.log(encKeyPair);
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
		return {
			name: accountName.accountName,
			value: {
				signingkeyPair,
				encKeyPair,
				name: accountName.accountName,
			},
		};
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
