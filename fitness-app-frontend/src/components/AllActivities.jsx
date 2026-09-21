import React, { useEffect, useMemo, useState } from "react";
import {
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  Divider,
  FormControl,
  Grid2,
  InputAdornment,
  MenuItem,
  Select,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import { ArrowLeft, Dumbbell, Flame, Search, SlidersHorizontal, TimerReset } from "lucide-react";
import { useNavigate } from "react-router";
import ActivityList from "./ActivityList";
import { getActivities } from "../services/api";

const typeOptions = ["All", "RUNNING", "WALKING", "CYCLING"];

const sortOptions = {
  newest: { label: "Newest first" },
  oldest: { label: "Oldest first" },
  durationHigh: { label: "Duration: High to Low" },
  durationLow: { label: "Duration: Low to High" },
  caloriesHigh: { label: "Calories: High to Low" },
  caloriesLow: { label: "Calories: Low to High" },
};

const AllActivities = () => {
  const navigate = useNavigate();
  const [activities, setActivities] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedType, setSelectedType] = useState("All");
  const [search, setSearch] = useState("");
  const [sortBy, setSortBy] = useState("newest");

  useEffect(() => {
    let active = true;

    const loadActivities = async () => {
      try {
        setIsLoading(true);
        setError("");

        const response = await getActivities();
        if (!active) return;

        setActivities(response?.data || []);
      } catch {
        if (!active) return;
        setError("We couldn’t load your activities right now.");
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

  const filteredActivities = useMemo(() => {
    let next = [...activities];

    if (selectedType !== "All") {
      next = next.filter((activity) => activity.type === selectedType);
    }

    if (search.trim()) {
      const query = search.trim().toLowerCase();
      next = next.filter((activity) => {
        const type = String(activity.type || "").toLowerCase();
        const duration = String(activity.duration ?? "").toLowerCase();
        const calories = String(activity.caloriesBurned ?? "").toLowerCase();
        const date = new Date(activity.createdAt || activity.created_at || 0).toLocaleDateString().toLowerCase();

        return (
          type.includes(query) ||
          duration.includes(query) ||
          calories.includes(query) ||
          date.includes(query)
        );
      });
    }

    if (sortBy === "oldest") {
      next.sort((a, b) => new Date(a.createdAt || a.created_at || 0) - new Date(b.createdAt || b.created_at || 0));
    } else if (sortBy === "durationHigh") {
      next.sort((a, b) => Number(b.duration || 0) - Number(a.duration || 0));
    } else if (sortBy === "durationLow") {
      next.sort((a, b) => Number(a.duration || 0) - Number(b.duration || 0));
    } else if (sortBy === "caloriesHigh") {
      next.sort((a, b) => Number(b.caloriesBurned || 0) - Number(a.caloriesBurned || 0));
    } else if (sortBy === "caloriesLow") {
      next.sort((a, b) => Number(a.caloriesBurned || 0) - Number(b.caloriesBurned || 0));
    } else {
      next.sort((a, b) => new Date(b.createdAt || b.created_at || 0) - new Date(a.createdAt || a.created_at || 0));
    }

    return next;
  }, [activities, selectedType, search, sortBy]);

  const summary = useMemo(() => {
    const totalMinutes = filteredActivities.reduce((sum, item) => sum + Number(item.duration || 0), 0);
    const totalCalories = filteredActivities.reduce((sum, item) => sum + Number(item.caloriesBurned || 0), 0);

    return {
      totalWorkouts: filteredActivities.length,
      totalMinutes,
      totalCalories,
    };
  }, [filteredActivities]);

  const handleGoToDashboard = () => {
    navigate("/dashboard");
  };

  const handleLogActivity = () => {
    navigate("/dashboard");
  };

  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: 3, pb: 5 }}>
      <Stack
        direction={{ xs: "column", md: "row" }}
        justifyContent="space-between"
        alignItems={{ xs: "flex-start", md: "center" }}
        spacing={2}
      >
        <Box>
          <Typography variant="h3" sx={{ fontWeight: 800, letterSpacing: "-0.06em", color: "#f3f7f7", mb: 0.75 }}>
            All Activities
          </Typography>
          <Typography variant="body1" sx={{ color: "#a1b4bb" }}>
            Track and review all your workouts
          </Typography>
        </Box>

        <Button
          variant="outlined"
          startIcon={<ArrowLeft size={16} />}
          onClick={handleGoToDashboard}
          sx={{
            borderRadius: 999,
            borderColor: "rgba(154,230,110,0.18)",
            color: "#ebf8ef",
            background: "rgba(255,255,255,0.02)",
            px: 2,
            py: 1,
            fontWeight: 700,
            "&:hover": {
              background: "rgba(154,230,110,0.08)",
              borderColor: "rgba(154,230,110,0.32)",
            },
          }}
        >
          Back to Dashboard
        </Button>
      </Stack>

      <Grid2 container spacing={2.5}>
        <Grid2 size={{ xs: 12, sm: 4 }}>
          <Card sx={{ background: "linear-gradient(135deg, rgba(17,24,25,0.96), rgba(12,17,21,0.96))", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 4 }}>
            <CardContent sx={{ p: 2.5 }}>
              <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 1.5 }}>
                <Typography variant="body2" sx={{ color: "#8ea1a8", textTransform: "uppercase", letterSpacing: 1.1 }}>
                  Total workouts
                </Typography>
                <Dumbbell size={16} color="#9ae66e" />
              </Stack>
              <Typography variant="h4" sx={{ fontWeight: 800, color: "#f5faf7" }}>
                {summary.totalWorkouts}
              </Typography>
            </CardContent>
          </Card>
        </Grid2>

        <Grid2 size={{ xs: 12, sm: 4 }}>
          <Card sx={{ background: "linear-gradient(135deg, rgba(17,24,25,0.96), rgba(12,17,21,0.96))", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 4 }}>
            <CardContent sx={{ p: 2.5 }}>
              <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 1.5 }}>
                <Typography variant="body2" sx={{ color: "#8ea1a8", textTransform: "uppercase", letterSpacing: 1.1 }}>
                  Total minutes
                </Typography>
                <TimerReset size={16} color="#7dd3fc" />
              </Stack>
              <Typography variant="h4" sx={{ fontWeight: 800, color: "#f5faf7" }}>
                {summary.totalMinutes}
              </Typography>
            </CardContent>
          </Card>
        </Grid2>

        <Grid2 size={{ xs: 12, sm: 4 }}>
          <Card sx={{ background: "linear-gradient(135deg, rgba(17,24,25,0.96), rgba(12,17,21,0.96))", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 4 }}>
            <CardContent sx={{ p: 2.5 }}>
              <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 1.5 }}>
                <Typography variant="body2" sx={{ color: "#8ea1a8", textTransform: "uppercase", letterSpacing: 1.1 }}>
                  Total calories
                </Typography>
                <Flame size={16} color="#fbbf24" />
              </Stack>
              <Typography variant="h4" sx={{ fontWeight: 800, color: "#f5faf7" }}>
                {summary.totalCalories}
              </Typography>
            </CardContent>
          </Card>
        </Grid2>
      </Grid2>

      <Card
        sx={{
          background: "linear-gradient(180deg, rgba(15,20,24,0.96), rgba(10,15,18,0.96))",
          border: "1px solid rgba(255,255,255,0.08)",
          borderRadius: 4,
          p: 0.5,
        }}
      >
        <CardContent sx={{ p: 2.5 }}>
          <Stack
            direction={{ xs: "column", md: "row" }}
            spacing={2}
            alignItems={{ xs: "stretch", md: "center" }}
            justifyContent="space-between"
            sx={{ mb: 2 }}
          >
            <Stack direction={{ xs: "column", sm: "row" }} spacing={1.5} sx={{ flexWrap: "wrap" }}>
              {typeOptions.map((type) => (
                <Button
                  key={type}
                  variant={selectedType === type ? "contained" : "text"}
                  onClick={() => setSelectedType(type)}
                  sx={{
                    borderRadius: 999,
                    minWidth: 90,
                    px: 2,
                    py: 0.8,
                    fontWeight: 700,
                    textTransform: "none",
                    color: selectedType === type ? "#07110f" : "#edf6f3",
                    background: selectedType === type ? "linear-gradient(135deg, #9ae66e, #4fd4a1)" : "rgba(255,255,255,0.03)",
                    border: selectedType === type ? "1px solid rgba(154,230,110,0.2)" : "1px solid rgba(255,255,255,0.06)",
                    '&:hover': {
                      background: selectedType === type ? "linear-gradient(135deg, #9ae66e, #4fd4a1)" : "rgba(154,230,110,0.08)",
                    },
                  }}
                >
                  {type}
                </Button>
              ))}
            </Stack>

            <Stack direction={{ xs: "column", sm: "row" }} spacing={1.5} sx={{ minWidth: { xs: "100%", md: 330 } }}>
              <TextField
                fullWidth
                value={search}
                onChange={(event) => setSearch(event.target.value.trimStart())}
                placeholder="Search workouts"
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Search size={16} color="#9aa7ad" />
                    </InputAdornment>
                  ),
                  endAdornment: search ? (
                    <InputAdornment position="end">
                      <Button
                        variant="text"
                        onClick={() => setSearch("")}
                        sx={{
                          minWidth: 0,
                          color: "#dfeef0",
                          fontSize: "1.1rem",
                          p: 0,
                          borderRadius: "50%",
                          "&:hover": { background: "rgba(255,255,255,0.08)" },
                        }}
                        aria-label="Clear search"
                      >
                        ×
                      </Button>
                    </InputAdornment>
                  ) : null,
                }}
                sx={{
                  "& .MuiOutlinedInput-root": {
                    background: "rgba(255,255,255,0.02)",
                    borderRadius: 3,
                    color: "#edf6f3",
                    "& fieldset": { borderColor: "rgba(255,255,255,0.08)" },
                    "&:hover fieldset": { borderColor: "rgba(154,230,110,0.35)" },
                    "&.Mui-focused fieldset": { borderColor: "rgba(154,230,110,0.7)" },
                  },
                  "& .MuiInputBase-input": { color: "#edf6f3" },
                }}
              />

              <FormControl sx={{ minWidth: 170 }}>
                <Select
                  value={sortBy}
                  onChange={(event) => setSortBy(event.target.value)}
                  displayEmpty
                  sx={{
                    borderRadius: 3,
                    background: "rgba(255,255,255,0.02)",
                    color: "#edf6f3",
                    "& .MuiOutlinedInput-notchedOutline": { borderColor: "rgba(255,255,255,0.08)" },
                    "&:hover .MuiOutlinedInput-notchedOutline": { borderColor: "rgba(154,230,110,0.35)" },
                    "&.Mui-focused .MuiOutlinedInput-notchedOutline": { borderColor: "rgba(154,230,110,0.7)" },
                    "& .MuiSelect-select": { py: 1.4 },
                    "& .MuiSvgIcon-root": { color: "#b9f9a8" },
                  }}
                >
                  {Object.entries(sortOptions).map(([value, label]) => (
                    <MenuItem key={value} value={value}>
                      {label.label}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Stack>
          </Stack>

          <Divider sx={{ mb: 2.5, borderColor: "rgba(255,255,255,0.08)" }} />

          {error ? (
            <Box sx={{ py: 2 }}>
              <Typography color="error">{error}</Typography>
            </Box>
          ) : activities.length === 0 ? (
            <Card
              sx={{
                background: "linear-gradient(180deg, rgba(16,22,25,0.92), rgba(11,16,18,0.92))",
                border: "1px solid rgba(255,255,255,0.08)",
                borderRadius: 4,
                textAlign: "center",
              }}
            >
              <CardContent sx={{ py: 6 }}>
                <Typography variant="h4" sx={{ fontWeight: 800, color: "#f3f7f7", mb: 1 }}>
                  No workouts yet
                </Typography>
                <Typography variant="body1" sx={{ color: "#9aa7ad", maxWidth: 520, mx: "auto", mb: 3 }}>
                  Start your fitness journey by logging your first workout.
                </Typography>
                <Button
                  variant="contained"
                  onClick={handleLogActivity}
                  sx={{
                    borderRadius: 999,
                    px: 3,
                    fontWeight: 800,
                    background: "linear-gradient(135deg, #9ae66e, #4fd4a1)",
                    color: "#07110f",
                    "&:hover": { boxShadow: "0 18px 34px rgba(154,230,110,0.22)" },
                  }}
                >
                  Log Activity
                </Button>
              </CardContent>
            </Card>
          ) : filteredActivities.length === 0 ? (
            <Card
              sx={{
                background: "linear-gradient(180deg, rgba(16,22,25,0.92), rgba(11,16,18,0.92))",
                border: "1px solid rgba(255,255,255,0.08)",
                borderRadius: 4,
                textAlign: "center",
              }}
            >
              <CardContent sx={{ py: 6 }}>
                <Typography variant="h4" sx={{ fontWeight: 800, color: "#f3f7f7", mb: 1 }}>
                  No workouts found
                </Typography>
                <Typography variant="body1" sx={{ color: "#9aa7ad", maxWidth: 520, mx: "auto" }}>
                  Try changing your search or filters.
                </Typography>
              </CardContent>
            </Card>
          ) : (
            <ActivityList activities={filteredActivities} isLoading={isLoading} onActivitiesLoaded={setActivities} />
          )}
        </CardContent>
      </Card>
    </Box>
  );
};

export default AllActivities;
