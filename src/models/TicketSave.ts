export interface TicketSave {
	createdBy: string;
	title: string;
	ticketNumber: number;
	creationDate: string;
	closed: boolean;
	closedDate: string | null;
	closedBy: string | null;
}