Set WshShell = CreateObject("WScript.Shell")
' Replace the path below with the absolute path to your project
WshShell.Run "bun run D:\Code\anime-discord-rpc\host\index.ts", 0, False
Set WshShell = Nothing
