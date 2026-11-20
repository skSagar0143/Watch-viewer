# Watch Viewer — Video Playback QA

A lightweight Spring Boot video playback quality-assurance dashboard. It is designed for testing a single video stream in a user-controlled browser session—not for generating artificial views, traffic, or engagement.

## Features
- Validate an HTTP(S) video URL before loading it.
- Play a direct MP4, WebM, or Ogg video in one HTML5 player.
- Manually test pause, seek, mute, playback speed, and optional looping.
- Select a target browser profile to display compatibility notes (the app cannot remotely launch or control installed browsers).
- Monitor playback state, elapsed time, duration, and media errors.
- Responsive dashboard with no database or external service required.

> YouTube watch-page URLs are not direct media files and are not supported by the HTML5 player. Use a video file URL hosted on a server that permits browser playback and CORS/range requests where applicable.

## Requirements
- Java 21+
- Maven 3.9+

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

## Notes
- Playback begins only after the user presses **Load & Play**.
- Only one player is created. The app does not open tabs/windows or automate browsers.
- Loop mode is a normal HTML5 media-player QA option and should be used only to test playback behavior.
- Browser selection is a compatibility-profile selector, not a remote browser launcher.
- The backend validates URL syntax and scheme only; it does not fetch the supplied URL, avoiding server-side request forgery risks.

## Project structure
- `src/main/java/com/watchviewer/WatchViewerApplication.java`
- `src/main/java/com/watchviewer/controller/VideoController.java`
- `src/main/java/com/watchviewer/dto/VideoUrlRequest.java`
- `src/main/java/com/watchviewer/dto/VideoUrlResponse.java`
- `src/main/java/com/watchviewer/service/VideoUrlService.java`
- `src/main/resources/templates/index.html`
- `src/main/resources/static/css/app.css`
- `src/main/resources/static/js/app.js`
