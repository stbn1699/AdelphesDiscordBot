import {ChannelType, Client, GatewayIntentBits, Interaction} from "discord.js";
import dotenv from "dotenv";
import {spinDice} from "./commands/spinDices";
import {sendMessage} from "./commands/sendMessage";
import {welcomeGenerator} from "./commands/welcomeGenerator";
import {onStartup} from "./commands/onStartup";
import {getTicketArchive, ticketsClose, ticketsCreate} from "./commands/tickets";
import {sayHello} from "./commands/sayHello";
import cron from "node-cron";
import {titleFinder} from "./commands/titleFinder";

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
});

cron.schedule("0 8 * * *", async () => {
	await sayHello();
});

let currentInteraction: Interaction | null = null;
export function setCurrentInteraction(interaction: Interaction): void {
	currentInteraction = interaction;
}

export function getCurrentInteraction(): Interaction | null {
	return currentInteraction;
}

client.on("interactionCreate", async (interaction: Interaction) => {
	if (!interaction.isChatInputCommand()) return;

	const { commandName } = interaction;
	setCurrentInteraction(interaction);

	if (commandName === "ping") {
		await interaction.reply("🏓 Pong!");
	} else if (commandName === "dice") {
		interaction.reply(spinDice(interaction.options.getString("rolls")!));
	} else if (commandName === "new") {
		const ticketNumber: number = await ticketsCreate(interaction.user);
		console.log(`Ticket ${ticketNumber} créé`);
		await interaction.reply(`📩 Ticket créé ! vous avez le numéro ${ticketNumber} 📩`);
	} else if (commandName === "close") {
		if (interaction.channel?.type === ChannelType.GuildText && interaction.channel.name.startsWith("ticket-")) {
			await ticketsClose(interaction.channel.name);
			console.log(`Ticket ${interaction.channel.name.slice(7)} supprimé`);
		} else {
			await interaction.reply("❌ Vous ne pouvez pas fermer ce canal !");
		}
	} else if (commandName === "bonjour") {
		await sayHello();
	} else if (commandName === "getticket" && interaction.user) {
		await getTicketArchive(interaction.options.getInteger("ticketnumber")!);
		console.log(`Archive du ticket ${interaction.options.getInteger("ticketnumber")!} demandée`);
	}
});

client.on("messageCreate", async (message) => {
	if (message.author.bot) return;
	titleFinder(message);
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