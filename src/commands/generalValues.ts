import fs from "node:fs";
import {GeneraValues} from "../models/GeneralValues";
import path from "node:path";

export function generalValues() {
	const generalDataPath = path.join(__dirname, `${process.env.DATA_LOCATION}/generalValues.json`);

	if (!fs.existsSync(generalDataPath)) {
		const defaultValues: GeneraValues = {lastTicketNumber: 0};
		fs.writeFileSync(generalDataPath, JSON.stringify(defaultValues));
	}

	let generalValues: GeneraValues = JSON.parse(fs.readFileSync(generalDataPath, "utf8"));

	return {
		getLastTicketNumber: function () {
			return generalValues.lastTicketNumber;
		},
		setLastTicketNumber: function (newLastTickerNumber: number) {
			generalValues.lastTicketNumber = newLastTickerNumber;
			fs.writeFileSync(generalDataPath, JSON.stringify(generalValues));
		}
	};
}