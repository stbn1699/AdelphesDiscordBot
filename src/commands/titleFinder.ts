import {Message} from "discord.js";

export async function titleFinder(message: Message): Promise<void> {

	const apiKey = "AIzaSyCIu-oi0iifdQvlyhO3lZsPPwzKeLpN1FE";
	const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent?key=${apiKey}`;
	const introduction = "tu est le roi du jeu titre, le jeu qui consiste a dire \"titre\" si la phrase peut être un titre de film pornographique. \n\nle message suivant est celui d'un utilisateur discord. tu dois répondre uniquement et seulement par true ou false en fonction de si une des phrases de ce message peut être un titre ou non : ";

	const fullMessage = `${introduction}${message.content}`;

	try {
		const res = await fetch(url, {
			method: "POST",
			headers: {
				"Content-Type": "application/json"
			},
			body: JSON.stringify({
				contents: [
					{
						parts: [
							{
								text: fullMessage
							}
						]
					}
				]
			})
		});
		if (!res.ok) {
			throw new Error(`HTTP error! status: ${res.status}`);
		}
		const data = await res.json();
		const textResponse = data.candidates[0].content.parts[0].text;
		if (textResponse.trim().toLowerCase() == "true") {
			message.reply("titre");
			console.log("titre yay");
		}
		console.log(textResponse);
	} catch (error) {
		console.error("Erreur:", error);
	}
}
