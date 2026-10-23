import fs from "node:fs";
import {GeneraValues} from "../models/GeneralValues";
import {dataPath} from "../utils/dataPath";

export function generalValues() {
	const generalDataPath = dataPath("generalValues.json");

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