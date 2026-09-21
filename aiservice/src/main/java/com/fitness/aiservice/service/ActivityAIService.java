package com.fitness.aiservice.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fitness.aiservice.model.Activity;
import com.fitness.aiservice.model.Recommendation;
import lombok.AllArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.*;

@Service
@Slf4j
@AllArgsConstructor
public class ActivityAIService {

    private final GeminiService geminiService;

    public Recommendation generateRecommendation(Activity activity) {

        try {
            log.info("Generating AI recommendation for activity: {}", activity.getId());

            String prompt = createPromptForActivity(activity);

            String aiResponse = geminiService.getRecommendations(prompt);

            log.info("RESPONSE FROM AI: {}", aiResponse);

            return processAiResponse(activity, aiResponse);

        } catch (Exception exception) {

            log.warn(
                    "Unable to generate an AI recommendation for activity {}",
                    activity.getId(),
                    exception
            );

            return createDefaultRecommendation(activity);
        }
    }


    private Recommendation processAiResponse(
            Activity activity,
            String aiResponse
    ) {

        try {

            ObjectMapper mapper = new ObjectMapper();

            JsonNode rootNode = mapper.readTree(aiResponse);

            /*
             * Gemini Interactions API response:
             *
             * {
             *   "steps": [
             *      {
             *          "type": "model_output",
             *          "content": [
             *              {
             *                  "type": "text",
             *                  "text": "..."
             *              }
             *          ]
             *      }
             *   ]
             * }
             */

            JsonNode textNode = rootNode
                    .path("steps")
                    .findValues("text")
                    .stream()
                    .findFirst()
                    .orElseThrow(() ->
                            new RuntimeException("AI response text not found")
                    );

            String jsonContent = textNode.asText()
                    .replace("```json", "")
                    .replace("```", "")
                    .trim();

            log.info("AI JSON CONTENT: {}", jsonContent);

            JsonNode analysisJson = mapper.readTree(jsonContent);


            // =========================
            // ANALYSIS
            // =========================

            JsonNode analysisNode = analysisJson.path("analysis");

            StringBuilder fullAnalysis = new StringBuilder();

            addAnalysisSection(
                    fullAnalysis,
                    analysisNode,
                    "overall",
                    "Overall: "
            );

            addAnalysisSection(
                    fullAnalysis,
                    analysisNode,
                    "pace",
                    "Pace: "
            );

            addAnalysisSection(
                    fullAnalysis,
                    analysisNode,
                    "heartRate",
                    "Heart Rate: "
            );

            addAnalysisSection(
                    fullAnalysis,
                    analysisNode,
                    "caloriesBurned",
                    "Calories Burned: "
            );


            // =========================
            // IMPROVEMENTS
            // =========================

            List<String> improvements =
                    extractImprovements(
                            analysisJson.path("improvements")
                    );


            // =========================
            // SUGGESTIONS
            // =========================

            List<String> suggestions =
                    extractSuggestions(
                            analysisJson.path("suggestions")
                    );


            // =========================
            // SAFETY
            // =========================

            List<String> safety =
                    extractSafetyGuidelines(
                            analysisJson.path("safety")
                    );


            // =========================
            // CREATE RECOMMENDATION
            // =========================

            return Recommendation.builder()
                    .activityId(activity.getId())
                    .userId(activity.getUserId())
                    .type(activity.getType().toString())
                    .recommendation(fullAnalysis.toString().trim())
                    .improvements(improvements)
                    .suggestions(suggestions)
                    .safety(safety)
                    .createdAt(LocalDateTime.now())
                    .build();

        } catch (Exception e) {

            log.error(
                    "Error while processing AI response for activity {}",
                    activity.getId(),
                    e
            );

            return createDefaultRecommendation(activity);
        }
    }


    // =========================================================
    // DEFAULT RECOMMENDATION
    // =========================================================

    private Recommendation createDefaultRecommendation(
            Activity activity
    ) {

        return Recommendation.builder()
                .activityId(activity.getId())
                .userId(activity.getUserId())
                .type(activity.getType().toString())
                .recommendation(
                        "Unable to generate detailed analysis"
                )
                .improvements(
                        Collections.singletonList(
                                "Continue with your current routine"
                        )
                )
                .suggestions(
                        Collections.singletonList(
                                "Consider consulting a fitness professional"
                        )
                )
                .safety(
                        Arrays.asList(
                                "Always warm up before exercise",
                                "Stay hydrated",
                                "Listen to your body"
                        )
                )
                .createdAt(LocalDateTime.now())
                .build();
    }


    // =========================================================
    // EXTRACT IMPROVEMENTS
    // =========================================================

    private List<String> extractImprovements(
            JsonNode improvementsNode
    ) {

        List<String> improvements = new ArrayList<>();

        if (improvementsNode.isArray()) {

            improvementsNode.forEach(imp -> {

                String area =
                        imp.path("area").asText();

                String detail =
                        imp.path("recommendation").asText();

                if (!area.isEmpty() || !detail.isEmpty()) {

                    improvements.add(
                            area + " : " + detail
                    );
                }
            });
        }

        return improvements.isEmpty()
                ? Collections.singletonList(
                "No specific improvements provided"
        )
                : improvements;
    }


    // =========================================================
    // EXTRACT SUGGESTIONS
    // =========================================================

    private List<String> extractSuggestions(
            JsonNode suggestionsNode
    ) {

        List<String> suggestions = new ArrayList<>();

        if (suggestionsNode.isArray()) {

            suggestionsNode.forEach(suggestion -> {

                String workout =
                        suggestion.path("workout").asText();

                String description =
                        suggestion.path("description").asText();

                if (!workout.isEmpty() || !description.isEmpty()) {

                    suggestions.add(
                            workout + " : " + description
                    );
                }
            });
        }

        return suggestions.isEmpty()
                ? Collections.singletonList(
                "No suggestions provided"
        )
                : suggestions;
    }


    // =========================================================
    // EXTRACT SAFETY
    // =========================================================

    private List<String> extractSafetyGuidelines(
            JsonNode safetyNode
    ) {

        List<String> safety = new ArrayList<>();

        if (safetyNode.isArray()) {

            safetyNode.forEach(s -> {

                String guideline = s.asText();

                if (!guideline.isEmpty()) {
                    safety.add(guideline);
                }
            });
        }

        return safety.isEmpty()
                ? Collections.singletonList(
                "No safety guidelines provided"
        )
                : safety;
    }


    // =========================================================
    // ADD ANALYSIS SECTION
    // =========================================================

    private void addAnalysisSection(
            StringBuilder sb,
            JsonNode node,
            String key,
            String label
    ) {

        JsonNode value = node.path(key);

        if (!value.isMissingNode()
                && !value.isNull()
                && !value.asText().isEmpty()) {

            sb.append(label)
                    .append(value.asText())
                    .append("\n\n");
        }
    }


    // =========================================================
    // CREATE PROMPT
    // =========================================================

    private String createPromptForActivity(
            Activity activity
    ) {

        return String.format("""
                
                Analyze this fitness activity and provide detailed
                fitness recommendations.
                
                Return ONLY valid JSON.
                Do not use markdown.
                Do not use ```json.
                
                Use EXACTLY this JSON structure:
                
                {
                  "analysis": {
                    "overall": "",
                    "pace": "",
                    "heartRate": "",
                    "caloriesBurned": ""
                  },
                  "improvements": [
                    {
                      "area": "",
                      "recommendation": ""
                    }
                  ],
                  "suggestions": [
                    {
                      "workout": "",
                      "description": ""
                    }
                  ],
                  "safety": [
                    ""
                  ]
                }
                
                Activity Type: %s
                Duration: %d minutes
                Calories Burned: %d
                Additional Metrics: %s
                
                """,
                activity.getType(),
                activity.getDuration(),
                activity.getCaloriesBurned(),
                activity.getAdditionalMetrics()
        );
    }
}