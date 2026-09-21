import React, { useContext, useEffect, useMemo, useState } from "react";
import {
  Alert,
  AppBar,
  Avatar,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  Divider,
  Grid2,
  Stack,
  Typography,
} from "@mui/material";
import {
  Activity,
  BarChart3,
  CalendarRange,
  Clock3,
  Dumbbell,
  Flame,
  HeartPulse,
  Sparkles,
  Target,
  TrendingUp,
  Zap,
} from "lucide-react";
import { AuthContext } from "react-oauth2-code-pkce";
import { useDispatch } from "react-redux";
import {
  Navigate,
  NavLink,
  Route,
  Routes,
  useLocation,
  useNavigate,
  useParams,
} from "react-router";

import ActivityDetail from "./components/ActivityDetail";
import ActivityForm from "./components/ActivityForm";
import ActivityList from "./components/ActivityList";
import AllActivities from "./components/AllActivities";
import DailyGoalCard from "./components/DailyGoalCard";
import WeeklyGoalCard from "./components/WeeklyGoalCard";
import { getStoredDailyGoal, getTodayGoalProgress, getWeeklyGoalSummary, setStoredDailyGoal } from "./components/goalUtils";
import { getActivities, getActivityDetail } from "./services/api";
import { setCredentials } from "./store/authSlice";

const normalizeRecommendationText = (value) => {
  if (!value) return "";

  if (typeof value === "string") {
    return value.trim();
  }

  if (Array.isArray(value)) {
    return value
      .map((item) => normalizeRecommendationText(item))
      .filter(Boolean)
      .join("\n\n");
  }

  if (typeof value === "object") {
    const entries = Object.entries(value)
      .map(([key, item]) => {
        const cleanedKey = key.replace(/([a-z])([A-Z])/g, "$1 $2");
        const cleanedValue = normalizeRecommendationText(item);
        return cleanedValue ? `${cleanedKey}: ${cleanedValue}` : "";
      })
      .filter(Boolean);

    return entries.join("\n\n");
  }

  return String(value);
};

const parseRecommendationSections = (rawRecommendation) => {
  const recommendationText = normalizeRecommendationText(rawRecommendation);

  if (!recommendationText) {
    return [];
  }

  const normalized = recommendationText
    .replace(/\r/g, "")
    .replace(/\n{3,}/g, "\n\n")
    .trim();

  const explicitPatterns = [
    { label: "Performance Summary", regex: /(performance summary|summary|overview)/i },
    { label: "What You Did Well", regex: /(what you did well|strengths|what went well)/i },
    { label: "Areas to Improve", regex: /(areas to improve|improvements|what to improve|opportunities)/i },
    { label: "Recovery Advice", regex: /(recovery advice|recovery|recovery plan)/i },
    { label: "Next Workout Suggestion", regex: /(next workout suggestion|next workout|recommended next workout)/i },
  ];

  const sections = explicitPatterns
    .map(({ label, regex }) => {
      const match = normalized.match(new RegExp(`(${label}[:\-]?\\s*\\n?)([\\s\\S]*?)(?=(?:${explicitPatterns
        .filter((pattern) => pattern.label !== label)
        .map((pattern) => pattern.label)
        .join("|")})|$)`, "i"));

      if (!match) {
        return null;
      }

      const body = match[2].replace(/^\s*[-•]\s*/gm, "").trim();
      return body ? { label, body } : null;
    })
    .filter(Boolean);

  if (sections.length > 0) {
    return sections;
  }

  const paragraphs = normalized
    .split(/\n\s*\n|\.(?=\s+[A-Z])|(?<=\d)\s*\n/)
    .map((paragraph) => paragraph.replace(/\s+/g, " ").trim())
    .filter(Boolean);

  return paragraphs.length > 0
    ? [{ label: "Performance Summary", body: paragraphs.join(" ") }]
    : [{ label: "Performance Summary", body: normalized }];
};

const StatCard = ({ label, value, detail, accent, icon: Icon }) => (
  <Card
    sx={{
      height: "100%",
      background: "linear-gradient(135deg, rgba(20, 24, 31, 0.96), rgba(13, 17, 22, 0.94))",
      border: "1px solid rgba(255,255,255,0.08)",
      borderRadius: 4,
      transition: "transform 0.2s ease, box-shadow 0.2s ease, border-color 0.2s ease",
      boxShadow: "0 14px 30px rgba(0,0,0,0.18)",
      "&:hover": {
        transform: "translateY(-4px)",
        boxShadow: `0 18px 32px ${accent}22`,
        borderColor: `${accent}66`,
      },
    }}
  >
    <CardContent sx={{ p: 3 }}>
      <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 2 }}>
        <Box
          sx={{
            width: 42,
            height: 42,
            borderRadius: 2,
            display: "grid",
            placeItems: "center",
            background: `linear-gradient(135deg, ${accent}, ${accent}44)`,
            boxShadow: `0 8px 18px ${accent}33`,
          }}
        >
          <Icon size={18} strokeWidth={2.2} />
        </Box>
        <Chip
          label={label}
          size="small"
          sx={{
            background: "rgba(255,255,255,0.04)",
            color: "#edf5f1",
            borderRadius: 999,
            fontWeight: 700,
          }}
        />
      </Stack>

      <Typography variant="h4" sx={{ fontWeight: 800, color: "#f5f7f7", mb: 0.5 }}>
        {value}
      </Typography>
      <Typography variant="body2" sx={{ color: "#9aa7ad" }}>
        {detail}
      </Typography>
    </CardContent>
  </Card>
);

const AICoachPage = () => {
  const { activityId } = useParams();
  const [activity, setActivity] = useState(null);
  const [isLoading, setIsLoading] = useState(Boolean(activityId));
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!activityId) {
      setActivity(null);
      setIsLoading(false);
      setError("");
      return;
    }

    let active = true;

    const loadActivity = async () => {
      try {
        setIsLoading(true);
        setError("");

        const detailResponse = await getActivityDetail(activityId);
        if (active) {
          setActivity(detailResponse?.data || null);
        }
      } catch {
        if (active) {
          setError("AI recommendations are temporarily unavailable. Please try again in a moment.");
          setActivity(null);
        }
      } finally {
        if (active) {
          setIsLoading(false);
        }
      }
    };

    loadActivity();
    return () => {
      active = false;
    };
  }, [activityId]);

  const handleGenerateRecommendation = async () => {
    if (!activityId) return;

    try {
      setIsGenerating(true);
      setError("");

      const detailResponse = await getActivityDetail(activityId);
      const nextActivity = detailResponse?.data || null;
      setActivity(nextActivity);

      const hasRecommendation = Boolean(
        nextActivity?.recommendation ||
          nextActivity?.aiRecommendation ||
          nextActivity?.message ||
          nextActivity?.summary
      );

      if (!hasRecommendation) {
        setError("AI recommendations are temporarily unavailable. Please try again in a moment.");
      }
    } catch {
      setError("AI recommendations are temporarily unavailable. Please try again in a moment.");
    } finally {
      setIsGenerating(false);
    }
  };

  if (!activityId) {
    return (
      <Box sx={{ display: "flex", flexDirection: "column", gap: 3, pb: 4 }}>
        <Card
          sx={{
            background: "linear-gradient(135deg, rgba(17, 24, 26, 0.96), rgba(10, 15, 17, 0.96))",
            border: "1px solid rgba(255,255,255,0.08)",
            borderRadius: 4,
          }}
        >
          <CardContent sx={{ p: { xs: 2.5, md: 4 } }}>
            <Stack direction="row" alignItems="center" spacing={1.5} sx={{ mb: 2 }}>
              <Box
                sx={{
                  width: 46,
                  height: 46,
                  borderRadius: 2,
                  display: "grid",
                  placeItems: "center",
                  background: "rgba(154,230,110,0.12)",
                  border: "1px solid rgba(154,230,110,0.22)",
                  color: "#b9f9a8",
                }}
              >
                <Sparkles size={18} />
              </Box>
              <Typography variant="h4" sx={{ fontWeight: 800, color: "#f3f7f7" }}>
                AI Coach
              </Typography>
            </Stack>

            <Typography variant="body1" sx={{ color: "#a9bac2", lineHeight: 1.7, maxWidth: 720 }}>
              Your coaching recommendations are generated by the existing backend recommendation service and surfaced through the same activity detail flow.
            </Typography>
          </CardContent>
        </Card>
      </Box>
    );
  }

  if (isLoading) {
    return (
      <Box sx={{ display: "flex", flexDirection: "column", gap: 3, pb: 4 }}>
        <Card sx={{ borderRadius: 4, background: "rgba(12,18,21,0.94)", border: "1px solid rgba(255,255,255,0.08)" }}>
          <CardContent sx={{ p: 3 }}>
            <Skeleton variant="text" width="35%" height={36} sx={{ mb: 2 }} />
            <Skeleton variant="rectangular" height={120} sx={{ borderRadius: 3 }} />
          </CardContent>
        </Card>
      </Box>
    );
  }

  if (error && !activity) {
    return (
      <Box sx={{ display: "flex", flexDirection: "column", gap: 3, pb: 4 }}>
        <Alert severity="error" sx={{ background: "rgba(98, 26, 26, 0.18)", border: "1px solid rgba(244, 67, 54, 0.2)" }}>
          {error}
        </Alert>
      </Box>
    );
  }

  if (!activity) {
    return (
      <Box sx={{ display: "flex", flexDirection: "column", gap: 3, pb: 4 }}>
        <Alert severity="error" sx={{ background: "rgba(98, 26, 26, 0.18)", border: "1px solid rgba(244, 67, 54, 0.2)" }}>
          AI recommendations are temporarily unavailable. Please try again in a moment.
        </Alert>
      </Box>
    );
  }

  const recommendation = activity.recommendation || activity.aiRecommendation || null;
  const activityDate = activity.createdAt || activity.created_at || "";
  const recommendationSections = parseRecommendationSections(recommendation);

  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: 3, pb: 4 }}>
      <Card
        sx={{
          background: "linear-gradient(135deg, rgba(19,25,31,0.98), rgba(10,16,18,0.96))",
          border: "1px solid rgba(255,255,255,0.08)",
          borderRadius: 4,
        }}
      >
        <CardContent sx={{ p: { xs: 2.5, md: 4 } }}>
          <Stack direction="row" alignItems="center" spacing={1.5} sx={{ mb: 3 }}>
            <Box
              sx={{
                width: 46,
                height: 46,
                borderRadius: 2,
                display: "grid",
                placeItems: "center",
                background: "rgba(154,230,110,0.12)",
                border: "1px solid rgba(154,230,110,0.22)",
                color: "#b9f9a8",
              }}
            >
              <Sparkles size={18} />
            </Box>
            <Typography variant="h4" sx={{ fontWeight: 800, color: "#f3f7f7" }}>
              AI Coach
            </Typography>
          </Stack>

          <Grid2 container spacing={2.5} sx={{ mb: 1 }}>
            <Grid2 size={{ xs: 12, md: 6 }}>
              <Card sx={{ background: "rgba(13,20,22,0.9)", border: "1px solid rgba(255,255,255,0.06)", borderRadius: 3 }}>
                <CardContent>
                  <Typography variant="caption" sx={{ color: "#8da2ab", textTransform: "uppercase", letterSpacing: 1.2 }}>
                    Activity type
                  </Typography>
                  <Typography variant="h5" sx={{ fontWeight: 800, color: "#f5faf8", mt: 1 }}>
                    {activity.type || "Workout"}
                  </Typography>
                </CardContent>
              </Card>
            </Grid2>
            <Grid2 size={{ xs: 12, md: 6 }}>
              <Card sx={{ background: "rgba(13,20,22,0.9)", border: "1px solid rgba(255,255,255,0.06)", borderRadius: 3 }}>
                <CardContent>
                  <Typography variant="caption" sx={{ color: "#8da2ab", textTransform: "uppercase", letterSpacing: 1.2 }}>
                    Date
                  </Typography>
                  <Typography variant="h5" sx={{ fontWeight: 800, color: "#f5faf8", mt: 1 }}>
                    {activityDate ? new Date(activityDate).toLocaleString() : "—"}
                  </Typography>
                </CardContent>
              </Card>
            </Grid2>
            <Grid2 size={{ xs: 12, md: 6 }}>
              <Card sx={{ background: "rgba(13,20,22,0.9)", border: "1px solid rgba(255,255,255,0.06)", borderRadius: 3 }}>
                <CardContent>
                  <Typography variant="caption" sx={{ color: "#8da2ab", textTransform: "uppercase", letterSpacing: 1.2 }}>
                    Duration
                  </Typography>
                  <Typography variant="h5" sx={{ fontWeight: 800, color: "#f5faf8", mt: 1 }}>
                    {activity.duration ?? "—"} min
                  </Typography>
                </CardContent>
              </Card>
            </Grid2>
            <Grid2 size={{ xs: 12, md: 6 }}>
              <Card sx={{ background: "rgba(13,20,22,0.9)", border: "1px solid rgba(255,255,255,0.06)", borderRadius: 3 }}>
                <CardContent>
                  <Typography variant="caption" sx={{ color: "#8da2ab", textTransform: "uppercase", letterSpacing: 1.2 }}>
                    Calories burned
                  </Typography>
                  <Typography variant="h5" sx={{ fontWeight: 800, color: "#f5faf8", mt: 1 }}>
                    {activity.caloriesBurned ?? "—"} kcal
                  </Typography>
                </CardContent>
              </Card>
            </Grid2>
          </Grid2>
        </CardContent>
      </Card>

      <Card
        sx={{
          background: "linear-gradient(135deg, rgba(24,31,31,0.96), rgba(12,17,21,0.96))",
          border: "1px solid rgba(154,230,110,0.18)",
          borderRadius: 4,
          boxShadow: "0 18px 40px rgba(154,230,110,0.12)",
        }}
      >
        <CardContent sx={{ p: { xs: 2.5, md: 3.5 } }}>
          <Stack direction={{ xs: "column", sm: "row" }} justifyContent="space-between" alignItems={{ xs: "flex-start", sm: "center" }} spacing={2} sx={{ mb: 2.5 }}>
            <Stack direction="row" alignItems="center" spacing={1.5}>
              <Box sx={{ width: 42, height: 42, borderRadius: 2, display: "grid", placeItems: "center", background: "rgba(154,230,110,0.14)", color: "#b9f9a8", fontSize: 22 }}>
                ✨
              </Box>
              <Typography variant="h5" sx={{ fontWeight: 800, color: "#f4faf7" }}>
                AI Recommendation
              </Typography>
            </Stack>

            {!recommendation && (
              <Button
                variant="contained"
                onClick={handleGenerateRecommendation}
                disabled={isGenerating}
                sx={{
                  borderRadius: 999,
                  background: "linear-gradient(135deg, #9ae66e, #4fd4a1)",
                  color: "#07110f",
                  fontWeight: 800,
                  textTransform: "none",
                  px: 2.5,
                  py: 1,
                  boxShadow: "0 14px 28px rgba(154,230,110,0.18)",
                  "&:hover": { boxShadow: "0 18px 30px rgba(154,230,110,0.22)" },
                }}
              >
                {isGenerating ? "Analyzing your workout..." : "Analyze"}
              </Button>
            )}
          </Stack>

          {isGenerating ? (
            <Box sx={{ py: 1.5, display: "flex", flexDirection: "column", gap: 1.5 }}>
              <Skeleton variant="text" width="45%" height={28} />
              <Skeleton variant="rectangular" height={110} sx={{ borderRadius: 3 }} />
              <Skeleton variant="text" width="70%" height={24} />
            </Box>
          ) : error ? (
            <Alert severity="error" sx={{ background: "rgba(98, 26, 26, 0.18)", border: "1px solid rgba(244, 67, 54, 0.2)" }}>
              AI recommendation is temporarily unavailable. Please try again shortly.
            </Alert>
          ) : recommendation ? (
            <Stack spacing={2.5}>
              {recommendationSections.map((section) => (
                <Box
                  key={section.label}
                  sx={{
                    background: "rgba(12,18,21,0.82)",
                    border: "1px solid rgba(255,255,255,0.06)",
                    borderRadius: 3,
                    p: 2.5,
                  }}
                >
                  <Typography variant="h6" sx={{ color: "#f3f7f7", fontWeight: 800, mb: 1 }}>
                    {section.label}
                  </Typography>
                  <Typography variant="body1" sx={{ color: "#dfeef0", lineHeight: 1.7, whiteSpace: "pre-line" }}>
                    {section.body}
                  </Typography>
                </Box>
              ))}
            </Stack>
          ) : (
            <Typography variant="body1" sx={{ color: "#b7c7cf" }}>
              AI recommendation is temporarily unavailable. Please try again shortly.
            </Typography>
          )}
        </CardContent>
      </Card>
    </Box>
  );
};

const LoginPage = () => {
  const { logIn } = useContext(AuthContext);

  return (
    <Box
      sx={{
        minHeight: "100vh",
        display: "grid",
        gridTemplateColumns: { xs: "1fr", md: "1.2fr 0.8fr" },
        background: "radial-gradient(circle at top, rgba(154,230,110,0.16), transparent 30%), #07110f",
        color: "#edf6f3",
        position: "relative",
        overflow: "hidden",
      }}
    >
      <Box
        sx={{
          position: "absolute",
          inset: 0,
          background: "radial-gradient(circle at 20% 20%, rgba(154,230,110,0.18), transparent 28%), radial-gradient(circle at 80% 10%, rgba(79,212,161,0.12), transparent 22%)",
          pointerEvents: "none",
        }}
      />

      <Box
        sx={{
          p: { xs: 4, md: 7 },
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          position: "relative",
          zIndex: 1,
        }}
      >
        <Box sx={{ maxWidth: 620, ml: { md: 2 } }}>
          <Chip
            label="FitNexus AI"
            sx={{
              background: "rgba(154,230,110,0.12)",
              color: "#b9f9a8",
              border: "1px solid rgba(154,230,110,0.18)",
              fontWeight: 700,
              mb: 3,
            }}
          />
          <Typography variant="h2" sx={{ fontWeight: 800, letterSpacing: "-0.06em", mb: 2, lineHeight: 1.05 }}>
            Train smarter.
            <br />
            Move stronger.
            <br />
            Live better.
          </Typography>
          <Typography variant="h6" sx={{ color: "#a6b9bf", maxWidth: 500, lineHeight: 1.6 }}>
            AI-guided training, smarter recovery, and consistent progress — all in one premium fitness command center.
          </Typography>

          <Stack direction={{ xs: "column", sm: "row" }} spacing={2} sx={{ mt: 4 }}>
            <Box sx={{ display: "flex", alignItems: "center", gap: 1.25, color: "#dfeef0" }}>
              <Zap size={16} color="#9ae66e" />
              <Typography variant="body2">Smart coaching</Typography>
            </Box>
            <Box sx={{ display: "flex", alignItems: "center", gap: 1.25, color: "#dfeef0" }}>
              <HeartPulse size={16} color="#9ae66e" />
              <Typography variant="body2">Progress tracking</Typography>
            </Box>
          </Stack>
        </Box>
      </Box>

      <Box
        sx={{
          p: { xs: 3, md: 5 },
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          position: "relative",
          zIndex: 1,
        }}
      >
        <Card
          sx={{
            width: "100%",
            maxWidth: 430,
            p: 1,
            borderRadius: 4,
            background: "linear-gradient(180deg, rgba(17, 22, 26, 0.96), rgba(13, 17, 19, 0.94))",
            border: "1px solid rgba(255,255,255,0.08)",
            boxShadow: "0 28px 60px rgba(0,0,0,0.35)",
            backdropFilter: "blur(12px)",
          }}
        >
          <CardContent sx={{ p: 4 }}>
            <Stack spacing={3} alignItems="center" sx={{ textAlign: "center" }}>
              <Avatar
                sx={{
                  width: 72,
                  height: 72,
                  background: "linear-gradient(135deg, #9ae66e, #45d39b)",
                  color: "#0c1718",
                  fontSize: 32,
                  fontWeight: 800,
                  boxShadow: "0 16px 30px rgba(154,230,110,0.25)",
                }}
              >
                F
              </Avatar>

              <Box>
                <Typography variant="h4" sx={{ fontWeight: 800, color: "#f3f7f7", mb: 1 }}>
                  Welcome to FitNexus AI
                </Typography>
                <Typography variant="body1" sx={{ color: "#9aa7ad" }}>
                  Continue securely with Keycloak
                </Typography>
              </Box>

              <Button
                variant="contained"
                size="large"
                onClick={() => logIn()}
                sx={{
                  width: "100%",
                  borderRadius: 3,
                  background: "linear-gradient(135deg, #9ae66e, #4fd4a1)",
                  color: "#091410",
                  px: 3,
                  py: 1.5,
                  fontWeight: 800,
                  boxShadow: "0 18px 34px rgba(154,230,110,0.28)",
                  transition: "transform 0.2s ease, box-shadow 0.2s ease",
                  "&:hover": {
                    transform: "translateY(-2px)",
                    boxShadow: "0 20px 36px rgba(154,230,110,0.35)",
                  },
                }}
              >
                LOGIN
              </Button>
            </Stack>
          </CardContent>
        </Card>
      </Box>
    </Box>
  );
};

const DashboardPage = () => {
  const [activities, setActivities] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [dailyGoal, setDailyGoal] = useState(() => getStoredDailyGoal());

  useEffect(() => {
    let active = true;

    const loadActivities = async () => {
      try {
        setIsLoading(true);
        const response = await getActivities();
        if (active) {
          const nextActivities = response?.data || [];
          setActivities(nextActivities);
          setError("");
        }
      } catch {
        if (active) {
          setError("We couldn’t load your recent workouts. Please try again.");
        }
      } finally {
        if (active) {
          setIsLoading(false);
        }
      }
    };

    loadActivities();
    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    setStoredDailyGoal(dailyGoal);
  }, [dailyGoal]);

  const metrics = useMemo(() => {
    const totalActivities = activities.length;
    const totalDuration = activities.reduce((sum, item) => sum + Number(item.duration || 0), 0);
    const totalCalories = activities.reduce((sum, item) => sum + Number(item.caloriesBurned || 0), 0);
    const latest = [...activities].sort(
      (a, b) => new Date(b.createdAt || b.created_at || 0) - new Date(a.createdAt || a.created_at || 0),
    )[0];

    const sortedActivities = [...activities].sort(
      (a, b) => new Date(b.createdAt || b.created_at || 0) - new Date(a.createdAt || a.created_at || 0),
    );

    let currentStreak = 0;
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const activityDates = new Set(
      activities.map((item) => {
        const date = new Date(item.createdAt || item.created_at || 0);
        return date.toISOString().slice(0, 10);
      }),
    );

    let cursor = new Date(today);
    while (activityDates.has(cursor.toISOString().slice(0, 10))) {
      currentStreak += 1;
      cursor.setDate(cursor.getDate() - 1);
    }

    const todaysActivities = activities.filter((item) => {
      const itemDate = new Date(item.createdAt || item.created_at || 0);
      return itemDate.toDateString() === today.toDateString();
    });

    const todayDuration = todaysActivities.reduce((sum, item) => sum + Number(item.duration || 0), 0);
    const weeklySeries = Array.from({ length: 7 }, (_, index) => {
      const date = new Date();
      date.setDate(date.getDate() - (6 - index));
      const key = date.toISOString().slice(0, 10);
      const total = activities
        .filter((item) => {
          const itemDate = new Date(item.createdAt || item.created_at || 0);
          return itemDate.toISOString().slice(0, 10) === key;
        })
        .reduce((sum, item) => sum + Number(item.duration || 0), 0);

      return {
        label: date.toLocaleDateString("en-US", { weekday: "short" }),
        value: total,
        date: date.toLocaleDateString("en-US", { month: "short", day: "numeric" }),
      };
    });

    const averageDuration = weeklySeries.length ? Math.round(weeklySeries.reduce((sum, item) => sum + item.value, 0) / weeklySeries.length) : 0;
    const goalProgress = Math.min((totalDuration / 180) * 100, 100);
    const todayGoalProgress = getTodayGoalProgress(activities, dailyGoal);
    const weeklyGoalSummary = getWeeklyGoalSummary(activities, dailyGoal, new Date());

    return {
      totalActivities,
      totalDuration,
      totalCalories,
      latest,
      todayDuration,
      weeklySeries,
      averageDuration,
      currentStreak,
      goalProgress,
      sortedActivities,
      todayGoalProgress,
      weeklyGoalSummary,
    };
  }, [activities, dailyGoal]);

  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: 3, pb: 4 }}>
      <Box
        sx={{
          background: "linear-gradient(135deg, rgba(17, 25, 23, 0.96), rgba(11, 18, 22, 0.94))",
          border: "1px solid rgba(154, 230, 110, 0.18)",
          borderRadius: 5,
          p: { xs: 2.5, md: 4 },
          boxShadow: "0 18px 50px rgba(0,0,0,0.22)",
          position: "relative",
          overflow: "hidden",
        }}
      >
        <Box
          sx={{
            position: "absolute",
            inset: "auto -8% -30% auto",
            width: 280,
            height: 280,
            background: "radial-gradient(circle, rgba(154,230,110,0.26), transparent 60%)",
            pointerEvents: "none",
          }}
        />

        <Stack
          direction={{ xs: "column", md: "row" }}
          justifyContent="space-between"
          alignItems={{ xs: "flex-start", md: "center" }}
          spacing={3}
          sx={{ position: "relative", zIndex: 1 }}
        >
          <Box sx={{ flex: 1 }}>
            <Chip
              label="AI-powered fitness dashboard"
              sx={{
                background: "rgba(154,230,110,0.12)",
                color: "#b9f9a8",
                border: "1px solid rgba(154,230,110,0.18)",
                fontWeight: 700,
                mb: 2,
              }}
            />
            <Stack direction="row" alignItems="center" spacing={1.5} sx={{ mb: 1.5 }}>
              <Typography
                variant="h3"
                sx={{
                  fontWeight: 800,
                  letterSpacing: "-0.06em",
                  color: "#f3f7f6",
                  lineHeight: 1.08,
                }}
              >
                Good to see you back 👋
              </Typography>
              <Sparkles size={22} color="#b9f9a8" />
            </Stack>
            <Typography variant="h6" sx={{ color: "#b7c7cf", maxWidth: 540, lineHeight: 1.5 }}>
              Ready to crush your goals today?
            </Typography>
          </Box>

          <Box
            sx={{
              minWidth: { xs: "100%", md: 300 },
              p: 2,
              borderRadius: 3,
              background: "rgba(255,255,255,0.03)",
              border: "1px solid rgba(255,255,255,0.06)",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              gap: 2,
            }}
          >
            <Box>
              <Typography variant="caption" sx={{ color: "#8ea1a8", textTransform: "uppercase", letterSpacing: 1.4 }}>
                Today’s workout
              </Typography>
              <Typography variant="h5" sx={{ fontWeight: 700, color: "#edf8ef", mt: 1 }}>
                {metrics.latest ? metrics.latest.type : "No workout yet"}
              </Typography>
              <Typography variant="body2" sx={{ color: "#9aa7ad" }}>
                {metrics.latest
                  ? `${metrics.todayDuration || metrics.latest.duration} min • ${metrics.latest.caloriesBurned || 0} kcal`
                  : "Log your first workout to start tracking"}
              </Typography>
            </Box>

            <Box
              sx={{
                width: 58,
                height: 58,
                borderRadius: "50%",
                background: `conic-gradient(#9ae66e ${Math.min(metrics.goalProgress, 100)}%, rgba(255,255,255,0.08) 0)`,
                display: "grid",
                placeItems: "center",
                boxShadow: "inset 0 0 0 1px rgba(255,255,255,0.08)",
              }}
            >
              <Box
                sx={{
                  width: 40,
                  height: 40,
                  borderRadius: "50%",
                  background: "#0d1719",
                  display: "grid",
                  placeItems: "center",
                  fontSize: 11,
                  fontWeight: 800,
                  color: "#b9f9a8",
                }}
              >
                {Math.round(metrics.goalProgress)}%
              </Box>
            </Box>
          </Box>
        </Stack>
      </Box>

      <Grid2 container spacing={3}>
        <Grid2 size={{ xs: 12, sm: 6, md: 3 }}>
          <StatCard label="Total Workouts" value={metrics.totalActivities} detail="Logged sessions" accent="#9ae66e" icon={BarChart3} />
        </Grid2>
        <Grid2 size={{ xs: 12, sm: 6, md: 3 }}>
          <StatCard label="Total Minutes" value={`${metrics.totalDuration} min`} detail="Training minutes" accent="#7dd3fc" icon={Clock3} />
        </Grid2>
        <Grid2 size={{ xs: 12, sm: 6, md: 3 }}>
          <StatCard label="Calories Burned" value={`${metrics.totalCalories} kcal`} detail="Energy output" accent="#fbbf24" icon={Flame} />
        </Grid2>
        <Grid2 size={{ xs: 12, sm: 6, md: 3 }}>
          <StatCard label="Current Streak" value={`${metrics.currentStreak} day${metrics.currentStreak === 1 ? "" : "s"}`} detail={metrics.currentStreak > 0 ? "Consistent training" : "No active streak yet"} accent="#c4b5fd" icon={Target} />
        </Grid2>
      </Grid2>

      <Grid2 container spacing={3} sx={{ mt: 0.5 }}>
        <Grid2 size={{ xs: 12, lg: 6 }}>
          <DailyGoalCard
            activities={activities}
            dailyGoal={dailyGoal}
            onSaveGoal={(value) => setDailyGoal(value)}
          />
        </Grid2>

        <Grid2 size={{ xs: 12, lg: 6 }}>
          <WeeklyGoalCard summary={metrics.weeklyGoalSummary} />
        </Grid2>
      </Grid2>

      <Box
        sx={{
          background: "linear-gradient(180deg, rgba(13,19,21,0.96), rgba(9,14,16,0.96))",
          border: "1px solid rgba(255,255,255,0.08)",
          borderRadius: 4,
          p: { xs: 2.5, md: 3 },
        }}
      >
        <Stack direction={{ xs: "column", md: "row" }} justifyContent="space-between" alignItems={{ xs: "flex-start", md: "center" }} spacing={2} sx={{ mb: 2 }}>
          <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
            <TrendingUp size={18} color="#9ae66e" />
            <Typography variant="h6" sx={{ fontWeight: 700, color: "#edf6f3" }}>
              7-day activity trend
            </Typography>
          </Box>
          <Chip label={`${metrics.weeklySeries.reduce((sum, item) => sum + item.value, 0)} min this week`} sx={{ background: "rgba(154,230,110,0.08)", color: "#b9f9a8", border: "1px solid rgba(154,230,110,0.12)" }} />
        </Stack>

        <Stack direction={{ xs: "column", sm: "row" }} spacing={1.5} alignItems="end" sx={{ minHeight: 140 }}>
          {metrics.weeklySeries.map((item) => (
            <Box key={item.label} sx={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 1 }}>
              <Typography variant="caption" sx={{ color: "#8ea1a8" }}>
                {item.value}m
              </Typography>
              <Box
                sx={{
                  width: "100%",
                  maxWidth: 48,
                  height: `${Math.max((item.value / Math.max(...metrics.weeklySeries.map((entry) => entry.value), 1)) * 100, 12)}%`,
                  minHeight: 18,
                  borderRadius: "12px 12px 0 0",
                  background: "linear-gradient(180deg, rgba(154,230,110,0.9), rgba(79,212,161,0.7))",
                  boxShadow: "0 14px 28px rgba(154,230,110,0.16)",
                }}
              />
              <Typography variant="caption" sx={{ color: "#8ea1a8", textTransform: "uppercase" }}>
                {item.label}
              </Typography>
            </Box>
          ))}
        </Stack>
      </Box>

      <Box id="activity-form" sx={{ mt: 1 }}>
        <ActivityForm onActivityAdded={() => window.location.reload()} />
      </Box>

      <Box sx={{ mt: 1 }}>
        <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 2 }}>
          <Button
            variant="text"
            onClick={() => navigate("/activities")}
            sx={{
              p: 0,
              minWidth: 0,
              color: "#f0f4f5",
              textTransform: "none",
              "&:hover": { background: "transparent", opacity: 0.9 },
            }}
          >
            <Typography variant="h5" sx={{ fontWeight: 700, color: "#f0f4f5" }}>
              Recent workouts
            </Typography>
          </Button>
          <Chip label={`${activities.length} sessions`} sx={{ color: "#d7e7e2", background: "rgba(255,255,255,0.04)" }} />
        </Stack>
        <Divider sx={{ mb: 2, borderColor: "rgba(255,255,255,0.08)" }} />
        {error && (
          <Box sx={{ mb: 2 }}>
            <Typography color="error">{error}</Typography>
          </Box>
        )}
        <ActivityList activities={activities} isLoading={isLoading} onActivitiesLoaded={setActivities} />
      </Box>
    </Box>
  );
};

const AllActivitiesPage = () => {
  const [activities, setActivities] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;

    const loadActivities = async () => {
      try {
        setIsLoading(true);
        const response = await getActivities();
        if (active) {
          const nextActivities = response?.data || [];
          setActivities(nextActivities);
          setError("");
        }
      } catch {
        if (active) {
          setError("We couldn’t load your activities. Please try again.");
        }
      } finally {
        if (active) {
          setIsLoading(false);
        }
      }
    };

    loadActivities();
    return () => {
      active = false;
    };
  }, []);

  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: 3, pb: 4 }}>
      <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 1 }}>
        <Typography variant="h4" sx={{ fontWeight: 800, color: "#f3f7f7" }}>
          All Activities
        </Typography>
        <Chip label={`${activities.length} total`} sx={{ color: "#d7e7e2", background: "rgba(255,255,255,0.04)" }} />
      </Stack>

      {error && (
        <Alert severity="error" sx={{ background: "rgba(98, 26, 26, 0.18)", border: "1px solid rgba(244, 67, 54, 0.2)" }}>
          {error}
        </Alert>
      )}

      <ActivityList activities={activities} isLoading={isLoading} onActivitiesLoaded={setActivities} />
    </Box>
  );
};

function App() {
  const { token, tokenData, logIn, logOut, loginInProgress } = useContext(AuthContext);
  const dispatch = useDispatch();
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    if (token) {
      dispatch(
        setCredentials({
          token,
          user: tokenData,
        }),
      );
    }
  }, [token, tokenData, dispatch]);

  useEffect(() => {
    if (loginInProgress) {
      return;
    }

    const isLoginRoute = location.pathname === "/login";
    const isAuthenticated = Boolean(token && token.length > 0);

    if (!isAuthenticated && !isLoginRoute) {
      navigate("/login", { replace: true });
      return;
    }

    if (isAuthenticated && isLoginRoute) {
      navigate("/dashboard", { replace: true });
    }
  }, [token, loginInProgress, location.pathname, navigate]);

  const handleLogin = () => {
    logIn();
  };

  const handleLogout = () => {
    logOut();
    localStorage.clear();
    sessionStorage.clear();
  };

  const userName = tokenData?.given_name || tokenData?.preferred_username || "Athlete";
  const isAuthReady = !loginInProgress;
  const isAuthenticated = Boolean(token && token.length > 0);
  const navItems = [
    { label: "Dashboard", to: "/dashboard" },
    { label: "Activities", to: "/activities" },
    { label: "AI Coach", to: "/ai-coach" },
  ];

  const isNavActive = (target) => {
    if (target === "/activities") {
      return location.pathname === "/activities" || location.pathname.startsWith("/activities/");
    }
    if (target === "/dashboard") {
      return location.pathname === "/dashboard" || location.pathname === "/";
    }
    if (target === "/ai-coach") {
      return location.pathname === "/ai-coach" || location.pathname.startsWith("/ai-coach/");
    }
    return false;
  };

  const renderLoadingScreen = () => (
    <Box
      sx={{
        minHeight: "100vh",
        display: "grid",
        placeItems: "center",
        background: "radial-gradient(circle at top, rgba(154,230,110,0.16), transparent 30%), #07110f",
        color: "#edf6f3",
      }}
    >
      <Stack alignItems="center" spacing={2}>
        <Box
          sx={{
            width: 56,
            height: 56,
            borderRadius: "50%",
            border: "3px solid rgba(154,230,110,0.18)",
            borderTopColor: "#9ae66e",
            animation: "spin 0.9s linear infinite",
          }}
        />
        <Typography variant="h6" sx={{ fontWeight: 700 }}>
          Restoring your session...
        </Typography>
      </Stack>
    </Box>
  );

  return (
    <>
      {!isAuthReady ? (
        renderLoadingScreen()
      ) : !isAuthenticated ? (
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/" element={<Navigate to="/login" replace />} />
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      ) : (
        <Box sx={{ minHeight: "100vh", background: "#07110f", color: "#edf6f3" }}>
          <AppBar
            position="sticky"
            elevation={0}
            sx={{
              background: "rgba(10,17,17,0.82)",
              backdropFilter: "blur(18px)",
              borderBottom: "1px solid rgba(255,255,255,0.06)",
              boxShadow: "0 10px 30px rgba(0,0,0,0.16)",
            }}
          >
            <Box sx={{ px: { xs: 2, md: 4 }, py: 1.2, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <Stack direction="row" alignItems="center" spacing={2}>
                <Avatar sx={{ width: 36, height: 36, background: "linear-gradient(135deg, #9ae66e, #4fd4a1)", color: "#051510", fontWeight: 800 }}>
                  F
                </Avatar>
                <Box>
                  <Typography variant="h6" sx={{ fontWeight: 800, lineHeight: 1.1 }}>
                    FitNexus AI
                  </Typography>
                  <Typography variant="caption" sx={{ color: "#9aa7ad" }}>
                    Train smarter. Recover better.
                  </Typography>
                </Box>
              </Stack>

              <Stack direction="row" spacing={1.5} alignItems="center" sx={{ display: { xs: "none", md: "flex" } }}>
                {navItems.map((item) => (
                  <NavLink
                    key={item.to}
                    to={item.to}
                    end={item.to === "/dashboard" || item.to === "/ai-coach"}
                    className={({ isActive }) => (isActive || isNavActive(item.to) ? "nav-link active" : "nav-link")}
                    style={{ textDecoration: "none" }}
                  >
                    <Box
                      sx={{
                        px: 1.5,
                        py: 0.8,
                        borderRadius: 2,
                        color: "#dfeef0",
                        background: isNavActive(item.to) ? "rgba(154,230,110,0.10)" : "transparent",
                        border: isNavActive(item.to) ? "1px solid rgba(154,230,110,0.18)" : "1px solid transparent",
                        transition: "all 0.2s ease",
                        "&:hover": { background: "rgba(154,230,110,0.08)" },
                      }}
                    >
                      {item.label}
                    </Box>
                  </NavLink>
                ))}
              </Stack>

              <Stack direction="row" spacing={1.5} alignItems="center">
                <Chip
                  label={userName}
                  sx={{
                    background: "rgba(255,255,255,0.04)",
                    color: "#f2f6f7",
                    fontWeight: 700,
                    borderRadius: 999,
                  }}
                />
                <Button
                  variant="contained"
                  onClick={handleLogout}
                  sx={{
                    borderRadius: 999,
                    background: "linear-gradient(135deg, rgba(255,255,255,0.08), rgba(255,255,255,0.04))",
                    color: "#edf6f3",
                    border: "1px solid rgba(255,255,255,0.08)",
                    textTransform: "none",
                    fontWeight: 700,
                    px: 2,
                    "&:hover": { background: "rgba(255,255,255,0.12)" },
                  }}
                >
                  Logout
                </Button>
              </Stack>
            </Box>
          </AppBar>

          <Box sx={{ px: { xs: 2, md: 4 }, py: 3 }}>
            <Routes>
              <Route path="/dashboard" element={<DashboardPage />} />
              <Route path="/activities" element={<AllActivities />} />
              <Route path="/activities/:id" element={<ActivityDetail />} />
              <Route path="/ai-coach/:activityId" element={<AICoachPage />} />
              <Route path="/ai-coach" element={<AICoachPage />} />
              <Route path="/login" element={<Navigate to="/dashboard" replace />} />
              <Route path="/" element={<Navigate to="/dashboard" replace />} />
              <Route path="*" element={<Navigate to="/dashboard" replace />} />
            </Routes>
          </Box>
        </Box>
      )}
    </>
  );
}

export default App;