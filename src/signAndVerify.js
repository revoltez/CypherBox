import { configDirs } from "./configLoader.js";
import forge from "node-forge";
import fs, { mkdir, readFileSync, writeFileSync } from "fs";
import inquirer from "inquirer";
import chalk from "chalk";
import os from "os";
import path from "path";
import { config } from "process";

let ed25519 = forge.pki.ed25519;

async function signAndVerifyHandler(signingkeyPair) {
	let result = await inquirer.prompt([
		{
			type: "list",
			message: "Select option",
			name: "choice",
			choices: [
				{
					name: "Sign",
					value: 1,
				},
				{ name: "Verify", value: 2 },
			],
		},
	]);
	switch (result.choice) {
		case 1:
			let result = await inquirer.prompt([
				{
					type: "input",
					message: "provide the path of the file(s)",
					name: "path",
				},
			]);
			sign(result.path, signingkeyPair.privateKey);
			break;
		case 2:
			let input = await inquirer.prompt([
				{
					type: "input",
					message: "provide the path of the file",
					name: "path",
				},
			]);
			let input2 = await inquirer.prompt([
				{
					type: "input",
					message: "provide the path of the signature",
					name: "sigpath",
				},
			]);

			verify(
				input.path,
				input2.sigpath,
				signingkeyPair.publicKey
			);
			break;
	}
}

function sign(filePath, prvKey) {
	if (fs.existsSync(filePath)) {
		let file = readFileSync(filePath);
		let signature = ed25519.sign({
			message: Buffer.from(file, "binary"),
			privateKey: prvKey,
		});
		let filename = path.basename(filePath);
		let sigpath = filePath + ".signed";
		writeFileSync(sigpath, signature);
		console.log(
			chalk.black.greenBright("File Signed Successfully")
		);
	} else {
		console.log(
			chalk.red(
				"Please provide a valid path for the files you want to sign"
			)
		);
	}
}

function verify(filePath, sigPath, pubKey) {
	if (fs.existsSync(filePath) && fs.existsSync(sigPath)) {
		let file = readFileSync(filePath);
		let sig = readFileSync(sigPath);
		let verified = ed25519.verify({
			message: Buffer.from(file, "binary"),
			signature: sig,
			publicKey: pubKey,
		});
		if (verified) {
			console.log(chalk.blue("File Authentic"));
		} else {
			console.log(
				chalk.red(
					"Signature or file has been tempered with"
				)
			);
		}
	} else {
		console.log(
			chalk.red(
				"Please provide a valid path for the files you want to sign"
			)
		);
	}
}
export { sign, verify, signAndVerifyHandler };
