export const GOAL_STORAGE_KEY = "fitnexus.dailyGoal";

export const clampGoalValue = (value) => {
  const numericValue = Number(value);

  if (!Number.isFinite(numericValue)) {
    return 60;
  }

  return Math.min(Math.max(Math.round(numericValue), 1), 1440);
};

export const getStoredDailyGoal = () => {
  if (typeof window === "undefined") {
    return 60;
  }

  try {
    const storedValue = window.localStorage.getItem(GOAL_STORAGE_KEY);
    if (storedValue === null || storedValue === "") {
      return 60;
    }

    return clampGoalValue(storedValue);
  } catch {
    return 60;
  }
};

export const setStoredDailyGoal = (value) => {
  const nextGoal = clampGoalValue(value);

  if (typeof window !== "undefined") {
    try {
      window.localStorage.setItem(GOAL_STORAGE_KEY, String(nextGoal));
    } catch {
      // ignore storage write issues silently
    }
  }

  return nextGoal;
};

const toLocalDateKey = (value) => {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return null;
  }

  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
};

const getStartOfWeek = (referenceDate = new Date()) => {
  const date = new Date(referenceDate);
  date.setHours(0, 0, 0, 0);

  const currentDay = date.getDay();
  const diffToMonday = currentDay === 0 ? -6 : 1 - currentDay;
  date.setDate(date.getDate() + diffToMonday);

  return date;
};

export const getMinutesForDate = (activities, targetDate) => {
  const targetKey = toLocalDateKey(targetDate);

  if (!targetKey) {
    return 0;
  }

  return (activities || []).reduce((sum, activity) => {
    const activityDateKey = toLocalDateKey(activity.createdAt || activity.created_at);

    if (activityDateKey !== targetKey) {
      return sum;
    }

    const minutes = Number(activity.duration || 0);
    return Number.isFinite(minutes) ? sum + minutes : sum;
  }, 0);
};

export const getTodayGoalProgress = (activities, dailyGoal = 60) => {
  const goal = clampGoalValue(dailyGoal);
  const todaysMinutes = getMinutesForDate(activities, new Date());
  const progressPercent = goal > 0 ? Math.min((todaysMinutes / goal) * 100, 100) : 0;
  const remainingMinutes = Math.max(goal - todaysMinutes, 0);
  const excessMinutes = Math.max(todaysMinutes - goal, 0);
  const isComplete = todaysMinutes >= goal;

  return {
    dailyGoal: goal,
    todaysMinutes,
    remainingMinutes,
    excessMinutes,
    progressPercent,
    isComplete,
  };
};

export const getGoalMessage = (percent) => {
  if (percent <= 0) {
    return "Ready to get moving? 💪";
  }

  if (percent < 50) {
    return "Good start! Keep going.";
  }

  if (percent < 100) {
    return "You're almost there! 🔥";
  }

  return "Goal completed! Great work! 🎉";
};

export const getWeeklyGoalSummary = (activities, dailyGoal = 60, referenceDate = new Date()) => {
  const goal = clampGoalValue(dailyGoal);
  const weekStart = getStartOfWeek(referenceDate);

  const days = Array.from({ length: 7 }, (_, index) => {
    const currentDay = new Date(weekStart);
    currentDay.setDate(weekStart.getDate() + index);

    const minutes = getMinutesForDate(activities, currentDay);

    return {
      key: currentDay.toISOString(),
      label: currentDay.toLocaleDateString("en-US", { weekday: "short" }),
      minutes,
      completed: minutes >= goal,
      date: currentDay,
    };
  });

  const completedMinutes = days.reduce((sum, day) => sum + day.minutes, 0);
  const weeklyTarget = goal * 7;
  const progress = weeklyTarget > 0 ? Math.min((completedMinutes / weeklyTarget) * 100, 100) : 0;

  return {
    dailyGoal: goal,
    weeklyTarget,
    completedMinutes,
    progress,
    days,
  };
};
