import * as fs from "node:fs";
import {ReactionRolesData} from "../models/ReactionRolesData";
import {reactionHandler} from "./reactionHandler";
import {TicketSave} from "../models/TicketSave";

export function onStartup(): void {

	const ticketData: TicketSave[] = JSON.parse(fs.readFileSync("src/datas/ticketsData.json", "utf8"));
	let highestTicketNumber: number = 0;

	ticketData.forEach((ticket) => {
		if (ticket.ticketNumber > highestTicketNumber) {
			highestTicketNumber = ticket.ticketNumber;
		}
	});
	const generalValues = JSON.parse(fs.readFileSync("src/datas/generalValues.json", "utf8"));
	generalValues.lastTicketNumber = highestTicketNumber;
	fs.writeFileSync("src/datas/generalValues.json", JSON.stringify(generalValues, null, 2), "utf8");

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