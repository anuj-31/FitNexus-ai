import React, { useState } from "react";
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Divider,
  Grid2,
  IconButton,
  Skeleton,
  Stack,
  Tooltip,
  Typography,
} from "@mui/material";
import { ArrowRight, Bike, Dumbbell, Flame, Footprints, Sparkles, Trash2 } from "lucide-react";
import { useNavigate } from "react-router";
import { deleteActivity } from "../services/api";

const typeMeta = {
  RUNNING: { icon: Footprints, accent: "#9ae66e" },
  WALKING: { icon: Dumbbell, accent: "#7dd3fc" },
  CYCLING: { icon: Bike, accent: "#c4b5fd" },
};

const getActivityDate = (activity) => activity?.createdAt || activity?.created_at || "";

const formatDisplayDate = (value) => {
  if (!value) return "—";

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return String(value);

  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
};

const ActivityList = ({ activities = [], isLoading = false, onActivitiesLoaded }) => {
  const navigate = useNavigate();
  const [deleteTarget, setDeleteTarget] = useState(null);

  const handleDelete = async (event, activityId) => {
    event.stopPropagation();
    setDeleteTarget(activityId);
  };

  const confirmDelete = async () => {
    if (!deleteTarget) return;

    try {
      await deleteActivity(deleteTarget);
      if (onActivitiesLoaded) {
        onActivitiesLoaded((current) => current.filter((item) => String(item.id) !== String(deleteTarget)));
      }
    } catch (error) {
      console.error("Unable to delete activity:", error);
    } finally {
      setDeleteTarget(null);
    }
  };

  if (isLoading) {
    return (
      <Grid2 container spacing={2.5}>
        {Array.from({ length: 3 }).map((_, index) => (
          <Grid2 key={index} size={{ xs: 12, md: 6 }}>
            <Card sx={{ background: "rgba(12,18,21,0.94)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 4 }}>
              <CardContent sx={{ p: 2.5 }}>
                <Skeleton variant="text" width="30%" height={26} sx={{ mb: 1.5 }} />
                <Skeleton variant="rectangular" height={120} sx={{ borderRadius: 2 }} />
              </CardContent>
            </Card>
          </Grid2>
        ))}
      </Grid2>
    );
  }

  if (!activities.length) {
    return (
      <Alert severity="info" sx={{ background: "rgba(154,230,110,0.08)", border: "1px solid rgba(154,230,110,0.18)", color: "#edf6f3" }}>
        No activities matched your filters.
      </Alert>
    );
  }

  return (
    <>
      <Grid2 container spacing={2.5}>
        {activities.map((activity) => {
          const activityDate = getActivityDate(activity);
          const meta = typeMeta[activity.type] || { icon: Dumbbell, accent: "#9ae66e" };
          const Icon = meta.icon;

          return (
            <Grid2 key={activity.id ?? `${activity.type}-${activityDate}`} size={{ xs: 12, md: 6 }}>
              <Card
                sx={{
                  height: "100%",
                  background: "linear-gradient(180deg, rgba(16,22,24,0.98), rgba(10,15,18,0.98))",
                  border: "1px solid rgba(255,255,255,0.08)",
                  borderRadius: 4,
                  overflow: "hidden",
                  transition: "transform 0.2s ease, border-color 0.2s ease, box-shadow 0.2s ease",
                  boxShadow: "0 16px 34px rgba(0,0,0,0.18)",
                  "&:hover": {
                    transform: "translateY(-2px)",
                    borderColor: `${meta.accent}55`,
                    boxShadow: `0 18px 36px ${meta.accent}15`,
                  },
                }}
              >
              <CardContent sx={{ p: 2.5 }}>
                <Stack direction="row" justifyContent="space-between" alignItems="flex-start" spacing={2} sx={{ mb: 2 }}>
                  <Stack direction="row" spacing={1.5} alignItems="center">
                    <Box
                      sx={{
                        width: 42,
                        height: 42,
                        borderRadius: 2,
                        display: "grid",
                        placeItems: "center",
                        background: `${meta.accent}1a`,
                        border: `1px solid ${meta.accent}33`,
                        color: meta.accent,
                      }}
                    >
                      <Icon size={18} />
                    </Box>
                    <Box>
                      <Typography variant="body2" sx={{ color: "#8ea1a8", textTransform: "uppercase", letterSpacing: 1.2 }}>
                        {activity.type || "Workout"}
                      </Typography>
                      <Typography variant="h6" sx={{ fontWeight: 800, color: "#f3f7f7" }}>
                        {formatDisplayDate(activityDate)}
                      </Typography>
                    </Box>
                  </Stack>

                  <IconButton
                    size="small"
                    onClick={(event) => handleDelete(event, activity.id)}
                    sx={{
                      color: "#f2b8b8",
                      background: "rgba(255,255,255,0.02)",
                      border: "1px solid rgba(255,255,255,0.08)",
                      "&:hover": { background: "rgba(255,255,255,0.06)" },
                    }}
                    aria-label="Delete activity"
                  >
                    <Trash2 size={16} />
                  </IconButton>
                </Stack>

                <Stack direction="row" spacing={2.5} sx={{ mb: 2.5, flexWrap: "wrap" }}>
                  <Box sx={{ display: "flex", alignItems: "center", gap: 0.8, color: "#dfeef0" }}>
                    <Dumbbell size={15} color="#9ae66e" />
                    <Typography variant="body2">{activity.duration ?? 0} min</Typography>
                  </Box>
                  <Box sx={{ display: "flex", alignItems: "center", gap: 0.8, color: "#dfeef0" }}>
                    <Flame size={15} color="#fbbf24" />
                    <Typography variant="body2">{activity.caloriesBurned ?? 0} kcal</Typography>
                  </Box>
                </Stack>

                <Divider sx={{ borderColor: "rgba(255,255,255,0.08)", mb: 2 }} />

                <Stack direction="row" spacing={1} justifyContent="space-between" alignItems="center" sx={{ flexWrap: "wrap", rowGap: 1 }}>
                  <Button
                    variant="text"
                    onClick={() => navigate(`/activities/${activity.id}`)}
                    sx={{
                      minWidth: "auto",
                      color: meta.accent,
                      fontWeight: 700,
                      textTransform: "none",
                      p: 0,
                      "&:hover": { background: "transparent", opacity: 0.9 },
                    }}
                  >
                    <Stack direction="row" alignItems="center" spacing={0.5}>
                      <Typography variant="body2" sx={{ color: meta.accent, fontWeight: 700 }}>
                        View Details
                      </Typography>
                      <ArrowRight size={16} color={meta.accent} />
                    </Stack>
                  </Button>

                  <Tooltip title="Open AI coach for this workout" arrow>
                    <Button
                      variant="contained"
                      onClick={() => navigate(`/ai-coach/${activity.id}`)}
                      sx={{
                        borderRadius: 999,
                        background: "linear-gradient(135deg, #9ae66e, #4fd4a1)",
                        color: "#07110f",
                        px: 1.8,
                        py: 0.7,
                        minHeight: 36,
                        fontWeight: 800,
                        textTransform: "none",
                        boxShadow: "0 14px 28px rgba(154,230,110,0.18)",
                        transition: "transform 0.2s ease, box-shadow 0.2s ease",
                        "&:hover": {
                          transform: "translateY(-1px)",
                          boxShadow: "0 18px 30px rgba(154,230,110,0.22)",
                        },
                      }}
                      startIcon={<Sparkles size={14} />}
                    >
                      Get AI Recommendation
                    </Button>
                  </Tooltip>
                </Stack>
              </CardContent>
            </Card>
          </Grid2>
        );
      })}
      </Grid2>

      <Dialog
        open={Boolean(deleteTarget)}
        onClose={() => setDeleteTarget(null)}
        PaperProps={{
          sx: {
            background: "linear-gradient(180deg, rgba(15,20,24,0.98), rgba(10,15,18,0.96))",
            border: "1px solid rgba(255,255,255,0.08)",
            borderRadius: 4,
            color: "#edf6f3",
          },
        }}
      >
        <DialogTitle sx={{ color: "#f3f7f7", fontWeight: 800 }}>Delete workout?</DialogTitle>
        <DialogContent>
          <DialogContentText sx={{ color: "#a9bac2" }}>
            This action will remove the activity from your dashboard and cannot be undone.
          </DialogContentText>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2.5 }}>
          <Button onClick={() => setDeleteTarget(null)} sx={{ color: "#dfeef0", textTransform: "none" }}>
            Cancel
          </Button>
          <Button
            onClick={confirmDelete}
            variant="contained"
            sx={{
              borderRadius: 999,
              background: "linear-gradient(135deg, #9ae66e, #4fd4a1)",
              color: "#07110f",
              fontWeight: 800,
              textTransform: "none",
            }}
          >
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default ActivityList;