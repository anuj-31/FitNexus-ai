package com.fitness.aiservice.model;

/**
 * Kafka event contract used by AI-SERVICE.  It intentionally lives in this
 * service so AI-SERVICE can consume activity events without a build-time
 * dependency on ACTIVITY-SERVICE.
 */
public enum ActivityType {
    RUNNING,
    WALKING,
    CYCLING,
    SWIMMING,
    WEIGHT_TRAINING,
    YOGA,
    HIIT,
    CARDIO,
    STRETCHING,
    OTHER
}
