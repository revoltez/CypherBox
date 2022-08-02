#!/usr/bin/env node
import figlet from "figlet";
import chalk from "chalk";
import gradient from "gradient-string";
import inquirer from "inquirer";
import {
	checkAuthentication,
	createAccount,
	selectAccount,
} from "./accountUtils.js";
import { encryptionHandler } from "./encryptionHandler.js";
import { initConfigs } from "./configLoader.js";
import JSONfn from "json-fn";
import forge from "node-forge";
import { decryptionHandler } from "./decryptionHandler.js";
console.log(gradient.pastel.multiline(figlet.textSync("CypherBox")));
console.log("");
console.log(
	chalk.black.bgBlue("CypherBox is a minimalist cryptographic CLI tool")
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
				let result = await createAccount(config);
				homeList();
				break;
			case 2:
				await selectAccount(config);
				homeList();
				break;
			case 3:
				//check if user authenticated to use the Account
				await checkAuthentication(config);
				homeList();
				break;
			case 4:
				await encryptionHandler(
					config.selectedAccount.encKeyPair
				);
				homeList();
				break;
			case 5:
				await decryptionHandler(
					config.selectedAccount.encKeyPair
				);
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
