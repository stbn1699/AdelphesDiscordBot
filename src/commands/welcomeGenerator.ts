import {User} from "discord.js";
import {sendMessage} from "./sendMessage";

export function welcomeGenerator(user: User): void {
	sendMessage(`Bienvenue sur le serveur, <@${user.id}> !\nn'hésite pas a aller visiter le salon <#${process.env.ROLES_CHANNEL}> afin de t'attriber une couleur et des pronoms!`, process.env.WELCOME_CHANNEL);
}