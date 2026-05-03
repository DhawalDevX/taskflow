package com.taskmanager.dto;

import lombok.*;
import java.time.LocalDateTime;
import java.util.List;

@Data @NoArgsConstructor @AllArgsConstructor @Builder
public class ProjectResponse {
    private Long id;
    private String name;
    private String description;
    private String createdBy;
    private List<MemberDto> members;
    private long totalTasks;
    private long doneTasks;
    private long inProgressTasks;
    private long todoTasks;
    private LocalDateTime createdAt;

    @Data @AllArgsConstructor @NoArgsConstructor
    public static class MemberDto {
        private Long id;
        private String name;
        private String email;
        private String role;
    }
}
