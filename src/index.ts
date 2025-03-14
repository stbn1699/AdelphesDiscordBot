import {Client, GatewayIntentBits, ChannelType, TextChannel} from "discord.js";
import dotenv from "dotenv";
import {spinDice} from "./commands/spinDices";
import {sendMessage, setCurrentMessage} from "./commands/sendMessage";
import {welcomeGenerator} from "./commands/welcomeGenerator";
import {onStartup} from "./commands/onStartup";
import {ticketsCreate, ticketsClose, getTicketArchive} from "./commands/tickets";
import cron from "node-cron";
import {sayHello} from "./commands/sayHello";

dotenv.config();

const client = new Client({
	intents: [
		GatewayIntentBits.Guilds,
		GatewayIntentBits.GuildMessages,
		GatewayIntentBits.MessageContent,
		GatewayIntentBits.GuildMembers
	]
});
export default client;

client.on("ready", () => {
	onStartup();
	console.log(`Bot connecté en tant que ${client.user?.tag}`);

	cron.schedule("0 7 * * *", () => {
		sayHello();
	}, {
		timezone: "Europe/Paris"
	});
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
	if (message.content.toLowerCase() === "/new") {
		ticketsCreate(message.author);
	}
	if (message.content.toLowerCase() === "/close") {
		if (message.channel.type === ChannelType.GuildText) {
			ticketsClose((message.channel as TextChannel).name);
		}
	}
	// Check if the user has the moderator role
	if (process.env.ROLE_MODERATOR && message.member?.roles.cache.has(process.env.ROLE_MODERATOR)) {
		if (message.content.toLowerCase().startsWith("/reaction")) {
			sendMessage("This command is disabled for now");
			/*reactionHandlerUserRequest(message);*/
		}
		if (message.content.toLowerCase().startsWith("/bonjour")) {
			sayHello()
		}
		if (message.content.toLowerCase().startsWith("/getticket")) {
			getTicketArchive(message);
		}
	}
});

client.on("guildMemberUpdate", async (oldMember, newMember) => {
	if (oldMember.partial) await oldMember.fetch();
	if (newMember.partial) await newMember.fetch();
	const oldRoles = oldMember.roles.cache;
	const newRoles = newMember.roles.cache;
	const addedRoles = newRoles.filter(role => !oldRoles.has(role.id));
	const removedRoles = oldRoles.filter(role => !newRoles.has(role.id));
});

client.on("guildMemberRemove", (member) => {
	sendMessage(`Au revoir, <@${member.id}> !`);
});

client.on("guildMemberAdd", (member) => {
	welcomeGenerator(member.user);
});

client.login(process.env.TOKEN);

// Define the daily task function
function dailyTask() {
	console.log("Executing daily task at 8 AM UTC+1");
	// Add your task logic here
}