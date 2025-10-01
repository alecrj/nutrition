import { useState } from 'react';
import { Plus, TrendingDown, TrendingUp, Minus, Scale } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import BottomNav from './BottomNav';
import { loadProgress, saveProgress, loadUserProfile } from '../utils/storage';

const ProgressTracker = ({ onNavigate }) => {
  const [progress] = useState(() => loadProgress());
  const [userProfile] = useState(() => loadUserProfile());
  const [showAddWeight, setShowAddWeight] = useState(false);
  const [newWeight, setNewWeight] = useState('');
  const [newNotes, setNewNotes] = useState('');

  const handleAddWeight = () => {
    if (!newWeight || isNaN(newWeight)) return;

    const entry = {
      date: new Date().toISOString().split('T')[0],
      weight: parseFloat(newWeight),
      notes: newNotes.trim(),
      timestamp: Date.now()
    };

    saveProgress(entry);
    setNewWeight('');
    setNewNotes('');
    setShowAddWeight(false);

    // Force re-render
    window.location.reload();
  };

  // Calculate stats
  const getStats = () => {
    if (progress.length === 0) {
      return {
        currentWeight: userProfile?.stats?.weight || 0,
        startWeight: userProfile?.stats?.weight || 0,
        change: 0,
        trend: 'neutral'
      };
    }

    const sortedProgress = [...progress].sort((a, b) => a.timestamp - b.timestamp);
    const startWeight = sortedProgress[0].weight;
    const currentWeight = sortedProgress[sortedProgress.length - 1].weight;
    const change = currentWeight - startWeight;

    return {
      currentWeight,
      startWeight,
      change,
      trend: change < 0 ? 'down' : change > 0 ? 'up' : 'neutral'
    };
  };

  const stats = getStats();

  // Prepare chart data
  const chartData = progress.length > 0
    ? [...progress].sort((a, b) => a.timestamp - b.timestamp).map(entry => ({
        date: new Date(entry.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        weight: entry.weight
      }))
    : [];

  return (
    <div className="min-h-screen bg-gray-50 pb-24">
      {/* Header */}
      <div className="bg-gradient-to-r from-secondary to-secondary-600 text-white p-6 safe-top shadow-lg">
        <h1 className="text-2xl font-bold mb-2">Progress Tracker</h1>
        <p className="text-secondary-100 text-sm">Track your journey</p>
      </div>

      {/* Stats Cards */}
      <div className="p-4 space-y-4">
        <div className="grid grid-cols-2 gap-4">
          {/* Current Weight */}
          <div className="card bg-white">
            <div className="flex items-center gap-2 mb-2">
              <Scale className="w-5 h-5 text-primary" />
              <h3 className="text-sm font-semibold text-gray-600">Current</h3>
            </div>
            <div className="text-3xl font-bold text-gray-900">
              {Math.round(stats.currentWeight)}
              <span className="text-lg text-gray-500 ml-1">lbs</span>
            </div>
          </div>

          {/* Total Change */}
          <div className="card bg-white">
            <div className="flex items-center gap-2 mb-2">
              {stats.trend === 'down' ? (
                <TrendingDown className="w-5 h-5 text-secondary" />
              ) : stats.trend === 'up' ? (
                <TrendingUp className="w-5 h-5 text-red-500" />
              ) : (
                <Minus className="w-5 h-5 text-gray-500" />
              )}
              <h3 className="text-sm font-semibold text-gray-600">Change</h3>
            </div>
            <div className={`text-3xl font-bold ${
              stats.trend === 'down' ? 'text-secondary' :
              stats.trend === 'up' ? 'text-red-500' :
              'text-gray-500'
            }`}>
              {stats.change > 0 ? '+' : ''}{Math.round(stats.change * 10) / 10}
              <span className="text-lg ml-1">lbs</span>
            </div>
          </div>
        </div>

        {/* Motivational Message */}
        {stats.change < 0 && (
          <div className="card bg-gradient-to-r from-secondary-50 to-primary-50 border-l-4 border-secondary">
            <p className="text-sm text-gray-700">
              <span className="font-semibold">🎉 Amazing work!</span> You've lost {Math.abs(Math.round(stats.change * 10) / 10)} lbs. Keep it up!
            </p>
          </div>
        )}

        {stats.change === 0 && progress.length > 0 && (
          <div className="card bg-gradient-to-r from-primary-50 to-secondary-50 border-l-4 border-primary">
            <p className="text-sm text-gray-700">
              <span className="font-semibold">💪 Stay consistent!</span> Progress takes time. Trust the process!
            </p>
          </div>
        )}

        {/* Weight Chart */}
        {chartData.length > 0 ? (
          <div className="card bg-white">
            <h3 className="text-lg font-bold text-gray-900 mb-4">Weight Trend</h3>
            <ResponsiveContainer width="100%" height={200}>
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis
                  dataKey="date"
                  tick={{ fontSize: 12 }}
                  stroke="#9ca3af"
                />
                <YAxis
                  tick={{ fontSize: 12 }}
                  stroke="#9ca3af"
                  domain={['dataMin - 5', 'dataMax + 5']}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#fff',
                    border: '1px solid #e5e7eb',
                    borderRadius: '8px'
                  }}
                />
                <Line
                  type="monotone"
                  dataKey="weight"
                  stroke="#10B981"
                  strokeWidth={3}
                  dot={{ fill: '#10B981', r: 4 }}
                  activeDot={{ r: 6 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        ) : (
          <div className="card bg-gradient-to-br from-primary-50 to-secondary-50 text-center py-8">
            <Scale className="w-12 h-12 text-primary mx-auto mb-3" />
            <h3 className="text-lg font-bold text-gray-900 mb-2">Start Tracking</h3>
            <p className="text-sm text-gray-600 mb-4">
              Add your first weigh-in to start seeing your progress!
            </p>
          </div>
        )}

        {/* Progress History */}
        {progress.length > 0 && (
          <div className="card bg-white">
            <h3 className="text-lg font-bold text-gray-900 mb-4">History</h3>
            <div className="space-y-3">
              {[...progress]
                .sort((a, b) => b.timestamp - a.timestamp)
                .slice(0, 10)
                .map((entry, index) => (
                  <div key={index} className="flex items-center justify-between py-2 border-b border-gray-100 last:border-0">
                    <div>
                      <div className="font-semibold text-gray-900">
                        {entry.weight} lbs
                      </div>
                      <div className="text-xs text-gray-500">
                        {new Date(entry.date).toLocaleDateString('en-US', {
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric'
                        })}
                      </div>
                      {entry.notes && (
                        <div className="text-sm text-gray-600 mt-1 italic">
                          "{entry.notes}"
                        </div>
                      )}
                    </div>
                    {index < progress.length - 1 && (
                      <div className={`text-sm font-semibold ${
                        entry.weight < progress[progress.length - index - 2]?.weight
                          ? 'text-secondary'
                          : entry.weight > progress[progress.length - index - 2]?.weight
                          ? 'text-red-500'
                          : 'text-gray-500'
                      }`}>
                        {entry.weight < progress[progress.length - index - 2]?.weight ? '↓' :
                         entry.weight > progress[progress.length - index - 2]?.weight ? '↑' : '→'}
                      </div>
                    )}
                  </div>
                ))}
            </div>
          </div>
        )}

        {/* Add Weight Button */}
        {!showAddWeight && (
          <button
            onClick={() => setShowAddWeight(true)}
            className="w-full btn-primary flex items-center justify-center gap-2"
          >
            <Plus className="w-5 h-5" />
            Log Weight
          </button>
        )}

        {/* Add Weight Form */}
        {showAddWeight && (
          <div className="card bg-white border-2 border-primary">
            <h3 className="text-lg font-bold text-gray-900 mb-4">Log Today's Weight</h3>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Weight (lbs)
                </label>
                <input
                  type="number"
                  step="0.1"
                  value={newWeight}
                  onChange={(e) => setNewWeight(e.target.value)}
                  placeholder="150.5"
                  className="input"
                  autoFocus
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Notes (optional)
                </label>
                <input
                  type="text"
                  value={newNotes}
                  onChange={(e) => setNewNotes(e.target.value)}
                  placeholder="Feeling great!"
                  className="input"
                />
              </div>

              <div className="flex gap-2">
                <button
                  onClick={handleAddWeight}
                  disabled={!newWeight}
                  className={`flex-1 py-3 font-semibold rounded-lg transition-all ${
                    newWeight
                      ? 'bg-primary text-white hover:bg-primary-600 active:scale-95'
                      : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  }`}
                >
                  Save
                </button>
                <button
                  onClick={() => {
                    setShowAddWeight(false);
                    setNewWeight('');
                    setNewNotes('');
                  }}
                  className="flex-1 py-3 border-2 border-gray-300 text-gray-700 font-semibold rounded-lg hover:bg-gray-50 transition-all active:scale-95"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      <BottomNav currentScreen="progress" onNavigate={onNavigate} />
    </div>
  );
};

export default ProgressTracker;
