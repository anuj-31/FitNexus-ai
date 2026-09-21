package com.fitness.aiservice.service;

import com.fitness.aiservice.model.Recommendation;
import com.fitness.aiservice.repository.RecommendationRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.web.server.ResponseStatusException;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class RecommendationService {
    private final RecommendationRepository recommendationRepository;

    public  List<Recommendation> getUserRecommendation(String userId) {
        return  recommendationRepository.findByUserId(userId);
    }


    public  Recommendation getActivityRecommendation(String activityId) {
        return  recommendationRepository.findByActivityId(activityId)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND,
                        "No recommendation has been generated for activity " + activityId));
    }

    public void deleteActivityRecommendation(String activityId) {
        Recommendation recommendation = recommendationRepository.findByActivityId(activityId)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND,
                        "No recommendation has been generated for activity " + activityId));

        recommendationRepository.delete(recommendation);
    }
}
