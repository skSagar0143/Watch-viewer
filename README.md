# Watch Viewer 2.0 — Multi-source Video QA Studio

Watch Viewer is a Java 21 / Spring Boot dashboard for inspecting multiple distinct YouTube and Facebook embeds in one responsive workspace.

## Features
- Add YouTube watch, youtu.be, Shorts, live, and supported Facebook video / Watch / Reel / fb.watch links.
- Choose the platform before adding a source.
- Display up to 4 distinct video sources as mini embedded players in one grid.
- Choose a grid capacity of 1, 2, 3, or 4 players.
- Remove individual players or clear the workspace.
- Open the original video in a separate tab.
- Responsive layout for desktop and mobile.
- Uses official YouTube embed URLs and Facebook's embedded video plugin; playback and player controls are provided by the platforms.

## Important playback and platform limitations
- This is a manual playback QA tool, not a view, watch-time, or engagement generator.
- Players do not autoplay, auto-loop, refresh, or duplicate a source. Start and control each video manually using the embedded platform controls.
- A video must allow embedding. Age, region, privacy, account, publisher, or platform restrictions may prevent playback.
- Facebook may block embedding for some videos or require the viewer to be logged in.
- YouTube and Facebook decide independently how views and engagement are measured. Embedding a video does not guarantee that a view is counted.
- The grid is intentionally limited to 4 distinct sources to avoid excessive browser, CPU, memory, and network use. Actual capacity depends on the device and video resolution.
- The application does not bypass platform restrictions, authentication, browser autoplay policies, or popup restrictions.

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
- Internet connection for embedded platform players

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
    resources/
      application.properties
      templates/index.html
      static/css/app.css
      static/js/app.js
.github/workflows/maven.yml
pom.xml
~~~