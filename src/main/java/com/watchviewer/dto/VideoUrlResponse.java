package com.watchviewer.dto;

public record VideoUrlResponse(
        boolean valid,
        String normalizedUrl,
        String message
) {
}
