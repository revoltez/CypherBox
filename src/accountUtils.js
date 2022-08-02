import chalk from "chalk";
import { configDirs, initConfigs } from "./configLoader.js";
import JSONfn from "json-fn";
import inquirer from "inquirer";
import forge from "node-forge";
import ora from "ora";
import lodash from "lodash";
import fs, { mkdir, readFileSync, writeFileSync } from "fs";
import { signAndVerifyHandler } from "./signAndVerify.js";
import { spinnerObj } from "./spinner.js";
let ed25519 = forge.pki.ed25519;

function getSigningKeyPair(psw) {
	let seed = Buffer.from(psw, "utf8");
	return ed25519.generateKeyPair({ seed: seed });
}

function getRsaKeysFromSeed(psw) {
	return new Promise((resolve, reject) => {
		const prng = forge.random.createInstance();
		let seedObj = new String(psw);
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
		let signingkeyPair = getSigningKeyPair(answer.password);
		let encKeyPair = await getRsaKeysFromSeed(answer.password);
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
		let acc = lodash.cloneDeep(result.value);

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

async function selectAccount(config) {
	if (config.accounts.length === 0) {
		console.log(chalk.red("there are no Accounts yet"));
	} else {
		let result = await inquirer.prompt([
			{
				type: "list",
				message: "select one the following Accounts",
				name: "account",
				choices: config.accounts,
			},
		]);
		let authenticated = await authenticate(config, result.account);
		if (authenticated) {
			console.log(
				chalk.black.bgGreen(
					"Successfull Authentification"
				)
			);
		} else {
			console.log(chalk.red("bad seed given"));
		}
	}
}

async function checkAuthentication(config) {
	if (config.selectedAccount.signingkeyPair.privateKey === "") {
		console.log(
			chalk.yellow(
				"Authenticate to continue the operation using this account"
			)
		);
		let authenticated = await authenticate(
			config,
			config.selectedAccount
		);
		if (authenticated) {
			console.log(
				chalk.white.bgGreen(
					"Account authenticated successfully"
				)
			);
			await signAndVerifyHandler(
				config.selectedAccount.signingkeyPair
			);
		} else {
			console.log(chalk.red("wrong password privided"));
		}
	} else {
		await signAndVerifyHandler(
			config.selectedAccount.signingkeyPair
		);
	}
}

async function authenticate(config, selected) {
	let result = await inquirer.prompt([
		{
			type: "password",
			message: "Password Required",
			name: "seed",
		},
	]);
	let keyTest = getSigningKeyPair(result.seed);
	if (
		Buffer.compare(
			Buffer.from(selected.signingkeyPair.publicKey),
			Buffer.from(keyTest.publicKey)
		) === 0
	) {
		selected.signingkeyPair = keyTest;
		config.setSelectedAccount(selected);
		return true;
	} else {
		return false;
	}
}

export { checkAuthentication, selectAccount, createAccount, getSigningKeyPair };
