import path from "node:path";

export function dataPath(...segments: string[]): string {
	const dataDirectory = process.env.DATA_LOCATION || path.join(process.cwd(), "data");
	return path.resolve(dataDirectory, ...segments);
}
