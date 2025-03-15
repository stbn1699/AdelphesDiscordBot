import {AttachmentBuilder, Client, Message, TextChannel} from "discord.js";
import {writeFileSync} from "fs";
import {tmpdir} from "os";
import {join} from "path";

let currentMessage: Message;
let currentClient: Client;

export function setCurrentClient(newClient: Client): void {
	currentClient = newClient;
}

export function setCurrentMessage(message: Message): void {
	currentMessage = message;
}

export async function sendMessage(text: string, channelId?: string): Promise<void> {
	let channel: TextChannel | null = null;

	if (channelId) {
		channel = await currentClient.channels.fetch(channelId) as TextChannel;
	} else if (currentMessage) {
		channel = currentMessage.channel as TextChannel;
	}

	if (!channel) {
		console.error("No channel found");
		return;
	}
	if (!channel.isTextBased()) {
		console.error("Channel is not text-based");
		return;
	}
	if (!("send" in channel)) {
		console.error("Channel does not support sending messages");
		return;
	}

	if (text.length > 2000) {
		const filePath = join(tmpdir(), "message.txt");
		writeFileSync(filePath, text);
		const attachment = new AttachmentBuilder(filePath);
		await channel.send({files: [attachment]});
		console.log(`Message is too long, sending as attachment`);
	} else {
		await channel.send(text);
		console.log(`\nMessage sent: ${text}\n`);
	}
}