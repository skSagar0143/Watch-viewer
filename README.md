# Watch Viewer — React YouTube Panel Simulator

A lightweight React + Vite frontend. The previous Spring Boot backend has been removed.

## Features
- Paste a YouTube video URL (watch, youtu.be, Shorts, or live).
- Select 1, 10, 50, 100, or 200 thumbnail panels.
- Configure loop and muted display preferences for the test layout.
- Render the same YouTube thumbnail in every simulated panel.
- One separate YouTube embed for manual playback.

## Important playback limitation
The generated panels are thumbnail simulations, not 100–200 active YouTube players. The single embed is manual-play only. This app does not automate repeated playback, create artificial views/watch time, or use the YouTube Data API to start playback. The YouTube Data API provides video metadata; playback is provided by YouTube's embedded player and is subject to YouTube and browser restrictions.

## Run locally
Requires Node.js 20.19+ or 22.12+.

```bash
npm install
npm run dev
```

Create a production build:

```bash
npm run build
npm run preview
```

No API key is needed to display public YouTube thumbnails.
