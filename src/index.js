import figlet from "figlet";
import chalk from "chalk";
import gradient from "gradient-string";
import inquirer from "inquirer";
import { getSigningKeyPair, createAccount } from "./accountUtils.js";
import { signAndVerifyHandler } from "./signAndVerify.js";
import { encryptionHandler } from "./encryptionHandler.js";
import isEqual from "arraybuffer-equal";
import { configDirs, initConfigs } from "./configLoader.js";
import fs, { mkdir, readFileSync, writeFileSync } from "fs";

console.log(gradient.pastel.multiline(figlet.textSync("CypherBox")));
console.log("");
console.log(
	chalk.black.bgBlue("CypherBox is a minimalistic cryptographic CLI tool")
);

//retireive accounts from .config/cypherBox/accounts/
let config = {
	accounts: [],
	selectedAccount: "",
	setSelectedAccount(acc) {
		console.log(chalk.greenBright(acc.name, " selected"));
		this.selectedAccount = acc;
	},
};

(function () {
	initConfigs(config);
})();

async function homeList() {
	try {
		const choice = await inquirer.prompt([
			{
				type: "list",
				message: "choose one of the following options",
				name: "generalChoice",
				choices: [
					{
						value: 1,
						name: "Create a new Account",
					},
					{
						value: 2,
						name: "Select Account",
					},
					{ value: 3, name: "Sign & Verify" },
					{ value: 4, name: "Encrypt" },
					{ value: 5, name: "Decrypt" },
				],
			},
		]);
		handleChoice(choice);
	} catch (error) {
		console.log("something went wrong", error);
	}
}
homeList();
async function handleChoice(answers) {
	try {
		switch (answers.generalChoice) {
			case 1:
				let result = await createAccount();
				let acc = {
					name: result.name,
					signingkeyPairkey:
						result.value.signingkeyPair,
					encKeyPair: result.value.encKeyPair,
				};
				config.setSelectedAccount(acc);
				result.value.signingkeyPair.privateKey = "";
				result.value.encKeyPair.privateKey = "";
				config.accounts.push(result);
				let output = JSON.stringify(config.accounts);
				writeFileSync(configDirs.accountsPath, output);
				homeList();
				break;
			case 2:
				if (config.accounts.length === 0) {
					console.log(
						chalk.red(
							"there are no Accounts yet"
						)
					);
				} else {
					let result = await inquirer.prompt([
						{
							type: "list",
							message: "select one the following Accounts",
							name: "account",
							choices: config.accounts,
						},
					]);
					let authenticated = await authenticate(
						result.account
					);
					if (authenticated) {
						console.log(
							chalk.black.bgGreen(
								"Successfull Authentification"
							)
						);
					} else {
						console.log(
							chalk.red(
								"bad seed given"
							)
						);
					}
				}
				homeList();
				break;
			case 3:
				if (
					config.selectedAccount.signingkeyPair
						.privateKey === ""
				) {
					console.log(
						chalk.yellow(
							"Authenticate to continue the operation using this account"
						)
					);
					let authenticated = await authenticate(
						config.selectedAccount
					);
					if (authenticated) {
						console.log(
							chalk.black.bgGreen(
								"Account authenticated successfully"
							)
						);
						await signAndVerifyHandler(
							config.selectedAccount
								.signingkeyPair
						);
					} else {
						console.log(
							chalk.red(
								"wrong password privided"
							)
						);
					}
				} else {
					await signAndVerifyHandler(
						config.selectedAccount
							.signingkeyPair
					);
				}
				homeList();
				break;
			case 4:
				homeList();
				break;
			case 5:
				homeList();
				break;
			case 6:
				homeList();
				break;
		}
	} catch (error) {
		if (error.isTtyError) {
			console.log("error in tty", error);
		} else {
			console.log("something went wrong", error);
		}
	}
}

async function authenticate(selected) {
	let result = await inquirer.prompt([
		{
			type: "input",
			message: "Password Required",
			name: "seed",
		},
	]);
	let seed = Buffer.from(result.seed, "utf8");
	let keyTest = getSigningKeyPair(seed);
	if (
		Buffer.compare(
			Buffer.from(selected.signingkeyPair.publicKey),
			Buffer.from(keyTest.publicKey)
		) === 0
	) {
		selected.signingkeyPair.privateKey = keyTest.privateKey;
		config.setSelectedAccount(selected);
		return true;
	} else {
		return false;
	}
}
