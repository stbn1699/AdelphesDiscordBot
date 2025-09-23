import {TextChannel} from "discord.js";
import client from "../index";
import {messagesHello} from "./sayHello";

const vdmUrl = "https://www.viedemerde.fr/random/";
const nbspRegex = /\u00A0/g;

const eveningGreetings: string[] = [
        "Bonsoir tout le monde ! :city_sunset:",
        "Salut la team du soir ! :crescent_moon:",
        "Hello la commu nocturne ! :night_with_stars:",
        "Hey les étoiles de Discord ! :star2:",
        "Yo la famille du soir ! :milky_way:",
        "Coucou les noctambules ! :owl:",
        "Bonsoir les survivant.e.s du boulot ! :briefcase:",
        "Salut les chillers du soir ! :tea:",
        "Hello les héros fatigués ! :sparkles:",
        "Hey la commu chill du soir ! :zzz:",
        "Bonsoir les pixelos fatigués ! :video_game:",
        "Yo la commu cosy ! :house_with_garden:",
        "Salut les warrior.e.s du crépuscule ! :crossed_swords:",
        "Bonsoir la dream team nocturne ! :dizzy:",
        "Hey les aventurier.ère.s du soir ! :compass:",
        "Bonsoir les âmes nocturnes ! :new_moon_with_face:",
        "Salut la commu détendue ! :relieved:",
        "Bonsoir les fêtard.e.s raisonnables ! :tada:",
        "Hey la team motivée du soir ! :fire:",
        "Bonsoir les artistes nocturnes ! :guitar:",
        "Salut les gourmand.e.s du soir ! :cookie:",
        "Hey la commu cocooning ! :cloud:",
        "Bonsoir les amateur.rice.s de chill ! :wine_glass:",
        "Salut la commu canapé ! :popcorn:",
        "Hey les mélomanes du soir ! :musical_note:",
        "Bonsoir les cœurs doux de la nuit ! :heartpulse:",
        "Salut les fans de lumières tamisées ! :sparkler:",
        "Bonsoir les becs sucrés du soir ! :doughnut:",
        "Hey les fans de petit-déj' du soir ! :pancakes:",
        "Bonsoir les rêveur.se.s éveillé.e.s ! :star_struck:"
];

const dayReflections: string[] = [
        "J'espère que votre journée s'est bien passée. :relieved:",
        "J'espère que votre journée s'est bien passée et que vous êtes fier.e.s de vous. :sparkles:",
        "J'espère que votre journée s'est bien passée, même si elle fut intense. :dash:",
        "J'espère que votre journée s'est bien passée et que vous pouvez souffler. :wind_blowing_face:",
        "J'espère que votre journée s'est bien passée, avec son lot de petites victoires. :trophy:",
        "J'espère que votre journée s'est bien passée et que vous avez pris soin de vous. :heart:",
        "J'espère que votre journée s'est bien passée, quoi qu'il soit arrivé. :sunrise:",
        "J'espère que votre journée s'est bien passée et que vous avez trouvé un peu de douceur. :chocolate_bar:"
];

const eveningHooks: string[] = [
        "Sinon, écoutez celle-là :",
        "Et si ce n'est pas le cas, écoutez celle-là :",
        "Sinon, laissez cette VDM vous faire relativiser :",
        "Si la journée a été rude, écoutez celle-ci :",
        "Pour souffler un bon coup, écoutez celle-là :",
        "Sinon, prenez deux minutes pour cette VDM :",
        "Si ça n'a pas été top, écoutez celle-là :",
        "Pour relativiser un peu, écoutez cette VDM :",
        "Et si vous avez besoin d'un sourire, écoutez celle-ci :"
];

function buildEveningMessages(target: number): string[] {
        const generatedMessages: string[] = [];

        for (let index = 0; index < target; index++) {
                const greeting = eveningGreetings[index % eveningGreetings.length];
                const reflection = dayReflections[(index * 3) % dayReflections.length];
                const hook = eveningHooks[(index * 7) % eveningHooks.length];
                generatedMessages.push(`${greeting} ${reflection} ${hook}`);
        }

        return generatedMessages;
}

export const eveningMessages: string[] = buildEveningMessages(messagesHello.length);

export function getRandomEveningMessage(): string {
        const randomIndex = Math.floor(Math.random() * eveningMessages.length);
        return eveningMessages[randomIndex];
}

export async function fetchRandomVdm(): Promise<string> {
        const response = await fetch(vdmUrl, {
                headers: {
                        "User-Agent": "AdelphesDiscordBot/1.0 (https://www.viedemerde.fr)",
                        "Accept": "text/html,application/xhtml+xml",
                        "Accept-Language": "fr-FR,fr;q=0.9"
                }
        });

        if (!response.ok) {
                throw new Error(`La récupération de la VDM a échoué avec le statut ${response.status}`);
        }

        const html = await response.text();
        const vdmContent = extractVdmText(html);

        if (!vdmContent) {
                throw new Error("Impossible d'extraire le contenu de la VDM");
        }

        return vdmContent;
}

function extractVdmText(html: string): string | null {
        const patterns: RegExp[] = [
                /<p[^>]*class="[^"']*(?:article__content|article__desc|post-card__content)[^"']*"[^>]*>([\s\S]*?)<\/p>/i,
                /<div[^>]*class="[^"']*(?:article__content|article__desc|post-card__content)[^"']*"[^>]*>([\s\S]*?)<\/div>/i,
                /<article[^>]*class="[^"']*article[^"']*"[^>]*>[\s\S]*?<p[^>]*>([\s\S]*?VDM\.?)[\s\S]*?<\/p>/i,
                /<p[^>]*>([\s\S]*?VDM\.?)[\s\S]*?<\/p>/i
        ];

        for (const pattern of patterns) {
                const match = html.match(pattern);
                if (match && match[1]) {
                        return cleanHtmlFragment(match[1]);
                }
        }

        return null;
}

function cleanHtmlFragment(fragment: string): string {
        const withLineBreaks = fragment.replace(/<br\s*\/?\s*>/gi, "\n");
        const withoutTags = withLineBreaks.replace(/<[^>]+>/g, "");
        const decoded = decodeHtmlEntities(withoutTags);

        return decoded
                .replace(/\r/g, "")
                .replace(nbspRegex, " ")
                .split("\n")
                .map(line => line.trim())
                .filter(line => line.length > 0)
                .join("\n")
                .replace(/[ \t]{2,}/g, " ")
                .trim();
}

const htmlEntityMap: Record<string, string> = {
        amp: "&",
        lt: "<",
        gt: ">",
        quot: "\"",
        apos: "'",
        nbsp: " ",
        rsquo: "’",
        lsquo: "‘",
        ldquo: "“",
        rdquo: "”",
        hellip: "…",
        eacute: "é",
        egrave: "è",
        ecirc: "ê",
        euml: "ë",
        agrave: "à",
        aacute: "á",
        acirc: "â",
        aelig: "æ",
        ccedil: "ç",
        icirc: "î",
        icircumflex: "î",
        iuml: "ï",
        ocirc: "ô",
        oelig: "œ",
        ucirc: "û",
        ugrave: "ù",
        uuml: "ü"
};

function decodeHtmlEntities(text: string): string {
        return text.replace(/&(#x?[0-9a-fA-F]+|[a-zA-Z]+);/g, (match, entity) => {
                if (entity.startsWith("#x") || entity.startsWith("#X")) {
                        const codePoint = Number.parseInt(entity.slice(2), 16);
                        return Number.isNaN(codePoint) ? match : String.fromCodePoint(codePoint);
                }

                if (entity.startsWith("#")) {
                        const codePoint = Number.parseInt(entity.slice(1), 10);
                        return Number.isNaN(codePoint) ? match : String.fromCodePoint(codePoint);
                }

                const lowerCaseEntity = entity.toLowerCase();

                if (lowerCaseEntity in htmlEntityMap) {
                        return htmlEntityMap[lowerCaseEntity];
                }

                return match;
        });
}

export async function getEveningMessageWithVdm(): Promise<string> {
        const intro = getRandomEveningMessage();

        try {
                const vdm = await fetchRandomVdm();
                return `${intro}\n\n${vdm}`;
        } catch (error) {
                console.error("Erreur lors de la récupération d'une VDM :", error);
                return `${intro}\n\n_(Impossible de récupérer une VDM pour le moment.)_`;
        }
}

export async function sayGoodEvening(): Promise<void> {
        const channelId = process.env.GENERAL_CHANNEL;

        if (!channelId) {
                console.error("La variable d'environnement GENERAL_CHANNEL est manquante.");
                return;
        }

        try {
                const channel = await client.channels.fetch(channelId);

                if (!channel) {
                        console.error("Impossible de trouver le canal pour le message du soir.");
                        return;
                }

                if (!channel.isTextBased()) {
                        console.error("Le canal configuré pour le message du soir n'est pas textuel.");
                        return;
                }

                if (!("send" in channel)) {
                        console.error("Le canal configuré pour le message du soir ne permet pas l'envoi de messages.");
                        return;
                }

                const message = await getEveningMessageWithVdm();
                await (channel as TextChannel).send(message);
        } catch (error) {
                console.error("Erreur lors de l'envoi du message du soir :", error);
        }
}
