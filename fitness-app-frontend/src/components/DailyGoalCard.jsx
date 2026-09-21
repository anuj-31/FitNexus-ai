import React, { useMemo, useState } from "react";
import {
  Box,
  Button,
  Card,
  CardContent,
  Divider,
  IconButton,
  LinearProgress,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import { PencilLine, Target } from "lucide-react";

import GoalDialog from "./GoalDialog";
import { clampGoalValue, getGoalMessage, getTodayGoalProgress } from "./goalUtils";

const DailyGoalCard = ({ activities, dailyGoal, onSaveGoal }) => {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [draftGoal, setDraftGoal] = useState(String(dailyGoal ?? 60));

  const todayProgress = useMemo(() => getTodayGoalProgress(activities, dailyGoal), [activities, dailyGoal]);

  React.useEffect(() => {
    setDraftGoal(String(dailyGoal ?? 60));
  }, [dailyGoal]);

  const ringRadius = 52;
  const ringCircumference = 2 * Math.PI * ringRadius;
  const visualProgress = Math.min(todayProgress.progressPercent, 100);
  const ringOffset = ringCircumference - (visualProgress / 100) * ringCircumference;

  const handleSetGoal = () => {
    const parsedValue = Number(draftGoal);

    if (!Number.isFinite(parsedValue) || parsedValue < 1 || parsedValue > 1440) {
      return;
    }

    onSaveGoal(clampGoalValue(parsedValue));
  };

  const summaryText =
    todayProgress.isComplete && todayProgress.excessMinutes > 0
      ? `Goal exceeded by ${todayProgress.excessMinutes} min`
      : todayProgress.isComplete
        ? "🎉 Daily goal completed!"
        : `${todayProgress.remainingMinutes} min remaining to reach your goal`;

  const motivationalMessage = getGoalMessage(visualProgress);

  return (
    <Card
      sx={{
        height: "100%",
        background: "linear-gradient(135deg, rgba(17,24,27,0.96), rgba(12,17,20,0.96))",
        border: "1px solid rgba(154,230,110,0.18)",
        borderRadius: 4,
        boxShadow: "0 18px 40px rgba(0,0,0,0.18)",
      }}
    >
      <CardContent sx={{ p: 3 }}>
        <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 2 }}>
          <Stack direction="row" alignItems="center" spacing={1.25}>
            <Box
              sx={{
                width: 38,
                height: 38,
                borderRadius: 2,
                background: "rgba(154,230,110,0.12)",
                display: "grid",
                placeItems: "center",
              }}
            >
              <Target size={18} color="#9ae66e" />
            </Box>
            <Typography variant="h6" sx={{ fontWeight: 800, color: "#f2faf7" }}>
              Daily Activity Goal
            </Typography>
          </Stack>

          <IconButton
            onClick={() => setIsDialogOpen(true)}
            aria-label="Edit daily goal"
            sx={{
              color: "#dcf5db",
              background: "rgba(255,255,255,0.03)",
              border: "1px solid rgba(255,255,255,0.05)",
              "&:hover": { background: "rgba(154,230,110,0.08)" },
            }}
          >
            <PencilLine size={16} />
          </IconButton>
        </Stack>

        <Stack direction={{ xs: "column", sm: "row" }} spacing={1.5} sx={{ mb: 2 }}>
          <TextField
            type="number"
            value={draftGoal}
            onChange={(event) => setDraftGoal(event.target.value)}
            label="Minutes"
            inputProps={{ min: 1, max: 1440, step: 1 }}
            fullWidth
            sx={{
              "& .MuiOutlinedInput-root": {
                background: "rgba(255,255,255,0.025)",
                borderRadius: 3,
                color: "#edf6f3",
                "& fieldset": { borderColor: "rgba(255,255,255,0.08)" },
                "&:hover fieldset": { borderColor: "rgba(154,230,110,0.35)" },
                "&.Mui-focused fieldset": { borderColor: "rgba(154,230,110,0.7)" },
              },
              "& .MuiInputBase-input": { color: "#edf6f3" },
            }}
          />

          <Button
            variant="contained"
            onClick={handleSetGoal}
            sx={{
              borderRadius: 999,
              px: 2.5,
              background: "linear-gradient(135deg, #9ae66e, #4fd4a1)",
              color: "#07110f",
              fontWeight: 800,
              textTransform: "none",
              whiteSpace: "nowrap",
            }}
          >
            Set Goal
          </Button>
        </Stack>

        <Typography variant="body2" sx={{ color: "#9aa7ad", mb: 2 }}>
          Default goal: {dailyGoal ?? 60} minutes/day
        </Typography>

        <Divider sx={{ borderColor: "rgba(255,255,255,0.08)", mb: 2.5 }} />

        <Stack direction={{ xs: "column", sm: "row" }} alignItems="center" spacing={2.5}>
          <Box sx={{ position: "relative", width: 120, height: 120 }}>
            <svg width="120" height="120" viewBox="0 0 120 120" style={{ transform: "rotate(-90deg)" }}>
              <circle
                cx="60"
                cy="60"
                r={ringRadius}
                stroke="rgba(255,255,255,0.08)"
                strokeWidth="10"
                fill="transparent"
              />
              <circle
                cx="60"
                cy="60"
                r={ringRadius}
                stroke="url(#goalProgressGradient)"
                strokeWidth="10"
                strokeLinecap="round"
                fill="transparent"
                strokeDasharray={ringCircumference}
                strokeDashoffset={ringOffset}
                style={{ transition: "stroke-dashoffset 0.5s ease" }}
              />
              <defs>
                <linearGradient id="goalProgressGradient" x1="0%" x2="100%" y1="0%" y2="100%">
                  <stop offset="0%" stopColor="#9ae66e" />
                  <stop offset="100%" stopColor="#4fd4a1" />
                </linearGradient>
              </defs>
            </svg>

            <Box
              sx={{
                position: "absolute",
                inset: 0,
                display: "grid",
                placeItems: "center",
                textAlign: "center",
                transform: "rotate(90deg)",
              }}
            >
              <Box>
                <Typography variant="caption" sx={{ color: "#9aa7ad", display: "block" }}>
                  Today
                </Typography>
                <Typography variant="h6" sx={{ fontWeight: 800, color: "#f5faf7" }}>
                  {todayProgress.todaysMinutes} / {todayProgress.dailyGoal} min
                </Typography>
              </Box>
            </Box>
          </Box>

          <Box sx={{ flex: 1 }}>
            <Typography variant="body2" sx={{ color: "#8ea1a8", textTransform: "uppercase", letterSpacing: 1.1 }}>
              Today’s Goal
            </Typography>
            <Typography variant="h4" sx={{ fontWeight: 800, color: "#f5faf7", mt: 0.75 }}>
              {todayProgress.todaysMinutes} / {todayProgress.dailyGoal} min
            </Typography>

            <Box sx={{ mt: 1.5, mb: 1.25 }}>
              <LinearProgress
                variant="determinate"
                value={visualProgress}
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

            <Typography variant="body2" sx={{ color: "#dfeef0", fontWeight: 700 }}>
              {summaryText}
            </Typography>

            <Typography variant="caption" sx={{ color: "#9aa7ad", display: "block", mt: 1 }}>
              {motivationalMessage}
            </Typography>
          </Box>
        </Stack>
      </CardContent>

      <GoalDialog
        open={isDialogOpen}
        currentGoal={dailyGoal}
        onClose={() => setIsDialogOpen(false)}
        onSave={(value) => {
          onSaveGoal(value);
          setIsDialogOpen(false);
        }}
      />
    </Card>
  );
};

export default DailyGoalCard;
