# Watch Viewer — YouTube Playback QA

A Spring Boot dashboard for testing one embedded YouTube video in one user-controlled browser session.

## Features
- Accept YouTube watch, youtu.be, Shorts, and live-video URLs.
- Load a single embedded player using the official YouTube IFrame Player API.
- Run a bounded playback test for 1 minute, 5 minutes, 30 minutes, or 1 hour.
- Automatically pause the player when the selected test duration expires.
- Manually reload the embedded player for troubleshooting; playback does not automatically restart.
- Select a browser compatibility profile and view guidance for running the app in that browser.
- Monitor player state, video time, duration, and playback errors.
- Review and clear a timestamped event log.

## Important usage boundaries
- This is a single-player QA tool. It does not open multiple tabs or launch/control other browsers.
- It does not automate looping, refreshing, or repeated playback sessions, and it is not designed to generate views, watch time, or engagement.
- The browser profile selector is informational. To test another browser, open this app manually in that browser.
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
