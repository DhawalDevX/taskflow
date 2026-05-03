package com.taskmanager.controller;

import com.taskmanager.dto.DashboardResponse;
import com.taskmanager.entity.User;
import com.taskmanager.repository.UserRepository;
import com.taskmanager.service.DashboardService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/dashboard")
public class DashboardController {
    private final DashboardService dashboardService;
    private final UserRepository userRepo;

    public DashboardController(DashboardService ds, UserRepository ur) {
        this.dashboardService = ds; this.userRepo = ur;
    }

    @GetMapping
    public ResponseEntity<DashboardResponse> getDashboard(@AuthenticationPrincipal UserDetails ud) {
        User user = userRepo.findByEmail(ud.getUsername()).orElseThrow();
        return ResponseEntity.ok(dashboardService.getDashboard(user));
    }
}
