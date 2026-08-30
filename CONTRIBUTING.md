# Contributing to Anime Discord RPC

First off, thank you for considering contributing to Anime Discord RPC!

Contributions are the heart of the open-source community. Whether you are reporting bugs, requesting support for new streaming sites, or submitting code changes, your help is greatly appreciated.

---

## Reporting Bugs & Requesting Sites

We use GitHub issues to track feature requests and bugs. Before opening a new issue, please check the [existing open issues](https://github.com/minkxx/anime-discord-rpc/issues) to ensure it has not already been reported.

* **Found a Bug?** Open a [Bug Report](https://github.com/minkxx/anime-discord-rpc/issues/new?template=bug_report.md) using our template. Please provide as much detail as possible, including screenshots, steps to reproduce, and console logs from the extension or desktop app.
* **Want a new site supported?** Open a [New Site Request](https://github.com/minkxx/anime-discord-rpc/issues/new?template=site_request.md). Please include the main URL and any alternate regional domains the site uses.

---

## Local Development Setup

Anime Discord RPC is split into two modular components:

1. **[Browser Extension](/apps/extension/):** Built with WXT, this monitors DOM changes on anime sites.
2. **[Desktop Application](/apps/desktop-app/):** Built with Electron and Vite, this acts as the primary background middleware, hosting the WebSocket server and bridging data to Discord via `@xhayper/discord-rpc`.

### Prerequisites

* [Node.js](https://nodejs.org/) (Required for all environments)
* [Pnpm](https://pnpm.io/) (Our preferred package manager and task runner)

### 1. Extension Setup (`apps/extension`)

The browser extension handles DOM scraping and sends payloads to the local WebSocket server.

Run the development server:
* For Chrome: `pnpm dev:chrome`
* For Firefox: `pnpm dev:firefox`

### 2. Desktop App Setup (`apps/desktop-app`)

This is the primary middleware application. It receives WebSocket data on port `8080` and manages the Discord Rich Presence connection.

1. Start the development server (with hot-reloading): `pnpm dev:desktop`
2. Package the application into an `.exe` installer: `pnpm make:desktop`
3. Run code formatting and linting: `pnpm check` (or `pnpm check:fix` to apply changes)

## Adding Support for a New Site

We use a modular **Strategy Pattern** to support different streaming sites. This ensures that adding a new site does not clutter or break the core extension logic.

1. Create a new TypeScript file inside `apps/extension/strategies/` (e.g., `crunchyroll.ts`).
2. Implement the `AnimeSite` interface. You will need to provide the target domains and the specific DOM scraping logic (title, episode, cover image, and playback state).
3. Export your new strategy and append it to the array in `apps/extension/strategies/index.ts`.

---

## Pull Request Process

When you are ready to submit your code, please follow these steps to ensure a smooth review process:

1. **Format your code:** We use Biome for linting and code formatting to maintain consistency. Run `pnpm check:fix` before committing.
2. **Test your changes locally:**
* Ensure the extension loads cleanly as an unpacked extension.
* Verify the WebSocket connection succeeds.
* Ensure the desktop app launches, connects to Discord, and packages successfully (`pnpm make:desktop`) without native dependency errors.


3. **Submit the PR:** Fill out the Pull Request template comprehensively. If your PR resolves an open issue, link to it using keywords (e.g., `Closes #12`).
