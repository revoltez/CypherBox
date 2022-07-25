import inquirer from "inquirer";
import chalk from "chalk";
async function encryptionList() {
	return await inquirer.prompt([
		{
			type: "list",
			message: "select encryption service",
			name: "choice",
			choices: [
				{
					name: "Enter Text from prompt",
					value: 1,
				},
				{ name: "Pass path to encrypt", value: 2 },
			],
		},
	]);
}

async function encryptionHandler(config) {
	let result = await encryptionList();
	console.log(result);
	switch (result.choice) {
		case 1:
			console.log(
				chalk.greenBright(
					"Encryption succesfull, check Outbox"
				)
			);
			break;
	}
}
export { encryptionHandler };
