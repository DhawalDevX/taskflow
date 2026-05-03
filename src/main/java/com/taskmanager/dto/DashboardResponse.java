package com.taskmanager.dto;

import lombok.*;
import java.util.List;

@Data @NoArgsConstructor @AllArgsConstructor @Builder
public class DashboardResponse {
    private long totalProjects;
    private long totalTasks;
    private long todoTasks;
    private long inProgressTasks;
    private long doneTasks;
    private long overdueTasks;
    private List<TaskResponse> recentTasks;
    private List<ProjectResponse> recentProjects;
}
