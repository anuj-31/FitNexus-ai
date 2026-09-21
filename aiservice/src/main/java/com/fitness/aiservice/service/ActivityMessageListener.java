package com.fitness.aiservice.service;

import com.fitness.aiservice.model.Activity;
import com.fitness.aiservice.model.Recommendation;
import com.fitness.aiservice.repository.RecommendationRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.kafka.annotation.KafkaListener;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
@Slf4j
public class ActivityMessageListener {

    private final ActivityAIService activityAIService;
    private final RecommendationRepository recommendationRepository;

    @KafkaListener(
            topics = "${kafka.topic.name}",
            groupId = "activity-processor-group"
    )
    public void processActivity(Activity activity) {

        log.info("Received Activity for processing : {}", activity.getId());

        try {
            // Generate AI recommendation
            Recommendation recommendation =
                    activityAIService.generateRecommendation(activity);

            // Save recommendation in MongoDB
            recommendationRepository.save(recommendation);

            log.info(
                    "AI Recommendation saved successfully for activity: {}",
                    activity.getId()
            );

        } catch (Exception e) {

            log.error(
                    "Failed to process activity: {}",
                    activity.getId(),
                    e
            );
        }
    }
}