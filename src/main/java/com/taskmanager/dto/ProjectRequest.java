package com.taskmanager.dto;

import jakarta.validation.constraints.*;
import lombok.*;
import java.util.List;

@Data @NoArgsConstructor @AllArgsConstructor
public class ProjectRequest {
    @NotBlank
    private String name;
    private String description;
    private List<Long> memberIds;
}
