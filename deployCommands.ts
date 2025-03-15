import { REST, Routes, SlashCommandBuilder } from "discord.js";
import dotenv from "dotenv";

dotenv.config();

// Définition des commandes
const commands = [
	new SlashCommandBuilder()
		.setName("ping")
		.setDescription("Répond avec Pong! 🏓"),

	new SlashCommandBuilder()
		.setName("dice")
		.setDescription("Lance un dé aléatoire")
		.addStringOption(option =>
			option.setName("rolls")
				.setDescription("Lancez plusieurs dés au format 'NdF' (ex: '3d6 5d20') où N=nombre de dés et F=nombre de faces.")
				.setRequired(true)),

	new SlashCommandBuilder()
		.setName("new")
		.setDescription("Créer un nouveau ticket"),

	new SlashCommandBuilder()
		.setName("close")
		.setDescription("Fermer le ticket en cours"),

	new SlashCommandBuilder()
		.setName("bonjour")
		.setDescription("Dit bonjour"),

	new SlashCommandBuilder()
		.setName("getticket")
		.setDescription("Récupérer un ticket archivé")
		.addIntegerOption(option =>
			option.setName("ticketnumber")
				.setDescription("Le numéro du ticket à récupérer")
				.setRequired(true))
].map(command => command.toJSON());

// Initialisation de REST
const rest = new REST({ version: "10" }).setToken(process.env.TOKEN!);

// Fonction pour enregistrer les commandes
(async () => {
	try {
		console.log("🔄 Déploiement des commandes...");

		// Enregistrement global (ATTENTION : prend environ 1 heure à se propager)
		// await rest.put(Routes.applicationCommands(process.env.CLIENT_ID!), { body: commands });

		// Enregistrement dans une guilde (instantané)
		await rest.put(
			Routes.applicationGuildCommands(process.env.CLIENT_ID!, process.env.GUILD_ID!),
			{ body: commands }
		);

		console.log("✅ Les commandes ont été enregistrées !");
	} catch (error) {
		console.error("❌ Erreur lors de l'enregistrement des commandes :", error);
	}
})();