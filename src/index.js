import figlet from "figlet";
import chalk from "chalk";
import gradient from "gradient-string";
import inquirer from "inquirer";
import forge from "node-forge";
import { generateKeyPair } from "./genKeyPair.js";
import { encryptionHandler } from "./encryptionHandler.js";
console.log(gradient.pastel.multiline(figlet.textSync("CypherBox")));
console.log("");
console.log(chalk.blue("CypherBox is a minimalistic cryptographic CLI tool"));

//retireive keys from .config/cypherBox/keys/
let config = {
	keys: [],
	selectedAccount: "",
	setSelectedAccount() {
		this.selectedAccount = this.keys[0];
	},
};

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
				let result = await generateKeyPair();
				config.keys.push(result);
				homeList();
				break;
			case 2:
				if (config.keys.length === 0) {
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
							choices: keys,
						},
					]);
					console.log(
						chalk.greenBright(
							result.account.name,
							" selected"
						)
					);
					config.selectedAccount = result.account;
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
