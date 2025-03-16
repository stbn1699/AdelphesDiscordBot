import {Interaction, PermissionFlagsBits, TextChannel, User} from "discord.js";
import {generalValues} from "./generalValues";
import client from "../index";
import path from "node:path";
import fs from "node:fs";
import {sendMessage} from "./sendMessage";
import {TicketArchive} from "../models/ticketArchive";

export async function ticketsCreate(titre: string, user: User) {

	const ticketNumber = generalValues().getLastTicketNumber() + 1;
	const guild = client.guilds.cache.get(process.env.GUILD_ID!);
	const channelName = `ticket-${ticketNumber}`;
	const title = titre;

	guild?.channels.create({
		name: channelName,
		type: 0, // 0 is for text channels
		permissionOverwrites: [
			{
				id: guild.id,
				deny: [PermissionFlagsBits.ViewChannel],
			},
			{
				id: user,
				allow: [PermissionFlagsBits.ViewChannel, PermissionFlagsBits.SendMessages],
			},
			{
				id: process.env.ROLE_MODERATOR!,
				allow: [PermissionFlagsBits.ViewChannel, PermissionFlagsBits.SendMessages],
			},
		],
	}).then((channel) => {
		channel.send(`Bonjour <@${user}>, bienvenue dans votre ticket ! Un.e <@&${process.env.ROLE_MODERATOR}> devrai rapidement te répondre`);

		// Read the existing tickets data
		const ticketsDataPath = path.join(__dirname, `${process.env.DATA_LOCATION}/ticketsData.json`);
		let ticketsData = [];
		if (!fs.existsSync(ticketsDataPath)) {
			fs.writeFileSync(ticketsDataPath, JSON.stringify([]));
		} else {
			const data = fs.readFileSync(ticketsDataPath, 'utf-8');
			ticketsData = JSON.parse(data);
		}

		// Create the new ticket object
		const newTicket = {
			createdBy: user.tag,
			title: title,
			ticketNumber: ticketNumber,
			creationDate: new Date().toISOString(),
			closed: false,
			closedDate: null,
			closedBy: null
		};

		// Add the new ticket to the array
		ticketsData.push(newTicket);

		// Write the updated tickets data back to the file
		fs.writeFileSync(ticketsDataPath, JSON.stringify(ticketsData, null, 2));

		generalValues().setLastTicketNumber(ticketNumber);
	});

	generalValues().setLastTicketNumber(ticketNumber);

	return ticketNumber;
}

export async function ticketsClose(channelName: string) {
	const guild = client.guilds.cache.get(process.env.GUILD_ID!);
	const channel = guild?.channels.cache.find((channel) => channel.name === channelName) as TextChannel;
	if (channel) {
		const messages = await channel.messages.fetch();
		const archive = messages.map(msg => ({
			author: msg.author.tag,
			content: msg.content,
			date: msg.createdAt.toISOString()
		}));
		const archivePath = path.join(__dirname, `${process.env.DATA_LOCATION}/archives/${channelName}.json`);
		const archiveDir = path.dirname(archivePath);
		fs.mkdirSync(archiveDir, {recursive: true});
		fs.writeFileSync(archivePath, JSON.stringify(archive, null, 2));

		const ticketsDataPath = path.join(__dirname, `${process.env.DATA_LOCATION}/ticketsData.json`);
		let ticketsData = [];
		if (fs.existsSync(ticketsDataPath)) {
			const data = fs.readFileSync(ticketsDataPath, 'utf-8');
			ticketsData = JSON.parse(data);
		}
		const ticket = ticketsData.find((ticket: any) => ticket.ticketNumber === parseInt(channelName.split('-')[1]));
		ticket.closed = true;
		ticket.closedBy = channel.lastMessage?.author.tag;
		ticket.closedDate = new Date().toISOString();
		fs.writeFileSync(ticketsDataPath, JSON.stringify(ticketsData, null, 2));

		await channel.delete();
	}
}

export function getTicketArchive(ticketNumber: number): string {
	const archivePath = path.join(__dirname, `${process.env.DATA_LOCATION}/archives/ticket-${ticketNumber}.json`);
	let archive: TicketArchive[] | null = null;
	if (fs.existsSync(archivePath)) {
		archive = JSON.parse(fs.readFileSync(archivePath, 'utf-8'));
	}
	if (archive != null) {
		return `Voici l'archive du ticket #${ticketNumber}\n\`\`\`${archive.reverse().map(msg => `Auteur: ${msg.author}\nContenu: ${msg.content}`).join('\n\n')}\`\`\``;
	}
	return `L'archive du ticket #${ticketNumber} n'existe pas`;
}

export function listTickets(): string {
	const ticketsDataPath = path.join(__dirname, `${process.env.DATA_LOCATION}/ticketsData.json`);
	let ticketsData = [];
	if (fs.existsSync(ticketsDataPath)) {
		const data = fs.readFileSync(ticketsDataPath, 'utf-8');
		ticketsData = JSON.parse(data);
	}
	const tickets: string[] = ticketsData.map((ticket: any) => `${ticket.title} - ${ticket.closed ? 'Fermé' : 'Ouvert'} - Créé par ${ticket.createdBy} - n°${ticket.ticketNumber}`);
	return `Liste des tickets\n\`\`\`${tickets.join('\n')}\`\`\``;
}