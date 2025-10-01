# 🥗 AI Meal Coach

Your AI-powered nutrition coach that adapts to your life. Built with React, Tailwind CSS, and Claude API.

## 🎯 Overview

AI Meal Coach is a Progressive Web App that provides:
- **Personalized meal plans** based on your goals, preferences, and restrictions
- **Flexible meal swapping** - swap any meal instantly
- **24/7 AI coaching** via chat for support and advice
- **Real-life adaptability** - handles restaurants, cravings, off-plan eating
- **No calorie counting** - just follow your plan

## 🚀 Quick Start

### Prerequisites
- Node.js 16+
- Anthropic Claude API key ([Get one here](https://console.anthropic.com/))

### Installation

1. **Clone and install dependencies**
```bash
cd ai-meal-coach
npm install
```

2. **Set up your API key**
```bash
# Copy the example env file
cp .env.example .env

# Edit .env and add your Claude API key
VITE_CLAUDE_API_KEY=your_api_key_here
```

3. **Start the development server**
```bash
npm run dev
```

4. **Open the app**
Navigate to `http://localhost:5173` in your browser

## 📱 App Structure

### Current Features (MVP Phase 1)

✅ **Complete Onboarding Flow**
- 10-step wizard collecting user preferences
- Goal selection (lose weight, gain muscle, maintain, feel better)
- Activity level and dietary restrictions
- Allergies (critical - never violated)
- Diet philosophy (flexible, whole foods, clean eating, whatever works)
- Cooking preferences and meal frequency

✅ **AI Meal Plan Generation**
- Claude API integration
- Personalized 7-day meal plans
- Macro calculation based on user stats
- Respects all restrictions and preferences

✅ **Basic Home Screen**
- View today's meals
- See daily macro totals
- Track progress through the week

### In Progress

🔨 **Enhanced Home Screen**
- Full MealCard component with expandable details
- Ingredients with dual measurements (grams + descriptive)
- Recipe instructions
- Meal completion tracking

🔨 **Meal Swap Feature**
- Quick swaps with similar macros
- Custom meal requests
- AI-generated alternatives

🔨 **Chat Coach**
- 24/7 AI support
- Quick action buttons for common scenarios
- Context-aware responses

🔨 **Additional Screens**
- Progress tracking
- Grocery list auto-generation
- Settings/profile editor

## 🏗️ Tech Stack

- **Frontend**: React 19 + Vite
- **Styling**: Tailwind CSS (mobile-first)
- **AI**: Anthropic Claude API (claude-sonnet-4-20250514)
- **Storage**: localStorage (MVP), will migrate to Supabase
- **Icons**: Lucide React
- **Charts**: Recharts

## 📂 Project Structure

```
ai-meal-coach/
├── src/
│   ├── components/          # React components
│   │   ├── Onboarding.jsx   # Complete 10-step onboarding
│   │   ├── HomeScreen.jsx   # Main app screen
│   │   └── ...              # More components to come
│   ├── utils/               # Utility functions
│   │   ├── claudeAPI.js     # Claude API integration
│   │   └── storage.js       # localStorage helpers
│   ├── App.jsx              # Main app router
│   ├── main.jsx             # React entry point
│   └── index.css            # Tailwind + custom styles
├── public/                  # Static assets
├── PROJECT_SPEC.md          # Complete project specification
└── package.json
```

## 🎨 Design Philosophy

**Mobile-First**
- Optimized for iPhone screens (375px-414px)
- Touch-friendly (min 44x44px targets)
- Safe area handling for notches

**Supportive, Never Judgmental**
- Flexible meal swapping
- Understanding of real-life situations
- Encouraging feedback, not criticism

**Simple & Fast**
- No complex calorie tracking
- Quick meal prep times
- Instant AI responses

## 🔧 Development

### Available Scripts

```bash
npm run dev      # Start dev server
npm run build    # Build for production
npm run preview  # Preview production build
npm run lint     # Run ESLint
```

### Key Files to Understand

**`src/utils/claudeAPI.js`**
- All Claude API interactions
- Meal plan generation
- Meal swapping
- Chat functionality

**`src/utils/storage.js`**
- localStorage wrapper functions
- Data persistence
- Profile and meal plan management

**`src/components/Onboarding.jsx`**
- Complete 10-step onboarding wizard
- Form validation
- Progress tracking

**`PROJECT_SPEC.md`**
- Complete app specification
- User stories and requirements
- Future roadmap

## 🐛 Known Issues / TODO

- [ ] Need to add error boundary for API failures
- [ ] Meal swap modal not yet implemented
- [ ] Chat interface not yet built
- [ ] Progress tracking needs implementation
- [ ] Grocery list generation pending
- [ ] Need to add PWA manifest for "Add to Home Screen"
- [ ] Offline support via service worker

## 🚢 Deployment

### Vercel (Recommended)

1. Push code to GitHub
2. Import project in Vercel
3. Add environment variable: `VITE_CLAUDE_API_KEY`
4. Deploy!

### Other Platforms

Any static hosting works:
- Netlify
- Cloudflare Pages
- GitHub Pages (with GitHub Actions)

**Build command**: `npm run build`
**Output directory**: `dist`

## 📝 Environment Variables

```bash
# Required
VITE_CLAUDE_API_KEY=sk-ant-...  # Your Anthropic API key
```

## 🔐 Security Notes

⚠️ **Important**: The current MVP stores the API key client-side. This is **NOT production-ready**.

**For production**, you should:
1. Move API calls to a backend server
2. Implement user authentication
3. Store API keys server-side only
4. Rate-limit API requests
5. Add proper error handling and monitoring

## 📚 Additional Resources

- [Project Specification](./PROJECT_SPEC.md) - Complete app requirements
- [Anthropic Claude API Docs](https://docs.anthropic.com/claude/reference/getting-started-with-the-api)
- [Tailwind CSS Docs](https://tailwindcss.com/docs)
- [React Docs](https://react.dev)

## 🤝 Contributing

This is currently an MVP in active development. Once Phase 1 is complete, contributions will be welcome!

## 📄 License

MIT License - See LICENSE file for details

## 🎯 Roadmap

### Phase 1 (Current - MVP)
- [x] Onboarding flow
- [x] Claude API integration
- [x] Basic home screen
- [ ] Complete meal card component
- [ ] Meal swap functionality
- [ ] Chat interface
- [ ] Progress tracking
- [ ] Grocery list

### Phase 2 (Post-MVP)
- [ ] Supabase backend
- [ ] User authentication
- [ ] Stripe payments ($29/mo)
- [ ] Recipe photos
- [ ] Enhanced progress tracking

### Phase 3 (Future)
- [ ] Restaurant database integration
- [ ] Barcode scanner
- [ ] Community features
- [ ] Native iOS app

---

**Built with ❤️ using Claude Code**
