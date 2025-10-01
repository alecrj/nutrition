/**
 * localStorage helper functions for AI Meal Coach
 * Handles all data persistence for the MVP
 */

const KEYS = {
  USER_PROFILE: 'aimealcoach_userProfile',
  MEAL_PLAN: 'aimealcoach_mealPlan',
  CURRENT_WEEK: 'aimealcoach_currentWeek',
  CURRENT_DAY: 'aimealcoach_currentDay',
  PROGRESS: 'aimealcoach_progress',
  CHAT_HISTORY: 'aimealcoach_chatHistory',
  COMPLETED_MEALS: 'aimealcoach_completedMeals',
};

// User Profile
export function saveUserProfile(profile) {
  try {
    localStorage.setItem(KEYS.USER_PROFILE, JSON.stringify(profile));
    return true;
  } catch (error) {
    console.error('Error saving user profile:', error);
    return false;
  }
}

export function loadUserProfile() {
  try {
    const data = localStorage.getItem(KEYS.USER_PROFILE);
    return data ? JSON.parse(data) : null;
  } catch (error) {
    console.error('Error loading user profile:', error);
    return null;
  }
}

// Meal Plan
export function saveMealPlan(mealPlan) {
  try {
    localStorage.setItem(KEYS.MEAL_PLAN, JSON.stringify(mealPlan));
    return true;
  } catch (error) {
    console.error('Error saving meal plan:', error);
    return false;
  }
}

export function loadMealPlan() {
  try {
    const data = localStorage.getItem(KEYS.MEAL_PLAN);
    return data ? JSON.parse(data) : null;
  } catch (error) {
    console.error('Error loading meal plan:', error);
    return null;
  }
}

// Current Week/Day
export function saveCurrentWeek(week) {
  try {
    localStorage.setItem(KEYS.CURRENT_WEEK, String(week));
    return true;
  } catch (error) {
    console.error('Error saving current week:', error);
    return false;
  }
}

export function loadCurrentWeek() {
  try {
    const week = localStorage.getItem(KEYS.CURRENT_WEEK);
    return week ? parseInt(week, 10) : 1;
  } catch (error) {
    console.error('Error loading current week:', error);
    return 1;
  }
}

export function saveCurrentDay(day) {
  try {
    localStorage.setItem(KEYS.CURRENT_DAY, String(day));
    return true;
  } catch (error) {
    console.error('Error saving current day:', error);
    return false;
  }
}

export function loadCurrentDay() {
  try {
    const day = localStorage.getItem(KEYS.CURRENT_DAY);
    return day ? parseInt(day, 10) : 0;
  } catch (error) {
    console.error('Error loading current day:', error);
    return 0;
  }
}

// Progress Tracking
export function saveProgress(progressEntry) {
  try {
    const progress = loadProgress();
    progress.push(progressEntry);
    localStorage.setItem(KEYS.PROGRESS, JSON.stringify(progress));
    return true;
  } catch (error) {
    console.error('Error saving progress:', error);
    return false;
  }
}

export function loadProgress() {
  try {
    const data = localStorage.getItem(KEYS.PROGRESS);
    return data ? JSON.parse(data) : [];
  } catch (error) {
    console.error('Error loading progress:', error);
    return [];
  }
}

// Chat History
export function saveChatHistory(history) {
  try {
    // Keep only last 40 messages (20 exchanges) to prevent localStorage from getting too large
    const trimmedHistory = history.slice(-40);
    localStorage.setItem(KEYS.CHAT_HISTORY, JSON.stringify(trimmedHistory));
    return true;
  } catch (error) {
    console.error('Error saving chat history:', error);
    return false;
  }
}

export function loadChatHistory() {
  try {
    const data = localStorage.getItem(KEYS.CHAT_HISTORY);
    return data ? JSON.parse(data) : [];
  } catch (error) {
    console.error('Error loading chat history:', error);
    return [];
  }
}

export function addChatMessage(role, content) {
  try {
    const history = loadChatHistory();
    history.push({
      role,
      content,
      timestamp: Date.now(),
    });
    return saveChatHistory(history);
  } catch (error) {
    console.error('Error adding chat message:', error);
    return false;
  }
}

// Completed Meals
export function saveCompletedMeals(date, mealType) {
  try {
    const completed = loadCompletedMeals();
    if (!completed[date]) {
      completed[date] = [];
    }
    if (!completed[date].includes(mealType)) {
      completed[date].push(mealType);
    }
    localStorage.setItem(KEYS.COMPLETED_MEALS, JSON.stringify(completed));
    return true;
  } catch (error) {
    console.error('Error saving completed meals:', error);
    return false;
  }
}

export function loadCompletedMeals() {
  try {
    const data = localStorage.getItem(KEYS.COMPLETED_MEALS);
    return data ? JSON.parse(data) : {};
  } catch (error) {
    console.error('Error loading completed meals:', error);
    return {};
  }
}

export function isMealCompleted(date, mealType) {
  try {
    const completed = loadCompletedMeals();
    return completed[date]?.includes(mealType) || false;
  } catch (error) {
    console.error('Error checking meal completion:', error);
    return false;
  }
}

// Clear all data
export function clearAllData() {
  try {
    Object.values(KEYS).forEach(key => {
      localStorage.removeItem(key);
    });
    return true;
  } catch (error) {
    console.error('Error clearing all data:', error);
    return false;
  }
}

// Check if user has completed onboarding
export function hasCompletedOnboarding() {
  const profile = loadUserProfile();
  const mealPlan = loadMealPlan();
  return !!(profile && mealPlan);
}
