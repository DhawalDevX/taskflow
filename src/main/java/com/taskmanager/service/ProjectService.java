package com.taskmanager.service;

import com.taskmanager.dto.*;
import com.taskmanager.entity.*;
import com.taskmanager.repository.*;
import org.springframework.stereotype.Service;
import java.util.*;
import java.util.stream.Collectors;

@Service
public class ProjectService {
    private final ProjectRepository projectRepo;
    private final UserRepository userRepo;
    private final TaskRepository taskRepo;

    public ProjectService(ProjectRepository pr, UserRepository ur, TaskRepository tr) {
        this.projectRepo = pr; this.userRepo = ur; this.taskRepo = tr;
    }

    public ProjectResponse create(ProjectRequest req, User currentUser) {
        Project project = Project.builder()
                .name(req.getName())
                .description(req.getDescription())
                .createdBy(currentUser)
                .build();
        List<User> members = new ArrayList<>();
        members.add(currentUser);
        if (req.getMemberIds() != null) {
            req.getMemberIds().forEach(id -> userRepo.findById(id).ifPresent(u -> { if (!members.contains(u)) members.add(u); }));
        }
        project.setMembers(members);
        return toResponse(projectRepo.save(project));
    }

    public List<ProjectResponse> getAll(User user) {
        List<Project> projects = user.getRole() == Role.ADMIN
                ? projectRepo.findAll()
                : projectRepo.findAllAccessibleByUser(user);
        return projects.stream().map(this::toResponse).collect(Collectors.toList());
    }

    public ProjectResponse getById(Long id, User user) {
        Project p = projectRepo.findById(id).orElseThrow(() -> new RuntimeException("Project not found"));
        checkAccess(p, user);
        return toResponse(p);
    }

    public ProjectResponse update(Long id, ProjectRequest req, User user) {
        Project p = projectRepo.findById(id).orElseThrow(() -> new RuntimeException("Project not found"));
        if (user.getRole() != Role.ADMIN && !p.getCreatedBy().getId().equals(user.getId()))
            throw new RuntimeException("Access denied");
        p.setName(req.getName());
        p.setDescription(req.getDescription());
        if (req.getMemberIds() != null) {
            List<User> members = new ArrayList<>();
            members.add(p.getCreatedBy());
            req.getMemberIds().forEach(mid -> userRepo.findById(mid).ifPresent(u -> { if (!members.contains(u)) members.add(u); }));
            p.setMembers(members);
        }
        return toResponse(projectRepo.save(p));
    }

    public void delete(Long id, User user) {
        Project p = projectRepo.findById(id).orElseThrow(() -> new RuntimeException("Project not found"));
        if (user.getRole() != Role.ADMIN && !p.getCreatedBy().getId().equals(user.getId()))
            throw new RuntimeException("Access denied");
        projectRepo.delete(p);
    }

    public List<UserSummaryDto> getAllUsers() {
        return userRepo.findAll().stream()
                .map(u -> new UserSummaryDto(u.getId(), u.getName(), u.getEmail(), u.getRole().name()))
                .collect(Collectors.toList());
    }

    private void checkAccess(Project project, User user) {
        if (user.getRole() == Role.ADMIN) return;
        boolean ok = project.getMembers().stream().anyMatch(m -> m.getId().equals(user.getId()))
                || project.getCreatedBy().getId().equals(user.getId());
        if (!ok) throw new RuntimeException("Access denied");
    }

    public ProjectResponse toResponse(Project p) {
        List<ProjectResponse.MemberDto> members = p.getMembers().stream()
                .map(m -> new ProjectResponse.MemberDto(m.getId(), m.getName(), m.getEmail(), m.getRole().name()))
                .collect(Collectors.toList());
        return ProjectResponse.builder()
                .id(p.getId()).name(p.getName()).description(p.getDescription())
                .createdBy(p.getCreatedBy().getName()).members(members)
                .totalTasks(taskRepo.countByProjectAndStatus(p, TaskStatus.TODO)
                        + taskRepo.countByProjectAndStatus(p, TaskStatus.IN_PROGRESS)
                        + taskRepo.countByProjectAndStatus(p, TaskStatus.DONE))
                .todoTasks(taskRepo.countByProjectAndStatus(p, TaskStatus.TODO))
                .inProgressTasks(taskRepo.countByProjectAndStatus(p, TaskStatus.IN_PROGRESS))
                .doneTasks(taskRepo.countByProjectAndStatus(p, TaskStatus.DONE))
                .createdAt(p.getCreatedAt())
                .build();
    }
}
