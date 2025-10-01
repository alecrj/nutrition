import { useState } from 'react';
import { ChevronDown, ChevronUp, RefreshCw, Check } from 'lucide-react';

const MealCard = ({ meal, mealType, onSwap, onMarkComplete, isCompleted }) => {
  const [isExpanded, setIsExpanded] = useState(false);

  const getMealEmoji = (type) => {
    const emojis = {
      breakfast: '🌅',
      lunch: '🌞',
      dinner: '🌙',
      snack: '🍎'
    };
    return emojis[type] || '🍽️';
  };

  return (
    <div className="card-interactive">
      {/* Header - Always Visible */}
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-2xl">{getMealEmoji(mealType)}</span>
            <h3 className="text-lg font-semibold text-gray-900 capitalize">
              {mealType}
            </h3>
            {meal.prepTime && (
              <span className="text-sm text-gray-500">• {meal.prepTime}</span>
            )}
          </div>
          <p className="text-gray-700 font-medium">{meal.name}</p>
        </div>
      </div>

      {/* Macros - Always Visible */}
      <div className="flex gap-4 text-sm mb-3 pb-3 border-b border-gray-200">
        <div className="flex items-center gap-1">
          <span className="font-semibold text-primary">P:</span>
          <span className="text-gray-700">{meal.macros.protein}g</span>
        </div>
        <div className="flex items-center gap-1">
          <span className="font-semibold text-primary">C:</span>
          <span className="text-gray-700">{meal.macros.carbs}g</span>
        </div>
        <div className="flex items-center gap-1">
          <span className="font-semibold text-primary">F:</span>
          <span className="text-gray-700">{meal.macros.fats}g</span>
        </div>
        <div className="flex items-center gap-1 ml-auto">
          <span className="font-bold text-gray-900">{meal.macros.calories}</span>
          <span className="text-gray-600 text-xs">cal</span>
        </div>
      </div>

      {/* Expandable Content */}
      {isExpanded && (
        <div className="space-y-4 mb-4 animate-fadeIn">
          {/* Ingredients */}
          <div>
            <h4 className="text-sm font-semibold text-gray-900 mb-2">Ingredients:</h4>
            <ul className="space-y-2">
              {meal.ingredients?.map((ingredient, index) => (
                <li key={index} className="text-sm text-gray-700 flex justify-between">
                  <span>• {ingredient.item}</span>
                  <span className="text-gray-500 text-xs">
                    {ingredient.descriptive || `${ingredient.grams}g`}
                  </span>
                </li>
              ))}
            </ul>
          </div>

          {/* Instructions */}
          {meal.instructions && meal.instructions.length > 0 && (
            <div>
              <h4 className="text-sm font-semibold text-gray-900 mb-2">Instructions:</h4>
              <ol className="space-y-1">
                {meal.instructions.map((instruction, index) => (
                  <li key={index} className="text-sm text-gray-700">
                    {index + 1}. {instruction}
                  </li>
                ))}
              </ol>
            </div>
          )}
        </div>
      )}

      {/* Action Buttons */}
      <div className="flex gap-2">
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="flex-1 flex items-center justify-center gap-2 px-4 py-2 border-2 border-gray-300 text-gray-700 font-semibold rounded-lg hover:bg-gray-50 transition-all active:scale-95"
        >
          {isExpanded ? (
            <>
              <ChevronUp className="w-4 h-4" />
              Hide Details
            </>
          ) : (
            <>
              <ChevronDown className="w-4 h-4" />
              View Recipe
            </>
          )}
        </button>

        <button
          onClick={() => onSwap(meal, mealType)}
          className="flex items-center justify-center gap-2 px-4 py-2 border-2 border-primary text-primary font-semibold rounded-lg hover:bg-primary-50 transition-all active:scale-95"
        >
          <RefreshCw className="w-4 h-4" />
          Swap
        </button>

        <button
          onClick={() => onMarkComplete(mealType)}
          className={`flex items-center justify-center gap-2 px-4 py-2 font-semibold rounded-lg transition-all active:scale-95 ${
            isCompleted
              ? 'bg-secondary text-white'
              : 'border-2 border-secondary text-secondary hover:bg-secondary-50'
          }`}
        >
          <Check className="w-4 h-4" />
          {isCompleted ? 'Done' : 'Mark'}
        </button>
      </div>
    </div>
  );
};

export default MealCard;
