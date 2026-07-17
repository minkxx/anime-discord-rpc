# Anime Discord RPC

<div align="center">
    <img src="./assets/discord-activity.png" width="400" height="auto" alt="discord-activity">
</div>

<div align="center">

![Stars](https://img.shields.io/github/stars/minkxx/anime-discord-rpc?style=flat)
![Forks](https://img.shields.io/github/forks/minkxx/anime-discord-rpc?style=flat)
![Version](https://img.shields.io/badge/version-v1.1.1-blue?style=flat&labelColor=#808080)

</div>

Anime RPC is a browser extension and local Discord bridge that shows what you are currently watching in Discord Rich Presence.

The extension watches supported anime streaming pages, sends playback updates to a local WebSocket host, and the host publishes the activity to your Discord profile.

## What it does

- Detects the current anime title, episode, and cover art.
- Tracks playback state such as watching, paused, or stopped.
- Updates Discord Rich Presence automatically through a local host process.

## Supported sites

- anikototv.to
- anikoto.cz

## Requirements

- Discord desktop app installed and running.
- A supported Chromium-based browser or Firefox.
- Bun installed to run the local host manually.

## Installation

Before installing the browser extension, start the host so Discord Rich Presence can receive updates.

### Run the host manually

If you have Bun installed, you can start the host directly from the project root:

```bash
bun run host/index.ts
```

Keep this process running while you use the extension.

### Start the host automatically with Windows

The repository includes a `start-rpc.vbs` launcher that starts the host in the background. Open the file and update the project path inside the script so it matches your local checkout, then place a shortcut to `start-rpc.vbs` in your Windows Startup folder.

Once the shortcut is in the Startup folder, Windows will launch the host automatically when you sign in.

### Install extension

If you download a release ZIP file manually, extract it first and then install the browser extension from the extracted files.

#### Chrome, Edge, and other Chromium browsers

1. Download the latest release `anime-rpc-x.x.x-chrome.zip` from the Releases page.
2. Extract the ZIP to a folder on your computer.
3. Open chrome://extensions.
4. Enable Developer mode.
5. Click Load unpacked and select the extracted extension folder.

#### Firefox

1. Download the latest release `anime-rpc-x.x.x-firefox.zip` from the Releases page.
2. Extract the ZIP to a folder on your computer.
3. Open about:debugging.
4. Click This Firefox.
5. Click Load Temporary Add-on and select the extension manifest file from the extracted folder.

### Chrome Web Store

> [!WARNING]
> 
> Our extension is not available on the Chrome Web Store yet!

### Firefox Add-ons

> Our extension is under review for the firefox addons

## Project structure

- extension/ contains the browser extension built with WXT.
- host/ contains the local Discord RPC bridge.

## License

[MIT License](/LICENSE)
