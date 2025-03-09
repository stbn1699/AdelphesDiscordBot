import { Client, GatewayIntentBits } from "discord.js";
import dotenv from "dotenv";

dotenv.config();

const client = new Client({
	intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages, GatewayIntentBits.MessageContent],
});

const CHANNEL_ID = "1348239222833807451"; // Remplace par l'ID du canal

client.on("ready", () => {
	console.log(`🤖 Bot connecté en tant que ${client.user?.tag}`);
});

client.on("messageCreate", async (message) => {
	if (message.author.bot) return;
	if (message.channel.id !== CHANNEL_ID) return;
	if (message.content.toLowerCase() === "ping") {
		await message.channel.send("Pong! 🏓");
		console.log("Pong!");
	}
});

client.login(process.env.TOKEN);
