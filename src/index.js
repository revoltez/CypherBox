import figlet from "figlet";
import chalk from "chalk";
import gradient from "gradient-string";
import inquirer from "inquirer";
import forge from "node-forge";
import { getSigningKeyPair, createAccount } from "./accountUtils.js";
import { encryptionHandler } from "./encryptionHandler.js";
import isEqual from "arraybuffer-equal";

console.log(gradient.pastel.multiline(figlet.textSync("CypherBox")));
console.log("");
console.log(chalk.blue("CypherBox is a minimalistic cryptographic CLI tool"));

//retireive accounts from .config/cypherBox/accounts/
let config = {
	accounts: [],
	selectedAccount: "",
	setSelectedAccount(acc) {
		console.log(chalk.greenBright(acc.name, " selected"));
		this.selectedAccount = acc;
	},
};

function init() {
	//check if settings exist and load them
}

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
					{ value: 3, name: "Encrypt" },
					{ value: 4, name: "Decrypt" },
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
				//append new json value to accounts file
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
						result
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
				await encryptionHandler(config);
				homeList();
				break;
			case 4:
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
			message: "enter the appropriate seed phrase",
			name: "seed",
		},
	]);
	let seed = Buffer.from(result.seed);
	let keyTest = getSigningKeyPair(seed);
	if (
		isEqual(
			selected.account.signingkeyPair.publicKey.Buffer,
			keyTest.publicKey.Buffer
		)
	) {
		selected.account.signingkeyPair.privateKey = keyTest.privateKey;
		config.setSelectedAccount(selected.account);
		return true;
	} else {
		return false;
	}
}
