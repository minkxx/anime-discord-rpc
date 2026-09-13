# Contributing to Anime Discord RPC

First off, thank you for considering contributing to Anime Discord RPC!

Contributions are the heart of the open-source community. Whether you are reporting bugs, requesting support for new streaming sites, or submitting code changes, your help is greatly appreciated.

---

## Reporting Bugs & Requesting Sites

We use GitHub issues to track feature requests and bugs. Before opening a new issue, please check the [existing open issues](https://github.com/minkxx/anime-discord-rpc/issues) to ensure it has not already been reported.

* **Found a Bug?** Open a [Bug Report](https://github.com/minkxx/anime-discord-rpc/issues/new?template=bug_report.md) using our template. Please provide as much detail as possible, including screenshots, steps to reproduce, and console logs from the extension.
* **Want a new site supported?** Open a [New Site Request](https://github.com/minkxx/anime-discord-rpc/issues/new?template=site_request.md). Please include the main URL and any alternate regional domains or iframe sources the site uses.

---

## Local Development Setup

With the release of v2.0.0, Anime Discord RPC is now a purely standalone browser extension built with **WXT**. The desktop application middleware has been completely removed, and the extension now connects directly to Discord's Gateway via WebSockets natively.

### Prerequisites

* [Node.js](https://nodejs.org/) (Required)
* [bun](https://bun.sh/) (Our preferred package manager and task runner)

### Installation & Running

1. Clone the repository and install dependencies:
   ```bash
   bun install
   ```
2. Run the development server for your preferred browser (with hot-reloading):
   * For Chrome: `bun dev:chrome`
   * For Firefox: `bun dev:firefox`
3. The browser will open automatically with the extension loaded as an unpacked extension.

---

## Adding Support for a New Site

We use a modular **Strategy Pattern** to support different streaming sites. This ensures that adding a new site does not clutter or break the core extension logic.

1. Create a new TypeScript file inside `strategies/` (e.g., `crunchyroll.ts`).
2. Implement the `AnimeSite` interface (defined in `types.ts`). You will need to provide:
   * `domains`: An array of the target domains for the site's metadata.
   * `iframe_src`: An array of domains used by the video players/iframes.
   * `getAnimeMetadata`: A function returning the anime `title`, `episode`, and `coverUrl`.
   * `getProgressStats`: A function returning playback progress (`currentMs`, `durationMs`, `remainingMs`, `isPaused`).
3. Export your new strategy and append it to the `strategies` array in `strategies/index.ts`.

> **Note:** If a site's cover images are protected (e.g., Cloudflare), you can utilize our AniList API helper (`fetchAnilistCover` in `utils/anilist.ts`) by extracting the `anilistId` from the site's metadata.

---

## Pull Request Process

When you are ready to submit your code, please follow these steps to ensure a smooth review process:

1. **Format your code:** We use [Biome](https://biomejs.dev/) for linting and code formatting to maintain consistency. Run `bun check:fix` before committing.
2. **Type Check:** Run `bun typecheck` to ensure no TypeScript errors exist.
3. **Test your changes locally:**
   * Ensure the extension loads cleanly.
   * Verify the direct WebSocket connection to Discord succeeds via the extension popup.
   * Verify that anime presence (metadata and timestamps) is accurately reflected on your Discord profile.
4. **Submit the PR:** Fill out the Pull Request template comprehensively. If your PR resolves an open issue, link to it using keywords (e.g., `Closes #12`).