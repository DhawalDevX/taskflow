package com.taskmanager.controller;

import com.taskmanager.dto.*;
import com.taskmanager.entity.User;
import com.taskmanager.repository.UserRepository;
import com.taskmanager.service.ProjectService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/projects")
public class ProjectController {
    private final ProjectService projectService;
    private final UserRepository userRepo;

    public ProjectController(ProjectService ps, UserRepository ur) {
        this.projectService = ps; this.userRepo = ur;
    }

    @PostMapping
    public ResponseEntity<ProjectResponse> create(@Valid @RequestBody ProjectRequest req, @AuthenticationPrincipal UserDetails ud) {
        return ResponseEntity.ok(projectService.create(req, getUser(ud)));
    }

    @GetMapping
    public ResponseEntity<List<ProjectResponse>> getAll(@AuthenticationPrincipal UserDetails ud) {
        return ResponseEntity.ok(projectService.getAll(getUser(ud)));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ProjectResponse> getById(@PathVariable Long id, @AuthenticationPrincipal UserDetails ud) {
        return ResponseEntity.ok(projectService.getById(id, getUser(ud)));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ProjectResponse> update(@PathVariable Long id, @Valid @RequestBody ProjectRequest req, @AuthenticationPrincipal UserDetails ud) {
        return ResponseEntity.ok(projectService.update(id, req, getUser(ud)));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Map<String, String>> delete(@PathVariable Long id, @AuthenticationPrincipal UserDetails ud) {
        projectService.delete(id, getUser(ud));
        return ResponseEntity.ok(Map.of("message", "Project deleted"));
    }

    @GetMapping("/users")
    public ResponseEntity<List<UserSummaryDto>> getAllUsers() {
        return ResponseEntity.ok(projectService.getAllUsers());
    }

    private User getUser(UserDetails ud) {
        return userRepo.findByEmail(ud.getUsername()).orElseThrow();
    }
}
