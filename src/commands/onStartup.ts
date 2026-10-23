import * as fs from "node:fs";
import {TicketSave} from "../models/TicketSave";
import {generalValues} from "./generalValues";
import path from "node:path";
import {dataPath} from "../utils/dataPath";
import {Client} from "discord.js";

export async function onStartup(client: Client): Promise<void> {
	const ticketsDataPath = dataPath("ticketsData.json");
	const ticketsDataDir = path.dirname(ticketsDataPath);

	// Ensure the directory exists
	if (!fs.existsSync(ticketsDataDir)) {
		fs.mkdirSync(ticketsDataDir, { recursive: true });
	}

	// Check if the file exists, if not create it with an empty array
	if (!fs.existsSync(ticketsDataPath)) {
		fs.writeFileSync(ticketsDataPath, JSON.stringify([]));
	}

	const ticketData: TicketSave[] = JSON.parse(fs.readFileSync(ticketsDataPath, "utf8"));
	let highestTicketNumber: number = 0;

	ticketData.forEach((ticket) => {
		if (ticket.ticketNumber > highestTicketNumber) {
			highestTicketNumber = ticket.ticketNumber;
		}
	});
	generalValues().setLastTicketNumber(highestTicketNumber);

	const notificationChannelId = process.env.BOT_NOTIFICATION_CHANNEL;
	if (!notificationChannelId) {
		throw new Error("BOT_NOTIFICATION_CHANNEL is not configured");
	}

	const notificationChannel = await client.channels.fetch(notificationChannelId);
	if (!notificationChannel?.isTextBased() || !("send" in notificationChannel)) {
		throw new Error("BOT_NOTIFICATION_CHANNEL is not a text channel");
	}

	await notificationChannel.send("bot up");

	/*let reactionRolesData: ReactionRolesData[] = [];

	fs.readFile("src/datas/reactionRolesData.json", "utf8", (err, data) => {
		if (err) {
			console.error(err);
			return;
		}
		reactionRolesData = JSON.parse(data);
	});

	reactionRolesData.forEach((reactionRoleData) => {
		console.log(`Adding reaction role ${reactionRoleData.name} on message ${reactionRoleData.messageId}`);
		reactionRoleData.reactionsRoles.forEach((reactionRole) => {
			console.log(`Adding reaction ${reactionRole.reactionEmoji} for role ${reactionRole.roleId}`);
			reactionHandler(`${process.env.ROLES_CHANNEL}`, reactionRoleData.messageId, "add", [reactionRole.reactionEmoji]);
		});
	});*/
}