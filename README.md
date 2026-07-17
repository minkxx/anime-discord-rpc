# Anime Discord RPC

<div align="center">
    <img src="./assets/discord-activity.png" width="400" height="auto" alt="discord-activity">
</div>

<div align="center">

![Stars](https://img.shields.io/github/stars/minkxx/anime-discord-rpc?style=flat)
![Forks](https://img.shields.io/github/forks/minkxx/anime-discord-rpc?style=flat)
![Version](https://img.shields.io/badge/version-v1.2.0-blue?style=flat&labelColor=#808080)

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
- aniwaves.ru

## Requirements

- Discord desktop app installed and running.
- A supported Chromium-based browser or Firefox.
- Bun installed to run the local host manually.

## Chrome Demo

<video width="1920" height="auto" controls alt="assets/rpc-chrome-demo.mp4">
  <source src="./assets/rpc-chrome-demo.mp4" type="video/mp4">
  Your browser does not support the video tag.
</video>

## Installation

1. Download `host.zip` and `anime-rpc-x.x.x-chrome.zip` from the releases page.
2. Extract `host.zip` to a folder on your computer.
3. Open a terminal in the extracted host folder and run `bun install`.
4. Open `host/start-rpc.vbs` and replace the `path_to_index.ts` path with the full path to your local `host/index.ts` file.
5. Copy `start-rpc.vbs` into your Windows Startup folder by pressing `Win + R`, typing `shell:startup`, and pasting the file there.
6. Double-click `start-rpc.vbs` to start the host, or restart your computer so Windows launches it automatically.
7. Extract `anime-rpc-x.x.x-chrome.zip` to a folder on your computer.
8. Open `chrome://extensions` in Chrome.
9. Enable Developer mode.
10. Click Load unpacked and select the extracted extension folder.

After both parts are set up, the extension will send playback updates to the local host and Discord Rich Presence will update automatically.

### Chrome Web Store

> [!WARNING]
> 
> Our extension is not available on the Chrome Web Store yet!

### Firefox Add-ons

> [!INFO]
> 
> Our extension is under review for the firefox addons

## Project structure

- extension/ contains the browser extension built with WXT.
- host/ contains the local Discord RPC bridge.

## License

[MIT License](/LICENSE)
