import { useState } from 'react';
import { User, RefreshCw, Trash2, Key, Info, LogOut } from 'lucide-react';
import BottomNav from './BottomNav';
import { clearAllData } from '../utils/storage';

const Settings = ({ userProfile, onNavigate }) => {
  const [showApiKeyInput, setShowApiKeyInput] = useState(false);
  const [apiKey, setApiKey] = useState('');
  const [showConfirmReset, setShowConfirmReset] = useState(false);
  const [showConfirmClear, setShowConfirmClear] = useState(false);

  const handleSaveApiKey = () => {
    if (apiKey.trim()) {
      localStorage.setItem('claude_api_key', apiKey.trim());
      setShowApiKeyInput(false);
      setApiKey('');
      alert('API key saved successfully!');
    }
  };

  const handleResetPlan = () => {
    // In a real app, this would regenerate the meal plan
    setShowConfirmReset(false);
    alert('Meal plan will be regenerated on next app load');
    window.location.reload();
  };

  const handleClearAllData = () => {
    clearAllData();
    setShowConfirmClear(false);
    window.location.reload();
  };

  const goalLabels = {
    lose_weight: 'Lose Weight',
    gain_muscle: 'Gain Muscle',
    maintain: 'Maintain Weight',
    feel_better: 'Feel Better'
  };

  const activityLabels = {
    sedentary: 'Sedentary',
    lightly_active: 'Lightly Active',
    moderately_active: 'Moderately Active',
    very_active: 'Very Active',
    athlete: 'Athlete'
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-24">
      {/* Header */}
      <div className="bg-gradient-to-r from-primary to-primary-600 text-white p-6 safe-top shadow-lg">
        <h1 className="text-2xl font-bold mb-2">Settings</h1>
        <p className="text-primary-100 text-sm">Manage your account & preferences</p>
      </div>

      {/* Settings Content */}
      <div className="p-4 space-y-4">
        {/* User Profile Card */}
        <div className="card bg-white">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 bg-primary-100 rounded-full flex items-center justify-center">
              <User className="w-6 h-6 text-primary" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-gray-900">{userProfile?.name}</h2>
              <p className="text-sm text-gray-600">
                Goal: {goalLabels[userProfile?.goal] || 'Not set'}
              </p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 p-4 bg-gray-50 rounded-lg">
            <div>
              <div className="text-xs text-gray-500 mb-1">Age</div>
              <div className="font-semibold text-gray-900">{userProfile?.stats?.age} years</div>
            </div>
            <div>
              <div className="text-xs text-gray-500 mb-1">Sex</div>
              <div className="font-semibold text-gray-900 capitalize">{userProfile?.stats?.sex}</div>
            </div>
            <div>
              <div className="text-xs text-gray-500 mb-1">Height</div>
              <div className="font-semibold text-gray-900">{userProfile?.stats?.height} cm</div>
            </div>
            <div>
              <div className="text-xs text-gray-500 mb-1">Weight</div>
              <div className="font-semibold text-gray-900">{userProfile?.stats?.weight} kg</div>
            </div>
            <div className="col-span-2">
              <div className="text-xs text-gray-500 mb-1">Activity Level</div>
              <div className="font-semibold text-gray-900">
                {activityLabels[userProfile?.stats?.activityLevel] || 'Not set'}
              </div>
            </div>
          </div>
        </div>

        {/* Daily Targets */}
        <div className="card bg-white">
          <h3 className="text-lg font-bold text-gray-900 mb-3 flex items-center gap-2">
            <span>🎯</span>
            Daily Targets
          </h3>

          <div className="grid grid-cols-2 gap-3">
            <div className="p-3 bg-primary-50 rounded-lg">
              <div className="text-sm text-gray-600">Calories</div>
              <div className="text-xl font-bold text-primary">
                {userProfile?.macros?.calories || 0}
              </div>
            </div>
            <div className="p-3 bg-secondary-50 rounded-lg">
              <div className="text-sm text-gray-600">Protein</div>
              <div className="text-xl font-bold text-secondary">
                {userProfile?.macros?.protein || 0}g
              </div>
            </div>
            <div className="p-3 bg-gray-50 rounded-lg">
              <div className="text-sm text-gray-600">Carbs</div>
              <div className="text-xl font-bold text-gray-700">
                {userProfile?.macros?.carbs || 0}g
              </div>
            </div>
            <div className="p-3 bg-gray-50 rounded-lg">
              <div className="text-sm text-gray-600">Fats</div>
              <div className="text-xl font-bold text-gray-700">
                {userProfile?.macros?.fats || 0}g
              </div>
            </div>
          </div>
        </div>

        {/* Preferences */}
        <div className="card bg-white">
          <h3 className="text-lg font-bold text-gray-900 mb-3">Preferences</h3>

          <div className="space-y-3 text-sm">
            <div className="flex justify-between py-2 border-b border-gray-100">
              <span className="text-gray-600">Diet Philosophy</span>
              <span className="font-semibold text-gray-900 capitalize">
                {userProfile?.philosophy?.replace('_', ' ') || 'Not set'}
              </span>
            </div>

            <div className="flex justify-between py-2 border-b border-gray-100">
              <span className="text-gray-600">Cooking Time</span>
              <span className="font-semibold text-gray-900">
                {userProfile?.cooking?.timeAvailable || 'Not set'}
              </span>
            </div>

            <div className="flex justify-between py-2 border-b border-gray-100">
              <span className="text-gray-600">Cooking Skill</span>
              <span className="font-semibold text-gray-900 capitalize">
                {userProfile?.cooking?.skill || 'Not set'}
              </span>
            </div>

            <div className="flex justify-between py-2">
              <span className="text-gray-600">Meals per Day</span>
              <span className="font-semibold text-gray-900">
                {userProfile?.mealFrequency || 3}
              </span>
            </div>
          </div>
        </div>

        {/* Restrictions */}
        {(userProfile?.restrictions?.allergies?.length > 0 ||
          userProfile?.restrictions?.dislikes?.length > 0 ||
          userProfile?.restrictions?.dietary?.length > 0) && (
          <div className="card bg-white">
            <h3 className="text-lg font-bold text-gray-900 mb-3">Restrictions</h3>

            {userProfile?.restrictions?.allergies?.length > 0 && (
              <div className="mb-3">
                <div className="text-sm font-semibold text-red-700 mb-2">🚨 Allergies</div>
                <div className="flex flex-wrap gap-2">
                  {userProfile.restrictions.allergies.map((allergy, index) => (
                    <span
                      key={index}
                      className="px-3 py-1 bg-red-50 border border-red-200 text-red-800 rounded-full text-sm"
                    >
                      {allergy}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {userProfile?.restrictions?.dietary?.length > 0 && (
              <div className="mb-3">
                <div className="text-sm font-semibold text-gray-700 mb-2">Dietary</div>
                <div className="flex flex-wrap gap-2">
                  {userProfile.restrictions.dietary.map((diet, index) => (
                    <span
                      key={index}
                      className="px-3 py-1 bg-primary-50 border border-primary-200 text-primary-800 rounded-full text-sm capitalize"
                    >
                      {diet.replace('_', ' ')}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {userProfile?.restrictions?.dislikes?.length > 0 && (
              <div>
                <div className="text-sm font-semibold text-gray-700 mb-2">Dislikes</div>
                <div className="flex flex-wrap gap-2">
                  {userProfile.restrictions.dislikes.map((dislike, index) => (
                    <span
                      key={index}
                      className="px-3 py-1 bg-gray-100 border border-gray-200 text-gray-700 rounded-full text-sm capitalize"
                    >
                      {dislike}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* API Key Management */}
        <div className="card bg-white">
          <h3 className="text-lg font-bold text-gray-900 mb-3 flex items-center gap-2">
            <Key className="w-5 h-5 text-primary" />
            API Configuration
          </h3>

          {!showApiKeyInput ? (
            <button
              onClick={() => setShowApiKeyInput(true)}
              className="w-full py-3 border-2 border-gray-300 text-gray-700 font-semibold rounded-lg hover:bg-gray-50 transition-all"
            >
              Update Claude API Key
            </button>
          ) : (
            <div className="space-y-3">
              <input
                type="password"
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                placeholder="sk-ant-..."
                className="input"
              />
              <div className="flex gap-2">
                <button
                  onClick={handleSaveApiKey}
                  disabled={!apiKey.trim()}
                  className={`flex-1 py-2 font-semibold rounded-lg transition-all ${
                    apiKey.trim()
                      ? 'bg-primary text-white hover:bg-primary-600'
                      : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  }`}
                >
                  Save
                </button>
                <button
                  onClick={() => {
                    setShowApiKeyInput(false);
                    setApiKey('');
                  }}
                  className="flex-1 py-2 border-2 border-gray-300 text-gray-700 font-semibold rounded-lg hover:bg-gray-50"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}

          <p className="text-xs text-gray-500 mt-3">
            Get your API key from{' '}
            <a
              href="https://console.anthropic.com/"
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary hover:underline"
            >
              console.anthropic.com
            </a>
          </p>
        </div>

        {/* Actions */}
        <div className="card bg-white space-y-3">
          <h3 className="text-lg font-bold text-gray-900 mb-3">Actions</h3>

          {/* Reset Meal Plan */}
          {!showConfirmReset ? (
            <button
              onClick={() => setShowConfirmReset(true)}
              className="w-full flex items-center justify-center gap-2 py-3 border-2 border-primary text-primary font-semibold rounded-lg hover:bg-primary-50 transition-all"
            >
              <RefreshCw className="w-5 h-5" />
              Reset Meal Plan
            </button>
          ) : (
            <div className="p-4 bg-yellow-50 border-2 border-yellow-200 rounded-lg">
              <p className="text-sm text-gray-700 mb-3">
                This will regenerate your meal plan. Continue?
              </p>
              <div className="flex gap-2">
                <button
                  onClick={handleResetPlan}
                  className="flex-1 py-2 bg-primary text-white font-semibold rounded-lg hover:bg-primary-600"
                >
                  Yes, Reset
                </button>
                <button
                  onClick={() => setShowConfirmReset(false)}
                  className="flex-1 py-2 border-2 border-gray-300 text-gray-700 font-semibold rounded-lg hover:bg-gray-50"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}

          {/* Clear All Data */}
          {!showConfirmClear ? (
            <button
              onClick={() => setShowConfirmClear(true)}
              className="w-full flex items-center justify-center gap-2 py-3 border-2 border-red-500 text-red-500 font-semibold rounded-lg hover:bg-red-50 transition-all"
            >
              <Trash2 className="w-5 h-5" />
              Clear All Data
            </button>
          ) : (
            <div className="p-4 bg-red-50 border-2 border-red-200 rounded-lg">
              <p className="text-sm text-red-800 mb-3 font-semibold">
                ⚠️ This will delete all your data and you'll need to start over. This cannot be undone!
              </p>
              <div className="flex gap-2">
                <button
                  onClick={handleClearAllData}
                  className="flex-1 py-2 bg-red-500 text-white font-semibold rounded-lg hover:bg-red-600"
                >
                  Yes, Delete Everything
                </button>
                <button
                  onClick={() => setShowConfirmClear(false)}
                  className="flex-1 py-2 border-2 border-gray-300 text-gray-700 font-semibold rounded-lg hover:bg-gray-50"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}
        </div>

        {/* App Info */}
        <div className="card bg-gradient-to-br from-primary-50 to-secondary-50 border-2 border-primary-200">
          <div className="flex items-center gap-2 mb-2">
            <Info className="w-5 h-5 text-primary" />
            <h3 className="text-lg font-bold text-gray-900">About</h3>
          </div>
          <p className="text-sm text-gray-700 mb-2">
            <span className="font-semibold">AI Meal Coach</span> - Your personalized nutrition companion
          </p>
          <p className="text-xs text-gray-600">
            Version 1.0.0 (MVP)
          </p>
          <p className="text-xs text-gray-600 mt-2">
            Built with React, Tailwind CSS & Claude AI
          </p>
        </div>
      </div>

      <BottomNav currentScreen="settings" onNavigate={onNavigate} />
    </div>
  );
};

export default Settings;
