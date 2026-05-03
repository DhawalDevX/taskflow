package com.taskmanager.controller;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;
import java.util.HashMap;
import java.util.Map;

@RestController
public class HealthController {

    @GetMapping("/health")
    public Map<String, String> health() {
        Map<String, String> status = new HashMap<>();
        status.put("status", "UP");
        status.put("service", "TaskFlow");
        status.put("timestamp", String.valueOf(System.currentTimeMillis()));
        return status;
    }

    @GetMapping("/actuator/health")
    public Map<String, String> actuatorHealth() {
        Map<String, String> status = new HashMap<>();
        status.put("status", "UP");
        return status;
    }

    @GetMapping("/")
    public String home() {
        return "TaskFlow API is running!";
    }
}