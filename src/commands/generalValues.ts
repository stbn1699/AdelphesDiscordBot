import {TicketSave} from "../models/TicketSave";
import fs from "node:fs";
import {GeneraValues} from "../models/GeneralValues";

export function generalValues() {

	let generalValues: GeneraValues = JSON.parse(fs.readFileSync("src/datas/generalValues.json", "utf8"));

	return {
		getLastTicketNumber: function () {
			return generalValues.lastTicketNumber;
		},
		setLastTicketNumber: function (newLastTickerNumber: number) {
			generalValues.lastTicketNumber = newLastTickerNumber;
			fs.writeFileSync("src/datas/generalValues.json", JSON.stringify(generalValues));
		}
	};

}