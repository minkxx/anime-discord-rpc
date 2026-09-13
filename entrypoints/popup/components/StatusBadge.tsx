import { motion } from "motion/react";

export type ConnectionState = "live" | "connecting" | "offline";

interface StatusBadgeProps {
	state: ConnectionState;
}

const LABEL: Record<ConnectionState, string> = {
	live: "On air",
	connecting: "Tuning in",
	offline: "Off air",
};

const DOT_COLOR: Record<ConnectionState, string> = {
	live: "bg-cyan",
	connecting: "bg-amber",
	offline: "bg-muted",
};

export function StatusBadge({ state }: StatusBadgeProps) {
	return (
		<span className="inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-panel-2/70 px-2.5 py-1 text-[11px] font-medium text-muted">
			<span className="relative flex h-1.5 w-1.5">
				{state === "live" && (
					<motion.span
						className="absolute inline-flex h-full w-full rounded-full bg-cyan"
						animate={{ opacity: [0.6, 0, 0.6], scale: [1, 2.2, 1] }}
						transition={{ duration: 1.8, repeat: Infinity, ease: "easeInOut" }}
					/>
				)}
				<span
					className={`relative inline-flex h-1.5 w-1.5 rounded-full ${DOT_COLOR[state]}`}
				/>
			</span>
			{LABEL[state]}
		</span>
	);
}
