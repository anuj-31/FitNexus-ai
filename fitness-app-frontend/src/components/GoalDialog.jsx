import React, { useEffect, useState } from "react";
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormHelperText,
  Stack,
  TextField,
  Typography,
} from "@mui/material";

import { clampGoalValue } from "./goalUtils";

const GoalDialog = ({ open, currentGoal, onClose, onSave }) => {
  const [draftGoal, setDraftGoal] = useState(String(currentGoal ?? 60));
  const [error, setError] = useState("");

  useEffect(() => {
    if (open) {
      setDraftGoal(String(currentGoal ?? 60));
      setError("");
    }
  }, [currentGoal, open]);

  const handleSave = () => {
    const parsedValue = Number(draftGoal);

    if (!Number.isFinite(parsedValue) || parsedValue < 1 || parsedValue > 1440) {
      setError("Goal must be a number between 1 and 1440 minutes.");
      return;
    }

    const nextGoal = clampGoalValue(parsedValue);
    onSave(nextGoal);
    onClose();
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      fullWidth
      maxWidth="xs"
      PaperProps={{
        sx: {
          background: "linear-gradient(180deg, rgba(15,20,24,0.98), rgba(8,13,16,0.98))",
          border: "1px solid rgba(154,230,110,0.16)",
          borderRadius: 4,
          color: "#edf6f3",
        },
      }}
    >
      <DialogTitle sx={{ pb: 1.5, color: "#f1faf8", fontWeight: 800 }}>
        Set Daily Activity Goal
      </DialogTitle>

      <DialogContent>
        <Stack spacing={1.5} sx={{ pt: 1 }}>
          <Typography variant="body2" sx={{ color: "#9aa7ad" }}>
            Choose a goal for today’s total workout minutes.
          </Typography>

          <TextField
            autoFocus
            type="number"
            value={draftGoal}
            onChange={(event) => setDraftGoal(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === "Enter") {
                handleSave();
              }
            }}
            label="Minutes"
            inputProps={{ min: 1, max: 1440, step: 1 }}
            sx={{
              "& .MuiOutlinedInput-root": {
                background: "rgba(255,255,255,0.03)",
                borderRadius: 3,
                color: "#edf6f3",
                "& fieldset": { borderColor: "rgba(255,255,255,0.08)" },
                "&:hover fieldset": { borderColor: "rgba(154,230,110,0.4)" },
                "&.Mui-focused fieldset": { borderColor: "rgba(154,230,110,0.8)" },
              },
              "& .MuiInputLabel-root": { color: "#a1b4bb" },
              "& .MuiInputBase-input": { color: "#edf6f3" },
            }}
          />

          {error && (
            <FormHelperText sx={{ color: "#ff9c9c", mx: 0 }}>
              {error}
            </FormHelperText>
          )}
        </Stack>
      </DialogContent>

      <DialogActions sx={{ px: 3, pb: 2.5, gap: 1 }}>
        <Button
          onClick={onClose}
          sx={{
            color: "#deeff1",
            borderRadius: 999,
            textTransform: "none",
            px: 2,
          }}
        >
          Cancel
        </Button>
        <Button
          onClick={handleSave}
          variant="contained"
          sx={{
            borderRadius: 999,
            background: "linear-gradient(135deg, #9ae66e, #4fd4a1)",
            color: "#07110f",
            fontWeight: 800,
            textTransform: "none",
            px: 2.5,
          }}
        >
          Save Goal
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default GoalDialog;
