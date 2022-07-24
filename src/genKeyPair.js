import chalk from "chalk";
import inquirer from "inquirer";
import forge from "node-forge";

async function generateKeyPair() {
	try {
		let ed25519 = forge.pki.ed25519;
		const answer = await inquirer.prompt([
			{
				type: "input",
				name: "password",
				message: "Enter seed phrase and memorise it",
			},
		]);
		var seed = Buffer.from(answer.password);
		var keypair = ed25519.generateKeyPair({ seed: seed });
		console.log(chalk.greenBright("KeyPair Generated succesfully"));
		const keyName = await inquirer.prompt([
			{
				type: "input",
				name: "keyname",
				message: "give this key pair for future selection",
				default:
					"Account:" +
					Math.floor(Math.random() * 10000),
			},
		]);
		return {
			name: keyName.keyname,
			value: { keypair, name: keyName.keyname },
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

export { generateKeyPair };
