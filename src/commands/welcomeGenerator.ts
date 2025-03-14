import {User} from "discord.js";
import {sendMessage} from "./sendMessage";

export function welcomeGenerator(user: User): void {
	sendMessage(`Bienvenue sur le serveur, <@${user.id}> !`, process.env.WELCOME_CHANNEL);
}