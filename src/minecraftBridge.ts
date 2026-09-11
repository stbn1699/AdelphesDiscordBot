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

export function startMinecraftBridge(client: Client): void {
    const app = express();

    app.use(express.json({
        limit: "10kb"
    }));

    /**
     * Minecraft -> Discord
     *
     * Le futur plugin appellera :
     * POST http://127.0.0.1:3001/minecraft/chat
     */
    app.post("/minecraft/chat", async (
        req: Request<{}, {}, MinecraftChatPayload>,
        res: Response
    ) => {
        console.log("[MinecraftBridge] Requête reçue :", req.body);

        const authorization = req.header("authorization");

        if (authorization !== `Bearer ${minecraftBridgeSecret}`) {
            res.status(401).json({
                error: "Unauthorized"
            });
            return;
        }

        const username = cleanMessage(req.body?.username, 32);
        const message = cleanMessage(req.body?.message);

        if (!username || !message) {
            res.status(400).json({
                error: "username et message sont obligatoires"
            });
            return;
        }

        try {
            const channel = await client.channels.fetch(minecraftDiscordChannelId);

            if (!channel || !channel.isSendable()) {
                res.status(500).json({
                    error: "Le salon Discord Minecraft est introuvable ou ne permet pas d'envoyer des messages"
                });
                return;
            }

            await channel.send({
                content: `> \`\<${username}\>\`: ${message}`,
                allowedMentions: {
                    parse: []
                }
            });

            console.log(
                `[MinecraftBridge] Minecraft -> Discord : ${username}: ${message}`
            );

            res.status(200).json({
                ok: true
            });
        } catch (error) {
            console.error(
                "[MinecraftBridge] Erreur pendant l'envoi du message vers Discord :",
                error
            );

            res.status(500).json({
                error: "Erreur interne lors de l'envoi vers Discord"
            });
        }
    });

    /**
     * Discord -> Minecraft
     *
     * Uniquement les messages humains dans le salon configuré.
     * Les messages de bots ou webhooks sont ignorés pour empêcher
     * une boucle Minecraft -> Discord -> Minecraft.
     */
    client.on("messageCreate", async (message) => {
        if (message.author.bot || message.webhookId) {
            return;
        }

        if (message.channelId !== minecraftDiscordChannelId) {
            return;
        }

        const content = cleanMessage(message.content);

        if (!content) {
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

        /*
         * Cette partie échouera normalement tant que ton plugin Minecraft
         * n'a pas encore créé l'endpoint HTTP POST /discord-message.
         * Cela n'empêche pas Minecraft -> Discord de fonctionner.
         */
        if (!minecraftWebhookUrl) {
            console.warn(
                "[MinecraftBridge] MINECRAFT_SERVER_WEBHOOK_URL absent : message non envoyé à Minecraft."
            );
            return;
        }

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
        console.log(
            `[MinecraftBridge] API démarrée sur le port ${port}`
        );
    });
}