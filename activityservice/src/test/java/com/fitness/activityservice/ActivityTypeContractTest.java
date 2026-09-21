package com.fitness.activityservice;

import com.fitness.activityservice.model.ActivityType;
import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.assertEquals;

class ActivityTypeContractTest {

    @Test
    void walkingShouldBeAcceptedAsActivityType() {
        assertEquals(ActivityType.WALKING, ActivityType.valueOf("WALKING"));
    }
}
