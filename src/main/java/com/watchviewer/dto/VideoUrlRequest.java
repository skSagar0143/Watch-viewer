package com.watchviewer.dto;

import jakarta.validation.constraints.NotBlank;

public record VideoUrlRequest(
        @NotBlank(message = "Video URL is required")
        String url
) {
}
