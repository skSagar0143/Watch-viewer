package com.watchviewer.service;

import static org.junit.jupiter.api.Assertions.*;

import org.junit.jupiter.api.Test;

class VideoUrlServiceTest {

    private final VideoUrlService service = new VideoUrlService();

    @Test
    void acceptsHttpsUrl() {
        var result = service.validate("https://cdn.example.com/video.mp4");
        assertTrue(result.valid());
        assertEquals("https://cdn.example.com/video.mp4", result.normalizedUrl());
    }

    @Test
    void rejectsJavascriptScheme() {
        var result = service.validate("javascript:alert(1)");
        assertFalse(result.valid());
    }

    @Test
    void rejectsEmbeddedCredentials() {
        var result = service.validate("https://user:pass@example.com/video.mp4");
        assertFalse(result.valid());
    }

    @Test
    void rejectsMalformedUrl() {
        var result = service.validate("not a url");
        assertFalse(result.valid());
    }
}
