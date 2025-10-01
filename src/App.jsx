import { useState, useEffect } from 'react';
import Onboarding from './components/Onboarding';
import HomeScreen from './components/HomeScreen';
import { hasCompletedOnboarding } from './utils/storage';

function App() {
  const [isOnboarded, setIsOnboarded] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check if user has completed onboarding
    const checkOnboarding = () => {
      const completed = hasCompletedOnboarding();
      setIsOnboarded(completed);
      setIsLoading(false);
    };

    checkOnboarding();
  }, []);

  const handleOnboardingComplete = () => {
    setIsOnboarded(true);
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-primary-50 to-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 bg-primary rounded-3xl flex items-center justify-center mx-auto mb-4 animate-pulse">
            <span className="text-3xl">🥗</span>
          </div>
          <h1 className="text-2xl font-bold text-gray-900">AI Meal Coach</h1>
        </div>
      </div>
    );
  }

  // Route to appropriate screen
  return (
    <>
      {!isOnboarded ? (
        <Onboarding onComplete={handleOnboardingComplete} />
      ) : (
        <HomeScreen />
      )}
    </>
  );
}

export default App;
