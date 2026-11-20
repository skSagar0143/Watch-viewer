# Watch Viewer — YouTube Playback & Multi-tab QA

A Spring Boot dashboard for manually testing an embedded YouTube video in one browser session or a small, bounded set of separate QA tabs.

## Features
- Accept YouTube watch, youtu.be, Shorts, and live-video URLs.
- Load a single embedded player using the official YouTube IFrame Player API.
- Run a bounded playback test for 1 minute, 5 minutes, 30 minutes, or 1 hour.
- Automatically pause the player when the selected test duration expires.
- Manually reload the embedded player for troubleshooting; playback does not automatically restart.
- Select a browser compatibility profile and view guidance for running the app in that browser.
- Open 1, 2, 3, or at most 5 separate QA tabs from a user click. Each tab loads the selected video paused for manual comparison.
- Close tabs opened by the launcher from the parent page.
- Monitor player state, video time, duration, and playback errors.
- Review and clear a timestamped event log.

## Important usage boundaries
- Multi-tab testing is deliberately limited to a maximum of 5 tabs for manual browser/player compatibility checks.
- Every additional tab loads the QA page with the video paused. Playback must be started manually by the tester in each tab.
- The launcher cannot launch or control another browser. The browser profile selector is informational; open this app manually in the browser you want to test.
- Browsers may block multiple pop-ups. Allow pop-ups for this local app if you want to use the tab launcher.
- It does not automate playback, looping, refreshing, or repeated sessions, and it is not designed to generate views, watch time, or engagement.
- Some YouTube videos disable embedding or have regional, age, or account restrictions. Those videos may not play in the embedded player.
- YouTube's own player controls and policies remain in effect.

## Requirements
- Java 21+
- Maven 3.9+
- Internet connection to load the YouTube IFrame Player API and embedded video.

## Run
```bash
mvn spring-boot:run
```
Open http://localhost:8080.

Or build and run:
```bash
mvn clean package
java -jar target/watch-viewer-1.0.0.jar
```

## Project structure
- `src/main/java/com/watchviewer/WatchViewerApplication.java`
- `src/main/java/com/watchviewer/controller/VideoController.java`
- `src/main/java/com/watchviewer/dto/VideoUrlRequest.java`
- `src/main/java/com/watchviewer/dto/VideoUrlResponse.java`
- `src/main/java/com/watchviewer/service/VideoUrlService.java`
- `src/main/resources/templates/index.html`
- `src/main/resources/static/css/app.css`
- `src/main/resources/static/js/app.js`
