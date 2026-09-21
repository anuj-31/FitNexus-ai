package com.fitness.activityservice.service;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.client.WebClient;
import org.springframework.web.reactive.function.client.WebClientRequestException;

@Service
@RequiredArgsConstructor
@Slf4j
public class UserValidationService {
    private  final WebClient userServiceWebClient;

//    @Value("${app.security.keycloak-enabled:false}")
//    private boolean keycloakEnabled;
//
//    @Value("${app.security.dev-user-id:local-dev-user}")
//    private String devUserId;

    public boolean validateUser(String userId) {

        log.info("========== USER VALIDATION ==========");
        log.info("userId received = {}", userId);
//        log.info("keycloakEnabled = {}", keycloakEnabled);
//        log.info("devUserId = {}", devUserId);
//
//        if (!keycloakEnabled && devUserId.equals(userId)) {
//            log.info("DEV USER VALIDATED");
//            return true;
//        }

        try {
            Boolean result = userServiceWebClient.get()
                    .uri("/api/users/{userId}/validate", userId)
                    .retrieve()
                    .bodyToMono(Boolean.class)
                    .block();

            log.info("User service validation result = {}", result);

            return Boolean.TRUE.equals(result);

        } catch (Exception e) {
            log.error("User validation failed for userId={}", userId, e);
            return false;
        }
    }
}
