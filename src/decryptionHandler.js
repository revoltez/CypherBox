import inquirer from "inquirer";
import fs, { mkdir, readFileSync, writeFileSync } from "fs";
import chalk from "chalk";
import path from "path";
import forge from "node-forge";
async function decryptionHandler(encKeyPair) {
	let source = await inquirer.prompt([
		{
			type: "input",
			name: "path",
			message: "file path:",
		},
	]);
	let destination = await inquirer.prompt([
		{
			type: "input",
			name: "path",
			message: "Destination path:",
		},
	]);
	let result = await inquirer.prompt([
		{
			type: "password",
			name: "password",
			message: "Private Key Protected by Password:",
		},
	]);

	let privateKey = forge.pki.decryptRsaPrivateKey(
		encKeyPair.privateKey,
		result.password
	);
	if (fs.existsSync(source.path)) {
		let file = readFileSync(source.path);
		let decrypted = privateKey.decrypt(file.toString("binary"));
		let filename = path.basename(source.path);
		writeFileSync(destination.path, decrypted);
		console.log(chalk.greenBright.bgBlack(filename, "DECRYPTED"));
	} else {
		console.log(chalk.red("path does not exist"));
	}
}
export { decryptionHandler };
