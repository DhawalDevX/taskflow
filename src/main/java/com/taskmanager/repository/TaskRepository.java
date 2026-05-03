package com.taskmanager.repository;

import com.taskmanager.entity.*;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import java.time.LocalDate;
import java.util.List;

public interface TaskRepository extends JpaRepository<Task, Long> {
    List<Task> findByProject(Project project);
    List<Task> findByAssignedTo(User user);
    List<Task> findByProjectAndStatus(Project project, TaskStatus status);

    @Query("SELECT t FROM Task t WHERE t.assignedTo = :user AND t.dueDate < :today AND t.status != 'DONE'")
    List<Task> findOverdueTasks(User user, LocalDate today);

    @Query("SELECT COUNT(t) FROM Task t WHERE t.project = :project AND t.status = :status")
    Long countByProjectAndStatus(Project project, TaskStatus status);

    @Query("SELECT t FROM Task t JOIN t.project p WHERE (p.createdBy = :user OR :user MEMBER OF p.members)")
    List<Task> findAllAccessibleTasks(User user);
}
