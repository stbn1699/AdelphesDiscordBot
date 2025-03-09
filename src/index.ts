import {Client, GatewayIntentBits} from "discord.js";
import dotenv from "dotenv";
import {spinDice} from "./commands/spinDices";
import {sendMessage, setCurrentMessage} from "./commands/sendMessage";

dotenv.config();

const client = new Client({
	intents: [
		GatewayIntentBits.Guilds,
		GatewayIntentBits.GuildMessages,
		GatewayIntentBits.MessageContent]
});

const CHANNEL_ID = "1348239222833807451"; // Remplace par l'ID du canal

client.on("ready", () => {
	console.log(`🤖 Bot connecté en tant que ${client.user?.tag}`);
});

client.on("messageCreate", async (message) => {
	if (message.author.bot) return;
	if (message.channel.id !== CHANNEL_ID) return;
	setCurrentMessage(message);
	if (message.content.toLowerCase() === "ping") {
		sendMessage("Pong! 🏓");
		console.log("Pong!");
	}
	if (message.content.toLowerCase().startsWith("/dice")) {
		spinDice(message.content);
	}
});

client.login(process.env.TOKEN);
