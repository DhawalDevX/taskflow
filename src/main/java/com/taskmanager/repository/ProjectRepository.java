package com.taskmanager.repository;

import com.taskmanager.entity.Project;
import com.taskmanager.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import java.util.List;

public interface ProjectRepository extends JpaRepository<Project, Long> {
    List<Project> findByCreatedBy(User user);

    @Query("SELECT p FROM Project p JOIN p.members m WHERE m = :user")
    List<Project> findByMember(User user);

    @Query("SELECT p FROM Project p WHERE p.createdBy = :user OR :user MEMBER OF p.members")
    List<Project> findAllAccessibleByUser(User user);
}
