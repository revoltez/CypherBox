import inquirer from "inquirer";
import fs, { mkdir, readFileSync, writeFileSync } from "fs";
import chalk from "chalk";
import path from "path";
import forge from "node-forge";
async function encryptionHandler(encKeyPair) {
	console.log(encKeyPair.publicKey);
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
	let publicKey = forge.pki.publicKeyFromPem(encKeyPair.publicKey);
	if (fs.existsSync(source.path)) {
		let file = readFileSync(source.path);
		let encrypted = publicKey.encrypt(file.toString("binary"));
		let filename = path.basename(source.path);
		writeFileSync(destination.path, encrypted, {
			encoding: "binary",
		}); // must encode in binary and read it in binary in order for it to work
		console.log(chalk.red.bgWhite(filename, "ENCRYPTED"));
	} else {
		console.log(chalk.red("path does not exist"));
	}
}
export { encryptionHandler };
