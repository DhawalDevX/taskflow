package com.taskmanager.controller;

import com.taskmanager.dto.*;
import com.taskmanager.entity.User;
import com.taskmanager.repository.UserRepository;
import com.taskmanager.service.TaskService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/tasks")
public class TaskController {
    private final TaskService taskService;
    private final UserRepository userRepo;

    public TaskController(TaskService ts, UserRepository ur) {
        this.taskService = ts; this.userRepo = ur;
    }

    @PostMapping
    public ResponseEntity<TaskResponse> create(@Valid @RequestBody TaskRequest req,
                                                @AuthenticationPrincipal UserDetails ud) {
        return ResponseEntity.ok(taskService.create(req, getUser(ud)));
    }

    @GetMapping("/project/{projectId}")
    public ResponseEntity<List<TaskResponse>> getByProject(@PathVariable Long projectId,
                                                            @AuthenticationPrincipal UserDetails ud) {
        return ResponseEntity.ok(taskService.getByProject(projectId, getUser(ud)));
    }

    @GetMapping("/my")
    public ResponseEntity<List<TaskResponse>> getMyTasks(@AuthenticationPrincipal UserDetails ud) {
        return ResponseEntity.ok(taskService.getMyTasks(getUser(ud)));
    }

    @PutMapping("/{id}")
    public ResponseEntity<TaskResponse> update(@PathVariable Long id,
                                                @Valid @RequestBody TaskRequest req,
                                                @AuthenticationPrincipal UserDetails ud) {
        return ResponseEntity.ok(taskService.update(id, req, getUser(ud)));
    }

    @PatchMapping("/{id}/status")
    public ResponseEntity<TaskResponse> updateStatus(@PathVariable Long id,
                                                      @RequestBody Map<String, String> body,
                                                      @AuthenticationPrincipal UserDetails ud) {
        return ResponseEntity.ok(taskService.updateStatus(id, body.get("status"), getUser(ud)));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Map<String, String>> delete(@PathVariable Long id,
                                                       @AuthenticationPrincipal UserDetails ud) {
        taskService.delete(id, getUser(ud));
        return ResponseEntity.ok(Map.of("message", "Task deleted"));
    }

    private User getUser(UserDetails ud) {
        return userRepo.findByEmail(ud.getUsername()).orElseThrow();
    }
}
