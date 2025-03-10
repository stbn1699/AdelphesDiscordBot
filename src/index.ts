import {Client, GatewayIntentBits} from "discord.js";
import dotenv from "dotenv";
import {spinDice} from "./commands/spinDices";
import {sendMessage, setCurrentClient, setCurrentMessage} from "./commands/sendMessage";
import {welcomeGenerator} from "./commands/welcomeGenerator";

dotenv.config();

const client = new Client({
	intents: [
		GatewayIntentBits.Guilds,
		GatewayIntentBits.GuildMessages,
		GatewayIntentBits.MessageContent,
		GatewayIntentBits.GuildMembers
	]
});
setCurrentClient(client)

client.on("ready", () => {
	console.log(`Bot connecté en tant que ${client.user?.tag}`);
});

client.on("messageCreate", async (message) => {
	if (message.author.bot) return;
	setCurrentMessage(message);
	if (message.content.toLowerCase() === "ping") {
		sendMessage("Pong! :ping_pong:");
	}
	if (message.content.toLowerCase().startsWith("/dice")) {
		spinDice(message.content);
	}
});

client.on("guildMemberUpdate", (oldMember, newMember) => {
	const oldRoles = oldMember.roles.cache;
	const newRoles = newMember.roles.cache;
	const addedRoles = newRoles.filter(role => !oldRoles.has(role.id));
	const removedRoles = oldRoles.filter(role => !newRoles.has(role.id));

	if(addedRoles.has("1348572452372086807")) {
		welcomeGenerator(newMember.user);
	}
});

client.login(process.env.TOKEN);
