import { useState } from 'react';
import { loadUserProfile, loadMealPlan, loadCurrentWeek, loadCurrentDay } from '../utils/storage';

const HomeScreen = () => {
  const [userProfile] = useState(() => loadUserProfile());
  const [mealPlan] = useState(() => loadMealPlan());
  const [currentWeek] = useState(() => loadCurrentWeek());
  const [currentDay] = useState(() => loadCurrentDay());

  const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
  const currentDayName = days[currentDay];
  const todayMeals = mealPlan?.days?.[currentDay];

  return (
    <div className="min-h-screen bg-gray-50 pb-24">
      {/* Header */}
      <div className="bg-primary text-white p-6 safe-top">
        <h1 className="text-2xl font-bold">AI Meal Coach</h1>
        <p className="text-primary-100">
          Week {currentWeek}, Day {currentDay + 1} - {currentDayName}
        </p>
        <div className="mt-3 bg-primary-600 rounded-full h-2">
          <div
            className="bg-white h-2 rounded-full transition-all"
            style={{ width: `${((currentDay + 1) / 7) * 100}%` }}
          />
        </div>
      </div>

      {/* Meals */}
      <div className="p-4 space-y-4">
        <h2 className="text-xl font-bold text-gray-900">Today's Meals</h2>

        {todayMeals?.meals?.map((meal, index) => (
          <div key={index} className="card">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-lg font-semibold text-gray-900 capitalize">
                {meal.type}
              </h3>
              <span className="text-sm text-gray-500">{meal.prepTime}</span>
            </div>
            <p className="text-gray-700 font-medium mb-3">{meal.name}</p>
            <div className="flex gap-4 text-sm">
              <span className="text-gray-600">
                P: {meal.macros.protein}g
              </span>
              <span className="text-gray-600">
                C: {meal.macros.carbs}g
              </span>
              <span className="text-gray-600">
                F: {meal.macros.fats}g
              </span>
              <span className="text-gray-600 font-semibold">
                {meal.macros.calories} cal
              </span>
            </div>
          </div>
        ))}

        {/* Daily Total */}
        <div className="card bg-primary-50 border-2 border-primary-200">
          <h3 className="text-lg font-bold text-gray-900 mb-3">Daily Total</h3>
          <div className="grid grid-cols-4 gap-2 text-center">
            <div>
              <div className="text-2xl font-bold text-primary">
                {todayMeals?.meals?.reduce((sum, m) => sum + m.macros.protein, 0)}g
              </div>
              <div className="text-xs text-gray-600">Protein</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-primary">
                {todayMeals?.meals?.reduce((sum, m) => sum + m.macros.carbs, 0)}g
              </div>
              <div className="text-xs text-gray-600">Carbs</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-primary">
                {todayMeals?.meals?.reduce((sum, m) => sum + m.macros.fats, 0)}g
              </div>
              <div className="text-xs text-gray-600">Fats</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-primary">
                {todayMeals?.meals?.reduce((sum, m) => sum + m.macros.calories, 0)}
              </div>
              <div className="text-xs text-gray-600">Calories</div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Navigation Placeholder */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 p-4 safe-bottom">
        <div className="flex justify-around max-w-md mx-auto">
          <button className="text-primary font-semibold">Home</button>
          <button className="text-gray-500">Progress</button>
          <button className="text-gray-500">Groceries</button>
          <button className="text-gray-500">Chat</button>
          <button className="text-gray-500">Settings</button>
        </div>
      </div>
    </div>
  );
};

export default HomeScreen;
