import {AttachmentBuilder, Message} from "discord.js";
import {writeFileSync} from "fs";
import {tmpdir} from "os";
import {join} from "path";

let currentMessage: Message;

export function setCurrentMessage(message: Message): void {
	currentMessage = message;
}

export async function sendMessage(text: string): Promise<void> {
	if (!currentMessage) {
		console.error("No current message set");
		return;
	}
	const channel = currentMessage.channel;
	if (!channel.isTextBased() || !("send" in channel)) {
		console.error("Channel is not text-based or does not support sending messages");
		return;
	}

	if (text.length > 2000) {
		const filePath = join(tmpdir(), "message.txt");
		writeFileSync(filePath, text);
		const attachment = new AttachmentBuilder(filePath);
		await channel.send({files: [attachment]});
	} else {
		await channel.send(text);
	}
}