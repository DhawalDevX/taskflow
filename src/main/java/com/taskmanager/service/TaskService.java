package com.taskmanager.service;

import com.taskmanager.dto.*;
import com.taskmanager.entity.*;
import com.taskmanager.repository.*;
import org.springframework.stereotype.Service;
import java.time.LocalDate;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class TaskService {
    private final TaskRepository taskRepo;
    private final ProjectRepository projectRepo;
    private final UserRepository userRepo;

    public TaskService(TaskRepository tr, ProjectRepository pr, UserRepository ur) {
        this.taskRepo = tr; this.projectRepo = pr; this.userRepo = ur;
    }

    public TaskResponse create(TaskRequest req, User currentUser) {
        Project project = projectRepo.findById(req.getProjectId())
                .orElseThrow(() -> new RuntimeException("Project not found"));
        checkProjectAccess(project, currentUser);

        User assignedTo = null;
        if (req.getAssignedToId() != null)
            assignedTo = userRepo.findById(req.getAssignedToId()).orElse(null);

        Task task = Task.builder()
                .title(req.getTitle())
                .description(req.getDescription())
                .status(req.getStatus() != null ? TaskStatus.valueOf(req.getStatus()) : TaskStatus.TODO)
                .project(project)
                .assignedTo(assignedTo)
                .createdBy(currentUser)
                .dueDate(req.getDueDate())
                .build();

        return toResponse(taskRepo.save(task));
    }

    public List<TaskResponse> getByProject(Long projectId, User user) {
        Project project = projectRepo.findById(projectId)
                .orElseThrow(() -> new RuntimeException("Project not found"));
        checkProjectAccess(project, user);
        return taskRepo.findByProject(project).stream().map(this::toResponse).collect(Collectors.toList());
    }

    public List<TaskResponse> getMyTasks(User user) {
        return taskRepo.findByAssignedTo(user).stream().map(this::toResponse).collect(Collectors.toList());
    }

    public TaskResponse update(Long id, TaskRequest req, User user) {
        Task task = taskRepo.findById(id).orElseThrow(() -> new RuntimeException("Task not found"));
        checkProjectAccess(task.getProject(), user);

        task.setTitle(req.getTitle());
        task.setDescription(req.getDescription());
        if (req.getStatus() != null) task.setStatus(TaskStatus.valueOf(req.getStatus()));
        task.setDueDate(req.getDueDate());

        if (req.getAssignedToId() != null)
            task.setAssignedTo(userRepo.findById(req.getAssignedToId()).orElse(null));

        return toResponse(taskRepo.save(task));
    }

    public TaskResponse updateStatus(Long id, String status, User user) {
        Task task = taskRepo.findById(id).orElseThrow(() -> new RuntimeException("Task not found"));
        // Members can update status of tasks assigned to them; Admins can update any
        if (user.getRole() != Role.ADMIN) {
            boolean isAssignee = task.getAssignedTo() != null && task.getAssignedTo().getId().equals(user.getId());
            boolean isMember = task.getProject().getMembers().stream().anyMatch(m -> m.getId().equals(user.getId()));
            if (!isAssignee && !isMember) throw new RuntimeException("Access denied");
        }
        task.setStatus(TaskStatus.valueOf(status));
        return toResponse(taskRepo.save(task));
    }

    public void delete(Long id, User user) {
        Task task = taskRepo.findById(id).orElseThrow(() -> new RuntimeException("Task not found"));
        if (user.getRole() != Role.ADMIN && !task.getCreatedBy().getId().equals(user.getId()))
            throw new RuntimeException("Access denied");
        taskRepo.delete(task);
    }

    private void checkProjectAccess(Project project, User user) {
        if (user.getRole() == Role.ADMIN) return;
        boolean ok = project.getMembers().stream().anyMatch(m -> m.getId().equals(user.getId()))
                || project.getCreatedBy().getId().equals(user.getId());
        if (!ok) throw new RuntimeException("Access denied to this project");
    }

    public TaskResponse toResponse(Task t) {
        boolean overdue = t.getDueDate() != null && t.getDueDate().isBefore(LocalDate.now())
                && t.getStatus() != TaskStatus.DONE;
        return TaskResponse.builder()
                .id(t.getId())
                .title(t.getTitle())
                .description(t.getDescription())
                .status(t.getStatus().name())
                .projectId(t.getProject().getId())
                .projectName(t.getProject().getName())
                .assignedTo(t.getAssignedTo() != null ? t.getAssignedTo().getName() : null)
                .assignedToId(t.getAssignedTo() != null ? t.getAssignedTo().getId() : null)
                .createdBy(t.getCreatedBy().getName())
                .dueDate(t.getDueDate())
                .createdAt(t.getCreatedAt())
                .overdue(overdue)
                .build();
    }
}
