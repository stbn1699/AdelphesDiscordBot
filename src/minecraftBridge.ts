import dotenv from "dotenv";
import express, { Request, Response } from "express";
import { Client } from "discord.js";

dotenv.config();

const port = Number(process.env.MINECRAFT_BRIDGE_PORT ?? 3001);
const bridgeSecret = process.env.MINECRAFT_BRIDGE_SECRET;
const minecraftChannelId = process.env.MINECRAFT_DISCORD_CHANNEL_ID;
const minecraftWebhookUrl = process.env.MINECRAFT_SERVER_WEBHOOK_URL;

if (!bridgeSecret) {
    throw new Error("MINECRAFT_BRIDGE_SECRET est manquant dans le fichier .env");
}

if (!minecraftChannelId) {
    throw new Error("MINECRAFT_DISCORD_CHANNEL_ID est manquant dans le fichier .env");
}

const minecraftBridgeSecret: string = bridgeSecret;
const minecraftDiscordChannelId: string = minecraftChannelId;

type MinecraftChatPayload = {
    username: string;
    message: string;
};

type MinecraftDeathPayload = {
    username: string;
    message: string;
};

type MinecraftAdvancementPayload = {
    username: string;
    advancement: string;
};

type MinecraftPlayerStatusPayload = {
    username: string;
};

type DiscordChatPayload = {
    username: string;
    userId: string;
    message: string;
};

function cleanMessage(value: unknown, maxLength = 1000): string {
    if (typeof value !== "string") {
        return "";
    }

    return value
        .replace(/[\r\n]+/g, " ")
        .trim()
        .slice(0, maxLength);
}

function isAuthorized(req: Request): boolean {
    return req.header("authorization") === `Bearer ${minecraftBridgeSecret}`;
}

async function getMinecraftDiscordChannel(client: Client) {
    const channel = await client.channels.fetch(minecraftDiscordChannelId);

    if (!channel || !channel.isSendable()) {
        throw new Error(
            "Le salon Discord Minecraft est introuvable ou ne permet pas d'envoyer des messages"
        );
    }

    return channel;
}

export function startMinecraftBridge(client: Client): void {
    const app = express();

    app.use(express.json({
        limit: "10kb"
    }));

    /**
     * Minecraft -> Discord : chat joueur.
     * Payload : { "username": "Pseudo", "message": "Bonjour" }
     */
    app.post("/minecraft/chat", async (
        req: Request<{}, {}, MinecraftChatPayload>,
        res: Response
    ) => {
        if (!isAuthorized(req)) {
            res.status(401).json({ error: "Unauthorized" });
            return;
        }

        const username = cleanMessage(req.body?.username, 32);
        const message = cleanMessage(req.body?.message, 1000);

        if (!username || !message) {
            res.status(400).json({
                error: "username et message sont obligatoires"
            });
            return;
        }

        try {
            const channel = await getMinecraftDiscordChannel(client);

            await channel.send({
                content: `\`<${username}>\` **${message}**`,
                allowedMentions: {
                    parse: []
                }
            });

            console.log(`[MinecraftBridge] Chat Minecraft -> Discord : ${username}: ${message}`);

            res.status(200).json({ ok: true });
        } catch (error) {
            console.error(
                "[MinecraftBridge] Erreur pendant l'envoi du chat vers Discord :",
                error
            );

            res.status(500).json({
                error: "Erreur interne lors de l'envoi du chat vers Discord"
            });
        }
    });

    /**
     * Minecraft -> Discord : mort d'un joueur.
     * Payload : { "username": "Pseudo", "message": "Pseudo tried to swim in lava" }
     */
    app.post("/minecraft/death", async (
        req: Request<{}, {}, MinecraftDeathPayload>,
        res: Response
    ) => {
        if (!isAuthorized(req)) {
            res.status(401).json({ error: "Unauthorized" });
            return;
        }

        const username = cleanMessage(req.body?.username, 32);
        const deathMessage = cleanMessage(req.body?.message, 500);

        if (!username || !deathMessage) {
            res.status(400).json({
                error: "username et message sont obligatoires"
            });
            return;
        }

        try {
            const channel = await getMinecraftDiscordChannel(client);

            await channel.send({
                content: `💀 **${username}** est mort : ${deathMessage}`,
                allowedMentions: {
                    parse: []
                }
            });

            console.log(
                `[MinecraftBridge] Mort Minecraft -> Discord : ${username}: ${deathMessage}`
            );

            res.status(200).json({ ok: true });
        } catch (error) {
            console.error(
                "[MinecraftBridge] Erreur pendant l'envoi d'une mort vers Discord :",
                error
            );

            res.status(500).json({
                error: "Erreur interne lors de l'envoi de la mort vers Discord"
            });
        }
    });

    /**
     * Minecraft -> Discord : advancement.
     * Payload : { "username": "Pseudo", "advancement": "Monster Hunter" }
     */
    app.post("/minecraft/advancement", async (
        req: Request<{}, {}, MinecraftAdvancementPayload>,
        res: Response
    ) => {
        if (!isAuthorized(req)) {
            res.status(401).json({ error: "Unauthorized" });
            return;
        }

        const username = cleanMessage(req.body?.username, 32);
        const advancement = cleanMessage(req.body?.advancement, 200);

        if (!username || !advancement) {
            res.status(400).json({
                error: "username et advancement sont obligatoires"
            });
            return;
        }

        try {
            const channel = await getMinecraftDiscordChannel(client);

            await channel.send({
                content: `🏆 **${username}** a obtenu l'avancement **${advancement}** !`,
                allowedMentions: {
                    parse: []
                }
            });

            console.log(
                `[MinecraftBridge] Advancement Minecraft -> Discord : ${username}: ${advancement}`
            );

            res.status(200).json({ ok: true });
        } catch (error) {
            console.error(
                "[MinecraftBridge] Erreur pendant l'envoi d'un advancement vers Discord :",
                error
            );

            res.status(500).json({
                error: "Erreur interne lors de l'envoi de l'avancement vers Discord"
            });
        }
    });

    /**
     * Minecraft -> Discord : connexion d'un joueur.
     * Payload : { "username": "Pseudo" }
     */
    app.post("/minecraft/join", async (
        req: Request<{}, {}, MinecraftPlayerStatusPayload>,
        res: Response
    ) => {
        if (!isAuthorized(req)) {
            res.status(401).json({ error: "Unauthorized" });
            return;
        }

        const username = cleanMessage(req.body?.username, 32);

        if (!username) {
            res.status(400).json({
                error: "username est obligatoire"
            });
            return;
        }

        try {
            const channel = await getMinecraftDiscordChannel(client);

            await channel.send({
                content: `:green_circle: **${username}** a rejoint le serveur.`,
                allowedMentions: {
                    parse: []
                }
            });

            console.log(`[MinecraftBridge] Connexion Minecraft -> Discord : ${username}`);

            res.status(200).json({ ok: true });
        } catch (error) {
            console.error(
                "[MinecraftBridge] Erreur pendant l'envoi d'une connexion vers Discord :",
                error
            );

            res.status(500).json({
                error: "Erreur interne lors de l'envoi de la connexion vers Discord"
            });
        }
    });

    /**
     * Minecraft -> Discord : déconnexion d'un joueur.
     * Payload : { "username": "Pseudo" }
     */
    app.post("/minecraft/left", async (
        req: Request<{}, {}, MinecraftPlayerStatusPayload>,
        res: Response
    ) => {
        if (!isAuthorized(req)) {
            res.status(401).json({ error: "Unauthorized" });
            return;
        }

        const username = cleanMessage(req.body?.username, 32);

        if (!username) {
            res.status(400).json({
                error: "username est obligatoire"
            });
            return;
        }

        try {
            const channel = await getMinecraftDiscordChannel(client);

            await channel.send({
                content: `:red_circle: **${username}** a quitté le serveur.`,
                allowedMentions: {
                    parse: []
                }
            });

            console.log(`[MinecraftBridge] Déconnexion Minecraft -> Discord : ${username}`);

            res.status(200).json({ ok: true });
        } catch (error) {
            console.error(
                "[MinecraftBridge] Erreur pendant l'envoi d'une déconnexion vers Discord :",
                error
            );

            res.status(500).json({
                error: "Erreur interne lors de l'envoi de la déconnexion vers Discord"
            });
        }
    });

    /**
     * Discord -> Minecraft.
     * Uniquement les messages humains dans le salon configuré.
     * Les bots et webhooks sont ignorés pour empêcher une boucle.
     */
    client.on("messageCreate", async (message) => {
        if (message.author.bot || message.webhookId) {
            return;
        }

        if (message.channelId !== minecraftDiscordChannelId) {
            return;
        }

        const content = cleanMessage(message.content, 1000);

        if (!content) {
            return;
        }

        if (!minecraftWebhookUrl) {
            console.warn(
                "[MinecraftBridge] MINECRAFT_SERVER_WEBHOOK_URL absent : message Discord non envoyé à Minecraft."
            );
            return;
        }

        const payload: DiscordChatPayload = {
            username: message.member?.displayName ?? message.author.username,
            userId: message.author.id,
            message: content
        };

        console.log(
            `[MinecraftBridge] Discord -> Minecraft : ${payload.username}: ${payload.message}`
        );

        try {
            const response = await fetch(minecraftWebhookUrl, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${minecraftBridgeSecret}`
                },
                body: JSON.stringify(payload),
                signal: AbortSignal.timeout(5_000)
            });

            if (!response.ok) {
                const responseBody = await response.text();

                console.error(
                    `[MinecraftBridge] Minecraft a répondu ${response.status} : ${responseBody}`
                );
            }
        } catch (error) {
            console.error(
                "[MinecraftBridge] Impossible de joindre le plugin Minecraft :",
                error
            );
        }
    });

    app.listen(port, "0.0.0.0", () => {
        console.log(`[MinecraftBridge] API démarrée sur http://0.0.0.0:${port}`);
    });
}