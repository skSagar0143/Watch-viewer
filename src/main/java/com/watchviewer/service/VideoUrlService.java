package com.watchviewer.service;

import java.net.URI;
import java.net.URISyntaxException;
import java.util.Locale;
import java.util.Set;

import org.springframework.stereotype.Service;

import com.watchviewer.dto.VideoUrlResponse;

@Service
public class VideoUrlService {

    private static final Set<String> ALLOWED_SCHEMES = Set.of("http", "https");

    public VideoUrlResponse validate(String rawUrl) {
        if (rawUrl == null || rawUrl.isBlank()) {
            return new VideoUrlResponse(false, null, "Enter a video URL.");
        }

        String candidate = rawUrl.trim();
        try {
            URI uri = new URI(candidate).normalize();
            String scheme = uri.getScheme() == null ? "" : uri.getScheme().toLowerCase(Locale.ROOT);

            if (!ALLOWED_SCHEMES.contains(scheme)) {
                return new VideoUrlResponse(false, null, "Only HTTP and HTTPS video URLs are supported.");
            }
            if (uri.getHost() == null || uri.getHost().isBlank()) {
                return new VideoUrlResponse(false, null, "The URL must contain a valid host name.");
            }
            if (uri.getUserInfo() != null) {
                return new VideoUrlResponse(false, null, "URLs containing embedded credentials are not allowed.");
            }

            return new VideoUrlResponse(true, uri.toASCIIString(),
                    "URL format looks valid. The browser will request the media directly.");
        } catch (URISyntaxException ex) {
            return new VideoUrlResponse(false, null, "That URL format is not valid.");
        }
    }
}
