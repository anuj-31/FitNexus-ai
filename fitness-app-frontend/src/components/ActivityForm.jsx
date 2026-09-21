import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import { Dumbbell } from "lucide-react";
import React, { useState } from "react";
import { addActivity } from "../services/api";

const fieldStyle = {
  "& .MuiOutlinedInput-root": {
    background: "rgba(255,255,255,0.02)",
    borderRadius: 3,
    color: "#edf6f3",
    "& fieldset": { borderColor: "rgba(255,255,255,0.08)" },
    "&:hover fieldset": { borderColor: "rgba(154,230,110,0.35)" },
    "&.Mui-focused fieldset": { borderColor: "rgba(154,230,110,0.7)" },
  },
  "& .MuiInputLabel-root": { color: "#8ea1a8" },
  "& .MuiInputBase-input": { color: "#edf6f3" },
};

const ActivityForm = ({ onActivityAdded }) => {
  const [activity, setActivity] = useState({
    type: "RUNNING",
    duration: "",
    caloriesBurned: "",
  });
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!activity.duration || Number(activity.duration) <= 0 || !activity.caloriesBurned || Number(activity.caloriesBurned) < 0) {
      setError("Please enter a valid duration and calories burned.");
      return;
    }

    try {
      setError("");
      setIsSubmitting(true);
      await addActivity({
        ...activity,
        duration: Number(activity.duration),
        caloriesBurned: Number(activity.caloriesBurned),
      });

      setActivity({ type: "RUNNING", duration: "", caloriesBurned: "" });
      if (onActivityAdded) onActivityAdded();
    } catch (submitError) {
      console.error(submitError);
      setError("Unable to save your workout. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card
      sx={{
        background: "linear-gradient(180deg, rgba(15,20,24,0.98), rgba(10,15,18,0.96))",
        border: "1px solid rgba(255,255,255,0.08)",
        borderRadius: 4,
        boxShadow: "0 14px 30px rgba(0, 0, 0, 0.16)",
      }}
    >
      <CardContent sx={{ p: { xs: 2.5, md: 3.5 } }}>
        <Stack direction="row" alignItems="center" spacing={1.5} sx={{ mb: 3 }}>
          <Box
            sx={{
              width: 44,
              height: 44,
              display: "grid",
              placeItems: "center",
              borderRadius: 2,
              background: "linear-gradient(135deg, rgba(154,230,110,0.18), rgba(79,212,161,0.18))",
              color: "#b9f9a8",
            }}
          >
            <Dumbbell size={18} strokeWidth={2.2} />
          </Box>
          <Typography variant="h5" sx={{ fontWeight: 800, color: "#f3f7f7" }}>
            Log Your Workout
          </Typography>
        </Stack>

        <Box component="form" onSubmit={handleSubmit} noValidate>
          <FormControl fullWidth sx={{ mb: 2.5, ...fieldStyle }}>
            <InputLabel id="activity-type-label">Activity Type</InputLabel>
            <Select
              labelId="activity-type-label"
              value={activity.type}
              label="Activity Type"
              onChange={(e) => setActivity({ ...activity, type: e.target.value })}
              MenuProps={{
                PaperProps: {
                  sx: {
                    mt: 1,
                    borderRadius: 3,
                    border: "1px solid rgba(154,230,110,0.2)",
                    background: "linear-gradient(180deg, rgba(15,20,24,0.98), rgba(10,15,18,0.96))",
                    boxShadow: "0 18px 42px rgba(0, 0, 0, 0.35)",
                    color: "#edf6f3",
                    overflow: "hidden",
                    "& .MuiMenuItem-root": {
                      minHeight: "36px",
                      fontSize: "0.95rem",
                      color: "#edf6f3",
                      backgroundColor: "transparent",
                      transition: "background-color 0.2s ease, color 0.2s ease",
                      "&:hover": {
                        backgroundColor: "rgba(154,230,110,0.12)",
                      },
                      "&.Mui-selected": {
                        backgroundColor: "rgba(154,230,110,0.18)",
                        color: "#f4faf7",
                        "&:hover": {
                          backgroundColor: "rgba(154,230,110,0.24)",
                        },
                      },
                    },
                  },
                },
                MenuListProps: {
                  sx: {
                    p: 0.5,
                    background: "transparent",
                  },
                },
              }}
              sx={{
                "& .MuiOutlinedInput-root": {
                  background: "rgba(255,255,255,0.02)",
                  borderRadius: 3,
                  color: "#edf6f3",
                  minHeight: 56,
                  "& fieldset": { borderColor: "rgba(255,255,255,0.08)" },
                  "&:hover fieldset": { borderColor: "rgba(154,230,110,0.35)" },
                  "&.Mui-focused fieldset": { borderColor: "rgba(154,230,110,0.7)" },
                },
                "& .MuiInputLabel-root": { color: "#8ea1a8" },
                "& .MuiSelect-select": {
                  color: "#edf6f3",
                  display: "flex",
                  alignItems: "center",
                  py: 1.5,
                },
                "& .MuiSvgIcon-root": { color: "#b9f9a8" },
              }}
            >
              <MenuItem value="RUNNING">Running</MenuItem>
              <MenuItem value="WALKING">Walking</MenuItem>
              <MenuItem value="CYCLING">Cycling</MenuItem>
            </Select>
          </FormControl>

          <TextField
            fullWidth
            label="Duration (Minutes)"
            type="number"
            value={activity.duration}
            onChange={(e) => setActivity({ ...activity, duration: e.target.value })}
            sx={{ mb: 2.5, ...fieldStyle }}
            inputProps={{ min: 0 }}
          />

          <TextField
            fullWidth
            label="Calories Burned"
            type="number"
            value={activity.caloriesBurned}
            onChange={(e) => setActivity({ ...activity, caloriesBurned: e.target.value })}
            sx={{ mb: 2.5, ...fieldStyle }}
            inputProps={{ min: 0 }}
          />

          {error && (
            <Alert severity="error" sx={{ mb: 2, background: "rgba(98, 26, 26, 0.18)", border: "1px solid rgba(244, 67, 54, 0.2)" }}>
              {error}
            </Alert>
          )}

          <Button
            type="submit"
            variant="contained"
            disabled={isSubmitting}
            sx={{
              width: "100%",
              borderRadius: 3,
              background: "linear-gradient(135deg, #9ae66e, #4fd4a1)",
              color: "#081612",
              fontWeight: 800,
              py: 1.4,
              boxShadow: "0 18px 34px rgba(154,230,110,0.25)",
              transition: "transform 0.2s ease, box-shadow 0.2s ease",
              "&:hover": {
                transform: "translateY(-2px)",
                boxShadow: "0 20px 36px rgba(154,230,110,0.32)",
              },
              "&.Mui-disabled": {
                opacity: 0.7,
                color: "#081612",
              },
            }}
          >
            {isSubmitting ? "Logging..." : "Log Activity"}
          </Button>
        </Box>
      </CardContent>
    </Card>
  );
};

export default ActivityForm;