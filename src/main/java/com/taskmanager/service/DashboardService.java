package com.taskmanager.service;

import com.taskmanager.dto.*;
import com.taskmanager.entity.*;
import com.taskmanager.repository.*;
import org.springframework.stereotype.Service;
import java.time.LocalDate;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class DashboardService {
    private final TaskRepository taskRepo;
    private final ProjectRepository projectRepo;
    private final TaskService taskService;

    public DashboardService(TaskRepository tr, ProjectRepository pr, TaskService ts) {
        this.taskRepo = tr; this.projectRepo = pr; this.taskService = ts;
    }

    public DashboardResponse getDashboard(User user) {
        List<Task> allTasks;
        List<com.taskmanager.entity.Project> allProjects;

        if (user.getRole() == Role.ADMIN) {
            allTasks = taskRepo.findAll();
            allProjects = projectRepo.findAll();
        } else {
            allTasks = taskRepo.findAllAccessibleTasks(user);
            allProjects = projectRepo.findAllAccessibleByUser(user);
        }

        long todo = allTasks.stream().filter(t -> t.getStatus() == TaskStatus.TODO).count();
        long inProgress = allTasks.stream().filter(t -> t.getStatus() == TaskStatus.IN_PROGRESS).count();
        long done = allTasks.stream().filter(t -> t.getStatus() == TaskStatus.DONE).count();
        long overdue = allTasks.stream().filter(t -> t.getDueDate() != null
                && t.getDueDate().isBefore(LocalDate.now()) && t.getStatus() != TaskStatus.DONE).count();

        List<TaskResponse> recentTasks = allTasks.stream()
                .sorted((a, b) -> {
                    if (a.getCreatedAt() == null) return 1;
                    if (b.getCreatedAt() == null) return -1;
                    return b.getCreatedAt().compareTo(a.getCreatedAt());
                })
                .limit(5).map(taskService::toResponse).collect(Collectors.toList());

        return DashboardResponse.builder()
                .totalProjects(allProjects.size())
                .totalTasks(allTasks.size())
                .todoTasks(todo)
                .inProgressTasks(inProgress)
                .doneTasks(done)
                .overdueTasks(overdue)
                .recentTasks(recentTasks)
                .build();
    }
}
