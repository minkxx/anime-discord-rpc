# Anime Discord RPC

<div align="center">
    <img src="./assets/discord-activity.png" width="400" height="auto" alt="discord-activity">
</div>

**Show off the anime you're watching on your Discord profile!**

Ever wanted your Discord status to show exactly which anime and episode you are watching? This tool does exactly that! When you play, pause, or stop an anime on a supported website, your Discord status updates automatically.

<div align="center">

![Stars](https://img.shields.io/github/stars/minkxx/anime-discord-rpc?style=flat)
![Forks](https://img.shields.io/github/forks/minkxx/anime-discord-rpc?style=flat)
![Version](https://img.shields.io/badge/version-v1.3.0-blue?style=flat&labelColor=#808080)

</div>

---

## What You Need

* The **Discord desktop app** installed and running on your computer.
* **Google Chrome** or **Mozilla Firefox**.

## Supported Anime Sites

* anikototv.to
* anikoto.cz
* aniwaves.ru
* animepahe.pw (and its other links)

---

## How to Set It Up

To make the magic happen, you need to install two things: the **Desktop App** and the **Browser Extension**.

### Step 1: Install the Desktop App

1. Go to our [Releases page](https://github.com/minkxx/anime-discord-rpc/releases).
2. Download the file named `anime-rpc-desktop-1.0.0.Setup.exe`.
3. Double-click the downloaded file to install it.
4. Open the app and let it run in the background!

### Step 2: Install the Browser Extension

**If you use Firefox:**
It's super easy! Just go to the [Firefox Add-ons Store](https://addons.mozilla.org/en-US/firefox/addon/anikoto-discord-rpc/) and click **"Add to Firefox"**.

**If you use Chrome:**
We aren't in the Chrome Web Store just yet, so follow these simple steps (or watch this [quick demo video](https://ik.imagekit.io/9huvu1bd5/rpc-chrome-demo.mp4)):

1. Go to the [Releases page](https://github.com/minkxx/anime-discord-rpc/releases) and download `anime-rpc-1.3.0-chrome.zip`.
2. **Extract (unzip)** that file into a regular folder on your computer.
3. Open Google Chrome and type `chrome://extensions` into the top web address bar and press Enter.
4. Look at the top-right corner of the screen and turn **ON** the switch for **Developer mode**.
5. Click the **Load unpacked** button that appears on the top left.
6. Select the folder you just unzipped. You're done!

*That's it! Open one of the supported anime websites, start an episode, and check your Discord profile!*

---
### Step 3: If you want to avoid Step 1

1. Download `host-1.0.0.zip` from the [latest releases page](https://github.com/minkxx/anime-discord-rpc/releases) and extract it.
2. Open a terminal in the extracted folder and run `bun install`.
3. Open `host/start-rpc.vbs` and replace the `path_to_index.ts` path with the full path to your local `host/index.ts` file.
4. Press `Win + R`, type `shell:startup`, and press Enter to open your Windows Startup folder.
5. Copy `start-rpc.vbs` into the Startup folder.
6. Double-click `start-rpc.vbs` to start the host (it will now also start automatically when you turn on your PC).

---

## Project Structure

* `extension/` - The code for the browser extension.
* `host/` - The code for the script-based local bridge.
* `desktop-app/` - The code for the Electron desktop application.

## Helping Out

Contributions are always welcome! If you want to add a new anime site or fix a bug, please read our [Contributing Guidelines](/CONTRIBUTING.md) to learn how to set up the project and open a Pull Request.

## 📜 License

[MIT License](/LICENSE)

<p align="center">Made with ❤️ by Minkxx</p>
