export interface TicketSave {
	createdBy: string;
	ticketNumber: number;
	creationDate: string;
	closed: boolean;
	closedDate: string | null;
	closedBy: string | null;
}