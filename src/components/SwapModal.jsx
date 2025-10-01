import { useState } from 'react';
import { X, Loader2, RefreshCw, ArrowRight } from 'lucide-react';
import { generateMealSwap } from '../utils/claudeAPI';

const SwapModal = ({ meal, mealType, userProfile, onClose, onSwapComplete }) => {
  const [mode, setMode] = useState('quick'); // 'quick' or 'custom'
  const [customRequest, setCustomRequest] = useState('');
  const [swapOptions, setSwapOptions] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [selectedOption, setSelectedOption] = useState(null);

  const handleGenerateQuickSwaps = async () => {
    setIsLoading(true);
    setError('');

    try {
      const options = await generateMealSwap(meal, userProfile, 'quick');
      setSwapOptions(options);
    } catch (err) {
      setError(err.message || 'Failed to generate swaps. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleGenerateCustomSwap = async () => {
    if (!customRequest.trim()) {
      setError('Please describe what you want');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      const options = await generateMealSwap(meal, userProfile, 'custom', customRequest);
      setSwapOptions(options);
      setMode('quick'); // Show results in quick mode layout
    } catch (err) {
      setError(err.message || 'Failed to generate swap. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSelectSwap = (option) => {
    setSelectedOption(option);
  };

  const handleConfirmSwap = () => {
    if (selectedOption) {
      onSwapComplete(selectedOption);
    }
  };

  // Auto-generate quick swaps on mount
  useState(() => {
    if (swapOptions.length === 0 && !isLoading) {
      handleGenerateQuickSwaps();
    }
  }, []);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-end sm:items-center justify-center">
      {/* Modal */}
      <div className="bg-white rounded-t-3xl sm:rounded-3xl w-full sm:max-w-lg max-h-[90vh] overflow-hidden flex flex-col animate-slideUp">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div>
            <h2 className="text-xl font-bold text-gray-900">Swap Meal</h2>
            <p className="text-sm text-gray-600 capitalize">
              {mealType}: {meal.name}
            </p>
          </div>
          <button
            onClick={onClose}
            className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-gray-100 transition-colors"
          >
            <X className="w-6 h-6 text-gray-500" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {/* Mode Toggle */}
          <div className="flex gap-2 mb-6">
            <button
              onClick={() => setMode('quick')}
              className={`flex-1 py-2 px-4 rounded-lg font-semibold transition-all ${
                mode === 'quick'
                  ? 'bg-primary text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              Quick Swaps
            </button>
            <button
              onClick={() => setMode('custom')}
              className={`flex-1 py-2 px-4 rounded-lg font-semibold transition-all ${
                mode === 'custom'
                  ? 'bg-primary text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              Custom Request
            </button>
          </div>

          {/* Error Message */}
          {error && (
            <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-sm text-red-800">{error}</p>
            </div>
          )}

          {/* Quick Swaps Mode */}
          {mode === 'quick' && (
            <div className="space-y-3">
              {isLoading ? (
                <div className="flex flex-col items-center justify-center py-12">
                  <Loader2 className="w-12 h-12 text-primary animate-spin mb-4" />
                  <p className="text-gray-600">Generating swaps...</p>
                </div>
              ) : swapOptions.length > 0 ? (
                <>
                  <p className="text-sm text-gray-600 mb-4">
                    Select a meal with similar macros:
                  </p>
                  {swapOptions.map((option, index) => (
                    <button
                      key={index}
                      onClick={() => handleSelectSwap(option)}
                      className={`w-full text-left p-4 rounded-xl border-2 transition-all ${
                        selectedOption === option
                          ? 'border-primary bg-primary-50 shadow-md'
                          : 'border-gray-200 hover:border-gray-300 bg-white'
                      }`}
                    >
                      <div className="flex justify-between items-start mb-2">
                        <h3 className="font-semibold text-gray-900">{option.name}</h3>
                        {selectedOption === option && (
                          <div className="w-6 h-6 rounded-full bg-primary flex items-center justify-center flex-shrink-0">
                            <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                            </svg>
                          </div>
                        )}
                      </div>
                      <div className="flex gap-3 text-sm text-gray-600">
                        <span>P: {option.macros.protein}g</span>
                        <span>C: {option.macros.carbs}g</span>
                        <span>F: {option.macros.fats}g</span>
                        <span className="font-semibold">{option.macros.calories} cal</span>
                      </div>
                      {option.prepTime && (
                        <div className="text-xs text-gray-500 mt-1">
                          Prep time: {option.prepTime}
                        </div>
                      )}
                    </button>
                  ))}

                  <button
                    onClick={handleGenerateQuickSwaps}
                    className="w-full flex items-center justify-center gap-2 py-3 border-2 border-gray-300 text-gray-700 font-semibold rounded-lg hover:bg-gray-50 transition-all mt-4"
                  >
                    <RefreshCw className="w-4 h-4" />
                    Generate More Options
                  </button>
                </>
              ) : (
                <div className="text-center py-12">
                  <p className="text-gray-600 mb-4">No swaps available yet</p>
                  <button
                    onClick={handleGenerateQuickSwaps}
                    className="btn-primary"
                  >
                    Generate Swaps
                  </button>
                </div>
              )}
            </div>
          )}

          {/* Custom Request Mode */}
          {mode === 'custom' && (
            <div>
              <p className="text-sm text-gray-600 mb-4">
                Tell me what you want instead:
              </p>

              <textarea
                value={customRequest}
                onChange={(e) => setCustomRequest(e.target.value)}
                placeholder="Example: I want pasta, something with shrimp, a vegetarian option..."
                className="w-full px-4 py-3 border border-gray-300 rounded-lg text-base resize-none focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                rows={4}
              />

              <button
                onClick={handleGenerateCustomSwap}
                disabled={isLoading || !customRequest.trim()}
                className={`w-full mt-4 flex items-center justify-center gap-2 py-3 font-semibold rounded-lg transition-all ${
                  isLoading || !customRequest.trim()
                    ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                    : 'bg-primary text-white hover:bg-primary-600 active:scale-95'
                }`}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Generating...
                  </>
                ) : (
                  <>
                    Generate Custom Swap
                    <ArrowRight className="w-5 h-5" />
                  </>
                )}
              </button>

              <div className="mt-6 p-4 bg-gray-50 rounded-lg">
                <p className="text-sm text-gray-600">
                  <span className="font-semibold">💡 Tip:</span> Be specific! The AI will try to match
                  your macros while respecting your dietary restrictions.
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Footer - Confirm Button */}
        {selectedOption && (
          <div className="p-6 border-t border-gray-200 bg-gray-50">
            <button
              onClick={handleConfirmSwap}
              className="w-full btn-primary"
            >
              Confirm Swap
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default SwapModal;
