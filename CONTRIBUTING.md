# Contributing to Anime RPC

First off, thank you for considering contributing to Anime Discord RPC! Made with ❤️ by a weeb, for the weebs.

There are many ways to contribute, from reporting bugs and requesting new sites to writing code and improving documentation. 

---

## Reporting Bugs & Requesting Sites

We use GitHub issues to track requests and bugs. Before opening a new issue, please check the [existing open issues](https://github.com/minkxx/anime-discord-rpc/issues) to see if someone has already reported it.

*   **Found a Bug?** Open a [Bug Report](https://github.com/minkxx/anime-discord-rpc/issues/new?template=bug_report.md) using our template. Please provide as much detail as possible, including screenshots and console logs.
*   **Want a new site supported?** Open a [New Site Request](https://github.com/minkxx/anime-discord-rpc/issues/new?template=site_request.md). Please include the main URL and any alternate domains.

---

## Local Development Setup

Anime Discord RPC is split into two parts: the browser extension (built with WXT) and the local Discord RPC bridge.

### Prerequisites
*   [Node.js](https://nodejs.org/) (for the extension environment)
*   [Bun](https://bun.sh/) (for running the local host)

### 1. Extension Setup (`/extension`)
1. Navigate to the extension folder: `cd extension`
2. Install dependencies: `bun install`
3. Run the development server: 
   * For Chrome: `bun run dev`
   * For Firefox: `bun run dev:firefox`

### 2. Host Setup (`/host`)
1. Navigate to the host folder: `cd host`
2. Install dependencies: `bun install`
3. Start the RPC server: `bun run index.ts`

---

## Adding Support for a New Site

We use a modular **Strategy Pattern** to support different streaming sites. To add a new site, you do not need to modify the core extension logic. 

1.  Create a new TypeScript file in `extension/strategies/` (e.g., `crunchyroll.ts`).
2.  Implement the `AnimeSite` interface, providing the target domains and the DOM scraping logic.
3.  Export your new strategy and add it to the array in `extension/strategies/index.ts`.

---

## Pull Request Process

When you are ready to submit your code:

1.  **Format your code:** We use Biome for linting and formatting. Run `bun run check:fix` in the extension directory and the host directory before committing.
2.  **Test your changes:** Ensure the extension loads cleanly as an unpacked extension and correctly updates Discord.
3.  **Submit the PR:** Fill out the Pull Request template completely, linking to any relevant open issues.
