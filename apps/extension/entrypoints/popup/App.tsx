import { useCallback, useEffect, useState } from "react";
import "./App.css";

interface AnimeState {
	title: string;
	episode: string;
	coverUrl: string;
	isPaused: boolean;
}

export default function App() {
	const [hasToken, setHasToken] = useState<boolean>(false);
	const [isGatewayReady, setIsGatewayReady] = useState<boolean>(false);
	const [currentAnime, setCurrentAnime] = useState<AnimeState | null>(null);
	const [isLoading, setIsLoading] = useState<boolean>(true);
	const [error, setError] = useState<string | null>(null);
	const [redirectUrl, setRedirectUrl] = useState<string>("");

	const fetchStatus = useCallback(() => {
		browser.runtime.sendMessage({ type: "GET_STATUS" }).then((res) => {
			if (res) {
				setHasToken(res.hasToken);
				setIsGatewayReady(res.isGatewayReady);
				if (res.currentAnime?.title !== "Unknown") {
					setCurrentAnime(res.currentAnime);
				} else {
					setCurrentAnime(null);
				}
			}
			setIsLoading(false);
		});
	}, []);

	useEffect(() => {
		try {
			setRedirectUrl(browser.identity.getRedirectURL());
		} catch (e) {
			console.error(e);
		}

		fetchStatus();
		const interval = setInterval(fetchStatus, 3000);
		return () => clearInterval(interval);
	}, [fetchStatus]);

	const handleLogin = async () => {
		setIsLoading(true);
		setError(null);
		try {
			const res = await browser.runtime.sendMessage({ type: "LOGIN_DISCORD" });
			if (res?.success) {
				fetchStatus();
			} else {
				setError(res?.error || "Login was cancelled or failed.");
			}
		} catch (err: unknown) {
			if (err instanceof Error) {
				setError(err.message);
			} else {
				setError("An unexpected error occurred.");
			}
		} finally {
			setIsLoading(false);
		}
	};

	const handleLogout = async () => {
		setIsLoading(true);
		await browser.runtime.sendMessage({ type: "LOGOUT_DISCORD" });
		setHasToken(false);
		setIsGatewayReady(false);
		setCurrentAnime(null);
		setIsLoading(false);
	};

	return (
		<div className="popup-container">
			<header className="popup-header">
				<h2>Anime RPC</h2>
				<span
					className={`status-pill ${hasToken ? (isGatewayReady ? "online" : "connecting") : "offline"}`}
				>
					{hasToken ? (isGatewayReady ? "Active" : "Connecting...") : "Offline"}
				</span>
			</header>

			{error && <div className="error-banner">{error}</div>}

			<main className="popup-main">
				{!hasToken ? (
					<div className="auth-box">
						<p className="description">
							Connect your Discord account to display your current anime
							activity without any desktop companion apps.
						</p>
						<button
							type="button"
							className="btn btn-discord"
							onClick={handleLogin}
							disabled={isLoading}
						>
							{isLoading ? "Authenticating..." : "Login with Discord"}
						</button>

						<details className="redirect-hint">
							<summary>Developer Redirect URI</summary>
							<p>
								Ensure this exact URI is listed under your Discord App's OAuth2
								Redirects:
							</p>
							<code>{redirectUrl || "Loading..."}</code>
						</details>
					</div>
				) : (
					<div className="status-box">
						{currentAnime ? (
							<div className="activity-card">
								{currentAnime.coverUrl && (
									<img
										src={currentAnime.coverUrl}
										alt="Cover"
										className="activity-poster"
									/>
								)}
								<div className="activity-details">
									<div className="activity-title">{currentAnime.title}</div>
									<div className="activity-subtitle">
										{currentAnime.episode} {currentAnime.isPaused && "(Paused)"}
									</div>
								</div>
							</div>
						) : (
							<div className="idle-card">
								<p>No supported anime stream active.</p>
								<small>
									Open an episode on a supported site to broadcast status.
								</small>
							</div>
						)}

						<button
							type="button"
							className="btn btn-disconnect"
							onClick={handleLogout}
							disabled={isLoading}
						>
							Disconnect Account
						</button>
					</div>
				)}
			</main>
		</div>
	);
}
