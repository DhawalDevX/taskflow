package com.taskmanager.dto;

import lombok.*;

@Data @AllArgsConstructor @NoArgsConstructor
public class AuthResponse {
    private String token;
    private String name;
    private String email;
    private String role;
    private Long userId;
}
