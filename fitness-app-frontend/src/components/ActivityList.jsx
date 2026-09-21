import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  Divider,
  Grid2,
  IconButton,
  Skeleton,
  Stack,
  Typography,
} from "@mui/material";
import { ArrowRight, Dumbbell, Flame, Footprints, Bike, Trash2 } from "lucide-react";
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import { deleteActivity, getActivities } from "../services/api";

const typeStyles = {
  RUNNING: { accent: "#9ae66e", glow: "rgba(154,230,110,0.12)", icon: Footprints },
  WALKING: { accent: "#7dd3fc", glow: "rgba(125,211,252,0.12)", icon: Dumbbell },
  CYCLING: { accent: "#c4b5fd", glow: "rgba(196,181,253,0.12)", icon: Bike },
};

const ActivityList = ({ activities: activityProp, isLoading: externalLoading, onActivitiesLoaded }) => {
    const navigate = useNavigate();
    const [activities, setActivities] = useState(activityProp || []);
    const [loading, setLoading] = useState(externalLoading || false);
    const [error, setError] = useState("");

    const handleDelete = async (event, activityId) => {
        event.stopPropagation();

        try {
            const response = await deleteActivity(activityId);
            if (response?.status >= 200 && response?.status < 300) {
                const nextActivities = activities.filter((activity) => activity.id !== activityId);
                setActivities(nextActivities);
                if (onActivitiesLoaded) onActivitiesLoaded(nextActivities);
            }
        } catch (deleteError) {
            console.error(deleteError);
        }
    };

    useEffect(() => {
        if (activityProp !== undefined) {
            setActivities(activityProp);
        }
    }, [activityProp]);

    useEffect(() => {
        if (externalLoading !== undefined) {
            setLoading(externalLoading);
        }
    }, [externalLoading]);

    useEffect(() => {
        if (activityProp !== undefined) return;

        const fetchActivities = async () => {
            try {
                setLoading(true);
                const response = await getActivities();
                const nextActivities = response?.data || [];
                setActivities(nextActivities);
                if (onActivitiesLoaded) onActivitiesLoaded(nextActivities);
                setError("");
            } catch (loadError) {
                console.error(loadError);
                setError("Unable to load activities right now.");
            } finally {
                setLoading(false);
            }
        };

        fetchActivities();
    }, [activityProp, onActivitiesLoaded]);

    const handleScrollToForm = () => {
        document.getElementById("activity-form")?.scrollIntoView({ behavior: "smooth", block: "start" });
    };

    if (loading) {
        return (
            <Grid2 container spacing={2}>
                {[0, 1, 2].map((index) => (
                    <Grid2 key={index} size={{ xs: 12, md: 6 }}>
                        <Card sx={{ p: 1, borderRadius: 4, background: "rgba(12,18,21,0.92)" }}>
                            <CardContent>
                                <Skeleton variant="text" width="40%" height={32} sx={{ mb: 2 }} />
                                <Skeleton variant="rectangular" height={120} sx={{ borderRadius: 3 }} />
                            </CardContent>
                        </Card>
                    </Grid2>
                ))}
            </Grid2>
        );
    }

    if (error) {
        return (
            <Alert severity="error" sx={{ background: "rgba(98, 26, 26, 0.25)", border: "1px solid rgba(244, 67, 54, 0.2)" }}>
                {error}
            </Alert>
        );
    }

    if (!activities.length) {
        return (
            <Card
                sx={{
                    p: 2,
                    borderRadius: 4,
                    background: "linear-gradient(180deg, rgba(16, 22, 25, 0.92), rgba(11,16,18,0.92))",
                    border: "1px solid rgba(255,255,255,0.08)",
                    textAlign: "center",
                }}
            >
                <CardContent sx={{ py: 6 }}>
                    <Typography variant="h4" sx={{ fontWeight: 800, color: "#f3f7f7", mb: 1 }}>
                        No activities yet
                    </Typography>
                    <Typography variant="body1" sx={{ color: "#9aa7ad", maxWidth: 500, mx: "auto", mb: 3 }}>
                        Start your fitness journey by logging your first workout.
                    </Typography>
                    <Button variant="contained" onClick={handleScrollToForm} sx={{ borderRadius: 999, px: 3, fontWeight: 700 }}>
                        Log Activity
                    </Button>
                </CardContent>
            </Card>
        );
    }

    return (
        <Grid2 container spacing={2.5}>
            {activities.map((activity) => {
                const typeMeta = typeStyles[activity.type] || {
                    accent: "#9ae66e",
                    glow: "rgba(154,230,110,0.12)",
                    icon: Dumbbell,
                };

                return (
                    <Grid2 key={activity.id} size={{ xs: 12, md: 6 }}>
                        <Card
                            sx={{
                                cursor: "pointer",
                                height: "100%",
                                background: "linear-gradient(180deg, rgba(14,20,22,0.96), rgba(10,15,17,0.96))",
                                border: "1px solid rgba(255,255,255,0.08)",
                                borderRadius: 4,
                                transition: "transform 0.2s ease, box-shadow 0.2s ease, border-color 0.2s ease",
                                boxShadow: "0 10px 30px rgba(0,0,0,0.14)",
                                "&:hover": {
                                    transform: "translateY(-4px)",
                                    boxShadow: `0 16px 35px ${typeMeta.accent}22`,
                                    borderColor: `${typeMeta.accent}99`,
                                },
                            }}
                            onClick={() => navigate(`/activities/${activity.id}`)}
                        >
                            <CardContent sx={{ p: 2.5 }}>
                                <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 2 }}>
                                    <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
                                        <Box
                                            sx={{
                                                width: 44,
                                                height: 44,
                                                borderRadius: 2,
                                                display: "grid",
                                                placeItems: "center",
                                                background: typeMeta.glow,
                                                border: `1px solid ${typeMeta.accent}66`,
                                            }}
                                        >
                                            <typeMeta.icon size={18} strokeWidth={2.2} />
                                        </Box>
                                        <Box>
                                            <Typography variant="h6" sx={{ fontWeight: 750, color: "#edf7f5" }}>
                                                {activity.type}
                                            </Typography>
                                            <Typography variant="caption" sx={{ color: "#8ea1a8" }}>
                                                {new Date(activity.createdAt || activity.created_at).toLocaleDateString()}
                                            </Typography>
                                        </Box>
                                    </Box>
                                    <Stack direction="row" alignItems="center" spacing={0.75}>
                                        <Typography variant="h5" sx={{ fontWeight: 800, color: "#f5faf7" }}>
                                            {activity.duration} min
                                        </Typography>
                                        <IconButton
                                            aria-label="Delete activity"
                                            onClick={(event) => handleDelete(event, activity.id)}
                                            sx={{
                                                width: 26,
                                                height: 26,
                                                color: "#ff7a7a",
                                                background: "rgba(255,122,122,0.08)",
                                                border: "1px solid rgba(255,122,122,0.23)",
                                                "&:hover": {
                                                    background: "rgba(255,122,122,0.16)",
                                                },
                                            }}
                                        >
                                            <Trash2 size={14} />
                                        </IconButton>
                                    </Stack>
                                </Stack>

                                <Divider sx={{ borderColor: "rgba(255,255,255,0.06)", mb: 2 }} />

                                <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mt: 1 }}>
                                    <Stack direction="row" alignItems="center" spacing={1}>
                                        <Flame size={16} color={typeMeta.accent} />
                                        <Typography variant="body1" sx={{ color: "#ebf0f3", fontWeight: 600 }}>
                                            {activity.caloriesBurned} kcal
                                        </Typography>
                                    </Stack>

                                    <Button
                                        variant="text"
                                        onClick={(event) => {
                                            event.stopPropagation();
                                            navigate(`/ai-coach/${activity.id}`);
                                        }}
                                        sx={{
                                            minWidth: "auto",
                                            color: typeMeta.accent,
                                            fontWeight: 700,
                                            textTransform: "none",
                                            p: 0,
                                            "&:hover": { background: "transparent", opacity: 0.9 },
                                        }}
                                    >
                                        <Stack direction="row" alignItems="center" spacing={0.5}>
                                            <Typography variant="body2" sx={{ color: typeMeta.accent, fontWeight: 700 }}>
                                                View Details
                                            </Typography>
                                            <ArrowRight size={16} color={typeMeta.accent} />
                                        </Stack>
                                    </Button>
                                </Stack>
                            </CardContent>
                        </Card>
                    </Grid2>
                );
            })}
        </Grid2>
    );
};

export default ActivityList;