export function parseTimeText(timeStr: string | null | undefined): number {
	if (!timeStr) return 0;
	const cleanStr = timeStr.replace("-", "").trim();
	const parts = cleanStr.split(":").map(Number);

	if (parts.length === 2) {
		return (parts[0] * 60 + parts[1]) * 1000;
	} else if (parts.length === 3) {
		return (parts[0] * 3600 + parts[1] * 60 + parts[2]) * 1000;
	}
	return 0;
}
