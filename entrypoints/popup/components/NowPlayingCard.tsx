import { Pause } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import type { AnimeState } from "../types";

interface NowPlayingCardProps {
	anime: AnimeState;
}

export function NowPlayingCard({ anime }: NowPlayingCardProps) {
	return (
		<AnimatePresence mode="wait">
			<motion.div
				key={`${anime.title}-${anime.episode}`}
				initial={{ opacity: 0, y: 8 }}
				animate={{ opacity: 1, y: 0 }}
				exit={{ opacity: 0, y: -8 }}
				transition={{ duration: 0.25, ease: "easeOut" }}
				className="flex flex-col items-center"
			>
				<div className="relative h-62 w-46 overflow-hidden rounded-2xl border border-white/10 bg-panel-2">
					{anime.coverUrl ? (
						<img
							src={anime.coverUrl}
							alt=""
							className="h-full w-full object-cover"
						/>
					) : (
						<div className="grid h-full w-full place-items-center px-6 text-center text-[11px] text-muted">
							No cover art yet
						</div>
					)}

					<div
						className={`absolute right-3 top-3 flex items-center gap-1.5 rounded-full bg-black/55 px-2.5 py-1 backdrop-blur-sm ${
							anime.isPaused ? "text-muted" : "text-cyan"
						}`}
					>
						{anime.isPaused ? (
							<Pause size={10} strokeWidth={2.5} />
						) : (
							<motion.span
								className="h-1.5 w-1.5 rounded-full bg-cyan"
								animate={{ opacity: [1, 0.35, 1] }}
								transition={{ duration: 1.2, repeat: Infinity }}
							/>
						)}
						<span className="text-[10px] font-bold tracking-wide">
							{anime.isPaused ? "PAUSED" : "REC"}
						</span>
					</div>
				</div>

				<div className="mt-3 flex flex-col items-center text-center">
					<span className="text-[10px] font-semibold tracking-[0.2em] text-cyan">
						NOW WATCHING
					</span>
					<h3 className="mt-1 line-clamp-2 text-[15px] font-bold leading-snug text-ink">
						{anime.title}
					</h3>
					<p className="mt-1 text-[11px] text-muted">{anime.episode}</p>
				</div>
			</motion.div>
		</AnimatePresence>
	);
}
