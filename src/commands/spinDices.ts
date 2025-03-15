import {sendMessage} from "./sendMessage";
import {getCurrentInteraction} from "../index";
import {Interaction} from "discord.js";

export function spinDice(rawDicesParams: string): string {
	let message: string = "# Lancé de dés";
	let allvalues: number[] = [];
	const userDices: string[] = rawDicesParams.toLowerCase().split(" ");
	const interaction: Interaction | null = getCurrentInteraction();

	let diceNumber: number = 0;
	let numberOfDices: number = 0;
	userDices.forEach((dice) => {
		const diceParam: string[] = dice.split("d");
		numberOfDices = numberOfDices + parseInt(diceParam[0]);
	});

	if (numberOfDices <= 30000) {
		userDices.forEach((dice) => {
			const diceParam: string[] = dice.split("d");
			const diceCount: number = parseInt(diceParam[0]);
			const diceType: number = parseInt(diceParam[1]);
			let specificDiceValues: number[] = [];

			if (diceCount == 1) {
				message = `${message} \n## Lancer de ${diceCount} dé de ${diceType} faces\n`;
			} else {
				message = `${message} \n## Lancer de ${diceCount} dés de ${diceType} faces\n`;
			}

			for (let i = 0; i < diceCount; i++) {
				const diceValue = Math.floor(Math.random() * diceType) + 1;
				allvalues = [...allvalues, diceValue];
				specificDiceValues = [...specificDiceValues, diceValue];
				diceNumber++;
				console.log(`Dé ${diceNumber}/${numberOfDices}`);
			}

			if (diceCount > 1) {
				const diceTotal = specificDiceValues.reduce((a, b) => a + b, 0);
				message = `${message} \nvaleurs tirées : ${specificDiceValues.join(", ")}\nTotal des dés ${diceType} = ${diceTotal}`;
			} else {
				message = `${message} \nvaleur tirée : ${specificDiceValues[0]}`;
			}
		});
	} else {
		message = `\nTrop de dés demandés, merci de ne pas dépasser 30'000 dés`;
	}
	const total = allvalues.reduce((a, b) => a + b, 0);
	message = `${message} \n\n\nTotal = ${total}`;
	return message
}