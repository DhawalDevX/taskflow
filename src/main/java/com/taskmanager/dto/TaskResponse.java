package com.taskmanager.dto;

import lombok.*;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Data @NoArgsConstructor @AllArgsConstructor @Builder
public class TaskResponse {
    private Long id;
    private String title;
    private String description;
    private String status;
    private Long projectId;
    private String projectName;
    private String assignedTo;
    private Long assignedToId;
    private String createdBy;
    private LocalDate dueDate;
    private LocalDateTime createdAt;
    private boolean overdue;
}
