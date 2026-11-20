# Watch Viewer 3.0 — Video Load Lab

Watch Viewer is a Java 21 / Spring Boot dashboard for testing how a browser handles a large grid of lightweight video-panel UI components.

## Features
- Paste a YouTube or Facebook video URL and select the matching platform.
- Select 1, 10, 50, 100, or 200 simulated screen panels.
- Configure Loop true/false and Mute true/false as test settings displayed on every simulated panel.
- Generate the complete panel grid with one **Load and generate panels** action.
- Measure panel-generation time and display JavaScript heap usage where the browser exposes it.
- Change panel density, clear the generated panels, or reset the configuration.
- Load one optional real YouTube/Facebook embed preview for manual compatibility testing.

## Important distinction: simulated panels vs real video streams
The 1–200 grid is a UI/load simulation. It creates lightweight HTML panels that represent player slots; it does **not** create 100–200 real third-party video streams. The loop and mute choices are shown as test configuration on those simulated slots and are not applied as automated playback commands to a fleet of embeds.

The single embed preview is loaded separately and must be started manually with the platform's native controls. It is configured not to autoplay. YouTube's embed preview requests muted playback by default; Facebook controls its own player behaviour. Platform restrictions, privacy settings, region rules, browser policies, and embed permissions can prevent a video from loading.

This tool does not automate mass playback, looping, refreshes, or view/watch-time generation.

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
- Internet connection for the optional platform embed preview

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
pom.xml
~~~
