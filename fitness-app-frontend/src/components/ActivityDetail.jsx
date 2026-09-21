import React, { useEffect, useState } from "react";
import { useParams } from "react-router";
import {
  Box,
  Card,
  CardContent,
  Chip,
  Divider,
  Grid2,
  Skeleton,
  Stack,
  Typography,
} from "@mui/material";
import { getActivityDetail } from "../services/api";

const typeMeta = {
  RUNNING: { icon: "🏃", accent: "#9ae66e" },
  WALKING: { icon: "🚶", accent: "#7dd3fc" },
  CYCLING: { icon: "🚴", accent: "#c4b5fd" },
};

const ActivityDetail = () => {
  const { id } = useParams();
  const [activity, setActivity] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchActivityDetail = async () => {
      try {
        setLoading(true);
        const response = await getActivityDetail(id);
        // console.log("Fetched activity detail:", response.data);
        setActivity(response.data);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };

    fetchActivityDetail();
  }, [id]);

  if (loading || !activity) {
    return (
      <Box sx={{ maxWidth: 980, mx: "auto", py: 4 }}>
        <Card sx={{ borderRadius: 4, mb: 3, background: "rgba(12,18,21,0.9)" }}>
          <CardContent sx={{ p: 3 }}>
            <Skeleton variant="text" width="30%" height={36} sx={{ mb: 2 }} />
            <Skeleton variant="rectangular" height={140} sx={{ borderRadius: 3 }} />
          </CardContent>
        </Card>
      </Box>
    );
  }

  const metadata = typeMeta[activity.type] || { icon: "💪", accent: "#9ae66e" };
  const recommendation = activity.recommendation || null;
  const improvements = Array.isArray(activity.improvements) ? activity.improvements : [];
  const suggestions = Array.isArray(activity.suggestions) ? activity.suggestions : [];
  const safety = Array.isArray(activity.safety) ? activity.safety : [];

  return (
    <Box sx={{ maxWidth: 980, mx: "auto", py: 2 }}>
      <Card
        sx={{
          background: "linear-gradient(135deg, rgba(19,25,31,0.98), rgba(10,16,18,0.96))",
          border: "1px solid rgba(255,255,255,0.08)",
          borderRadius: 5,
          mb: 3,
          overflow: "hidden",
        }}
      >
        <CardContent sx={{ p: { xs: 2.5, md: 4 } }}>
          <Stack direction={{ xs: "column", md: "row" }} justifyContent="space-between" alignItems={{ xs: "flex-start", md: "center" }} spacing={2}>
            <Stack direction="row" spacing={2.5} alignItems="center">
              <Box
                sx={{
                  width: 72,
                  height: 72,
                  borderRadius: 3,
                  display: "grid",
                  placeItems: "center",
                  fontSize: 32,
                  background: `${metadata.accent}33`,
                  border: `1px solid ${metadata.accent}66`,
                }}
              >
                {metadata.icon}
              </Box>
              <Box>
                <Chip
                  label={activity.type}
                  sx={{
                    background: `${metadata.accent}1f`,
                    color: metadata.accent,
                    border: `1px solid ${metadata.accent}44`,
                    fontWeight: 700,
                    mb: 1,
                  }}
                />
                <Typography variant="h3" sx={{ fontWeight: 800, letterSpacing: "-0.05em", color: "#f3f7f7" }}>
                  Activity Detail
                </Typography>
              </Box>
            </Stack>

            <Typography variant="body2" sx={{ color: "#9aa7ad" }}>
              {new Date(activity.createdAt || activity.created_at).toLocaleString()}
            </Typography>
          </Stack>
        </CardContent>
      </Card>

      <Grid2 container spacing={3} sx={{ mb: 3 }}>
        <Grid2 size={{ xs: 12, sm: 4 }}>
          <Card sx={{ borderRadius: 4, background: "rgba(11,18,19,0.94)", border: "1px solid rgba(255,255,255,0.08)" }}>
            <CardContent>
              <Typography variant="caption" sx={{ color: "#8da2ab", textTransform: "uppercase", letterSpacing: 1.2 }}>
                Duration
              </Typography>
              <Typography variant="h4" sx={{ fontWeight: 800, color: "#eef6f5", mt: 1 }}>
                {activity.duration} min
              </Typography>
            </CardContent>
          </Card>
        </Grid2>
        <Grid2 size={{ xs: 12, sm: 4 }}>
          <Card sx={{ borderRadius: 4, background: "rgba(11,18,19,0.94)", border: "1px solid rgba(255,255,255,0.08)" }}>
            <CardContent>
              <Typography variant="caption" sx={{ color: "#8da2ab", textTransform: "uppercase", letterSpacing: 1.2 }}>
                Calories Burned
              </Typography>
              <Typography variant="h4" sx={{ fontWeight: 800, color: "#eef6f5", mt: 1 }}>
                {activity.caloriesBurned} kcal
              </Typography>
            </CardContent>
          </Card>
        </Grid2>
        <Grid2 size={{ xs: 12, sm: 4 }}>
          <Card sx={{ borderRadius: 4, background: "rgba(11,18,19,0.94)", border: "1px solid rgba(255,255,255,0.08)" }}>
            <CardContent>
              <Typography variant="caption" sx={{ color: "#8da2ab", textTransform: "uppercase", letterSpacing: 1.2 }}>
                Session
              </Typography>
              <Typography variant="h5" sx={{ fontWeight: 800, color: "#eef6f5", mt: 1 }}>
                {new Date(activity.createdAt || activity.created_at).toLocaleDateString()}
              </Typography>
            </CardContent>
          </Card>
        </Grid2>
      </Grid2>

      {recommendation && (
        <Card
          sx={{
            borderRadius: 4,
            background: "linear-gradient(135deg, rgba(24,31,31,0.96), rgba(12,17,21,0.96))",
            border: "1px solid rgba(154,230,110,0.18)",
            boxShadow: "0 18px 40px rgba(154,230,110,0.12)",
          }}
        >
          <CardContent sx={{ p: { xs: 2.5, md: 3.5 } }}>
            <Stack direction="row" alignItems="center" spacing={1.5} sx={{ mb: 2 }}>
              <Box sx={{ width: 42, height: 42, borderRadius: 2, display: "grid", placeItems: "center", background: "rgba(154,230,110,0.14)", color: "#b9f9a8", fontSize: 22 }}>
                ✨
              </Box>
              <Typography variant="h5" sx={{ fontWeight: 800, color: "#f4faf7" }}>
                AI Coach Insight
              </Typography>
            </Stack>

            <Typography variant="body1" sx={{ color: "#dfeef0", mb: 3, lineHeight: 1.7 }}>
              {recommendation}
            </Typography>

            {improvements.length > 0 && (
              <>
                <Typography variant="h6" sx={{ fontWeight: 700, color: "#eff9f2", mb: 1 }}>
                  Improvements
                </Typography>
                {improvements.map((item, index) => (
                  <Typography key={index} sx={{ color: "#c8d3d8", mb: 1 }}>
                    • {item}
                  </Typography>
                ))}
              </>
            )}

            {suggestions.length > 0 && (
              <>
                <Divider sx={{ my: 2, borderColor: "rgba(255,255,255,0.08)" }} />
                <Typography variant="h6" sx={{ fontWeight: 700, color: "#eff9f2", mb: 1 }}>
                  Suggestions
                </Typography>
                {suggestions.map((item, index) => (
                  <Typography key={index} sx={{ color: "#c8d3d8", mb: 1 }}>
                    • {item}
                  </Typography>
                ))}
              </>
            )}

            {safety.length > 0 && (
              <>
                <Divider sx={{ my: 2, borderColor: "rgba(255,255,255,0.08)" }} />
                <Typography variant="h6" sx={{ fontWeight: 700, color: "#eff9f2", mb: 1 }}>
                  Safety Guidelines
                </Typography>
                {safety.map((item, index) => (
                  <Typography key={index} sx={{ color: "#c8d3d8", mb: 1 }}>
                    • {item}
                  </Typography>
                ))}
              </>
            )}
          </CardContent>
        </Card>
      )}
    </Box>
  );
};

export default ActivityDetail;