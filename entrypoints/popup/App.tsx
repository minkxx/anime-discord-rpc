import { AnimatePresence, motion } from "motion/react";
import { AppShell } from "./components/AppShell";
import { AuthGateModal } from "./components/AuthGateModal";
import { useExtensionStatus } from "./hooks/useExtensionStatus";
import "./style.css";

export default function App() {
	const status = useExtensionStatus();

	if (status.isBootstrapping) {
		return (
			<div className="grid h-[220px] w-[380px] place-items-center bg-void">
				<motion.div
					className="h-8 w-8 rounded-full border-2 border-white/10 border-t-cyan"
					animate={{ rotate: 360 }}
					transition={{ duration: 0.8, repeat: Infinity, ease: "linear" }}
				/>
			</div>
		);
	}

	return (
		<div
			className={`relative w-[380px] overflow-hidden bg-void text-ink ${
				status.isAuthenticated ? "" : "min-h-[460px]"
			}`}
		>
			<div
				aria-hidden={!status.isAuthenticated}
				className={
					status.isAuthenticated
						? "relative"
						: "relative pointer-events-none select-none opacity-40 blur-[2px]"
				}
			>
				<AppShell status={status} />
			</div>

			<AnimatePresence>
				{!status.isAuthenticated && (
					<AuthGateModal
						onLogin={status.login}
						isLoading={status.isAuthLoading}
						error={status.error}
					/>
				)}
			</AnimatePresence>
		</div>
	);
}
