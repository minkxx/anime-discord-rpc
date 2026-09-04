export function parseTimeText(timeStr: string | null | undefined): number {
	if (!timeStr) return 0;

	const cleanStr = timeStr.replace("-", "").trim();
	const parts = cleanStr.split(":").map(Number);

	if (parts.length === 2) {
		const [m = 0, s = 0] = parts;
		return (m * 60 + s) * 1000;
	} else if (parts.length === 3) {
		const [h = 0, m = 0, s = 0] = parts;
		return (h * 3600 + m * 60 + s) * 1000;
	}
	return 0;
}
