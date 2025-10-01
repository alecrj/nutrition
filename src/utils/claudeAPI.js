/**
 * Claude API integration for AI Meal Coach
 * Handles all interactions with Anthropic's Claude API
 */

const CLAUDE_API_URL = 'https://api.anthropic.com/v1/messages';
const MODEL = 'claude-sonnet-4-20250514';
const MAX_TOKENS = 4096;
const API_TIMEOUT = 30000; // 30 seconds

// Get API key from environment or prompt user
const getApiKey = () => {
  // In production, this should come from a secure backend
  // For MVP, we'll use a key stored in localStorage or prompt
  const key = localStorage.getItem('claude_api_key') || import.meta.env.VITE_CLAUDE_API_KEY;
  if (!key) {
    throw new Error('Claude API key not configured. Please add your API key in settings.');
  }
  return key;
};

/**
 * Makes a request to Claude API with timeout handling
 */
const callClaudeAPI = async (messages, systemPrompt) => {
  const apiKey = getApiKey();

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), API_TIMEOUT);

  try {
    const response = await fetch(CLAUDE_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify({
        model: MODEL,
        max_tokens: MAX_TOKENS,
        system: systemPrompt,
        messages: messages
      }),
      signal: controller.signal
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      throw new Error(error.error?.message || `API error: ${response.status}`);
    }

    const data = await response.json();
    return data.content[0].text;
  } catch (error) {
    clearTimeout(timeoutId);
    if (error.name === 'AbortError') {
      throw new Error('Request timed out. Please try again.');
    }
    throw error;
  }
};

/**
 * Calculate macros based on user stats and goals
 */
const calculateMacros = (userProfile) => {
  const { age, sex, height, weight, activityLevel } = userProfile.stats;

  // Calculate BMR using Mifflin-St Jeor equation
  let bmr;
  if (sex === 'male') {
    bmr = 10 * weight + 6.25 * height - 5 * age + 5;
  } else {
    bmr = 10 * weight + 6.25 * height - 5 * age - 161;
  }

  // Activity multipliers
  const activityMultipliers = {
    sedentary: 1.2,
    lightly_active: 1.375,
    moderately_active: 1.55,
    very_active: 1.725,
    athlete: 1.9
  };

  const tdee = Math.round(bmr * (activityMultipliers[activityLevel] || 1.2));

  // Adjust calories based on goal
  let targetCalories;
  switch (userProfile.goal) {
    case 'lose_weight':
      targetCalories = Math.round(tdee * 0.8); // 20% deficit
      break;
    case 'gain_muscle':
      targetCalories = Math.round(tdee * 1.1); // 10% surplus
      break;
    case 'maintain':
    case 'feel_better':
    default:
      targetCalories = tdee;
  }

  // Calculate macro split (40/30/30 for balanced approach)
  // Adjust based on goal
  let proteinPercent, carbsPercent, fatsPercent;

  if (userProfile.goal === 'gain_muscle') {
    proteinPercent = 0.35;
    carbsPercent = 0.40;
    fatsPercent = 0.25;
  } else if (userProfile.goal === 'lose_weight') {
    proteinPercent = 0.40;
    carbsPercent = 0.30;
    fatsPercent = 0.30;
  } else {
    proteinPercent = 0.30;
    carbsPercent = 0.40;
    fatsPercent = 0.30;
  }

  return {
    calories: targetCalories,
    protein: Math.round((targetCalories * proteinPercent) / 4), // 4 cal per gram
    carbs: Math.round((targetCalories * carbsPercent) / 4),
    fats: Math.round((targetCalories * fatsPercent) / 9) // 9 cal per gram
  };
};

/**
 * Generates initial 7-day meal plan based on user profile
 */
export const generateInitialMealPlan = async (userProfile) => {
  try {
    // Calculate target macros
    const macros = calculateMacros(userProfile);
    userProfile.macros = macros;

    // Build detailed system prompt
    const systemPrompt = `You are a supportive, knowledgeable AI nutrition coach creating personalized meal plans. Your tone is warm, encouraging, and never judgmental. You understand that people want flexible, sustainable plans that fit their real lives.`;

    // Build user prompt with all requirements
    const userPrompt = `Generate a personalized 7-day meal plan for ${userProfile.name}.

USER PROFILE:
- Age: ${userProfile.stats.age}, Sex: ${userProfile.stats.sex}
- Goal: ${userProfile.goal.replace('_', ' ')}
- Activity Level: ${userProfile.stats.activityLevel.replace('_', ' ')}
- Philosophy: ${userProfile.philosophy.replace('_', ' ')}
- Cooking: ${userProfile.cooking.skill}, max ${userProfile.cooking.timeAvailable} per meal
- Meals per day: ${userProfile.mealFrequency}

CRITICAL REQUIREMENTS:
${userProfile.restrictions.allergies.length > 0 ? `- NEVER INCLUDE (ALLERGIES): ${userProfile.restrictions.allergies.join(', ')}` : ''}
${userProfile.restrictions.dislikes.length > 0 ? `- Avoid when possible: ${userProfile.restrictions.dislikes.join(', ')}` : ''}
${userProfile.restrictions.dietary.length > 0 ? `- Dietary restrictions: ${userProfile.restrictions.dietary.join(', ')}` : ''}

DAILY MACRO TARGETS:
- Calories: ${macros.calories} kcal
- Protein: ${macros.protein}g
- Carbs: ${macros.carbs}g
- Fat: ${macros.fats}g

RESPONSE FORMAT (MUST BE VALID JSON):
{
  "week": 1,
  "dailyTarget": {
    "calories": ${macros.calories},
    "protein": ${macros.protein},
    "carbs": ${macros.carbs},
    "fats": ${macros.fats}
  },
  "days": [
    {
      "day": "Monday",
      "meals": [
        {
          "type": "breakfast",
          "name": "Greek Yogurt Power Bowl",
          "ingredients": [
            {
              "item": "Greek yogurt (plain, non-fat)",
              "grams": 200,
              "descriptive": "1 cup / standard container"
            },
            {
              "item": "Fresh blueberries",
              "grams": 75,
              "descriptive": "1/2 cup / small handful"
            }
          ],
          "instructions": [
            "Add yogurt to bowl",
            "Top with berries and granola",
            "Drizzle with honey"
          ],
          "macros": {
            "protein": 25,
            "carbs": 35,
            "fats": 8,
            "calories": 310
          },
          "prepTime": "5 min"
        }
      ]
    }
  ]
}

IMPORTANT GUIDELINES:
1. Each day should have exactly ${userProfile.mealFrequency} meals/snacks
2. Daily totals should be within 50 calories of target
3. Include both gram measurements AND descriptive portions (palm-sized, fist-sized, etc.)
4. Keep recipes under ${userProfile.cooking.timeAvailable} prep time
5. Match their ${userProfile.philosophy} philosophy
6. Be creative with variety—different meals each day
7. Instructions should be simple, clear steps
8. ABSOLUTELY NO foods from the allergy list

Respond ONLY with valid JSON. No additional text before or after.`;

    const response = await callClaudeAPI(
      [{ role: 'user', content: userPrompt }],
      systemPrompt
    );

    // Parse JSON response
    let mealPlan;
    try {
      // Remove any potential markdown code blocks
      const cleanedResponse = response.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
      mealPlan = JSON.parse(cleanedResponse);
    } catch (parseError) {
      console.error('Failed to parse meal plan JSON:', response);
      throw new Error('Failed to generate valid meal plan. Please try again.');
    }

    // Validate meal plan structure
    if (!mealPlan.days || mealPlan.days.length !== 7) {
      throw new Error('Invalid meal plan structure. Please try again.');
    }

    return mealPlan;
  } catch (error) {
    console.error('Error generating meal plan:', error);
    throw new Error(error.message || 'Failed to generate meal plan');
  }
};

/**
 * Generates meal swap options
 */
export const generateMealSwap = async (currentMeal, userProfile, requestType = 'quick', customRequest = null) => {
  try {
    const systemPrompt = `You are a supportive AI nutrition coach helping users swap meals. Always provide options that match their dietary needs and preferences. Be creative and encouraging.`;

    let userPrompt;
    if (requestType === 'quick') {
      userPrompt = `Generate 3 quick meal swap options with similar macros.

CURRENT MEAL:
${JSON.stringify(currentMeal, null, 2)}

USER REQUIREMENTS:
${userProfile.restrictions.allergies.length > 0 ? `- NEVER include: ${userProfile.restrictions.allergies.join(', ')}` : ''}
${userProfile.restrictions.dislikes.length > 0 ? `- Avoid: ${userProfile.restrictions.dislikes.join(', ')}` : ''}
${userProfile.restrictions.dietary.length > 0 ? `- Diet: ${userProfile.restrictions.dietary.join(', ')}` : ''}
- Philosophy: ${userProfile.philosophy}
- Max prep time: ${userProfile.cooking.timeAvailable}

TARGET MACROS (within 50 cal):
- Protein: ${currentMeal.macros.protein}g ± 5g
- Carbs: ${currentMeal.macros.carbs}g ± 10g
- Fats: ${currentMeal.macros.fats}g ± 5g
- Calories: ${currentMeal.macros.calories} ± 50

Respond with ONLY valid JSON array of 3 meal options in the same format as the current meal.`;
    } else {
      userPrompt = `Generate a custom meal based on this request: "${customRequest}"

USER REQUIREMENTS:
${userProfile.restrictions.allergies.length > 0 ? `- NEVER include: ${userProfile.restrictions.allergies.join(', ')}` : ''}
${userProfile.restrictions.dietary.length > 0 ? `- Diet: ${userProfile.restrictions.dietary.join(', ')}` : ''}
- Philosophy: ${userProfile.philosophy}
- Max prep time: ${userProfile.cooking.timeAvailable}

TARGET MACROS (try to match but flexibility ok):
- Protein: ${currentMeal.macros.protein}g
- Carbs: ${currentMeal.macros.carbs}g
- Fats: ${currentMeal.macros.fats}g
- Calories: ${currentMeal.macros.calories}

Respond with ONLY a valid JSON object for ONE meal in this format:
{
  "name": "...",
  "ingredients": [...],
  "instructions": [...],
  "macros": {...},
  "prepTime": "..."
}`;
    }

    const response = await callClaudeAPI(
      [{ role: 'user', content: userPrompt }],
      systemPrompt
    );

    const cleanedResponse = response.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
    const swapOptions = JSON.parse(cleanedResponse);

    return requestType === 'quick' ? swapOptions : [swapOptions];
  } catch (error) {
    console.error('Error generating meal swap:', error);
    throw new Error('Failed to generate meal alternatives');
  }
};

/**
 * Chat with AI nutrition coach
 */
export const chatWithCoach = async (userMessage, conversationHistory, userProfile) => {
  try {
    const systemPrompt = `You are ${userProfile.name}'s supportive AI nutrition coach. Your personality:

- Never judgmental—life happens!
- Flexible and solution-oriented
- Educational without preaching
- Encouraging and warm
- Match their philosophy: ${userProfile.philosophy.replace('_', ' ')}

USER CONTEXT:
- Goal: ${userProfile.goal.replace('_', ' ')}
- Daily targets: ${userProfile.macros.calories} cal, ${userProfile.macros.protein}g protein
- Allergies: ${userProfile.restrictions.allergies.join(', ') || 'none'}
- Dislikes: ${userProfile.restrictions.dislikes.join(', ') || 'none'}
- Philosophy: ${userProfile.philosophy.replace('_', ' ')}

Guidelines:
- Keep responses conversational (2-4 sentences usually)
- Be warm and supportive, never robotic
- Include specific advice or numbers when helpful
- Celebrate wins, normalize challenges
- Provide actionable suggestions`;

    // Build conversation messages
    const messages = conversationHistory.map(msg => ({
      role: msg.role,
      content: msg.content
    }));

    messages.push({
      role: 'user',
      content: userMessage
    });

    const response = await callClaudeAPI(messages, systemPrompt);

    return response;
  } catch (error) {
    console.error('Error in chat:', error);
    throw new Error('Coach is having trouble responding. Please try again.');
  }
};

/**
 * Handle life events and adjust meal plan
 */
export const handleLifeEvent = async (eventType, context, userProfile) => {
  try {
    const systemPrompt = `You are a supportive AI nutrition coach helping users navigate real-life situations. Provide practical, non-judgmental advice and adjusted meal suggestions.`;

    let userPrompt;
    switch (eventType) {
      case 'ate_off_plan':
        userPrompt = `User ate off-plan: ${context.description}
Estimated: ${context.calories || 'unknown'} calories

Provide:
1. Supportive response (no judgment!)
2. Adjusted dinner option if needed
3. Quick tips to get back on track

User's daily target: ${userProfile.macros.calories} cal
Philosophy: ${userProfile.philosophy}`;
        break;

      case 'restaurant':
        userPrompt = `User is at: ${context.restaurant || 'a restaurant'}
Cuisine type: ${context.cuisineType || 'unknown'}

Suggest:
1. 3-5 menu items that fit their macros
2. Ordering tips
3. What to avoid

Target: ${userProfile.macros.protein}g protein, ~${Math.round(userProfile.macros.calories / 3)} cal for this meal
Allergies: ${userProfile.restrictions.allergies.join(', ') || 'none'}`;
        break;

      case 'not_hungry':
        userPrompt = `User is not hungry for ${context.mealType}

Provide:
1. Why it's okay to listen to your body
2. Suggestion: skip, smaller portion, or save for later?
3. How to adjust rest of day

Their approach: ${userProfile.philosophy}`;
        break;

      default:
        userPrompt = context.description;
    }

    const response = await callClaudeAPI(
      [{ role: 'user', content: userPrompt }],
      systemPrompt
    );

    return response;
  } catch (error) {
    console.error('Error handling life event:', error);
    throw new Error('Failed to process request');
  }
};

export default {
  generateInitialMealPlan,
  generateMealSwap,
  chatWithCoach,
  handleLifeEvent
};
