import React from "react";
import { Box, Chip, Stack, Typography } from "@mui/material";
import { Check } from "lucide-react";

const WeeklyGoalBreakdown = ({ days, dailyGoal }) => {
  if (!days || days.length === 0) {
    return (
      <Typography variant="body2" sx={{ color: "#9aa7ad" }}>
        No activity data available for this week yet.
      </Typography>
    );
  }

  return (
    <Stack spacing={1.1} sx={{ mt: 2 }}>
      {days.map((day) => {
        const progressText = `${day.minutes}/${dailyGoal} min`;

        return (
          <Stack
            key={day.key}
            direction="row"
            alignItems="center"
            justifyContent="space-between"
            sx={{
              px: 1.25,
              py: 0.9,
              borderRadius: 2,
              background: day.completed ? "rgba(154,230,110,0.08)" : "rgba(255,255,255,0.02)",
              border: day.completed ? "1px solid rgba(154,230,110,0.18)" : "1px solid rgba(255,255,255,0.05)",
            }}
          >
            <Box sx={{ display: "flex", alignItems: "center", gap: 1.25 }}>
              <Typography variant="body2" sx={{ color: "#edf6f3", fontWeight: 700, minWidth: 28 }}>
                {day.label}
              </Typography>
              <Typography variant="body2" sx={{ color: "#cfe1e6" }}>
                {progressText}
              </Typography>
            </Box>

            {day.completed ? (
              <Chip
                icon={<Check size={12} strokeWidth={3} />}
                label="Done"
                size="small"
                sx={{
                  background: "rgba(154,230,110,0.12)",
                  color: "#b9f9a8",
                  border: "1px solid rgba(154,230,110,0.18)",
                  fontWeight: 700,
                }}
              />
            ) : null}
          </Stack>
        );
      })}
    </Stack>
  );
};

export default WeeklyGoalBreakdown;
