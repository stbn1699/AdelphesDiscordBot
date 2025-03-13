export interface ReactionRolesData {
	name: string;
	messageId: string;
	reactionsRoles: ReactionRole[];
}

interface ReactionRole {
	reactionEmoji: string;
	roleId: string;
}