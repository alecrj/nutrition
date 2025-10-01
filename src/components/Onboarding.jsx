import { useState } from 'react';
import { ChevronLeft, ChevronRight, Loader2, Sparkles } from 'lucide-react';
import { generateInitialMealPlan } from '../utils/claudeAPI';
import { saveUserProfile, saveMealPlan, saveCurrentWeek, saveCurrentDay } from '../utils/storage';

const Onboarding = ({ onComplete }) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState('');

  // Form data state
  const [formData, setFormData] = useState({
    // Step 2: Basic Info
    name: '',
    age: '',
    sex: '',
    heightFeet: '',
    heightInches: '',
    weight: '',
    unitSystem: 'imperial', // imperial or metric

    // Step 3: Goal
    goal: '',

    // Step 4: Activity Level
    activityLevel: '',

    // Step 5: Dietary Restrictions
    dietaryRestrictions: [],

    // Step 6: Allergies
    allergies: [],
    customAllergy: '',

    // Step 7: Dislikes
    dislikes: [],
    customDislike: '',

    // Step 8: Philosophy
    philosophy: '',

    // Step 9: Cooking
    cookingTime: '',
    cookingSkill: '',

    // Step 10: Meal Frequency
    mealFrequency: 3,
  });

  const totalSteps = 11; // 0-10 (Welcome + 10 steps)

  const updateFormData = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    setError('');
  };

  const toggleArrayItem = (field, item) => {
    setFormData(prev => ({
      ...prev,
      [field]: prev[field].includes(item)
        ? prev[field].filter(i => i !== item)
        : [...prev[field], item]
    }));
    setError('');
  };

  const addCustomItem = (field, customField) => {
    const customValue = formData[customField].trim();
    if (customValue && !formData[field].includes(customValue)) {
      setFormData(prev => ({
        ...prev,
        [field]: [...prev[field], customValue],
        [customField]: ''
      }));
    }
  };

  const canProceed = () => {
    switch (currentStep) {
      case 0: return true; // Welcome
      case 1: // Basic Info
        return formData.name && formData.age && formData.sex && formData.weight &&
               (formData.unitSystem === 'metric' || (formData.heightFeet && formData.heightInches));
      case 2: return formData.goal; // Goal
      case 3: return formData.activityLevel; // Activity
      case 4: return true; // Dietary (optional)
      case 5: return true; // Allergies (optional)
      case 6: return true; // Dislikes (optional)
      case 7: return formData.philosophy; // Philosophy
      case 8: return formData.cookingTime && formData.cookingSkill; // Cooking
      case 9: return formData.mealFrequency >= 2 && formData.mealFrequency <= 6; // Frequency
      default: return false;
    }
  };

  const handleNext = () => {
    if (canProceed()) {
      if (currentStep === totalSteps - 1) {
        handleGeneratePlan();
      } else {
        setCurrentStep(prev => prev + 1);
        window.scrollTo(0, 0);
      }
    }
  };

  const handleBack = () => {
    setCurrentStep(prev => Math.max(0, prev - 1));
    window.scrollTo(0, 0);
  };

  const handleGeneratePlan = async () => {
    setIsGenerating(true);
    setError('');

    try {
      // Convert height to cm if needed
      let heightCm;
      if (formData.unitSystem === 'imperial') {
        const totalInches = (parseInt(formData.heightFeet) * 12) + parseInt(formData.heightInches);
        heightCm = Math.round(totalInches * 2.54);
      } else {
        heightCm = parseInt(formData.height);
      }

      // Convert weight to kg if needed
      let weightKg;
      if (formData.unitSystem === 'imperial') {
        weightKg = Math.round(parseInt(formData.weight) * 0.453592);
      } else {
        weightKg = parseInt(formData.weight);
      }

      // Build user profile
      const userProfile = {
        name: formData.name,
        stats: {
          age: parseInt(formData.age),
          sex: formData.sex,
          height: heightCm,
          weight: weightKg,
          activityLevel: formData.activityLevel
        },
        goal: formData.goal,
        restrictions: {
          dietary: formData.dietaryRestrictions,
          allergies: formData.allergies,
          dislikes: formData.dislikes
        },
        philosophy: formData.philosophy,
        cooking: {
          skill: formData.cookingSkill,
          timeAvailable: formData.cookingTime
        },
        mealFrequency: formData.mealFrequency,
        createdAt: Date.now()
      };

      // Generate meal plan with Claude API
      const mealPlan = await generateInitialMealPlan(userProfile);

      // Save to localStorage
      saveUserProfile(userProfile);
      saveMealPlan(mealPlan);
      saveCurrentWeek(1);
      saveCurrentDay(0);

      // Navigate to home screen
      onComplete();
    } catch (err) {
      console.error('Error generating meal plan:', err);
      setError(err.message || 'Failed to generate meal plan. Please try again.');
      setIsGenerating(false);
    }
  };

  // Step components
  const renderStep = () => {
    switch (currentStep) {
      case 0:
        return <WelcomeStep />;
      case 1:
        return <BasicInfoStep formData={formData} updateFormData={updateFormData} />;
      case 2:
        return <GoalStep formData={formData} updateFormData={updateFormData} />;
      case 3:
        return <ActivityStep formData={formData} updateFormData={updateFormData} />;
      case 4:
        return <DietaryRestrictionsStep formData={formData} toggleArrayItem={toggleArrayItem} />;
      case 5:
        return <AllergiesStep formData={formData} toggleArrayItem={toggleArrayItem} updateFormData={updateFormData} addCustomItem={addCustomItem} />;
      case 6:
        return <DislikesStep formData={formData} toggleArrayItem={toggleArrayItem} updateFormData={updateFormData} addCustomItem={addCustomItem} />;
      case 7:
        return <PhilosophyStep formData={formData} updateFormData={updateFormData} />;
      case 8:
        return <CookingStep formData={formData} updateFormData={updateFormData} />;
      case 9:
        return <FrequencyStep formData={formData} updateFormData={updateFormData} />;
      case 10:
        return <GeneratingStep isGenerating={isGenerating} error={error} onRetry={handleGeneratePlan} />;
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-primary-50 to-gray-50 pb-24">
      {/* Progress Bar */}
      {currentStep > 0 && currentStep < totalSteps && (
        <div className="fixed top-0 left-0 right-0 bg-white shadow-sm z-10 safe-top">
          <div className="px-4 py-3">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-gray-600">
                Step {currentStep} of {totalSteps - 1}
              </span>
              <span className="text-sm text-gray-500">
                {Math.round((currentStep / (totalSteps - 1)) * 100)}%
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className="bg-primary h-2 rounded-full transition-all duration-300"
                style={{ width: `${(currentStep / (totalSteps - 1)) * 100}%` }}
              />
            </div>
          </div>
        </div>
      )}

      {/* Content */}
      <div className={currentStep > 0 && currentStep < totalSteps ? 'pt-20' : ''}>
        {renderStep()}
      </div>

      {/* Navigation Buttons */}
      {currentStep > 0 && currentStep < totalSteps && (
        <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 p-4 safe-bottom">
          <div className="flex gap-3 max-w-md mx-auto">
            {currentStep > 1 && (
              <button
                onClick={handleBack}
                className="flex items-center justify-center px-6 py-3 border-2 border-gray-300 text-gray-700 font-semibold rounded-lg min-h-touch transition-all hover:bg-gray-50 active:scale-95"
              >
                <ChevronLeft className="w-5 h-5 mr-1" />
                Back
              </button>
            )}
            <button
              onClick={handleNext}
              disabled={!canProceed()}
              className={`flex-1 flex items-center justify-center px-6 py-3 font-semibold rounded-lg min-h-touch transition-all ${
                canProceed()
                  ? 'bg-primary text-white hover:bg-primary-600 active:scale-95'
                  : 'bg-gray-300 text-gray-500 cursor-not-allowed'
              }`}
            >
              {currentStep === totalSteps - 1 ? 'Generate My Plan' : 'Next'}
              {currentStep < totalSteps - 1 && <ChevronRight className="w-5 h-5 ml-1" />}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

// STEP 1: Welcome
const WelcomeStep = () => (
  <div className="flex flex-col items-center justify-center min-h-screen px-6 text-center">
    <div className="mb-8">
      <div className="w-24 h-24 bg-primary rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-lg">
        <Sparkles className="w-12 h-12 text-white" />
      </div>
      <h1 className="text-4xl font-bold text-gray-900 mb-4">
        AI Meal Coach
      </h1>
      <p className="text-xl text-gray-600 max-w-md mx-auto leading-relaxed">
        Your AI nutrition coach that adapts to your life
      </p>
    </div>

    <div className="bg-white rounded-2xl p-6 shadow-lg max-w-md w-full mb-8">
      <ul className="space-y-4 text-left">
        <li className="flex items-start">
          <span className="text-2xl mr-3">✨</span>
          <div>
            <p className="font-semibold text-gray-900">Personalized Plans</p>
            <p className="text-sm text-gray-600">Meal plans built around your preferences and goals</p>
          </div>
        </li>
        <li className="flex items-start">
          <span className="text-2xl mr-3">🔄</span>
          <div>
            <p className="font-semibold text-gray-900">Flexible & Adaptable</p>
            <p className="text-sm text-gray-600">Swap any meal, adjust for real life</p>
          </div>
        </li>
        <li className="flex items-start">
          <span className="text-2xl mr-3">💬</span>
          <div>
            <p className="font-semibold text-gray-900">24/7 AI Support</p>
            <p className="text-sm text-gray-600">Chat with your coach anytime</p>
          </div>
        </li>
      </ul>
    </div>

    <button
      onClick={handleNext}
      className="btn-primary text-lg px-8 py-4 shadow-lg"
    >
      Get Started
    </button>
    <p className="text-sm text-gray-500 mt-4">Takes about 3 minutes</p>
  </div>
);

// STEP 2: Basic Info
const BasicInfoStep = ({ formData, updateFormData }) => (
  <div className="max-w-md mx-auto px-6 py-8">
    <h2 className="text-3xl font-bold text-gray-900 mb-2">Let's get to know you</h2>
    <p className="text-gray-600 mb-8">This helps us create your perfect meal plan</p>

    <div className="space-y-5">
      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-2">What's your name?</label>
        <input
          type="text"
          value={formData.name}
          onChange={(e) => updateFormData('name', e.target.value)}
          placeholder="Enter your name"
          className="input"
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">Age</label>
          <input
            type="number"
            value={formData.age}
            onChange={(e) => updateFormData('age', e.target.value)}
            placeholder="25"
            min="13"
            max="120"
            className="input"
          />
        </div>
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">Sex</label>
          <select
            value={formData.sex}
            onChange={(e) => updateFormData('sex', e.target.value)}
            className="input"
          >
            <option value="">Select...</option>
            <option value="male">Male</option>
            <option value="female">Female</option>
            <option value="other">Other</option>
          </select>
        </div>
      </div>

      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-2">Height</label>
        <div className="flex gap-3">
          <input
            type="number"
            value={formData.heightFeet}
            onChange={(e) => updateFormData('heightFeet', e.target.value)}
            placeholder="5"
            min="3"
            max="8"
            className="input flex-1"
          />
          <span className="text-gray-500 self-center font-medium">ft</span>
          <input
            type="number"
            value={formData.heightInches}
            onChange={(e) => updateFormData('heightInches', e.target.value)}
            placeholder="10"
            min="0"
            max="11"
            className="input flex-1"
          />
          <span className="text-gray-500 self-center font-medium">in</span>
        </div>
      </div>

      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-2">Weight</label>
        <div className="flex gap-3">
          <input
            type="number"
            value={formData.weight}
            onChange={(e) => updateFormData('weight', e.target.value)}
            placeholder="150"
            min="50"
            max="500"
            className="input flex-1"
          />
          <span className="text-gray-500 self-center font-medium">lbs</span>
        </div>
      </div>
    </div>
  </div>
);

// STEP 3: Goal Selection
const GoalStep = ({ formData, updateFormData }) => {
  const goals = [
    { id: 'lose_weight', emoji: '🎯', title: 'Lose Weight', desc: 'Shed pounds in a healthy, sustainable way' },
    { id: 'gain_muscle', emoji: '💪', title: 'Gain Muscle', desc: 'Build strength and lean mass' },
    { id: 'maintain', emoji: '⚖️', title: 'Maintain Weight', desc: 'Stay at your current weight' },
    { id: 'feel_better', emoji: '✨', title: 'Feel Better', desc: 'More energy, better health' }
  ];

  return (
    <div className="max-w-md mx-auto px-6 py-8">
      <h2 className="text-3xl font-bold text-gray-900 mb-2">What's your goal?</h2>
      <p className="text-gray-600 mb-8">Choose what matters most to you</p>

      <div className="space-y-3">
        {goals.map(goal => (
          <button
            key={goal.id}
            onClick={() => updateFormData('goal', goal.id)}
            className={`w-full p-5 rounded-xl border-2 text-left transition-all ${
              formData.goal === goal.id
                ? 'border-primary bg-primary-50 shadow-md'
                : 'border-gray-200 bg-white hover:border-gray-300'
            }`}
          >
            <div className="flex items-center">
              <span className="text-3xl mr-4">{goal.emoji}</span>
              <div className="flex-1">
                <p className="font-semibold text-gray-900 text-lg">{goal.title}</p>
                <p className="text-sm text-gray-600">{goal.desc}</p>
              </div>
              {formData.goal === goal.id && (
                <div className="w-6 h-6 rounded-full bg-primary flex items-center justify-center">
                  <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
              )}
            </div>
          </button>
        ))}
      </div>
    </div>
  );
};

// STEP 4: Activity Level
const ActivityStep = ({ formData, updateFormData }) => {
  const activities = [
    { id: 'sedentary', title: 'Sedentary', desc: 'Desk job, little to no exercise' },
    { id: 'lightly_active', title: 'Lightly Active', desc: 'Light exercise 1-2 days/week' },
    { id: 'moderately_active', title: 'Moderately Active', desc: 'Moderate exercise 3-5 days/week' },
    { id: 'very_active', title: 'Very Active', desc: 'Hard exercise 6-7 days/week' },
    { id: 'athlete', title: 'Athlete', desc: 'Training 2x per day' }
  ];

  return (
    <div className="max-w-md mx-auto px-6 py-8">
      <h2 className="text-3xl font-bold text-gray-900 mb-2">Activity level?</h2>
      <p className="text-gray-600 mb-8">How active are you on a typical week?</p>

      <div className="space-y-3">
        {activities.map(activity => (
          <button
            key={activity.id}
            onClick={() => updateFormData('activityLevel', activity.id)}
            className={`w-full p-5 rounded-xl border-2 text-left transition-all ${
              formData.activityLevel === activity.id
                ? 'border-primary bg-primary-50 shadow-md'
                : 'border-gray-200 bg-white hover:border-gray-300'
            }`}
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="font-semibold text-gray-900">{activity.title}</p>
                <p className="text-sm text-gray-600">{activity.desc}</p>
              </div>
              {formData.activityLevel === activity.id && (
                <div className="w-6 h-6 rounded-full bg-primary flex items-center justify-center flex-shrink-0 ml-3">
                  <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
              )}
            </div>
          </button>
        ))}
      </div>
    </div>
  );
};

// STEP 5: Dietary Restrictions
const DietaryRestrictionsStep = ({ formData, toggleArrayItem }) => {
  const restrictions = [
    'vegetarian', 'vegan', 'pescatarian', 'halal', 'kosher',
    'lactose_free', 'gluten_free'
  ];

  return (
    <div className="max-w-md mx-auto px-6 py-8">
      <h2 className="text-3xl font-bold text-gray-900 mb-2">Dietary restrictions?</h2>
      <p className="text-gray-600 mb-8">Select any that apply (or skip)</p>

      <div className="space-y-3">
        {restrictions.map(restriction => (
          <label
            key={restriction}
            className="flex items-center p-4 rounded-xl border-2 border-gray-200 bg-white cursor-pointer hover:border-gray-300 transition-all"
          >
            <input
              type="checkbox"
              checked={formData.dietaryRestrictions.includes(restriction)}
              onChange={() => toggleArrayItem('dietaryRestrictions', restriction)}
              className="checkbox mr-4"
            />
            <span className="font-medium text-gray-900 capitalize">
              {restriction.replace('_', ' ')}
            </span>
          </label>
        ))}

        <label className="flex items-center p-4 rounded-xl border-2 border-gray-200 bg-white cursor-pointer hover:border-gray-300 transition-all">
          <input
            type="checkbox"
            checked={formData.dietaryRestrictions.length === 0}
            onChange={() => {}}
            className="checkbox mr-4"
            disabled
          />
          <span className="font-medium text-gray-900">None</span>
        </label>
      </div>
    </div>
  );
};

// STEP 6: Allergies
const AllergiesStep = ({ formData, toggleArrayItem, updateFormData, addCustomItem }) => {
  const commonAllergies = [
    'dairy', 'eggs', 'fish', 'shellfish', 'tree_nuts',
    'peanuts', 'soy', 'wheat'
  ];

  return (
    <div className="max-w-md mx-auto px-6 py-8">
      <div className="bg-red-50 border-2 border-red-200 rounded-xl p-4 mb-6">
        <h2 className="text-2xl font-bold text-red-900 mb-1 flex items-center">
          <span className="mr-2">🚨</span>
          Food Allergies
        </h2>
        <p className="text-red-700">We will NEVER include these in your meals</p>
      </div>

      <div className="space-y-3 mb-6">
        {commonAllergies.map(allergy => (
          <label
            key={allergy}
            className="flex items-center p-4 rounded-xl border-2 border-gray-200 bg-white cursor-pointer hover:border-gray-300 transition-all"
          >
            <input
              type="checkbox"
              checked={formData.allergies.includes(allergy)}
              onChange={() => toggleArrayItem('allergies', allergy)}
              className="checkbox mr-4"
            />
            <span className="font-medium text-gray-900 capitalize">
              {allergy.replace('_', ' ')}
            </span>
          </label>
        ))}
      </div>

      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-2">
          Other allergies
        </label>
        <div className="flex gap-2">
          <input
            type="text"
            value={formData.customAllergy}
            onChange={(e) => updateFormData('customAllergy', e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && addCustomItem('allergies', 'customAllergy')}
            placeholder="Type and press Enter"
            className="input flex-1"
          />
          <button
            onClick={() => addCustomItem('allergies', 'customAllergy')}
            className="px-4 py-2 bg-primary text-white font-semibold rounded-lg hover:bg-primary-600"
          >
            Add
          </button>
        </div>
        {formData.allergies.filter(a => !commonAllergies.includes(a)).length > 0 && (
          <div className="mt-3 flex flex-wrap gap-2">
            {formData.allergies.filter(a => !commonAllergies.includes(a)).map(allergy => (
              <span
                key={allergy}
                className="inline-flex items-center px-3 py-1 rounded-full bg-red-100 text-red-800 text-sm"
              >
                {allergy}
                <button
                  onClick={() => toggleArrayItem('allergies', allergy)}
                  className="ml-2 hover:text-red-900"
                >
                  ×
                </button>
              </span>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

// STEP 7: Dislikes
const DislikesStep = ({ formData, toggleArrayItem, updateFormData, addCustomItem }) => {
  const commonDislikes = [
    'chicken', 'beef', 'pork', 'fish', 'turkey', 'eggs',
    'mushrooms', 'avocado', 'tofu', 'beans'
  ];

  return (
    <div className="max-w-md mx-auto px-6 py-8">
      <h2 className="text-3xl font-bold text-gray-900 mb-2">Foods you don't eat?</h2>
      <p className="text-gray-600 mb-8">These are preferences—we'll avoid them when possible</p>

      <div className="space-y-3 mb-6">
        {commonDislikes.map(food => (
          <label
            key={food}
            className="flex items-center p-4 rounded-xl border-2 border-gray-200 bg-white cursor-pointer hover:border-gray-300 transition-all"
          >
            <input
              type="checkbox"
              checked={formData.dislikes.includes(food)}
              onChange={() => toggleArrayItem('dislikes', food)}
              className="checkbox mr-4"
            />
            <span className="font-medium text-gray-900 capitalize">{food}</span>
          </label>
        ))}
      </div>

      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-2">
          Other foods you avoid
        </label>
        <div className="flex gap-2">
          <input
            type="text"
            value={formData.customDislike}
            onChange={(e) => updateFormData('customDislike', e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && addCustomItem('dislikes', 'customDislike')}
            placeholder="Type and press Enter"
            className="input flex-1"
          />
          <button
            onClick={() => addCustomItem('dislikes', 'customDislike')}
            className="px-4 py-2 bg-primary text-white font-semibold rounded-lg hover:bg-primary-600"
          >
            Add
          </button>
        </div>
        {formData.dislikes.filter(d => !commonDislikes.includes(d)).length > 0 && (
          <div className="mt-3 flex flex-wrap gap-2">
            {formData.dislikes.filter(d => !commonDislikes.includes(d)).map(food => (
              <span
                key={food}
                className="inline-flex items-center px-3 py-1 rounded-full bg-gray-200 text-gray-800 text-sm"
              >
                {food}
                <button
                  onClick={() => toggleArrayItem('dislikes', food)}
                  className="ml-2 hover:text-gray-900"
                >
                  ×
                </button>
              </span>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

// STEP 8: Philosophy
const PhilosophyStep = ({ formData, updateFormData }) => {
  const philosophies = [
    {
      id: 'flexible',
      title: 'Flexible Dieting',
      desc: 'Track macros. Diet soda, low-cal treats, protein bars—all good!'
    },
    {
      id: 'whole_foods',
      title: 'Mostly Whole Foods',
      desc: 'Prefer whole foods but not extreme about it'
    },
    {
      id: 'clean_eating',
      title: 'Clean Eating',
      desc: 'Avoid processed foods, artificial sweeteners, seed oils'
    },
    {
      id: 'whatever_works',
      title: 'Whatever Works',
      desc: 'Don\'t care about details—just help me reach my goal!'
    }
  ];

  return (
    <div className="max-w-md mx-auto px-6 py-8">
      <h2 className="text-3xl font-bold text-gray-900 mb-2">Your approach?</h2>
      <p className="text-gray-600 mb-8">What's your philosophy on dieting?</p>

      <div className="space-y-3">
        {philosophies.map(phil => (
          <button
            key={phil.id}
            onClick={() => updateFormData('philosophy', phil.id)}
            className={`w-full p-5 rounded-xl border-2 text-left transition-all ${
              formData.philosophy === phil.id
                ? 'border-primary bg-primary-50 shadow-md'
                : 'border-gray-200 bg-white hover:border-gray-300'
            }`}
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="font-semibold text-gray-900 text-lg">{phil.title}</p>
                <p className="text-sm text-gray-600 mt-1">{phil.desc}</p>
              </div>
              {formData.philosophy === phil.id && (
                <div className="w-6 h-6 rounded-full bg-primary flex items-center justify-center flex-shrink-0 ml-3">
                  <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
              )}
            </div>
          </button>
        ))}
      </div>
    </div>
  );
};

// STEP 9: Cooking
const CookingStep = ({ formData, updateFormData }) => {
  const timeOptions = [
    { id: '15min', title: '15 minutes or less', desc: 'Quick & simple meals' },
    { id: '30min', title: '20-30 minutes', desc: 'Moderate prep time' },
    { id: '45min+', title: '45+ minutes', desc: 'I love cooking!' }
  ];

  const skillOptions = [
    { id: 'beginner', title: 'Beginner', desc: 'Very simple recipes only' },
    { id: 'intermediate', title: 'Intermediate', desc: 'Comfortable in kitchen' },
    { id: 'advanced', title: 'Advanced', desc: 'Bring on complex recipes' }
  ];

  return (
    <div className="max-w-md mx-auto px-6 py-8">
      <h2 className="text-3xl font-bold text-gray-900 mb-2">Cooking preferences</h2>
      <p className="text-gray-600 mb-8">Help us match your lifestyle</p>

      <div className="mb-8">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Time available per meal</h3>
        <div className="space-y-3">
          {timeOptions.map(option => (
            <button
              key={option.id}
              onClick={() => updateFormData('cookingTime', option.id)}
              className={`w-full p-4 rounded-xl border-2 text-left transition-all ${
                formData.cookingTime === option.id
                  ? 'border-primary bg-primary-50 shadow-md'
                  : 'border-gray-200 bg-white hover:border-gray-300'
              }`}
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-semibold text-gray-900">{option.title}</p>
                  <p className="text-sm text-gray-600">{option.desc}</p>
                </div>
                {formData.cookingTime === option.id && (
                  <div className="w-6 h-6 rounded-full bg-primary flex items-center justify-center flex-shrink-0 ml-3">
                    <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                )}
              </div>
            </button>
          ))}
        </div>
      </div>

      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Cooking skill level</h3>
        <div className="space-y-3">
          {skillOptions.map(option => (
            <button
              key={option.id}
              onClick={() => updateFormData('cookingSkill', option.id)}
              className={`w-full p-4 rounded-xl border-2 text-left transition-all ${
                formData.cookingSkill === option.id
                  ? 'border-primary bg-primary-50 shadow-md'
                  : 'border-gray-200 bg-white hover:border-gray-300'
              }`}
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-semibold text-gray-900">{option.title}</p>
                  <p className="text-sm text-gray-600">{option.desc}</p>
                </div>
                {formData.cookingSkill === option.id && (
                  <div className="w-6 h-6 rounded-full bg-primary flex items-center justify-center flex-shrink-0 ml-3">
                    <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                )}
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

// STEP 10: Meal Frequency
const FrequencyStep = ({ formData, updateFormData }) => {
  return (
    <div className="max-w-md mx-auto px-6 py-8">
      <h2 className="text-3xl font-bold text-gray-900 mb-2">Meals per day?</h2>
      <p className="text-gray-600 mb-8">How many times do you want to eat?</p>

      <div className="bg-white rounded-2xl p-8 shadow-lg">
        <div className="text-center mb-6">
          <div className="text-6xl font-bold text-primary mb-2">{formData.mealFrequency}</div>
          <div className="text-gray-600">meals per day</div>
        </div>

        <input
          type="range"
          min="2"
          max="6"
          value={formData.mealFrequency}
          onChange={(e) => updateFormData('mealFrequency', parseInt(e.target.value))}
          className="w-full h-3 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-primary"
        />

        <div className="flex justify-between text-sm text-gray-500 mt-2">
          <span>2</span>
          <span>3</span>
          <span>4</span>
          <span>5</span>
          <span>6</span>
        </div>

        <div className="mt-6 p-4 bg-primary-50 rounded-lg">
          <p className="text-sm text-gray-700">
            {formData.mealFrequency <= 3 && '💡 Fewer, larger meals'}
            {formData.mealFrequency === 4 && '💡 Balanced approach'}
            {formData.mealFrequency >= 5 && '💡 Smaller, more frequent meals'}
          </p>
        </div>
      </div>
    </div>
  );
};

// STEP 11: Generating
const GeneratingStep = ({ isGenerating, error, onRetry }) => (
  <div className="flex flex-col items-center justify-center min-h-screen px-6">
    {!error ? (
      <>
        <Loader2 className="w-16 h-16 text-primary animate-spin mb-6" />
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          Creating your meal plan...
        </h2>
        <p className="text-gray-600 text-center max-w-sm">
          Our AI is designing a personalized plan just for you
        </p>
      </>
    ) : (
      <>
        <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-6">
          <span className="text-3xl">⚠️</span>
        </div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          Oops, something went wrong
        </h2>
        <p className="text-gray-600 text-center max-w-sm mb-6">
          {error}
        </p>
        <button onClick={onRetry} className="btn-primary">
          Try Again
        </button>
      </>
    )}
  </div>
);

export default Onboarding;
