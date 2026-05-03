package com.taskmanager.dto;

import lombok.*;

@Data @AllArgsConstructor @NoArgsConstructor
public class UserSummaryDto {
    private Long id;
    private String name;
    private String email;
    private String role;
}
