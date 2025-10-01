import { useState, useEffect } from 'react';
import { Check, Share2, ShoppingCart } from 'lucide-react';
import BottomNav from './BottomNav';

const GroceryList = ({ mealPlan, onNavigate }) => {
  const [checkedItems, setCheckedItems] = useState({});
  const [groceryList, setGroceryList] = useState({});

  useEffect(() => {
    if (mealPlan?.days) {
      generateGroceryList();
    }
  }, [mealPlan]);

  const generateGroceryList = () => {
    const ingredients = {};

    // Aggregate all ingredients from all meals
    mealPlan.days.forEach(day => {
      day.meals.forEach(meal => {
        meal.ingredients?.forEach(ingredient => {
          const key = ingredient.item.toLowerCase();

          if (ingredients[key]) {
            ingredients[key].grams += ingredient.grams || 0;
            ingredients[key].count += 1;
          } else {
            ingredients[key] = {
              item: ingredient.item,
              grams: ingredient.grams || 0,
              descriptive: ingredient.descriptive || '',
              count: 1
            };
          }
        });
      });
    });

    // Categorize ingredients
    const categorized = categorizeIngredients(ingredients);
    setGroceryList(categorized);
  };

  const categorizeIngredients = (ingredients) => {
    const categories = {
      proteins: [],
      carbs: [],
      vegetables: [],
      fruits: [],
      dairy: [],
      pantry: [],
      other: []
    };

    const proteinKeywords = ['chicken', 'beef', 'pork', 'fish', 'salmon', 'tuna', 'turkey', 'shrimp', 'tofu', 'tempeh', 'eggs'];
    const carbKeywords = ['rice', 'pasta', 'bread', 'quinoa', 'oats', 'potato', 'tortilla', 'bagel', 'cereal'];
    const veggieKeywords = ['broccoli', 'spinach', 'lettuce', 'tomato', 'cucumber', 'pepper', 'onion', 'garlic', 'mushroom', 'carrot', 'zucchini', 'kale', 'cabbage'];
    const fruitKeywords = ['apple', 'banana', 'berry', 'orange', 'grape', 'melon', 'mango', 'peach', 'pear', 'strawberry', 'blueberry'];
    const dairyKeywords = ['milk', 'yogurt', 'cheese', 'butter', 'cream'];
    const pantryKeywords = ['oil', 'sauce', 'spice', 'salt', 'pepper', 'honey', 'syrup', 'vinegar', 'flour', 'sugar'];

    Object.values(ingredients).forEach(ingredient => {
      const itemLower = ingredient.item.toLowerCase();

      if (proteinKeywords.some(kw => itemLower.includes(kw))) {
        categories.proteins.push(ingredient);
      } else if (carbKeywords.some(kw => itemLower.includes(kw))) {
        categories.carbs.push(ingredient);
      } else if (veggieKeywords.some(kw => itemLower.includes(kw))) {
        categories.vegetables.push(ingredient);
      } else if (fruitKeywords.some(kw => itemLower.includes(kw))) {
        categories.fruits.push(ingredient);
      } else if (dairyKeywords.some(kw => itemLower.includes(kw))) {
        categories.dairy.push(ingredient);
      } else if (pantryKeywords.some(kw => itemLower.includes(kw))) {
        categories.pantry.push(ingredient);
      } else {
        categories.other.push(ingredient);
      }
    });

    return categories;
  };

  const toggleItem = (item) => {
    setCheckedItems(prev => ({
      ...prev,
      [item]: !prev[item]
    }));
  };

  const getCompletionStats = () => {
    const totalItems = Object.values(groceryList).reduce((sum, items) => sum + items.length, 0);
    const checkedCount = Object.values(checkedItems).filter(Boolean).length;
    return { total: totalItems, checked: checkedCount };
  };

  const exportList = () => {
    let text = '🛒 AI Meal Coach - Grocery List\n\n';

    Object.entries(groceryList).forEach(([category, items]) => {
      if (items.length > 0) {
        text += `${category.toUpperCase()}\n`;
        items.forEach(item => {
          const amount = item.grams > 0
            ? `${Math.round(item.grams)}g`
            : item.descriptive || `${item.count}x`;
          text += `- ${item.item} (${amount})\n`;
        });
        text += '\n';
      }
    });

    // Copy to clipboard
    navigator.clipboard.writeText(text).then(() => {
      alert('Grocery list copied to clipboard!');
    }).catch(err => {
      console.error('Failed to copy:', err);
    });
  };

  const stats = getCompletionStats();

  const categoryIcons = {
    proteins: '🥩',
    carbs: '🍞',
    vegetables: '🥬',
    fruits: '🍎',
    dairy: '🥛',
    pantry: '🧂',
    other: '🛒'
  };

  const categoryNames = {
    proteins: 'Proteins',
    carbs: 'Carbs & Grains',
    vegetables: 'Vegetables',
    fruits: 'Fruits',
    dairy: 'Dairy',
    pantry: 'Pantry Staples',
    other: 'Other'
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-24">
      {/* Header */}
      <div className="bg-gradient-to-r from-primary to-primary-600 text-white p-6 safe-top shadow-lg">
        <div className="flex items-center justify-between mb-3">
          <div>
            <h1 className="text-2xl font-bold">Grocery List</h1>
            <p className="text-primary-100 text-sm">Week {mealPlan?.week || 1}</p>
          </div>
          <button
            onClick={exportList}
            className="flex items-center gap-2 px-4 py-2 bg-primary-700 hover:bg-primary-800 rounded-lg font-semibold transition-colors"
          >
            <Share2 className="w-4 h-4" />
            Export
          </button>
        </div>

        {/* Progress */}
        <div className="mt-4">
          <div className="flex justify-between text-xs text-primary-100 mb-1">
            <span>{stats.checked} of {stats.total} items</span>
            <span>{stats.total > 0 ? Math.round((stats.checked / stats.total) * 100) : 0}%</span>
          </div>
          <div className="w-full bg-primary-700 rounded-full h-2">
            <div
              className="bg-white h-2 rounded-full transition-all duration-300"
              style={{ width: `${stats.total > 0 ? (stats.checked / stats.total) * 100 : 0}%` }}
            />
          </div>
        </div>
      </div>

      {/* Grocery List */}
      <div className="p-4 space-y-4">
        {Object.entries(groceryList).map(([category, items]) => {
          if (items.length === 0) return null;

          return (
            <div key={category} className="card bg-white">
              <h3 className="text-lg font-bold text-gray-900 mb-3 flex items-center gap-2">
                <span className="text-2xl">{categoryIcons[category]}</span>
                {categoryNames[category]}
                <span className="text-sm text-gray-500 ml-auto">
                  {items.filter(item => checkedItems[item.item]).length}/{items.length}
                </span>
              </h3>

              <div className="space-y-2">
                {items.map((item, index) => {
                  const isChecked = checkedItems[item.item] || false;
                  const amount = item.grams > 0
                    ? `${Math.round(item.grams)}g`
                    : item.descriptive || `${item.count}x`;

                  return (
                    <label
                      key={index}
                      className={`flex items-center gap-3 p-3 rounded-lg border-2 cursor-pointer transition-all ${
                        isChecked
                          ? 'border-secondary bg-secondary-50'
                          : 'border-gray-200 hover:border-gray-300 bg-white'
                      }`}
                    >
                      <div className="relative flex items-center justify-center flex-shrink-0">
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={() => toggleItem(item.item)}
                          className="w-6 h-6 rounded border-gray-300 text-secondary cursor-pointer focus:ring-2 focus:ring-secondary-500"
                        />
                      </div>

                      <div className="flex-1">
                        <div className={`font-medium ${isChecked ? 'text-gray-500 line-through' : 'text-gray-900'}`}>
                          {item.item}
                        </div>
                        <div className="text-sm text-gray-500">
                          {amount}
                        </div>
                      </div>

                      {isChecked && (
                        <Check className="w-5 h-5 text-secondary flex-shrink-0" />
                      )}
                    </label>
                  );
                })}
              </div>
            </div>
          );
        })}

        {stats.total === 0 && (
          <div className="card bg-gradient-to-br from-primary-50 to-secondary-50 text-center py-12">
            <ShoppingCart className="w-16 h-16 text-primary mx-auto mb-4" />
            <h3 className="text-xl font-bold text-gray-900 mb-2">No Meal Plan Yet</h3>
            <p className="text-gray-600">
              Complete onboarding to generate your meal plan and grocery list!
            </p>
          </div>
        )}

        {stats.checked === stats.total && stats.total > 0 && (
          <div className="card bg-gradient-to-r from-secondary-50 to-primary-50 border-l-4 border-secondary text-center py-6">
            <div className="text-4xl mb-2">🎉</div>
            <p className="text-lg font-bold text-gray-900 mb-1">Shopping Complete!</p>
            <p className="text-sm text-gray-600">You've checked off everything. Happy cooking!</p>
          </div>
        )}
      </div>

      <BottomNav currentScreen="groceries" onNavigate={onNavigate} />
    </div>
  );
};

export default GroceryList;
