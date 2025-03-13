import {Channel, Message, TextChannel} from "discord.js";
import {sendMessage} from "./sendMessage";
import client from "../index";

export function reactionHandlerUserRequest(message: Message){
	const reactionsParams: string[] = message.content.toLowerCase().slice(10).split(" ");
	const messageLink: string = reactionsParams[0];
	const delOrAdd: string = reactionsParams[1];
	const reactions: string[] = reactionsParams.slice(2);
	const channelId: string = message.channel.id;
	reactionHandler(channelId, messageLink, delOrAdd, reactions);
}

export function reactionHandler(channelId: string, messageId: string, delOrAdd: string, reactions: string[]): void {

	/* if (delOrAdd !== "del" && delOrAdd !== "add") {
		sendMessage("Please specify if you want to delete or add reactions");
		return;
	}

	const channel: Channel | undefined = client.channels.cache.get(channelId)?.isTextBased() ? client.channels.cache.get(channelId) : undefined;

	if (!channel) {
		sendMessage("Channel not found");
		return;
	}

	channel.messages.fetch(messageId)

		.then((msg: Message) => {
			if (delOrAdd === "del") {
				console.log(`Deleting reactions ${reactions.join(", ")} on message ${messageId}`);
				if (reactions.length === 0) {
					sendMessage("Please provide at least one reaction to delete, or specify \`all\` to delete all of them");
					return;
				} else if (reactions.length === 1 && reactions[0] === "all") {
					msg.reactions.removeAll();
				} else {
					reactions.forEach((reaction) => {
						msg.reactions.cache.get(reaction)?.remove();
					});
				}
			} else if (delOrAdd === "add") {
				console.log(`Reacting to message ${messageId} with ${reactions.join(", ")}`);
				reactions.forEach((reaction) => {
					msg.react(reaction);
				});
			}
			sendMessage("Reactions updated :white_check_mark:");
		})
		.catch(() => {
			sendMessage("Message not found");
			console.error;
		});*/
}