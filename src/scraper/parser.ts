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

export function getStandardVideoStats() {
	const videoElement = document.querySelector("video") as HTMLVideoElement;

	if (videoElement) {
		const duration =
			videoElement.duration && !Number.isNaN(videoElement.duration)
				? Math.floor(videoElement.duration * 1000)
				: 0;

		const current =
			videoElement.currentTime && !Number.isNaN(videoElement.currentTime)
				? Math.floor(videoElement.currentTime * 1000)
				: 0;

		return {
			currentMs: current,
			durationMs: duration,
			remainingMs: Math.max(0, duration - current),
			isPaused: videoElement.paused,
		};
	}

	const elapsedElement = document.querySelector(".jw-text-elapsed");
	const countdownElement = document.querySelector(".jw-text-countdown");
	const pausedElement = document.querySelector(".jw-state-paused");

	if (elapsedElement || countdownElement) {
		const currentMs = parseTimeText(elapsedElement?.textContent);
		const remainingMs = parseTimeText(countdownElement?.textContent);

		return {
			currentMs,
			remainingMs,
			durationMs: currentMs + remainingMs,
			isPaused: !!pausedElement,
		};
	}

	return {
		currentMs: 0,
		remainingMs: 0,
		durationMs: 0,
		isPaused: null,
	};
}
