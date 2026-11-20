# Watch Viewer 3.1 — Video Load Lab

Watch Viewer is a Java 21 / Spring Boot dashboard for UI load testing and controlled multi-player playback tests using video files the operator owns or is authorized to test.

## Features
- Paste a YouTube or Facebook video URL for a simulated panel grid with YouTube thumbnails (where available), video identifiers, and one manual platform embed preview.
- Paste a direct authorized .mp4, .webm, or .ogg video-file URL to create real HTML video players in every selected panel.
- Select 1, 10, 50, 100, or 200 screens.
- Apply muted/unmuted and loop on/off settings to each real video-file player.
- Use Play all, Pause all, and Restart all to control authorized-file players together; seeking one player synchronizes the others.
- See per-player loading, playing, buffering, and error states.
- Change panel density, clear generated panels, or reset the configuration.
- Measure panel-generation time and display JavaScript heap usage where the browser exposes it.

## Important platform distinction
YouTube and Facebook links are not duplicated into fleets of automated players. YouTube panels show the video's thumbnail and identifier where available; Facebook panels show simulated placeholders. Both use one manual embed preview alongside the simulated layout panels. This avoids automated third-party playback intended to manufacture views or watch time.

For real multi-screen playback, use a direct video-file URL ending in .mp4, .webm, or .ogg that you own or have permission to test. The browser loads the same URL into each selected HTML video element and applies the selected mute and loop settings. Shared controls send play, pause, and restart commands to all players; seeking one player aligns the others. Autoplay may be blocked by browser policy, and large counts (especially 100–200) can exhaust CPU, memory, decoder, network, or server resources. Start with a small count and increase gradually. If autoplay is blocked, use the player controls.

A URL must be directly accessible by the browser and the host must permit media access where applicable. A normal YouTube/Facebook watch page URL is not a direct video-file URL.

## Technology
- Java 21
- Spring Boot 3.5.7
- Spring Web
- Thymeleaf
- HTML, CSS, and vanilla JavaScript
- Maven

## Requirements
- JDK 21+
- Maven 3.9+
- Internet connection for optional platform embed previews or remote video files

## Run locally
~~~bash
git clone https://github.com/skSagar0143/Watch-viewer.git
cd Watch-viewer
mvn clean verify
mvn spring-boot:run
~~~

Open http://localhost:8080.

## Build executable JAR
~~~bash
mvn clean package
java -jar target/watch-viewer-2.0.0.jar
~~~

## Project structure
~~~text
src/
  main/
    java/com/watchviewer/
      WatchViewerApplication.java
      controller/PageController.java
    resources/
      application.properties
      templates/index.html
      static/css/app.css
      static/js/app.js
  test/
    java/com/watchviewer/controller/PageControllerTest.java
.github/workflows/maven.yml
~~~