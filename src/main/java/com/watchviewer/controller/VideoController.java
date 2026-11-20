package com.watchviewer.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import com.watchviewer.dto.VideoUrlRequest;
import com.watchviewer.dto.VideoUrlResponse;
import com.watchviewer.service.VideoUrlService;

import jakarta.validation.Valid;

@RestController
@RequestMapping("/api/videos")
public class VideoController {

    private final VideoUrlService videoUrlService;

    public VideoController(VideoUrlService videoUrlService) {
        this.videoUrlService = videoUrlService;
    }

    @PostMapping("/validate")
    public ResponseEntity<VideoUrlResponse> validate(@Valid @RequestBody VideoUrlRequest request) {
        VideoUrlResponse response = videoUrlService.validate(request.url());
        return ResponseEntity.ok(response);
    }
}
