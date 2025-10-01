import { useState } from 'react';
import { MessageCircle } from 'lucide-react';
import MealCard from './MealCard';
import SwapModal from './SwapModal';
import ChatCoach from './ChatCoach';
import BottomNav from './BottomNav';
import {
  loadUserProfile,
  loadMealPlan,
  loadCurrentWeek,
  loadCurrentDay,
  saveCompletedMeals,
  isMealCompleted,
  saveMealPlan
} from '../utils/storage';

const HomeScreen = () => {
  const [userProfile] = useState(() => loadUserProfile());
  const [mealPlan, setMealPlan] = useState(() => loadMealPlan());
  const [currentWeek] = useState(() => loadCurrentWeek());
  const [currentDay] = useState(() => loadCurrentDay());
  const [currentScreen, setCurrentScreen] = useState('home');
  const [showSwapModal, setShowSwapModal] = useState(false);
  const [showChat, setShowChat] = useState(false);
  const [selectedMeal, setSelectedMeal] = useState(null);
  const [selectedMealType, setSelectedMealType] = useState(null);

  const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
  const currentDayName = days[currentDay];
  const todayMeals = mealPlan?.days?.[currentDay];
  const today = new Date().toISOString().split('T')[0];

  const handleSwapMeal = (meal, mealType) => {
    setSelectedMeal(meal);
    setSelectedMealType(mealType);
    setShowSwapModal(true);
  };

  const handleMealSwapped = (newMeal) => {
    // Update the meal plan with the new meal
    const updatedMealPlan = { ...mealPlan };
    const mealIndex = updatedMealPlan.days[currentDay].meals.findIndex(
      m => m.type === selectedMealType
    );

    if (mealIndex !== -1) {
      updatedMealPlan.days[currentDay].meals[mealIndex] = {
        ...newMeal,
        type: selectedMealType
      };
      setMealPlan(updatedMealPlan);
      saveMealPlan(updatedMealPlan);
    }

    setShowSwapModal(false);
    setSelectedMeal(null);
    setSelectedMealType(null);
  };

  const handleMarkComplete = (mealType) => {
    saveCompletedMeals(today, mealType);
    // Force re-render by updating state
    setMealPlan({ ...mealPlan });
  };

  const calculateDailyTotals = () => {
    if (!todayMeals?.meals) return { protein: 0, carbs: 0, fats: 0, calories: 0 };

    return todayMeals.meals.reduce((totals, meal) => ({
      protein: totals.protein + (meal.macros.protein || 0),
      carbs: totals.carbs + (meal.macros.carbs || 0),
      fats: totals.fats + (meal.macros.fats || 0),
      calories: totals.calories + (meal.macros.calories || 0)
    }), { protein: 0, carbs: 0, fats: 0, calories: 0 });
  };

  const dailyTotals = calculateDailyTotals();

  // Render different screens based on navigation
  if (currentScreen !== 'home') {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="p-6 text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            {currentScreen === 'progress' && 'Progress Tracker'}
            {currentScreen === 'groceries' && 'Grocery List'}
            {currentScreen === 'settings' && 'Settings'}
          </h2>
          <p className="text-gray-600">Coming soon!</p>
        </div>
        <BottomNav currentScreen={currentScreen} onNavigate={setCurrentScreen} />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-24">
      {/* Header */}
      <div className="bg-gradient-to-r from-primary to-primary-600 text-white p-6 safe-top shadow-lg">
        <div className="flex items-center justify-between mb-3">
          <div>
            <h1 className="text-2xl font-bold">AI Meal Coach</h1>
            <p className="text-primary-100 text-sm">
              Hi {userProfile?.name || 'there'}! 👋
            </p>
          </div>
          <div className="text-right">
            <div className="text-sm text-primary-100">Week {currentWeek}</div>
            <div className="text-lg font-semibold">{currentDayName}</div>
          </div>
        </div>

        {/* Week Progress Bar */}
        <div className="mt-4">
          <div className="flex justify-between text-xs text-primary-100 mb-1">
            <span>Day {currentDay + 1} of 7</span>
            <span>{Math.round(((currentDay + 1) / 7) * 100)}%</span>
          </div>
          <div className="w-full bg-primary-700 rounded-full h-2">
            <div
              className="bg-white h-2 rounded-full transition-all duration-300 shadow-sm"
              style={{ width: `${((currentDay + 1) / 7) * 100}%` }}
            />
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="p-4 space-y-4">
        <h2 className="text-xl font-bold text-gray-900">Today's Meals</h2>

        {/* Meal Cards */}
        {todayMeals?.meals?.map((meal, index) => (
          <MealCard
            key={index}
            meal={meal}
            mealType={meal.type}
            onSwap={handleSwapMeal}
            onMarkComplete={handleMarkComplete}
            isCompleted={isMealCompleted(today, meal.type)}
          />
        ))}

        {/* Daily Summary */}
        <div className="card bg-gradient-to-br from-primary-50 to-secondary-50 border-2 border-primary-200">
          <h3 className="text-lg font-bold text-gray-900 mb-3 flex items-center gap-2">
            <span>📊</span>
            Daily Total
          </h3>
          <div className="grid grid-cols-4 gap-3 text-center">
            <div className="bg-white rounded-lg p-3 shadow-sm">
              <div className="text-2xl font-bold text-primary">
                {Math.round(dailyTotals.protein)}g
              </div>
              <div className="text-xs text-gray-600 font-medium">Protein</div>
              <div className="text-xs text-gray-500 mt-1">
                / {mealPlan?.dailyTarget?.protein}g
              </div>
            </div>
            <div className="bg-white rounded-lg p-3 shadow-sm">
              <div className="text-2xl font-bold text-primary">
                {Math.round(dailyTotals.carbs)}g
              </div>
              <div className="text-xs text-gray-600 font-medium">Carbs</div>
              <div className="text-xs text-gray-500 mt-1">
                / {mealPlan?.dailyTarget?.carbs}g
              </div>
            </div>
            <div className="bg-white rounded-lg p-3 shadow-sm">
              <div className="text-2xl font-bold text-primary">
                {Math.round(dailyTotals.fats)}g
              </div>
              <div className="text-xs text-gray-600 font-medium">Fats</div>
              <div className="text-xs text-gray-500 mt-1">
                / {mealPlan?.dailyTarget?.fats}g
              </div>
            </div>
            <div className="bg-white rounded-lg p-3 shadow-sm">
              <div className="text-2xl font-bold text-primary">
                {Math.round(dailyTotals.calories)}
              </div>
              <div className="text-xs text-gray-600 font-medium">Calories</div>
              <div className="text-xs text-gray-500 mt-1">
                / {mealPlan?.dailyTarget?.calories}
              </div>
            </div>
          </div>

          {/* Progress indicator */}
          <div className="mt-4 pt-4 border-t border-primary-200">
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-700 font-medium">Daily Progress:</span>
              <span className="text-primary font-semibold">
                {Math.round((dailyTotals.calories / mealPlan?.dailyTarget?.calories) * 100)}%
              </span>
            </div>
            <div className="w-full bg-primary-200 rounded-full h-2 mt-2">
              <div
                className="bg-primary h-2 rounded-full transition-all duration-300"
                style={{
                  width: `${Math.min((dailyTotals.calories / mealPlan?.dailyTarget?.calories) * 100, 100)}%`
                }}
              />
            </div>
          </div>
        </div>

        {/* Motivational Message */}
        <div className="card bg-gradient-to-r from-secondary-50 to-primary-50 border-l-4 border-secondary">
          <p className="text-sm text-gray-700">
            <span className="font-semibold">💪 Keep it up!</span> You're {currentDay + 1} {currentDay === 0 ? 'day' : 'days'} into your journey.
            {dailyTotals.calories === 0 && " Let's get started with breakfast!"}
            {dailyTotals.calories > 0 && dailyTotals.calories < mealPlan?.dailyTarget?.calories * 0.5 && " Great start to the day!"}
            {dailyTotals.calories >= mealPlan?.dailyTarget?.calories * 0.5 && dailyTotals.calories < mealPlan?.dailyTarget?.calories && " You're more than halfway through your daily targets!"}
            {dailyTotals.calories >= mealPlan?.dailyTarget?.calories && " You've hit your target! Great job!"}
          </p>
        </div>
      </div>

      {/* Floating Chat Button */}
      <button
        onClick={() => setShowChat(true)}
        className="fixed bottom-20 right-6 w-14 h-14 bg-primary text-white rounded-full shadow-lg flex items-center justify-center hover:bg-primary-600 active:scale-95 transition-all z-10"
        aria-label="Chat with coach"
      >
        <MessageCircle className="w-6 h-6" />
      </button>

      {/* Bottom Navigation */}
      <BottomNav currentScreen={currentScreen} onNavigate={setCurrentScreen} />

      {/* Modals */}
      {showSwapModal && (
        <SwapModal
          meal={selectedMeal}
          mealType={selectedMealType}
          userProfile={userProfile}
          onClose={() => setShowSwapModal(false)}
          onSwapComplete={handleMealSwapped}
        />
      )}

      {showChat && (
        <ChatCoach
          userProfile={userProfile}
          onClose={() => setShowChat(false)}
        />
      )}
    </div>
  );
};

export default HomeScreen;
