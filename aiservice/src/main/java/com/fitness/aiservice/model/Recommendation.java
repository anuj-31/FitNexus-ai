package com.fitness.aiservice.model;

import lombok.Builder;
import lombok.Data;
import lombok.AllArgsConstructor;
import lombok.NoArgsConstructor;
import org.springframework.cglib.core.Local;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.mongodb.core.mapping.Document;

import java.lang.annotation.Documented;
import java.time.LocalDateTime;
import java.util.List;

@Document(collection = "recommendations")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Recommendation {
    private  String id;
    private  String activityId;
    private  String userId;
    private  String type;
    private  String recommendation;
    private List<String>improvements;
    private List<String>suggestions;
    private List<String>safety;

    @CreatedDate
    private LocalDateTime createdAt;
    private  LocalDateTime updatedAt;


}
