package com.fitness.aiservice.service;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.client.WebClient;
import org.springframework.web.reactive.function.client.WebClientResponseException;
import reactor.util.retry.Retry;

import java.time.Duration;
import java.util.Map;

@Service
public class GeminiService {

    private final WebClient webClient;

    @Value("${gemini.api.url}")
    private String geminiApiUrl;

    @Value("${gemini.api.key}")
    private String geminiApiKey;

    public GeminiService(WebClient.Builder webClientBuilder) {
        this.webClient = webClientBuilder.build();
    }

    public String getRecommendations(String question) {

        // Try primary model
        String response = callGemini(
                "gemini-3.5-flash",
                question
        );

        if (response != null) {
            return response;
        }

        // Fallback model
        System.out.println(
                "gemini-3.5-flash unavailable. Trying fallback model..."
        );

        return callGemini(
                "gemini-3.5-flash-lite",
                question
        );
    }

    private String callGemini(String model, String question) {

        Map<String, Object> requestBody = Map.of(
                "model", model,
                "input", question
        );

        try {

            String response = webClient.post()
                    .uri(geminiApiUrl)
                    .header("x-goog-api-key", geminiApiKey)
                    .header("Content-Type", "application/json")
                    .bodyValue(requestBody)
                    .retrieve()
                    .bodyToMono(String.class)
                    .retryWhen(
                            Retry.backoff(3, Duration.ofSeconds(2))
                                    .filter(error ->
                                            error instanceof WebClientResponseException.ServiceUnavailable
                                                    || error instanceof WebClientResponseException.TooManyRequests
                                    )
                    )
                    .block();

            System.out.println(
                    "Gemini Response from " + model + ": " + response
            );

            return response;

        } catch (WebClientResponseException e) {

            System.err.println(
                    "Gemini Error [" + model + "]: "
                            + e.getStatusCode()
                            + " : "
                            + e.getResponseBodyAsString()
            );

            return null;

        } catch (Exception e) {

            System.err.println(
                    "Gemini Error [" + model + "]: "
                            + e.getClass().getSimpleName()
                            + " : "
                            + e.getMessage()
            );

            return null;
        }
    }
}