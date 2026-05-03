package com.taskmanager.dto;

import jakarta.validation.constraints.*;
import lombok.*;
import java.time.LocalDate;

@Data @NoArgsConstructor @AllArgsConstructor
public class TaskRequest {
    @NotBlank
    private String title;
    private String description;
    private String status;
    @NotNull
    private Long projectId;
    private Long assignedToId;
    private LocalDate dueDate;
}
