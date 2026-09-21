import React from "react";
import { Box, Card, CardContent, LinearProgress, Stack, Typography } from "@mui/material";
import { CheckCircle2, Target } from "lucide-react";

import WeeklyGoalBreakdown from "./WeeklyGoalBreakdown";

const WeeklyGoalCard = ({ summary }) => {
  const progressValue = Math.min(summary?.progress ?? 0, 100);

  return (
    <Card
      sx={{
        height: "100%",
        background: "linear-gradient(135deg, rgba(16,22,25,0.96), rgba(11,17,20,0.96))",
        border: "1px solid rgba(255,255,255,0.08)",
        borderRadius: 4,
        boxShadow: "0 18px 40px rgba(0,0,0,0.16)",
      }}
    >
      <CardContent sx={{ p: 3 }}>
        <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 2.5 }}>
          <Stack direction="row" alignItems="center" spacing={1.25}>
            <Box
              sx={{
                width: 38,
                height: 38,
                borderRadius: 2,
                background: "rgba(79,212,161,0.12)",
                display: "grid",
                placeItems: "center",
              }}
            >
              <Target size={18} color="#9ae66e" />
            </Box>
            <Typography variant="h6" sx={{ fontWeight: 800, color: "#f2faf7" }}>
              Weekly Goal
            </Typography>
          </Stack>

          <CheckCircle2 size={18} color="#9ae66e" />
        </Stack>

        <Stack spacing={1.25}>
          <Typography variant="body2" sx={{ color: "#8ea1a8", textTransform: "uppercase", letterSpacing: 1.1 }}>
            Weekly target
          </Typography>
          <Typography variant="h4" sx={{ fontWeight: 800, color: "#f5faf7" }}>
            {summary?.weeklyTarget ?? 0} min
          </Typography>

          <Stack direction="row" justifyContent="space-between" alignItems="center">
            <Typography variant="body2" sx={{ color: "#9aa7ad" }}>
              Completed
            </Typography>
            <Typography variant="body2" sx={{ color: "#edf6f3", fontWeight: 700 }}>
              {summary?.completedMinutes ?? 0} min
            </Typography>
          </Stack>

          <Box>
            <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 0.75 }}>
              <Typography variant="body2" sx={{ color: "#9aa7ad" }}>
                Progress
              </Typography>
              <Typography variant="body2" sx={{ color: "#b9f9a8", fontWeight: 700 }}>
                {Math.round(progressValue)}%
              </Typography>
            </Stack>

            <LinearProgress
              variant="determinate"
              value={progressValue}
              sx={{
                height: 10,
                borderRadius: 999,
                background: "rgba(255,255,255,0.04)",
                "& .MuiLinearProgress-bar": {
                  borderRadius: 999,
                  background: "linear-gradient(90deg, #9ae66e, #4fd4a1)",
                },
              }}
            />
          </Box>
        </Stack>

        <Typography variant="body2" sx={{ color: "#b7c7cf", mt: 2.5, mb: 1.5 }}>
          This week
        </Typography>

        <WeeklyGoalBreakdown days={summary?.days || []} dailyGoal={summary?.dailyGoal ?? 60} />
      </CardContent>
    </Card>
  );
};

export default WeeklyGoalCard;
