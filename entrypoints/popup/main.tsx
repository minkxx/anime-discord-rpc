import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App.tsx";
import "./style.css";

const rootElement = document.getElementById("root");

if (!rootElement) {
	console.error("Failed to mount root element.");
	process.exit();
}

ReactDOM.createRoot(rootElement).render(
	<React.StrictMode>
		<App />
	</React.StrictMode>,
);
