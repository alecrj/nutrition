# AI Meal Coach - Project Specification

## 🎯 Core Vision
An AI-powered meal coaching app that feels like having a supportive, non-judgmental nutritionist in your pocket. Built for people who want to lose weight but hate restrictive diets and calorie tracking apps.

## 🎭 App Personality
- **Supportive, never judgmental** - "Ate pizza? No problem, let's adjust!"
- **Flexible, not rigid** - Everything can be swapped
- **Educational, not preachy** - Explains why, doesn't lecture
- **Real-life friendly** - Understands restaurants, busy days, cravings
- **Encouraging** - Celebrates small wins

## 👤 Target User
- Age: 25-45
- Goal: Lose 10-50 lbs
- Pain: Tried tracking apps, quit after a week
- Want: Simple plan that adapts to their life
- Don't want: Rigid meal prep, counting every calorie, feeling guilty

## 🏗️ Tech Stack
- **Frontend**: React 18 + Vite
- **Styling**: Tailwind CSS (mobile-first)
- **AI**: Anthropic Claude API (claude-sonnet-4-20250514)
- **Storage**: localStorage (MVP), migrate to Supabase later
- **Deployment**: Vercel (PWA)
- **Payments**: Stripe (add after MVP works)

## 📱 App Structure

### Phase 1: Onboarding (First-Time User)
**Goal**: Collect enough info to generate truly personalized meal plans

**Steps**:
1. Welcome screen with value prop
2. Basic stats (age, sex, height, weight)
3. Goal selection (lose weight/gain muscle/maintain/feel better)
4. Activity level (sedentary → very active)
5. Dietary restrictions (vegetarian, vegan, pescatarian, halal, kosher, etc.)
6. Allergies (CRITICAL - never include these foods)
7. Foods they dislike/don't eat (preferences)
8. Diet philosophy (flexible dieting vs whole foods vs clean eating vs whatever works)
9. Cooking skill/time (15min → 45min+ meals)
10. Meal frequency (2-6 meals per day)

**Data Structure**:
```javascript
userProfile = {
  name: string,
  stats: { age, sex, height, weight, activityLevel },
  goal: 'lose_weight' | 'gain_muscle' | 'maintain' | 'feel_better',
  restrictions: {
    dietary: ['vegetarian', 'vegan', 'pescatarian', 'halal', 'kosher', 'lactose_free', 'gluten_free'],
    allergies: ['dairy', 'eggs', 'fish', 'shellfish', 'tree_nuts', 'peanuts', 'soy', 'wheat', ...custom],
    dislikes: ['chicken', 'salmon', 'mushrooms', ...],
  },
  philosophy: 'flexible' | 'whole_foods' | 'clean_eating' | 'whatever_works',
  cooking: { skill: 'beginner' | 'intermediate' | 'advanced', timeAvailable: '15min' | '30min' | '45min+' },
  mealFrequency: number, // 2-6 meals per day
  macros: { protein, carbs, fats, calories }, // calculated by AI
  createdAt: timestamp
}